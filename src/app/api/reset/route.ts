import { NextResponse } from 'next/server';
import { seedDatabase } from '@/lib/db';

export async function POST() {
  try {
    seedDatabase();
    return NextResponse.json({ success: true, message: 'Database reset to default seed data' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
