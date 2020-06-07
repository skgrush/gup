import { InjectionToken } from '@angular/core';
import { ILogConsumer } from '../services/logger/log-consumer.interface';

export const LOG_CONSUMER = new InjectionToken<ILogConsumer[]>('log-consumer');
