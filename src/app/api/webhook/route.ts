import {
    CallEndedEvent,
    CallTranscriptionReadyEvent,
    CallRecordingReadyEvent,
    CallSessionStartedEvent,
    StreamClient
} from "@stream-io/node-sdk";
import { NextResponse, NextRequest } from "next/server";
import { summarizeTranscriptText } from "../openai";
import { fetchTranscriptFromURL } from "@/lib/utils";
// import { db } from "@/lib/db";
import {pool }from '@/lib/db';
import { Agent, Meeting } from "@/lib/types";
import { v4 as uuidv4 } from 'uuid';

import path from 'path';
import { mkdir } from 'fs/promises';
import { writeFile } from 'fs/promises';
import { supabase } from "@/lib/supabase";


const streamVideo = new StreamClient(
    process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY!,
    process.env.STREAM_VIDEO_SECRET_KEY!
);

const uploadVideoFromUrl = async (videoUrl: string) => {
    try {
      const response = await fetch(`${process.env.NEXTAUTH_URL}/api/supabase/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: videoUrl }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload video');
      }
      return result.url;
    } catch (error) {
      console.error('Upload failed:', error);
      return null;
    }
};

function verifySignatureWithSDK(body : string, signature: string): boolean{
    return streamVideo.verifyWebhook(body, signature)
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-signature");
  const apiKey = req.headers.get("x-api-key");

  if (!signature || !apiKey) {
    return NextResponse.json({ error: "Missing signature or api key" }, { status: 400 });
  }

  const body = await req.text();

  if (!verifySignatureWithSDK(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: unknown;

  try {
    payload = JSON.parse(body) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const eventType = (payload as Record<string, unknown>)?.type;

  // 🚀 Session Started
  if (eventType === "call.session_started") {
    console.log("Session Started");
    const event = payload as CallSessionStartedEvent;
    const meetingId = event.call.custom?.meetingId;

    if (!meetingId) {
      return NextResponse.json({ error: "Missing meetingId" }, { status: 400 });
    }

    const [rows] = await pool.query("SELECT * FROM meetings WHERE id = ?", [meetingId]) as unknown as [Meeting[], any];
    const [existingMeeting] = rows;

    if (!existingMeeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    await pool.query(
      "UPDATE meetings SET status = ?, started_at = ? WHERE id = ?",
      ["Active", new Date().toISOString(), meetingId]
    );

    const [agentRows] = await pool.query("SELECT * FROM agents WHERE id = ?", [existingMeeting.agent_id]) as unknown as [Agent[], any];
    const [existingAgent] = agentRows;

    if (!existingAgent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const call = streamVideo.video.call("default", meetingId);
    const realtimeClient = await streamVideo.video.connectOpenAi({
      call,
      openAiApiKey: process.env.OPENAI_API_KEY!,
      agentUserId: String(existingAgent.id),
    });

    realtimeClient.updateSession({
      instructions: `
        ${existingAgent.instruction}

        If the user requests to schedule a meeting or expresses interest in a future meeting:
        1. Politely acknowledge the request.
        2. Ask for the meeting topic (e.g., “What would you like the meeting to be about?”).
        3. Ask for the preferred date and start time of the meeting.
        4. Once all details are gathered, summarize the topic and time back to the user.
        5. Ask for confirmation: “Would you like me to go ahead and schedule this meeting?”
        6. If the user confirms, **call the tool named 'schedule_meeting' with the topic and start time.**
        7. Then reply: “Great! I’ll schedule this meeting after the current call ends.”

        Always remain professional, helpful, and concise in tone.
      `,
    });

    realtimeClient.addTool({
      name: "schedule_meeting",
      description: "Schedule future meeting",
      parameters: {
        type: "object",
        properties: {
          topic: { type: "string", description: 'topic of the meeting' },
          startTime: { type: "string", description: 'starting date and time for meeting' },
        },
        required: ["topic", "startTime"]
      }
    }, async ({ topic, startTime }: any) => {
      console.log("schedule_meeting");
      const newMeeting = {
        id: uuidv4(),
        name: topic,
        agent_id: existingAgent.id,
        status: "Schedule",
        started_at: '',
        ended_at: '',
        transcript_url: '',
        recording_url: '',
        summary: '',
        participant: [],
        start_date: new Date(startTime),
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/createScheduleMeeting`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, startTime, existingAgent, existingMeeting, newMeeting }),
      });
      if (!res.ok) {
        const error = await res.text();
        console.log("Stream call creation failed:", error);
      }
      return { success: true }
    });

    return NextResponse.json({ success: true });
  }

  // 👤 Participant Left
  if (eventType === "call.session_participant_left") {
    console.log("Participant Left");
    return NextResponse.json({ success: true });
  }

  // 🛑 Call Ended
  if (eventType === "call.session_ended") {
    console.log("Call Ended");
    const event = payload as CallEndedEvent;
    const meetingId = event.call.custom?.meetingId;

    if (!meetingId) {
      return NextResponse.json({ error: "Missing meetingId" }, { status: 400 });
    }

    const [meeting] = await pool.query("SELECT * FROM meetings WHERE id = ? AND status = 'Active'", [meetingId]) as unknown as [Meeting];

    if (meeting) {
      await pool.query("UPDATE meetings SET status = ?, ended_at = ? WHERE id = ?", ["Processing", new Date().toISOString(), meetingId]);
    }

    return NextResponse.json({ success: true });
  }

  // 📝 Transcription Ready
  if (eventType === "call.transcription_ready") {
    console.log("Transcription Ready");
    const event = payload as CallTranscriptionReadyEvent;
    const meetingId = event.call_cid.split(":" )[1];

    if (!meetingId) {
      return NextResponse.json({ error: "Missing meetingId" }, { status: 400 });
    }

    const [meeting] = await pool.query("SELECT * FROM meetings WHERE id = ?", [meetingId]) as unknown as [Meeting];
    const Transcript = await fetchTranscriptFromURL(event.call_transcription.url);

    if (Transcript && meeting) {
      await pool.query("UPDATE meetings SET transcript_url = ? WHERE id = ?", [event.call_transcription.url, meetingId]);
    }

    const summary = await summarizeTranscriptText(Transcript);

    if (meeting && summary) {
      await pool.query("UPDATE meetings SET summary = ? WHERE id = ?", [summary, meetingId]);
    }

    return NextResponse.json({ success: true });
  } 
  // else if (eventType === "call.recording_ready") {
  //   console.log("Recording Ready");
  //   const event = payload as CallRecordingReadyEvent;
  //   const meetingId = event.call_cid.split(":" )[1];

  //   if (!meetingId) {
  //     return NextResponse.json({ error: "Missing meetingId" }, { status: 400 });
  //   }

  //   const [meeting] = await pool.query("SELECT * FROM meetings WHERE id = ?", [meetingId]);
  //   if (meeting && event.call_recording.url) {
  //     await pool.query("UPDATE meetings SET status = ?, recording_url = ? WHERE id = ?", ["Completed", event.call_recording.url, meetingId]);
  //   }
  //   return NextResponse.json({ success: true });
  // }
