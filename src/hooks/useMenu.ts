import { useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useMenuStore } from '../stores/menuStore';
import { menu as menuApi } from '../api/modules/menu';

/**
 * 动态菜单加载 hook。
 *
 ** 触发条件：已登录 + 尚未加载（!loaded）+ 不在加载中（!loading）。
 *
 ** 防重入：用 inFlightRef 标记"是否正在请求中"，避免：
 *  - React StrictMode 开发模式 mount→unmount→mount 触发两次 effect
 *  - 异步请求未完成时第二次 effect 重复发请求
 *
 ** 失败后允许重试（finally 中清空 inFlight）；成功后 store.loaded=true，
 *  下次渲染 !loaded 为 false → 直接早返回。
 *
 ** 与 LoginPage 的关系：LoginPage 在登录成功后已主动调用 menuApi.getUserMenu()
 *  并 setMenu(items)，所以 BasicLayout 挂载时 store.loaded 通常已是 true，
 *  此 hook 走早返回分支不再拉取；即便 LoginPage 调用失败，BasicLayout 也会兜底重试。
 */
export function useMenu() {
  const { isAuthenticated } = useAuthStore();
  const { tree, loaded, loading, error, setMenu, setError } = useMenuStore();
  const inFlightRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || loaded || loading) return;
    if (inFlightRef.current) return; // 已经在请求中，跳过

    inFlightRef.current = true;

    menuApi
      .getUserMenu()
      .then((items) => {
        setMenu(items);
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : String(err);
        // eslint-disable-next-line no-console
        console.error('[useMenu] 加载菜单失败:', msg);
        setError(msg);
      })
      .finally(() => {
        inFlightRef.current = false;
      });
    // 不依赖 setMenu/setError（zustand action 引用稳定）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, loaded, loading]);

  return { tree, loaded, loading, error };
}

export default useMenu;
