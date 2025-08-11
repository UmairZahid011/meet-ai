'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    

     if (res?.error) {
      setError(res.error.includes('Google')
        ? 'You signed up with Google. Please login using Google.'
        : 'Invalid email or password.');
      return;
    }
    toast.success('Login Successful')
    
    const sessionRes = await fetch('/api/auth/session');
    const sessionData = await sessionRes.json();

    const role = sessionData?.user?.isAdmin;
    
    if(role){
      router.push('/admin')
    }else{
      router.push('/user')
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-glass-color px-3">
      <div className="w-full max-w-md my-[20px] p-3 md:p-8 space-y-6 bg-[#ffffff0a] rounded-2xl shadow-lg">
        <div className="text-center">
          <h3 className="">Sign In</h3>
          <p className="text-gray-600">to continue to your dashboard</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            className="w-full mb-3 px-4 py-2 border rounded-xl"
          />
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            className="w-full mb-4 px-4 py-2 border rounded-xl"
          />
        </div>

        {error && <p className="text-red-500 text-sm text-center -mt-3">{error}</p>}

        <div className='flex justify-end text-primary pb-2'>
          <Link href={'/forgot-password'}>Forgot Password</Link>
        </div>
        <Button
          onClick={handleLogin}
          variant="default"
          className="w-full"
          disabled={loading || !email || !password}
        >
          {loading ? <Loader2 className='animate-spin'/> : 'Login with Email'}
        </Button>

        <Button
          variant="outline"
          onClick={() => signIn("google" , {callbackUrl: '/user' })}
          className="w-full flex items-center justify-center space-x-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="w-5 h-5" viewBox="0 0 16 16">
            <path d="M15.545 6.558a9.4 9.4 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.7 7.7 0 0 1 5.352 2.082l-2.284 2.284A4.35 4.35 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.8 4.8 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.7 3.7 0 0 0 1.599-2.431H8v-3.08z"/>
          </svg>
          <span>Continue with Google</span>
        </Button>

        <p className="mt-4 text-center">
          Not Registered? <Link className="text-primary font-semibold underline" href="/signup">SignUp</Link> today
        </p>
      </div>
    </div>
  );
}
