'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { convertToBase64 } from '@/lib/utils';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function EditTestimonialPage() {
  const [form, setForm] = useState({
    name: '',
    position: '',
    description: '',
    rating: 1,
    image: '',
  });
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useParams();
  usePageTitle("User Feedback — Real Stories, Real Impact")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/admin/testimonials/${params.id}`);
        const data = await res.json();
        setForm(data);
      } catch (err) {
        console.error('Failed to fetch testimonial:', err);
      }
    };
    fetchData();
  }, [params.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setNewImageFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let updatedImage = form.image;
    if (newImageFile) {
      updatedImage = await convertToBase64(newImageFile);
    }

    const updatedData = {
      ...form,
      image: updatedImage,
    };

    await fetch(`/api/admin/testimonials/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData),
    });

    router.push('/admin/testimonials');
  };

  return (
    <div className="bg-foreground p-5 rounded-3xl">
      <h3 className="mb-5">Edit Testimonial</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label htmlFor="">Name</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full border p-2"
          placeholder="Name"
          required
        />
        <label htmlFor="">Position</label>
        <input
          name="position"
          value={form.position}
          onChange={handleChange}
          className="w-full border p-2"
          placeholder="Position"
          required
        />
        <label htmlFor="">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="w-full border p-2"
          placeholder="Description"
          required
        />
        <label htmlFor="">Rating <small>(out of 5)</small></label>
        <input
          name="rating"
          type="number"
          value={form.rating}
          onChange={handleChange}
          className="w-full border p-2"
          placeholder="Rating"
          min={1}
          max={5}
          required
        />

        {form.image && (
          <div>
            <p className="text-sm">Current Image:</p>
            <Image width={1000} height={1000} src={form.image} alt="Current" className="w-32 h-32 object-cover border mb-2" />
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full border p-2"
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className='animate-spin' /> : 'Update Testimonial'}
        </Button>
      </form>
    </div>
  );
}