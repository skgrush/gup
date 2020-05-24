export class EnvConfigValidationError extends Error {
  readonly name = 'EnvConfigValidationError';
  /** full descriptive message */
  readonly message: string = '';

  /**
   * @param badKeys - keys of invalid values.
   * @param badVals - corresponding invalid values.
   * @param addtlMessage - additional message to append.
   */
  constructor(
    readonly badKeys: string[],
    readonly badVals: any[],
    readonly addtlMessage: string,
    ...params: any[]
  ) {
    super(...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, EnvConfigValidationError);
    }

    if (addtlMessage) {
      this.message += addtlMessage + ': ';
    }
    this.message += zipper(badKeys, badVals);
  }
}

/**
 *
 * @param keys
 * @param vals
 */
function zipper(keys: string[], vals: any[]): string {
  const combos: string[] = [];
  for (let i = 0; i < keys.length; ++i) {
    const key = JSON.stringify('env.' + keys[i]);
    const val = JSON.stringify(vals[i]);
    if (val === undefined) {
      combos.push(`missing ${key}`);
    } else {
      combos.push(`invalid ${key}: ${val}`);
    }
  }
  return combos.join(', ');
}
