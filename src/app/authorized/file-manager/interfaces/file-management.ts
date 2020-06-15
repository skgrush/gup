import { StorageClass } from './s3-data';

export enum EntityState {
  list = 1,
  head,
  get,
}

export interface IFileEntityBase {
  entityState: EntityState;

  eTag: string;
  key: string;
  lastModified: string;
  size: number;
  storageClass?: StorageClass;
}

export interface IFileEntityListed extends IFileEntityBase {
  entityState: EntityState.list;
}

export interface IFileEntityHeaded extends IFileEntityBase {
  entityState: EntityState.head;
  contentType: string;
  redirectLocation?: string;
  uploader?: string;
  cacheControl?: string;
}

export interface IFileEntityGot extends IFileEntityBase {
  entityState: EntityState.get;
  contentType: string;
  redirectLocation?: string;
  uploader?: string;
}

export type IFileEntity =
  | IFileEntityListed
  | IFileEntityHeaded
  | IFileEntityGot;

export type IProgress =
  | { loaded: number; total?: number }
  | { success: true }
  | { success: false; error: string };

interface IBaseFormValue {
  name: string;
  progress: (p: IProgress) => void;
  maxAge?: number;
  storageClass: StorageClass;
}

export interface IFileFormValue extends IBaseFormValue {
  file: File;
}

export interface IUrlFormValue extends IBaseFormValue {
  url: string;
}
