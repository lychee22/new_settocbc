import type { NetMessage } from '../../types';
import type { MockHandler, MockRequest } from '../types';

/* =========================================================================
 *  本文件是「可扩展骨架」示例。
 *  数据来源于 knowledge-base/_shared/01_NetMessageFormat.md 与
 *  knowledge-base/nostroaccno接口返回值.txt 的真实接口样例。
 *
 *  注意：Currency Setup 的 handler 已迁移到 handlers/currencySetup.ts。
 *  新增业务模块 mock 时，按同样的模式：
 *    1) 写一个 MockHandler（推荐独立文件 handlers/<module>.ts）
 *    2) 在 registry.ts 的 MESSAGE_HANDLERS 注册消息名 -> handler
 * ======================================================================= */

// ---------------------------------------------------------------------------
//  Nostro Account —— 真实样例（来自 nostroaccno接口返回值.txt）
// ---------------------------------------------------------------------------

/** Nostro 账号列表（精简版真实数据，支持前缀筛选自测） */
const NOSTRO_ACCNO_LIST = [
  { nostrokey: 'APIKey', nostroaccno: '100110', curr: 'HKD', branch: '802', glcode: '999999', shortname: 'TEST 4347 FOR GL CODE BY CCY', fullname: 'TEST 4347 FOR GL CODE BY CCY', status: '1', lupuser: 'TEST_CHECKER_N5', luptime: '2026-01-07 09:36:39.857' },
  { nostrokey: '801APIKey', nostroaccno: '110000', curr: 'HKD', branch: '801', glcode: '80111111111', shortname: 'Test 4347 for gl code by ccy', fullname: '1111111111', status: '1', lupuser: 'MONICA', luptime: '2026-01-06 15:16:13.510' },
  { nostrokey: '204key', nostroaccno: '204000', curr: 'HKD', branch: '2040', glcode: '204GlCode', shortname: 'TEST 7392 for nostro account number', fullname: '', status: '1', lupuser: 'yuwan', luptime: '2026-06-11 13:50:55.030' },
  { nostrokey: '2041key', nostroaccno: '20410000', curr: 'HKD', branch: '204100', glcode: '2041GlCode', shortname: 'TEST 7392 for nostro account number', fullname: '', status: '1', lupuser: 'yuwan', luptime: '2026-06-11 13:55:42.007' },
  { nostrokey: '802APIKey', nostroaccno: '210000', curr: 'HKD', branch: '802', glcode: '80222222222', shortname: 'Test 4347 for gl code by ccy', fullname: '11111111111111', status: '1', lupuser: 'MONICA', luptime: '2026-01-06 17:07:09.267' },
];

/**
 * nostroAccountSetupGridMsg_GetNostroAccNo —— 对齐 7392 自测指南的接口契约：
 *   响应容器 key = mhvb.nostroaccno（数组），每项含 nostroaccno / curr / glcode / branch。
 */
export const getNostroAccNo: MockHandler = (req: MockRequest) => {
  // 可选：按 curr 过滤；不传则返回全部
  const param = req?.hvb?.[0]?.curr as string | undefined;
  const list = param
    ? NOSTRO_ACCNO_LIST.filter((x) => x.curr === param)
    : NOSTRO_ACCNO_LIST;

  return {
    n: 'nostroAccountSetupGridMsg_GetNostroAccNo',
    sts: 0,
    hvb: [],
    mhvb: {
      nostroaccno: list,
      hasactive: [{ hasActive: list.length > 0 ? 'Y' : 'N' }],
    },
  } as NetMessage;
};

// ---------------------------------------------------------------------------
//  Counter Party Setup —— 多块 mhvb 示例
// ---------------------------------------------------------------------------

/**
 * counterPartySetupGridMsg_GetCounterParty —— 演示「多块 mhvb 响应」。
 * 数据来自 01_NetMessageFormat.md 的示例。
 */
export const getCounterParty: MockHandler = (_req: MockRequest) => {
  return {
    n: 'counterPartySetupGridMsg_GetCounterParty',
    sts: 0,
    hvb: [],
    mhvb: {
      cpty: [
        { cptycode: 'CPTY001', fullname: 'Test Counterparty', shortname: 'TEST', status: 'L' },
      ],
      cptycif: [
        { cif: '1234567890', seq: '1' },
        { cif: '0987654321', seq: '2' },
      ],
      cptyacc: [
        { acc: '80100001001', unit: 'DBU' },
        { acc: '80200001001', unit: 'ACU' },
      ],
    },
  } as NetMessage;
};

// ---------------------------------------------------------------------------
//  Override 审批示例（sts===1）
// ---------------------------------------------------------------------------

/**
 * 示例：演示如何返回 Override 提示（sts=1）。
 * 实际未挂到路由表，作为模板参考：在 registry 注册需要的消息名即可启用。
 */
export const sampleOverride: MockHandler = (_req: MockRequest) => {
  return {
    n: 'sampleGridMsg_SampleOp',
    sts: 1,
    hvb: [],
    mhvb: {},
    ovrinfo: {
      override: true,
      overridemsg: 'Override required for this operation',
    },
    ovrrule: 'VALIDRULE_XXX',
  } as NetMessage;
};
