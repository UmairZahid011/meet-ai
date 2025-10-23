// app/api/calendar-events/route.ts

import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || !token.accessToken) {
    console.error("Authentication token or access token is missing.");
    return new NextResponse(JSON.stringify({ error: 'Not authenticated' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const calendarId = 'primary';
  const timeMin = new Date().toISOString();
  const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?timeMin=${encodeURIComponent(timeMin)}&singleEvents=true&orderBy=startTime`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Google Calendar API Error:', response.status, errorData);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to fetch calendar events from Google.', details: errorData }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Internal server error while fetching calendar events:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || !token.accessToken) {
    return new NextResponse(JSON.stringify({ error: 'Not authenticated' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let eventData;
  try {
    eventData = await req.json();
    if (!eventData.summary || !eventData.start || !eventData.end) {
      return new NextResponse(JSON.stringify({ error: 'Missing required event fields (summary, start, end)' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: error }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const calendarId = 'bs131400@gmail.com';
  const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Google Calendar API Error:', response.status, errorData);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to create calendar event.', details: errorData }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const newEvent = await response.json();
    return NextResponse.json(newEvent, { status: 200 });
  } catch (error) {
    console.error('Internal server error while creating calendar event:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}