/**
 * NetMessage 通用类型 —— 与旧系统后端字段逐字对齐。
 *
 * 数据源：
 *   - 旧系统 app.js (addMetaData) 的 18 个 metadata 字段
 *   - 旧系统 conn.js (sendRequest) 的请求/响应编解码约定
 *   - knowledge-base/_shared/01_NetMessageFormat.md 的数据块契约
 *
 * 注意：业务数值字段在后端统一以「字符串」传输以保持精度
 * （见 01_NetMessageFormat.md 第 8 节），故业务接口里的数值多为 string。
 */

/** 请求消息名，格式：{module}GridMsg_{Operation} */
export type NetMsgName = string;

/**
 * NetMessage 元数据 —— 旧系统 addMetaData 注入的全部 18 个字段（顺序固定）。
 * 来源：src/jsp/client/bojs/app.js:4-23
 *
 * 后端 BOPullServlet.doPost 会逐项校验：
 *   - v       : validateBOVersion，必须与 BOVersion.BO_VERSION 全版本号严格相等
 *   - snk     : validateUserSession，sessionKey
 *   - scid    : （旧系统通过 cookie 传递，消息体字段保留占位 '?'）
 *   - l       : 语言码
 */
export interface NetMsgMeta {
  /** end user id（= loginID） */
  euid: string;
  /** end user comp id（旧 cache._compID，默认 1） */
  euc: number | string;
  /** user id（= loginID） */
  uid: string;
  /** 用户 acc id（旧 cache._accID，默认 '?'） */
  acc: string;
  /** user comp id（= euc，默认 1） */
  uc: number | string;
  /** status，请求固定 0 */
  sts: number;
  /** session key（登录后由 GetSessionKeyServlet 返回） */
  snk: string;
  /** sequence，请求固定 0 */
  sq: number;
  /** security id 占位（旧 cache._securityID，默认 '?'） */
  scid: string;
  /** security status，请求固定 0 */
  scsts: number;
  /** BO 全版本号，来自 authStore.session.version（后端严格校验） */
  v: string;
  /** buffer mode，请求固定 0 */
  bm: number;
  /** 语言码（0=英文，详见 lang.js） */
  l: number;
  /** error，请求固定 null */
  e: string | null;
  /** channel（旧 cache._channel，App 通道为 null） */
  ch: string | null;
  /** external user id（旧 cache._extUserID，默认 null） */
  extuid: string | null;
  /** 交易 token 占位（旧 cache._t，默认 '?'） */
  t: string;
  /** 环境码（登录后由 GetSessionKeyServlet 返回，如 MFXDBMAIN） */
  env: string;
}

/** DataTable 分页参数（mhvb.dtblindex 块）。 */
export interface DataTableIndex {
  /** 起始偏移（从 0 开始） */
  offset: number;
  /** 本页条数 */
  length: number;
}

/** DataTable 排序参数（mhvb.dtblorder 块）。 */
export interface DataTableOrder {
  /** 排序列名 */
  column: string;
  /** 排序方向：'asc' | 'desc' */
  dir: 'asc' | 'desc';
}

/**
 * DataTable 查询条件块（mhvb.dtblcriteria 块）。
 * 泛型 T 为各模块自定义的条件字段。
 */
export type DataTableCriteria<T> = T;

/**
 * DataTable 查询结果（响应 mhvb 块）。
 * 后端分页查询统一返回此结构。
 */
export interface DataTableResult<T> {
  /** 命中数据行 */
  dtbldata: T[];
  /** 分页元信息 */
  dtblinfo: {
    /** 总条数 */
    total: number;
    /** 总页数（部分接口返回） */
    pageCnt?: number;
  };
}

/**
 * Override 提示信息（响应 ovrinfo 块，sts === 1 时存在）。
 * 来源：01_NetMessageFormat.md 第 3.3 节。
 */
export interface OverrideInfo {
  override: boolean;
  overridemsg: string;
}

/** 审批列表项（mhvb.approvallist 块）。 */
export interface ApprovalListItem {
  /** approval request id，新建时传 0 */
  reqid: number;
  /** last update time，新建时传 null */
  luptime: string | null;
}

/** 新建/更新请求中默认携带的审批块。 */
export const DEFAULT_APPROVAL_LIST: ApprovalListItem[] = [{ reqid: 0, luptime: null }];

/**
 * ApiResult —— sendAuthRequest 的统一返回包装。
 * 业务层据此判断是正常数据、Override 提示还是错误。
 */
export type ApiResult<T> =
  | { kind: 'success'; data: T }
  | { kind: 'override'; overrideInfo: OverrideInfo; overrideRule: string; data: T }
  | { kind: 'error'; message: string };

/**
 * 响应状态码。
 *   0  = 成功
 *   1  = Override 需要审批
 *  -1 = 失败（见 e 字段）
 */
export const STS_SUCCESS = 0 as const;
export const STS_OVERRIDE = 1 as const;
export const STS_ERROR = -1 as const;
