export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
) {
  let timer: ReturnType<typeof setTimeout>;
  let timeout = 0;

  return (...args: Parameters<T>) => {
    clearTimeout(timer);

    timer = setTimeout(() => {
      fn(...args);
    }, timeout);

    timeout = delay;
  };
}

export function numberTest(a: number, b:number):number {
  return a+b
}

export function search<T extends (...args: unknown[]) => void> (fn:T, delay:number) {
    let timer: ReturnType<typeof setTimeout>;
    let timeout = 0;

    return (...args: Parameters<T>) => {
        clearTimeout(timer);

        timer = setTimeout(() => {
        fn(...args);
        }, timeout);

        timeout = delay;
    };
}