/**
 * Mock 层汇总入口。
 *
 * 通过 Vite 环境变量 VITE_USE_MOCK=true 开启（见 .env.mock / npm run dev:mock）。
 * 仅在 src/api/request.ts 中被引用，业务代码无感。
 */

export { resolveMock } from './registry';
export { mockLogin } from './handlers/auth';
export type { MockHandler, MockLoginHandler, MockRequest, MockLoginResult } from './types';

/**
 * Mock 是否启用。
 */
export const MOCK_ENABLED: boolean = import.meta.env.VITE_USE_MOCK === 'true';

/**
 * Mock 延迟（毫秒），模拟网络/后端处理耗时。默认 0。
 * 通过 VITE_MOCK_LATENCY 配置。
 */
export const MOCK_LATENCY: number = Number(import.meta.env.VITE_MOCK_LATENCY) || 0;

/**
 * 启动时打印 mock 状态，便于确认是否生效。
 */
if (MOCK_ENABLED) {
  // eslint-disable-next-line no-console
  console.info(
    `%c[Mock] 已启用 mock 层（延迟 ${MOCK_LATENCY}ms）。未注册的消息将抛错以便发现。`,
    'color:#fa8c16;font-weight:bold'
  );
}

/**
 * 按 mock 延迟等待。
 */
export function mockDelay(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}
