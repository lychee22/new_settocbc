import React from 'react';
import { Layout, Menu, Button, Dropdown, Space } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useNavigate, Outlet } from 'react-router-dom';
import type { MenuProps } from 'antd';

const { Header, Sider, Content } = Layout;

interface BasicLayoutProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const BasicLayout: React.FC<BasicLayoutProps> = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();

  // 静态菜单配置 - 后续从后端获取
  const menuItems: MenuProps['items'] = [
    {
      key: 'master-setup',
      label: 'Master Setup',
      children: [
        {
          key: '/admin/master/curr-setup',
          label: 'Currency Setup',
          onClick: () => navigate('/admin/master/curr-setup'),
        },
        {
          key: '/admin/master/curr-pair-setup',
          label: 'Currency Pair Setup',
          onClick: () => navigate('/admin/master/curr-pair-setup'),
        },
        {
          key: '/admin/master/counter-party-setup',
          label: 'Counter Party Setup',
          onClick: () => navigate('/admin/master/counter-party-setup'),
        },
        {
          key: '/admin/master/gl-posting-setup',
          label: 'GL Posting Setup',
          onClick: () => navigate('/admin/master/gl-posting-setup'),
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
          onClick: () => navigate('/admin/inquiry/fx-utilization'),
        },
      ],
    },
  ];

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
      onClick: () => {
        window.location.href = '/bologin.jsp';
      },
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={220}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
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
          }}
        >
          {collapsed ? 'BO' : 'BackOffice'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['1']}
          items={menuItems}
        />
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 220, transition: 'margin-left 0.2s' }}>
        <Header
          style={{
            padding: '0 16px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          }}
        >
          <Space>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
            />
          </Space>

          <Space>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <UserOutlined />
                <span>User</span>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content style={{ margin: 16, padding: 16, background: '#fff', minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default BasicLayout;
