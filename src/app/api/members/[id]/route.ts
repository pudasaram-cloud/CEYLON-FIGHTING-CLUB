import { NextResponse } from 'next/server';
import { updateMemberInDb, deleteMemberFromDb, getAllMembers, insertActivity } from '@/lib/db';
import { calculateWeightClass } from '@/utils/helpers';
import { ActivityLog } from '@/types';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.weight) {
      body.weightClass = calculateWeightClass(body.weight);
    }

    const updated = updateMemberInDb(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Member not found' }, { status: 404 });
    }

    const activity: ActivityLog = {
      id: `act-${Date.now()}`,
      type: 'update',
      title: 'Member Profile Updated',
      description: `Updated fighter record and details for ${updated.fullName}.`,
      timestamp: new Date().toISOString(),
      memberId: id,
      memberName: updated.fullName,
    };
    insertActivity(activity);

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating member in embedded SQLite:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const members = getAllMembers();
    const target = members.find((m) => m.id === id);

    const deleted = deleteMemberFromDb(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Member not found' }, { status: 404 });
    }

    if (target) {
      const activity: ActivityLog = {
        id: `act-${Date.now()}`,
        type: 'deletion',
        title: 'Member Removed',
        description: `${target.fullName} (${id}) was deleted. Total revenue dynamically updated (-LKR 1,500).`,
        timestamp: new Date().toISOString(),
        memberId: id,
        memberName: target.fullName,
      };
      insertActivity(activity);
    }

    return NextResponse.json({ success: true, data: { id } });
  } catch (error: any) {
    console.error('Error deleting member in embedded SQLite:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
