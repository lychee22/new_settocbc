import React from 'react';
import { ConfigProvider } from 'antd';
import AppRoutes from './routes';

const App: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#C2525F',
        },
      }}
    >
      <AppRoutes />
    </ConfigProvider>
  );
};

export default App;
