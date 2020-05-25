// External Modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// My Modules
import { GupCommonModule } from '../gup-common/gup-common.module';
import { TabbedComponentModule } from '../tabbed-component/tabbed-component.module';
import { AuthorizedRoutingModule } from './authorized-routing.module';

// This Module's Declarations
import { FileManagerModule } from './file-manager/file-manager.module';
import { AuthorizedComponent } from './authorized.component';

console.debug('loaded authorized module');

@NgModule({
  declarations: [AuthorizedComponent],
  imports: [
    CommonModule,
    // my modules
    AuthorizedRoutingModule,
    FileManagerModule,
  ],
  exports: [],
})
export class AuthorizedModule {}
