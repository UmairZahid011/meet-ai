'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { convertToBase64 } from '@/lib/utils';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import Image from 'next/image';

export default function CreateBlogPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string>(''); // base64
  // const [imageFile, setImageFile] = useState<File | null>(null); // for preview
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // setImageFile(file);
    const base64 = await convertToBase64(file);
    setImage(base64);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/admin/blogs', {
        title,
        content: description,
        image: image || '',
      });
      toast.success('Blog created successfully');
      router.push('/admin/blogs');
    } catch (error) {
      toast.error('Failed to create blog');
      console.error('Error creating blog:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-foreground rounded-xl">
      <h3 className="text-2xl font-bold mb-4">Create New Blog</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full border p-2 rounded"
          type="text"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
        {/* <textarea
          className="w-full border p-2 rounded"
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
        /> */}
        <div className="ckeditor-dark-wrapper">
          <CKEditor
            editor={ClassicEditor as any}
            data={''}
            config={{
              toolbar: [
                'undo', 'redo', '|',
                'heading', '|',
                'bold', 'italic', '|',
                'link', 'insertTable', '|',
                'bulletedList', 'numberedList', 'indent', 'outdent',
              ],
            }}
            onChange={(_, editor) => {
              const data = editor.getData();
              setDescription(data);
            }}
          />
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full border p-2 rounded"
          required
        />
        {image && (
          <Image
            width={1000}
            height={1000}
            src={image}
            alt="Preview"
            className="mt-2 max-h-60 sm:max-w-[80%] md:max-w-[50%] rounded border border-border object-cover"
          />
        )}
        <Button
          type="submit"
          className="w-full"
          disabled={loading || !title || !description || !image}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Create'}
        </Button>
      </form>
    </div>
  );
}