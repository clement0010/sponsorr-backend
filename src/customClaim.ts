import { config } from 'firebase-functions';

import {
  admin,
  buildConfirmationEmailObject,
  createEmailRequestToDb,
  functions,
  generateWebhookUrl,
  log,
} from './common';

export const customClaim = functions.firestore
  .document('users/{userId}')
  .onCreate(async (snap, context) => {
    log('info', 'Incoming create custom claim request', { snap });
    const newValue = snap.data();

    const { role, name, email } = newValue;
    const uid = context.params.userId;

    await admin.auth().setCustomUserClaims(uid, {
      role,
    });

    const secret = config().admin.secret;
    const webhookUrl = generateWebhookUrl(email, uid, secret);
    log('info', 'Successfully generated webhook url', { webhookUrl });
    const confirmationEmailObject = buildConfirmationEmailObject(uid, name, webhookUrl);

    await createEmailRequestToDb(confirmationEmailObject);
    return;
  });
