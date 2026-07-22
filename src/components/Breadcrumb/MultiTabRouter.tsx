import React from 'react';
import { useTabStore } from '../../stores/tabStore';
import type { Tab } from '../../stores/tabStore';

// 页面组件
import CurrSetup from '../../pages/MasterSetup/CurrSetup';
import CurrPairSetup from '../../pages/MasterSetup/CurrPairSetup';
import CounterPartySetup from '../../pages/MasterSetup/CounterPartySetup';
import GlPostingSetup from '../../pages/MasterSetup/GlPostingSetup';
import FxUtilizationInq from '../../pages/Inquiry/FxUtilizationInq';
import Count from '../../pages/Learn/Count';

// 页面配置
const PAGE_CONFIG: Record<string, { title: string; component: React.ComponentType }> = {
  '/admin/master/curr-setup': { title: 'Currency Setup', component: CurrSetup },
  '/admin/master/curr-pair-setup': { title: 'Currency Pair Setup', component: CurrPairSetup },
  '/admin/master/counter-party-setup': { title: 'Counter Party Setup', component: CounterPartySetup },
  '/admin/master/gl-posting-setup': { title: 'GL Posting Setup', component: GlPostingSetup },
  '/admin/inquiry/fx-utilization': { title: 'FX Utilization', component: FxUtilizationInq },
  '/admin/count': {title:'Count', component: Count}
};

// 获取页面配置
export function getPageConfig(path: string): { title: string; component: React.ComponentType } | null {
  return PAGE_CONFIG[path] || null;
}

// 注册新页面（打开新 tab）
export function usePageRegister() {
  const { addTab } = useTabStore();

  const registerPage = (path: string) => {
    const config = getPageConfig(path);
    if (!config) return;

    const tab: Tab = {
      key: path,
      title: config.title,
      path: path,
      isClosable: true,
    };

    addTab(tab);
  };

  return { registerPage };
}

// 多 Tab 路由组件
const MultiTabRouter: React.FC = () => {
  const { tabs, activeTabKey } = useTabStore();

  return (
    <div className="multi-tab-content">
      {tabs.map((tab) => {
        const config = getPageConfig(tab.key);
        if (!config) return null;

        const PageComponent = config.component;

        return (
          <div
            key={tab.key}
            className={`tab-page ${activeTabKey === tab.key ? 'active' : ''}`}
            style={{
              display: activeTabKey === tab.key ? 'block' : 'none',
              height: '100%',
            }}
          >
            <PageComponent />
          </div>
        );
      })}
    </div>
  );
};

export default MultiTabRouter;
