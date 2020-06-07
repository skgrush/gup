// External Modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// My Modules

// This Module's Declarations
import { OauthComponent } from './components/oauth/oauth.component';
import { TestUiComponent } from './components/test-ui/test-ui.component';

// This Module's Provisions
import { OAuthProvider } from './services/oauth/oauth-provider.interface';
import { OAuthProviderPicker } from './services/oauth/oauth-provider-picker';
import { IEnvConfigService } from './services/env-config/env-config.interface';
import { EnvConfigService } from './services/env-config/env-config.service';

// Other References
import { LoggerService } from '../gup-common/services/logger/logger.service';

@NgModule({
  declarations: [OauthComponent, TestUiComponent],
  imports: [CommonModule],
  providers: [
    {
      provide: OAuthProvider,
      useClass: OAuthProviderPicker(),
    },
    {
      provide: IEnvConfigService,
      useClass: EnvConfigService,
    },
  ],
  exports: [CommonModule, OauthComponent, TestUiComponent],
})
export class PublicModule {
  constructor(readonly logger: LoggerService) {
    logger.initialize('Public', 'module', this);
  }
}
