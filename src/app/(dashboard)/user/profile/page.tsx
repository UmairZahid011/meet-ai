'use client';

import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch('/api/user');
      if (!res.ok) return toast.error('Failed to load profile');
      const data = await res.json();
      setName(data.name || '');
      setEmail(data.email || '');
      setImagePreview(data.image || '');
    };
    fetchUser();
  }, []);

  const handleUpdate = async () => {
    setLoading(true)
    if (!name) return toast.error('Name cannot be empty');

    if (newPass || confirmPass || currentPass) {
      if (!currentPass) return toast.error('Enter current password');
      if (newPass.length < 6) return toast.error('New password must be at least 6 chars');
      if (newPass !== confirmPass) return toast.error('Passwords do not match');
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('currentPass', currentPass);
    formData.append('newPass', newPass);
    if (image) formData.append('image', image);

    const res = await fetch('/api/user', {
      method: 'PATCH',
      body: formData, // don't set Content-Type manually!
    });

    const data = await res.json();
    if (!res.ok) return toast.error(data.message || 'Update failed');

    toast.success('Profile updated');
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    setImage(null);
    if (data.image) setImagePreview(data.image);
    setLoading(false)
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-4 border rounded-xl bg-foreground">
      <h3 className="text-xl font-bold mb-4">Update Profile</h3>

      {
       imagePreview &&
       <Image width={1000} height={1000} src={image ? URL.createObjectURL(image) : imagePreview || '/default-avatar.png'}
          className="w-20 h-20 mx-auto mb-4 rounded-full object-cover"
          alt="Profile"/>
      }

      <input
        className="mb-4"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        className="mb-4 cursor-not-allowed"
        value={email}
        disabled
      />

      <input
        type="file"
        accept="image/*"
        className="mb-4"
        onChange={(e) => setImage(e.target.files?.[0] || null)}
      />

      <input
        className="mb-4"
        type="password"
        placeholder="Current Password"
        value={currentPass}
        onChange={(e) => setCurrentPass(e.target.value)}
      />
      <input
        className="mb-4"
        type="password"
        placeholder="New Password"
        value={newPass}
        onChange={(e) => setNewPass(e.target.value)}
      />
      <input
        className="w-full mb-4 p-2 border rounded-lg"
        type="password"
        placeholder="Confirm New Password"
        value={confirmPass}
        onChange={(e) => setConfirmPass(e.target.value)}
      />
      <Button
        onClick={handleUpdate}
        className="w-full"
        disabled={loading}
      >
        {
          loading ?
          <Loader2 className='animate-spin'/> :
          "Save Changes"
        }
      </Button>
    </div>
  );
}