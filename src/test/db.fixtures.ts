import { SponsorEvents } from './types';

const ONE_DAY = 60 * 60 * 24;

export const seedEvents: SponsorEvents = [
  {
    userId: 'organiser1',
    budget: {
      maximum: 10000,
      minimum: 1000,
    },
    clicks: 10,
    createdAt: Date.now() / 1000,
    date: {
      start: Date.now() / 1000 + ONE_DAY,
      end: Date.now() / 1000 + ONE_DAY * 10,
    },
    demographic: ['Adult', 'Children'],
    documents: ' ',
    description: ' ',
    eventSize: 100,
    keywords: ['Social'],
    matches: 100,
    picture: ' ',
    published: true,
    status: 'published',
    title: 'Fantastic Event',
    venue: 'Zoom',
    views: 10,
  },
  {
    userId: 'organiser2',
    budget: {
      maximum: 10000,
      minimum: 1000,
    },
    clicks: 10,
    createdAt: Date.now() / 1000,
    date: {
      start: Date.now() / 1000 + ONE_DAY * 10,
      end: Date.now() / 1000 + ONE_DAY * 20,
    },
    demographic: ['Adult', 'Children'],
    documents: ' ',
    description: ' ',
    eventSize: 100,
    keywords: ['Social'],
    matches: 100,
    picture: ' ',
    published: true,
    status: 'published',
    title: 'Awesome Event',
    venue: 'Zoom',
    views: 10,
  },
];

export const eventOrganiser1Auth = {
  uid: 'organiser1',
  email: 'organiser1@example.com',
  role: 'EventOrganiser',
};

export const eventOrganiser2Auth = {
  uid: 'organiser2',
  email: 'organiser2@example.com',
  role: 'EventOrganiser',
};

export const sponsor1Auth = {
  uid: 'sponsor1',
  email: 'sponsor1@example.com',
  role: 'Sponsor',
};
