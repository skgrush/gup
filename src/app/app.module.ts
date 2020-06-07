// External Modules
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ServiceWorkerModule } from '@angular/service-worker';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// My Modules
import { GupCommonModule } from './gup-common/gup-common.module';
import { PublicModule } from './public/public.module';
import { AppRoutingModule } from './app-routing.module';

// This Module's Declarations
import { AppComponent } from './app.component';

// This Module's Provisions
import { LocationStrategy } from '@angular/common';
import { QueryLocationStrategy } from 'src/app/shared/classes/query-location-strategy';
import { KeyStore } from 'src/app/shared/classes/key-store';
import { SHOW_DEBUG } from './shared/tokens/debug';

// Other References
import { environment } from '../environments/environment';
import { LOG_LEVEL, LOG_STORE } from './shared/tokens/log-level';
import { LoggerService } from './gup-common/services/logger/logger.service';

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
    {
      provide: LOG_LEVEL,
      useValue: environment.logLevel,
    },
    {
      provide: LOG_STORE,
      useValue: false,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(readonly logger: LoggerService) {
    logger.initialize('App', 'module', this);
  }
}
