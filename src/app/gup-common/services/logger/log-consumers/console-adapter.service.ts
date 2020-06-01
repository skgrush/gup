// tslint:disable:no-console
import { Injectable, Inject } from '@angular/core';
import { ILogConsumer } from '../log-consumer.interface';
import { LoggerService } from '../logger.service';
import { LogLevel } from 'src/app/shared/enums/log-levels';

@Injectable({
  providedIn: 'root',
})
export class ConsoleAdapterService extends ILogConsumer {
  constructor(logger: LoggerService) {
    super();

    logger.observables[LogLevel.debug].subscribe((d) => console.debug(...d));
    logger.observables[LogLevel.table].subscribe(([t, p]) =>
      console.table(t, p)
    );
    logger.observables[LogLevel.log].subscribe((d) => console.log(...d));
    logger.observables[LogLevel.info].subscribe((d) => console.info(...d));
    logger.observables[LogLevel.assert].subscribe(([c, d]) =>
      console.assert(c, ...d)
    );
    logger.observables[LogLevel.trace].subscribe((d) => console.trace(...d));
    logger.observables[LogLevel.warn].subscribe((d) => console.error(...d));
  }
}
