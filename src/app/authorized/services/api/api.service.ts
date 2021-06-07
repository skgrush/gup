import { Injectable } from '@angular/core';
import * as S3 from 'aws-sdk/clients/s3';

import { AuthService } from 'src/app/public/services/auth.service';
import { LoggerService } from 'src/app/gup-common/services/logger/logger.service';
import {
  IFileEntityHeaded,
  IModifyParameters,
} from '../../file-manager/interfaces/file-management';
import { StorageClass } from '../../file-manager/interfaces/s3-data';

type UploadCB = (progress: S3.ManagedUpload.Progress) => void;

interface IUploadOptions {
  cacheControl?: string;
  cb?: UploadCB;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private _s3?: S3;

  constructor(
    private readonly _auth: AuthService,
    private readonly _logger: LoggerService
  ) {
    _logger.initialize('Api', 'service', this);
  }

  initS3() {
    return (this._s3 = new S3({}));
  }

  async listObjects(bucket: string, prefix?: string, keys?: number) {
    const s3 = this._s3 ?? this.initS3();

    const result = await s3
      .listObjectsV2({
        Bucket: bucket,
        Prefix: prefix,
        MaxKeys: keys,
      })
      .promise();

    return result;
  }

  async headObject(bucket: string, key: string) {
    const s3 = this._s3 ?? this.initS3();

    const result = await s3
      .headObject({
        Bucket: bucket,
        Key: key,
      })
      .promise();

    return result;
  }

  async deleteObject(
    bucket: string,
    key1: string
  ): Promise<S3.DeleteObjectOutput>;
  async deleteObject(
    bucket: string,
    key1: string,
    ...keys: string[]
  ): Promise<S3.DeleteObjectsOutput>;
  async deleteObject(bucket: string, ...keys: string[]) {
    const s3 = this._s3 ?? this.initS3();

    if (!keys.length) {
      throw new RangeError('no keys passed to deleteObject');
    }

    const result = await (keys.length === 1
      ? s3.deleteObject({
          Bucket: bucket,
          Key: keys[0],
        })
      : s3.deleteObjects({
          Bucket: bucket,
          Delete: {
            Objects: keys.map((k) => ({ Key: k })),
          },
        })
    ).promise();

    this._logger.debug('deleteObject', result);

    return result;
  }

  async uploadObjectBlob(
    bucket: string,
    key: string,
    blob: Blob,
    storageClass: StorageClass,
    opts?: IUploadOptions
  ) {
    const ContentType = blob.type;
    const uploader = this._auth.identity;

    if (!ContentType) {
      throw new Error('Unknown blob MIME');
    }
    if (!uploader) {
      throw new Error('Missing uploader');
    }

    const s3 = this._s3 ?? this.initS3();

    const managed = s3.upload(
      {
        Key: key,
        Bucket: bucket,
        Body: blob,
        ContentType,
        StorageClass: storageClass,
        CacheControl: opts?.cacheControl,
        Metadata: {
          uploader,
        },
      },
      this._logger.log.bind(console, 'upload complete?:')
    );

    if (opts?.cb) {
      managed.on('httpUploadProgress', opts.cb);
    }

    const data = await managed.promise();

    return {
      data,
      uploader,
    };
  }

  async uploadObjectRedirect(
    bucket: string,
    key: string,
    location: string,
    storageClass: StorageClass,
    opts?: IUploadOptions
  ) {
    const uploader = this._auth.identity;

    this._logger.debug('uploadObjectRedir', {
      bucket,
      key,
      location,
      opts,
      uploader,
      storageClass,
    });

    if (!uploader) {
      throw new Error('Missing uploader');
    }
    if (!location) {
      throw new Error('Missing location');
    }

    const s3 = this._s3 ?? this.initS3();

    const data = await s3
      .upload({
        Key: key,
        Bucket: bucket,
        Body: '',
        ContentType: '',
        CacheControl: opts?.cacheControl,
        StorageClass: storageClass,
        Metadata: {
          uploader,
        },
        WebsiteRedirectLocation: location,
      })
      .promise();

    return {
      data,
      uploader,
    };
  }

  async modifyObject(
    bucket: string,
    file: IFileEntityHeaded,
    params: IModifyParameters
  ) {
    const s3 = this._s3 ?? this.initS3();

    const oldFileKey = file.key;

    const response = await s3
      .copyObject({
        // required
        Bucket: bucket,
        CopySource: oldFileKey,
        Key: params.key ?? file.key,
        // optional parameters
        StorageClass: params.storageClass,
        CacheControl: params.cacheControl,
      })
      .promise();

    const result = response.CopyObjectResult;

    if (result?.ETag && file.eTag) {
      this._logger.warn(
        'eTag for modified file appeared to change',
        file,
        result
      );
    } else {
      this._logger.debug('copied file', file, result);
    }

    file.eTag = result?.ETag ?? file.eTag;
    file.lastModified =
      result?.LastModified?.toISOString() ?? file.lastModified;
    file.storageClass = params.storageClass ?? file.storageClass;
    file.cacheControl = params.cacheControl ?? file.cacheControl;

    if (params.key && params.key !== oldFileKey) {
      // the key changed
      file.key = params.key;

      this._logger.debug('deleting old key');
      await this.deleteObject(bucket, oldFileKey);
      this._logger.debug('deleted old key successfully', oldFileKey);
    }

    return file;
  }
}
