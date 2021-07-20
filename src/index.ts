import { confirmEmail } from './confirmationHook';
import { customClaim } from './customClaim';
import { matchingService } from './eventMatching';
import { populateDb } from './populateDb';

export const matchService = matchingService;
export const populateDbService = populateDb;
export const customClaimService = customClaim;
export const confirmation = confirmEmail;
