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

export interface ConfirmationEmailObject extends EmailIdentifier {
  template: {
    name: string;
    data: {
      username: string;
      webhookUrl: string;
    };
  };
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

import firebase from 'firebase/app';

export type FirebaseUser = firebase.User;

export type Role = 'Sponsor' | 'EventOrganiser';

export interface Contact {
  location: string;
  websiteUrl: string;
}

export interface User {
  email: string;
  name: string;
  phoneNumber: string;
}

export interface Profile extends User {
  about: string;
  contact: Contact;
  keywords: string[];
  displayPicture: string;
  subscribed?: boolean;
}

export interface EventOrganiser extends Profile {
  role: Role;
}
export interface Sponsor extends Profile {
  role: Role;
}

export type EventStatus = 'draft' | 'published' | 'matched';

interface Budget {
  maximum: number;
  minimum: number;
}

interface EventDate {
  start: number;
  end: number;
}

export interface SponsorRequest {
  itemName: string;
  description: string;
  valueInSGD: string;
}

export interface BaseSponsorEvent {
  budget: Budget;
  clicks: number;
  createdAt: number;
  date: EventDate;
  demographic: string[];
  description: string;
  documents: string[];
  eventSize: number;
  keywords: string[];
  matches: number;
  pairs: number;
  picture: string;
  subscribed: boolean;
  status: EventStatus;
  title: string;
  venue: string;
  requests: SponsorRequest[];
  uuid?: string;
}

export interface SponsorEvent extends BaseSponsorEvent {
  userId: string;
}

export interface SponsorEventDbItem extends SponsorEvent {
  eventId: string;
}

export type SponsorEventDbItems = SponsorEventDbItem[];

export type SponsorEvents = SponsorEvent[];

interface Header {
  text: string;
  value: string;
  sortable?: boolean;
  align?: string;
}

export interface EventCategory {
  name: EventStatus;
  loaded: boolean;
  headers: Header[];
  contents: SponsorEventDbItems;
  fallback: string;
}

export type MatchStatus = 'pending' | 'rejected' | 'accepted';

export interface Message {
  message: string;
  timestamp: number;
}

export type Messages = Message[];

export interface Match {
  userId: string;
  eventId: string;
  status: MatchStatus;
  organiserStatus: MatchStatus;
  sponsorStatus: MatchStatus;
  event: SponsorEvent;
  messages?: Messages;
}

export type Matches = Match[];

export interface MatchCategory {
  name: MatchStatus;
  loaded: boolean;
  headers: Header[];
  contents: Match[];
  fallback: string;
}
