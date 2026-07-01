'use client';
import { useState, useEffect } from 'react';
import { Users, Search, CheckCircle, XCircle, Shield, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { usersAPI } from '@/lib/api';
import { cn, getRoleLabel, getRoleBadgeColor, formatDate } from '@/lib/utils';

const ROLES = ['', 'finder', 'parent', 'authority', 'admin'];

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      usersAPI.getAll(params)
        .then(res => { setUsers(res.data.data); setMeta(res.data.meta); })
        .catch(() => toast.error('Failed to load users'))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [page, search, roleFilter]);

  const handleToggleStatus = async (userId, isActive) => {
    setActionId(userId);
    try {
      const res = await usersAPI.toggleStatus(userId);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: !isActive } : u));
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Action failed');
    } finally {
      setActionId(null);
    }
  };

  const handleVerify = async (userId) => {
    setActionId(userId + '-verify');
    try {
      await usersAPI.verify(userId);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isVerified: true, governmentIdVerified: true } : u));
      toast.success('User verified');
    } catch {
      toast.error('Failed to verify user');
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manage Users</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{meta?.total ?? 0} registered users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          {ROLES.map(r => <option key={r} value={r}>{r ? getRoleLabel(r) : 'All Roles'}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 border-b">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">User</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Role</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Verification</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Joined</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No users found
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user._id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', getRoleBadgeColor(user.role))}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={cn(
                        'text-xs px-2.5 py-1 rounded-full font-medium',
                        user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      )}>
                        {user.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        {user.isVerified ? (
                          <span className="flex items-center gap-1 text-xs text-green-600">
                            <CheckCircle className="w-3.5 h-3.5" /> Verified
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Unverified</span>
                        )}
                        {user.governmentIdVerified && (
                          <span className="flex items-center gap-1 text-xs text-blue-600 ml-1">
                            <Shield className="w-3 h-3" /> ID
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        {!user.isVerified && (
                          <button
                            onClick={() => handleVerify(user._id)}
                            disabled={actionId === user._id + '-verify'}
                            className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                          >
                            {actionId === user._id + '-verify' ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                            Verify
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleStatus(user._id, user.isActive)}
                          disabled={actionId === user._id}
                          className={cn(
                            'flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border transition-colors disabled:opacity-50',
                            user.isActive
                              ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                              : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                          )}
                        >
                          {actionId === user._id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : user.isActive ? (
                            <XCircle className="w-3 h-3" />
                          ) : (
                            <CheckCircle className="w-3 h-3" />
                          )}
                          {user.isActive ? 'Suspend' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20 text-sm">
            <span className="text-muted-foreground">
              Showing {((page - 1) * 20) + 1}–{Math.min(page * 20, meta.total)} of {meta.total}
            </span>
            <div className="flex gap-2">
              <button disabled={!meta.hasPrevPage} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 border rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent transition-colors">
                Previous
              </button>
              <button disabled={!meta.hasNextPage} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 border rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent transition-colors">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
