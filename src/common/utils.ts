import { createHmac } from 'crypto';

import { BASE_URL, EMAIL_SOURCE, LOWER_TOLERANCE, Status, UPPER_TOLERANCE } from './config';
import {
  Attachment,
  Budget,
  ConfirmationEmailObject,
  MatchedEmailNotificationObject,
  MatchedEmailParams,
  Matches,
  SponsorEvent,
  SponsorEventDbItems,
  SponsorEvents,
  Sponsors,
  Subscription,
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

export const parseUserEventId = (userId: string, eventId: string): string => {
  return `${userId}#${eventId}`;
};

const isBetween = (lowerBoundary: number, upperBoundary: number, value: number): boolean => {
  return lowerBoundary <= value && value <= upperBoundary;
};

const isSubset = (sponsorDemographic: string[], eventDemographic: string[]): boolean => {
  return eventDemographic.every((demographic) => sponsorDemographic.includes(demographic));
};

/**
 * We assume event budget is quite flexible since they are being sponsored and have more room
 * for negotiation.
 *
 * Sponsor budget is stricter as very unlikely to increase budget to sponsor.
 * Note: sponsor's minimum budget is to filter out smaller scale events.
 */
export const budgetTolerance = (sponsorBudget: Budget, eventBudget: number): boolean => {
  const eventMax = eventBudget * UPPER_TOLERANCE;
  const eventMin = eventBudget * LOWER_TOLERANCE;

  const { minimum, maximum } = sponsorBudget;
  return (
    isBetween(minimum, maximum, eventBudget) ||
    isBetween(minimum, maximum, eventMin) ||
    isBetween(minimum, maximum, eventMax)
  );
};

/**
 * Sponsor can be flexible for the event size upper, the more the merrier.
 * Event minimum bound is not relevant for this case.
 */
export const eventSizeTolerance = (sponsorPreferredSize: number, eventSize: number): boolean => {
  const eventMax = sponsorPreferredSize * UPPER_TOLERANCE;
  return eventSize <= eventMax;
};

/**
 * Matching algorithm parameters
 * - Budget: As explained above, we have a tolerance to allow sponsor to be matched to more events.
 * Generally, we would assume event organiser can organise as many events as they want. Hence sponsor
 * is slightly prioritise in this sense
 * - Demographic: Event demographic must be a subset of sponsor as sponsor does not want to target the wrong audience.
 * - Event Size: This parameters favour the organiser more as this is their event and sponsor most likely has to accommodate for this.
 */
export const isMatch = (subscription: Subscription, event: SponsorEvent): boolean => {
  const { budget, eventSize: sponsorPreferredSize, demographic } = subscription;

  const { eventSize, budget: eventBudget, demographic: eventDemographic } = event;

  return (
    budgetTolerance(budget, eventBudget) &&
    isSubset(demographic, eventDemographic) &&
    eventSizeTolerance(sponsorPreferredSize, eventSize)
  );
};

const matchedBefore = (matchId: string, matchedIds: string[]): boolean => {
  return matchedIds.includes(matchId);
};

export const matchingAlgorithm = (
  sponsors: Sponsors,
  events: SponsorEventDbItems,
  matchedIds: string[],
): Matches => {
  const result: Matches = [];
  sponsors.forEach((sponsor) => {
    const { id, subscription } = sponsor;

    events.forEach((event) => {
      const { eventId, userId } = event;
      const userEventId = parseUserEventId(id, eventId);
      if (matchedBefore(userEventId, matchedIds)) return;

      if (!isMatch(subscription, event)) return;

      result.push({
        eventId,
        organiserId: userId,
        userId: id,
        status: Status.Pending,
        organiserStatus: Status.Pending,
        sponsorStatus: Status.Pending,
        createdAt: Math.round(Date.now() / 1000),
      });
    });
  });

  return result;
};
