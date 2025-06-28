// Development logger utility
// Provides consistent logging that can be easily disabled in production

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  debug: (message: string, ...args: unknown[]): void => {
    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.log(`[DEBUG] ${message}`, ...args);
    }
  },

  info: (message: string, ...args: unknown[]): void => {
    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.info(`[INFO] ${message}`, ...args);
    }
  },

  warn: (message: string, ...args: unknown[]): void => {
    // eslint-disable-next-line no-console
    console.warn(`[WARN] ${message}`, ...args);
  },

  error: (message: string, ...args: unknown[]): void => {
    // eslint-disable-next-line no-console
    console.error(`[ERROR] ${message}`, ...args);
  },
};
