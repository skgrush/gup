/**
 * Convert a buffer of binary data to a string of hex characters.
 */
export function bufferToHex(buf: ArrayBuffer): string {
  let hex = '';
  for (const byte of new Uint8Array(buf)) {
    hex += byte.toString(16).padStart(2, '0');
  }
  return hex;
}
