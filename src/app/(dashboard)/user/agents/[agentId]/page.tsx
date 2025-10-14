'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bot, MoreVertical, Trash } from 'lucide-react';
import { Agent } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function AgentDetail() {
  const { agentId } = useParams();
  const router = useRouter();
  const [agent, setAgent] = useState<Agent | null>(null);
  // const [meetingsCount, setMeetingsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  usePageTitle("Billing — Plans, Payments, and Usage History")

  useEffect(() => {
    const fetchAgentDetail = async () => {
      try {
        const agentRes = await fetch(`/api/agents/${agentId}`);
        if (!agentRes.ok) throw new Error('Failed to fetch agent');
        const data = await agentRes.json();
        setAgent(data);
        // setMeetingsCount(data.meetingsCount);
      } catch (error) {
        console.error('Error:', error);
        setAgent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAgentDetail();
  }, [agentId]);

  const handleDelete = async () => {
    if (!agent) return;
    try {
      const response = await fetch('/api/agents', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: [agent.id] }),
      });

      if (!response.ok) throw new Error('Failed to delete agent');
      router.push('/user/agents');
    } catch (error) {
      console.error('Error deleting agent:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
      </div>
    );
  }

  if (!agent) {
    return <p className="p-4 text-center text-red-600">Agent not found.</p>;
  }

  return (
    <div className="p-4">
      <div className="text-sm text-white mb-2">
        My Agents {'>'} <span className="text-primary font-medium">{agent.name}</span>
      </div>

      <Card className="relative p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Bot/>
            </div>
            <div>
              <div className="text-xl text-white font-semibold">{agent.name}</div>
              {/* <div className="text-xs text-muted-foreground">{meetingsCount} meetings</div> */}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className='hover:!bg-transparent'>
                <MoreVertical className="h-4 w-4 text-white" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="flex items-center gap-2 text-red-600"
                onClick={handleDelete}
              >
                <Trash className="h-4 w-4 text-red-500" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <CardContent className="px-0">
          <div className="font-semibold text-white mb-1 text-lg">Instructions</div>
          <p className="text-sm text-muted-foreground">{agent.instruction}</p>
        </CardContent>
      </Card>
    </div>
  );
}