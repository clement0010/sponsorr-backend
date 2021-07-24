import { Request, Response, NextFunction } from 'express';

import { config } from 'firebase-functions';
import { generateWebhookHash, log, validateApiKey, validateHashKey } from './common';

export const apiValidation = (req: Request, res: Response, next: NextFunction): void => {
  // Grab the text parameter.
  log('info', 'Incoming validate api key request');
  const api = req.headers['x-api-key'] as string;
  const storedKey = config().admin.secret;
  if (!validateApiKey(storedKey, api)) {
    res.status(400).send({ error: 'Invalid api key' });
    return;
  }
  next();
};

export const hashValidation = (req: Request, res: Response, next: NextFunction): void => {
  log('info', 'Incoming validate hash email request');
  const { emailAddress, hash, id } = req.body;
  const secret = config().admin.secret;

  if (!emailAddress || !hash || !id) {
    res.status(400).send({ error: 'Invalid payload' });
  }

  const generatedHashKey = generateWebhookHash(emailAddress as string, id as string, secret);

  if (!validateHashKey(generatedHashKey, hash as string)) {
    res.status(400).send({ error: 'Verify email failed' });
    return;
  }
  next();
};
