import type { NetMessage, SystemInfo, UserSession } from '../types';
import type { ApiResult, NetMsgMeta } from '../types/netmessage';
import {
  STS_ERROR,
  STS_OVERRIDE,
  STS_SUCCESS,
} from '../types/netmessage';
import { useAuthStore } from '../stores/authStore';
import { MOCK_ENABLED, mockDelay, resolveMock } from '../mock';
import { mockLogin } from '../mock/handlers/auth';

/* ===========================================================================
 *  请求层 —— 与旧系统后端逐字对齐
 *
 *  数据源（已逐字核实旧系统源码）：
 *    - src/jsp/client/bojs/conn.js  (sendRequest: AJAX + base64 编码)
 *    - src/jsp/client/bojs/app.js   (addMetaData: 18 个 metadata 字段)
 *    - src/jsp/client/bojs/cache.js (默认值: _compID=1, _accID='?', ...)
 *    - src/jsp/client/bojs/config.js(pullURL, ajaxTimeout=300000)
 *    - src/jsp/client/bojs/login.js (整页 form POST 登录)
 *    - src/jsp/client/bojs/utils.js (securityUtil.encode 密码加密)
 *
 *  关键约定（不得擅自更改，否则与后端不兼容）：
 *    1) URL: POST {PULL_URL}, body = `sfNetMessage=<encodeURIComponent(base64(JSON))>`
 *    2) 响应 body 是 base64 字符串 → atob → JSON.parse
 *    3) metadata 18 字段顺序固定（NetMsgMeta）
 *    4) v 字段必须是后端真实全版本号（validateBOVersion 严格校验）
 * ======================================================================== */

/** 请求超时（ms），与旧系统 config.ajaxTimeout 一致。 */
const AJAX_TIMEOUT = 300000;

/**
 * 业务请求 URL（BOAppPullServlet）。
 * 部署上下文 /settocbcBoServer，可通过 VITE_PULL_URL 环境变量覆盖。
 *
 * 注意：servlet 名为 BOAppPullServlet（带 App 前缀），来自 web.xml:47。
 * 旧 config.js 里的 BOPullServlet 是被部署替换的占位值，非真实路由。
 */
const PULL_URL =
  import.meta.env.VITE_PULL_URL ?? '/settocbcBoServer/BOAppPullServlet';

/** 登录 servlet URL（App 通道）。 */
const LOGIN_URL =
  import.meta.env.VITE_LOGIN_URL ?? '/settocbcBoServer/BOAppLoginServlet';

/**
 * GetSessionKeyServlet URL。
 * 后端部署前置项（见 knowledge-base/_shared/01_SessionAuth.md）：
 * React AJAX 登录后由此接口取 sessionKey/env/version。
 */
const GET_SESSION_KEY_URL =
  import.meta.env.VITE_GET_SESSION_KEY_URL ??
  '/settocbcBoServer/GetSessionKeyServlet';

// ---------------------------------------------------------------------------
//  Base64 / 安全编码（与旧系统 utils.js、base64.js 逐字一致）
// ---------------------------------------------------------------------------

const base64Encode = (str: string): string => {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  return btoa(String.fromCharCode(...new Uint8Array(data)));
};

/**
 * 安全编码 —— 与旧系统 securityUtil.encode 一致
 * (src/jsp/client/bojs/utils.js:1394-1431)。
 * 算法：逐字符 ASCII 运算(奇偶分支) → 取模95+32 → 拼 quotient → reverse → base64。
 */
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

// ---------------------------------------------------------------------------
//  Session 取值工具
// ---------------------------------------------------------------------------

/**
 * 从 authStore 取当前会话，供 sendAuthRequest 注入 metadata。
 * 旧系统这些值来自 cache.* （JSP 嵌入），React 侧来自 authStore.session。
 */
function getSession(): UserSession {
  const session = useAuthStore.getState().session;
  if (!session) {
    throw new Error('Session not found: please login first.');
  }
  return session;
}

