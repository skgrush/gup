export function urlSearchParamsObject<T extends any>(params: string): T {
  const obj: T = {} as T;
  new URLSearchParams(params).forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
}
