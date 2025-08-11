import "server-only";
import { StreamClient } from "@stream-io/node-sdk";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

export async function createStreamCall(meeting: any, agent: any, req: NextRequest) {
    const secret = process.env.AUTH_SECRET
    const token = await getToken({ req, secret });

  if (!token?.sub) {
    throw new Error("Unauthenticated: no session found");
  }
  

  const streamVideo = new StreamClient(
    process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY!,
    process.env.STREAM_VIDEO_SECRET_KEY!
  );

  const call = streamVideo.video.call("default", meeting.id);

  await call.create({
    data: {
      created_by_id: token.sub,
      custom: {
        meetingId: meeting.id,
        meetingName: meeting.name,
      },
      settings_override: {
        transcription: { language: "en", mode: "auto-on", closed_caption_mode: "auto-on" },
        recording: { mode: "auto-on", quality: "1080p" },
      },
    },
  });

  await streamVideo.upsertUsers([
    {
      id: String(agent.id),
      name: agent.name,
      role: "user",
    },
  ]);

  return call;
}