/**
 * 构造完整的 18 字段 metadata（对齐旧 app.addMetaData）。
 * @param message 业务消息体（含 n / hvb / mhvb）
 * @param session 当前会话
 */
function buildNetMsg<T extends NetMessage>(
  message: T,
  session: UserSession
): T & NetMsgMeta {
  return {
    ...message,
    // ---- 旧 app.addMetaData 顺序（app.js:4-23）----
    euid: session.loginID,
    euc: 1,
    uid: session.loginID,
    acc: '?',
    uc: 1,
    sts: STS_SUCCESS,
    snk: session.sessionKey,
    sq: 0,
    scid: '?',
    scsts: STS_SUCCESS,
    v: session.version,
    bm: 0,
    l: session.language ?? 0,
    e: null,
    ch: null,
    extuid: null,
    t: '?',
    env: session.env ?? '',
  };
}

// ---------------------------------------------------------------------------
//  核心请求函数
// ---------------------------------------------------------------------------

/**
 * 发送请求到后端（对应旧 conn.sendRequest）。
 *
 * @param message 已注入 metadata 的消息对象
 * @param options base64Encode(默认 true) / signal
 * @returns 解码后的响应 NetMessage
 *
 * @throws Error 当 HTTP 非 2xx，或响应 sts === -1
 */
export async function sendRequest<T = unknown>(
  message: NetMessage,
  options?: {
    base64Encode?: boolean;
    signal?: AbortSignal;
  }
): Promise<T> {
  const useBase64 = options?.base64Encode ?? true;

  // ---- Mock 拦截（开发期无后端时启用）----
  if (MOCK_ENABLED) {
    await mockDelay(Number(import.meta.env.VITE_MOCK_LATENCY) || 0);
    const mocked = resolveMock(message as unknown as Record<string, any>);
    if (mocked) {
      return mocked as unknown as T;
    }
    // 未注册的消息直接抛错，便于尽早发现遗漏
    throw new Error(`[Mock] 未注册的消息: ${message.n}`);
  }

  // ---- 序列化：JSON → base64 → URL-encode（对齐旧 conn.js:42-48）----
  let payload = JSON.stringify(message);
  if (useBase64) {
    payload = base64Encode(payload);
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), AJAX_TIMEOUT);
  // 外部 signal 与超时 signal 合并：任一触发即中止
  const signal = options?.signal
    ? mergeSignals(options.signal, controller.signal)
    : controller.signal;

  let response: Response;
  try {
    response = await fetch(PULL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `sfNetMessage=${encodeURIComponent(payload)}`,
      credentials: 'include',
      signal,
    });
  } finally {
    window.clearTimeout(timeoutId);
  }

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const responseText = await response.text();

  // ---- 解码：base64 → JSON（对齐旧 conn.js:80-94）----
  let decoded = responseText;
  if (useBase64) {
    decoded = atob(decoded);
  }

  const result = JSON.parse(decoded) as NetMessage;

  if (result.sts === STS_ERROR) {
    // 保留后端原始错误信息，不翻译（遵循既有原则）
    const errorMsg = result.e || `Request failed with status ${result.sts}`;
    throw new Error(errorMsg);
  }

  return result as T;
}

/** 合并两个 AbortSignal：任一 abort 则合并信号 abort。 */
function mergeSignals(a: AbortSignal, b: AbortSignal): AbortSignal {
  if (a.aborted) return a;
  if (b.aborted) return b;
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  a.addEventListener('abort', onAbort, { once: true });
  b.addEventListener('abort', onAbort, { once: true });
  return controller.signal;
}

/**
 * 发送带会话的请求（自动注入 18 字段 metadata）。
 *
 * @param message 业务消息体（n / hvb / mhvb）
 * @param session 可选，默认取 authStore 当前会话
 * @returns 响应 NetMessage（成功 sts===0，Override sts===1）
 *
 * @throws Error 当会话不存在，或响应 sts === -1
 */
export async function sendAuthRequest<T = unknown>(
  message: NetMessage,
  session?: UserSession
): Promise<T> {
  const sess = session ?? getSession();
  const enriched = buildNetMsg(message, sess);
  return sendRequest<T>(enriched as NetMessage);
}

