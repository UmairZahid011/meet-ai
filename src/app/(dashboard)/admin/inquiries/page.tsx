'use client';

import { useEffect, useState } from 'react';
import { AppDataTable } from '@/components/dataTable';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { usePageTitle } from '@/hooks/usePageTitle';

type Inquiry = {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: string;
};

export default function AdminInquiriesPage() {
  const [data, setData] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  usePageTitle("Inquiries — Handle Messages and Support Requests")

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await fetch('/api/admin/inquiries');
      const json = await res.json();
      setData(json);
      setLoading(false);
    };
    fetchData();
  }, []);

  const columns = [
    { name: 'Name', selector: (row: Inquiry) => row.name, sortable: true },
    { name: 'Email', selector: (row: Inquiry) => row.email, sortable: true },
    { name: 'Date', selector: (row: Inquiry) => new Date(row.created_at).toLocaleString() },
    {
      name: 'Actions',
      cell: (row: Inquiry) => (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              onClick={() => {
                setSelectedInquiry(row);
                setDialogOpen(true);
              }}
            >
              <Eye />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Inquiry Details</DialogTitle>
            </DialogHeader>
            {selectedInquiry && (
              <div className="space-y-2">
                <div className='text-white'>
                  <strong>Name:</strong>
                  <p className='!text-white mt-[8px] border border-border rounded-lg p-2'>
                  {selectedInquiry.name}
                  </p>
                </div>
                <div className='text-white'>
                  <strong>Email:</strong>
                  <p className='!text-white mt-[8px] border border-border rounded-lg p-2'>
                  {selectedInquiry.email}
                  </p>
                </div>
                <div className='text-white'>
                  <strong>Message:</strong>
                  <p className='!text-white mt-[8px] border border-border rounded-lg p-2 max-h-[200px] overflow-y-auto'>
                  {selectedInquiry.message}
                  </p>
                </div>
                <div className='text-white'>
                  <strong>Date:</strong>
                    <p className='!text-white mt-[8px] border border-border rounded-lg p-2'>
                   {new Date(selectedInquiry.created_at).toLocaleString()}
                    </p>
                  </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      ),
    },
  ];

  return (
    <AppDataTable
      title="Inquiries"
      columns={columns}
      data={data}
      loading={loading}
      searchableFields={['name', 'email']}
    />
  );
}