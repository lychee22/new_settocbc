/**
 * Currency Setup 模块 API。
 *
 * 范式说明：每个业务模块按此结构组织 ——
 *   - 每个后端 NetMessage 对应一个函数
 *   - 统一调用 sendAuthRequest，泛型标注响应类型
 *   - CRUD 操作的 Create/Update/Delete 默认携带 approvallist 块
 *
 * 数据源：knowledge-base/_shared/01_NetMessageFormat.md 第 5.1 节。
 */

import { sendAuthRequest } from '../request';
import type { NetMessage } from '../../types';
import type {
  DataTableCriteria,
  DataTableIndex,
  DataTableOrder,
  DataTableResult,
} from '../../types/netmessage';
import { DEFAULT_APPROVAL_LIST } from '../../types/netmessage';
import type {
  CurrencyCreateParams,
  CurrencyDeleteParams,
  CurrencyGetParams,
  CurrencyMaster,
  CurrencySearchCriteria,
  CurrencyUpdateParams,
} from '../../types/api/currencySetup';

/** 业务数据行转 hvb 元素（CurrencyMaster 等具名接口需经 unknown 断言）。 */
type HvbRow = Record<string, unknown>;

/** 构造带分页/排序的 mhvb（搜索类请求通用）。 */
function buildSearchMhvb(
  criteria: DataTableCriteria<CurrencySearchCriteria>,
  page: DataTableIndex,
  order?: DataTableOrder[]
): Record<string, unknown> {
  const mhvb: Record<string, unknown> = {
    dtblcriteria: [criteria],
    dtblindex: [page],
  };
  if (order && order.length > 0) {
    mhvb.dtblorder = order;
  }
  return mhvb;
}

/** 带审批块的 mhvb（写操作通用）。 */
function buildApprovalMhvb(): Record<string, unknown> {
  return { approvallist: DEFAULT_APPROVAL_LIST };
}

export const currencySetup = {
  /**
   * 分页搜索货币主数据。
   * NetMessage: currencySetupGridMsg_SearchCcyMaster
   * 响应: mhvb.dtbldata 为 CurrencyMaster[]，mhvb.dtblinfo 为分页元信息。
   */
  async search(
    criteria: DataTableCriteria<CurrencySearchCriteria>,
    page: DataTableIndex,
    order?: DataTableOrder[]
  ): Promise<DataTableResult<CurrencyMaster>> {
    const resp = await sendAuthRequest<NetMessage>({
      n: 'currencySetupGridMsg_SearchCcyMaster',
      mhvb: buildSearchMhvb(criteria, page, order),
    });
    return resp.mhvb as unknown as DataTableResult<CurrencyMaster>;
  },

  /**
   * 获取单条货币主数据。
   * NetMessage: currencySetupGridMsg_GetCcyMaster
   * 响应: hvb[0] 为 CurrencyMaster。
   */
  async get(params: CurrencyGetParams): Promise<CurrencyMaster> {
    const resp = await sendAuthRequest<NetMessage>({
      n: 'currencySetupGridMsg_GetCcyMaster',
      hvb: [{ curr: params.curr }],
    });
    if (!resp.hvb || resp.hvb.length === 0) {
      throw new Error(`Currency not found: ${params.curr}`);
    }
    return resp.hvb[0] as unknown as CurrencyMaster;
  },

  /**
   * 新建货币主数据。
   * NetMessage: currencySetupGridMsg_CreateCcyMaster
   * 响应: hvb[0] 为新建后的完整记录（含 luptime）。
   *   sts===1 时为 Override 提示，由调用方处理（用 sendAuthRequestResult）。
   */
  async create(params: CurrencyCreateParams): Promise<CurrencyMaster> {
    const resp = await sendAuthRequest<NetMessage>({
      n: 'currencySetupGridMsg_CreateCcyMaster',
      hvb: [params.data as unknown as HvbRow],
      mhvb: buildApprovalMhvb(),
    });
    return (resp.hvb?.[0] ?? params.data) as unknown as CurrencyMaster;
  },

  /**
   * 更新货币主数据。
   * NetMessage: currencySetupGridMsg_UpdateCcyMaster
   */
  async update(params: CurrencyUpdateParams): Promise<CurrencyMaster> {
    const resp = await sendAuthRequest<NetMessage>({
      n: 'currencySetupGridMsg_UpdateCcyMaster',
      hvb: [params.data as unknown as HvbRow],
      mhvb: buildApprovalMhvb(),
    });
    return (resp.hvb?.[0] ?? params.data) as unknown as CurrencyMaster;
  },

  /**
   * 删除货币主数据。
   * NetMessage: currencySetupGridMsg_DeleteCcyMaster
   */
  async delete(params: CurrencyDeleteParams): Promise<void> {
    await sendAuthRequest<NetMessage>({
      n: 'currencySetupGridMsg_DeleteCcyMaster',
      hvb: [{ curr: params.curr }],
      mhvb: buildApprovalMhvb(),
    });
  },
};

export default currencySetup;
