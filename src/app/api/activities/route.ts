import { NextResponse } from 'next/server';
import { getAllActivities, insertActivity } from '@/lib/db';
import { ActivityLog } from '@/types';

export async function GET() {
  try {
    const activities = getAllActivities();
    return NextResponse.json({ success: true, data: activities });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const activity: ActivityLog = {
      ...body,
      id: body.id || `act-${Date.now()}`,
      timestamp: body.timestamp || new Date().toISOString(),
    };
    insertActivity(activity);
    return NextResponse.json({ success: true, data: activity }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