/**
 * 发送带会话的请求，并返回结构化 ApiResult。
 * 业务层可用 `result.kind` 区分 success / override / error，
 * 无需自行判断 sts。
 */
export async function sendAuthRequestResult<T = unknown>(
  message: NetMessage,
  session?: UserSession
): Promise<ApiResult<T>> {
  try {
    const resp = (await sendAuthRequest<NetMessage>(message, session)) as NetMessage & {
      ovrinfo?: { override: boolean; overridemsg: string };
      ovrrule?: string;
    };

    if (resp.sts === STS_OVERRIDE) {
      return {
        kind: 'override',
        overrideInfo: resp.ovrinfo ?? { override: true, overridemsg: '' },
        overrideRule: resp.ovrrule ?? '',
        data: resp as unknown as T,
      };
    }
    return { kind: 'success', data: resp as unknown as T };
  } catch (err) {
    return { kind: 'error', message: err instanceof Error ? err.message : String(err) };
  }
}

// ---------------------------------------------------------------------------
//  登录 / 取 sessionKey / 登出（对应旧 login.js + BOLoginServlet）
// ---------------------------------------------------------------------------

/** GetSessionKeyServlet 返回结构（后端部署前置项）。 */
export interface SessionKeyInfo {
  sessionKey: string;
  env: string;
  systemCode?: string;
  entityCode?: string;
  entityName?: string;
  localCcy?: string;
  /** BO 全版本号，所有业务请求的 v 字段使用此值 */
  version: string;
}

/**
 * 登录请求（对应旧 login.js 整页 form POST，React 侧改为 AJAX）。
 *
 * 旧系统登录是整页 `<form>.submit()` 跳转到 JSP；React 重构后必然为 AJAX。
 * App 通道下 sessionKey 只存在服务端 session 里，无 JSP 嵌入，
 * 故登录成功后需调用 {@link getSessionKey} 取出 sessionKey/env/version
 * （依赖后端部署 GetSessionKeyServlet，见 01_SessionAuth.md）。
 *
 * @returns 登录结果（ok + sessionKey，或 error）
 */
/**
 * 登录返回结构。
 *
 * App 通道下，登录成功后所有"运行时 config"都从 GetSessionKeyServlet 取：
 * sessionKey/env/version/systemCode/entityCode/entityName/localCcy。
 * 其中 env/version 是**业务请求 NetMsgMeta 必填**（否则 -10110003）。
 */
export interface LoginResult {
  ok: boolean;
  sessionKey?: string;
  version?: string;
  env?: string;
  systemCode?: string;
  entityCode?: string;
  entityName?: string;
  localCcy?: string;
  error?: string;
}

