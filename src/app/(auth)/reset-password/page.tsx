// 'use client';
// import { Suspense, useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { Loader2 } from 'lucide-react';
// import { toast } from 'sonner';

// export default function ResetPassword() {
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const searchParams = useSearchParams();
//   const token = searchParams.get('token');

//   const router = useRouter();

//   const handleSubmit = async () => {
//     setError('');

//     if (!password || !confirmPassword) {
//       return toast.error('Please fill in all fields.');
//     }
//     if(password.length < 6){
//       return toast.error("Password must be 6 character long")
//     }

//     if (password !== confirmPassword) {
//       return toast.error('Passwords do not match.');
//     }

//     if (!token) {
//       return toast.error('Invalid or missing reset token.');
//     }

//     setLoading(true);

//     try {
//       const res = await fetch('/api/reset-password', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ token, password }),
//       });

//       const data = await res.json();

//       if (res.status === 410) {
//         return toast.error(data.message); // "Reset link expired. Please try again."
//       }

//       if (!res.ok) {
//         return toast.error(data.message || 'Something went wrong.');
//       }

//       toast.success('Password reset successfully!');
//       router.push('/login');
//     } catch (err: any) {
//       toast.error('Internal server error.');
//       console.error('Error resetting password:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-glass-color px-3">
//       <div className="w-full max-w-md p-3 md:p-8 my-[20px] space-y-6 bg-[#ffffff0a] rounded-2xl">
//         <Suspense fallback={<div>Loading...</div>}>
//           <>
//             <div className="text-center">
//               <h3>Reset Password</h3>
//               <p>Enter your new password</p>
//             </div>
//             <div className="space-y-4">
//               <div>
//                 <label htmlFor="password" className="block text-sm font-medium text-white">
//                   Password
//                 </label>
//                 <input
//                   value={password}
//                   onChange={e => setPassword(e.target.value)}
//                   name="password"
//                   type="password"
//                   required
//                   className="mt-1 w-full bg-transparent border border-gray-600 rounded px-4 py-2 text-white"
//                 />
//               </div>
//               <div>
//                 <label htmlFor="confirmPassword" className="block text-sm font-medium text-white">
//                   Confirm Password
//                 </label>
//                 <input
//                   value={confirmPassword}
//                   onChange={e => setConfirmPassword(e.target.value)}
//                   name="confirmPassword"
//                   type="password"
//                   required
//                   className="mt-1 w-full bg-transparent border border-gray-600 rounded px-4 py-2 text-white"
//                 />
//               </div>
//               {error && <p className="text-red-500 text-sm">{error}</p>}
//               <Button onClick={handleSubmit} disabled={loading} className="w-full">
//                 {loading ? <Loader2/> : 'Reset Password'}
//               </Button>
//             </div>
//           </>
//         </Suspense>
//       </div>
//     </div>
//   );
// }


'use client';
import { Suspense, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

// ✅ This sub-component uses the searchParams
function ResetPasswordInner() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  const handleSubmit = async () => {
    setError('');

    if (!password || !confirmPassword) {
      return toast.error('Please fill in all fields.');
    }
    if (password.length < 6) {
      return toast.error('Password must be 6 characters long');
    }
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match.');
    }
    if (!token) {
      return toast.error('Invalid or missing reset token.');
    }

    setLoading(true);
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.status === 410) {
        return toast.error(data.message);
      }
      if (!res.ok) {
        return toast.error(data.message || 'Something went wrong.');
      }

      toast.success('Password reset successfully!');
      router.push('/login');
    } catch (err: any) {
      toast.error('Internal server error.');
      console.error('Error resetting password:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Link href={'/'} className="flex items-center justify-center gap-2">
        <Image src={'/assets/imgs/Logo-New.png'} alt='logo' height={70} width={70} className='transition-all ease-in-out duration-300'/>
      </Link>
      <div className="text-center">
        <h3>Reset Password</h3>
        <p>Enter your new password</p>
      </div>
      <div className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-white">
            Password
          </label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            name="password"
            type="password"
            required
            className="mt-1 w-full bg-transparent border border-gray-600 rounded px-4 py-2 text-white"
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-white">
            Confirm Password
          </label>
          <input
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            name="confirmPassword"
            type="password"
            required
            className="mt-1 w-full bg-transparent border border-gray-600 rounded px-4 py-2 text-white"
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button onClick={handleSubmit} disabled={loading} className="w-full">
          {loading ? <Loader2 className="animate-spin" /> : 'Reset Password'}
        </Button>
      </div>
    </>
  );
}

// ✅ This component includes <Suspense>
export default function ResetPassword() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-glass-color px-3">
      <div className="w-full max-w-md p-3 md:p-8 my-[20px] space-y-6 bg-[#ffffff0a] rounded-2xl">
        <Suspense fallback={<div>Loading...</div>}>
          <ResetPasswordInner />
        </Suspense>
      </div>
    </div>
  );
}
