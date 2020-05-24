// External Modules
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ServiceWorkerModule } from '@angular/service-worker';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// My Modules
import { TabbedComponentModule } from './tabbed-component/tabbed-component.module';
import { UploadFormComponentModule } from './upload-form-component/upload-form-component.module';
import { GupCommonModule } from './gup-common/gup-common.module';
import { PublicModule } from './public/public.module';
import { AppRoutingModule } from './app-routing.module';

// This Module's Declarations
import { AppComponent } from './app.component';

// This Module's Provisions
import { LocationStrategy } from '@angular/common';
import { QueryLocationStrategy } from './classes/query-location-strategy';
import { KeyStore } from './classes/key-store';
import { SHOW_DEBUG } from './tokens';

// Other References
import { environment } from '../environments/environment';

@NgModule({
  declarations: [AppComponent],
  imports: [
    AppRoutingModule,
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
    }),
    // my modules
    GupCommonModule,
    TabbedComponentModule,
    UploadFormComponentModule,
    PublicModule,
  ],
  providers: [
    {
      provide: LocationStrategy,
      useClass: QueryLocationStrategy,
    },
    KeyStore,
    {
      provide: SHOW_DEBUG,
      useValue: false,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
