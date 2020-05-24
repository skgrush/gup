import { GoogleService } from './google.service';
import { CognitoService } from './cognito.service';

// usually we want to async-load env.json, but this is compile-time loaded
import { oauth } from '../../../../../env.json';

export function OAuthProviderPicker() {
  switch (oauth.provider) {
    case 'cognito':
      return CognitoService;
    case 'google':
      return GoogleService;
    default:
      throw new Error(
        `No OAuth Provider selectable from env.oauth.provider: ${oauth.provider}`
      );
  }
}
