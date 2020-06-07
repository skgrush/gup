// tslint:disable:no-console

import { Injectable, Inject } from '@angular/core';
import { LogLevel } from 'src/app/shared/enums/log-levels';
import { LOG_LEVEL } from 'src/app/shared/tokens/log-level';
import { Subject } from 'rxjs';
import { ILogConsumer } from './log-consumer.interface';
import { LOG_CONSUMER } from '../../tokens/log-consumer';

const _startTime = Date.now();

type LogInitializeCategory =
  | 'module'
  | 'service'
  | 'component'
  | 'guard'
  | 'directive';
type OtherServiceMethods = 'initialize';

function categoryIsStorable(cat: LogInitializeCategory) {
  switch (cat) {
    case 'module':
    case 'service':
      return true;
    default:
      return false;
  }
}

@Injectable({
  providedIn: null,
})
export class LoggerService {
  private static readonly _aliases: [
    keyof typeof LogLevel,
    ...OtherServiceMethods[]
  ][] = [['debug', 'initialize']];

  #logLevel: LogLevel;

  public readonly observables = Object.freeze({
    [LogLevel.debug]: new Subject<any[]>(),
    [LogLevel.table]: new Subject<[Array<any>, string[] | undefined]>(),
    [LogLevel.log]: new Subject<any[]>(),
    [LogLevel.assert]: new Subject<[any, any[]]>(),
    [LogLevel.trace]: new Subject<any[]>(),
    [LogLevel.info]: new Subject<any[]>(),
    [LogLevel.warn]: new Subject<any[]>(),
    [LogLevel.error]: new Subject<any[]>(),
  });

  public static readonly _noop = function _noop() {};

  constructor(
    @Inject(LOG_LEVEL) logLevel: LogLevel,
    @Inject(LOG_CONSUMER) readonly consumers: ILogConsumer[]
  ) {
    if (!LogLevel[logLevel]) {
      throw new Error(`Unsupported LogLevel provider value '${logLevel}'`);
    }

    this.#logLevel = logLevel;

    for (const lvl of [
      'debug',
      'table',
      'log',
      'assert',
      'trace',
      'info',
      'warn',
      'error',
    ] as const) {
      if (this.#logLevel <= LogLevel[lvl]) {
        this[lvl] = this[lvl].bind(this);
      } else {
        this[lvl] = LoggerService._noop;
      }
    }

    for (const [lvl, ...aliases] of LoggerService._aliases) {
      if (this.#logLevel <= LogLevel[lvl]) {
        aliases.forEach((alias) => (this[alias] = this[alias].bind(this)));
      } else {
        aliases.forEach((alias) => (this[alias] = LoggerService._noop));
      }
    }

    this.initialize('Logger', 'service', this, {
      consumers: this.consumers,
      logLevel: LogLevel[this.#logLevel],
    });
    this.info(`Log level set to ${LogLevel[this.#logLevel]}`);
  }

  /**
   * Initializing a class named `type` which is a `category` (e.g. 'service')
   * whose instance is `caller`, with additional info logged in `...log`.
   *
   * @param type - name of the type of `caller`.
   * @param category - category of `caller`.
   * @param caller - instance being initialized.
   * @param log - any additional parameters.
   */
  initialize<T>(
    type: string,
    category: LogInitializeCategory,
    caller: T,
    ...log: any[]
  ) {
    const now = Date.now() - _startTime;
    const msg = `Initialized ${type} ${category} at ${now}`;
    const callerArg = categoryIsStorable(category) ? [caller] : '';
    this.debug(msg, callerArg, ...log);
  }

  // ------------------------------ Log Levels ------------------------------ //
  debug(...data: any[]): void {
    console.debug(...data);
    this.observables[LogLevel.debug].next(data);
  }
  table(tabularData: any[], properties?: string[] | undefined): void {
    console.table(tabularData, properties);
    this.observables[LogLevel.table].next([tabularData, properties]);
  }
  log(...data: any[]): void {
    console.log(...data);
    this.observables[LogLevel.log].next(data);
  }
  assert(condition: any, ...data: any[]): void {
    console.assert(condition, ...data);
    this.observables[LogLevel.assert].next([condition, data]);
  }
  trace(...data: any[]): void {
    console.trace(...data);
    this.observables[LogLevel.trace].next(data);
  }
  info(...data: any[]): void {
    console.info(...data);
    this.observables[LogLevel.info].next(data);
  }
  warn(...data: any[]): void {
    console.warn(...data);
    this.observables[LogLevel.warn].next(data);
  }
  error(...data: any[]): void {
    console.error(...data);
    this.observables[LogLevel.error].next(data);
  }
}
