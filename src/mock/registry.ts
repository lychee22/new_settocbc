import type { MockHandler, MockRequest } from './types';
import type { NetMessage } from '../types';

import { getSysDate, logout } from './handlers/system';
import {
  createCcyMaster,
  deleteCcyMaster,
  getCcyMaster,
  searchCcyMaster,
  updateCcyMaster,
} from './handlers/currencySetup';
import {
  getNostroAccNo,
  getCounterParty,
} from './handlers/masterSetup';

/**
 * 消息名 -> handler 的路由表。
 *
 * 新增一个 mock 只需两步：
 *   1. 在 handlers/<module>.ts 实现 MockHandler
 *   2. 在此表注册：'<messageName>': <handler>
 *
 * 消息名格式遵循后端约定：{module}GridMsg_{Operation}
 */
export const MESSAGE_HANDLERS: Record<string, MockHandler> = {
  // ---- 系统级 ----
  'sysParamSetupGridMsg_GetSysDate': getSysDate,
  'loginSessionGridMsg_Logout': logout,

  // ---- Currency Setup ----
  'currencySetupGridMsg_GetCcyMaster': getCcyMaster,
  'currencySetupGridMsg_SearchCcyMaster': searchCcyMaster,
  'currencySetupGridMsg_CreateCcyMaster': createCcyMaster,
  'currencySetupGridMsg_UpdateCcyMaster': updateCcyMaster,
  'currencySetupGridMsg_DeleteCcyMaster': deleteCcyMaster,

  // ---- Nostro Account ----
  'nostroAccountSetupGridMsg_GetNostroAccNo': getNostroAccNo,

  // ---- Counter Party Setup ----
  'counterPartySetupGridMsg_GetCounterParty': getCounterParty,
};

/**
 * 根据请求消息解析 mock 响应。
 *
 * @param req 已解码的请求消息对象（含 n 字段）
 * @returns 命中则返回 NetMessage；未注册返回 undefined（由调用方决定报错或 fallback）
 */
export function resolveMock(req: MockRequest): NetMessage | undefined {
  const name = req?.n as string | undefined;
  if (!name) return undefined;

  const handler = MESSAGE_HANDLERS[name];
  if (!handler) return undefined;

  return handler(req);
}
