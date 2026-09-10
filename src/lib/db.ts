import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { Member, ActivityLog, ClubEvent } from '@/types';
import { INITIAL_MEMBERS, INITIAL_ACTIVITIES, INITIAL_EVENTS } from '@/data/initialData';

// Store the SQLite database file inside the project directory (e.g. data/ceylon_fc.db)
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'ceylon_fc.db');

// Global singleton instance for Next.js hot reload in development
const globalForDb = global as unknown as { dbInstance?: Database.Database };

export const db: Database.Database =
  globalForDb.dbInstance ||
  new Database(dbPath, {
    // verbose: console.log,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.dbInstance = db;
}

// Enable Write-Ahead Logging for high concurrency performance
db.pragma('journal_mode = WAL');

// Initialize database schema
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS members (
      id TEXT PRIMARY KEY,
      idNumber TEXT,
      fullName TEXT NOT NULL,
      age INTEGER NOT NULL,
      dateOfBirth TEXT,
      gender TEXT NOT NULL,
      phoneNumber TEXT NOT NULL,
      email TEXT,
      address TEXT,
      weight REAL NOT NULL,
      height REAL NOT NULL,
      weightClass TEXT NOT NULL,
      discipline TEXT NOT NULL,
      skillLevel TEXT NOT NULL,
      beltRank TEXT,
      registrationDate TEXT NOT NULL,
      registrationFee INTEGER NOT NULL DEFAULT 1500,
      paymentStatus TEXT NOT NULL DEFAULT 'Paid',
      membershipStatus TEXT NOT NULL DEFAULT 'Active',
      photoUrl TEXT,
      defaultAvatarType TEXT DEFAULT 'male-vector',
      emergencyContact TEXT,
      notes TEXT,
      attendanceCount INTEGER DEFAULT 1,
      sparringRecord TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      memberId TEXT,
      memberName TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      location TEXT NOT NULL,
      participantsCount INTEGER DEFAULT 0,
      status TEXT DEFAULT 'Upcoming',
      description TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Auto-seed events if events table is empty
  const countEventsStmt = db.prepare('SELECT COUNT(*) as count FROM events');
  const eventResult = countEventsStmt.get() as { count: number };
  if (eventResult.count === 0 && INITIAL_EVENTS.length > 0) {
    const insertEvent = db.prepare(`
      INSERT INTO events (id, title, category, date, time, location, participantsCount, status, description)
      VALUES (@id, @title, @category, @date, @time, @location, @participantsCount, @status, @description)
    `);
    for (const e of INITIAL_EVENTS) {
      insertEvent.run({
        ...e,
        description: e.description || null,
      });
    }
  }

  // Auto-seed initial activity if empty
  const countActStmt = db.prepare('SELECT COUNT(*) as count FROM activities');
  const actResult = countActStmt.get() as { count: number };
  if (actResult.count === 0 && INITIAL_ACTIVITIES.length > 0) {
    const insertActivity = db.prepare(`
      INSERT INTO activities (id, type, title, description, timestamp, memberId, memberName)
      VALUES (@id, @type, @title, @description, @timestamp, @memberId, @memberName)
    `);
    for (const a of INITIAL_ACTIVITIES) {
      insertActivity.run({
        ...a,
        memberId: a.memberId || null,
        memberName: a.memberName || null,
      });
    }
  }
}

// Seed / Reset with default initial data
export function seedDatabase() {
  initDatabase();

  const insertMember = db.prepare(`
    INSERT INTO members (
      id, idNumber, fullName, age, dateOfBirth, gender, phoneNumber,
      email, address, weight, height, weightClass, discipline, skillLevel,
      beltRank, registrationDate, registrationFee, paymentStatus, membershipStatus,
      photoUrl, defaultAvatarType, emergencyContact, notes, attendanceCount, sparringRecord
    ) VALUES (
      @id, @idNumber, @fullName, @age, @dateOfBirth, @gender, @phoneNumber,
      @email, @address, @weight, @height, @weightClass, @discipline, @skillLevel,
      @beltRank, @registrationDate, @registrationFee, @paymentStatus, @membershipStatus,
      @photoUrl, @defaultAvatarType, @emergencyContact, @notes, @attendanceCount, @sparringRecord
    )
  `);

  const insertActivity = db.prepare(`
    INSERT INTO activities (id, type, title, description, timestamp, memberId, memberName)
    VALUES (@id, @type, @title, @description, @timestamp, @memberId, @memberName)
  `);

  const insertEvent = db.prepare(`
    INSERT INTO events (id, title, category, date, time, location, participantsCount, status, description)
    VALUES (@id, @title, @category, @date, @time, @location, @participantsCount, @status, @description)
  `);

  const transaction = db.transaction(() => {
    // Clear existing
    db.prepare('DELETE FROM members').run();
    db.prepare('DELETE FROM activities').run();
    db.prepare('DELETE FROM events').run();

    for (const m of INITIAL_MEMBERS) {
      insertMember.run({
        ...m,
        photoUrl: m.photoUrl || null,
        emergencyContact: JSON.stringify(m.emergencyContact),
        sparringRecord: JSON.stringify(m.sparringRecord),
      });
    }

    for (const a of INITIAL_ACTIVITIES) {
      insertActivity.run({
        ...a,
        memberId: a.memberId || null,
        memberName: a.memberName || null,
      });
    }

    for (const e of INITIAL_EVENTS) {
      insertEvent.run({
        ...e,
        description: e.description || null,
      });
    }
  });

  transaction();
}

// Wipe all members
export function clearAllMembersFromDb() {
  initDatabase();
  db.prepare('DELETE FROM members').run();
}

// Member Database Operations
export function getAllMembers(): Member[] {
  initDatabase();
  const rows = db.prepare('SELECT * FROM members ORDER BY id ASC').all() as any[];

  return rows.map((row) => ({
    ...row,
    emergencyContact: row.emergencyContact ? JSON.parse(row.emergencyContact) : { name: '', phone: '', relationship: '' },
    sparringRecord: row.sparringRecord ? JSON.parse(row.sparringRecord) : { wins: 0, losses: 0, draws: 0 },
  }));
}

export function insertMember(member: Member): Member {
  initDatabase();
  const stmt = db.prepare(`
    INSERT INTO members (
      id, idNumber, fullName, age, dateOfBirth, gender, phoneNumber,
      email, address, weight, height, weightClass, discipline, skillLevel,
      beltRank, registrationDate, registrationFee, paymentStatus, membershipStatus,
      photoUrl, defaultAvatarType, emergencyContact, notes, attendanceCount, sparringRecord
    ) VALUES (
      @id, @idNumber, @fullName, @age, @dateOfBirth, @gender, @phoneNumber,
      @email, @address, @weight, @height, @weightClass, @discipline, @skillLevel,
      @beltRank, @registrationDate, @registrationFee, @paymentStatus, @membershipStatus,
      @photoUrl, @defaultAvatarType, @emergencyContact, @notes, @attendanceCount, @sparringRecord
    )
  `);

  stmt.run({
    id: member.id,
    idNumber: member.idNumber || '',
    fullName: member.fullName,
    age: member.age,
    dateOfBirth: member.dateOfBirth || null,
    gender: member.gender,
    phoneNumber: member.phoneNumber,
    email: member.email || '',
    address: member.address || '',
    weight: member.weight,
    height: member.height,
    weightClass: member.weightClass,
    discipline: member.discipline,
    skillLevel: member.skillLevel,
    beltRank: member.beltRank || '',
    registrationDate: member.registrationDate,
    registrationFee: member.registrationFee || 1500,
    paymentStatus: member.paymentStatus || 'Paid',
    membershipStatus: member.membershipStatus || 'Active',
    photoUrl: member.photoUrl || null,
    defaultAvatarType: member.defaultAvatarType || (member.gender === 'Female' ? 'female-vector' : 'male-vector'),
    emergencyContact: JSON.stringify(member.emergencyContact || { name: '', phone: '', relationship: '' }),
    notes: member.notes || '',
    attendanceCount: member.attendanceCount || 1,
    sparringRecord: JSON.stringify(member.sparringRecord || { wins: 0, losses: 0, draws: 0 }),
  });

  return member;
}

export function updateMemberInDb(id: string, updates: Partial<Member>): Member | null {
  initDatabase();
  const current = db.prepare('SELECT * FROM members WHERE id = ?').get(id) as any;
  if (!current) return null;

  const currentObj: Member = {
    ...current,
    emergencyContact: current.emergencyContact ? JSON.parse(current.emergencyContact) : { name: '', phone: '', relationship: '' },
    sparringRecord: current.sparringRecord ? JSON.parse(current.sparringRecord) : { wins: 0, losses: 0, draws: 0 },
  };

  const updated: Member = {
    ...currentObj,
    ...updates,
  };

  const stmt = db.prepare(`
    UPDATE members SET
      idNumber = @idNumber,
      fullName = @fullName,
      age = @age,
      phoneNumber = @phoneNumber,
      email = @email,
      weight = @weight,
      height = @height,
      weightClass = @weightClass,
      discipline = @discipline,
      skillLevel = @skillLevel,
      beltRank = @beltRank,
      paymentStatus = @paymentStatus,
      membershipStatus = @membershipStatus,
      notes = @notes,
      emergencyContact = @emergencyContact,
      sparringRecord = @sparringRecord
    WHERE id = @id
  `);

  stmt.run({
    ...updated,
    emergencyContact: JSON.stringify(updated.emergencyContact),
    sparringRecord: JSON.stringify(updated.sparringRecord),
  });

  return updated;
}

export function deleteMemberFromDb(id: string): boolean {
  initDatabase();
  const stmt = db.prepare('DELETE FROM members WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

// Activities Operations
export function getAllActivities(): ActivityLog[] {
  initDatabase();
  return db.prepare('SELECT * FROM activities ORDER BY timestamp DESC, createdAt DESC').all() as ActivityLog[];
}

export function insertActivity(activity: ActivityLog): ActivityLog {
  initDatabase();
  const stmt = db.prepare(`
    INSERT INTO activities (id, type, title, description, timestamp, memberId, memberName)
    VALUES (@id, @type, @title, @description, @timestamp, @memberId, @memberName)
  `);

  stmt.run({
    ...activity,
    memberId: activity.memberId || null,
    memberName: activity.memberName || null,
  });

  return activity;
}

// Events Operations
export function getAllEvents(): ClubEvent[] {
  initDatabase();
  return db.prepare('SELECT * FROM events ORDER BY date ASC, createdAt DESC').all() as ClubEvent[];
}

export function insertEvent(event: ClubEvent): ClubEvent {
  initDatabase();
  const stmt = db.prepare(`
    INSERT INTO events (id, title, category, date, time, location, participantsCount, status, description)
    VALUES (@id, @title, @category, @date, @time, @location, @participantsCount, @status, @description)
  `);

  stmt.run({
    ...event,
    description: event.description || null,
  });

  return event;
}
