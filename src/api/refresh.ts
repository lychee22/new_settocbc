/**
 * 业务数据轮询定时器工厂（新项目对旧 jQuery 客户端 `setInterval(loadXxx, ...)` 模式的等价物）。
 *
 * ## 背景
 *
 * 旧 JSP 客户端在 `app.js` 启动时为下列 8 个数据视图各起了一个 `setInterval`，
 * 间隔由 `config.*RefreshInterval` / `config.*AlertInterval` 控制：
 *
 *   - loadAlert / loadCoreRateAlert / loadNTSpreadAlert / loadCallCutAlert
 *   - pendingDeal / rateBookPos / fwdPos / csAcc
 *
 * 间隔范围 30~60 秒。新项目 React 端尚未启用这些视图，本文件提供**占位 API**：
 *
 *   - `usePolling(key, fetcher, options)`  —— 通用 React Hook（推荐）
 *   - `startPolling(key, fetcher, options)`  —— 命令式 API（非组件内）
 *   - `stopPolling(key)`                       —— 停止指定轮询
 *   - `stopAllPolling()`                       —— 停止所有轮询（用于 logout）
 *
 * 后续业务模块接入时，按下面模式即可启用自动刷新：
 *
 * ```tsx
 * // 在业务页面组件内
 * const { data, loading, refresh } = usePolling(
 *   'pendingDeal',
 *   async () => sendRequest('xxGridMsg_GetPendingDeals', {}, 'G'),
 *   { intervalMs: REFRESH_INTERVAL.pendingDeal }
 * );
 * ```
 *
 * 字段映射见 `knowledge-base/_shared/02_RuntimeConfig.md`。
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import type { RefreshIntervalKey } from './config';
import { REFRESH_INTERVAL } from './config';

// ---------------------------------------------------------------------------
//  内部：轮询任务注册表
// ---------------------------------------------------------------------------

interface PollingTask {
  intervalMs: number;
  fetcher: () => Promise<unknown>;
  timerId: ReturnType<typeof setInterval>;
}

const tasks = new Map<string, PollingTask>();

function startPollingInternal(
  key: string,
  fetcher: () => Promise<unknown>,
  intervalMs: number
): void {
  // 已有同 key 的任务则先停
  stopPolling(key);

  // 立即执行一次
  fetcher().catch((err) => {
    // eslint-disable-next-line no-console
    console.error(`[refresh] ${key} initial fetch failed:`, err);
  });

  const timerId = setInterval(() => {
    fetcher().catch((err) => {
      // eslint-disable-next-line no-console
      console.error(`[refresh] ${key} interval fetch failed:`, err);
    });
  }, intervalMs);

  tasks.set(key, { intervalMs, fetcher, timerId });
}

function stopPolling(key: string): void {
  const t = tasks.get(key);
  if (t) {
    clearInterval(t.timerId);
    tasks.delete(key);
  }
}

function stopAllPolling(): void {
  for (const key of Array.from(tasks.keys())) {
    stopPolling(key);
  }
}

// ---------------------------------------------------------------------------
//  命令式 API（非 React 组件内使用）
// ---------------------------------------------------------------------------

export interface PollingOptions {
  /** 轮询间隔（ms）。可用 {@link REFRESH_INTERVAL} 中常量。 */
  intervalMs: number;
  /** 是否立即执行一次（默认 true） */
  immediate?: boolean;
}

/**
 * 命令式启动轮询。
 *
 * 注意：本函数立即执行一次（除非 `immediate=false`），
 * 然后每隔 `intervalMs` 调用 `fetcher`。
 *
 * @example
 * startPolling('csAcc', loadCsAccounts, REFRESH_INTERVAL.csAcc);
 * // ... 用完时
 * stopPolling('csAcc');
 */
export function startPolling(
  key: string,
  fetcher: () => Promise<unknown>,
  options: PollingOptions
): void {
  startPollingInternal(key, fetcher, options.intervalMs);
}

export { stopPolling, stopAllPolling };

// ---------------------------------------------------------------------------
//  React Hook
// ---------------------------------------------------------------------------

export interface UsePollingResult<T> {
  data: T | undefined;
  loading: boolean;
  error: Error | undefined;
  /** 手动触发一次刷新 */
  refresh: () => Promise<void>;
}

export interface UsePollingHookOptions extends PollingOptions {
  /** 是否启用（默认 true）。传 false 可暂停轮询而不卸载组件。 */
  enabled?: boolean;
}

/**
 * 在 React 组件内启用自动轮询。
 *
 * 组件卸载时自动停止轮询。
 *
 * @example
 * const { data, loading, refresh } = usePolling(
 *   'pendingDeal',
 *   async () => {
 *     const r = await sendRequest('xxGridMsg_GetPendingDeals', {}, 'G');
 *     return r.kind === 'success' ? r.data : null;
 *   },
 *   { intervalMs: REFRESH_INTERVAL.pendingDeal }
 * );
 */
export function usePolling<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: UsePollingHookOptions
): UsePollingResult<T> {
  const { intervalMs, enabled = true } = options;
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  // 用 ref 持有最新 fetcher，避免闭包陷阱
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const run = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetcherRef.current();
      setData(result);
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // 立即执行一次
    void run();

    // 注册定时器
    const timerId = setInterval(() => {
      void run();
    }, intervalMs);

    return () => clearInterval(timerId);
  }, [key, intervalMs, enabled, run]);

  return { data, loading, error, refresh: run };
}

// ---------------------------------------------------------------------------
//  预定义 key（与 REFRESH_INTERVAL 一一对应）
// ---------------------------------------------------------------------------

/**
 * 标准轮询 key 集合。业务模块用此 key 启动轮询，logout 时一键全停。
 *
 * 注意：本枚举仅作为约定字符串字面量，实际键名由调用方决定。
 */
export const POLLING_KEYS = {
  loadAlert: 'loadAlert',
  loadCoreRateAlert: 'loadCoreRateAlert',
  loadNTSpreadAlert: 'loadNTSpreadAlert',
  loadCallCutAlert: 'loadCallCutAlert',
  pendingDeal: 'pendingDeal',
  rateBookPos: 'rateBookPos',
  fwdPos: 'fwdPos',
  csAcc: 'csAcc',
} as const satisfies Record<RefreshIntervalKey, string>;

export type PollingKey = (typeof POLLING_KEYS)[RefreshIntervalKey];

/**
 * 按 REFRESH_INTERVAL 中所有键启动轮询。
 *
 * 业务模块在挂载时调用一次，组件卸载时调用 `stopAllPolling()`。
 * 注意：本函数是命令式的，多个组件不要重复启动同一 key。
 */
export function startAllStandardPolling(
  fetchers: Partial<Record<PollingKey, () => Promise<unknown>>>
): void {
  for (const key of Object.keys(fetchers) as PollingKey[]) {
    const fetcher = fetchers[key];
    if (!fetcher) continue;
    const intervalMs = REFRESH_INTERVAL[key];
    startPollingInternal(key, fetcher, intervalMs);
  }
}