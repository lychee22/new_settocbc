import React from 'react';
import { Tabs } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { useTabStore } from '../../stores/tabStore';
import './TabBar.css';

const { TabPane } = Tabs;

interface TabBarProps {
  onTabChange?: (key: string) => void;
}

const TabBar: React.FC<TabBarProps> = ({ onTabChange }) => {
  const { tabs, activeTabKey, setActiveTab, removeTab } = useTabStore();

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    onTabChange?.(key);
  };

  const handleTabClose = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeTab(key);
  };

  return (
    <div className="tab-bar">
      <Tabs
        activeKey={activeTabKey}
        onChange={handleTabChange}
        type="card"
        size="small"
        hideAdd
      >
        {tabs.map((tab) => (
          <TabPane
            key={tab.key}
            tab={
              <span className="tab-title">
                {tab.key === '/admin' && <HomeOutlined />}
                {tab.title}
                {tab.isClosable && (
                  <span
                    className="tab-close"
                    onClick={(e) => handleTabClose(tab.key, e)}
                  >
                    ×
                  </span>
                )}
              </span>
            }
            closable={tab.isClosable}
          />
        ))}
      </Tabs>
    </div>
  );
};

export default TabBar;
