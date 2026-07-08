import type { NetMessage } from '../../types';
import type { MockHandler } from '../types';

/**
 * 将日期格式化为 YYYYMMDD，对齐真实后端 sysdate 格式。
 */
const toSysDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
};

/**
 * sysParamSetupGridMsg_GetSysDate —— 获取系统日期/机构信息。
 *
 * 前端 useSystemInfo 读取响应 hvb[0] 作为 SystemInfo，字段需对齐
 * SystemInfo 类型（src/types/index.ts）。
 */
export const getSysDate: MockHandler = (_req) => {
  const today = new Date();
  return {
    n: 'sysParamSetupGridMsg_GetSysDate',
    sts: 0,
    hvb: [
      {
        sysdate: toSysDate(today),       // YYYYMMDD
        entityCode: 'SETTOCBC',          // 机构代码
        entityName: 'Settlement to CBC', // 机构名称
        systemCode: 'MFXDBMAIN',         // 系统代码
        localCcy: 'HKD',                 // 本地货币
        sysEnv: 'Development',           // 系统环境
      },
    ],
    mhvb: {},
  } as NetMessage;
};

/**
 * loginSessionGridMsg_Logout —— 登出。
 * 前端 logout() 只校验 sts===0，返回空数据即可。
 */
export const logout: MockHandler = (_req) => {
  return {
    n: 'loginSessionGridMsg_Logout',
    sts: 0,
    hvb: [],
    mhvb: {},
  } as NetMessage;
};
