import { firestore } from 'firebase-admin';

import {
  admin,
  ConfirmationEmailObject,
  db,
  EventDetailsDbItem,
  EventStatusEnum,
  generateEvents,
  MatchedEmailNotificationObject,
  UserDetailsDbItem,
} from './';
import { log } from './config';

export const updateEventStatusToMatched = async (eventId: string): Promise<void> => {
  try {
    log('info', 'Updating event status in db');
    await db.doc(`events/${eventId}`).update({
      status: EventStatusEnum.Matched,
      matches: firestore.FieldValue.increment(1),
    });
    log('info', 'Successfully updated event status in db');
  } catch (error) {
    log('error', 'Error updating event status in db');
    throw error;
  }
};

export const createEmailRequestToDb = async (
  emailNotificationObject: MatchedEmailNotificationObject | ConfirmationEmailObject,
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

export const populateUserDatabase = async (userDetails: Record<string, unknown>): Promise<void> => {
  try {
    log('info', 'Save user details to db', { userDetails });
    const uid = userDetails.uid as string;
    await admin.auth().createUser({
      uid,
      email: userDetails.email as string,
      password: 'test1234',
    });
    delete userDetails['uid'];
    delete userDetails['email_verified'];
    await db
      .collection('users')
      .doc(uid as string)
      .set(userDetails);
    log('info', 'Successfully save user details to db');
  } catch (error) {
    log('error', 'Error saving user details to db');
    throw error;
  }
};

export const populateEventDatabase = async (
  organiserDetails: Record<string, unknown>,
): Promise<void> => {
  try {
    log('info', 'Save event details to db', { organiserDetails });
    const batch = db.batch();

    const collection = db.collection('events');

    generateEvents(organiserDetails.uid as string, 100).forEach((event) => {
      const document = collection.doc(event.uuid || '');
      delete event['uuid'];
      batch.set(document, event);
    });
    await batch.commit();

    log('info', 'Successfully save event details to db');
  } catch (error) {
    log('error', 'Error saving event details to db');
    throw error;
  }
};
