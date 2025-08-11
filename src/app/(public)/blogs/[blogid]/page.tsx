'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Calendar, Loader2 } from 'lucide-react';

export default function BlogDetailPage() {
  const { blogid } = useParams(); // get dynamic route param
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!blogid) return;

    fetch(`/api/admin/blogs/${blogid}`)
      .then((res) => res.json())
      .then((data) => {
        setBlog(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [blogid]);

  if (loading) return <div className="p-8 text-center text-white py-20 flex justify-center items-center"><Loader2 className='animate-spin '/></div>;
  if (!blog) return <div className="p-8 text-center text-red-400">Blog not found.</div>;

  return (
    <>
      <section className="hero-section">
        <div className="container relative">
          <div className="text-center mx-auto flex flex-col gap-[20px] items-center">
            <h2>{blog.title}</h2>
            <div className="flex gap-3 items-center !text-white text-lg">
              <div className="flex gap-1 items-center">
                <Calendar /> {new Date(blog.created_at).toDateString()}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="my-[50px] md:my-[100px]">
        <div className="container">
          <div className='md:max-w-[70%] mx-auto'>
            <Image
              src={blog.image || '/assets/imgs/post-1.jpg'}
              width={1000}
              height={600}
              className="w-full h-auto rounded-xl mb-6 object-cover"
              alt="Blog image"
            />
          </div>
          <div
            className="space-y-4 text-white policy-content"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </div>
      </section>
    </>
  );
}
