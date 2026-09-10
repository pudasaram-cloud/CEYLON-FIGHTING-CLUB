import { Member, ActivityLog, ClubEvent } from '@/types';

export const INITIAL_MEMBERS: Member[] = [];

export const INITIAL_ACTIVITIES: ActivityLog[] = [
  {
    id: 'act-init-01',
    type: 'system',
    title: 'Ceylon FC System Online',
    description: 'Cloud database initialized. Ready for fighter admissions starting with ID CFC-0001.',
    timestamp: new Date().toISOString(),
  },
];

export const INITIAL_EVENTS: ClubEvent[] = [];
