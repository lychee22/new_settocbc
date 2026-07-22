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

/** 内置货币主数据（演示用；create/update/delete 会真实落库以便联调）。 */
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
    cls: 'Y',
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
    cls: 'Y',
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
    cls: 'Y',
    lupuser: 'ADMIN',
    luptime: '2026-04-23 10:00:00',
  },
  EUR: {
    curr: 'EUR',
    desc: 'Euro',
    dpsamt: '2',
    dayperyear: '360',
    margingrp: '1',
    tradelmt: '8000000',
    gl: '1004',
    deliverable: 'true',
    ccyflag: 'MAJ',
    cls: 'Y',
    lupuser: 'ADMIN',
    luptime: '2026-04-23 10:00:00',
  },
  GBP: {
    curr: 'GBP',
    desc: 'British Pound',
    dpsamt: '2',
    dayperyear: '365',
    margingrp: '2',
    tradelmt: '6000000',
    gl: '1005',
    deliverable: 'true',
    ccyflag: 'MAJ',
    cls: 'Y',
    lupuser: 'ADMIN',
    luptime: '2026-04-23 10:00:00',
  },
  JPY: {
    curr: 'JPY',
    desc: 'Japanese Yen',
    dpsamt: '0',
    dayperyear: '360',
    margingrp: '2',
    tradelmt: '3000000',
    gl: '1006',
    deliverable: 'true',
    ccyflag: 'MAJ',
    cls: 'Y',
    lupuser: 'ADMIN',
    luptime: '2026-04-23 10:00:00',
  },
  CNY: {
    curr: 'CNY',
    desc: 'Chinese Yuan',
    dpsamt: '2',
    dayperyear: '365',
    margingrp: '3',
    tradelmt: '2000000',
    gl: '1007',
    deliverable: 'true',
    ccyflag: 'MIN',
    cls: 'N',
    lupuser: 'ADMIN',
    luptime: '2026-04-23 10:00:00',
  },
  AUD: {
    curr: 'AUD',
    desc: 'Australian Dollar',
    dpsamt: '2',
    dayperyear: '365',
    margingrp: '2',
    tradelmt: '1500000',
    gl: '1008',
    deliverable: 'true',
    ccyflag: 'MAJ',
    cls: 'Y',
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
  // 过滤演示
  if (criteria.curr) {
    rows = rows.filter((r) => r.curr.includes(String(criteria.curr).toUpperCase()));
  }
  if (criteria.desc) {
    rows = rows.filter((r) =>
      r.desc.toLowerCase().includes(String(criteria.desc).toLowerCase())
    );
  }
  if (criteria.ccyflag) {
    rows = rows.filter((r) => r.ccyflag === criteria.ccyflag);
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

/** currencySetupGridMsg_CreateCcyMaster —— 新建，落库并补 luptime/lupuser；重复返回 -1。 */
export const createCcyMaster: MockHandler = (req: MockRequest): NetMessage => {
  const input = req?.hvb?.[0] ?? {};
  const curr = String(input.curr ?? '').toUpperCase();
  if (!curr) {
    return {
      n: 'currencySetupGridMsg_CreateCcyMaster',
      sts: -1,
      e: '货币代码不能为空',
      hvb: [],
      mhvb: {},
    };
  }
  if (CURRENCY_MASTER[curr]) {
    return {
      n: 'currencySetupGridMsg_CreateCcyMaster',
      sts: -1,
      e: '货币代码已存在',
      hvb: [],
      mhvb: {},
    };
  }
  const row: Record<string, string> = { ...input, curr, lupuser: 'ADMIN', luptime: NOW };
  CURRENCY_MASTER[curr] = row;
  return {
    n: 'currencySetupGridMsg_CreateCcyMaster',
    sts: 0,
    hvb: [row],
    mhvb: {},
  };
};

/** currencySetupGridMsg_UpdateCcyMaster —— 更新，落库并刷新 luptime；不存在返回 -1。 */
export const updateCcyMaster: MockHandler = (req: MockRequest): NetMessage => {
  const input = req?.hvb?.[0] ?? {};
  const curr = String(input.curr ?? '').toUpperCase();
  const existing = CURRENCY_MASTER[curr];
  if (!existing) {
    return {
      n: 'currencySetupGridMsg_UpdateCcyMaster',
      sts: -1,
      e: `Currency not found: ${curr}`,
      hvb: [],
      mhvb: {},
    };
  }
  const row: Record<string, string> = {
    ...existing,
    ...input,
    curr,
    lupuser: existing.lupuser ?? 'ADMIN',
    luptime: NOW,
  };
  CURRENCY_MASTER[curr] = row;
  return {
    n: 'currencySetupGridMsg_UpdateCcyMaster',
    sts: 0,
    hvb: [row],
    mhvb: {},
  };
};

/** currencySetupGridMsg_DeleteCcyMaster —— 删除，成功返回空 hvb；不存在返回 -1。 */
export const deleteCcyMaster: MockHandler = (req: MockRequest): NetMessage => {
  const curr = String(req?.hvb?.[0]?.curr ?? '').toUpperCase();
  if (!CURRENCY_MASTER[curr]) {
    return {
      n: 'currencySetupGridMsg_DeleteCcyMaster',
      sts: -1,
      e: `Currency not found: ${curr}`,
      hvb: [],
      mhvb: {},
    };
  }
  delete CURRENCY_MASTER[curr];
  return {
    n: 'currencySetupGridMsg_DeleteCcyMaster',
    sts: 0,
    hvb: [{ curr }],
    mhvb: {},
  };
};
