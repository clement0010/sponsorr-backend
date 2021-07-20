import { log } from './config';

export const validateApiKey = (storedKey: string, incomingKey: string): boolean => {
  log('info', 'Checking api keys', { storedKey, incomingKey });
  return storedKey === incomingKey;
};

export const validateHashKey = (generatedHash: string, incomingHash: string): boolean => {
  log('info', 'Validate email hash key', { generatedHash, incomingHash });
  return generatedHash === incomingHash;
};
