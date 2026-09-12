import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { RoleBadge } from '../components/RoleBadge';
import { 
  User, 
  Mail, 
  Building2, 
  GraduationCap, 
  Calendar, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle,
  Save,
  ShieldCheck,
  IdCard
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { userProfile, updateAcademicProfile, isOwner } = useAuth();

  const [name, setName] = useState(userProfile?.name || '');
  const [department, setDepartment] = useState(userProfile?.department || '');
  const [program, setProgram] = useState(userProfile?.program || '');
  const [semester, setSemester] = useState(userProfile?.semester || '');
  const [studentId, setStudentId] = useState(userProfile?.studentId || '');
  const [bio, setBio] = useState(userProfile?.bio || '');

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);
    try {
      await updateAcademicProfile({
        name: name.trim(),
        department: department.trim(),
        program: program.trim(),
        semester: semester.trim(),
        studentId: studentId.trim(),
        bio: bio.trim()
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to update academic profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (!userProfile) {
    return (
      <div className="p-8 text-center text-slate-500">
        Please sign in to view and manage your academic profile.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-6 sm:p-8 shadow-xl shadow-indigo-500/10">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/40 flex items-center justify-center text-white text-3xl font-black shadow-lg">
              {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-2xl font-black tracking-tight text-white">{userProfile.name}</h2>
                {isOwner && (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-400 text-slate-900 shadow-xs">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Permanent Owner
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-purple-100 font-mono font-medium">@{userProfile.username}</p>
              
              <div className="flex flex-wrap gap-1.5 mt-3">
                {userProfile.roles.map(r => (
                  <RoleBadge key={r} role={r} size="sm" />
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/20 text-xs space-y-1 self-stretch sm:self-auto sm:text-right">
            <p className="text-purple-200">Campus Account Status</p>
            <p className="font-black text-white flex items-center gap-1.5 sm:justify-end">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Verified & Active
            </p>
            <p className="text-[11px] text-purple-200/80 pt-1 border-t border-white/10">
              Joined {new Date(userProfile.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-6 border-b border-slate-100 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="font-black text-lg text-slate-900">Academic Credentials & Details</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Synchronized in real-time with class schedules, material posts, and department chat
            </p>
          </div>

          {saveSuccess && (
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-200 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Academic profile synced in real-time!</span>
            </div>
          )}
        </div>

        {saveError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Full Display Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  id="input-profile-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Unique University Handle (System Identifier)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm font-mono">@</span>
                <input
                  type="text"
                  disabled
                  value={userProfile.username}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-100/80 border border-slate-200 rounded-2xl text-xs sm:text-sm font-mono text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Registered University Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  disabled
                  value={userProfile.email}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-100/80 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Campus Student / Faculty ID
              </label>
              <div className="relative">
                <IdCard className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  id="input-profile-studentid"
                  type="text"
                  placeholder="e.g. CS-2024-8841"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Academic Department
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  id="input-profile-department"
                  type="text"
                  placeholder="e.g. Computer Science"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Enrolled Degree Program
              </label>
              <input
                id="input-profile-program"
                type="text"
                placeholder="e.g. BS Computer Science"
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Current Semester / Term
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  id="input-profile-semester"
                  type="text"
                  placeholder="e.g. 5th Semester"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Bio, Research & Course Interests
            </label>
            <textarea
              id="textarea-profile-bio"
              rows={3}
              placeholder="Tell fellow students and faculty about your academic projects, study interests, or office hours..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              id="btn-save-profile"
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white font-black text-xs rounded-2xl shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Updating Profile...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
