import type { NetMessage } from '../types';

// Base64 编码
const base64Encode = (str: string): string => {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  return btoa(String.fromCharCode(...new Uint8Array(data)));
};

// 安全编码 - 与旧系统 securityUtil.encode 一致
const securityEncode = (oriStr: string): string => {
  let index = 0;
  let encodedStr = '';

  const trimmedStr = oriStr.trim();
  while (index < trimmedStr.length) {
    const oriChar = trimmedStr.charAt(index);
    let ascii: number;

    if ((index + 1) % 2 === 1) {
      ascii = oriChar.charCodeAt(0) + (index + 1);
    } else {
      ascii = oriChar.charCodeAt(0) + 2 * (index + 1);
    }

    const quotient = Math.floor((ascii - 32) / 95);
    ascii = (ascii - 32) % 95 + 32;

    const encodedChar = String.fromCharCode(ascii);
    encodedStr = encodedStr + encodedChar + '' + quotient;
    index = index + 1;
  }

  const result = encodedStr.split('').reverse().join('');
  return base64Encode(result);
};

// 基础请求 URL
const PULL_URL = '/BOAppPullServlet';

/**
 * 发送请求到后端
 * @param message 消息对象
 * @param options 选项
 */
export async function sendRequest<T = unknown>(
  message: NetMessage,
  options?: {
    base64Encode?: boolean;
    signal?: AbortSignal;
  }
): Promise<T> {
  const useBase64 = options?.base64Encode ?? true;

  // 添加元数据
  const data = {
    ...message,
    sts: 0,
    sq: 0,
    scsts: 0,
    v: '1.0.0',
    bm: 0,
  };

  // 序列化消息
  let payload = JSON.stringify(data);
  if (useBase64) {
    payload = base64Encode(payload);
  }

  const response = await fetch(PULL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `sfNetMessage=${encodeURIComponent(payload)}`,
    signal: options?.signal,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const responseText = await response.text();

  // 解码响应
  let decoded = responseText;
  if (useBase64) {
    decoded = atob(decoded);
  }

  const result = JSON.parse(decoded) as NetMessage;

  if (result.sts !== 0) {
    throw new Error(result.e || 'Request failed');
  }

  return result as T;
}

/**
 * 发送带会话的请求（自动携带 session 相关参数）
 */
export async function sendAuthRequest<T = unknown>(
  message: NetMessage,
  session: {
    loginID: string;
    sessionKey: string;
    securityID?: string;
  }
): Promise<T> {
  const enrichedMessage = {
    ...message,
    euid: session.loginID,
    uid: session.loginID,
    snk: session.sessionKey,
    scid: session.securityID || '',
  };

  return sendRequest<T>(enrichedMessage as NetMessage);
}

/**
 * 登录请求
 */
export async function login(
  loginID: string,
  password: string,
  language: number = 0
): Promise<Response> {
  // 使用与旧系统相同的密码加密算法
  const encodedPassword = securityEncode(password);

  const params = new URLSearchParams({
    sfUserLoginID: loginID,
    sfUserPassword: encodedPassword,
    sfUserLanguage: language.toString(),
  });

  return fetch('/BOAppLoginServlet', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
    credentials: 'include',
  });
}

export default {
  sendRequest,
  sendAuthRequest,
  login,
};
