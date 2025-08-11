'use client'

import { AppDataTable } from '@/components/dataTable';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

type User = {
    id: number;
    name: string;
    email: string;
    password: string;
    meetingCount: number;
    agentCount: number;
    plan: string;
    image:string;
    tokens: number;
}

type UserPlan = {
  id: number;
  user_id: number;
  plan_id: number;
  plan_name: string;
  created_at: Date;
  updated_at: Date;
  user_name: string;
  plan_price: number;
};

export default function Dashboard() {
  const [data, setData] = useState<User>();
  const [plans, setPlans] = useState<UserPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  
  const {data:session} = useSession();  

  useEffect(() => {
    const fetchStats = async () => {
      const res = await fetch('/api/user');
      const stats = await res.json();
      setData(stats);
    };
    fetchStats();
  }, []);

  useEffect(() => {
      if(session?.user.id !== undefined){
        fetch(`/api/admin/user-plans/${session?.user.id}`)
          .then((res) => res.json())
          .then((data) => {
            setPlans(data? [data] : []);
            setLoadingPlans(false);
          });
      }
    }, [session?.user.id]);

  const uploadVideoFromUrl = async (videoUrl: string) => {
    try {
      const response = await fetch('/api/supabase/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: videoUrl }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload video');
      }
      return result.url;
    } catch (error) {
      console.error('Upload failed:', error);
      return null;
    }
};

  

  const columns = [
    { name: 'ID', selector: (row: UserPlan) => row.id, sortable: true },
    { name: 'User Name', selector: (row: UserPlan) => row.user_name, sortable: true },
    // { name: 'Plan ID', selector: (row: UserPlan) => row.plan_id, sortable: true },
    { name: 'Plan Name', selector: (row: UserPlan) => row.plan_name, sortable: true },
    { name: 'Price', selector: (row: UserPlan) => row.plan_price, sortable: true },
    { name: 'Purchased At', selector: (row: UserPlan) => new Date(row.updated_at).toLocaleString(), sortable: true },
  ];

  return (
    <>
      <div className="">
        <h2 className="mb-6">Welcome, {data?.name || 'User'}</h2>
        <div className="grid md:grid-cols-2 gap-5 md:gap-6">
          <Card title="Your Meetings" value={data?.meetingCount || 0} />
          <Card title="Available Agents" value={data?.agentCount || 0} />
          <Card title="Remaing Tokens" value={data?.tokens || 0} />
          <Card title="Plan" value={data?.plan || 0} />
        </div>
      </div>
      <div className='mt-4'>
          <AppDataTable
            title="Transaction  History"
            columns={columns}
            data={plans}
            loading={loadingPlans}
            searchableFields={['id', 'user_name', 'plan_name']}
          />
        </div>

      <button onClick={()=>uploadVideoFromUrl('https://ohio.stream-io-cdn.com/1396221/video/recordings/default_f05ff6c2-76f5-401d-a6dc-7ead444bf891/rec_default_f05ff6c2-76f5-401d-a6dc-7ead444bf891_1080p_1754134458727.mp4?Expires=1755344212&Signature=CpoCM3WKroQcxVGdWbiKDQTTX63-jq9beGbT1zR31nVc-lt-BRbRPYVIJTLGw-GNAkd47oyt~rvzMITLmidcAdWyyqcmlJffmflBdXKyR6IvDwNmKIGfW7aI7H3h-y6~bzd6-3mxFuynqqblb~UY1NbZkYnuZ4bHvo3kUmH1tgXKn1jiKMlu3qmVzgTonXs6y17FiB2HAyV2a~LBfB9mvabwHKn-73hY6mmUABOGx42hblHhM-r2ZNB2fREuQdCQ1fyv-TRkOz1CcDqz~OAK8HC5YBGt8ng~fQxRfunLIeyf-JdxJ42rJkZZ3mDims0Cmd4XD17-i788RcVCRZRFcw__&Key-Pair-Id=APKAIHG36VEWPDULE23Q')}>fetch</button>

    </>
  );
}

function Card({ title, value }: { title: string; value: any }) {
  return (
    <>
      <div className="bg-foreground shadow-md rounded-2xl p-6 text-center">
        <h4 className="text-xl font-semibold text-white">{title}</h4>
        <p className="!text-3xl !font-semibold text-primary mt-2">{value}</p>
      </div>
    </>
  );
}
