export abstract class ILogger {
  abstract debug(...data: any[]): void;

  abstract table(tabularData: object | any[], properties?: string[]): void;

  abstract log(...data: any[]): void;

  abstract info(...data: any[]): void;

  abstract assert(condition: any, ...data: any[]): void;

  abstract trace(...data: any[]): void;

  abstract warn(...data: any[]): void;

  abstract error(...data: any[]): void;
}
