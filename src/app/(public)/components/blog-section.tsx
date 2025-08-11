'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

interface Blog {
  id: number;
  title: string;
  content: string;
  image: string;
  created_at: string;
}

const BlogSection = () => {

    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
    const fetchBlogs = async () => {
        try {
        const res = await fetch('/api/admin/blogs/limit/3');
        const data = await res.json();
        setBlogs(data);
        } catch (error) {
        console.error('Failed to fetch blogs:', error);
        } finally {
        setLoading(false);
        }
    };

    fetchBlogs();
    }, []);

  return (
    <>
     <section className="my-[100px]">
        <div className="container">
            <div className="text-center mb-10">
                <h4 data-aos="fade-down" className="small-heading mb-5">Latest BLog</h4>
                <h2 data-aos="fade-up" data-aos-delay="100">Latest blog on AI innovation <br /> and technology</h2>
            </div>
            <div className="">
            {loading ? (
                <div className="flex justify-center items-center h-[200px]">
                <Loader2 className="animate-spin text-white w-8 h-8" />
                </div>
            ) : blogs.length === 0 ? (
                <div className="text-center text-white text-lg">No blogs found.</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-5">
                {blogs.map((blog) => (
                    <Link key={blog.id} href={`/blogs/${blog.id}`} className='h-full'>
                    <div
                        className="p-[10px] md:p-[15px] lg:p-[30px] rounded-xl border border-gray-800 h-full bg-[#ffffff0a] blog-card hover:shadow-lg transition"
                        data-aos="fade-up"
                        data-aos-delay="200"
                    >
                        <div className="overflow-hidden rounded-xl glare-img">
                        <Image
                            src={blog.image || '/assets/imgs/default-img.png'}
                            width={1000}
                            height={1000}
                            className="w-full h-full rounded-xl mb-4 max-h-[250px] min-h-[250px] object-cover"
                            alt={blog.title}
                        />
                        </div>
                        <h4 className="text-lg text-white font-bold mb-4">{blog.title}</h4>
                    </div>
                    </Link>
                ))}
                </div>
            )}
            </div>
        </div>
      </section> 
    </>
  )
}

export default BlogSection
