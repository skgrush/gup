// External Modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// This Module's Declarations
import { ByteFormatPipe } from './pipes/byte-format.pipe';
import { SerializationAdapterService } from './services/logger/log-consumers/serialization-adapter.service';
import { LoggerService } from './services/logger/logger.service';
import { LOG_CONSUMER } from './tokens/log-consumer';

@NgModule({
  declarations: [ByteFormatPipe],
  imports: [CommonModule],
  exports: [ByteFormatPipe],
  providers: [
    {
      provide: LOG_CONSUMER,
      useClass: SerializationAdapterService,
      multi: true,
    },
    {
      provide: LoggerService,
      useClass: LoggerService,
    },
  ],
})
export class GupCommonModule {
  constructor(readonly logger: LoggerService) {
    this.logger.initialize('GupCommon', 'module', this);
  }
}
