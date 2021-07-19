import { region } from 'firebase-functions';
import {
  buildEmailNotificationObject,
  createEmailRequestToDb,
  getEventDetails,
  getUserDetails,
  log,
  Status,
  updateEventStatusToMatched,
} from './common';

export const matchingService = region('asia-southeast2')
  .firestore.document('matches/{matchId}')
  .onWrite(async (change) => {
    log('info', 'Incoming matching service request', {
      data: change.after.data(),
    });

    const newValue = change.after.data();

    if (!newValue) return;

    const { eventId, userId, status, sponsorStatus, organiserStatus } = newValue;

    if (sponsorStatus === Status.Pending && organiserStatus === Status.Pending) {
      const sponsorDetails = await getUserDetails(userId);
      const eventDetails = await getEventDetails(eventId);
      const organiserDetails = await getUserDetails(eventDetails?.userId || '');

      const sponsorEmailNotificationObject = buildEmailNotificationObject(
        eventDetails?.userId || '',
        {
          username: sponsorDetails?.name || '',
          sponsorName: sponsorDetails?.name || '',
          eventName: eventDetails?.title || '',
        },
        {
          path: eventDetails?.documents[0] || '',
          filename: 'Event Attachment.pdf',
        },
      );
      const organiserEmailNotificationObject = buildEmailNotificationObject(
        userId || '',
        {
          username: organiserDetails?.name || '',
          sponsorName: sponsorDetails?.name || '',
          eventName: eventDetails?.title || '',
        },
        {
          filename: 'Event Attachment.pdf',
          path: eventDetails?.documents[0] || '',
        },
      );
      await createEmailRequestToDb(sponsorEmailNotificationObject);
      await createEmailRequestToDb(organiserEmailNotificationObject);
      return;
    }

    if (organiserStatus === Status.Pending) {
      const sponsorDetails = await getUserDetails(userId);
      const eventDetails = await getEventDetails(eventId);

      const emailNotificationObject = buildEmailNotificationObject(
        eventDetails?.userId || '',
        {
          username: sponsorDetails?.name || '',
          sponsorName: sponsorDetails?.name || '',
          eventName: eventDetails?.title || '',
        },
        {
          path: eventDetails?.documents[0] || '',
          filename: 'Event Attachment.pdf',
        },
      );
      await createEmailRequestToDb(emailNotificationObject);
      return;
    }

    if (status === Status.Accepted) {
      await updateEventStatusToMatched(eventId);
      return;
    }
    return;
  });
