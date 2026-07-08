/**
 * 全局运行配置中心（新项目对旧 jQuery 客户端 `config` 全局对象的等价物）。
 *
 * 旧项目（jQuery/JSP）在 `boMain.jsp` / `boMenu.jsp` 头部初始化了一个
 * 包含 45 个字段的全局对象 `config = {...}`（sysVer / sessionID / entityCode /
 * lang / locale / ajaxTimeout / refreshInterval / NUMERIC_FORMAT / ...），
 * 供所有 JS 模块直接 `config.xxx` 访问。
 *
 * 新项目（React + TS）把这些字段拆分到三类位置：
 *
 *  1. **本文件**：所有"启动时确定"或"前端硬编码"的常量
 *     （URL、超时、精度、文本长度、刷新间隔、内部账户、业务规则）
 *  2. **`useAuthStore.session`**：运行时由服务端填充的字段
 *     （sessionKey / env / version / systemCode / entityCode / entityName /
 *      localCcy / sysEnv / language / userWarningMsg）
 *  3. **`.env` / `.env.mock`**：可被部署环境覆盖的 URL 与 mock 开关
 *
 * 业务模块统一用本文件提供的常量 + {@link getRuntimeConfig} 读取配置，
 * 避免散落在各模块内硬编码。
 *
 * 字段映射细节见 `knowledge-base/_shared/02_RuntimeConfig.md`。
 */

import { useAuthStore } from '@/stores/authStore';

// ---------------------------------------------------------------------------
//  1. 服务端地址（对应旧 config.pullURL / pushURL / loginURL）
// ---------------------------------------------------------------------------

/** NetMessage pull 通道（旧 BOAppPullServlet） */
export const PULL_URL: string =
  (import.meta.env.VITE_PULL_URL as string | undefined) ||
  '/settocbcBoServer/BOAppPullServlet';

/** 推送通道（旧 FOPushServlet，保留常量；本期不实现推送） */
export const PUSH_URL: string =
  (import.meta.env.VITE_PUSH_URL as string | undefined) ||
  '/owhFoPushServer/FOPushServlet';

/** 登录入口（旧 BOAppLoginServlet） */
export const LOGIN_URL: string =
  (import.meta.env.VITE_LOGIN_URL as string | undefined) ||
  '/settocbcBoServer/BOAppLoginServlet';

/** 取 sessionKey / env / version 的 servlet（App 通道 AJAX 重构的前置项） */
export const GET_SESSION_KEY_URL: string =
  (import.meta.env.VITE_GET_SESSION_KEY_URL as string | undefined) ||
  '/settocbcBoServer/GetSessionKeyServlet';

/** 报表下载（旧表单 POST） */
export const REPORT_DOWNLOAD_URL: string =
  (import.meta.env.VITE_REPORT_DOWNLOAD_URL as string | undefined) ||
  '/settocbcBoServer/BOReportDownloadServlet';

/** 旧 JSP 登录页（App 通道下未使用，保留以备 Admin 通道跳转） */
export const LOGIN_PAGE = 'bologin.jsp';

// ---------------------------------------------------------------------------
//  2. 超时与探活（对应旧 config.ajaxTimeout / probeInterval）
// ---------------------------------------------------------------------------

/** 单次业务请求超时（ms）。旧 ajaxTimeout = 120000。 */
export const AJAX_TIMEOUT = 120_000;

/**
 * 服务端会话探活间隔（ms）。
 * 旧 probeInterval = 300000（5 分钟）；旧 JSP 客户端用此间隔调用
 * loginSessionGridMsg_KeepSessionAlive 维持服务端 session 不被回收。
 *
 * 本期 UI 已实现 10 分钟活动超时（见 `src/hooks/useSessionTimeout.ts`），
 * 但尚未发送 keepalive NetMessage。后续接入时按此间隔发送。
 */
export const KEEPALIVE_INTERVAL = 300_000;

/** 客户端活动超时（ms）。10 分钟无活动 → 弹窗 → 强制登出。 */
export const SESSION_TIMEOUT = 10 * 60 * 1000;

/** 活动超时前多少毫秒弹警告。 */
export const WARNING_BEFORE_TIMEOUT = 60 * 1000;

// ---------------------------------------------------------------------------
//  3. 数字精度（对应旧 config.pipsMaxDp / rateMaxDp / amtMaxDp 等）
// ---------------------------------------------------------------------------

/**
 * 数字显示精度。旧项目客户端按此四舍五入显示数值，
 * 新项目后端已返回字符串形式的精度化数值（见 `01_NetMessageFormat.md`），
 * 但部分模块（手工报价、点差计算等）仍需客户端按此截断。
 */
export const NUMERIC_FORMAT = {
  /** pips 显示小数位（默认 0） */
  pipsMaxDp: 0,
  /** 即期/远期汇率显示小数位（默认 6） */
  rateMaxDp: 6,
  /** 备用汇率小数位（默认 2） */
  rateMaxDp2: 2,
  /** 高精度汇率小数位（默认 8，用于 NDF 等） */
  rateMaxDp3: 8,
  /** 百分比显示小数位（默认 2） */
  pctMaxDp: 2,
  /** 金额显示小数位（默认 0） */
  amtMaxDp: 0,
  /** 备用金额小数位（默认 2） */
  amtMaxDp2: 2,
  /** 默认汇率小数位（默认 6） */
  defDigitAftDecPoint: 6,
  /** 市场行情汇率小数位（默认 6） */
  defDigitAftDecPointMkt: 6,
  /** 手工报价差异阈值百分比（默认 15） */
  manualPriceDiffRate: 15,
} as const;

