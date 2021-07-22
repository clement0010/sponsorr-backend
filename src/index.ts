import { confirmEmail } from './confirmationHook';
import { customClaim } from './customClaim';
import { matchingService } from './customMatching';
import { matchNotificationService } from './eventMatching';
import { populateDb } from './populateDb';

export const notificationService = matchNotificationService;
export const populateDbService = populateDb;
export const customClaimService = customClaim;
export const confirmation = confirmEmail;
export const matchCronJobService = matchingService;
