import { EMAIL_SOURCE } from './config';
import { Attachment, MatchedEmailNotificationObject, MatchedEmailParams } from './types';

export const buildEmailNotificationObject = (
  emailAddress: string,
  matchedEmailParams: MatchedEmailParams,
  attachment?: Attachment,
): MatchedEmailNotificationObject => {
  const emailObject: MatchedEmailNotificationObject = {
    from: EMAIL_SOURCE,
    toUids: [emailAddress],
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
