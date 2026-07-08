/**
 * Menu 模块 API。
 *
 * 对应后端 `userAccessGridMsg_GetUserMenu` 接口。
 * 请求无需 hvb 参数（用户身份由服务端 session 决定，登录时已存库）。
 *
 * 数据源：真实响应样本 getmenu.txt（TEST_MAKER_N2 账号）。
 */

import { sendAuthRequest } from '../request';
import type { NetMessage } from '../../types';
import type { RawMenuItem } from '../../types/api/menu';

export const menu = {
  /**
   * 获取当前登录用户的动态菜单。
   *
   * NetMessage: `userAccessGridMsg_GetUserMenu`
   * 请求：无 hvb（用户身份由 session 决定）
   * 响应：`hvb` 为扁平 RawMenuItem[]，前端自行构建树（见 menuStore.buildMenuTree）。
   */
  async getUserMenu(): Promise<RawMenuItem[]> {
    const resp = await sendAuthRequest<NetMessage>({
      n: 'userAccessGridMsg_GetUserMenu',
    });
    return (resp.hvb ?? []) as unknown as RawMenuItem[];
  },
};

export default menu;
