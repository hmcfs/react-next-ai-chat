export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay = 200
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let time: ReturnType<typeof setTimeout> | null = null;

  const debounced = function (this: any, ...args: Parameters<T>) {
    if (time) clearTimeout(time);

    time = setTimeout(() => {
      fn.apply(this, args);
      time = null;
    }, delay);
  };

  debounced.cancel = () => {
    if (time) {
      clearTimeout(time);
      time = null;
    }
  };

  return debounced;
}
