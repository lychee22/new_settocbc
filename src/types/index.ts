// NetMessage 请求/响应类型
export interface NetMessage {
  n: string;           // 消息名
  hvb?: Record<string, unknown>[];  // 查询参数
  sts?: number;        // 状态码
  e?: string;          // 错误信息
  lb?: unknown[];      // 行数据
  lvb?: unknown[];     // 向量数据
  mhvb?: unknown[];
  // 元数据
  euid?: string;
  uid?: string;
  snk?: string;
  scid?: string;
  sq?: number;
  scsts?: number;
  v?: string;
  bm?: number;
  l?: number;
  ch?: string;
  env?: string;
}

// 登录请求参数
export interface LoginParams {
  sfUserLoginID: string;
  sfUserPassword: string;
  sfUserLanguage: number;
}

// 用户会话信息
export interface UserSession {
  loginID: string;
  env: string;
  sessionKey: string;
  language: number;
  entityCode: string;
  entityName: string;
  securityID?: string;
  systemCode?: string;
  localCcy?: string;
}

// 系统信息 (来自 sysParamSetupGridMsg_GetSysDate)
export interface SystemInfo {
  sysdate: string;        // 系统日期 (YYYYMMDD)
  entityCode: string;     // 机构代码
  entityName: string;     // 机构名称
  systemCode: string;     // 系统代码 (如 MFXDBMAIN)
  localCcy: string;      // 本地货币
  sysEnv?: string;       // 系统环境 (如 Development)
}

// 菜单项
export interface MenuItem {
  id: string;
  code: string;
  name: string;
  icon?: string;
  children?: MenuItem[];
}

// 路由配置
export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  name: string;
  icon?: string;
  children?: RouteConfig[];
}
