export const getLS = <T>(field: string): T | null => {
  const item = localStorage.getItem(field);
  return item ? JSON.parse(item) : null;
};

export const setLS = <T>(field: string, value: T): void =>
  localStorage.setItem(field, JSON.stringify(value));

export const getSS = <T>(field: string): T | null => {
  const item = sessionStorage.getItem(field);
  return item ? JSON.parse(item) : null;
};

export const setSS = <T>(field: string, value: T): void =>
  sessionStorage.setItem(field, JSON.stringify(value));
