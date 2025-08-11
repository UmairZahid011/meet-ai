import { StreamClient } from "@stream-io/node-sdk";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json(); // Expect userId from client

    // Ensure API Key and Secret are set
    const apiKey = process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY;
    const apiSecret = process.env.STREAM_VIDEO_SECRET_KEY;

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "Stream API Key or Secret not configured" },
        { status: 500 }
      );
    }

    const client = new StreamClient(apiKey, apiSecret);

    const now = Math.floor(Date.now() / 1000);
    const exp = now + 60 * 60 * 24;
    const issuedAt = now;

    const token = client.createToken(userId, exp, issuedAt);

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Error generating Stream token:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}