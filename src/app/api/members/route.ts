import { NextResponse } from 'next/server';
import { getAllMembers, insertMember, insertActivity, clearAllMembersFromDb } from '@/lib/db';
import { Member, ActivityLog } from '@/types';
import { calculateWeightClass } from '@/utils/helpers';

export async function GET() {
  try {
    const members = getAllMembers();
    return NextResponse.json({ success: true, data: members });
  } catch (error: any) {
    console.error('Error fetching members from embedded SQLite:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    clearAllMembersFromDb();
    return NextResponse.json({ success: true, message: 'All members cleared successfully' });
  } catch (error: any) {
    console.error('Error clearing members from embedded SQLite:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const members = getAllMembers();

    // Generate unique CFC ID
    const maxNum = members.reduce((acc, m) => {
      const match = m.id.match(/CFC-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > acc ? num : acc;
      }
      return acc;
    }, 1000);

    const newId = `CFC-${maxNum + 1}`;
    const weightClass = calculateWeightClass(body.weight);

    const newMember: Member = {
      ...body,
      id: newId,
      weightClass,
      registrationFee: 1500, // Fixed LKR 1,500
      attendanceCount: 1,
      sparringRecord: { wins: 0, losses: 0, draws: 0 },
    };

    insertMember(newMember);

    // Automatically record activity log in SQLite
    const activity: ActivityLog = {
      id: `act-${Date.now()}`,
      type: 'registration',
      title: 'New Member Registered',
      description: `${newMember.fullName} registered as ${weightClass} (${newMember.discipline}). LKR 1,500 fee added.`,
      timestamp: new Date().toISOString(),
      memberId: newId,
      memberName: newMember.fullName,
    };
    insertActivity(activity);

    return NextResponse.json({ success: true, data: newMember }, { status: 201 });
  } catch (error: any) {
    console.error('Error inserting member into embedded SQLite:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
