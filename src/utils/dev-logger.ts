// Development-only logger that's tree-shaken in production
const isDev = process.env.NODE_ENV === 'development';

export const devLog = (...args: any[]) => {
  if (isDev) console.log(...args);
};

export const devError = (...args: any[]) => {
  if (isDev) console.error(...args);
};

export const devWarn = (...args: any[]) => {
  if (isDev) console.warn(...args);
};
