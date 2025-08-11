'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AppDataTable } from '@/components/dataTable';
import { Edit, Trash } from 'lucide-react';
import Image from 'next/image';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose
} from '@/components/ui/dialog';

type Blog = {
  id: number;
  title: string;
  image: any;
  description: string;
  slug: string;
  created_at: string;
};

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const router = useRouter();
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    setLoading(true);
    fetch('/api/admin/blogs')
      .then(res => res.json())
      .then(data => setBlogs(data))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    await fetch(`/api/admin/blogs/${id}`, { method: 'DELETE' });
    setBlogs(prev => prev.filter(blog => blog.id !== id));
  };

  const columns = [
    { name: 'Image', cell:(row:Blog)=>(
      <Image src={row.image} width={90} height={90} alt='img'></Image>
    )},
    { name: 'Title', selector: (row: Blog) => row.title, sortable: true },
    { name: 'Date', selector: (row: Blog) => new Date(row.created_at).toLocaleDateString() },
    {
      name: 'Actions',
      cell: (row: Blog) => (
        <div className="flex gap-2">
          <Button variant="outline" className='p-2 rounded-lg' onClick={() => router.push(`/admin/blogs/edit/${row.id}`)}><Edit/></Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
              >
                <Trash />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this blog? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button
                    variant="outline"
                    className="py-2"
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button
                    variant="destructive"
                    className="rounded-full px-5 py-2"
                    onClick={() => handleDelete(row.id)}
                    disabled={loading}
                  >
                    {loading ? 'Deleting...' : 'Delete'}
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      ),
    },
  ];

  return (
    <div className="">
        <div className="flex justify-between sm:items-center mb-6 sm:flex-row flex-col gap-4">
          <span></span>
          <Link href={'/admin/blogs/create'}>
            <Button className='w-full' variant={'default'}>+ Create New</Button>
          </Link>
        </div>
      {/* <DataTable columns={columns} data={blogs} pagination /> */}
      <AppDataTable
        title="All Blogs"
        columns={columns}
        data={blogs}
        loading={loading}
        searchableFields={['title']}
      />
    </div>
  );
}
