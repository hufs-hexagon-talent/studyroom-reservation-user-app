import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './authStore';

describe('authStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({
      isAuthenticated: false,
      isPasswordChangeRequired: false,
    });
  });

  it('초기 상태는 미인증', () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isPasswordChangeRequired).toBe(false);
  });

  it('login()으로 인증 상태 전환', () => {
    useAuthStore.getState().login();
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it('logout()으로 모든 상태 초기화', () => {
    useAuthStore.getState().login();
    useAuthStore.getState().setPasswordChangeRequired(true);
    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isPasswordChangeRequired).toBe(false);
  });

  it('비밀번호 변경 필요 상태 설정', () => {
    useAuthStore.getState().setPasswordChangeRequired(true);
    expect(useAuthStore.getState().isPasswordChangeRequired).toBe(true);
  });
});
