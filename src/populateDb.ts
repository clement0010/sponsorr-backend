import * as express from 'express';
import * as cors from 'cors';

import { functions, log, populateEventDatabase, populateUserDatabase } from './common';
import {
  eventOrganiser1Auth,
  eventOrganiser2Auth,
  sponsor1Auth,
  sponsor2Auth,
} from './test/db.fixtures';
import { apiValidation } from './middleware';

const app = express();

app.use(cors({ origin: true }));
app.use(apiValidation);

app.post('/', async (req: express.Request, res: express.Response) => {
  log('info', 'Incoming populate db request');
  try {
    await Promise.all([
      populateUserDatabase(eventOrganiser1Auth),
      populateUserDatabase(eventOrganiser2Auth),
      populateUserDatabase(sponsor1Auth),
      populateUserDatabase(sponsor2Auth),
      populateEventDatabase(eventOrganiser1Auth),
      populateEventDatabase(eventOrganiser2Auth),
    ]);
    log('info', 'Completed db population job');

    res.status(201).json({
      message: 'Saved items to db',
    });
  } catch (error) {
    res.status(500).send({ error });
  }
});

export const populateDb = functions.https.onRequest(app);
