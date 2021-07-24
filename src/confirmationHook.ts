import * as express from 'express';
import * as cors from 'cors';

import { admin, functions, log } from './common';
import { hashValidation } from './middleware';

const app = express();

app.use(cors({ origin: true }));
app.use(hashValidation);

app.post('/', async (req: express.Request, res: express.Response) => {
  log('info', 'Incoming confirmation email request');
  try {
    const { id } = req.body;

    const userRecord = await admin.auth().updateUser(id as string, {
      emailVerified: true,
    });
    log('info', 'Successfully verify email', { userRecord });

    res.send(
      JSON.stringify({
        id,
      }),
    );
  } catch (error) {
    res.status(500).send({ error });
  }
});

export const confirmEmail = functions.https.onRequest(app);
