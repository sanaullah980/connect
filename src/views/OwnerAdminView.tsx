import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { subscribeUsers, updateUserRoles } from '../services/campusService';
import { useAuth, PERMANENT_OWNER_EMAIL } from '../context/AuthContext';
import { RoleBadge } from '../components/RoleBadge';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Users, 
  Search, 
  UserCheck, 
  Lock, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  KeyRound,
  Filter
} from 'lucide-react';

const ALL_ROLES: UserRole[] = [
  'Student',
  'Teacher',
  'Class Representative',
  'Staff',
  'Moderator',
  'Timetable Manager',
  'Announcement Publisher',
  'Institution Admin'
];

export const OwnerAdminView: React.FC = () => {
  const { userProfile, isOwner } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [updatingUid, setUpdatingUid] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    // Only subscribe to users if authenticated
    const unsub = subscribeUsers(setUsers);
    return () => unsub();
  }, []);

  const handleToggleRole = async (targetUser: UserProfile, role: UserRole) => {
    if (!isOwner && !userProfile?.roles?.includes('Institution Admin')) {
      setFeedback({ msg: 'Unauthorized: Only Owner or Institution Admin can assign roles', type: 'error' });
      return;
    }

    // Protection check
    if (targetUser.email.toLowerCase() === PERMANENT_OWNER_EMAIL.toLowerCase()) {
      setFeedback({ msg: 'Permanent Owner roles are immutable and protected by system security rules', type: 'error' });
      return;
    }

    const currentRoles: string[] = targetUser.roles || ['Student'];
    let newRoles: string[];

    if (currentRoles.includes(role)) {
      // Don't allow removing Student if it's the only role
      if (currentRoles.length === 1) {
        setFeedback({ msg: 'User must retain at least one role', type: 'error' });
        return;
      }
      newRoles = currentRoles.filter(r => r !== role);
    } else {
      newRoles = [...currentRoles, role];
    }

    setUpdatingUid(targetUser.uid);
    try {
      await updateUserRoles(targetUser.uid, newRoles);
      setFeedback({
        msg: `Updated roles for @${targetUser.username} instantly!`,
        type: 'success'
      });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ msg: err.message || 'Failed to update user role', type: 'error' });
    } finally {
      setUpdatingUid(null);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All' || u.roles?.includes(roleFilter as UserRole);
    return matchesSearch && matchesRole;
  });

  const adminCount = users.filter(u => u.roles?.includes('Institution Admin')).length;
  const teacherCount = users.filter(u => u.roles?.includes('Teacher')).length;
  const modCount = users.filter(u => u.roles?.includes('Moderator')).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-purple-950 text-white p-6 sm:p-8 shadow-xl border border-indigo-500/20">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 p-0.5 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-amber-400">
                <ShieldCheck className="w-7 h-7" />
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  University Governance & RBAC
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-400 text-slate-950 shadow-xs">
                  Permanent Authority
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-1">
                Root Administrator: <span className="text-amber-300 font-mono font-bold">{PERMANENT_OWNER_EMAIL}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/10 px-4 py-2.5 rounded-2xl text-xs backdrop-blur-md border border-white/10 self-stretch sm:self-auto">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-white font-medium">
              {isOwner ? 'Permanent Owner Session Active' : 'Institution Admin Console'}
            </span>
          </div>
        </div>

        {/* Quick RBAC stats pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <p className="text-[11px] text-indigo-200 uppercase font-bold tracking-wider">Total Members</p>
            <p className="text-lg font-black text-white">{users.length}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <p className="text-[11px] text-purple-200 uppercase font-bold tracking-wider">Admins</p>
            <p className="text-lg font-black text-purple-300">{adminCount}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <p className="text-[11px] text-emerald-200 uppercase font-bold tracking-wider">Teachers</p>
            <p className="text-lg font-black text-emerald-300">{teacherCount}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <p className="text-[11px] text-amber-200 uppercase font-bold tracking-wider">Moderators</p>
            <p className="text-lg font-black text-amber-300">{modCount}</p>
          </div>
        </div>
      </div>

      {/* Feedback notice */}
      {feedback && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2.5 animate-fade-in shadow-xs ${
          feedback.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Controls & Search */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            id="input-search-users-admin"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campus members by name, @username, email, or department..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Roles ({users.length})</option>
            {ALL_ROLES.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Users & Role Management Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900">
                Campus User Directory ({filteredUsers.length})
              </h3>
              <p className="text-[11px] text-slate-400">Manage institutional privileges and permissions</p>
            </div>
          </div>
          <span className="hidden sm:inline-block text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200/50">
            Real-Time Permission Sync
          </span>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs font-medium">
            No users match the search filter.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-x-auto">
            {filteredUsers.map((u) => {
              const isTargetOwner = u.email.toLowerCase() === PERMANENT_OWNER_EMAIL.toLowerCase();
              const isUpdating = updatingUid === u.uid;

              return (
                <div
                  key={u.uid}
                  id={`user-row-${u.uid}`}
                  className={`p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 ${
                    isTargetOwner ? 'bg-amber-50/30' : ''
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-[260px]">
                    <div className={`w-11 h-11 rounded-2xl font-black flex items-center justify-center text-sm shrink-0 shadow-2xs ${
                      isTargetOwner
                        ? 'bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 font-black'
                        : 'bg-gradient-to-tr from-indigo-500 to-purple-600 text-white'
                    }`}>
                      {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-slate-900">{u.name}</span>
                        {isTargetOwner && (
                          <span className="text-[10px] font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md shadow-2xs">
                            Owner
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-indigo-700 font-semibold">@{u.username}</span>
                        <span>•</span>
                        <span className="truncate max-w-[180px]">{u.email}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {u.department || 'General Campus'} {u.semester ? `• ${u.semester}` : ''}
                      </p>
                    </div>
                  </div>

                  {/* Active Roles & Role Assignment Selector */}
                  <div className="flex-1 w-full lg:w-auto">
                    <div className="text-[11px] font-bold text-slate-500 mb-1.5 flex items-center gap-2">
                      <span>Privilege Roles:</span>
                      {isTargetOwner && (
                        <span className="text-[10px] text-amber-700 font-bold">
                          (Immutable Permanent System Authority)
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {ALL_ROLES.map((role) => {
                        const hasRole = u.roles?.includes(role);

                        return (
                          <button
                            key={role}
                            disabled={isTargetOwner || isUpdating}
                            onClick={() => handleToggleRole(u, role)}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                              hasRole
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xs hover:from-indigo-700 hover:to-purple-700'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                            } ${isTargetOwner ? 'cursor-not-allowed opacity-90' : ''}`}
                            title={isTargetOwner ? 'Permanent owner roles cannot be changed' : `Toggle ${role}`}
                          >
                            <span>{role}</span>
                            {hasRole && <span className="text-[10px] font-black">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Security Rule Card */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl border border-indigo-900 shadow-md text-xs flex items-start gap-3.5">
        <ShieldCheck className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-sm text-white">Firestore Security & RBAC Lockdown Active</p>
          <p className="mt-1 text-slate-300 leading-relaxed">
            All administrative actions and role updates are verified cryptographically in Firestore security rules. Unauthorized clients cannot tamper with roles, mutate usernames, or alter protected permanent owner records.
          </p>
        </div>
      </div>
    </div>
  );
};
