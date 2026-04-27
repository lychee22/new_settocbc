import type { NetMessage, SystemInfo } from '../types';
import { useAuthStore } from '../stores/authStore';

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
    v: '1.2.20260409.2059',
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
    credentials: 'include',
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
    // 显示后端返回的原始错误信息
    const errorMsg = result.e || `Request failed with status ${result.sts}`;
    throw new Error(errorMsg);
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
    language?: number;
    env?: string;
  }
): Promise<T> {
  const enrichedMessage = {
    ...message,
    euid: session.loginID,
    uid: session.loginID,
    snk: session.sessionKey,
    scid: session.securityID || '',
    euc: 1,
    uc: 1,
    acc: '?',
    ch: null,
    l: session.language ?? 0,
    env: session.env || '',
    extuid: null,
    t: '?',
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
): Promise<{ ok: boolean; sessionKey?: string; error?: string }> {
  // 使用与旧系统相同的密码加密算法
  const encodedPassword = securityEncode(password);

  const params = new URLSearchParams({
    sfUserLoginID: loginID,
    sfUserPassword: encodedPassword,
    sfUserLanguage: language.toString(),
  });

  const response = await fetch('/BOAppLoginServlet', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
    credentials: 'include',
  });

  console.log('-----response:', response)
  if (!response.ok) {
    return { ok: false, error: `HTTP error ${response.status}` };
  }

  const responseText = await response.text();

  // 尝试从响应 HTML 中提取 sessionKey
  // 旧系统通过 JSP 嵌入 sessionKey 到 JavaScript
  let sessionKey = '';
  try {
    // 尝试匹配 var cache._sessionKey = "xxx" 或类似模式
    const match = responseText.match(/cache\._sessionKey\s*=\s*["']([^"']+)["']/);
    if (match) {
      sessionKey = match[1];
    }
  } catch {
    // ignore
  }

  return { ok: true, sessionKey };
}

/**
 * 获取系统信息 (sysParamSetupGridMsg_GetSysDate)
 */
export async function getSystemInfo(): Promise<SystemInfo> {
  const session = useAuthStore.getState().session;

  const result = await sendAuthRequest<NetMessage>(
    { n: 'sysParamSetupGridMsg_GetSysDate' },
    {
      loginID: session?.loginID || '',
      sessionKey: session?.sessionKey || '',
      securityID: session?.securityID,
      language: session?.language,
      env: session?.env,
    }
  );

  if (result.hvb && result.hvb.length > 0) {
    const data = result.hvb[0] as unknown as SystemInfo;
    return data;
  }

  throw new Error('Failed to get system info');
}

/**
 * 登出请求 (loginSessionGridMsg_Logout)
 */
export async function logout(): Promise<void> {
  const session = useAuthStore.getState().session;

  await sendAuthRequest(
    { n: 'loginSessionGridMsg_Logout' },
    {
      loginID: session?.loginID || '',
      sessionKey: session?.sessionKey || '',
      securityID: session?.securityID,
      language: session?.language,
      env: session?.env,
    }
  );
}

export default {
  sendRequest,
  sendAuthRequest,
  login,
  getSystemInfo,
  logout,
};
