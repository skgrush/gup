import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OAuthProvider } from './services/oauth/oauth-provider.interface';
import { OAuthProviderPicker } from './services/oauth/oauth-provider-picker';
import { IEnvConfigService } from './services/env-config/env-config.interface';
import { EnvConfigService } from './services/env-config/env-config.service';
import { OauthComponent } from './components/oauth/oauth.component';
import { TestUiComponent } from './components/test-ui/test-ui.component';
import { ApiService } from '../authorized/services/api/api.service';
import { ApiAuthService } from './services/api/api-auth.service';

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
  exports: [
    OauthComponent,
    TestUiComponent,
    ApiService,
    ApiAuthService,
    EnvConfigService,
  ],
})
export class PublicModule {}
