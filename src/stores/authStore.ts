import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserSession, SystemInfo } from '../types';

interface AuthState {
  isAuthenticated: boolean;
  session: UserSession | null;
  systemInfo: SystemInfo | null;
  lastActivityTime: number | null;
  login: (session: UserSession) => void;
  logout: () => void;
  updateActivity: () => void;
  setSystemInfo: (info: SystemInfo) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      session: null,
      systemInfo: null,
      lastActivityTime: null,

      login: (session: UserSession) => {
        set({
          isAuthenticated: true,
          session,
          lastActivityTime: Date.now(),
        });
      },

      logout: () => {
        set({
          isAuthenticated: false,
          session: null,
          systemInfo: null,
          lastActivityTime: null,
        });
      },

      updateActivity: () => {
        const state = get();
        if (state.isAuthenticated) {
          set({ lastActivityTime: Date.now() });
        }
      },

      setSystemInfo: (info: SystemInfo) => {
        set({ systemInfo: info });
      },
    }),
    {
      name: 'settocbc-auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        session: state.session,
        systemInfo: state.systemInfo,
        lastActivityTime: state.lastActivityTime,
      }),
    }
  )
);

// Session timeout configuration
const SESSION_TIMEOUT = 10 * 60 * 1000;
const WARNING_BEFORE_TIMEOUT = 60 * 1000;

export function isSessionExpired(lastActivityTime: number | null): boolean {
  if (!lastActivityTime) return true;
  return Date.now() - lastActivityTime > SESSION_TIMEOUT;
}

export function shouldShowWarning(lastActivityTime: number | null): boolean {
  if (!lastActivityTime) return false;
  const timeElapsed = Date.now() - lastActivityTime;
  return timeElapsed >= SESSION_TIMEOUT - WARNING_BEFORE_TIMEOUT && timeElapsed < SESSION_TIMEOUT;
}

export function getRemainingTime(lastActivityTime: number | null): number {
  if (!lastActivityTime) return 0;
  const elapsed = Date.now() - lastActivityTime;
  return Math.max(0, SESSION_TIMEOUT - elapsed);
}

export default useAuthStore;
