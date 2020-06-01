import { Injectable, Inject } from '@angular/core';
import { ILogConsumer } from '../log-consumer.interface';
import { LogLevel } from 'src/app/shared/enums/log-levels';
import { LOG_STORE } from 'src/app/shared/tokens/log-level';
import { ILogger } from '../logger.interface';
import { LoggerService } from '../logger.service';

interface ILogLine {
  readonly level: LogLevel;
  readonly data: string;
  readonly timestamp: number;
}

@Injectable({
  providedIn: 'root',
})
export class SerializationAdapterService extends ILogConsumer {
  #loggedData: ILogLine[] = [];

  get loggedData(): ReadonlyArray<ILogLine> {
    return this.#loggedData;
  }

  constructor(
    @Inject(LOG_STORE) doStore: boolean,
    readonly logger: LoggerService
  ) {
    super();

    if (doStore) {
      this.logger.observables[LogLevel.debug].subscribe((d) =>
        this.debug(...d)
      );
      this.logger.observables[LogLevel.table].subscribe(([t, p]) =>
        this.table(t, p)
      );
      this.logger.observables[LogLevel.log].subscribe((d) => this.log(...d));
      this.logger.observables[LogLevel.info].subscribe((d) => this.info(...d));
      this.logger.observables[LogLevel.assert].subscribe(([c, d]) =>
        this.assert(c, ...d)
      );
      this.logger.observables[LogLevel.trace].subscribe((d) =>
        this.trace(...d)
      );
      this.logger.observables[LogLevel.warn].subscribe((d) => this.warn(...d));
      this.logger.observables[LogLevel.error].subscribe((d) =>
        this.error(...d)
      );
    }
  }

  private _logger(logLevel: LogLevel, args: any[]): void {
    this.#loggedData.push({
      level: logLevel,
      data: JSON.stringify(args),
      timestamp: Date.now(),
    });
  }

  debug(...data: any[]): void {
    this._logger(LogLevel.debug, data);
  }

  error(...data: any[]): void {
    this._logger(LogLevel.error, data);
  }

  info(...data: any[]): void {
    this._logger(LogLevel.info, data);
  }

  assert(condition: any, ...data: any[]): void {
    if (!!condition) {
      const message = 'Assertion failed';
      if (!data.length) {
        data.push(message);
      } else {
        const first = data[0];
        if (typeof first !== 'string') {
          data.unshift(message);
        } else {
          const concat = `${message}: ${first}`;
          data[0] = concat;
        }
      }

      this._logger(LogLevel.assert, data);
    }
  }

  log(...data: any[]): void {
    this._logger(LogLevel.log, data);
  }

  table<T = any>(tabularData: T[], properties?: string[] | undefined): void {
    const outTable = [] as any[][];

    if (!tabularData.length || properties?.length === 0) {
      // if there cannot be data to show
    } else if (properties || tabularData[0] instanceof Object) {
      // if properties are given
      properties = properties ?? this._getProperties(tabularData);

      let index = 0;
      for (const datum of tabularData) {
        const outRow = [index];
        outTable.push(outRow);
        for (const prop of properties) {
          outRow.push((datum as any)[prop]);
        }
        index++;
      }
      outTable.unshift(['(index)', ...properties]);
    } else {
      tabularData.forEach((val, idx) => outTable.push([idx, val]));
      outTable.unshift(['(index)', 'Values']);
    }

    this._logger(LogLevel.log, outTable);
  }

  trace(...data: any[]): void {
    const stack = new Error().stack ?? '<< Stack Tracing Unsupported >>';
    this._logger(LogLevel.trace, [data, stack?.split('\n')]);
  }

  warn(...data: any[]): void {
    this._logger(LogLevel.warn, data);
  }

  private _getProperties<T>(tabularData: T[]): string[] {
    let bestGuessProps: string[] = [];
    let bestGuessLen = 0;
    for (const tData of tabularData) {
      const latestKeys = Object.keys(tData);
      if (latestKeys.length > bestGuessLen) {
        bestGuessProps = latestKeys;
        bestGuessLen = latestKeys.length;
      }
    }
    return bestGuessProps;
  }
}
