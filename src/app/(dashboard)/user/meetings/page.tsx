'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { Loader2, X, Plus } from 'lucide-react';
import { Agent, Meeting } from '@/lib/types';
import { Switch } from "@/components/ui/switch";
import { Badge } from '@/components/ui/badge';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { useDispatch } from 'react-redux';
import { openModal } from '@/store/modalSlice';

const PUBLIC_LINK = process.env.NEXT_PUBLIC_APP_URL + 'call/';

export default function Meetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [meetingloading, setmeetingLoading] = useState(true);
  const [newMeetingName, setNewMeetingName] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [open, setOpen] = useState(false);
  const [showCalendarFields, setShowCalendarFields] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [attendees, setAttendees] = useState<string[]>(['']);
  const [copiedMap, setCopiedMap] = useState<Record<string, boolean>>({});
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const dispatch = useDispatch();

  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchData = async () => {
      try {
        const [meetingsRes, agentsRes] = await Promise.all([
          fetch(`/api/meetings?userId=${session.user.id}`),
          fetch('/api/agents'),
        ]);

        if (!meetingsRes.ok || !agentsRes.ok) throw new Error('Failed to fetch data');

        const [meetings, agents] = await Promise.all([
          meetingsRes.json(),
          agentsRes.json(),
        ]);

        setMeetings(meetings);
        setAgents(agents);
        setmeetingLoading(false);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load meetings or agents');
      }
    };

    fetchData();
  }, [session?.user?.id]);

  const handleCopy = useCallback(async (id: string) => {
    await navigator.clipboard.writeText(`${PUBLIC_LINK}${id}`);
    setCopiedMap((prev) => ({ ...prev, [id]: true }));

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setCopiedMap((prev) => ({ ...prev, [id]: false }));
    }, 2000);
  }, []);

  const handleCreateMeeting = async () => {
    if (!newMeetingName || !selectedAgentId) {
      toast.error('Please enter all required fields');
      return;
    }

    setLoading(true);

    try {
      const tokenRes = await fetch('/api/get-user-token');
      if (!tokenRes.ok) throw new Error('Failed to fetch user tokens');

      const tokenData = await tokenRes.json();
      if (tokenData.tokens < tokenData.meeting_cost) {
        toast.error('Not Enough Tokens to create meeting');
        dispatch(openModal());
        return;
      }

      const agent = agents.find((a) => a.id === selectedAgentId);
      if (!agent) {
        toast.error('Agent not found');
        return;
      }

      const newMeeting: Meeting = {
        id: uuidv4(),
        name: newMeetingName,
        agent_id: selectedAgentId,
        status: showCalendarFields ? 'Schedule' : 'Upcoming',
        started_at: '',
        ended_at: '',
        transcript_url: '',
        recording_url: '',
        summary: '',
        participants: [],
        start_date: showCalendarFields ? new Date(startTime) : null,
      };

      const [res, resDb] = await Promise.all([
        fetch('/api/createMeeting', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ meeting: newMeeting, agent }),
        }),
        fetch('/api/meetings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newMeeting),
        }),
      ]);

      const data = await res.json();

      if (showCalendarFields && res.ok) {
        const googleEvent = {
          summary: newMeetingName,
          description: `Join the meeting here: ${PUBLIC_LINK}${newMeeting.id}`,
          start: {
            dateTime: new Date(startTime).toISOString(),
            timeZone: 'Asia/Karachi',
          },
          end: {
            dateTime: new Date(new Date(startTime).getTime() + 60 * 60 * 1000).toISOString(),
            timeZone: 'Asia/Karachi',
          },
          attendees: attendees.map((email) => ({ email })),
        };

        try {
          const calendarRes = await fetch('/api/calendar-events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(googleEvent),
          });

          if (!calendarRes.ok) {
            const errorData = await calendarRes.json();
            throw new Error(errorData.details?.error?.message || errorData.error);
          }

          toast.success('Event created successfully!');
        } catch (calendarErr: any) {
          console.error('Calendar error:', calendarErr);
          toast.error(`Calendar error: ${calendarErr.message}`);
        }
      }

      if (data.success && resDb.ok) {
        setMeetings((prev) => [...prev, newMeeting]);
        setNewMeetingName('');
        setSelectedAgentId('');
        setShowCalendarFields(false);
        setStartTime('');
        setAttendees(['']);
        setOpen(false);
      } else {
        toast.error('Failed to create meeting.');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex gap-4 sm:items-center justify-between mb-4 sm:flex-row flex-col">
        <h2 className="text-xl font-bold">Meetings</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Create New Meeting</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Meeting</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Meeting Name</Label>
                <Input
                  value={newMeetingName}
                  onChange={(e) => setNewMeetingName(e.target.value)}
                  placeholder="Enter meeting name"
                />
              </div>
              <div>
                <Label className="mb-2 block">Select Agent</Label>
                <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose agent" className='text-white' />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-sm">Schedule for Later</Label>
                <Switch checked={showCalendarFields} onCheckedChange={setShowCalendarFields} />
              </div>

              {showCalendarFields && (
                <>
                  <div>
                    <Label className="mb-2 block">Start Time</Label>
                    <Input
                      type="datetime-local"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block">Attendees Email</Label>
                    <div className="space-y-2">
                      {attendees.map((email, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <Input
                            value={email}
                            placeholder="Enter attendee email"
                            onChange={(e) => {
                              const updated = [...attendees];
                              updated[index] = e.target.value;
                              setAttendees(updated);
                            }}
                          />
                          {attendees.length > 1 && (
                            <Button
                              variant="ghost"
                              className='bg-white text-black'
                              size="icon"
                              onClick={() => {
                                setAttendees(attendees.filter((_, i) => i !== index));
                              }}
                            >
                              <X size={16} />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setAttendees([...attendees, ''])}
                      >
                        <Plus size={16} className="mr-1" />
                        Add Attendee
                      </Button>
                    </div>
                  </div>
                </>
              )}

              <Button
                onClick={handleCreateMeeting}
                className="w-full"
                disabled={
                  !newMeetingName ||
                  !selectedAgentId ||
                  loading ||
                  (showCalendarFields &&
                    (!startTime || attendees.some((email) => email.trim() === '')))
                }
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Create'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {
        meetingloading &&
        <div className="flex justify-center items-center py-8">
            <Loader2 className='animate-spin text-white w-8 h-8'/>
        </div>
      }
      <div className="space-y-2">
        {(meetings.length === 0 || agents.length === 0) && !meetingloading ? (
          <p className="text-muted-foreground">No meetings found.</p>
        ) : (
          meetings.map((meeting) => {
            const agentName = agents.find((a) => a.id === meeting.agent_id)?.name || 'Unknown';
            const isCopied = copiedMap[meeting.id];

            return (
              <div
                key={meeting.id}
                className="p-4 border flex justify-between sm:items-center border-foreground bg-foreground rounded-lg shadow-sm sm:flex-row flex-col gap-4"
              >
                <div>
                  <div className="font-semibold text-xl capitalize text-white">{meeting.name}</div>
                  <div className="text-sm text-muted-foreground my-3">
                    Agent Name :{' '}
                    <span className="capitalize text-primary font-semibold">{agentName}</span>
                  </div>
                  <div>
                    <Badge variant={meeting.status.toLowerCase() as any}>
                      {meeting.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  {(meeting.status === 'Upcoming' ||
                    meeting.status === 'Active' ||
                    meeting.status === 'Schedule') && (
                    <Button className='!py-2 !px-4' variant="outline" onClick={() => handleCopy(meeting.id)} disabled={isCopied}>
                      {isCopied ? 'Copied!' : 'Copy Link'}
                    </Button>
                  )}
                  <Link href={`/user/meetings/${meeting.id}`}>
                    <Button variant="outline" className='!py-2 !px-4'>View</Button>
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}