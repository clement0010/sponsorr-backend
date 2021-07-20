import * as express from 'express';
import * as cors from 'cors';

import { admin, APP_BASE_URL, functions, log } from './common';
import { hashValidation } from './middleware';

const app = express();

app.use(cors({ origin: true }));
app.use(hashValidation);

app.get('/', async (req: express.Request, res: express.Response) => {
  // Grab the text parameter.
  log('info', 'Incoming confirmation email request');
  try {
    const { id } = req.query;

    const userRecord = await admin.auth().updateUser(id as string, {
      emailVerified: false,
    });
    log('info', 'Successfully verify email', { userRecord });

    res.redirect(`${APP_BASE_URL}profile/${id}`);
  } catch (error) {
    res.status(500).send({ error });
  }
});

export const confirmEmail = functions.https.onRequest(app);
