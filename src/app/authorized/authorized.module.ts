// External Modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// My Modules
import { AuthorizedRoutingModule } from './authorized-routing.module';
import { GupCommonModule } from '../gup-common/gup-common.module';

// This Module's Declarations
import { FileManagerModule } from './file-manager/file-manager.module';
import { AuthorizedComponent } from './authorized.component';
import { SettingsModule } from './settings/settings.module';

// Other references
import { LoggerService } from '../gup-common/services/logger/logger.service';

@NgModule({
  declarations: [AuthorizedComponent],
  imports: [
    CommonModule,
    // my modules
    GupCommonModule,
    AuthorizedRoutingModule,
    SettingsModule,
    FileManagerModule,
  ],
  exports: [],
})
export class AuthorizedModule {
  constructor(logger: LoggerService) {
    logger.initialize('Authorize', 'module', this);
  }
}
