import { createStreamCall } from "@/lib/strean-video";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { meeting, agent } = await req.json();

  try {
    const call = await createStreamCall(meeting, agent, req);
    return NextResponse.json({ success: true, callId: call.id});
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
