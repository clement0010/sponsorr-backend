import {
  APP_BASE_URL,
  buildEmailNotificationObject,
  createEmailRequestToDb,
  functions,
  getEventDetails,
  getUserDetails,
  log,
  Match,
  Status,
  updateEventStatusToMatched,
} from './common';

export const matchingService = functions.firestore
  .document('matches/{matchId}')
  .onWrite(async (change) => {
    log('info', 'Incoming matching service request', {
      data: change.after.data(),
    });

    if (change.before.data() === change.after.data()) return;
    const newValue = change.after.data() as Match;

    const { eventId, userId, status, sponsorStatus, organiserStatus } = newValue;

    // Cron Job matched
    if (sponsorStatus === Status.Pending && organiserStatus === Status.Pending) {
      const sponsorDetails = await getUserDetails(userId);
      const eventDetails = await getEventDetails(eventId);
      const organiserDetails = await getUserDetails(eventDetails?.userId || '');

      const eventUrl = `${APP_BASE_URL}event/${eventId}`;

      const sponsorEmailNotificationObject = buildEmailNotificationObject(
        userId || '',
        {
          username: sponsorDetails?.name || '',
          sponsorName: sponsorDetails?.name || '',
          eventName: eventDetails?.title || '',
          eventUrl,
        },
        {
          path: eventDetails?.documents[0] || '',
          filename: 'Event Attachment.pdf',
        },
      );
      const organiserEmailNotificationObject = buildEmailNotificationObject(
        eventDetails?.userId || '',
        {
          username: organiserDetails?.name || '',
          sponsorName: sponsorDetails?.name || '',
          eventName: eventDetails?.title || '',
          eventUrl,
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

    // Notify organiser about the match
    if (organiserStatus === Status.Pending) {
      const sponsorDetails = await getUserDetails(userId);
      const eventDetails = await getEventDetails(eventId);
      const organiserDetails = await getUserDetails(eventDetails?.userId || '');

      const eventUrl = `${APP_BASE_URL}event/${eventId}`;

      const emailNotificationObject = buildEmailNotificationObject(
        eventDetails?.userId || '',
        {
          username: organiserDetails?.name || '',
          sponsorName: sponsorDetails?.name || '',
          eventName: eventDetails?.title || '',
          eventUrl,
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
