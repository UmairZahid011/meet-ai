import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// Utility: Fetch related counts
async function getUserCounts(userId: number) {
  const [[{ meetingCount }]] = await db.query(
    'SELECT COUNT(*) as meetingCount FROM meetings WHERE userId = ?',
    [userId]
  ) as any;

  const [[{ agentCount }]] = await db.query(
    'SELECT COUNT(*) as agentCount FROM agents WHERE userId = ?',
    [userId]
  ) as any;

  return { meetingCount, agentCount };
}

// GET: Fetch all users
export async function GET() {
  try {
    const [users] = await db.query(
      'SELECT id, name, email, plan, status FROM users'
    ) as any;

    const usersWithCounts = await Promise.all(
      users.map(async (user: any) => {
        const counts = await getUserCounts(user.id);
        return { ...user, ...counts };
      })
    );

    return NextResponse.json(usersWithCounts);
  } catch (error) {
    console.error('[USERS_GET_ERROR]', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

// DELETE: Delete a user by ID
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ message: 'Missing user ID' }, { status: 400 });

    await db.query('DELETE FROM users WHERE id = ?', [id]);

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('[USER_DELETE_ERROR]', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

// PATCH: Update user (status for now, extendable)
export async function PATCH(req: NextRequest) {
  try {
    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ message: 'Missing id or status' }, { status: 400 });
    }

    const validStatuses = ['active', 'inactive'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
    }

    await db.query('UPDATE users SET status = ? WHERE id = ?', [status, id]);

    return NextResponse.json({ message: 'User status updated successfully' });
  } catch (error) {
    console.error('[USER_UPDATE_ERROR]', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
