import { Pipe, PipeTransform } from '@angular/core';
import { round } from '../utils/utils';

export type ByteBase = 1000 | 1024;

export const BYTE_SUFFIXES = Object.freeze({
  // MAX_SAFE_INTEGER can't even represent any E[i]Bs
  1000: Object.freeze(['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB']),
  1024: Object.freeze(['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB']),
});

const _browserLanguage = window.navigator.language;

const _numberFormatCache = new Map<string, Intl.NumberFormat>();

/**
 * Format a number as a factor of the highest power of a given base.
 * @param value
 * @param base
 * @param precision
 *
 * @returns a 2-tuple of the rounded display value and the power,
 * such that `value ~= outValue * (base ** power)`.
 *
 * @example
 * ```
 * powerFormat(11009000, 1024, 2) -> [10.5, 2]
 * powerFormat(11009000, 1000, 3) -> [11.009, 2]
 * ```
 */
export function powerFormat(
  value: number,
  precision: number,
  base: ByteBase,
  maxPower = Infinity
): [number, number] {
  const absInt = Math.round(Math.abs(value));
  if (absInt === 0) {
    return [0, 0];
  } else if (maxPower <= 1) {
    return [value, 0];
  }
  const power = Math.min(
    Math.floor(Math.log(absInt) / Math.log(base)),
    maxPower
  );

  let outValue = absInt / Math.pow(base, power);
  if (value < 0) {
    outValue *= -1;
  }

  return [round(outValue, precision), power];
}

/**
 * Format bytes into a human-readable standard string, e.g. "15.1 kB" or "1 MiB"
 * @param value
 */
export function byteFormat(
  value: number,
  precision: number = 2,
  base: ByteBase = 1024,
  locale: string = _browserLanguage
): string {
  const byteSuffixes = BYTE_SUFFIXES[base];
  const maxPower = byteSuffixes.length - 1;

  const [outValue, power] = powerFormat(value, precision, base, maxPower);
  const suffix = byteSuffixes[power];

  let formatter = _numberFormatCache.get(locale);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale);
    _numberFormatCache.set(locale, formatter);
  }

  const formattedOutValue = formatter.format(outValue);
  return `${formattedOutValue} ${suffix}`;
}

@Pipe({
  name: 'byteFormat',
})
export class ByteFormatPipe implements PipeTransform {
  transform(value?: number, precision = 2, base: ByteBase = 1024): string {
    if (value !== undefined) {
      return byteFormat(value, precision, base);
    } else {
      return '';
    }
  }
}
