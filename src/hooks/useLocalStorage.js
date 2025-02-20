import { useState, useEffect } from 'react';

export function useLocalStorage(key, initialState) {
  const [state, setState] = useState(() => {
    const data = window.localStorage.getItem(key);
    return data ? data : initialState;
  });

  useEffect(() => {
    window.localStorage.setItem(key, state);
  }, [key, state]);

  return [state, setState];
}
