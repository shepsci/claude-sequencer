export const wait = (timeout: number, func?: () => void): Promise<void> =>
  new Promise(resolve => {
    setTimeout(() => {
      if (func) func();
      resolve();
    }, timeout);
  });
