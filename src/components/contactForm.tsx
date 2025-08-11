'use client';

import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { name, email, message } = form;
    if (!name || !email || !message) {
      toast.error('All fields are required');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) toast.error(data.message || 'Failed to send');
      else {
        toast.success('Inquiry sent successfully');
        setForm({ name: '', email: '', message: '' });
      }
    } catch {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className='md:my-[100px] my-[50px] pt-[100px]' id='contact'>
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-5 xl:gap-10">
          <div>
            <h4 data-aos="fade-down" className="small-heading !mx-0 !mb-4">Contact Us</h4>
            <h2 data-aos="fade-right" data-aos-delay="100">Let’s Build Smarter Solutions Together</h2>
            <p data-aos="fade-right" data-aos-delay="100" className='mt-4'>Have an idea, question, or project in mind? We’re here to help you turn your vision into reality with powerful AI-driven solutions. Whether you’re looking to automate tasks, enhance customer experience, or make data-backed decisions, our team is ready to guide you every step of the way.
 Let’s connect and explore how smart technology can unlock your business potential.</p>
          </div>
          <div className='bg-glass-color p-[20px] md:p-[30px] lg:p-[40px] contact-form rounded-3xl border border-gray-800 overflow-hidden' data-aos="zoom-in" data-aos-delay="100">
            <h3 className='mb-[40px]' data-aos="fade-up" data-aos-delay="150">Send us message</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <input data-aos="fade-left" data-aos-delay="200" name="name" value={form.name} onChange={handleChange} placeholder="Name" className="w-full border p-2 rounded" required />
              <input data-aos="fade-left" data-aos-delay="250" type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email" className="w-full border p-2 rounded" required />
              <textarea data-aos="fade-left" data-aos-delay="300" name="message" value={form.message} onChange={handleChange} placeholder="Your Message" className="w-full border p-2 rounded" required />
              <button data-aos="fade-up" data-aos-delay="320" type="submit" disabled={loading} className="primary-btn mt-[20px] w-full">
                {loading ? <Loader2 className='animate-spin'/> : 'Submit Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
