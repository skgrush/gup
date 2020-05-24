import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadFormComponent } from './components/upload-form/upload-form.component';
import { GupCommonModule } from '../gup-common/gup-common.module';
import { TabbedComponentModule } from '../tabbed-component/tabbed-component.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [UploadFormComponent],
  imports: [
    CommonModule,
    GupCommonModule,
    TabbedComponentModule,
    ReactiveFormsModule,
  ],
  exports: [UploadFormComponent],
})
export class UploadFormComponentModule {}
