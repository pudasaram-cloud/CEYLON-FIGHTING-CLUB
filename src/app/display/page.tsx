import { Metadata } from 'next';
import { BigScreenArenaDisplay } from '@/components/arena/BigScreenArenaDisplay';

export const metadata: Metadata = {
  title: 'ARENA BIG SCREEN DISPLAY | Ceylon Fighting Club',
  description: 'Broadcast-grade live wagering arena display for big screens, stadium monitors, and TV projectors.',
};

export default function DisplayPage() {
  return <BigScreenArenaDisplay />;
}
