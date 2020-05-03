import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { LocationStrategy } from '@angular/common';
import { ServiceWorkerModule } from '@angular/service-worker';

import { AppComponent } from './app.component';
import { environment } from '../environments/environment';
import { OauthComponent } from './components/oauth/oauth.component';
import { OAuthProvider } from './services/oauth/oauth-provider.interface';
import { TestUiComponent } from './components/test-ui/test-ui.component';
import { MainComponent } from './components/main/main.component';
import { AppRoutingModule } from './app-routing.module';
import { QueryLocationStrategy } from './classes/query-location-strategy';
import { OAuthProviderPicker } from './services/oauth/oauth-provider-picker';
import { KeyStore } from './classes/key-store';
import { IEnvConfigService } from './services/env-config/env-config.interface';
import { EnvConfigService } from './services/env-config/env-config.service';
import { FileManagerComponent } from './components/file-manager/file-manager.component';
import { FileListComponent } from './components/file-manager/file-list/file-list.component';
import { FileRowComponent } from './components/file-manager/file-row/file-row.component';
import { ByteFormatPipe } from './pipes/byte-format.pipe';

@NgModule({
  declarations: [
    AppComponent,
    OauthComponent,
    TestUiComponent,
    MainComponent,
    FileListComponent,
    FileManagerComponent,
    FileRowComponent,
    ByteFormatPipe,
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
    }),
  ],
  providers: [
    {
      provide: OAuthProvider,
      useClass: OAuthProviderPicker(),
    },
    {
      provide: LocationStrategy,
      useClass: QueryLocationStrategy,
    },
    KeyStore,
    {
      provide: IEnvConfigService,
      useClass: EnvConfigService,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
