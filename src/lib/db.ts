import path from 'path';
import fs from 'fs';
import { Member, ActivityLog, ClubEvent } from '@/types';
import { INITIAL_MEMBERS, INITIAL_ACTIVITIES, INITIAL_EVENTS } from '@/data/initialData';

// Initial member default (Benny Falcon - CFC-1001)
const DEFAULT_MEMBERS: Member[] = [
  {
    id: 'CFC-1001',
    idNumber: '200432201685',
    fullName: 'Benny Falcon',
    age: 24,
    dateOfBirth: '2002-05-15',
    gender: 'Male',
    phoneNumber: '+94701095008',
    email: 'mpudasara@gmail.com',
    address: 'Colombo, Sri Lanka',
    weight: 70,
    height: 175,
    weightClass: 'Lightweight (66-70kg)',
    discipline: 'MMA',
    skillLevel: 'Intermediate',
    beltRank: 'Blue Belt',
    registrationDate: '2026-09-10',
    registrationFee: 1500,
    paymentStatus: 'Paid',
    membershipStatus: 'Active',
    defaultAvatarType: 'male-vector',
    emergencyContact: {
      name: 'Family Contact',
      phone: '+94701095008',
      relationship: 'Parent',
    },
    attendanceCount: 1,
    sparringRecord: { wins: 0, losses: 0, draws: 0 },
  },
];

// In-memory state fallback for serverless environments
let memoryMembers: Member[] = [...DEFAULT_MEMBERS];
let memoryActivities: ActivityLog[] = [...INITIAL_ACTIVITIES];
let memoryEvents: ClubEvent[] = [...INITIAL_EVENTS];

let sqliteDb: any = null;
let useSqlite = false;

try {
  // Dynamically require better-sqlite3 to prevent crashing if binary missing in lambda
  const Database = require('better-sqlite3');
  const isServerless = process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined;
  const dataDir = isServerless ? '/tmp' : path.join(process.cwd(), 'data');

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, 'ceylon_fc.db');
  
  // Copy template if in serverless
  const templatePath = path.join(process.cwd(), 'data', 'ceylon_fc.db');
  if (isServerless && fs.existsSync(templatePath) && !fs.existsSync(dbPath)) {
    try {
      fs.copyFileSync(templatePath, dbPath);
    } catch {}
  }

  const globalForDb = global as unknown as { dbInstance?: any };
  sqliteDb = globalForDb.dbInstance || new Database(dbPath);
  if (process.env.NODE_ENV !== 'production') {
    globalForDb.dbInstance = sqliteDb;
  }
  
  sqliteDb.pragma('journal_mode = WAL');
  useSqlite = true;
} catch (err) {
  console.warn('SQLite unavailable, using robust memory storage fallback:', err);
  useSqlite = false;
}

