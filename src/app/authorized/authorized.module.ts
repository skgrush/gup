// External Modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// My Modules
import { AuthorizedRoutingModule } from './authorized-routing.module';

// This Module's Declarations
import { FileManagerModule } from './file-manager/file-manager.module';
import { AuthorizedComponent } from './authorized.component';
import { SettingsModule } from './settings/settings.module';

console.debug('loaded authorized module');

@NgModule({
  declarations: [AuthorizedComponent],
  imports: [
    CommonModule,
    // my modules
    AuthorizedRoutingModule,
    SettingsModule,
    FileManagerModule,
  ],
  exports: [],
})
export class AuthorizedModule {}