export async function login(
  loginID: string,
  password: string,
  language: number = 0
): Promise<LoginResult> {
  // ---- Mock 登录 ----
  if (MOCK_ENABLED) {
    const r = mockLogin(loginID, password, language);
    return r;
  }

  // 密码加密（与旧 utils.js securityUtil.encode 一致）
  const encodedPassword = securityEncode(password);

  const params = new URLSearchParams({
    sfUserLoginID: loginID,
    sfUserPassword: encodedPassword,
    sfUserLanguage: language.toString(),
  });

  let response: Response;
  try {
    response = await fetch(LOGIN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
      credentials: 'include',
    });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }

  if (!response.ok) {
    return { ok: false, error: `HTTP error ${response.status}` };
  }

  // App 通道登录成功后，sessionKey 只存在服务端 session 里（属性名 boappUserSessionKey），
  // botrans.jsp 是跳板页（仅做 form.submit 跳转），不嵌入任何 sessionKey。
  // 故浏览器侧必须依赖 GetSessionKeyServlet 取出 sessionKey/env/version 等字段。
  let sessionKey = '';
  let version = '';
  let env = '';
  let systemCode: string | undefined;
  let entityCode: string | undefined;
  let entityName: string | undefined;
  let localCcy: string | undefined;
  let fetchFailed = false;

  try {
    const info = await getSessionKey();
    sessionKey = info.sessionKey;
    version = info.version;
    env = info.env;
    systemCode = info.systemCode;
    entityCode = info.entityCode;
    entityName = info.entityName;
    localCcy = info.localCcy;
  } catch (err) {
    // GetSessionKeyServlet 未部署（404）或异常 —— 登录本身已成功，降级处理。
    fetchFailed = true;
    const reason = err instanceof Error ? err.message : String(err);
    // 控制台明确告知：登录通过，但后续业务请求将因 sessionKey 为空失败
    // eslint-disable-next-line no-console
    console.warn(
      `[Login] GetSessionKeyServlet 不可用（${reason}）。\n` +
        'App 通道无法在浏览器侧获取 sessionKey，后续业务请求将失败。\n' +
        '请后端部署 GetSessionKeyServlet（见 knowledge-base/_shared/01_SessionAuth.md）。'
    );
  }

  // 返回 ok:true（登录本身成功），sessionKey/env 可能为空（需后端配合）
  void fetchFailed;
  return {
    ok: true,
    sessionKey,
    version,
    env,
    systemCode,
    entityCode,
    entityName,
    localCcy,
  };
}

/**
 * 取 sessionKey / env / 版本号（对应知识库 _shared/01_SessionAuth.md 既定方案）。
 *
 * 依赖后端部署 GetSessionKeyServlet（App 通道 AJAX 重构的前置项）。
 * 该 servlet 只读 HTTP session，返回上述字段；不改 Java 业务逻辑。
 */
export async function getSessionKey(): Promise<SessionKeyInfo> {
  const response = await fetch(GET_SESSION_KEY_URL, {
    method: 'GET',
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error(`GetSessionKey failed: HTTP ${response.status}`);
  }
  return (await response.json()) as SessionKeyInfo;
}

/**
 * 获取系统信息 (sysParamSetupGridMsg_GetSysDate)。
 * 登录后首页调用，取系统日期/机构/本位币等。
 */
export async function getSystemInfo(): Promise<SystemInfo> {
  const session = getSession();

  const result = await sendAuthRequest<NetMessage>(
    { n: 'sysParamSetupGridMsg_GetSysDate' },
    session
  );

  if (result.hvb && result.hvb.length > 0) {
    return result.hvb[0] as unknown as SystemInfo;
  }

  throw new Error('Failed to get system info');
}

/**
 * 登出请求 (loginSessionGridMsg_Logout)。
 */
export async function logout(): Promise<void> {
  const session = getSession();
  await sendAuthRequest({ n: 'loginSessionGridMsg_Logout' }, session);
}

// ---------------------------------------------------------------------------
//  报表请求（对应旧 ui.js:3660-3725 / func.rpt.js form POST 下载）
// ---------------------------------------------------------------------------

/**
 * 发送报表请求（弹出窗口 form POST，下载 PDF/CSV）。
 *
 * 旧系统报表走 `config.pullURL + "/" + rptName`，通过隐藏表单提交，
 * 字段名 sfNetMessage（不 URL-encode，因为是真实 form POST）。
 *
 * @param rptName 报表名（拼到 URL path）
 * @param message 已注入 metadata 的 NetMessage
 */
export function sendReportRequest(rptName: string, message: NetMessage): void {
  const session = getSession();
  const enriched = buildNetMsg(message, session);

  const payload = base64Encode(JSON.stringify(enriched));
  const url = `${PULL_URL}/${rptName}`;

  // 构造隐藏表单提交（与旧 ui.helper.openWindowWithPost 一致）
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = url;
  form.target = '_blank';
  form.style.display = 'none';

  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = 'sfNetMessage';
  input.value = payload;
  form.appendChild(input);

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}

export default {
  sendRequest,
  sendAuthRequest,
  sendAuthRequestResult,
  sendReportRequest,
  login,
  getSessionKey,
  getSystemInfo,
  logout,
};
