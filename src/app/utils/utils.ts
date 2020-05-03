export function urlSearchParamsObject<T extends any>(params: string): T {
  const obj: T = {} as T;
  new URLSearchParams(params).forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
}

export function round(value: number, precision: number) {
  const offset = 10 ** precision;
  return Math.round((value + Number.EPSILON) * offset) / offset;
}
