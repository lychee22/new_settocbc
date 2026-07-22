/**
 * Currency Setup 模块接口契约。
 *
 * 数据源：knowledge-base/_shared/01_NetMessageFormat.md 第 5.1 节（真实样例）。
 * 字段类型遵循后端约定：数值以字符串传输以保持精度（见 01_NetMessageFormat.md 第 8 节）。
 *
 * 消息名规范：currencySetupGridMsg_{Operation}
 *   - GetCcyMaster    单条查询
 *   - SearchCcyMaster 分页搜索
 *   - CreateCcyMaster 新建（带 approvallist）
 *   - UpdateCcyMaster 更新（带 approvallist）
 *   - DeleteCcyMaster 删除（带 approvallist）
 */

/** 货币主数据（CcyMaster 表）。 */
export interface CurrencyMaster {
  /** 货币代码，如 USD / HKD */
  curr: string;
  /** 货币描述（英文名） */
  desc: string;
  /** 小数位数（字符串形式，如 "2"） */
  dpsamt: string;
  /** 每年天数（"360" / "365"） */
  dayperyear: string;
  /** 保证金组 */
  margingrp?: string;
  /** 交易限额 */
  tradelmt?: string;
  /** GL 科目 */
  gl?: string;
  /** 是否可交割："true" / "false" */
  deliverable?: string;
  /** 货币标志：MAJ / MIN */
  ccyflag?: string;
  /** CLS 标志：Y = 是 / N = 否 */
  cls?: string;
  /** 最后更新人 */
  lupuser?: string;
  /** 最后更新时间 */
  luptime?: string;
}

/** Search 请求条件（mhvb.dtblcriteria 块）。 */
export interface CurrencySearchCriteria {
  curr?: string;
  desc?: string;
  ccyflag?: string;
  status?: string;
}

/** Get 请求参数。 */
export interface CurrencyGetParams {
  curr: string;
}

/** Create 请求参数。 */
export interface CurrencyCreateParams {
  data: CurrencyMaster;
}

/** Update 请求参数（原始值 + 新值，便于后端做变更检测）。 */
export interface CurrencyUpdateParams {
  original: Pick<CurrencyMaster, 'curr'>;
  data: CurrencyMaster;
}

/** Delete 请求参数。 */
export interface CurrencyDeleteParams {
  curr: string;
}
