import { Injectable } from '@angular/core';
import * as S3 from 'aws-sdk/clients/s3';
import { BehaviorSubject } from 'rxjs';

import {
  IFileEntity,
  EntityState,
  IFileFormValue,
  IFileEntityListed,
  IFileEntityGot,
  IUrlFormValue,
} from '../interfaces/file-management';
import { ApiService } from '../../services/api/api.service';
import {
  IEnvConfigService,
  IEnv,
} from 'src/app/public/services/env-config/env-config.interface';
import { ReadyState } from 'src/app/shared/classes/readyable';
import { AuthService } from 'src/app/public/services/auth.service';
import { SortOrder } from '../enums/sort-order.enum';
import {
  FEMovableKeyType,
  FEKeyType,
  FEMovableKeys,
} from '../enums/file-entity-headers.enum';
import { sortFactory } from '../utilities/sort';
import { StorageClass } from '../interfaces/s3-data';
import { LoggerService } from 'src/app/gup-common/services/logger/logger.service';
import { IFileManagerService, StoreType } from './file-manager.interface';

@Injectable()
export class FileManagerService extends IFileManagerService {
  private _envValid = new BehaviorSubject(ReadyState.Init);
  protected readonly ReadyConditions = [this._envValid, this._envConfig];
  private readonly _store: IFileEntity[] = [];
  private readonly _sortedStore = new BehaviorSubject([] as StoreType);
  private readonly _columnOrder = new BehaviorSubject<FEMovableKeyType[]>([]);
  private _env!: Readonly<IEnv>;
  private _lastError?: Error;

  private _bucketName!: string;
  private _prefix?: string;
  private _publicRoot?: string;

  private _sortField: FEKeyType = 'key';
  private _sortOrder: SortOrder = SortOrder.Ascending;

  get errorMessage() {
    return this._lastError?.message;
  }

  get publicRoot() {
    return this._publicRoot;
  }

  get sortedStore() {
    return this._sortedStore.asObservable();
  }

  get columnOrder() {
    return this._columnOrder.asObservable();
  }

  get sortField() {
    return this._sortField;
  }

  get sortOrder() {
    return this._sortOrder;
  }

  constructor(
    private readonly _api: ApiService,
    private readonly _envConfig: IEnvConfigService,
    private readonly _auth: AuthService,
    private readonly _logger: LoggerService
  ) {
    super();
    this.readyInit();
    this._envConfig.env.subscribe((env) => {
      this._envValid.next(ReadyState.Ready);
      this._envValid.complete();
      this._env = env;

      this._bucketName = env.awsS3EndpointARN;
      this._prefix = env.awsS3Prefix;
      this._publicRoot = env.publicRoot;
    });

    _logger.initialize('FileManager', 'service', this);

    this._columnOrder.next([...FEMovableKeys]);
  }

  changeSort(key: FEKeyType) {
    if (key === this._sortField) {
      this._sortOrder = this.flipSortOrder();
    } else {
      this._sortField = key;
    }
    this._sortTheStore();
  }

  flipSortOrder() {
    return this._sortOrder === SortOrder.Ascending
      ? SortOrder.Descending
      : SortOrder.Ascending;
  }

  changeColumnOrder(key: FEMovableKeyType, destination: FEMovableKeyType) {
    const currentOrder = [...this._columnOrder.value];
    const oldIndex = currentOrder.indexOf(key);
    const newIndex = currentOrder.indexOf(destination);

    if (oldIndex >= 0 && newIndex >= 0) {
      this._logger.debug('changeColumnOrder', oldIndex, newIndex);
      currentOrder.splice(newIndex, 0, currentOrder.splice(oldIndex, 1)[0]);
      this._columnOrder.next(currentOrder);
    }
  }

  private _handleError(exc: any): never {
    // always store the error, but only rethrow unexpected non-AWSErrors.
    this._lastError = exc;
    this._logger.error('FileManagerService handled error', exc);
    this._auth.checkForCredentialsError(exc);
    throw exc;
  }

  async refreshFileStore() {
    this.readyOrThrow();
    const { awsS3EndpointARN, awsS3Prefix } = this._env;

    try {
      const listResponse = await this._api.listObjects(
        awsS3EndpointARN,
        awsS3Prefix
      );

      this._processListObjects(listResponse);
    } catch (exc) {
      this._handleError(exc);
    }
  }

