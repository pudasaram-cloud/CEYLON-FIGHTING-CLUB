import { NextResponse } from 'next/server';
import { deleteEventFromDb, getAllEvents, insertActivity } from '@/lib/db';
import { ActivityLog } from '@/types';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const events = getAllEvents();
    const target = events.find((e) => e.id === id);

    const deleted = deleteEventFromDb(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
    }

    if (target) {
      const activity: ActivityLog = {
        id: `act-${Date.now()}`,
        type: 'event',
        title: 'Combat Event Cancelled',
        description: `Removed scheduled event "${target.title}" from calendar.`,
        timestamp: new Date().toISOString(),
      };
      insertActivity(activity);
    }

    return NextResponse.json({ success: true, data: { id } });
  } catch (error: any) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
