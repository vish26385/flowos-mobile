export function debounceAsync<T extends (...args: any[]) => Promise<any>>(fn: T, delay = 1000) {
  let lastCall = 0;
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const now = Date.now();
    if (now - lastCall < delay) return Promise.resolve() as any;
    lastCall = now;
    return await fn(...args);
  };
}