  async uploadFile({
    file,
    name,
    progress,
    maxAge,
    storageClass,
  }: IFileFormValue) {
    this.readyOrThrow();
    const key = (this._prefix ?? '') + name;
    const cacheControl = maxAge ? `max-age=${maxAge}` : undefined;
    const preTimestamp = new Date();

    progress({ loaded: 0, total: file.size });

    try {
      const res = await this._api.uploadObjectBlob(
        this._bucketName,
        key,
        file,
        {
          cb: progress,
          cacheControl,
        }
      );

      const { data, uploader } = res;

      const fileEntity: IFileEntityGot = {
        contentType: file.type,
        eTag: data.ETag,
        key,
        lastModified: preTimestamp.toISOString(),
        size: file.size,
        uploader,
        entityState: EntityState.get,
        storageClass,
      };

      this._store.push(fileEntity);
      this._sortTheStore();
    } catch (exc) {
      progress({ success: false, error: exc });
      this._handleError(exc);
    }
  }

  async uploadUrl({
    url,
    name,
    progress,
    maxAge,
    storageClass,
  }: IUrlFormValue) {
    this.readyOrThrow();
    const key = (this._prefix ?? '') + name;
    const cacheControl = maxAge ? `max-age=${maxAge}` : undefined;
    const preTimestamp = new Date();

    progress({ loaded: 0 });

    try {
      const res = await this._api.uploadObjectRedirect(
        this._bucketName,
        key,
        url,
        {
          cb: progress,
          cacheControl,
        }
      );

      const { data, uploader } = res;

      const fileEntity: IFileEntityGot = {
        contentType: '',
        eTag: data.ETag,
        key,
        lastModified: preTimestamp.toISOString(),
        size: 0,
        uploader,
        redirectLocation: url,
        entityState: EntityState.get,
        storageClass,
      };

      this._store.push(fileEntity);
      this._sortTheStore();
    } catch (exc) {
      progress({ success: false, error: exc });
      this._handleError(exc);
    }
  }

  async deleteFile(file: IFileEntity) {
    this.readyOrThrow();
    const { key } = file;

    try {
      const res = await this._api.deleteObject(this._bucketName, key);

      const idx = this._store.indexOf(file);
      if (idx >= 0) {
        this._store.splice(idx, 1);
        this._sortTheStore();
      }
    } catch (exc) {
      this._handleError(exc);
    }
  }

  private _sortTheStore() {
    const { _sortField: sortField, _sortOrder: sortOrder } = this;
    this._logger.debug('sorting the store on ', sortField, sortOrder);
    if (!sortField) {
      this._sortedStore.next([...this._store]);
    } else {
      const method = sortFactory(sortField, sortOrder);
      this._sortedStore.next(this._store.sort(method));
    }
  }

  /**
   * Take a list response, replace the store with the response, and
   * asynchronously send HEAD requests for more info on each.
   *
   * #TODO: this should merge new into old.
   */
  private _processListObjects(listResponse: S3.ListObjectsV2Output): void {
    this._logger.info('processListObjects:', listResponse);
    if (listResponse.IsTruncated) {
      this._logger.warn('listObjects was truncated', listResponse);
    }
    if (!listResponse.Contents) {
      this._logger.warn('listObjects has undefined Contents', listResponse);
      throw new Error('listObjects response was missing Contents');
    }

    this._store.length = 0;
    for (const obj of listResponse.Contents) {
      this._processListObject(obj);
    }

    this._sortTheStore();
  }

  private _processListObject(obj: S3.Object): IFileEntityListed {
    if (!obj.Key || !obj.ETag || obj.Size === undefined || !obj.LastModified) {
      this._logger.warn('Missing a crucial key in obj:', obj);
    }
    const lastModified =
      typeof obj.LastModified !== 'string'
        ? (obj.LastModified ?? new Date(-1)).toISOString()
        : obj.LastModified;

    const storageClass = obj.StorageClass as StorageClass | undefined;

    const entity: IFileEntity = {
      key: obj.Key ?? 'MISSING_KEY',
      eTag: obj.ETag ?? 'MISSING_ETAG',
      size: obj.Size ?? NaN,
      lastModified,
      entityState: EntityState.list,
      storageClass,
    };

    this._store.push(entity);
    // don't await headEntity, these can queue async
    this._headEntity(entity);

    return entity;
  }

  private async _headEntity(ent: IFileEntity) {
    if (ent.entityState > EntityState.list) {
      this._logger.warn('_headEntity called on already headed entity:', ent);
      return;
    }

    const { awsS3EndpointARN } = this._env;

    const result = await this._api.headObject(awsS3EndpointARN, ent.key);
    this._logger.info('Headed entity:', ent.key, result);

    // add the new fields to the entity directly, unless it's already bee updated
    if (ent.entityState < EntityState.head) {
      const redirectLocation = result.WebsiteRedirectLocation;
      const contentType =
        redirectLocation !== undefined
          ? `redirect=${redirectLocation}`
          : result.ContentType ?? '';

      Object.assign(ent, {
        entityState: EntityState.head,
        contentType,
        uploader: result.Metadata?.uploader,
        cacheControl: result.CacheControl,
        redirectLocation,
      });
    }
  }
}
