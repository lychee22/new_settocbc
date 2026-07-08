/**
 * 菜单状态管理。
 *
 * 职责：
 * 1. 存储后端返回的扁平菜单数据（rawItems）
 * 2. 构建树形结构（tree）供 antd Menu 渲染
 * 3. 记录加载状态（loaded/loading/error）
 *
 * 拉取时机：登录成功后由 LoginPage 调用 menu.getUserMenu() → setMenu()，
 * 同时 useMenu hook 作为兜底（进 BasicLayout 后若未加载则拉取）。
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RawMenuItem, MenuTreeNode } from '../types/api/menu';

/**
 * 把扁平菜单数据按 item 路径编码构建成树。
 *
 * 父子推导规则（比旧 ui.js 的 slice(0,-4) 更稳健）：
 *   parentItem = item.split('.').slice(0, -1).join('.')
 *
 * 示例：
 *   "001"          → ""         （顶层）
 *   "001.001"      → "001"      （父 = Master Setup）
 *   "002.007.001"  → "002.007"  （父 = CNR Entry）
 *
 * 算法保证：
 * - 先按 item 长度排序，确保父节点先于子节点创建
 * - 用 Map 索引 O(n) 查找父节点
 * - 子节点 push 到父节点的 children 数组
 */
export function buildMenuTree(items: RawMenuItem[]): MenuTreeNode[] {
  // 1. 排序：短路径（父）在前，同长度按字符串序
  const sorted = [...items].sort(
    (a, b) => a.item.length - b.item.length || a.item.localeCompare(b.item)
  );

  // 2. Map 索引：item → node
  const map = new Map<string, MenuTreeNode>();
  const roots: MenuTreeNode[] = [];

  // 3. 遍历构建
  for (const raw of sorted) {
    const node: MenuTreeNode = {
      key: raw.item,
      label: raw.funcdesc,
      isHeader: raw.header === 'true',
      functionid: raw.header === 'false' ? raw.functionid : undefined,
      accessmode: raw.accessmode || undefined,
      functype: raw.functype || undefined,
      children: [],
    };
    map.set(raw.item, node);

    const parentItem = raw.item.split('.').slice(0, -1).join('.');
    const parent = parentItem ? map.get(parentItem) : undefined;
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

interface MenuState {
  /** 后端原始扁平数据 */
  rawItems: RawMenuItem[];
  /** 构建好的树形结构 */
  tree: MenuTreeNode[];
  /** 是否已加载（避免重复拉取） */
  loaded: boolean;
  /** 是否正在加载 */
  loading: boolean;
  /** 加载错误信息 */
  error: string | null;

  /** 设置菜单数据并自动构建树 */
  setMenu: (items: RawMenuItem[]) => void;
  /** 设置加载状态 */
  setLoading: (loading: boolean) => void;
  /** 设置错误 */
  setError: (error: string | null) => void;
  /** 清空（登出时调用） */
  clear: () => void;
}

const initialState = {
  rawItems: [] as RawMenuItem[],
  tree: [] as MenuTreeNode[],
  loaded: false,
  loading: false,
  error: null as string | null,
};

export const useMenuStore = create<MenuState>()(
  persist(
    (set) => ({
      ...initialState,

      setMenu: (items: RawMenuItem[]) => {
        set({
          rawItems: items,
          tree: buildMenuTree(items),
          loaded: true,
          loading: false,
          error: null,
        });
      },

      setLoading: (loading: boolean) => set({ loading }),
      setError: (error: string | null) =>
        set({ error, loading: false, loaded: false }),

      clear: () => set({ ...initialState }),
    }),
    {
      name: 'settocbc-menu-storage',
      partialize: (state) => ({
        rawItems: state.rawItems,
        tree: state.tree,
        loaded: state.loaded,
      }),
    }
  )
);

export default useMenuStore;
