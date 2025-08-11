'use client';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        toast.error('Please enter a valid email address');
        return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/admin/newsletters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || 'Something went wrong');
      } else {
        toast.success('Subscribed successfully!');
        setEmail('');
      }
    } catch (err) {
      toast.error('Network error');
      console.error('Error subscribing to newsletter:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        className="bg-transparent outline-none text-sm w-full placeholder:text-gray-400"
      />
      <button type="submit" className="primary-btn disabled:!cursor-no-drop disabled:opacity-50" disabled={loading || email === ''}>
        {loading ? <Loader2 className='animate-spin w-5 h-5'/> : <ArrowRight className="w-5 h-5" />}
      </button>
    </form>
  );
}
