'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Ban, CheckCircle, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiAuth } from '@/lib/api';

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminUsersPage() {
  const router = useRouter();
  
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const res = await apiAuth.withToken(token || undefined).get('/admin/users', {
        params: { page, limit: 20 },
      });
      setUsers(res.data.items || []);
      setMeta(res.data.meta || null);
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const error = e as { response?: { data?: { message?: string } } };
      /* eslint-enable @typescript-eslint/no-unused-vars */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const err = e as { response?: { data?: { message?: string } } };
      /* eslint-enable @typescript-eslint/no-unused-vars */
if (err.response?.status === 401 || err.response?.status === 403) {
        router.push('/auth/signin');
        return;
      }
      setError(err.message || 'Error loading users');
    } finally {
      setLoading(false);
    }
  }, [page, router]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleStatus = async (id: string, currentIsActive: boolean, role: string) => {
    if (role === 'admin') {
      alert('Cannot change status of admin users');
      return;
    }
    
    const newStatus = currentIsActive ? 'suspended' : 'active';
    const action = currentIsActive ? 'suspend' : 'activate';
    
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;
    
    try {
      const token = localStorage.getItem('access_token');
      await apiAuth.withToken(token || undefined).patch(`/admin/users/${id}`, {
        status: newStatus,
      });
      fetchUsers();
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const error = e as { response?: { data?: { message?: string } } };
      /* eslint-enable @typescript-eslint/no-unused-vars */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const err = e as { response?: { data?: { message?: string } } };
      /* eslint-enable @typescript-eslint/no-unused-vars */
alert(err.response?.data?.message || err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-c900">Manage Users</h1>
          <p className="text-c500 mt-1">View user accounts and manage platform access.</p>
        </div>
        {meta && (
          <div className="text-sm text-c500 font-medium">
            {meta.total} user{meta.total !== 1 ? 's' : ''} total
          </div>
        )}
      </div>

      {error && <div className="text-red bg-red p-4 rounded-lg">{error}</div>}

      <div className="bg-white shadow-sm border border-c100 rounded-3xl overflow-hidden">
        {users.length === 0 ? (
          <div className="p-16 text-center text-c500">
            <h3 className="text-xl font-bold text-c900 mb-1">No users found</h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-c100">
              <thead className="bg-c100/50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-black text-c500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-black text-c500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-black text-c500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-black text-c500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-black text-c500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-c100">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-c900">{u.email}</div>
                    <div className="text-xs text-c500">{u.isEmailVerified ? 'Verified' : 'Unverified'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-c100 text-c800 capitalize">
                      {u.role}
                    </span>
                    {u.role === 'admin' && <Shield className="h-4 w-4 ml-2 inline text-blue" />}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {u.isSuspended ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red text-red">
                        Suspended
                      </span>
                    ) : u.isActive ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green text-green">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-c100 text-c600">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-c500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {u.role !== 'admin' && (
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleToggleStatus(u.id, u.isActive && !u.isSuspended, u.role)}
                          className={`${
                            u.isActive && !u.isSuspended
                              ? 'text-red hover:bg-red bg-red' 
                              : 'text-green hover:bg-green bg-green'
                          } px-3 py-1.5 rounded-lg text-xs font-bold flex items-center transition-colors`}
                        >
                          {u.isActive && !u.isSuspended ? (
                            <>
                              <Ban className="h-4 w-4 mr-1" /> Suspend
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" /> Activate
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-c500">
            Page {meta.page} of {meta.totalPages} ({meta.total} total)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-c600 bg-white border border-c200 rounded-xl hover:bg-c100 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= meta.totalPages}
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-green rounded-xl hover:bg-green disabled:opacity-40 transition-colors"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
