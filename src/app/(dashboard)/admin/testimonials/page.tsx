'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Edit, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppDataTable } from '@/components/dataTable';
import { Testimonial } from '@/lib/types';
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
import Image from 'next/image';

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchTestimonials = async () => {
      setLoading(true);
      const res = await axios.get('/api/admin/testimonials');
      setTestimonials(res.data);
      setLoading(false);
    };

    fetchTestimonials();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    await axios.delete(`/api/admin/testimonials/${deleteId}`);
    setTestimonials((prev) => prev.filter((t) => t.id !== deleteId));
    setDeleteId(null);
    setLoading(false);
  };

  const columns = [
    {
      name: 'Image',
      cell: (row: Testimonial) => (
        <Image
          width={50}
          height={50}
          src={row.image}
          alt={row.name}
          className="w-12 h-12 rounded-full object-cover"
        />
      ),
    },
    {
      name: 'Name',
      selector: (row: Testimonial) => row.name,
      sortable: true,
    },
    {
      name: 'Position',
      selector: (row: Testimonial) => row.position,
      sortable: true,
    },
    {
      name: 'Description',
      selector: (row: Testimonial) => row.description,
      wrap: true,
    },
    {
      name: 'Rating',
      selector: (row: Testimonial) => row.rating,
    },
    {
      name: 'Actions',
      cell: (row: Testimonial) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="!py-2 !px-3 rounded-lg"
            onClick={() => router.push(`/admin/testimonials/edit/${row.id}`)}
          >
            <Edit />
          </Button>

          <Dialog
            open={deleteId === row.id}
            onOpenChange={(isOpen) => !isOpen && setDeleteId(null)}
          >
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteId(row.id)}
              >
                <Trash />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this testimonial? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  className="py-2"
                  onClick={() => setDeleteId(null)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <DialogClose asChild>
                  <Button
                    variant="destructive"
                    className="rounded-full px-5 py-2"
                    onClick={handleDelete}
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
    <div className="rounded-xl">
      <div className="flex justify-end items-center mb-4">
        <Button onClick={() => router.push('/admin/testimonials/create')}>
          Create New
        </Button>
      </div>

      <AppDataTable
        title="All Testimonials"
        columns={columns}
        data={testimonials}
        loading={loading}
        searchableFields={['name', 'position']}
      />
    </div>
  );
}
