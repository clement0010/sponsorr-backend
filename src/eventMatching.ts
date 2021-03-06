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
  updateEventPairCount,
  updateEventStatusToMatched,
} from './common';

export const matchNotificationService = functions.firestore
  .document('matches/{matchId}')
  .onCreate(async (item) => {
    log('info', 'Incoming match notification request', {
      data: item.data(),
    });

    const newValue = item.data() as Match;

    const { eventId, userId, sponsorStatus, organiserStatus, organiserId } = newValue;

    // Cron Job matched
    if (sponsorStatus === Status.Pending && organiserStatus === Status.Pending) {
      const sponsorDetails = await getUserDetails(userId);
      const eventDetails = await getEventDetails(eventId);
      const organiserDetails = await getUserDetails(organiserId);

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
    if (sponsorStatus === Status.Accepted && organiserStatus === Status.Pending) {
      await updateEventPairCount(eventId);

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

    return;
  });

export const matchStatusTrigger = functions.firestore
  .document('matches/{matchId}')
  .onWrite(async (change) => {
    if (change.before.data() === change.after.data()) return;
    const newValue = change.after.data() as Match;

    const { eventId, status } = newValue;

    if (status === Status.Accepted) {
      await updateEventStatusToMatched(eventId);
      return;
    }
  });
