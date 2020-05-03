import { Injectable } from '@angular/core';
import * as S3 from 'aws-sdk/clients/s3';

import { AuthService } from '../auth.service';

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

  async listObjects(bucket: string, prefix: string, keys: number) {
    const s3 = this._s3 ?? this.initS3();

    const result = await new Promise((resolve, reject) =>
      s3.listObjectsV2(
        { Bucket: bucket, Prefix: prefix, MaxKeys: keys },
        (err, data) => (data ? resolve(data) : reject(err))
      )
    );

    return result;
  }
}
