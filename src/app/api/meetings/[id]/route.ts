import { NextRequest, NextResponse } from 'next/server';
// import { db } from '@/lib/db';
import { pool } from '@/lib/db';
import { Meeting } from '@/lib/types';


export async function GET(req: NextRequest, { params }: any) {
  const meetingId = params.id;

  if (!meetingId) {
    return new NextResponse('Meeting ID is required.', { status: 400 });
  }

  try {
    const [rowsResult] = await pool.query('SELECT * FROM meetings WHERE id = ?', [meetingId]);
    const rows = rowsResult as Meeting[];

    if (!rows || rows.length === 0) {
      return new NextResponse('Meeting not found.', { status: 404 });
    }

    const meeting = rows[0];

    // Parse participants if stored as JSON string
    let participants: any[] = [];
    if (typeof meeting.participants === 'string') {
      try {
        participants = JSON.parse(meeting.participants);
      } catch (err) {
        console.warn('Invalid JSON in participants field', err);
      }
    } else {
      participants = meeting.participants || [];
    }

    return NextResponse.json({
      ...meeting,
      participants,
    });
  } catch (error) {
    console.error('Error fetching meeting by ID:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}


export async function PATCH(req: NextRequest, { params }: any) {
  const meetingId = params.id;

  if (!meetingId) {
    return new NextResponse('Meeting ID is required.', { status: 400 });
  }

  try {
    const updates: Partial<Meeting> = await req.json();

    const fields = [
      'name', 'status', 'started_at', 'ended_at',
      'recording_url', 'transcript_url', 'summary',
      'start_date', 'agent_id', 'participants'
    ];

    const updatesToApply = fields
      .filter(key => updates[key as keyof Meeting] !== undefined)
      .map(key => {
        if (key === 'participants') {
          return JSON.stringify(updates.participants);
        }
        return updates[key as keyof Meeting];
      });

    const setClause = fields
      .filter(key => updates[key as keyof Meeting] !== undefined)
      .map(key => `${key} = ?`)
      .join(', ');

    if (!setClause) {
      return new NextResponse('No fields provided for update.', { status: 400 });
    }

    await pool.query(
      `UPDATE meetings SET ${setClause} WHERE id = ?`,
      [...updatesToApply, meetingId]
    );

    return new NextResponse('Meeting updated successfully');
  } catch (error) {
    console.error('PATCH error (meeting):', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}