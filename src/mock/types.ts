import type { NetMessage } from '../types';

/**
 * Mock handler 收到的请求消息对象（已解码的 NetMessage 请求）。
 * 至少包含 `n`（消息名），可能含 `hvb` / `mhvb` / 会话字段。
 */
export type MockRequest = Record<string, any>;

/**
 * 普通 NetMessage 的 mock handler。
 * 收到解码后的请求，返回响应消息（未经 Base64 编码）。
 *
 * 返回值约定（与真实后端一致）：
 *   - sts === 0  : 成功，数据放在 hvb / mhvb
 *   - sts === 1  : 需 Override 审批，返回 ovrinfo / ovrrule
 *   - sts === -1 : 失败，错误信息放在 e 字段
 */
export type MockHandler = (req: MockRequest) => NetMessage;

/**
 * 登录请求的 mock 结果（登录走独立的 BOAppLoginServlet，不是 NetMessage 协议）。
 */
export interface MockLoginResult {
  ok: boolean;
  sessionKey?: string;
  /** BO 全版本号（mock 用固定值，真实环境由 GetSessionKeyServlet 返回） */
  version?: string;
  error?: string;
}

/**
 * 登录 mock handler。
 */
export type MockLoginHandler = (
  loginID: string,
  password: string,
  language: number
) => MockLoginResult;
