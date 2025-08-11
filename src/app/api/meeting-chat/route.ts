import { NextRequest, NextResponse } from 'next/server';
import { meetingChat } from '../openai';

export async function POST(req: NextRequest) {
  const { question, transcript } = await req.json();

  if (!question || !transcript) {
    return new NextResponse('Missing input', { status: 400 });
  }

  try {
    const reply = await meetingChat(transcript, question);
    return NextResponse.json({ reply });
  } catch (error) {
    console.error('AI error:', error);
    return new NextResponse('AI error', { status: 500 });
  }
}