// Initialize database schema if SQLite is available
export function initDatabase() {
  if (!useSqlite || !sqliteDb) return;

  try {
    sqliteDb.exec(`
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

    // Seed events if empty
    const countEventsStmt = sqliteDb.prepare('SELECT COUNT(*) as count FROM events');
    const eventResult = countEventsStmt.get() as { count: number };
    if (eventResult.count === 0 && INITIAL_EVENTS.length > 0) {
      const insertEvent = sqliteDb.prepare(`
        INSERT INTO events (id, title, category, date, time, location, participantsCount, status, description)
        VALUES (@id, @title, @category, @date, @time, @location, @participantsCount, @status, @description)
      `);
      for (const e of INITIAL_EVENTS) {
        insertEvent.run({ ...e, description: e.description || null });
      }
    }

    // Seed activities if empty
    const countActStmt = sqliteDb.prepare('SELECT COUNT(*) as count FROM activities');
    const actResult = countActStmt.get() as { count: number };
    if (actResult.count === 0 && INITIAL_ACTIVITIES.length > 0) {
      const insertActivity = sqliteDb.prepare(`
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
  } catch (err) {
    console.warn('SQLite init error, switching to memory fallback:', err);
    useSqlite = false;
  }
}

// Reset Database
export function seedDatabase() {
  if (useSqlite && sqliteDb) {
    try {
      initDatabase();
      sqliteDb.prepare('DELETE FROM members').run();
      sqliteDb.prepare('DELETE FROM activities').run();
      sqliteDb.prepare('DELETE FROM events').run();
      for (const e of INITIAL_EVENTS) {
        insertEvent(e);
      }
      for (const a of INITIAL_ACTIVITIES) {
        insertActivity(a);
      }
      return;
    } catch {}
  }
  memoryMembers = [];
  memoryActivities = [...INITIAL_ACTIVITIES];
  memoryEvents = [...INITIAL_EVENTS];
}

// Clear all members
export function clearAllMembersFromDb() {
  if (useSqlite && sqliteDb) {
    try {
      initDatabase();
      sqliteDb.prepare('DELETE FROM members').run();
      return;
    } catch {}
  }
  memoryMembers = [];
}

// Member Database Operations
export function getAllMembers(): Member[] {
  if (useSqlite && sqliteDb) {
    try {
      initDatabase();
      const rows = sqliteDb.prepare('SELECT * FROM members ORDER BY id ASC').all() as any[];
      return rows.map((row) => ({
        ...row,
        emergencyContact: row.emergencyContact ? JSON.parse(row.emergencyContact) : { name: '', phone: '', relationship: '' },
        sparringRecord: row.sparringRecord ? JSON.parse(row.sparringRecord) : { wins: 0, losses: 0, draws: 0 },
      }));
    } catch (err) {
      console.warn('Falling back to memory storage:', err);
    }
  }
  return memoryMembers;
}

export function insertMember(member: Member): Member {
  if (useSqlite && sqliteDb) {
    try {
      initDatabase();
      const stmt = sqliteDb.prepare(`
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
    } catch (err) {
      console.warn('Falling back to memory insert:', err);
    }
  }

  memoryMembers = [member, ...memoryMembers.filter((m) => m.id !== member.id)];
  return member;
}

export function updateMemberInDb(id: string, updates: Partial<Member>): Member | null {
  if (useSqlite && sqliteDb) {
    try {
      initDatabase();
      const current = sqliteDb.prepare('SELECT * FROM members WHERE id = ?').get(id) as any;
      if (current) {
        const currentObj: Member = {
          ...current,
          emergencyContact: current.emergencyContact ? JSON.parse(current.emergencyContact) : { name: '', phone: '', relationship: '' },
          sparringRecord: current.sparringRecord ? JSON.parse(current.sparringRecord) : { wins: 0, losses: 0, draws: 0 },
        };

        const updated: Member = { ...currentObj, ...updates };
        const stmt = sqliteDb.prepare(`
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
    } catch (err) {
      console.warn('Falling back to memory update:', err);
    }
  }

  const idx = memoryMembers.findIndex((m) => m.id === id);
  if (idx === -1) return null;
  memoryMembers[idx] = { ...memoryMembers[idx], ...updates };
  return memoryMembers[idx];
}

export function deleteMemberFromDb(id: string): boolean {
  if (useSqlite && sqliteDb) {
    try {
      initDatabase();
      const stmt = sqliteDb.prepare('DELETE FROM members WHERE id = ?');
      const result = stmt.run(id);
      return result.changes > 0;
    } catch (err) {
      console.warn('Falling back to memory delete:', err);
    }
  }

  const initialLen = memoryMembers.length;
  memoryMembers = memoryMembers.filter((m) => m.id !== id);
  return memoryMembers.length < initialLen;
}

// Activities Operations
export function getAllActivities(): ActivityLog[] {
  if (useSqlite && sqliteDb) {
    try {
      initDatabase();
      return sqliteDb.prepare('SELECT * FROM activities ORDER BY timestamp DESC, createdAt DESC').all() as ActivityLog[];
    } catch {}
  }
  return memoryActivities;
}

export function insertActivity(activity: ActivityLog): ActivityLog {
  if (useSqlite && sqliteDb) {
    try {
      initDatabase();
      const stmt = sqliteDb.prepare(`
        INSERT INTO activities (id, type, title, description, timestamp, memberId, memberName)
        VALUES (@id, @type, @title, @description, @timestamp, @memberId, @memberName)
      `);
      stmt.run({
        ...activity,
        memberId: activity.memberId || null,
        memberName: activity.memberName || null,
      });
      return activity;
    } catch {}
  }

  memoryActivities = [activity, ...memoryActivities];
  return activity;
}

// Events Operations
export function getAllEvents(): ClubEvent[] {
  if (useSqlite && sqliteDb) {
    try {
      initDatabase();
      return sqliteDb.prepare('SELECT * FROM events ORDER BY date ASC, createdAt DESC').all() as ClubEvent[];
    } catch {}
  }
  return memoryEvents;
}

export function insertEvent(event: ClubEvent): ClubEvent {
  if (useSqlite && sqliteDb) {
    try {
      initDatabase();
      const stmt = sqliteDb.prepare(`
        INSERT INTO events (id, title, category, date, time, location, participantsCount, status, description)
        VALUES (@id, @title, @category, @date, @time, @location, @participantsCount, @status, @description)
      `);
      stmt.run({
        ...event,
        description: event.description || null,
      });
      return event;
    } catch {}
  }

  memoryEvents = [event, ...memoryEvents];
  return event;
}
