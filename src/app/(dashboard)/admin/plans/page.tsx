'use client'

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Edit, Loader2, Trash } from 'lucide-react';

export default function ViewPlansPage() {
  const [plans, setPlans] = useState([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [planloading, setplanLoading] = useState(false);
  const router = useRouter();

  const fetchPlans = async () => {
    const res = await axios.get('/api/admin/plans');
    setPlans(res.data);
  };

  useEffect(() => {
    setplanLoading(true);
    fetchPlans();
    setplanLoading(false);
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;

    setLoading(true);
    try {
      await axios.delete(`/api/admin/plans?planId=${deleteId}`);
      setPlans(prev => prev.filter((p:any) => p.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      console.error('Error deleting plan', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      <div className="flex justify-between sm:items-center mb-6 sm:flex-row flex-col gap-4">
        <h2 className="text-2xl font-semibold">All Plans</h2>
        <Link href="/admin/plans/create" className='sm:w-auto w-full'>
          <Button className='w-full'>Create Plans +</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {
          planloading ? 
          <div className='flex justify-center items-center py-8'>
            <Loader2 className='animate-spin text-white'/>
          </div>
          :
          plans.map((plan: any) => (
            <div key={plan.id} className="border border-border rounded-lg p-4 shadow text-center bg-foreground text-white">
              <h3 className="font-bold mt-2 text-2xl">${plan.price}</h3>
              <h4 className="text-xl font-bold capitalize">{plan.name}</h4>
              <p className="text-sm text-gray-300">{plan.description}</p>
              <ul className='my-4 text-sm text-gray-300'>
                <li>Tokens: {plan.tokens}</li>
                <li>Agent Cost: ${plan.agent_cost}</li>
                <li>Meeting Cost: ${plan.meeting_cost}</li>
              </ul>

              <div className="flex gap-2 justify-center mt-4">
                <Button
                  variant="outline"
                  className="text-sm !rounded-lg !p-2"
                  onClick={() => router.push(`/admin/plans/edit/${plan.id}`)}
                >
                  <Edit/>
                </Button>

                {
                  plan.name !== 'free' &&
                  <Dialog open={deleteId === plan.id} onOpenChange={(isOpen) => !isOpen && setDeleteId(null)}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" size="sm" onClick={() => setDeleteId(plan.id)}>
                        <Trash/>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete this plan? This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" className='py-2' onClick={() => setDeleteId(null)} disabled={loading}>
                          Cancel
                        </Button>
                        <Button variant="destructive" className='rounded-full px-5 py-2' onClick={handleDelete} disabled={loading}>
                          {loading ? 'Deleting...' : 'Delete'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                }
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}
