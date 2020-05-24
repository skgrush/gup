import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { LocationStrategy } from '@angular/common';
import { ServiceWorkerModule } from '@angular/service-worker';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { QueryLocationStrategy } from './classes/query-location-strategy';
import { KeyStore } from './classes/key-store';
import { DraggableHeaderDirective } from './directives/draggable-header.directive';
import { SHOW_DEBUG } from './tokens';
import { TabbedComponentModule } from './tabbed-component/tabbed-component.module';
import { UploadFormComponentModule } from './upload-form-component/upload-form-component.module';
import { GupCommonModule } from './gup-common/gup-common.module';
import { AuthorizedModule } from './authorized/authorized.module';
import { PublicModule } from './public/public.module';

@NgModule({
  declarations: [AppComponent, DraggableHeaderDirective],
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
