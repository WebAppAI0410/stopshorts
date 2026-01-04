export const debugLog = (...args: unknown[]) => {
  if (__DEV__) {
    console.log(...args);
  }
};

export const debugWarn = (...args: unknown[]) => {
  if (__DEV__) {
    console.warn(...args);
  }
};
