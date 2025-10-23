'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  StreamVideo,
  StreamCall,
  StreamVideoClient,
  StreamTheme,
  Call,
} from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';
import { Loader2, Loader2Icon, PackageOpen } from 'lucide-react';
import CallStageHandler from './components/call-stage-handler';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Meeting } from '@/lib/types';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function CallPage() {
  const params = useParams();
  const meetingId = params.meetingId;
  const router = useRouter();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/meetings/${meetingId}`);
        if (res.ok) {
          const found: Meeting = await res.json();
          if(found){
            setMeeting(found);
            setLoading(false);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error(error)
        setLoading(false)
      }
    }

    if (meetingId) fetchData();
  }, [meetingId]);

  useEffect(() => {
    return () => {
      if (client) client.disconnectUser().catch(() => {});
    };
  }, [client]);

  const joinMeeting = async () => {
    if (!name || !meetingId || !meeting || !email) return;
    setLoading(true);

    const id = `guest_${Math.random().toString(36).slice(2, 10)}`;

    try {
      const res = await fetch('/api/stream-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id }),
      });

      if (!res.ok) throw new Error('Failed to generate stream token.');

      const { token } = await res.json();
      const apiKey = process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY!;

      const streamClient = new StreamVideoClient({
        apiKey,
        user: { id, name },
        token,
      });

      const joinedAt = new Date().toISOString();

      const dbRes = await fetch('/api/meetings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: meetingId,
          participant: {
            id,
            name,
            email,
            joined_at: joinedAt,
          },
        }),
      });

      if (dbRes.status === 409) {
        const text = await dbRes.text();
        toast.error('Participant with this email already exist');
        setLoading(false);
        throw new Error(text || 'Participant already exists in this meeting.');
      }

      if (!dbRes.ok) {
        const errText = await dbRes.text();
        throw new Error(errText || 'Failed to add participant.');
      }

      const streamCall = streamClient.call('default', String(meetingId));
      streamCall.camera.disable();
      streamCall.microphone.disable();

      setClient(streamClient);
      setCall(streamCall);
    } catch (err: any) {
      console.error('Join meeting error:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };
  if (!meeting && !loading){
    return(
      <div className='min-h-screen text-white w-full flex flex-col justify-center items-center'>
        <PackageOpen size={70} />
        <p className="!text-white text-center !text-2xl font-semibold">Meeting not found.</p>
      </div>
    ) 
  }
  if(meeting?.status === "Completed" || meeting?.status === "Processing"){
    return(
      <div className='flex flex-col justify-center items-center p-5 h-screen'>
        <div className='text-green-500'>
            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="currentColor" className="bi bi-check2-circle" viewBox="0 0 16 16">
              <path d="M2.5 8a5.5 5.5 0 0 1 8.25-4.764.5.5 0 0 0 .5-.866A6.5 6.5 0 1 0 14.5 8a.5.5 0 0 0-1 0 5.5 5.5 0 1 1-11 0"/>
              <path d="M15.354 3.354a.5.5 0 0 0-.708-.708L8 9.293 5.354 6.646a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0z"/>
            </svg>
        </div>
        <h2 className='text-2xl'>This Meeting already has been completed</h2>
      </div>
    )
  }
  if(meeting?.status === "Cancelled"){
    return(
      <div className='flex flex-col justify-center items-center p-5 h-screen'>
        <div className='text-red-500'>
            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="currentColor" className="bi bi-x-circle" viewBox="0 0 16 16">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
            </svg>
        </div>
        <h2 className='text-2xl'>This Meeting has been cancelled by owner</h2>
      </div>
    )
  }
  if(meeting?.status === "Schedule" && meeting.start_date && new Date() < new Date(meeting.start_date)){
    return(
      <div className='flex flex-col justify-center items-center p-5 h-screen'>
        <div className='text-green-500'>
            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="currentColor" className="bi bi-stopwatch" viewBox="0 0 16 16">
              <path d="M8.5 5.6a.5.5 0 1 0-1 0v2.9h-3a.5.5 0 0 0 0 1H8a.5.5 0 0 0 .5-.5z"/>
              <path d="M6.5 1A.5.5 0 0 1 7 .5h2a.5.5 0 0 1 0 1v.57c1.36.196 2.594.78 3.584 1.64l.012-.013.354-.354-.354-.353a.5.5 0 0 1 .707-.708l1.414 1.415a.5.5 0 1 1-.707.707l-.353-.354-.354.354-.013.012A7 7 0 1 1 7 2.071V1.5a.5.5 0 0 1-.5-.5M8 3a6 6 0 1 0 .001 12A6 6 0 0 0 8 3"/>
            </svg>
        </div>
        <h2 className='text-2xl'>This Meeting has Scheduled for Later</h2>
        <p className='text-grey'>You can join the meeting on {meeting.start_date ? format(meeting.start_date, 'dd-MM-yyyy \'at\' hh:mm a') : null}</p>
      </div>
    )
  }
  if(loading){
    return <div className='h-screen text-center flex justify-center items-center flex-col text-white'>
      <Loader2Icon className='animate-spin w-10 h-10'/>
      <p>Joining Meeting</p>
    </div>
  }
  if (error){
    return <p className="text-red-500 p-4 text-center">{error}</p>;
  } 

  if (!call || !client)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        {loading ? (
          <>
            <div className='flex gap-2 flex-col items-center justify-center text-white'>
              <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
              <p className="text-sm">Joining meeting...</p>
            </div>
          </>
        ) : (
          <div className="w-full md:max-w-md mx-auto space-y-4 bg-foreground p-4 rounded-lg">
            <h4 className="text-center mb-4 text-2xl font-bold">Add your details to join the meeting</h4>
            <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Your Email" type='email' value={email} onChange={(e) => setEmail(e.target.value)} />
            <Button onClick={joinMeeting} className="w-full" disabled={name === '' || email === ''}>
              Join Meeting
            </Button>
          </div>
        )}
      </div>
    );

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <StreamTheme>
          <CallStageHandler meetingName={meeting?.name || "Untitled"} userName={name} router={router}/>
        </StreamTheme>
      </StreamCall>
    </StreamVideo>
  );
}
