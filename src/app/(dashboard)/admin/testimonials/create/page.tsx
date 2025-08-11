'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { convertToBase64 } from '@/lib/utils';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function CreateTestimonialPage() {
  const [form, setForm] = useState({
    name: '',
    position: '',
    description: '',
    rating: 1,
  });
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!form.name || !form.position || !form.description || !image) {
      toast.error('All fields are required');
      setLoading(false);
      return;
    }

    let base64Image = '';
    if (image) {
      base64Image = await convertToBase64(image);
    }

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('position', form.position);
    formData.append('description', form.description);
    formData.append('rating', String(form.rating));
    formData.append('image', base64Image);

    await fetch('/api/admin/testimonials', {
      method: 'POST',
      body: JSON.stringify({
        ...form,
        image: base64Image,
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    router.push('/admin/testimonials');
  };

  return (
    <div className="p-5 bg-glass-color rounded-2xl my-10">
      <h3 className='mb-4'>Create Testimonial</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label htmlFor="">Name</label>
        <input name="name" value={form.name} onChange={handleChange} className="w-full border p-2" placeholder="Name" required />
        <label htmlFor="">Position</label>
        <input name="position" value={form.position} onChange={handleChange} className="w-full border p-2" placeholder="Position" required />
        <label htmlFor="">Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} className="w-full border p-2" placeholder="Description" required />
        <label htmlFor="">Rating <small>(out of 5)</small></label>
        <input name="rating" type="number" value={form.rating} onChange={handleChange} className="w-full border p-2" placeholder="Rating (1-5)" min={1} max={5} required />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
          className="w-full border p-2"
        />
        <Button type="submit" className='w-full' disabled={loading}>
          {loading ? <Loader2 className='animate-spin'/> : 'Create Testimonial'}
        </Button>
      </form>
    </div>
  );
}
