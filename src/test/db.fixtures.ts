import * as faker from 'faker';

import { BaseSponsorEvent, Profile, Role, SponsorEvents } from '../common';

const ONE_DAY = 60 * 60 * 24;

const { number, boolean, uuid } = faker.datatype;
const { arrayElements } = faker.random;
const { email, url } = faker.internet;
const { findName } = faker.name;
const { companyName } = faker.company;
const { phoneNumber } = faker.phone;
const { paragraph } = faker.lorem;
const { productName, productDescription, price, department } = faker.commerce;
const { imageUrl } = faker.image;

const demographic = [
  'Public',
  'Senior Citizens',
  'Adults',
  'University/College',
  'Teens',
  'Children',
];
const keywords = ['Social', 'Party', 'Supper'];

export const baseEvent = (): BaseSponsorEvent => {
  return {
    budget: {
      maximum: number({ min: 5000, max: 10000 }),
      minimum: number({ min: 500, max: 5000 }),
    },
    clicks: number({ min: 0, max: 100 }),
    createdAt: Date.now() / 1000,
    date: {
      start: Date.now() / 1000 + ONE_DAY * number({ min: 0, max: 50 }),
      end: Date.now() / 1000 + ONE_DAY * number({ min: 50, max: 100 }),
    },
    demographic: arrayElements(demographic, number({ min: 1, max: 6 })),
    documents: [imageUrl()],
    description: paragraph(3),
    eventSize: number({ min: 0, max: 100 }),
    keywords: arrayElements(keywords, number({ min: 1, max: 3 })),
    matches: number({ min: 0, max: 50 }),
    picture: imageUrl(300, 300),
    subscribed: boolean(),
    status: 'published',
    title: productName(),
    venue: department(),
    pairs: number({ min: 0, max: 100 }),
    requests: [
      {
        itemName: productName(),
        description: productDescription(),
        valueInSGD: price(),
      },
      {
        itemName: productName(),
        description: productDescription(),
        valueInSGD: price(),
      },
    ],
    uuid: uuid(),
  };
};

const baseProfile = (role: Role): Profile => {
  return {
    email: email(),
    name: role === 'Sponsor' ? companyName() : findName(),
    phoneNumber: phoneNumber(),
    about: paragraph(3),
    contact: {
      websiteUrl: url(),
      location: url(),
    },
    keywords: arrayElements(keywords, number({ min: 1, max: 3 })),
    displayPicture: imageUrl(300, 300),
  };
};

export const seedEvents: SponsorEvents = [
  {
    userId: 'organiser1',
    ...baseEvent(),
  },
  {
    userId: 'organiser2',
    ...baseEvent(),
  },
];

export const eventOrganiser1Auth = {
  uid: 'organiser1',
  ...baseProfile('EventOrganiser'),
  email: 'clement.jdp15@gmail.com',
  role: 'EventOrganiser',
  email_verified: true,
};

export const eventOrganiser2Auth = {
  uid: 'organiser2',
  ...baseProfile('EventOrganiser'),
  email: 'organiser2@example.com',
  role: 'EventOrganiser',
  email_verified: false,
};

export const sponsor1Auth = {
  uid: 'sponsor1',
  ...baseProfile('Sponsor'),
  email: 'sponsor1@example.com',
  role: 'Sponsor',
  email_verified: true,
};

export const sponsor2Auth = {
  uid: 'sponsor2',
  ...baseProfile('Sponsor'),
  email: 'sponsor2@example.com',
  role: 'Sponsor',
  email_verified: false,
};
