import * as fs from 'fs';
import * as path from 'path';

import * as firebase from '@firebase/rules-unit-testing';
import { firestore } from 'firebase-admin';
import { eventOrganiser1Auth, eventOrganiser2Auth, sponsor1Auth, seedEvents } from './db.fixtures';

const TEST_FIREBASE_PROJECT_ID = 'test-firestore-rules-project';

// TODO: Change this to your real Firebase Project ID
// const REAL_FIREBASE_PROJECT_ID = process.env.PROJECT_ID || 'sponsorr-dev';

before(async () => {
  // Discover which emulators are running and where by using the Emulator Hub
  // This assumes the hub is running at localhost:4400 (the default), you can check
  // by looking for the "Emulator Hub running at localhost:<port>" line in the
  // logs from firebase emulators:start
  const emulatorSettings = await firebase.discoverEmulators();
  firebase.useEmulators(emulatorSettings);

  console.log('Using emulators', emulatorSettings);

  // Load the content of the "firestore.rules" file into the emulator before running the
  // test suite. This is necessary because we are using a fake Project ID in the tests,
  // so the rules "hot reloading" behavior which works in the Web App does not apply here.
  const rulesContent = fs.readFileSync(path.resolve(__dirname, '../../firestore.rules'), 'utf8');
  await firebase.loadFirestoreRules({
    projectId: TEST_FIREBASE_PROJECT_ID,
    rules: rulesContent,
  });
});

after(() => {
  firebase.apps().forEach((app) => app.delete());
});

// Unit test the security rules
describe('Unit Testing Firebase rules', () => {
  const sponsor1 = firebase
    .initializeTestApp({
      projectId: TEST_FIREBASE_PROJECT_ID,
      auth: sponsor1Auth,
    })
    .firestore();

  const eventOrganiser1 = firebase
    .initializeTestApp({
      projectId: TEST_FIREBASE_PROJECT_ID,
      auth: eventOrganiser1Auth,
    })
    .firestore();

  const eventOrganiser2 = firebase
    .initializeTestApp({
      projectId: TEST_FIREBASE_PROJECT_ID,
      auth: eventOrganiser2Auth,
    })
    .firestore();

  const admin = firebase
    .initializeAdminApp({
      projectId: TEST_FIREBASE_PROJECT_ID,
    })
    .firestore();

  after(async () => {
    await resetData(admin, TEST_FIREBASE_PROJECT_ID);
  });

  describe('User authentication', () => {
    it('can be created by user', async () => {
      // Sponsor1 create her own user account
      await firebase.assertSucceeds(
        sponsor1
          .collection('users')
          .doc(sponsor1Auth.uid)
          .set({
            ...sponsor1Auth,
          }),
      );
      // Event Organiser 1 create her own user account
      await firebase.assertSucceeds(
        eventOrganiser1
          .collection('users')
          .doc(eventOrganiser1Auth.uid)
          .set({
            ...eventOrganiser1Auth,
          }),
      );
      // Event Organiser 2 create her own user account
      await firebase.assertSucceeds(
        eventOrganiser2
          .collection('users')
          .doc(eventOrganiser2Auth.uid)
          .set({
            ...eventOrganiser2Auth,
          }),
      );
    });

    it('can be read by other users', async () => {
      // Sponsor1 create her own user account
      await firebase.assertSucceeds(
        sponsor1.collection('users').doc(eventOrganiser1Auth.uid).get(),
      );
      // Event Organiser 1 create her own user account
      await firebase.assertSucceeds(
        eventOrganiser1.collection('users').doc(sponsor1Auth.uid).get(),
      );
    });
  });

  describe('Events', () => {
    const eventOrganiser1Collection = eventOrganiser1.collection('events');
    const eventOrganiser2Collection = eventOrganiser2.collection('events');
    const sponsor1Collection = sponsor1.collection('events');

    it('can be created and updated by the user', async () => {
      // Sponsor1 fails to create event
      await firebase.assertFails(
        sponsor1Collection.add({
          ...seedEvents[0],
        }),
      );

      // EventOrganiser1 successfully to create event
      await firebase.assertSucceeds(
        eventOrganiser1Collection.doc('event1').set({
          ...seedEvents[0],
        }),
      );

      // EventOrganiser2 fail to create event because email not verified
      await firebase.assertFails(
        eventOrganiser2Collection.doc('event2').set({
          ...seedEvents[1],
        }),
      );

      // EventOrganiser1 can update her own cart with a new title
      await firebase.assertSucceeds(
        eventOrganiser1Collection.doc('event1').update({
          title: 'Hello World',
        }),
      );
    });

    it('can be read only by anyone', async () => {
      // Sponsor1 can read event
      firebase.assertSucceeds(sponsor1Collection.doc('event1').get());

      // EventOrganiser1 can read her own event
      await firebase.assertSucceeds(eventOrganiser1Collection.doc('event1').get());

      // EventOrganiser2 can read EventOrganiser1's event
      await firebase.assertSucceeds(eventOrganiser2Collection.doc('event1').get());
    });
  });
});

/**
 * Clear the data in the Firestore emulator without triggering any of our
 * local Cloud Functions.
 *
 * @param {firebase.firestore.Firestore} db
 * @param {string} projectId
 */
async function resetData(db: firestore.Firestore, projectId: string) {
  await firebase.withFunctionTriggersDisabled(async () => {
    // Get the items collection before we delete everything
    const items = await db.collection('items').get();

    // Clear all data
    await firebase.clearFirestoreData({
      projectId,
    });

    // Restore the items collection
    for (const doc of items.docs) {
      await doc.ref.set(doc.data());
    }
  });
}
