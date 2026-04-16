import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import BasicLayout from '../pages/Layout/BasicLayout';
import LoginPage from '../pages/Login';
import CurrSetup from '../pages/MasterSetup/CurrSetup';
import CurrPairSetup from '../pages/MasterSetup/CurrPairSetup';
import CounterPartySetup from '../pages/MasterSetup/CounterPartySetup';
import GlPostingSetup from '../pages/MasterSetup/GlPostingSetup';
import FxUtilizationInq from '../pages/Inquiry/FxUtilizationInq';
import { useAuthStore } from '../stores/authStore';

// 认证守卫组件
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/new-login" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <BrowserRouter>
      <Routes>
        {/* 登录页 */}
        <Route path="/new-login" element={<LoginPage />} />

        {/* 管理后台 - 带布局 */}
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <BasicLayout collapsed={collapsed} setCollapsed={setCollapsed} />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="/admin" replace />} />

          {/* Master Setup 模块 */}
          <Route path="master/curr-setup" element={<CurrSetup />} />
          <Route path="master/curr-pair-setup" element={<CurrPairSetup />} />
          <Route path="master/counter-party-setup" element={<CounterPartySetup />} />
          <Route path="master/gl-posting-setup" element={<GlPostingSetup />} />

          {/* Inquiry 模块 */}
          <Route path="inquiry/fx-utilization" element={<FxUtilizationInq />} />
        </Route>

        {/* 默认重定向 */}
        <Route path="/" element={<Navigate to="/new-login" replace />} />
        <Route path="*" element={<Navigate to="/new-login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
