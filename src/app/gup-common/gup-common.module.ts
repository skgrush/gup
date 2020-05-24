// External Modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// This Module's Declarations
import { ByteFormatPipe } from './pipes/byte-format.pipe';

console.debug('loaded gup-common module');

@NgModule({
  declarations: [ByteFormatPipe],
  imports: [CommonModule],
  exports: [ByteFormatPipe],
})
export class GupCommonModule {}
