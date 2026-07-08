import type { MockLoginHandler } from '../types';

/**
 * Mock 登录。
 *
 * 真实登录走 BOAppLoginServlet（表单 + HTML 响应），与 NetMessage 协议不同，
 * 因此单独定义，不走消息名路由表。
 *
 * 自测策略：任意非空账号密码都登录成功，生成一个固定的 mock sessionKey；
 * 空用户名/空密码则失败，便于自测错误提示分支。
 */
export const mockLogin: MockLoginHandler = (loginID, password, _language) => {
  if (!loginID || !loginID.trim()) {
    return { ok: false, error: 'Login ID is required' };
  }
  if (!password) {
    return { ok: false, error: 'Password is required' };
  }

  // 生成稳定的 sessionKey，前端 authStore 仅用于后续请求回传，无真实校验
  const sessionKey = `mock-sk-${Date.now()}`;
  // mock 固定版本号（真实环境由 GetSessionKeyServlet 返回，后端 validateBOVersion 校验）
  return { ok: true, sessionKey, version: '1.2.20260409.2059' };
};
