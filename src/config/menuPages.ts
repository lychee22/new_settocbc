/**
 * functionid → React 页面组件映射表。
 *
 * 后端 `userAccessGridMsg_GetUserMenu` 返回的每个叶子菜单项都带一个 `functionid`
 * （全小写，如 `currsetup`、`fxutilizationinq`）。旧前端据此动态加载 jsfile；
 * 新项目 React 改用静态映射表查表。
 *
 * - 命中映射表 → 菜单项可点击，点击开 Tab 显示对应页面
 * - 未命中 → 菜单项灰显（disabled），title 提示"功能开发中"
 *
 * 后续新增业务模块时，在此表追加一行即可。
 */

import type React from 'react';

// 页面组件
import CurrSetup from '../pages/MasterSetup/CurrSetup';
import CurrPairSetup from '../pages/MasterSetup/CurrPairSetup';
import CounterPartySetup from '../pages/MasterSetup/CounterPartySetup';
import GlPostingSetup from '../pages/MasterSetup/GlPostingSetup';
import FxUtilizationInq from '../pages/Inquiry/FxUtilizationInq';

export interface PageEntry {
  /** Tab 标题 */
  title: string;
  /** 页面组件 */
  component: React.ComponentType;
  /** Tab 的 path key（唯一，用于 Tab 系统） */
  path: string;
}

/**
 * functionid（全小写） → 页面配置映射。
 *
 * functionid 值来自后端真实响应样本（getmenu.txt）。
 */
export const FUNCTIONID_TO_PAGE: Record<string, PageEntry> = {
  // ---- Master Setup ----
  currsetup: {
    title: 'Currency Setup',
    component: CurrSetup,
    path: '/admin/master/curr-setup',
  },
  currpairsetup: {
    title: 'CurrencyPair Setup',
    component: CurrPairSetup,
    path: '/admin/master/curr-pair-setup',
  },
  counterpartysetup: {
    title: 'Counterparty Setup',
    component: CounterPartySetup,
    path: '/admin/master/counter-party-setup',
  },
  glpostingsetup: {
    title: 'GL Posting Setup',
    component: GlPostingSetup,
    path: '/admin/master/gl-posting-setup',
  },
  // ---- Inquiry ----
  fxutilizationinq: {
    title: 'FX Utilization Inquiry',
    component: FxUtilizationInq,
    path: '/admin/inquiry/fx-utilization',
  },
};

/** 判断 functionid 是否有对应页面（已实现）。 */
export function isFunctionImplemented(functionid: string): boolean {
  return functionid in FUNCTIONID_TO_PAGE;
}

/** 查询 functionid 对应的页面配置，未实现返回 undefined。 */
export function getPageByFunctionId(functionid: string): PageEntry | undefined {
  return FUNCTIONID_TO_PAGE[functionid];
}
