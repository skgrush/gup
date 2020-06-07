import { Injectable } from '@angular/core';
import * as CognitoIdentity from 'aws-sdk/clients/cognitoidentity';
import { BehaviorSubject } from 'rxjs';

import { IEnv, IEnvConfigService } from '../env-config/env-config.interface';
import { Readyable, ReadyState } from 'src/app/shared/classes/readyable';
import * as CognitoIdentityServiceProvider from 'aws-sdk/clients/cognitoidentityserviceprovider';
import { LoggerService } from 'src/app/gup-common/services/logger/logger.service';

type AssociateTokenArg =
  | { AccessToken: string; Session?: never }
  | { AccessToken?: never; Session: string };

interface VerifyTokenArg {
  accessToken: string;
  deviceName: string;
  code: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApiAuthService extends Readyable {
  // private _sts?: STS;
  private _cognitoServiceProvider?: CognitoIdentityServiceProvider;
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

  constructor(
    private readonly _envConfig: IEnvConfigService,
    private readonly _logger: LoggerService
  ) {
    super();
    this._logger.initialize('ApiAuth', 'service', this);

    this._envConfig.env.subscribe((c) => {
      this._env = c;
      this._envValid.next(ReadyState.Ready);
      this._envValid.complete();
    });
    this.readyInit();
  }

  // initSTS(): STS {
  //   return (this._sts = new STS());
  // }

  initCognito(): CognitoIdentity {
    this.readyOrThrow();
    this._cognitoIdentity = new CognitoIdentity({
      region: this._env?.awsIdentityRegion,
    });
    return this._cognitoIdentity;
  }

  initCognitoServiceProvider(): CognitoIdentityServiceProvider {
    this.readyOrThrow();
    this._cognitoServiceProvider = new CognitoIdentityServiceProvider({
      region: this._env!.awsIdentityRegion,
    });
    return this._cognitoServiceProvider;
  }

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

    const { IdentityId } = await cognitoIdentity.getId(getIdParams).promise();

    if (!IdentityId) {
      throw new Error('Unexpected undefined "IdentityId" returned by getId()');
    }

    const getCredentialsParams = {
      IdentityId,
      CustomRoleArn: roleARN,
      Logins: logins,
    };

    const {
      Credentials,
      ...other
    } = await cognitoIdentity
      .getCredentialsForIdentity(getCredentialsParams)
      .promise();

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

    const response = await cognitoIdentity.getId(params).promise();

    return response;
  }

  async getUser(accessToken: string) {
    const cognitoISP =
      this._cognitoServiceProvider ?? this.initCognitoServiceProvider();

    const result = await cognitoISP
      .getUser({
        AccessToken: accessToken,
      })
      .promise();

    return result;
  }

  async associateSoftwareToken(params: AssociateTokenArg) {
    const cognitoISP =
      this._cognitoServiceProvider ?? this.initCognitoServiceProvider();

    const result = await cognitoISP.associateSoftwareToken(params).promise();

    return result;
  }

  async verifySoftwareToken({ deviceName, code, accessToken }: VerifyTokenArg) {
    const cognitoISP =
      this._cognitoServiceProvider ?? this.initCognitoServiceProvider();

    const result = await cognitoISP
      .verifySoftwareToken({
        UserCode: code,
        FriendlyDeviceName: deviceName,
        AccessToken: accessToken,
      })
      .promise();

    if (result.Status !== 'SUCCESS') {
      this._logger.warn(`verifySoftwareToken received status ${result.Status}`);
      return false;
    }

    await cognitoISP
      .setUserMFAPreference({
        AccessToken: accessToken,
        SoftwareTokenMfaSettings: {
          Enabled: true,
          PreferredMfa: true,
        },
      })
      .promise();

    return true;
  }

  /**
   * Gets the state of Software Token MFA configuration.
   *
   * @returns `true` if enabled and preferred.
   * @returns `false` if neither enabled nor preferred.
   * @returns `string` if somewhere in between, with explanation.
   */
  async getUserMFAEnabled(accessToken: string) {
    const result = await this.getUser(accessToken);

    const expected = 'SOFTWARE_TOKEN_MFA';
    const isPreferred = result.PreferredMfaSetting === expected;
    const isEnabled = result.UserMFASettingList?.includes(expected);
    if (isPreferred && isEnabled) {
      return true;
    }
    if (isPreferred) {
      return 'Software MFA is preferred but not enabled';
    }
    if (isEnabled) {
      return 'Software MFA is enabled but not preferred';
    }
    return false;
  }
}
