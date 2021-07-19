export type LogType = 'info' | 'error' | 'warn';

interface EmailIdentifier {
  from: string;
  to?: string;
  toUids?: string[];
}

export interface Attachment {
  filename: string;
  path: string;
}

interface Template {
  name: string;
  data: MatchedEmailParams;
}

export interface MatchedEmailNotificationObject extends EmailIdentifier {
  template: Template;
  message?: {
    attachments?: Attachment[];
  };
}

export interface MatchedEmailParams {
  username: string;
  sponsorName: string;
  eventName: string;
}

export interface UserDetailsDbItem {
  id: string;
  email: string;
  name: string;
}

export interface EventDetailsDbItem {
  title: string;
  userId: string;
  documents: string[];
}
