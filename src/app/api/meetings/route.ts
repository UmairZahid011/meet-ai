import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { pool } from '@/lib/db';
import { Meeting, Participant } from '@/lib/types';


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    let query = 'SELECT * FROM meetings ORDER BY updated_at DESC';
    const values: string[] = [];

    if (userId) {
      query += ' WHERE userId = ?';
      values.push(userId);
    }

    const [rowsResult] = await pool.query(query, values);
    const rows = rowsResult as Meeting[];

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching meetings:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthorized', { status: 401 });

  try {
    const body = await req.json();
    const { id, name, agent_id, status, start_date, participant } = body;
    

    if (!id || !name || !agent_id) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const [userPlanRows] = await pool.query(
      'SELECT plan_id FROM user_plans WHERE user_id = ?',
      [session.user.id]
    ) as [any[], any];
    const planId = userPlanRows[0]?.plan_id;

    const [planRows] = await pool.query(
      'SELECT meeting_cost FROM plans WHERE id = ?',
      [planId]
    ) as [any[], any];
    const meetingTokenCost = planRows[0]?.meeting_cost;

    const [userRows] = await pool.query(
      'SELECT tokens FROM users WHERE id = ?',
      [session.user.id]
    ) as [any[], any];
    const tokens = userRows[0]?.tokens;

    if (tokens < meetingTokenCost) {
      return new NextResponse('Not enough tokens', { status: 403 });
    }

    // Deduct tokens
    await pool.query(
      'UPDATE users SET tokens = tokens - ? WHERE id = ?',
      [meetingTokenCost, session.user.id]
    );

    await pool.query(
      `INSERT INTO meetings (id, name, status, userId, agent_id, start_date,is_payed, participants)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        name,
        status || 'Upcoming',
        session.user.id,
        agent_id,
        start_date || null,
        1,
        JSON.stringify(participant || [])
      ]
    );

    return NextResponse.json({ 
      id, 
      name, 
      agent_id, 
      status: status || 'Upcoming',
      start_date: start_date || null
    });
  } catch (error) {
    console.error('Error creating meeting:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {

  try {
    const body = await req.json();
    const idsToDelete: string[] = body.ids || [];

    if (idsToDelete.length === 0) {
      return new NextResponse('No IDs provided', { status: 400 });
    }

    const placeholders = idsToDelete.map(() => '?').join(',');
    await pool.query(
      `DELETE FROM meetings WHERE id IN (${placeholders})`,
      [...idsToDelete]
    );

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting meetings:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const updatedMeeting: Meeting = await req.json();

    const {
      id,
      name,
      status,
      started_at,
      ended_at,
      recording_url,
      transcript_url,
      summary,
      start_date,
      agent_id,
      participants, // Expect participants array from client
    } = updatedMeeting;

    if (!id) {
        return new NextResponse('Meeting ID is required for update', { status: 400 });
    }

    // Stringify the participants array before updating the JSON column
    const participantsJson = JSON.stringify(participants || []);

    await pool.query(
      `UPDATE meetings SET
         name = ?,
         status = ?,
         started_at = ?,
         ended_at = ?,
         recording_url = ?,
         transcript_url = ?,
         summary = ?,
         start_date = ?,
         agent_id = ?,
         participants = ?
       WHERE id = ?`,
      [
        name,
        status,
        started_at,
        ended_at,
        recording_url,
        transcript_url,
        summary,
        start_date,
        agent_id,
        participantsJson,
        id,
      ]
    );

    return NextResponse.json(updatedMeeting);
  } catch (error) {
    console.error('Error updating meeting:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
export async function PATCH(req: NextRequest) {
  try {
    const { id: meetingId, participant: newParticipant } = await req.json();

    if (!meetingId || !newParticipant) {
      return new NextResponse('Meeting ID and new participant are required.', { status: 400 });
    }

    const isValidParticipant = (p: any): p is Participant =>
      p && p.id && p.name && p.email && p.joined_at;

    if (!isValidParticipant(newParticipant)) {
      return new NextResponse('Invalid participant structure.', { status: 400 });
    }

    const [rowsResult] = await pool.query('SELECT participants FROM meetings WHERE id = ?', [meetingId]);
    const rows = rowsResult as Array<Pick<Meeting, 'participants'>>;

    if (!Array.isArray(rows) || rows.length === 0) {
      return new NextResponse('Meeting not found.', { status: 404 });
    }

    const currentMeeting = rows[0];

    let currentParticipants: Participant[] = [];
    const rawParticipants = currentMeeting.participants;

    if (typeof rawParticipants === 'string') {
      try {
        currentParticipants = JSON.parse(rawParticipants);
      } catch {
        return new NextResponse('Invalid JSON in participants.', { status: 500 });
      }
    } else if (Array.isArray(rawParticipants)) {
      currentParticipants = rawParticipants;
    }

    const participantExists = currentParticipants.some(
      p => p.id === newParticipant.id || p.email === newParticipant.email
    );

    if (participantExists) {
      return new NextResponse('Participant already exists in this meeting.', { status: 409 });
    }

    currentParticipants.push(newParticipant);

    await pool.query(
      'UPDATE meetings SET participants = ? WHERE id = ?',
      [JSON.stringify(currentParticipants), meetingId]
    );

    const updatedRowsResult = await pool.query('SELECT * FROM meetings WHERE id = ?', [meetingId]);
    const updatedRows = updatedRowsResult as unknown as Meeting[];

    if (updatedRows.length === 0) {
      return new NextResponse('Failed to fetch updated meeting.', { status: 500 });
    }

    const updatedMeeting = updatedRows[0];
    const updatedParticipants = typeof updatedMeeting.participants === 'string'
      ? JSON.parse(updatedMeeting.participants)
      : updatedMeeting.participants;

    return NextResponse.json({
      ...updatedMeeting,
      participants: updatedParticipants,
    });

  } catch (error) {
    console.error('Error updating participants:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
