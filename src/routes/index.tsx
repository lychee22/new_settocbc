import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import BasicLayout from '../pages/Layout/BasicLayout';
import LoginPage from '../pages/Login';
import { useAuthStore } from '../stores/authStore';

// 认证守卫组件 - 需要登录
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/new-login" replace />;
  }

  return <>{children}</>;
};

// 登录页守卫 - 已登录则跳转到 admin
const RequireGuest: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <BrowserRouter>
      <Routes>
        {/* 登录页 - 未登录才能访问 */}
        <Route
          path="/new-login"
          element={
            <RequireGuest>
              <LoginPage />
            </RequireGuest>
          }
        />

        {/* 管理后台 - 需要登录，页面在 Tab 中管理 */}
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <BasicLayout collapsed={collapsed} setCollapsed={setCollapsed} />
            </RequireAuth>
          }
        />

        {/* 默认重定向 */}
        <Route path="/" element={<Navigate to="/new-login" replace />} />
        <Route path="*" element={<Navigate to="/new-login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
