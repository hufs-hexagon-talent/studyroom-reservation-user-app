import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  isAuthenticated: boolean;
  isPasswordChangeRequired: boolean;
  login: () => void;
  logout: () => void;
  setPasswordChangeRequired: (required: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      isPasswordChangeRequired: false,
      login: () => set({ isAuthenticated: true }),
      logout: () => set({ isAuthenticated: false, isPasswordChangeRequired: false }),
      setPasswordChangeRequired: (required) =>
        set({ isPasswordChangeRequired: required }),
    }),
    {
      name: 'authState',
      skipHydration: true,
    },
  ),
);
