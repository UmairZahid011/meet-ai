'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { Loader2, X, Plus } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

import { openModal } from '@/store/modalSlice';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Agent, Meeting } from '@/lib/types';

const PUBLIC_LINK = `${process.env.NEXT_PUBLIC_APP_URL}call/`;

export default function Meetings() {
  // ─── State ───────────────────────────────────────────────────────────────
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [meetingLoading, setMeetingLoading] = useState(true);
  const [newMeetingName, setNewMeetingName] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [open, setOpen] = useState(false);
  const [showCalendarFields, setShowCalendarFields] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [attendees, setAttendees] = useState<string[]>(['']);
  const [copiedMap, setCopiedMap] = useState<Record<string, boolean>>({});
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  usePageTitle('Your Meetings — AI Notes, Summaries, and Insights');

  const dispatch = useDispatch();
  const { data: session } = useSession();
  const userId = session?.user.id;

  // ─── Derived Data ─────────────────────────────────────────────────────────
  const isFormValid = useMemo(() => {
    if (!newMeetingName || !selectedAgentId) return false;
    if (showCalendarFields && (!startTime || attendees.some((a) => !a.trim()))) return false;
    return true;
  }, [newMeetingName, selectedAgentId, showCalendarFields, startTime, attendees]);

  // ─── Helpers ─────────────────────────────────────────────────────────────
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return `${formattedDate}, ${formattedTime}`;
  };

  const fetchData = useCallback(async () => {
    if (!userId) return;

    try {
      const [meetingsRes, agentsRes] = await Promise.all([
        fetch(`/api/meetings?userId=${userId}`),
        fetch('/api/agents'),
      ]);

      if (!meetingsRes.ok || !agentsRes.ok) {
        throw new Error('Failed to fetch meetings or agents');
      }

      const [meetingsData, agentsData] = await Promise.all([
        meetingsRes.json(),
        agentsRes.json(),
      ]);

      setMeetings(meetingsData);
      setAgents(agentsData);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load meetings or agents');
    } finally {
      setMeetingLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCopy = useCallback(async (id: string) => {
    await navigator.clipboard.writeText(`${PUBLIC_LINK}${id}`);
    setCopiedMap((prev) => ({ ...prev, [id]: true }));

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setCopiedMap((prev) => ({ ...prev, [id]: false }));
    }, 2000);
  }, []);

  // ─── Meeting Creation ─────────────────────────────────────────────────────
  const handleCreateMeeting = async () => {
    if (!isFormValid) {
      toast.error('Please enter all required fields');
      return;
    }

    setLoading(true);

    try {
      // Check user tokens
      const tokenRes = await fetch('/api/get-user-token');
      if (!tokenRes.ok) throw new Error('Failed to fetch user tokens');
      const tokenData = await tokenRes.json();

      if (tokenData.tokens < tokenData.meeting_cost) {
        toast.error('Not Enough Tokens to create meeting');
        dispatch(openModal());
        return;
      }

      const agent = agents.find((a) => a.id === selectedAgentId);
      if (!agent) throw new Error('Agent not found');

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

      // Save meeting in both systems
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

      // Schedule Google Calendar event if applicable
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
        toast.success('Meeting created successfully!');
        setMeetings((prev) => [...prev, newMeeting]);
        resetForm();
        fetchData();
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

  const resetForm = () => {
    setNewMeetingName('');
    setSelectedAgentId('');
    setShowCalendarFields(false);
    setStartTime('');
    setAttendees(['']);
    setOpen(false);
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="p-4">
      {/* Header + Dialog */}
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
              {/* Meeting Name */}
              <div>
                <Label className="mb-2 block">Meeting Name</Label>
                <Input
                  value={newMeetingName}
                  onChange={(e) => setNewMeetingName(e.target.value)}
                  placeholder="Enter meeting name"
                />
              </div>

              {/* Agent Select */}
              <div>
                <Label className="mb-2 block">Select Agent</Label>
                <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose agent" />
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

              {/* Schedule Switch */}
              <div className="flex items-center gap-2">
                <Label className="text-sm">Schedule for Later</Label>
                <Switch checked={showCalendarFields} onCheckedChange={setShowCalendarFields} />
              </div>

              {/* Calendar Fields */}
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
                              className="bg-white text-black"
                              size="icon"
                              onClick={() =>
                                setAttendees(attendees.filter((_, i) => i !== index))
                              }
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

              {/* Submit Button */}
              <Button
                onClick={handleCreateMeeting}
                className="w-full"
                disabled={!isFormValid || loading}
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Create'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Loader */}
      {meetingLoading && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="animate-spin text-white w-8 h-8" />
        </div>
      )}

      {/* Meeting List */}
      <div className="space-y-2">
        {!meetingLoading && meetings.length === 0 ? (
          <p className="text-muted-foreground text-center">No meetings found.</p>
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
                  <h4 className="font-semibold text-xl capitalize text-white">{meeting.name}</h4>
                  <p className="text-sm text-muted-foreground my-3">
                    Agent:{' '}
                    <span className="capitalize text-primary font-semibold">{agentName}</span>
                  </p>
                  <Badge variant={meeting.status.toLowerCase() as any}>
                    {meeting.status}
                  </Badge>
                  <p className="text-white text-sm mt-2">
                    {formatDateTime(meeting.updated_at || meeting.created_at)}
                  </p>
                </div>

                <div className="flex gap-2 items-center">
                  {['Upcoming', 'Active', 'Schedule'].includes(meeting.status) && (
                    <Button
                      className="!py-2 !px-4"
                      variant="outline"
                      onClick={() => handleCopy(meeting.id)}
                      disabled={isCopied}
                    >
                      {isCopied ? 'Copied!' : 'Copy Link'}
                    </Button>
                  )}
                  <Link href={`/user/meetings/${meeting.id}`}>
                    <Button variant="outline" className="!py-2 !px-4">
                      View
                    </Button>
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
