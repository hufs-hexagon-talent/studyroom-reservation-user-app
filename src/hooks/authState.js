import { atom } from 'recoil';

const localStorageEffect = key => ({ setSelf, onSet }) => {
  const savedValue = localStorage.getItem(key);
  if (savedValue != null) {
    setSelf(JSON.parse(savedValue));
  }

  onSet(newValue => {
    if (newValue) {
      localStorage.setItem(key, JSON.stringify(newValue));
    } else {
      localStorage.removeItem(key);
    }
  });
};

export const authState = atom({
  key: 'authState',
  default: {
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
  },
  effects: [localStorageEffect('authState')],
});
