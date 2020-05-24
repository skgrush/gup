import { Injectable } from '@angular/core';
import * as S3 from 'aws-sdk/clients/s3';

import { AuthService } from '../auth.service';
import { PromisifyAWS } from 'src/app/utils/aws-sdk-helpers';

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

  constructor(private readonly _auth: AuthService) {
    console.warn('API SERVICE:', this);
  }

  initS3() {
    return (this._s3 = new S3({}));
  }

  async listObjects(bucket: string, prefix?: string, keys?: number) {
    const s3 = this._s3 ?? this.initS3();

    const result = await PromisifyAWS(s3, s3.listObjectsV2, {
      Bucket: bucket,
      Prefix: prefix,
      MaxKeys: keys,
    });

    return result;
  }

  async headObject(bucket: string, key: string) {
    const s3 = this._s3 ?? this.initS3();

    const result = await PromisifyAWS(s3, s3.headObject, {
      Bucket: bucket,
      Key: key,
    });

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
      ? PromisifyAWS(s3, s3.deleteObject, {
          Bucket: bucket,
          Key: keys[0],
        })
      : PromisifyAWS(s3, s3.deleteObjects, {
          Bucket: bucket,
          Delete: {
            Objects: keys.map((k) => ({ Key: k })),
          },
        }));

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
      console.log.bind(console, 'upload complete?:')
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

    if (!uploader) {
      throw new Error('Missing uploader');
    }
    if (!location) {
      throw new Error('Missing location');
    }

    console.debug('uploadRedir');

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
      console.log.bind(console, 'upload complete?:')
    );

    if (opts?.cb) {
      managed.on('httpUploadProgress', opts.cb);
    }

    console.debug('uploadRedir2');

    const data = await managed.promise();

    return {
      data,
      uploader,
    };
  }
}
