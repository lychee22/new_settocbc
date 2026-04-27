import React from 'react';
import { ConfigProvider } from 'antd';
import AppRoutes from './routes';
import { useSessionTimeout } from './hooks/useSessionTimeout';

// Session timeout manager component
const SessionTimeoutManager: React.FC = () => {
  useSessionTimeout();
  return null;
};

const App: React.FC = () => {
  return (
    <ConfigProvider>
      <SessionTimeoutManager />
      <AppRoutes />
    </ConfigProvider>
  );
};

export default App;
