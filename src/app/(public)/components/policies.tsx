'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function PublicPolicyPage({ type, title }: { type: string; title: string }) {
  const [content, setContent] = useState('');
  const [loading, setloading] = useState(false);

  useEffect(() => {
    setloading(true);
    fetch(`/api/admin/policies/${type}`)
      .then((res) => res.json())
      .then((data) => setContent(data.content || ''))
      .finally(() => setloading(false));
  }, [type]);

  return (
    <>
        <section className="hero-section">
            <div className="container relative">
            <div className="text-center mx-auto flex flex-col gap-[20px] items-center">
                <h1>{title}</h1>
            </div>
            </div>
        </section>
        <section className='md:py-[100px] py-[50px] policy-content'>
            <div className="container">
                {
                    loading ?
                    <div className='flex justify-center items-center'>
                        <Loader2 className='animate-spin text-white'/>
                    </div>
                    :
                    <div className="prose prose-lg  mx-auto" dangerouslySetInnerHTML={{ __html: content }} />
                }
            </div>
        </section>
    </>
  );
}
