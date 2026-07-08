import type { NetMessage } from '../../types';
import type { MockHandler } from '../types';
import type { RawMenuItem } from '../../types/api/menu';

/**
 * `userAccessGridMsg_GetUserMenu` —— 动态菜单 mock。
 *
 * 数据来自真实响应样本 getmenu.txt（TEST_MAKER_N2 账号，共 57 项）。
 * 包含 6 个一级分组：
 *   001 Master Setup（9 叶子）
 *   002 Data Entry（含 002.007 CNR Entry 二级嵌套，共 10 叶子）
 *   003 Inquiry（4 叶子）
 *   004 Master Report（7 报表，functype=COMMRPT）
 *   005 Trade Report（27 报表，functype=COMMRPT）
 *   006 Approval（1 叶子）
 *
 * 此 mock 与真实后端行为一致，便于无后端环境下开发调试。
 */
const MOCK_MENU_ITEMS: RawMenuItem[] = [
  // ---- 001 Master Setup ----
  { functype: '', item: '001', functionid: 'mastersetup', jsfile: '', parm: '--', header: 'true', allowmultiwindow: 'false', funcdesc: 'Master Setup', accessmode: '', isapproval: '0' },
  { functype: '', item: '001.001', functionid: 'currsetup', jsfile: 'func.currSetup.js', parm: '--', header: 'false', allowmultiwindow: 'false', funcdesc: 'Currency Setup', accessmode: 'VAED', isapproval: '1' },
  { functype: '', item: '001.002', functionid: 'currpairsetup', jsfile: 'func.currPairSetup.js', parm: '--', header: 'false', allowmultiwindow: 'false', funcdesc: 'CurrencyPair Setup', accessmode: 'VAED', isapproval: '1' },
  { functype: '', item: '001.003', functionid: 'holidaytable', jsfile: 'func.holidayTblSetup.js', parm: '--', header: 'false', allowmultiwindow: 'false', funcdesc: 'Currency Holiday Setup', accessmode: 'VE', isapproval: '1' },
  { functype: '', item: '001.004', functionid: 'counterpartysetup', jsfile: 'func.counterPartySetup.js', parm: '--', header: 'false', allowmultiwindow: 'false', funcdesc: 'Counterparty  Setup', accessmode: 'VAED', isapproval: '1' },
  { functype: '', item: '001.005', functionid: 'accmassetup', jsfile: 'func.accMasSetup.js', parm: '--', header: 'false', allowmultiwindow: 'false', funcdesc: 'FX Account Setup', accessmode: 'VE', isapproval: '1' },
  { functype: '', item: '001.006', functionid: 'nostroaccsetup', jsfile: 'func.nostroAccSetup.js', parm: '--', header: 'false', allowmultiwindow: 'false', funcdesc: 'Nostro Account Setup', accessmode: 'VAED', isapproval: '1' },
  { functype: '', item: '001.007', functionid: 'entitysetup', jsfile: 'func.entitySetup.js', parm: '--', header: 'false', allowmultiwindow: 'false', funcdesc: 'Entity Setup', accessmode: 'VE', isapproval: '1' },
  { functype: '', item: '001.008', functionid: 'glpostingsetup', jsfile: 'func.glPostingSetup.js', parm: '', header: 'false', allowmultiwindow: 'false', funcdesc: 'GL Posting Setup', accessmode: 'VAED', isapproval: '1' },
  { functype: '', item: '001.009', functionid: 'tradeconfdisclaimersetup', jsfile: 'func.tradeconfDisclaimerSetup.js', parm: '--', header: 'false', allowmultiwindow: 'false', funcdesc: 'Trade Confirmation Disclaimer Setup', accessmode: 'VE', isapproval: '1' },

  // ---- 002 Data Entry ----
  { functype: '', item: '002', functionid: 'dataentry', jsfile: '', parm: '--', header: 'true', allowmultiwindow: 'false', funcdesc: 'Data Entry', accessmode: '', isapproval: '0' },
  { functype: '', item: '002.001', functionid: 'fxfwdcontractentry', jsfile: 'func.fxFwdContractEntry.js', parm: '--', header: 'false', allowmultiwindow: 'false', funcdesc: 'FX Contract Entry', accessmode: 'V', isapproval: '1' },
  { functype: '', item: '002.002', functionid: 'fxutilizationentry', jsfile: 'func.fxUtilizationEntry.js', parm: '--', header: 'false', allowmultiwindow: 'false', funcdesc: 'FX Utilization Entry', accessmode: 'V', isapproval: '1' },
  { functype: '', item: '002.004', functionid: 'fxutilizationamd', jsfile: 'func.fxUtilizationAmendment.js', parm: '--', header: 'false', allowmultiwindow: 'false', funcdesc: 'FX Utilization Amendment', accessmode: 'VD', isapproval: '1' },
  { functype: '', item: '002.005', functionid: 'fxcontractnettingentry', jsfile: 'func.fxContractNettingEntry.js', parm: '--', header: 'false', allowmultiwindow: 'false', funcdesc: 'FX Contract Netting Entry', accessmode: 'V', isapproval: '1' },
  { functype: '', item: '002.006', functionid: 'txnmurextraderesubmit', jsfile: 'func.corpFxTxnMurexTradResubmit.js', parm: '--', header: 'false', allowmultiwindow: 'false', funcdesc: 'Transaction Murex Trade Resubmission', accessmode: 'V', isapproval: '0' },

  // ---- 002.007 CNR Entry（二级嵌套分组）----
  { functype: '', item: '002.007', functionid: 'cnrentry', jsfile: '', parm: '--', header: 'true', allowmultiwindow: 'false', funcdesc: 'CNR Entry', accessmode: '', isapproval: '0' },
  { functype: '', item: '002.007.001', functionid: 'cnrcanceldeal', jsfile: 'func.cnrEntryCancelDeal.js', parm: '--', header: 'false', allowmultiwindow: 'false', funcdesc: 'CNR - Cancel Deal', accessmode: 'VD', isapproval: '1' },
  { functype: '', item: '002.007.002', functionid: 'cnrcancelandrebook', jsfile: 'func.cnrEntryCancelAndRebook.js', parm: '--', header: 'false', allowmultiwindow: 'false', funcdesc: 'CNR - Cancel And Rebook', accessmode: 'VD', isapproval: '1' },
  { functype: '', item: '002.007.006', functionid: 'cnrutilizationmanagement', jsfile: 'func.CnRUtilizationEntry.js', parm: '--', header: 'false', allowmultiwindow: 'false', funcdesc: 'CNR Utilization Management', accessmode: 'V', isapproval: '1' },
  { functype: '', item: '002.007.007', functionid: 'contractdealmainupdate', jsfile: 'func.contractDealMainUpdate.js', parm: '--', header: 'false', allowmultiwindow: 'false', funcdesc: 'Contract / Deal Maintenance - Update', accessmode: 'VE', isapproval: '1' },

  { functype: '', item: '002.008', functionid: 'mpaymtmsettentry', jsfile: 'func.mpayMtmSettEntry.js', parm: '--', header: 'false', allowmultiwindow: 'false', funcdesc: 'MTM Settlement Entry', accessmode: 'V', isapproval: '1' },

  // ---- 003 Inquiry ----
  { functype: '', item: '003', functionid: 'inquiry', jsfile: '', parm: '--', header: 'true', allowmultiwindow: 'false', funcdesc: 'Inquiry', accessmode: '', isapproval: '0' },
  { functype: '', item: '003.001', functionid: 'fxfwdcontractinquiry', jsfile: 'func.fxFwdContractInquiry.js', parm: '--', header: 'false', allowmultiwindow: 'false', funcdesc: 'FX Contract Inquiry', accessmode: 'V', isapproval: '0' },
  { functype: '', item: '003.002', functionid: 'fxutilizationinq', jsfile: 'func.fxUtilizationInq.js', parm: '--', header: 'false', allowmultiwindow: 'false', funcdesc: 'FX Utilization Inquiry', accessmode: 'V', isapproval: '0' },
  { functype: '', item: '003.003', functionid: 'fxcontractnettinginq', jsfile: 'func.fxContractNettingInq.js', parm: '--', header: 'false', allowmultiwindow: 'false', funcdesc: 'FX Contract Netting Inquiry', accessmode: 'V', isapproval: '0' },
  { functype: '', item: '003.004', functionid: 'corpfxexceptionloginquiry', jsfile: 'func.corpFxExceptLogInq.js', parm: '--', header: 'false', allowmultiwindow: 'false', funcdesc: 'Corp Exception Logs Inquiry', accessmode: 'V', isapproval: '0' },

  // ---- 004 Master Report ----
  { functype: '', item: '004', functionid: 'masterreport', jsfile: '', parm: '--', header: 'true', allowmultiwindow: 'false', funcdesc: 'Master Report', accessmode: '', isapproval: '0' },
  { functype: 'COMMRPT', item: '004.001', functionid: 'currmasterlisting', jsfile: 'func.rpt.js', parm: '--', header: 'false', allowmultiwindow: 'false', funcdesc: 'Currency Listing', accessmode: 'X', isapproval: '0' },
  { functype: 'COMMRPT', item: '004.002', functionid: 'currencypairlisting', jsfile: 'func.rpt.js', parm: '--', header: 'false', allowmultiwindow: 'false', funcdesc: 'Currency Pair Listing', accessmode: 'X', isapproval: '0' },
  { functype: 'COMMRPT', item: '004.004', functionid: 'currholimasterlisting', jsfile: 'func.rpt.js', parm: '--', header: 'false', allowmultiwindow: 'false', funcdesc: 'Currency Holiday Listing', accessmode: 'X', isapproval: '0' },
  { functype: 'COMMRPT', item: '004.005', functionid: 'nostroaccListing', jsfile: 'func.rpt.js', parm: '--', header: 'false', allowmultiwindow: 'false', funcdesc: 'Nostro Account Listing', accessmode: 'VX', isapproval: '0' },
  { functype: 'COMMRPT', item: '004.006', functionid: 'entitylisting', jsfile: 'func.rpt.js', parm: '--', header: 'false', allowmultiwindow: 'false', funcdesc: 'Entity Listing', accessmode: 'X', isapproval: '0' },
  { functype: 'COMMRPT', item: '004.010', functionid: 'fxaccountlisting', jsfile: 'func.rpt.js', parm: '--', header: 'false', allowmultiwindow: 'false', funcdesc: 'FX Account Listing', accessmode: 'X', isapproval: '0' },
  { functype: 'COMMRPT', item: '004.011', functionid: 'counterpartylisting', jsfile: 'func.rpt.js', parm: '--', header: 'false', allowmultiwindow: 'false', funcdesc: 'Counterparty  Listing', accessmode: 'X', isapproval: '0' },

  // ---- 005 Trade Report ----
  { functype: '', item: '005', functionid: 'tradereport', jsfile: '', parm: '--', header: 'true', allowmultiwindow: 'false', funcdesc: 'Trade Report', accessmode: '', isapproval: '0' },
  { functype: 'COMMRPT', item: '005.001', functionid: 'audittraildealcontract', jsfile: 'func.rpt.js', parm: '--', header: 'false', allowmultiwindow: 'false', funcdesc: 'Audit Trail Report - Deal and Contract', accessmode: 'X', isapproval: '0' },
  { functype: 'COMMRPT', item: '005.002', functionid: 'fxtransactionreport', jsfile: 'func.rpt.js', parm: '--', header: 'false', allowmultiwindow: 'false', funcdesc: 'FX Transaction Report', accessmode: 'X', isapproval: '0' },
  { functype: 'COMMRPT', item: '005.004', functionid: 'fxutilizationreport', jsfile: 'func.rpt.js', parm: '--', header: 'false', allowmultiwindow: 'false', funcdesc: 'FX Utilization Report', accessmode: 'X', isapproval: '0' },
  { functype: 'COMMRPT', item: '005.005', functionid: 'corpfxexceptionlogsreport', jsfile: 'func.rpt.js', parm: '--', header: 'false', allowmultiwindow: 'false', funcdesc: 'Corp Exception Logs Report', accessmode: 'X', isapproval: '0' },
  { functype: 'COMMRPT', item: '005.006', functionid: 'fx79l1rpt', jsfile: 'func.rpt.js', parm: '--', header: 'false', allowmultiwindow: 'false', funcdesc: 'Sundry Deal Contracted - ACU/DBU Report', accessmode: 'VX', isapproval: '0' },
  { functype: 'COMMRPT', item: '005.007', functionid: 'fx81l1rpt', jsfile: 'func.rpt.js', parm: '--', header: 'false', allowmultiwindow: 'false', funcdesc: 'Forex deal Contracted - ACU/DBU Report', accessmode: 'VX', isapproval: '0' },
  { functype: 'COMMRPT', item: '005.008', functionid: 'fx82l1rpt', jsfile: 'func.rpt.js', parm: '--', header: 'false', allowmultiwindow: 'false', funcdesc: 'Overdue FX deals Report', accessmode: 'VX', isapproval: '0' },
  { functype: 'COMMRPT', item: '005.009', functionid: 'approvallogreport', jsfile: 'func.rpt.js', parm: '--', header: 'false', allowmultiwindow: 'false', funcdesc: 'Approval Log Report', accessmode: 'X', isapproval: '0' },
  { functype: 'COMMRPT', item: '005.010', functionid: 'fxd564_1rpt', jsfile: 'func.rpt.js', parm: '--', header: 'false', allowmultiwindow: 'false', funcdesc: 'Manually created deals outstanding Report', accessmode: 'VX', isapproval: '0' },
  { functype: 'COMMRPT', item: '005.016', functionid: 'fx146rpt', jsfile: 'func.rpt.js', parm: '--', header: 'false', allowmultiwindow: 'false', funcdesc: 'FX Account Balance Report', accessmode: 'X', isapproval: '0' },
  { functype: 'COMMRPT', item: '005.017', functionid: 'fx61rpt', jsfile: 'func.rpt.js', parm: '--', header: 'false', allowmultiwindow: 'false', funcdesc: 'FX Optional Forward Report', accessmode: 'VX', isapproval: '0' },
  { functype: 'COMMRPT', item: '005.018', functionid: 'fxd579l1listofholrefrrecsprocrpt', jsfile: 'func.rpt.js', parm: '--', header: 'false', allowmultiwindow: 'false', funcdesc: 'List Of Holiday Refresh Records Processed Report', accessmode: 'X', isapproval: '0' },
  { functype: 'COMMRPT', item: '005.019', functionid: 'listofholrefredexcptrpt', jsfile: 'func.rpt.js', parm: '--', header: 'false', allowmultiwindow: 'false', funcdesc: 'Exception Report - List Of Holiday Refreshed', accessmode: 'X', isapproval: '0' },
  { functype: 'COMMRPT', item: '005.020', functionid: 'fx89l2rpt', jsfile: 'func.rpt.js', parm: '--', header: 'false', allowmultiwindow: 'false', funcdesc: 'Contracted FX Deal By FX Account Report', accessmode: 'VX', isapproval: '0' },
  { functype: 'COMMRPT', item: '005.021', functionid: 'fx83rpt', jsfile: 'func.rpt.js', parm: '--', header: 'false', allowmultiwindow: 'false', funcdesc: 'Forex Deal Settled – ACU/DBU Report', accessmode: 'VX', isapproval: '0' },
  { functype: 'COMMRPT', item: '005.022', functionid: 'fxd107l1rpt', jsfile: 'func.rpt.js', parm: '--', header: 'false', allowmultiwindow: 'false', funcdesc: 'New FX Account Opened - ACU/DBU Report', accessmode: 'VX', isapproval: '0' },
  { functype: 'COMMRPT', item: '005.023', functionid: 'FX587L1', jsfile: 'func.rpt.js', parm: '--', header: 'false', allowmultiwindow: 'false', funcdesc: 'Pre-Settlement Report', accessmode: 'X', isapproval: '0' },
  { functype: 'COMMRPT', item: '005.024', functionid: 'fxd565rpt', jsfile: 'func.rpt.js', parm: '--', header: 'false', allowmultiwindow: 'false', funcdesc: 'Outgoing Transactions From MPFX to MX - Insertion/ Deletion / Takeup / Takeup Reversal', accessmode: 'VX', isapproval: '0' },
  { functype: 'COMMRPT', item: '005.025', functionid: 'fxmmchargesinfo4datacontrolrpt', jsfile: 'func.rpt.js', parm: '--', header: 'false', allowmultiwindow: 'false', funcdesc: 'FX Charge Report', accessmode: 'X', isapproval: '0' },
  { functype: 'COMMRPT', item: '005.026', functionid: 'fxcontractnettingrpt', jsfile: 'func.rpt.js', parm: '--', header: 'false', allowmultiwindow: 'false', funcdesc: 'FX Contract Netting Report', accessmode: 'X', isapproval: '0' },
  { functype: 'COMMRPT', item: '005.027', functionid: 'glentriesrpt', jsfile: 'func.rpt.js', parm: '--', header: 'false', allowmultiwindow: 'false', funcdesc: 'GL Entries Report', accessmode: 'X', isapproval: '0' },
  { functype: 'COMMRPT', item: '005.029', functionid: 'generalledgerpostinglist1', jsfile: 'func.rpt.js', parm: '--', header: 'false', allowmultiwindow: 'false', funcdesc: 'General Ledger Posting List (1)', accessmode: 'X', isapproval: '0' },
  { functype: 'COMMRPT', item: '005.031', functionid: 'generalledgerpostinglist2', jsfile: 'func.rpt.js', parm: '--', header: 'false', allowmultiwindow: 'false', funcdesc: 'General Ledger Posting List (2)', accessmode: 'X', isapproval: '0' },
  { functype: 'COMMRPT', item: '005.032', functionid: 'fxdmtdtofxrpt', jsfile: 'func.rpt.js', parm: '--', header: 'false', allowmultiwindow: 'false', funcdesc: 'MTPAYFX_FX', accessmode: 'X', isapproval: '0' },
  { functype: 'COMMRPT', item: '005.033', functionid: 'mpfxtradeconfirmationrpt', jsfile: 'func.rpt.js', parm: '--', header: 'false', allowmultiwindow: 'false', funcdesc: 'Trade Confirmation - Ad-Hoc Request', accessmode: 'VX', isapproval: '0' },

  // ---- 006 Approval ----
  { functype: '', item: '006', functionid: 'approval', jsfile: '', parm: '--', header: 'true', allowmultiwindow: 'false', funcdesc: 'Approval', accessmode: '', isapproval: '0' },
  { functype: '', item: '006.002', functionid: 'batchapprovalreq', jsfile: 'func.batchApprovalReq.js', parm: '--', header: 'false', allowmultiwindow: 'false', funcdesc: 'Approval Maker', accessmode: 'V', isapproval: '0' },
];

export const getUserMenu: MockHandler = (_req) => {
  return {
    n: 'userAccessGridMsg_GetUserMenu',
    sts: 0,
    hvb: MOCK_MENU_ITEMS as unknown as Record<string, unknown>[],
    mhvb: {},
  } as NetMessage;
};
