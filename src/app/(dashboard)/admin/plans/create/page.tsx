'use client'
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function CreatePlanPage() {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState('');
  const [tokens, setTokens] = useState(0);
  const [agentCost, setAgentCost] = useState(0);
  const [meetingCost, setMeetingCost] = useState(0);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true)
    if(name === 'free' || name === 'Free'){
      toast.error('You cannor create more than one free plan')
      setLoading(false);
      return
    }
    await axios.post('/api/admin/plans', {
      name,
      price,
      description,
      tokens,
      agentCost,
      meetingCost
    });
    setLoading(false)
    toast.success('Plan created successfully');
    router.push('/admin/plans');
  };

  return (
    <div className="p-5 mx-auto bg-foreground rounded-2xl">
      <h3 className="text-2xl font-semibold mb-4">Create Plan</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className='text-sm font-semibold'>Plan Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <label className='text-sm font-semibold'>Price</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          className="border p-2 rounded"
          required
          min={0}
        />
        <label className='text-sm font-semibold'>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 rounded"
        />
        <label className='text-sm font-semibold'>Tokens</label>
        <input
          type="number"
          value={tokens}
          onChange={(e) => setTokens(Number(e.target.value))}
          className="border p-2 rounded"
          min={0}
        />
        <label className='text-sm font-semibold'>Agent Cost</label>
        <input
          type="number"
          value={agentCost}
          onChange={(e) => setAgentCost(Number(e.target.value))}
          className="border p-2 rounded"
          min={0}
        />
        <label className='text-sm font-semibold'>Meeting Cost</label>
        <input
          type="number"
          value={meetingCost}
          onChange={(e) => setMeetingCost(Number(e.target.value))}
          className="border p-2 rounded"
          min={0}
        />
        <Button type="submit" className='w-full' disabled={loading || !name || !price || !description || !tokens || !agentCost || !meetingCost}>
          {
            loading ?
            <Loader2/>
            :
            "Create"
          }
        </Button>
      </form>
    </div>
  );
}
