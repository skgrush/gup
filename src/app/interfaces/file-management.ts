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
}

export interface IFileEntityListed extends IFileEntityBase {
  entityState: EntityState.list;
}

export interface IFileEntityHeaded extends IFileEntityBase {
  entityState: EntityState.head;
  contentType: string;
  redirectLocation?: string;
  uploader?: string;
}

export interface IFileEntityGot extends IFileEntityBase {
  entityState: EntityState.get;
  contentType: string;
  uploader?: string;
}

export type IFileEntity =
  | IFileEntityListed
  | IFileEntityHeaded
  | IFileEntityGot;
