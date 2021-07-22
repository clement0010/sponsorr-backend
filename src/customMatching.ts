import * as express from 'express';
import * as cors from 'cors';

import {
  functions,
  getAllEventFromDb,
  getAllMatchesIdFromDb,
  getAllSponsorsFromDb,
  log,
  matchingAlgorithm,
  saveMatchesToDb,
} from './common';
import { apiValidation } from './middleware';

const app = express();

app.use(cors({ origin: true }));
app.use(apiValidation);

app.post('/', async (req: express.Request, res: express.Response) => {
  log('info', 'Incoming cron job matching service request');
  const allSponsors = await getAllSponsorsFromDb();
  const allEvents = await getAllEventFromDb();
  const allMatchIds = await getAllMatchesIdFromDb();

  if (allEvents.length === 0) {
    log('info', 'No events to match!');
    res.status(200).send(
      JSON.stringify({
        message: 'No events to match',
      }),
    );
  }
  if (allSponsors.length === 0) {
    log('info', 'No sponsors to match!');
    res.status(200).send({
      message: 'No sponsors to match',
    });
  }

  const matchedResult = matchingAlgorithm(allSponsors, allEvents, allMatchIds);

  await saveMatchesToDb(matchedResult);

  res.status(201).send(
    JSON.stringify({
      message: 'Successfully execute matching algorithm',
      matchedResult,
    }),
  );
});

export const matchingService = functions.https.onRequest(app);

// Run every 6 hours
export const matchingCronJobService = functions.pubsub
  .schedule('0 */6 * * *')
  .onRun(async (context) => {
    log('info', 'Incoming cron job matching service request', {
      context,
    });
    const allSponsors = await getAllSponsorsFromDb();
    const allEvents = await getAllEventFromDb();
    const allMatchIds = await getAllMatchesIdFromDb();

    log('info', 'Matching dataset', { allEvents, allSponsors, allMatchIds });

    if (allEvents.length === 0) {
      log('info', 'No events to match!');
      return;
    }
    if (allSponsors.length === 0) {
      log('info', 'No sponsors to match!');
      return;
    }

    const matchedResult = matchingAlgorithm(allSponsors, allEvents, allMatchIds);

    await saveMatchesToDb(matchedResult);
    return;
  });
