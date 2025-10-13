'use client';

import { use, useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function EditPlanPage(props: { params: Promise<{ id: string }> }) {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState('');
  const [tokens, setTokens] = useState(0);
  const [agentCost, setAgentCost] = useState(0);
  const [meetingCost, setMeetingCost] = useState(0);

  const router = useRouter();
  const { id: planId } = use(props.params);

  useEffect(() => {
  if (!planId) {
    toast.error('Plan ID is missing in the URL');
    router.push('/admin/plans');
    return;
  }

  const fetchPlan = async () => {
    try {
      const res = await axios.get(`/api/admin/plans/${planId}`);
      const data = res.data;
      setName(data.name);
      setPrice(data.price);
      setDescription(data.description);
      setTokens(data.tokens);
      setAgentCost(data.agent_cost);
      setMeetingCost(data.meeting_cost);
    } catch (error) {
      toast.error('Failed to fetch plan');
      console.error('Error fetching plan:', error);
      router.push('/admin/plans');
    } finally {
      setInitialLoading(false);
    }
  };

  fetchPlan();
}, [planId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planId) return;

    setLoading(true);
    try {
      await axios.patch(`/api/admin/plans/${planId}`, {
        name,
        price,
        description,
        tokens,
        agentCost,
        meetingCost,
      });
      toast.success('Plan updated successfully');
      router.push('/admin/plans');
    } catch (err) {
      toast.error('Error updating plan');
      console.error('Error updating plan:', err);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading){
    return (
        <div className="flex items-center justify-center h-40 bg-foreground rounded-3xl">
        <Loader2 className="animate-spin w-6 h-6 text-white" />
        </div>
    );
  };

  return (
    <div className="p-5 mx-auto bg-foreground rounded-2xl">
      <h3 className="text-2xl font-semibold mb-4">Edit Plan</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {
          name === 'free'
          ?
          <>
            <label className="text-sm font-semibold">Plan Name</label>
            <div className="border border-[#ffffff29] py-[14px] px-[20px] text-white rounded-[12px] cursor-no-drop">
              {name}
            </div>
          </>
          :
          <>
            <label className="text-sm font-semibold">Plan Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border p-2 rounded"
              required
            />
          </>
        }
        {
          name === 'free' ?
          <>
            <label className="text-sm font-semibold">Plan Name</label>
            <div className="border border-[#ffffff29] py-[14px] px-[20px] text-white rounded-[12px] cursor-no-drop">
              {price}
            </div>
          </>
          :
          <>
            <label className="text-sm font-semibold">Price</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="border p-2 rounded"
              required
            />
          </>
        }
        <label className="text-sm font-semibold">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 rounded"
        />
        <label className="text-sm font-semibold">Tokens</label>
        <input
          type="number"
          value={tokens}
          onChange={(e) => setTokens(Number(e.target.value))}
          className="border p-2 rounded"
        />
        <label className="text-sm font-semibold">Agent Cost</label>
        <input
          type="number"
          value={agentCost}
          onChange={(e) => setAgentCost(Number(e.target.value))}
          className="border p-2 rounded"
        />
        <label className="text-sm font-semibold">Meeting Cost</label>
        <input
          type="number"
          value={meetingCost}
          onChange={(e) => setMeetingCost(Number(e.target.value))}
          className="border p-2 rounded"
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : 'Update Plan'}
        </Button>
      </form>
    </div>
  );
}
