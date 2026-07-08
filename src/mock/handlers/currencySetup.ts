/**
 * Currency Setup 模块 Mock Handler。
 *
 * 数据源：knowledge-base/_shared/01_NetMessageFormat.md 第 5.1 节真实样例。
 * 字段对齐 src/types/api/currencySetup.ts 的 CurrencyMaster。
 *
 * Handler 约定（与真实后端一致）：
 *   - sts === 0  : 成功，数据放在 hvb / mhvb
 *   - sts === 1  : 需 Override 审批（返回 ovrinfo / ovrrule）
 *   - sts === -1 : 失败，错误信息放在 e 字段
 */

import type { NetMessage } from '../../types';
import type { MockHandler, MockRequest } from '../types';

/** 内置货币主数据（演示静态数据返回）。 */
const CURRENCY_MASTER: Record<string, Record<string, string>> = {
  USD: {
    curr: 'USD',
    desc: 'US Dollar',
    dpsamt: '2',
    dayperyear: '360',
    margingrp: '1',
    tradelmt: '1000000',
    gl: '1001',
    deliverable: 'true',
    ccyflag: 'MAJ',
    cls: 'MAJ',
    lupuser: 'ADMIN',
    luptime: '2026-04-23 10:00:00',
  },
  HKD: {
    curr: 'HKD',
    desc: 'Hong Kong Dollar',
    dpsamt: '2',
    dayperyear: '365',
    margingrp: '1',
    tradelmt: '5000000',
    gl: '1002',
    deliverable: 'true',
    ccyflag: 'MAJ',
    cls: 'MAJ',
    lupuser: 'ADMIN',
    luptime: '2026-04-23 10:00:00',
  },
  SGD: {
    curr: 'SGD',
    desc: 'Singapore Dollar',
    dpsamt: '2',
    dayperyear: '365',
    margingrp: '1',
    tradelmt: '2000000',
    gl: '1003',
    deliverable: 'true',
    ccyflag: 'MAJ',
    cls: 'MAJ',
    lupuser: 'ADMIN',
    luptime: '2026-04-23 10:00:00',
  },
};

const NOW = '2026-04-23 10:00:00';

/** currencySetupGridMsg_GetCcyMaster —— 单条查询，按 hvb[0].curr 过滤。 */
export const getCcyMaster: MockHandler = (req: MockRequest): NetMessage => {
  const param = req?.hvb?.[0]?.curr as string | undefined;
  const curr = (param || 'USD').toUpperCase();
  const row = CURRENCY_MASTER[curr];

  if (!row) {
    return {
      n: 'currencySetupGridMsg_GetCcyMaster',
      sts: -1,
      e: `Currency not found: ${curr}`,
      hvb: [],
      mhvb: {},
    };
  }

  return {
    n: 'currencySetupGridMsg_GetCcyMaster',
    sts: 0,
    hvb: [row],
    mhvb: {},
  };
};

/** currencySetupGridMsg_SearchCcyMaster —— 分页搜索。 */
export const searchCcyMaster: MockHandler = (req: MockRequest): NetMessage => {
  const criteria = req?.mhvb?.dtblcriteria?.[0] ?? {};
  const index = req?.mhvb?.dtblindex?.[0] ?? { offset: 0, length: 10 };

  let rows = Object.values(CURRENCY_MASTER);
  // 简单过滤演示
  if (criteria.curr) {
    rows = rows.filter((r) => r.curr.includes(String(criteria.curr).toUpperCase()));
  }
  if (criteria.desc) {
    rows = rows.filter((r) =>
      r.desc.toLowerCase().includes(String(criteria.desc).toLowerCase())
    );
  }

  const total = rows.length;
  const start = Number(index.offset) || 0;
  const len = Number(index.length) || 10;
  const paged = rows.slice(start, start + len);

  return {
    n: 'currencySetupGridMsg_SearchCcyMaster',
    sts: 0,
    hvb: [],
    mhvb: {
      dtbldata: paged,
      dtblinfo: { total, pageCnt: Math.ceil(total / len) },
    },
  };
};

/** currencySetupGridMsg_CreateCcyMaster —— 新建，回显并补 luptime/lupuser。 */
export const createCcyMaster: MockHandler = (req: MockRequest): NetMessage => {
  const input = req?.hvb?.[0] ?? {};
  const row = { ...input, lupuser: 'ADMIN', luptime: NOW };
  return {
    n: 'currencySetupGridMsg_CreateCcyMaster',
    sts: 0,
    hvb: [row],
    mhvb: {},
  };
};

/** currencySetupGridMsg_UpdateCcyMaster —— 更新，回显最新数据。 */
export const updateCcyMaster: MockHandler = (req: MockRequest): NetMessage => {
  const input = req?.hvb?.[0] ?? {};
  const row = { ...input, lupuser: 'ADMIN', luptime: NOW };
  return {
    n: 'currencySetupGridMsg_UpdateCcyMaster',
    sts: 0,
    hvb: [row],
    mhvb: {},
  };
};

/** currencySetupGridMsg_DeleteCcyMaster —— 删除，成功返回空 hvb。 */
export const deleteCcyMaster: MockHandler = (req: MockRequest): NetMessage => {
  const curr = req?.hvb?.[0]?.curr as string | undefined;
  return {
    n: 'currencySetupGridMsg_DeleteCcyMaster',
    sts: 0,
    hvb: [{ curr }],
    mhvb: {},
  };
};
