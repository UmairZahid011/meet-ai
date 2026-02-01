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
import { pool } from "@/lib/db";
import { Agent, Meeting } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

const streamVideo = new StreamClient(
  process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY!,
  process.env.STREAM_VIDEO_SECRET_KEY!
);

function verifySignatureWithSDK(body: string, signature: string): boolean {
  return streamVideo.verifyWebhook(body, signature);
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
  console.log("Received event type:", eventType);
  // 🚀 Session Started
  if (eventType === "call.session_started") {
    const event = payload as CallSessionStartedEvent;
    const meetingId = event.call.custom?.meetingId;

    if (!meetingId) {
      return NextResponse.json({ error: "Missing meetingId" }, { status: 400 });
    }

    const [updateResult]: any = await pool.query(
      `
      UPDATE meetings
      SET
        agent_joined = TRUE,
        status = ?,
        started_at = ?
      WHERE id = ? AND agent_joined = FALSE
      `,
      ["Active", new Date(), meetingId]
    );

    if (updateResult.affectedRows === 0) {
      console.log(`🔁 Agent already joined for meeting ${meetingId}, skipping`);
      return NextResponse.json({ success: true, message: "Already processed" });
    }

    const [rows] = (await pool.query("SELECT * FROM meetings WHERE id = ?", [meetingId])) as unknown as [
      Meeting[],
      any
    ];
    const [existingMeeting] = rows;

    if (!existingMeeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    const [agentRows] = (await pool.query("SELECT * FROM agents WHERE id = ?", [
      existingMeeting.agent_id,
    ])) as unknown as [Agent[], any];
    const [existingAgent] = agentRows;

    if (!existingAgent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // ✅ Connect the OpenAI Agent
    const call = streamVideo.video.call("default", meetingId);
    if (call) {
      const realtimeClient = await streamVideo.video.connectOpenAi({
        call,
        openAiApiKey: process.env.OPENAI_API_KEY!,
        agentUserId: String(existingAgent.id),
      });
  
      // await realtimeClient.sendUserMessageContent({
      //   type: "input_text", text: "say that am working on it '" 
      // });
  
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
  
  
      realtimeClient.on("message", (msg:any) => {
        console.log("🧠 AI Message:", msg);
      });
      realtimeClient.on("event", (ev:any) => {
        console.log("📡 Event:", ev.type);
      });
  
      realtimeClient.addTool(
        {
          name: "schedule_meeting",
          description: "Schedule future meeting",
          parameters: {
            type: "object",
            properties: {
              topic: { type: "string", description: "topic of the meeting" },
              startTime: { type: "string", description: "starting date and time for meeting" },
            },
            required: ["topic", "startTime"],
          },
        },
        async ({ topic, startTime }: any) => {
          const newMeeting = {
            id: uuidv4(),
            name: topic,
            agent_id: existingAgent.id,
            status: "Schedule",
            started_at: "",
            ended_at: "",
            transcript_url: "",
            recording_url: "",
            summary: "",
            participant: [],
            start_date: new Date(startTime),
          };
  
          const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/createScheduleMeeting`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ topic, startTime, existingAgent, existingMeeting, newMeeting }),
          });
          if (!res.ok) {
            const error = await res.text();
            console.log("Stream call creation failed:", error);
          }
          return { success: true };
        }
      );
  
      realtimeClient.on("error", (err:any) => {
        console.error("❌ OpenAI Realtime Client error:", err);
      });
  
      realtimeClient.on("close", () => {
        console.warn("⚠️ Realtime Client connection closed");
      });
    }


    return NextResponse.json({ success: true });
  }

  // 🛑 Call Ended
  if (eventType === "call.session_ended") {
    const event = payload as CallEndedEvent;
    const meetingId = event.call.custom?.meetingId;

    if (!meetingId) {
      return NextResponse.json({ error: "Missing meetingId" }, { status: 400 });
    }

    const [meeting] = (await pool.query("SELECT * FROM meetings WHERE id = ? AND status = 'Active'", [
      meetingId,
    ])) as unknown as [Meeting];

    if (meeting) {
      await pool.query("UPDATE meetings SET status = ?, ended_at = ? WHERE id = ?", [
        "Processing",
        new Date().toISOString(),
        meetingId,
      ]);
    }

    return NextResponse.json({ success: true });
  }

  // 📝 Transcription Ready
  if (eventType === "call.transcription_ready") {
    const event = payload as CallTranscriptionReadyEvent;
    const meetingId = event.call_cid.split(":")[1];

    if (!meetingId) {
      return NextResponse.json({ error: "Missing meetingId" }, { status: 400 });
    }

    const [meeting] = (await pool.query("SELECT * FROM meetings WHERE id = ?", [meetingId])) as unknown as [Meeting];
    const Transcript = await fetchTranscriptFromURL(event.call_transcription.url);

    if (Transcript && meeting) {
      await pool.query("UPDATE meetings SET transcript_url = ? WHERE id = ?", [
        event.call_transcription.url,
        meetingId,
      ]);
    }

    const summary = await summarizeTranscriptText(Transcript);
    if (meeting && summary) {
      await pool.query("UPDATE meetings SET summary = ? WHERE id = ?", [summary, meetingId]);
    }

    return NextResponse.json({ success: true });
  }

  // 📹 Recording Ready
  if (eventType === "call.recording_ready") {
    const event = payload as CallRecordingReadyEvent;
    const meetingId = event.call_cid.split(":")[1];

    if (!meetingId || !event.call_recording.url) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    try {

      await pool.query("UPDATE meetings SET status = ?, recording_url = ? WHERE id = ?", [
        "Completed",
        event.call_recording.url,
        meetingId,
      ]);

      return NextResponse.json({ success: true });
    } catch (error) {
      return NextResponse.json({ error: "Failed to handle recording" }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Unhandled event" }, { status: 400 });
}
