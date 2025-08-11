'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { Agent, Meeting } from '@/lib/types';
import { fetchTranscript } from '@/lib/utils';
import { Loader, Loader2, Send } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MarkdownViewer from '@/components/markdown-viewer';

export default function MeetingDetail() {
  const { meetingId } = useParams();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [transcript, setTranscript] = useState<any[]>([]);
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Master loading state

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const res = await fetch(`/api/meetings/${meetingId}`);
        if (!res.ok) throw new Error('Failed to fetch meeting.');

        const meetingData: Meeting = await res.json();
        setMeeting(meetingData);

        const agentRes = await fetch(`/api/agents/${meetingData.agent_id}`);
        if (agentRes.ok) {
          const agentData: Agent = await agentRes.json();
          setAgent(agentData);
        }
      } catch (error) {
        console.error('Error fetching meeting/agent:', error);
      } finally {
        setIsLoading(false); // Hide loader regardless of success/failure
      }
    };

    if (meetingId) fetchMeeting();
  }, [meetingId]);

  useEffect(() => {
    const loadTranscript = async () => {
      if (meeting?.transcript_url) {
        const lines = await fetchTranscript(meeting.transcript_url);
        setTranscript(lines);
      }
    };
    loadTranscript();
  }, [meeting]);

  const getSpeakerName = (speakerId: string) => {
    if (agent && speakerId === agent.id) return agent.name;
    return meeting?.participants?.find(p => p.id === speakerId)?.name || 'Unknown';
  };

  const formattedTranscript = transcript
    .map(line => `${getSpeakerName(line.speaker_id)}: ${line.text}`)
    .join('\n');

  const handleSend = async () => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, { role: 'user', text: input }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/meeting-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: input, transcript: formattedTranscript }),
      });

      if (!res.ok) throw new Error(await res.text());

      const { reply } = await res.json();
      setMessages(prev => [...prev, { role: 'ai', text: reply }]);
    } catch (error: any) {
      console.error('Chat error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateMeetingStatus = async (status: Meeting['status'], extraData = {}) => {
    if (!meeting) return;

    const updated: Meeting = { ...meeting, status, ...extraData };

    await fetch('/api/meetings', {
      method: 'PUT',
      body: JSON.stringify(updated),
    });

    setMeeting(updated);
  };

  const handleCancel = () => updateMeetingStatus('Cancelled');

  // ✅ Loader shown first if fetching
  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin h-10 w-10 text-white" />
      </div>
    );
  }

  // ❌ Fallback if meeting not found
  if (!meeting) {
    return <div className="p-6 text-center text-red-400 text-sm">Meeting not found.</div>;
  }

  const statusMessage = {
    Upcoming: 'Once you complete this meeting, a summary will appear here.',
    Active: 'Meeting is currently in progress.',
    Completed: 'Meeting has ended. Summary is available below.',
    Processing: 'Meeting is being processed. Please wait...',
    Cancelled: 'This meeting has been cancelled.',
    Schedule: 'This meeting is scheduled for later.',
  }[meeting.status] || 'Unknown meeting status.';

  return (
    <div className="p-4 md:p-6">
      <div className="text-sm text-white mb-4">
        Meetings {'>'} <span className="text-primary font-medium">{meeting.name}</span>
      </div>

      <Card className="p-4 md:p-8 text-center">
        {meeting.status !== 'Completed' && (
          <div className="mb-6">
            <Image
              width={300}
              height={300}
              src="/assets/imgs/meeting-img.png"
              alt="Meeting"
              className="mx-auto mb-4"
            />
            <h4 className="text-xl font-semibold mb-1">
              {meeting.status === 'Upcoming' ? 'Not started yet' : meeting.status}
            </h4>
            <p className="text-muted-foreground text-sm">{statusMessage}</p>
          </div>
        )}

        {meeting.status === 'Upcoming' && (
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={handleCancel}>
              Cancel meeting
            </Button>
          </div>
        )}

        {meeting.status === 'Completed' && (
          <Tabs defaultValue="summary" className="w-full">
            <div className="overflow-y-auto">
              <TabsList className="mb-5 min-w-[500px]">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="recording">Call Recording</TabsTrigger>
                <TabsTrigger value="transcript">Transcription</TabsTrigger>
                <TabsTrigger value="chat">AI Chat</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="summary">
              <div className="text-start">
                <MarkdownViewer rawText={meeting.summary} />
              </div>
            </TabsContent>

            <TabsContent value="recording">
              <video src={meeting.recording_url} controls className="w-full max-w-xl mx-auto" />
            </TabsContent>

            <TabsContent value="transcript">
              <div>
                {transcript.map((line, i) => (
                  <div key={i} className="mb-2 text-white text-start">
                    <strong className="text-primary">{getSpeakerName(line.speaker_id)}:</strong>
                    <br />
                    <span className="ml-5">{line.text}</span>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="chat">
              <div className="w-full max-w-2xl mx-auto mt-4 space-y-4">
                <div className="border border-border p-4 rounded-md h-96 overflow-y-auto bg-foreground">
                  {messages.map((msg, i) => (
                    <div key={i} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                      <div
                        className={`inline-block px-4 py-2 rounded-lg ${
                          msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {loading && <div className="text-sm text-gray-500">Thinking...</div>}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask something about the meeting..."
                  />
                  <button onClick={handleSend} disabled={loading} className="primary-btn !rounded-lg">
                    {loading ? <Loader className="animate-spin" /> : <Send />}
                  </button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </Card>
    </div>
  );
}
