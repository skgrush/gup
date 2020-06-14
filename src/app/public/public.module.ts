// External Modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// My Modules

// This Module's Declarations
import { OauthComponent } from './components/oauth/oauth.component';

// This Module's Provisions
import { OAuthProvider } from './services/oauth/oauth-provider.interface';
import { IEnvConfigService } from './services/env-config/env-config.interface';
import { EnvConfigService } from './services/env-config/env-config.service';

// Other References
import { LoggerService } from '../gup-common/services/logger/logger.service';
import { CognitoService } from './services/oauth/cognito.service';

@NgModule({
  declarations: [OauthComponent],
  imports: [CommonModule],
  providers: [
    {
      provide: OAuthProvider,
      useClass: CognitoService,
    },
    {
      provide: IEnvConfigService,
      useClass: EnvConfigService,
    },
  ],
  exports: [CommonModule, OauthComponent],
})
export class PublicModule {
  constructor(readonly logger: LoggerService) {
    logger.initialize('Public', 'module', this);
  }
}
