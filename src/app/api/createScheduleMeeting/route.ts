// import { db } from "@/lib/db";
import { pool } from '@/lib/db';
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getFreshGoogleAccessToken } from "@/lib/googleAuthUtils";

export async function POST(req: NextRequest) {
  const { topic, startTime, existingAgent, existingMeeting, newMeeting } = await req.json();
  const publicLink = process.env.NEXT_PUBLIC_APP_URL + 'call/';
  const participantMail = existingMeeting?.participants?.[0]?.email;

  let isPayed = 0;

  try {
    const [[userPlan]] = await pool.query(
      'SELECT plan_id FROM user_plans WHERE user_id = ?',
      [existingMeeting.userId]
    ) as [any[], any];

    if (!userPlan?.plan_id) {
      return new NextResponse('User does not have a plan', { status: 404 });
    }

    const [[plan]] = await pool.query(
      'SELECT meeting_cost, agent_cost FROM plans WHERE id = ?',
      [userPlan.plan_id]
    ) as [any[], any];

    const [[user]] = await pool.query(
      'SELECT tokens FROM users WHERE id = ?',
      [existingMeeting.userId]
    ) as [any[], any];

    const meeting_cost = plan.meeting_cost;
    const tokens = user.tokens;

    if (tokens >= meeting_cost) {
      isPayed = 1;

      // Deduct tokens
      await pool.query(
        'UPDATE users SET tokens = tokens - ? WHERE id = ?',
        [meeting_cost, existingMeeting.userId]
      );
    }
  } catch (error) {
    console.error('Error fetching cost and token info:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/createMeeting`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ meeting: newMeeting, agent: existingAgent }),
  });

  if (!res.ok) {
    const error = await res.text();
    console.log("Stream call creation failed:", error);
    return NextResponse.json({ success: false });
  }

  const userId = existingMeeting.userId;

  const googleEvent = {
    summary: topic,
    description: `Join the meeting here: ${publicLink}${newMeeting.id}`,
    start: {
      dateTime: new Date(startTime).toISOString(),
      timeZone: "Asia/Karachi",
    },
    end: {
      dateTime: new Date(new Date(startTime).getTime() + 60 * 60 * 1000).toISOString(),
      timeZone: "Asia/Karachi",
    },
    attendees: participantMail ? [{ email: participantMail }] : [],
  };

  try {
    let googleAccessToken = null;
    if (userId) {
      googleAccessToken = await getFreshGoogleAccessToken(userId);
    }

    if (googleAccessToken && participantMail) {
      const googleApiRes = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${googleAccessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(googleEvent),
      });

      const googleData = await googleApiRes.json();
      if (!googleApiRes.ok) {
        console.error("Failed to create Google Calendar Event:", googleData);
      } else {
        console.log("Google Calendar Event Created:", googleData);
      }
    }
  } catch (error) {
    console.error("Error creating Google Calendar event:", error);
  }

  try {
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
      participants,
    } = newMeeting;

    await pool.query(
      `INSERT INTO meetings 
        (id, name, status, started_at, ended_at, recording_url, transcript_url, summary, start_date, userId, agent_id, is_payed, participants)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        name,
        status,
        started_at,
        ended_at,
        recording_url,
        transcript_url,
        summary,
        start_date,
        userId,
        agent_id,
        isPayed,
        JSON.stringify(participants || [])
      ]
    );
  } catch (err) {
    console.error("Error inserting meeting into MySQL:", err);
    return NextResponse.json({ success: false, error: "Database insert failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}