export type NumericFormatKey = keyof typeof NUMERIC_FORMAT;

// ---------------------------------------------------------------------------
//  4. 文本长度（对应旧 config.defMaxLenTXB / defMaxLenTXA）
// ---------------------------------------------------------------------------

/** 输入框最大长度（短文本输入框）—— 旧 defMaxLenTXB = 30 */
export const TEXT_LENGTH = {
  shortInput: 30,
  textArea: 2000,
} as const;

// ---------------------------------------------------------------------------
//  5. 业务刷新间隔（对应旧 config 8 个 *RefreshInterval / *AlertInterval）
// ---------------------------------------------------------------------------

/**
 * 旧 JSP 客户端用 `setInterval` 周期性拉取数据。本期前端未启用任何自动轮询
 * （等待后续业务模块接入时按需启用）。先集中定义，后续按命名启用即可。
 */
export const REFRESH_INTERVAL = {
  /** 警报总览（Alert Dashboard）刷新间隔 —— 旧 loadAlertInterval = 60000 */
  loadAlert: 60_000,
  /** 核心汇率警报刷新间隔 —— 旧 loadCoreRateAlertInterval = 30000 */
  loadCoreRateAlert: 30_000,
  /** NT 点差警报刷新间隔 —— 旧 loadNTSpreadAlertInterval = 30000 */
  loadNTSpreadAlert: 30_000,
  /** Call Cut 警报刷新间隔 —— 旧 loadCallCutAlertInterval = 60000 */
  loadCallCutAlert: 60_000,
  /** 待处理交易刷新间隔 —— 旧 pendingDealRefreshInterval = 30000 */
  pendingDeal: 30_000,
  /** Rate Book 持仓刷新间隔 —— 旧 rateBookPosRefreshInterval = 30000 */
  rateBookPos: 30_000,
  /** Forward 持仓刷新间隔 —— 旧 fwdPosRefreshInterval = 30000 */
  fwdPos: 30_000,
  /** CS 账户刷新间隔 —— 旧 csAccRefreshInterval = 60000 */
  csAcc: 60_000,
} as const;

export type RefreshIntervalKey = keyof typeof REFRESH_INTERVAL;

// ---------------------------------------------------------------------------
//  6. 内部账户（对应旧 config.internalCif / internalCustName）
// ---------------------------------------------------------------------------

/** 内部账户（银行间对账时用于标识本行内部账户） */
export const INTERNAL_ACCOUNT = {
  cif: 'INTERNAL',
  customerName: 'INTERNAL',
} as const;

// ---------------------------------------------------------------------------
//  7. 业务限定（对应旧 config.spreadLayerMax / menu / forcePwdChange）
// ---------------------------------------------------------------------------

export const BUSINESS_RULES = {
  /** 最大点差层数 —— 旧 spreadLayerMax = 3 */
  spreadLayerMax: 3,
  /** 默认菜单模式 —— 旧 menu = "D"（Drawer） */
  defaultMenu: 'D' as 'D' | 'T',
  /** 是否强制改密 —— 旧 forcePwdChange = false，可由登录响应覆盖 */
  forcePwdChange: false,
} as const;

// ---------------------------------------------------------------------------
//  8. 运行时配置（来自服务端，动态更新）
// ---------------------------------------------------------------------------

/**
 * 运行时配置快照。所有字段从 zustand `useAuthStore.session` 中读取，
 * 调用 {@link getRuntimeConfig} 获取当前快照。
 *
 * 与本文件其他常量的区别：这些字段**每次业务请求**都要用（注入 NetMsgMeta），
 * 而常量只在初始化时读一次。
 */
export interface RuntimeConfig {
  /** BO 系统代码（旧 config.systemCode = "MPAYFXSG"） */
  systemCode: string;
  /** 机构代码（旧 config.entityCode） */
  entityCode: string;
  /** 机构名称（旧 config.entityName，从 getSystemInfo 异步填充） */
  entityName: string;
  /** 本地货币（旧 config.localCcy = "SGD"） */
  localCcy: string;
  /** 环境标识（DEV / UAT / PROD，旧 config.env） */
  env: string;
  /** 系统环境名（旧 config.sysEnv = "Development"，从 getSystemInfo 异步填充） */
  sysEnv?: string;
  /** BO 全版本号（旧 config.sysVer） */
  version: string;
  /** 服务端会话 key（旧 config.sessionID） */
  sessionKey: string;
  /** 登录用户警告消息（旧 config.userWarningMsg） */
  userWarningMsg: string;
  /** 语言码（旧 config.lang = 0 / 1） */
  language: number;
}

/** 读取当前运行时配置快照。供业务模块在发请求前注入 NetMsgMeta。 */
export function getRuntimeConfig(): RuntimeConfig {
  const s = useAuthStore.getState().session;
  return {
    systemCode: s?.systemCode ?? '',
    entityCode: s?.entityCode ?? '',
    entityName: s?.entityName ?? '',
    localCcy: s?.localCcy ?? '',
    env: s?.env ?? '',
    sysEnv: s?.sysEnv,
    version: s?.version ?? '',
    sessionKey: s?.sessionKey ?? '',
    userWarningMsg: '',
    language: s?.language ?? 0,
  };
}

// ---------------------------------------------------------------------------
//  9. Mock 开关（替代旧 config.debug）
// ---------------------------------------------------------------------------

// MOCK_ENABLED / MOCK_LATENCY 由 `src/mock/index.ts` 定义并导出。
// 此处不重复定义，避免双源。
//
// 旧 `debug = true` 用于开发期打开 JS 调试日志；新项目改为 mock 开关。
// import { MOCK_ENABLED, MOCK_LATENCY } from '../mock';