import { Injectable } from '@angular/core';

import { IFileEntity, EntityState } from '../interfaces/file-management';
import { ApiService } from './api/api.service';
import { IEnvConfigService, IEnv } from './env-config/env-config.interface';
import { Readyable, ReadyState } from '../classes/readyable';
import * as S3 from 'aws-sdk/clients/s3';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';
import { SortOrder } from '../enums/sort-order.enum';
import {
  FEMovableKeyType,
  FEKeyType,
  FEMovableKeys,
} from '../enums/file-entity-headers.enum';
import { sortFactory } from '../utils/sort';

export type StoreType = ReadonlyArray<Readonly<IFileEntity>>;

@Injectable({
  providedIn: 'root',
})
export class FileManagerService extends Readyable {
  private _envValid = new BehaviorSubject(ReadyState.Init);
  protected readonly ReadyConditions = [this._envValid];
  private readonly _store: IFileEntity[] = [];
  private readonly _sortedStore = new BehaviorSubject([] as StoreType);
  private readonly _columnOrder = new BehaviorSubject<FEMovableKeyType[]>([]);
  private _env!: Readonly<IEnv>;
  private _lastError?: Error;

  bucketName?: string;

  get errorMessage() {
    return this._lastError?.message;
  }

  get store(): StoreType {
    return this._store;
  }

  get sortedStore() {
    return this._sortedStore.asObservable();
  }

  get columnOrder() {
    return this._columnOrder.asObservable();
  }

  sortField: undefined | FEKeyType = undefined;
  sortOrder: SortOrder = SortOrder.Ascending;

  constructor(
    private readonly _api: ApiService,
    private readonly _envConfig: IEnvConfigService,
    private readonly _auth: AuthService
  ) {
    super();
    this.readyInit();
    this._envConfig.env.subscribe((env) => {
      this._envValid.next(ReadyState.Ready);
      this._envValid.complete();
      this._env = env;
    });

    this._columnOrder.next([...FEMovableKeys]);
  }

  changeSort(key: FEKeyType) {
    if (key === this.sortField) {
      this.sortOrder = this.flipSortOrder();
    } else {
      this.sortField = key;
    }
    this._sortTheStore();
  }

  flipSortOrder() {
    return this.sortOrder === SortOrder.Ascending
      ? SortOrder.Descending
      : SortOrder.Ascending;
  }

  changeColumnOrder(key: FEMovableKeyType, destination: FEMovableKeyType) {
    const currentOrder = [...this._columnOrder.value];
    const oldIndex = currentOrder.indexOf(key);
    const newIndex = currentOrder.indexOf(destination);

    if (oldIndex >= 0 && newIndex >= 0) {
      console.debug('changeColumnOrder', oldIndex, newIndex);
      currentOrder.splice(newIndex, 0, currentOrder.splice(oldIndex, 1)[0]);
      this._columnOrder.next(currentOrder);
    }
  }

  async refresh() {
    this.readyOrThrow();
    const { awsS3EndpointARN, awsS3Prefix } = this._env;

    try {
      const listResponse = await this._api.listObjects(
        awsS3EndpointARN,
        awsS3Prefix
      );

      this._processListObjects(listResponse);
    } catch (exc) {
      // always store the error, but only rethrow unexpected non-AWSErrors.
      this._lastError = exc;
      console.log('_lastError:', [exc]);
      if (exc instanceof Error) {
        if (['InvalidAccessKeyId', 'ExpiredToken'].includes(exc.name)) {
          console.warn('Credentials expired with error', exc.name);
          this._auth.noCredentials();
        } else {
          console.warn('Non-credentials-expired error');
        }
      }
      throw exc;
    }
  }

  private _sortTheStore() {
    const { sortField, sortOrder } = this;
    console.debug('sorting the store on ', sortField, sortOrder);
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
    if (listResponse.IsTruncated) {
      console.warn('listObjects was truncated', listResponse);
    }
    if (!listResponse.Contents) {
      console.warn('listObjects has undefined Contents', listResponse);
      throw new Error('listObjects response was missing Contents');
    }

    this._store.length = 0;
    for (const obj of listResponse.Contents) {
      const entity = this._processListObject(obj);
      this._store.push(entity);
      this._headEntity(entity);
    }

    this._sortTheStore();
  }

  private _processListObject(obj: S3.Object): IFileEntity {
    if (!obj.Key || !obj.ETag || obj.Size === undefined || !obj.LastModified) {
      console.warn('Missing a crucial key in obj:', obj);
    }
    const lastModified =
      typeof obj.LastModified !== 'string'
        ? (obj.LastModified ?? new Date(-1)).toISOString()
        : obj.LastModified;

    return {
      key: obj.Key ?? 'MISSING_KEY',
      eTag: obj.ETag ?? 'MISSING_ETAG',
      size: obj.Size ?? NaN,
      lastModified,
      entityState: EntityState.list,
    };
  }

  private _headEntity(ent: IFileEntity): void {
    if (ent.entityState > EntityState.list) {
      console.warn('_headEntity called on already headed entity:', ent);
      return;
    }

    const { awsS3EndpointARN } = this._env;

    this._api.headObject(awsS3EndpointARN, ent.key).then((result) => {
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
          redirectLocation,
        });
      }
    });
  }
}
