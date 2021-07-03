import { logger } from 'firebase-functions';

import { LogType } from './types';

export const log = (type: LogType, message: string, data?: Record<string, unknown>): void => {
  switch (type) {
    case 'info':
      logger.info(message, data);

      break;
    case 'error':
      logger.error(message, data);

      break;
    case 'warn':
      logger.warn(message, data);

      break;
  }
};

export const REGION = 'asia-southeast2';
