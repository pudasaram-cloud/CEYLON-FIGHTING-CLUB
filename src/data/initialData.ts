import { Member, ActivityLog, ClubEvent } from '@/types';

export const INITIAL_MEMBERS: Member[] = [];

export const INITIAL_ACTIVITIES: ActivityLog[] = [
  {
    id: 'act-init-01',
    type: 'system',
    title: 'Ceylon FC System Online',
    description: 'Dojo athlete database initialized. Ready for fighter admissions starting with ID CFC-001.',
    timestamp: new Date().toISOString(),
  },
];

export const INITIAL_EVENTS: ClubEvent[] = [
  {
    id: 'evt-101',
    title: 'Ceylon Cage Warriors: Fight Night V',
    category: 'Fight Night',
    date: '2026-09-26',
    time: '18:00 - 22:30',
    location: 'Sugathadasa Indoor Stadium, Colombo',
    participantsCount: 24,
    status: 'Upcoming',
    description: 'Annual Ceylon Combat League tournament featuring Welterweight & Middleweight title fights.',
  },
  {
    id: 'evt-102',
    title: 'Open Mat Submission Only Sparring',
    category: 'Sparring Session',
    date: '2026-09-15',
    time: '09:00 - 12:00',
    location: 'CFC Main Dojo & Cage, Colombo 03',
    participantsCount: 32,
    status: 'Upcoming',
    description: 'High intensity grappling & submission sparring for intermediate and advanced members.',
  },
  {
    id: 'evt-103',
    title: 'Muay Thai Clinch & Elbow Masterclass',
    category: 'Masterclass Workshop',
    date: '2026-10-03',
    time: '14:00 - 17:00',
    location: 'CFC Striking Arena, Colombo 03',
    participantsCount: 18,
    status: 'Upcoming',
    description: 'Guest Thai trainer masterclass on close-quarter elbow strikes and sweep defenses.',
  },
  {
    id: 'evt-104',
    title: 'Quarterly BJJ & Striking Belt Grading',
    category: 'Belt Grading',
    date: '2026-10-18',
    time: '10:00 - 14:00',
    location: 'CFC Main Dojo',
    participantsCount: 40,
    status: 'Upcoming',
    description: 'Official test and promotion ceremony for junior & senior martial artists.',
  },
];
