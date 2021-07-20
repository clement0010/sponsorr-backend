import { createHmac } from 'crypto';

import { BASE_URL, EMAIL_SOURCE } from './config';
import {
  Attachment,
  ConfirmationEmailObject,
  MatchedEmailNotificationObject,
  MatchedEmailParams,
  SponsorEvents,
} from './types';
import { baseEvent } from '../test/db.fixtures';

export const buildEmailNotificationObject = (
  userId: string,
  matchedEmailParams: MatchedEmailParams,
  attachment?: Attachment,
): MatchedEmailNotificationObject => {
  const emailObject: MatchedEmailNotificationObject = {
    from: EMAIL_SOURCE,
    toUids: [userId],
    template: {
      name: 'matched',
      data: matchedEmailParams,
    },
  };

  if (attachment?.filename) {
    emailObject.message = {
      attachments: [attachment],
    };
  }

  return emailObject;
};

export const buildConfirmationEmailObject = (
  userId: string,
  username: string,
  webhookUrl: string,
): ConfirmationEmailObject => {
  const emailObject: ConfirmationEmailObject = {
    from: EMAIL_SOURCE,
    toUids: [userId],
    template: {
      name: 'confirmation',
      data: { username, webhookUrl },
    },
  };

  return emailObject;
};

export const generateEvents = (userId: string, length: number): SponsorEvents => {
  const result: SponsorEvents = [];

  for (let i = 0; i < length; i++) {
    result.push({
      userId,
      ...baseEvent(),
    });
  }
  return result;
};

export const generateWebhookHash = (email: string, uid: string, secret: string): string => {
  const hmac = createHmac('sha256', secret);
  hmac.update(email).update(uid);

  return hmac.digest('hex');
};

export const generateWebhookUrl = (email: string, uid: string, secret: string): string => {
  const hash = generateWebhookHash(email, uid, secret);
  return `${BASE_URL}confirmation?hash=${hash}&emailAddress=${email}&id=${uid}`;
};
