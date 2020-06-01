import { InjectionToken } from '@angular/core';
import { LogLevel } from '../enums/log-levels';

/** The lowest logged LogLevel */
export const LOG_LEVEL = new InjectionToken<LogLevel>('gup:log_level');
/** Whether or not to internally store logs */
export const LOG_STORE = new InjectionToken<boolean>('gup:log_store');
