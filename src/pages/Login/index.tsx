import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Checkbox, message, Card } from 'antd';
import { UserOutlined, LockOutlined, GlobalOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { login as loginApi } from '../../api/request';
import { useAuthStore } from '../../stores/authStore';
import { getSavedUsername, saveUsername } from '../../utils/storage';

const { Option } = Select;

interface LoginForm {
  username: string;
  password: string;
  language: number;
  rememberMe?: boolean;
}

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [savedUsername, setSavedUsername] = useState('');
  const navigate = useNavigate();
  const { login: setAuthLogin } = useAuthStore();

  // Load saved username on mount
  useEffect(() => {
    const username = getSavedUsername();
    setSavedUsername(username);
  }, []);

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
        }

        // 存储登录信息到 zustand（用于后续 API 调用）
        setAuthLogin({
          loginID: values.username,
          env: '',
          sessionKey: result.sessionKey || '',
          language: values.language,
          entityCode: '',
          entityName: '',
        });

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
              username: savedUsername,
              language: 0,
              rememberMe: !!savedUsername,
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
