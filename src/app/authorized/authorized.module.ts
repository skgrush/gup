// External Modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// My Modules
import { GupCommonModule } from '../gup-common/gup-common.module';
import { TabbedComponentModule } from '../tabbed-component/tabbed-component.module';
import { UploadFormComponentModule } from './upload-form-component/upload-form-component.module';
import { AuthorizedRoutingModule } from './authorized-routing.module';

// This Module's Declarations
import { AuthedSettingsComponent } from './components/authed-settings/authed-settings.component';
import { MainComponent } from './components/main/main.component';
import { QrComponent } from './components/qr/qr.component';
import { TotpQrPopupComponent } from './components/totp-qr-popup/totp-qr-popup.component';

console.debug('loaded authorized module');

@NgModule({
  declarations: [
    AuthedSettingsComponent,
    MainComponent,
    QrComponent,
    TotpQrPopupComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    // my modules
    GupCommonModule,
    TabbedComponentModule,
    AuthorizedRoutingModule,
    UploadFormComponentModule,
  ],
  exports: [],
})
export class AuthorizedModule {}
