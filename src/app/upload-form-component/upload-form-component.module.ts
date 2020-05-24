import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadFormComponent } from './components/upload-form/upload-form.component';

@NgModule({
  declarations: [UploadFormComponent],
  imports: [CommonModule],
  exports: [UploadFormComponent],
})
export class UploadFormComponentModule {}
