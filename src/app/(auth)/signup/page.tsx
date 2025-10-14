'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Eye, EyeClosed, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);  
  const router = useRouter();
  const [showPassword, setshowPassword] = useState(true);
  const [confirmPassword, setconfirmPassword] = useState(true);
  usePageTitle("Create Your CallRio Account — Let the AI Handle Your Calls")
  

  const handleRegister = async () => {
    setError('');
    if (!name || !email || !password || !confirm) {
      setError('All fields are required');
      setLoading(false);
      return;
    }
    if (name.length < 3) {
      setError('Name must be at least 3 characters');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Invalid email');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true)
      const res = await fetch('/api/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message);
        setLoading(false);
        return;
      }

      toast("Registered successfully!")
      setLoading(false);
      router.push('/login');
    } catch (err) {
      console.error(err);
      setLoading(false);
      toast("Something went wrong")
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-glass-color px-3">
      <div className="w-full max-w-md p-3 md:p-8 my-[20px] space-y-6 bg-[#ffffff0a] rounded-2xl">
        <Link href={'/'} className="flex items-center justify-center gap-2">
                  <Image src={'/assets/imgs/Logo-New.png'} alt='logo' height={70} width={70} className='transition-all ease-in-out duration-300'/>
                </Link>
        <div className="text-center">
          <h3 >Create a new account</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              name="name"
              type="text"
              required
              placeholder='Full Name'
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              name="email"
              type="email"
              placeholder='Enter your Email'
              required
              className="mt-1 "
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative mb-4">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? 'password' : 'text'}
              placeholder='Enter your Password'
              required
              className="w-full px-4 py-2 border rounded-xl"
            />
            <span className='absolute top-1/2 -translate-y-1/2 right-2 cursor-pointer text-white' onClick={()=>setshowPassword(!showPassword)}>
              {
                showPassword ?
                  <EyeClosed size={20} />
                  :
                  <Eye size={20}/>
              }
            </span>
          </div>
          </div>

          <div>
            <label htmlFor="confirm" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <div className="relative mb-4">
            <input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              type={confirmPassword ? 'password' : 'text'}
              placeholder='Enter your Password'
              required
              className="w-full px-4 py-2 border rounded-xl"
            />
            <span className='absolute top-1/2 -translate-y-1/2 right-2 cursor-pointer text-white' onClick={()=>setconfirmPassword(!confirmPassword)}>
              {
                confirmPassword ?
                  <EyeClosed size={20} />
                  :
                  <Eye size={20}/>
              }
            </span>
          </div>
          </div>
          {
            error !== '' &&
            <p className='my-2 text-sm !text-red-500'>{error}</p>
          }
          <Button 
          variant={'default'}
          onClick={handleRegister}
          className='w-full'
          disabled={!name || !email || !password || !confirm}
          >
            {loading ? <Loader2 className='animate-spin'/> : 'Sign Up'}
          </Button>
        </div>

        <p className="text-sm text-center text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
