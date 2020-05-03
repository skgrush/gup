import { Injectable } from '@angular/core';
import { AWSError } from 'aws-sdk/global';

import { IFileEntity, EntityState } from '../interfaces/file-management';
import { ApiService } from './api/api.service';
import { IEnvConfigService, IEnv } from './env-config/env-config.interface';
import { Readyable, ReadyState } from '../classes/readyable';
import * as S3 from 'aws-sdk/clients/s3';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FileManagerService extends Readyable {
  private _envValid = new BehaviorSubject(ReadyState.Init);
  protected readonly ReadyConditions = [this._envValid];
  private readonly _store: IFileEntity[] = [];
  private _env!: Readonly<IEnv>;
  private _lastError?: Error;

  bucketName?: string;

  get errorMessage() {
    return this._lastError?.message;
  }

  get store(): ReadonlyArray<Readonly<IFileEntity>> {
    return this._store;
  }

  constructor(
    private readonly _api: ApiService,
    private readonly _envConfig: IEnvConfigService
  ) {
    super();
    this.readyInit();
    this._envConfig.env.subscribe((env) => {
      this._envValid.next(ReadyState.Ready);
      this._envValid.complete();
      this._env = env;
    });
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
      if (exc instanceof AWSError) {
        console.error('listObjects failed with AWSError:', exc);
      } else {
        throw exc;
      }
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
