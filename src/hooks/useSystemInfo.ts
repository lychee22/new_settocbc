import { useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/authStore';
import { getSystemInfo as getSystemInfoApi } from '../api/request';

/**
 * 系统信息加载 hook。
 *
 * 触发条件：已登录 + 已有 session + 尚未加载 systemInfo。
 *
 * **防重入**：用 inFlightRef 标记"是否正在请求中"，避免：
 * - React StrictMode 开发模式 mount→unmount→mount 触发两次 effect
 * - 异步请求未完成时第二次 effect 重复发请求
 *
 * 失败后允许重试（finally 中清空 inFlight）；成功加载后 systemInfo 非空，
 * 下次渲染 !systemInfo 为 false → 直接早返回。
 */
export function useSystemInfo() {
  const { session, systemInfo, setSystemInfo, isAuthenticated } = useAuthStore();
  const inFlightRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !session || systemInfo) return;
    if (inFlightRef.current) return; // 已经在请求中，直接跳过

    inFlightRef.current = true;

    getSystemInfoApi()
      .then((info) => {
        setSystemInfo(info);
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Failed to load system info:', error);
      })
      .finally(() => {
        inFlightRef.current = false;
      });
    // 只依赖真正会变化的字段；不依赖 setSystemInfo（zustand action 引用稳定）
  }, [isAuthenticated, session, systemInfo]);

  return systemInfo;
}

export default useSystemInfo;
