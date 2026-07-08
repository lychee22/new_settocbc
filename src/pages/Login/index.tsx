import React, { useState } from 'react';
import { Form, Input, Button, Select, Checkbox, message, Card } from 'antd';
import { UserOutlined, LockOutlined, GlobalOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { login as loginApi } from '../../api/request';
import { menu as menuApi } from '../../api/modules/menu';
import { useAuthStore } from '../../stores/authStore';
import { useMenuStore } from '../../stores/menuStore';
import {
  clearSavedUsername,
  getSavedUsername,
  saveUsername,
} from '../../utils/storage';
import type { UserSession } from '../../types';

const { Option } = Select;

interface LoginForm {
  username: string;
  password: string;
  language: number;
  rememberMe?: boolean;
}

/**
 * 同步读取已存用户名，作为 Form initialValues。
 *
 * 注意：必须同步读取，不能放进 useEffect 异步 setState。
 * 原因：antd Form 的 initialValues 只在首次挂载时生效，
 * 若用 useState + useEffect 异步填充，首次渲染时值为空字符串，
 * state 更新后 initialValues 不会重新应用 → 用户名永远填不进去。
 */
const SAVED_USERNAME = getSavedUsername();

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login: setAuthLogin } = useAuthStore();
  const { setMenu } = useMenuStore();

  const onFinish = async (values: LoginForm) => {
    setLoading(true);
    try {
      const result = await loginApi(
        values.username,
        values.password,
        values.language
      );
      console.log('----result:', result)
      if (result.ok) {
        message.success('Login success! Redirecting...');

        // Save username if remember me is checked
        if (values.rememberMe) {
          saveUsername(values.username);
        } else {
          // 取消勾选时清除已存用户名
          clearSavedUsername();
        }

        // 存储登录信息到 zustand（用于后续 API 调用）
        // env/version/systemCode/entityCode/entityName/localCcy：登录接口返回
        // （真实环境来自 GetSessionKeyServlet，后端 validateBOVersion 校验）
        // 这些字段是业务请求 NetMsgMeta 必填，否则后端返回 -10110003。
        const session: UserSession = {
          loginID: values.username,
          env: result.env || '',
          sessionKey: result.sessionKey || '',
          language: values.language,
          entityCode: result.entityCode || '',
          entityName: result.entityName || '',
          systemCode: result.systemCode || '',
          localCcy: result.localCcy || '',
          version: result.version || '',
        };
        setAuthLogin(session);

        // 登录成功后立即拉取动态菜单（存入 menuStore）。
        // 失败不阻塞跳转，进 BasicLayout 后 useMenu hook 会兜底重试。
        try {
          const items = await menuApi.getUserMenu();
          setMenu(items);
        } catch (menuErr) {
          // eslint-disable-next-line no-console
          console.warn(
            '[Login] 菜单加载失败，将由 useMenu 重试：',
            menuErr instanceof Error ? menuErr.message : menuErr
          );
        }

        setTimeout(() => {
          navigate('/admin');
        }, 500);
      } else {
        message.error(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      message.error('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Card
        style={{
          width: 400,
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          borderRadius: 8,
        }}
        bodyStyle={{ padding: 0 }}
      >
        <div
          style={{
            background: '#1677ff',
            color: 'white',
            padding: '24px',
            textAlign: 'center',
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
          }}
        >
          <h2 style={{ margin: 0, color: 'white' }}>MultiPayFX Settlement</h2>
          <p style={{ margin: '8px 0 0', opacity: 0.9 }}>BackOffice System</p>
        </div>

        <div style={{ padding: 24 }}>
          <Form
            name="login"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
            initialValues={{
              username: SAVED_USERNAME,
              language: 0,
              rememberMe: !!SAVED_USERNAME,
            }}
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: 'Please input your Username!' }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="Username"
                size="large"
                maxLength={30}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please input your Password!' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="Password"
                size="large"
                maxLength={30}
              />
            </Form.Item>

            <Form.Item name="language" rules={[{ required: true }]}>
              <Select
                prefix={<GlobalOutlined style={{ color: '#bfbfbf' }} />}
                size="large"
              >
                <Option value={0}>English</Option>
                <Option value={1}>繁體中文</Option>
              </Select>
            </Form.Item>

            <Form.Item name="rememberMe" valuePropName="checked" style={{ marginBottom: 16 }}>
              <Checkbox>Remember Username</Checkbox>
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
              >
                Login
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
