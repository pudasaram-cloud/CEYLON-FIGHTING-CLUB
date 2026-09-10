import { NextResponse } from 'next/server';
import { getAllEvents, insertEvent, insertActivity } from '@/lib/db';
import { ClubEvent, ActivityLog } from '@/types';

export async function GET() {
  try {
    const events = getAllEvents();
    return NextResponse.json({ success: true, data: events });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const event: ClubEvent = {
      ...body,
      id: `evt-${Date.now()}`,
    };
    insertEvent(event);

    const activity: ActivityLog = {
      id: `act-${Date.now()}`,
      type: 'event',
      title: 'New Combat Event Added',
      description: `Scheduled "${event.title}" on ${event.date}.`,
      timestamp: new Date().toISOString(),
    };
    insertActivity(activity);

    return NextResponse.json({ success: true, data: event }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
