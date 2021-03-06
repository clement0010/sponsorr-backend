import { logger } from 'firebase-functions';

import { LogType } from './types';

export const log = (type: LogType, message: string, data?: Record<string, unknown>): void => {
  switch (type) {
    case 'info':
      logger.info(message, data || {});

      break;
    case 'error':
      logger.error(message, data || {});

      break;
    case 'warn':
      logger.warn(message, data || {});

      break;
  }
};

export const REGION = 'asia-southeast2';

export enum Status {
  Accepted = 'accepted',
  Rejected = 'rejected',
  Pending = 'pending',
}

export enum EventStatusEnum {
  Published = 'published',
  Draft = 'draft',
  Matched = 'matched',
}

export const EMAIL_SOURCE = 'Sponsorr! <support@sponsorr.me>';

export const EMAIL_CC = [
  'Clement Tee <clement.jdp15@gmail.com>',
  'Hui Zhuan <huizhuansam8@gmail.com>',
];

export const BASE_URL =
  process.env.GCLOUD_PROJECT === 'sponsorr-dev'
    ? 'https://asia-southeast2-sponsorr-dev.cloudfunctions.net/'
    : 'https://asia-southeast2-sponsorr-prod.cloudfunctions.net/';

export const APP_BASE_URL =
  process.env.GCLOUD_PROJECT === 'sponsorr-dev' ? 'http://localhost:8080/' : 'https://sponsorr.me/';

/**
 * Tolerance for numerical value in matching algorithm
 */
export const UPPER_TOLERANCE = 1.2;
export const LOWER_TOLERANCE = 0.8;
