import { create } from 'zustand';

export interface Tab {
  key: string;           // 唯一标识 (路由路径)
  title: string;         // 显示标题
  path: string;          // 路由路径
  isClosable: boolean;   // 是否可关闭
}

interface TabState {
  tabs: Tab[];
  activeTabKey: string;
  addTab: (tab: Tab) => void;
  removeTab: (key: string) => void;
  setActiveTab: (key: string) => void;
  getActiveTab: () => Tab | undefined;
}

// 默认打开的首页 tab
const DEFAULT_HOME_TAB: Tab = {
  key: '/admin',
  title: 'Home',
  path: '/admin',
  isClosable: false,
};

export const useTabStore = create<TabState>((set, get) => ({
  tabs: [DEFAULT_HOME_TAB],
  activeTabKey: DEFAULT_HOME_TAB.key,

  addTab: (tab: Tab) => {
    set((state) => {
      // 如果已存在，直接激活
      const existingTab = state.tabs.find((t) => t.key === tab.key);
      if (existingTab) {
        return { activeTabKey: tab.key };
      }
      // 添加新 tab
      return {
        tabs: [...state.tabs, tab],
        activeTabKey: tab.key,
      };
    });
  },

  removeTab: (key: string) => {
    set((state) => {
      // 不能关闭不可关闭的 tab
      const tab = state.tabs.find((t) => t.key === key);
      if (tab && !tab.isClosable) {
        return state;
      }

      const tabIndex = state.tabs.findIndex((t) => t.key === key);
      const newTabs = state.tabs.filter((t) => t.key !== key);

      // 如果关闭的是当前激活的 tab，激活上一个或下一个
      let newActiveKey = state.activeTabKey;
      if (state.activeTabKey === key && newTabs.length > 0) {
        const newIndex = tabIndex > 0 ? tabIndex - 1 : 0;
        newActiveKey = newTabs[newIndex].key;
      }

      return {
        tabs: newTabs,
        activeTabKey: newActiveKey,
      };
    });
  },

  setActiveTab: (key: string) => {
    set({ activeTabKey: key });
  },

  getActiveTab: () => {
    const state = get();
    return state.tabs.find((t) => t.key === state.activeTabKey);
  },
}));

export default useTabStore;
