type EventStatus = 'draft' | 'published' | 'matched';

type Role = 'Sponsor' | 'EventOrganiser';

type MatchStatus = 'pending' | 'rejected' | 'accepted';

interface Budget {
  maximum: number;
  minimum: number;
}

interface EventDate {
  start: number;
  end: number;
}

export interface Contact {
  location: string;
  websiteUrl: string;
}

export interface User {
  email: string;
  name: string;
  phoneNumber: string;
  uen?: string;
}

export interface Message {
  message: string;
  timestamp: number;
}

type Messages = Message[];

export interface Profile extends User {
  about: string;
  contact: Contact;
  keywords: string[];
  displayPicture: string;
  role: Role;
}

export interface Match {
  userId: string;
  eventId: string;
  status: MatchStatus;
  event: SponsorEvent;
  messages?: Messages;
}

export interface SponsorEvent {
  budget: Budget;
  clicks: number;
  createdAt: number;
  date: EventDate;
  demographic: string[];
  description: string;
  documents: string;
  eventSize: number;
  keywords: string[];
  matches: number;
  picture: string;
  published: boolean;
  status: EventStatus;
  title: string;
  userId: string;
  venue: string;
  views: number;
}

export type SponsorEvents = SponsorEvent[];
