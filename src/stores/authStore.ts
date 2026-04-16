import { create } from 'zustand';
import type { UserSession } from '../types';

interface AuthState {
  isAuthenticated: boolean;
  session: UserSession | null;
  login: (session: UserSession) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  session: null,

  login: (session: UserSession) => {
    set({
      isAuthenticated: true,
      session,
    });
  },

  logout: () => {
    set({
      isAuthenticated: false,
      session: null,
    });
  },
}));

export default useAuthStore;
