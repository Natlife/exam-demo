import { useState } from 'react';

function useSessionStorage<T>(key: string, initialValue: T) {
  // Hàm lấy giá trị từ sessionStorage
  const readValue = (): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.sessionStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  };

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Hàm cập nhật giá trị
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Cho phép giá trị là một function (giống cách dùng của useState)
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      setStoredValue(valueToStore);

      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch {}
  };

  return [storedValue, setValue] as const;
}

export default useSessionStorage;
