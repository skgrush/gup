import { Injectable } from '@angular/core';
import * as CognitoIdentity from 'aws-sdk/clients/cognitoidentity';
import { BehaviorSubject } from 'rxjs';

import { IEnv, IEnvConfigService } from '../env-config/env-config.interface';
import { Readyable, ReadyState } from '../../classes/readyable';
import { PromisifyAWS } from '../../utils/aws-sdk-helpers';

@Injectable({
  providedIn: 'root',
})
export class ApiAuthService extends Readyable {
  // private _sts?: STS;
  private _cognitoIdentity?: CognitoIdentity;
  private _env?: Readonly<IEnv> = undefined;

  private readonly _envValid = new BehaviorSubject(ReadyState.Init);

  readonly ReadyConditions = [this._envConfig, this._envValid];

  get defaultRoleARN(): string | undefined {
    this.readyOrThrow();
    return this._env?.awsRoleArn;
  }

  get defaultIdentityPool(): string {
    this.readyOrThrow();
    return this._env?.awsIdentityPool as string;
  }

  constructor(private readonly _envConfig: IEnvConfigService) {
    super();
    this._envConfig.env.subscribe((c) => {
      this._env = c;
      this._envValid.next(ReadyState.Ready);
      this._envValid.complete();
    });
    this.readyInit();
    console.debug('api-auth.service:', this);
  }

  // initSTS(): STS {
  //   return (this._sts = new STS());
  // }

  initCognito(): CognitoIdentity {
    this.readyOrThrow();
    console.debug('initCognito', this._env);
    this._cognitoIdentity = new CognitoIdentity({
      region: this._env?.awsIdentityRegion,
    });
    return this._cognitoIdentity;
  }

  // /**
  //  * STS#assumeRoleWithWebIdentity
  //  *
  //  * @throws {AWSError}
  //  * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/STS.html#assumeRoleWithWebIdentity-property
  //  */
  // async assumeRole(
  //   accessToken: string,
  //   roleName?: string
  // ): Promise<STS.AssumeRoleWithWebIdentityResponse> {
  //   this.readyOrThrow();
  //
  //   const sts = this._sts ?? this.initSTS();
  //   roleName = roleName ?? this.defaultRoleARN;
  //
  //   const params: STS.AssumeRoleWithWebIdentityRequest = {
  //     RoleArn: roleName,
  //     RoleSessionName: 'gup123',
  //     WebIdentityToken: accessToken,
  //   };
  //
  //   const promise = PromisifyAWS(sts, sts.assumeRoleWithWebIdentity, params);
  //
  //   const response = await promise;
  //   return response;
  // }

  async getCredentialsFromLogins(
    identityPoolId: string,
    logins: CognitoIdentity.LoginsMap,
    roleARN?: string
  ) {
    // the following will check readiness
    const cognitoIdentity = this._cognitoIdentity ?? this.initCognito();

    roleARN = roleARN ?? this.defaultRoleARN ?? undefined;

    const getIdParams = {
      IdentityPoolId: identityPoolId,
      Logins: logins,
    };

    const { IdentityId } = await PromisifyAWS(
      cognitoIdentity,
      cognitoIdentity.getId,
      getIdParams
    );

    if (!IdentityId) {
      throw new Error('Unexpected undefined "IdentityId" returned by getId()');
    }

    const getCredentialsParams = {
      IdentityId,
      CustomRoleArn: roleARN,
      Logins: logins,
    };

    const { Credentials, ...other } = await PromisifyAWS(
      cognitoIdentity,
      cognitoIdentity.getCredentialsForIdentity,
      getCredentialsParams
    );

    console.debug('[getIdId,getCredentialsId]', [IdentityId, other.IdentityId]);

    if (!Credentials) {
      throw new Error(
        'Unexpected undefined "Credentials" from GetCredentialsForIdentity'
      );
    }

    return Credentials;
  }

  /**
   *
   * @param identityPoolId - Cognito identity pool id, "REGION:GUID" format.
   * @param logins - map of provider-names to tokens.
   *
   * @throws {AWSError}
   * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CognitoIdentity.html#getId-property
   */
  async getId(identityPoolId: string, logins: CognitoIdentity.LoginsMap) {
    // the following will check readyness
    const cognitoIdentity = this._cognitoIdentity ?? this.initCognito();

    const params = {
      IdentityPoolId: identityPoolId,
      Logins: logins,
    };

    const promise = PromisifyAWS(
      cognitoIdentity,
      cognitoIdentity.getId,
      params
    );

    const response = await promise;
    return response;
  }
}
