export const FEKeys = Object.freeze([
  'key',
  'size',
  'contentType',
  'uploader',
  'lastModified',
] as const);

export enum FEHeaderId {
  key = 'file-col-key',
  size = 'file-col-size',
  contentType = 'file-col-contentType',
  uploader = 'file-col-uploader',
  lastModified = 'file-col-lastModified',
}

export enum FEHeaderName {
  key = 'Key',
  size = 'Size',
  contentType = 'Content-type',
  uploader = 'Uploader',
  lastModified = 'Last modified',
}
