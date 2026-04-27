import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { getSystemInfo as getSystemInfoApi } from '../api/request';

export function useSystemInfo() {
  const { session, systemInfo, setSystemInfo, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // If authenticated and no system info, fetch it
    if (isAuthenticated && session && !systemInfo) {
      getSystemInfoApi()
        .then((info) => {
          setSystemInfo(info);
        })
        .catch((error) => {
          console.error('Failed to load system info:', error);
        });
    }
  }, [isAuthenticated, session, systemInfo, setSystemInfo]);

  return systemInfo;
}

export default useSystemInfo;
