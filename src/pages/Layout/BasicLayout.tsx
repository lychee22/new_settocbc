import React from 'react';
import { Layout, Menu, Button, Dropdown, Space, Typography } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useAuthStore } from '../../stores/authStore';
import { useSystemInfo } from '../../hooks/useSystemInfo';
import { logout as logoutApi } from '../../api/request';
import { useTabStore } from '../../stores/tabStore';
import type { Tab } from '../../stores/tabStore';
import TabBar from '../../components/Breadcrumb/TabBar';
import MultiTabRouter, { getPageConfig } from '../../components/Breadcrumb/MultiTabRouter';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface BasicLayoutProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

// 格式化日期 (YYYYMMDD -> YYYY-MM-DD)
const formatDate = (dateStr: string): string => {
  if (!dateStr || dateStr.length !== 8) return dateStr;
  return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
};

const BasicLayout: React.FC<BasicLayoutProps> = ({ collapsed, setCollapsed }) => {
  const session = useAuthStore((state) => state.session);
  const systemInfo = useSystemInfo();
  const logout = useAuthStore((state) => state.logout);
  const { addTab } = useTabStore();

  // 打开页面（注册 Tab）
  const openPage = (path: string) => {
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

  // 菜单配置
  const menuItems: MenuProps['items'] = [
    {
      key: 'master-setup',
      label: 'Master Setup',
      children: [
        {
          key: '/admin/master/curr-setup',
          label: 'Currency Setup',
          onClick: () => openPage('/admin/master/curr-setup'),
        },
        {
          key: '/admin/master/curr-pair-setup',
          label: 'Currency Pair Setup',
          onClick: () => openPage('/admin/master/curr-pair-setup'),
        },
        {
          key: '/admin/master/counter-party-setup',
          label: 'Counter Party Setup',
          onClick: () => openPage('/admin/master/counter-party-setup'),
        },
        {
          key: '/admin/master/gl-posting-setup',
          label: 'GL Posting Setup',
          onClick: () => openPage('/admin/master/gl-posting-setup'),
        },
      ],
    },
    {
      key: 'inquiry',
      label: 'Inquiry',
      children: [
        {
          key: '/admin/inquiry/fx-utilization',
          label: 'FX Utilization',
          onClick: () => openPage('/admin/inquiry/fx-utilization'),
        },
      ],
    },
    {
      key: 'learn',
      label: 'Learn',
      children: [
        {
          key: '/admin/count',
          label: 'Count',
          onClick: () => openPage('/admin/count'),
        },
      ],
    },
  ];

  // 登出处理
  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      logout();
      window.location.href = '/bologin.jsp';
    }
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
      onClick: handleLogout,
    },
  ];

  // 用户信息显示
  const userDisplay = session?.loginID || '';
  const envDisplay = systemInfo?.systemCode || '';
  const entityDisplay = systemInfo?.entityName || '';
  const sysEnvDisplay = systemInfo?.sysEnv || 'Development';
  const sysDateDisplay = systemInfo?.sysdate ? formatDate(systemInfo.sysdate) : '';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 左侧边栏 - 固定定位 */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={220}
        collapsedWidth={80}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        {/* Logo 区域 */}
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: collapsed ? 14 : 16,
            fontWeight: 'bold',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            flexShrink: 0,
          }}
        >
          {collapsed ? 'BO' : 'BackOffice'}
        </div>
        {/* 菜单 */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={['1']}
            items={menuItems}
            style={{ height: '100%', borderRight: 0 }}
          />
        </div>
      </Sider>

      {/* 主内容区域 */}
      <Layout style={{ marginLeft: collapsed ? 80 : 220, transition: 'margin-left 0.2s' }}>
        {/* 顶部 Header */}
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            position: 'sticky',
            top: 0,
            zIndex: 2,
          }}
        >
          <Space size="middle" align="start">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
            />
            {/* 用户信息区域 */}
            <Space size="small">
              <Text strong style={{ fontSize: 14 }}>
                FXCORE MultiPayFX{entityDisplay && ` ~ ${entityDisplay}`}
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {userDisplay} @ {envDisplay} ({sysEnvDisplay}) | System Date: {sysDateDisplay}
              </Text>
            </Space>
          </Space>

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <UserOutlined />
              <span>{userDisplay}</span>
            </Space>
          </Dropdown>
        </Header>

        {/* Tab 标签页 */}
        <TabBar />

        {/* 页面内容 - 多 Tab 内容区 */}
        <Content
          style={{
            margin: '0px 16px',
            padding: 16,
            background: '#fff',
            overflow: 'auto',
          }}
        >
          <MultiTabRouter />
        </Content>
      </Layout>
    </Layout>
  );
};

export default BasicLayout;
