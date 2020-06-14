import { Injectable } from '@angular/core';
import * as S3 from 'aws-sdk/clients/s3';

import { AuthService } from 'src/app/public/services/auth.service';
import { LoggerService } from 'src/app/gup-common/services/logger/logger.service';

type UploadCB = (progress: S3.ManagedUpload.Progress) => void;

interface IUploadOptions {
  cacheControl?: string;
  expires?: Date;
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
        CacheControl: opts?.cacheControl,
        Expires: opts?.expires,
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
    opts?: IUploadOptions
  ) {
    const uploader = this._auth.identity;

    this._logger.debug('uploadObjectRedir', {
      bucket,
      key,
      location,
      opts,
      uploader,
    });

    if (!uploader) {
      throw new Error('Missing uploader');
    }
    if (!location) {
      throw new Error('Missing location');
    }

    const s3 = this._s3 ?? this.initS3();

    const managed = s3.upload(
      {
        Key: key,
        Bucket: bucket,
        Body: '',
        ContentType: '',
        CacheControl: opts?.cacheControl,
        Expires: opts?.expires,
        Metadata: {
          uploader,
        },
        WebsiteRedirectLocation: location,
      },
      this._logger.debug.bind(null, 'upload complete?:')
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
}
