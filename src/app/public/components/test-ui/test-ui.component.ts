import { Component, OnInit } from '@angular/core';
import { OAuthProvider } from 'src/app/services/oauth/oauth-provider.interface';
import { ApiAuthService } from 'src/app/services/api/api-auth.service';
import { ApiService } from 'src/app/services/api/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { KeyStore } from 'src/app/classes/key-store';
import { EnvConfigService } from 'src/app/services/env-config/env-config.service';
import { Readyable, readyStateFinalized } from 'src/app/classes/readyable';

@Component({
  selector: 'gup-test-ui',
  templateUrl: './test-ui.component.html',
  styleUrls: ['./test-ui.component.scss'],
})
export class TestUiComponent implements OnInit {
  readonly keyStore = new KeyStore();

  readonly keyStoreProps: Array<keyof KeyStore> = [
    'accessKeyId',
    'idToken',
    'oauthState',
    'secretKey',
    'expiredTime',
  ];

  readonly oauthProviderProps: Array<keyof OAuthProvider> = [
    'name',
    'clientId',
    'redirectUri',
    'state',
    'scope',
    'valid',
    'additionalParams',
    'lastCallback',
  ];

  get authCredentialsStr(): string {
    return JSON.stringify((this.auth as any)._credentials);
  }

  apiBucket?: string;
  apiPrefix?: string;

  getCredentialsResponse?: string;
  assumeRoleResponseSuccess?: boolean;
  assumeRoleResponse?: string;

  getIdResponseSuccess?: boolean;
  getIdResponse?: string;

  getS3ListResponseSuccess?: boolean;
  getS3ListResponse?: string;

  ready = false;

  constructor(
    readonly oauthProvider: OAuthProvider,
    readonly apiAuth: ApiAuthService,
    readonly api: ApiService,
    readonly auth: AuthService,
    readonly config: EnvConfigService
  ) {
    Readyable.observeMultiple(oauthProvider, apiAuth, config).subscribe(
      (state) => (this.ready = readyStateFinalized(state))
    );
    config.env.subscribe((env) => {
      this.apiBucket = env.awsS3EndpointARN;
      this.apiPrefix = env.awsS3Prefix;
    });
    console.debug('TestUI', this);
  }

  ngOnInit(): void {}

  authNoCredentials() {
    this.auth.noCredentials();
  }

  keyStoreGet(key: keyof KeyStore) {
    return JSON.stringify(this.keyStore[key]);
  }

  keyStoreClear(key: typeof KeyStore.keys[number]) {
    this.keyStore[key] = null;
  }

  oauthProviderGet(key: keyof OAuthProvider) {
    return JSON.stringify(this.oauthProvider[key], null, 2);
  }

  apiAuthGetId(
    loginProviderI: HTMLInputElement,
    loginTokenI: HTMLInputElement,
    identityPoolI: HTMLInputElement
  ) {
    const provider = loginProviderI.value;
    const token = loginTokenI.value;
    const identityPool = identityPoolI.value || identityPoolI.placeholder;

    this.apiAuth
      .getId(identityPool, {
        [provider]: token,
      })
      .then((res) => {
        this.getIdResponse = JSON.stringify(res);
        this.getIdResponseSuccess = true;
      })
      .catch((reason) => {
        this.getIdResponse = JSON.stringify(reason);
        this.getIdResponseSuccess = false;
      });
  }

  apiListBucket(bucketI: HTMLInputElement, prefixI: HTMLInputElement) {
    const bucket = bucketI.value || bucketI.placeholder;
    const prefix = prefixI.value || prefixI.placeholder;

    this.api
      .listObjects(bucket, prefix, 100)
      .then((res) => {
        this.getS3ListResponse = JSON.stringify(res);
        this.getS3ListResponseSuccess = true;
      })
      .catch((reason) => {
        this.getS3ListResponse = JSON.stringify(reason, null, 2);
        this.getS3ListResponseSuccess = false;
      });
  }
}
