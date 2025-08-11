'use client';

import { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import PolicyEditor from '@/components/policy-editor';
import { Loader2 } from 'lucide-react';

const policiesList = [
  { label: 'Privacy Policy', type: 'privacy' },
  { label: 'Terms & Conditions', type: 'terms' },
  { label: 'Refund Policy', type: 'refund' },
];

type PolicyData = {
  label: string;
  type: string;
  content: string;
};

export default function PoliciesAdminPage() {
  const [policies, setPolicies] = useState<PolicyData[]>([]);
  const [loading, setloading] = useState(false);

  useEffect(() => {
    setloading(true);
    const fetchPolicies = async () => {
      const data = await Promise.all(
        policiesList.map(async (p) => {
          const res = await fetch(`/api/admin/policies/${p.type}`);
          const json = await res.json();
          return { ...p, content: json.content || '' };
        })
      );
      setPolicies(data);
      setloading(false);
    };

    fetchPolicies();
  }, []);

  const handleSave = async (type: string, content: string) => {
    const res = await fetch(`/api/admin/policies/${type}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });

    if (res.ok) {
      setPolicies((prev) =>
        prev.map((p) => (p.type === type ? { ...p, content } : p))
      );
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Policies</h2>

      <Tabs defaultValue={policiesList[0].type} className="w-full">
        <div className="overflow-x-auto">
          <TabsList>
            {policiesList.map((p) => (
              <TabsTrigger key={p.type} value={p.type}>
                {p.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {
          loading ? 
          <div className='py-8 flex px-3 justify-center items-center bg-foreground rounded-3xl'>
            <Loader2 className='text-white h-10 w-10 animate-spin'/>
          </div>
          :

          policies.map((p) => (
            <TabsContent key={p.type} value={p.type} className="mt-6">
              <PolicyEditor
                type={p.type}
                initialContent={p.content}
                onSave={handleSave}
              />
            </TabsContent>
          ))
        }
      </Tabs>
    </div>
  );
}