//   else if (eventType === "call.recording_ready") {
//   const event = payload as CallRecordingReadyEvent;
//   const meetingId = event.call_cid.split(":")[1];

//   if (!meetingId || !event.call_recording.url) {
//     return NextResponse.json({ error: "Missing data" }, { status: 400 });
//   }

//   try {
//     // Create directory if it doesn't exist
//     const recordingsDir = path.resolve(process.cwd(), 'public', 'recordings');
//     await mkdir(recordingsDir, { recursive: true });

//     // Download video
//     const res = await fetch(event.call_recording.url);
//     if (!res.ok) throw new Error('Failed to download recording');

//     const arrayBuffer = await res.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);

//     // Create a filename
//     // const fileName = `${meetingId}_${Date.now()}.mp4`;
//     const fileName = `${meetingId}_${uuidv4()}.mp4`;
//     const filePath = path.join(recordingsDir, fileName);

//     // Save video to local file
//     await writeFile(filePath, buffer);

//     // Save relative path to DB (e.g., /recordings/myfile.mp4)
//     const relativePath = `/recordings/${fileName}`;

//     await pool.query(
//       "UPDATE meetings SET status = ?, recording_url = ? WHERE id = ?",
//       ["Completed", relativePath, meetingId]
//     );

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error("Error downloading or saving recording:", error);
//     return NextResponse.json({ error: "Failed to handle recording" }, { status: 500 });
//   }
// }

else if (eventType === "call.recording_ready") {
  const event = payload as CallRecordingReadyEvent;
  const meetingId = event.call_cid.split(":")[1];

  if (!meetingId || !event.call_recording.url) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  try {
    
    // upload video to Supabase
    const result = await uploadVideoFromUrl(event.call_recording.url);
    console.log(result, 'uplaoded result from supabase');
    

    // Save to DB
    await pool.query(
      "UPDATE meetings SET status = ?, recording_url = ? WHERE id = ?",
      ["Completed", result, meetingId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving recording to Supabase:", error);
    return NextResponse.json({ error: "Failed to handle recording" }, { status: 500 });
  }
}

  return NextResponse.json({ error: "Unhandled event" }, { status: 400 });
}
