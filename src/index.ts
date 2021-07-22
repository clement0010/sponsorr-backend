import { confirmEmail } from './confirmationHook';
import { customClaim } from './customClaim';
import { matchingCronJobService, matchingService } from './customMatching';
import { matchNotificationService, matchStatusTrigger } from './eventMatching';
import { populateDb } from './populateDb';

export const notificationService = matchNotificationService;
export const populateDbService = populateDb;
export const customClaimService = customClaim;
export const confirmation = confirmEmail;
export const matchService = matchingService;
export const matchCronJobService = matchingCronJobService;
export const eventStatusChangeService = matchStatusTrigger;
