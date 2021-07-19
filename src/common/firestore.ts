import { firestore } from 'firebase-admin';

import {
  admin,
  EventDetailsDbItem,
  EventStatus,
  MatchedEmailNotificationObject,
  UserDetailsDbItem,
} from './';
import { log } from './config';

const db = admin.firestore();

export const updateEventStatusToMatched = async (eventId: string): Promise<void> => {
  try {
    log('info', 'Updating event status in db');
    await db.doc(`events/${eventId}`).update({
      status: EventStatus.Matched,
      matches: firestore.FieldValue.increment(1),
    });
    log('info', 'Successfully updated event status in db');
  } catch (error) {
    log('error', 'Error updating event status in db');
    throw error;
  }
};

export const createEmailRequestToDb = async (
  emailNotificationObject: MatchedEmailNotificationObject,
): Promise<void> => {
  try {
    log('info', 'Creating email request in db', { emailNotificationObject });
    await db.collection('mail').add({
      ...emailNotificationObject,
    });
    log('info', 'Successfully created email request in db');
    return;
  } catch (error) {
    log('error', 'Error created email request in db');
    throw error;
  }
};

export const getUserDetails = async (userId: string): Promise<UserDetailsDbItem | undefined> => {
  try {
    log('info', 'Get user details from db', { userId });
    const snapshot = await db.doc(`users/${userId}`).get();
    log('info', 'Successfully get user details from db');

    const data = snapshot.data();
    if (!data) return;

    return snapshot.data() as UserDetailsDbItem;
  } catch (error) {
    log('error', 'Error getting user details from db');
    throw error;
  }
};

export const getEventDetails = async (eventId: string): Promise<EventDetailsDbItem | undefined> => {
  try {
    log('info', 'Get event details from db', { eventId });
    const snapshot = await db.doc(`events/${eventId}`).get();
    log('info', 'Successfully get event details from db');

    const data = snapshot.data();
    if (!data) return;

    return snapshot.data() as EventDetailsDbItem;
  } catch (error) {
    log('error', 'Error getting event details from db');
    throw error;
  }
};
