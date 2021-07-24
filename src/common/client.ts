import { region } from 'firebase-functions';
import * as firebaseAdmin from 'firebase-admin';

import { REGION } from './config';

firebaseAdmin.initializeApp();

export const functions = region(REGION);
export const admin = firebaseAdmin;
export const db = admin.firestore();
