// External Modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// My Modules
import { GupCommonModule } from 'src/app/gup-common/gup-common.module';
import { TabbedComponentModule } from 'src/app/tabbed-component/tabbed-component.module';

// This Module's Declarations
import { AuthedSettingsComponent } from './settings.component';
import { QrComponent } from './components/qr/qr.component';
import { TotpQrPopupComponent } from './components/totp-qr-popup/totp-qr-popup.component';

@NgModule({
  declarations: [AuthedSettingsComponent, QrComponent, TotpQrPopupComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    GupCommonModule,
    TabbedComponentModule,
  ],
  exports: [AuthedSettingsComponent],
})
export class SettingsModule {}
