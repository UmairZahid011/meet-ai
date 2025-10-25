'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Textarea } from '@/components/ui/textarea';
import { Agent } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { openModal } from '@/store/modalSlice';
import { useDispatch } from 'react-redux';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function AgentsView() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [agentName, setAgentName] = useState('');
  const [agentInstruction, setAgentInstruction] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedTone, setSelectedTone] = useState('');
  const [selectedPurpose, setSelectedPurpose] = useState('');
  const [loading, setLoading] = useState(false);
  const [agentloading, setagentLoading] = useState(true);
  usePageTitle("Agents - your personal ai agents")
  
  const dispatch = useDispatch();
  

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await fetch('/api/agents');
        if (!res.ok) throw new Error('Failed to fetch agents');
        const data = await res.json();
        setAgents(data);
        setagentLoading(false);
      } catch (error) {
        console.error(error);
        setagentLoading(false);
        toast.error('Error loading agents');
      }
    };

    fetchAgents();
  }, []);

  const createAgent = async () => {
    if (!agentName || !agentInstruction || !selectedTone || !selectedPurpose) {
      toast.error('Please fill all fields');
      return;
    }

    const finalInstruction = `${agentInstruction}. Your purpose is ${selectedPurpose}, and your tone should be ${selectedTone}.`;

    const newAgent: Agent = {
      id: uuidv4(),
      name: agentName,
      instruction: finalInstruction,
    };

    try {
      setLoading(true);
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAgent),
      });

      
      if (!res.ok ){
        const errorText = await res.text();
        if (res.status === 403 && errorText.includes('Not enough tokens')) {
          dispatch(openModal());
          return;
        }
        return;
      }


      setAgents((prev) => [...prev, newAgent]);
      toast.success('Agent created successfully!');
      resetForm();
      setOpen(false);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to create agent');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAgentName('');
    setAgentInstruction('');
    setSelectedPurpose('');
    setSelectedTone('');
  };

  return (
    <div className="">
      <div className="flex justify-between sm:items-center mb-6 sm:flex-row flex-col gap-4">
        <h2 className="text-2xl font-bold">Agents</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>+ Add New Agent</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="mb-4">Add New Agent</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="block mb-2">Agent Name</Label>
                <Input
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="Enter agent name"
                />
              </div>
              <div>
                <Label className="block mb-2">Agent Instruction</Label>
                <Textarea
                  rows={5}
                  className="max-h-[200px]"
                  value={agentInstruction}
                  onChange={(e) => setAgentInstruction(e.target.value)}
                  placeholder="Enter instruction"
                />
              </div>
              <div>
                <Label className="block mb-2">Tone</Label>
                <Select onValueChange={setSelectedTone} value={selectedTone}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Formal">Formal</SelectItem>
                    <SelectItem value="Casual">Casual</SelectItem>
                    <SelectItem value="Empathetic">Empathetic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="block mb-2">Purpose</Label>
                <Select onValueChange={setSelectedPurpose} value={selectedPurpose}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Support">Support</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Assistance">Assistant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={createAgent}
                className="w-full"
                disabled={
                  !agentName || !agentInstruction || !selectedTone || !selectedPurpose || loading
                }
              >
                {loading ? 'Creating...' : 'Create Agent'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {
        (agents.length === 0 && !agentloading)  &&
        <p className="text-muted-foreground text-center">No Agents found.</p>
      }
      {agentloading ? (
          <div className="flex justify-center items-center text-white p-8">
            <Loader2 className='animate-spin'/>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <Link
                href={`/user/agents/${agent.id}`}
                key={agent.id}
                className="flex gap-3 bg-foreground rounded-lg p-4 border"
              >
                <div className="w-10 h-10 rounded-full shrink-0 bg-primary-gradiant text-white font-semibold text-lg flex justify-center items-center capitalize">
                  {agent.name[0]}
                </div>
                <div>
                  <h4 className="text-lg font-semibold">{agent.name}</h4>
                  <p className="text-sm text-muted-foreground overflow-hidden text-ellipsis line-clamp-3">
                    {agent.instruction}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
    </div>
  );
}