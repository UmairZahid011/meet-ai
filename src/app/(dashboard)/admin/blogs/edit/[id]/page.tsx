'use client';

import { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { convertToBase64 } from '@/lib/utils';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import Image from 'next/image';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function EditBlogPage() {
  const router = useRouter();
  const { id } = useParams();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string>(''); // will store base64
  // const [imageFile, setImageFile] = useState<File | null>(null); // for preview
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [initialData, setInitialData] = useState({ title: '', content: '', image: '' });
  usePageTitle("Blog Management — Publish and Update Articles")

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await axios.get(`/api/admin/blogs/${id}`);
        const data = res.data;
        setTitle(data.title);
        setContent(data.content);
        setImage(data.image || '');
        setInitialData({ title: data.title, content: data.content, image: data.image || '' });
      } catch (err) {
        toast.error('Failed to fetch blog');
        console.error('Error fetching blog:', err);
      } finally {
        setFetching(false);
      }
    };

    fetchBlog();
  }, [id]);

  const hasChanges = () => {
    return (
      title !== initialData.title ||
      content !== initialData.content ||
      image !== initialData.image
    );
  };

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
      await axios.patch(`/api/admin/blogs/${id}`, {
        title,
        content,
        image: image || 'testing image'
      });
      toast.success('Blog Updated Successfully');
      router.push('/admin/blogs');
    } catch (error) {
      toast.error('Update failed');
      console.error('Error updating blog:', error);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="animate-spin w-6 h-6 text-white" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-foreground rounded-xl">
      <h2 className="text-2xl font-bold mb-4">Edit Blog</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full border p-2 rounded"
          type="text"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
        <div className="ckeditor-dark-wrapper">
          <CKEditor
            editor={ClassicEditor as any}
            data={content}
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
              setContent(data);
            }}
          />
        </div>

        {/* Image Uploader */}
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full border p-2 rounded"
          />
          {image !== '' && (
            <Image
              width={1000}
              height={1000}
              src={image}
              alt="Preview"
              className="mt-2 max-h-60 sm:max-w-[80%] md:max-w-[50%] rounded border border-border object-cover"
            />
          )}
        </div>

        <Button type="submit" className="w-full" disabled={loading || !hasChanges()}>
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            'Update'
          )}
        </Button>
      </form>
    </div>
  );
}