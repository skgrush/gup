import { Injectable, Inject } from '@angular/core';
import { ILogger } from './logger.interface';
import { LogLevel } from 'src/app/shared/enums/log-levels';
import { LOG_LEVEL } from 'src/app/shared/tokens/log-level';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoggerService extends ILogger {
  #logLevel: LogLevel;

  public readonly observables = Object.freeze({
    [LogLevel.debug]: new Subject<any[]>(),
    [LogLevel.table]: new Subject<[Array<any>, string[] | undefined]>(),
    [LogLevel.log]: new Subject<any[]>(),
    [LogLevel.info]: new Subject<any[]>(),
    [LogLevel.assert]: new Subject<[any, any[]]>(),
    [LogLevel.trace]: new Subject<any[]>(),
    [LogLevel.warn]: new Subject<any[]>(),
    [LogLevel.error]: new Subject<any[]>(),
  });

  constructor(@Inject(LOG_LEVEL) logLevel: LogLevel) {
    super();
    if (!LogLevel[logLevel]) {
      throw new Error(`Unsupported LogLevel provider value '${logLevel}'`);
    }

    this.#logLevel = logLevel;
  }

  debug(...data: any[]): void {
    this.observables[LogLevel.debug].next(data);
  }
  table(tabularData: any[], properties?: string[] | undefined): void {
    this.observables[LogLevel.table].next([tabularData, properties]);
  }
  log(...data: any[]): void {
    this.observables[LogLevel.log].next(data);
  }
  info(...data: any[]): void {
    this.observables[LogLevel.info].next(data);
  }
  assert(condition: any, ...data: any[]): void {
    this.observables[LogLevel.assert].next([condition, data]);
  }
  trace(...data: any[]): void {
    this.observables[LogLevel.trace].next(data);
  }
  warn(...data: any[]): void {
    this.observables[LogLevel.warn].next(data);
  }
  error(...data: any[]): void {
    this.observables[LogLevel.error].next(data);
  }
}
