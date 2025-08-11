'use client';

import { useEffect, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Trash } from 'lucide-react';
import { AppDataTable } from '@/components/dataTable';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose
} from '@/components/ui/dialog';

type User = {
  id: number;
  name: string;
  email: string;
  plan: string;
  status: 'active' | 'inactive';
  meetingCount: number;
  agentCount: number;
};

export default function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      toast.error('Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update user status
  const toggleStatus = async (id: number, currentStatus: 'active' | 'inactive') => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Status updated');
        fetchUsers();
      } else {
        toast.error(data.message || 'Update failed');
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  // Delete user
  const deleteUser = async (id: number) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('User deleted');
        fetchUsers();
      } else {
        toast.error(data.message || 'Delete failed');
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const columns = [
    { name: 'ID', selector: (row: User) => row.id, sortable: true },
    { name: 'Name', selector: (row: User) => row.name, sortable: true },
    { name: 'Email', selector: (row: User) => row.email, sortable: true },
    { name: 'Plan', selector: (row: User) => row.plan, sortable: true },
    { name: 'Meetings', selector: (row: User) => row.meetingCount, sortable: true },
    { name: 'Agents', selector: (row: User) => row.agentCount, sortable: true },
    {
      name: 'Status',
      cell: (row: User) => (
        <Switch
          checked={row.status === 'active'}
          onCheckedChange={() => toggleStatus(row.id, row.status)}
        />
      ),
    },
    {
      name: 'Actions',
      cell: (row: User) => (
        <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
              >
                <Trash />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this user? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button
                    variant="outline"
                    className="py-2"
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button
                    variant="destructive"
                    className="rounded-full px-5 py-2"
                    onClick={() => deleteUser(row.id)}
                    disabled={loading}
                  >
                    {loading ? 'Deleting...' : 'Delete'}
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
      ),
    },
  ];

  return (
    <>
      <div>
        <AppDataTable
          title="All Users"
          columns={columns}
          data={users}
          loading={loading}
          searchableFields={['name', 'email', 'plan']}
        />
      </div>
    </>
  );
}
