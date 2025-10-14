'use client';

import { useEffect, useState } from 'react';
import { AppDataTable } from '@/components/dataTable';
import { usePageTitle } from '@/hooks/usePageTitle';

type Newsletter = {
  id: number;
  email: string;
  created_at: string;
};

export default function NewsletterListPage() {
    const [data, setData] = useState<Newsletter[]>([]);
    const [loading, setLoading] = useState(true);
    usePageTitle("Newsletter — Manage Subscribers and Campaigns")


    useEffect(() => {
        setLoading(true);
        const fetchNewsletters = async () => {
        const res = await fetch('/api/admin/newsletters');
        const json = await res.json();
        setData(json);
        setLoading(false);
        };
        fetchNewsletters();
    }, []);

    // const handleDelete = async (id: number) => {
    //     await fetch('/api/admin/newsletters', {
    //         method: 'DELETE',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({ id }),
    //     });
    //     setData(data.filter((item) => item.id !== id));
    // };

    const columns = [
        { name: 'Email', selector: (row: Newsletter) => row.email, sortable: true },
        { name: 'Subscribed At', selector: (row: Newsletter) => row.created_at },
        // {
        // name: 'Actions',
        // cell: (row: Newsletter) => (
        //     <Button variant="destructive" onClick={() => handleDelete(row.id)}>
        //         <Trash/>
        //     </Button>
        // ),
        // },
    ];

    return (
        // <div className="p-6">
        // <h2 className="text-2xl font-semibold mb-4">Newsletter Subscribers</h2>
        // <DataTable columns={columns} data={data} pagination />
        // </div>
        <>
            <AppDataTable
                title="Newsletter Subscriber"
                columns={columns}
                data={data}
                loading={loading}
                searchableFields={['email',]}
                />
        </>
    );
}
