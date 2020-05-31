import { Observable } from 'rxjs';
import { Readyable } from 'src/app/shared/classes/readyable';

export type ProviderString = 'cognito' | 'google';

export interface IEnvOAuth {
  provider: ProviderString;
  endpoint: string;
  clientId: string;
  redirectUri?: string;
}

export interface IEnv {
  /** ARN for the role to assume */
  awsRoleArn?: string;
  /** the AWS region for your identity pool */
  awsIdentityRegion: string;
  /** the identity pool GUID */
  awsIdentityGuid: string;
  /** the identity pool ID of REGION:GUID */
  awsIdentityPool: string;
  /** the user pool identifier after the region and underscore */
  awsUserPoolSuffix: string;
  /** the user pool ID of REGION:SUFFIX */
  awsUserPool: string;
  /** ARN of the S3 endpoint we'll hit */
  awsS3EndpointARN: string;
  /** "Limits the response to keys that begin with the specified prefix." */
  awsS3Prefix?: string;
  /** OAuth provider information */
  oauth: IEnvOAuth;
  GOOGLE_HD?: string;
  /** Public root URL to prepend to key for linking. */
  publicRoot?: string;
  /** Name of the site. Used in titling and TOTP issuer. */
  siteName: string;
}

export abstract class IEnvConfigService extends Readyable {
  abstract readonly env: Observable<Readonly<IEnv>>;
}
