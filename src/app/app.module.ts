import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { LocationStrategy } from '@angular/common';
import { ServiceWorkerModule } from '@angular/service-worker';
import { ReactiveFormsModule } from '@angular/forms';

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
import { FileCellSizeComponent } from './components/file-manager/file-cell/file-cell-size.component';
import { FileCellContenttypeComponent } from './components/file-manager/file-cell/file-cell-contenttype.component';
import { FileCellLastmodifiedComponent } from './components/file-manager/file-cell/file-cell-lastmodified.component';
import { FileCellUploaderComponent } from './components/file-manager/file-cell/file-cell-uploader.component';
import { DraggableHeaderDirective } from './directives/draggable-header.directive';
import { SHOW_DEBUG } from './tokens';
import { UploadFormComponent } from './components/upload-form/upload-form.component';
import { TabbedComponent } from './components/tabbed/tabbed.component';
import { TabPanelComponent } from './components/tab-panel/tab-panel.component';
import { TabComponent } from './components/tab/tab.component';

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
    FileCellSizeComponent,
    FileCellContenttypeComponent,
    FileCellLastmodifiedComponent,
    FileCellUploaderComponent,
    DraggableHeaderDirective,
    UploadFormComponent,
    TabbedComponent,
    TabPanelComponent,
    TabComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    ReactiveFormsModule,
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
    {
      provide: SHOW_DEBUG,
      useValue: false,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
