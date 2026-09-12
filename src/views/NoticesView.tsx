import React, { useState, useEffect } from 'react';
import { Notice } from '../types';
import { subscribeNotices, createNotice, deleteNotice, createNotification } from '../services/campusService';
import { useAuth } from '../context/AuthContext';
import { RoleBadge } from '../components/RoleBadge';
import { 
  BellRing, 
  Plus, 
  Search, 
  Trash2, 
  AlertCircle, 
  Calendar, 
  User, 
  Filter,
  Megaphone,
  X
} from 'lucide-react';

interface NoticesViewProps {
  isPublishModalOpen: boolean;
  onClosePublishModal: () => void;
  onOpenPublishModal: () => void;
}

export const NoticesView: React.FC<NoticesViewProps> = ({
  isPublishModalOpen,
  onClosePublishModal,
  onOpenPublishModal,
}) => {
  const { userProfile, isOwner, canPublishNotices } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Academic');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Normal'>('Normal');
  const [formError, setFormError] = useState<string | null>(null);

  const categories = ['All', 'Academic', 'Exam', 'Campus Life', 'Sports', 'Urgent', 'General'];

  useEffect(() => {
    const unsubscribe = subscribeNotices(setNotices);
    return () => unsubscribe();
  }, []);

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    if (!title.trim() || !description.trim()) {
      setFormError('Please enter both title and description');
      return;
    }

    setLoading(true);
    setFormError(null);
    try {
      const primaryRole = userProfile.roles?.[0] || (isOwner ? 'Permanent Owner' : 'Staff');
      await createNotice({
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        authorName: userProfile.name,
        authorUid: userProfile.uid,
        authorRole: primaryRole
      });

      // Reset & close
      setTitle('');
      setDescription('');
      setCategory('Academic');
      setPriority('Normal');
      onClosePublishModal();
    } catch (err: any) {
      setFormError(err.message || 'Failed to publish notice');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this announcement?')) {
      try {
        await deleteNotice(id);
      } catch (err) {
        console.error("Failed to delete notice", err);
      }
    }
  };

  const filteredNotices = notices.filter(notice => {
    const matchesSearch = notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notice.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notice.authorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || notice.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600 via-rose-600 to-indigo-700 text-white p-6 sm:p-7 shadow-lg shadow-rose-500/10">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white flex items-center gap-1">
                <Megaphone className="w-3.5 h-3.5 text-amber-300" />
                Verified Bulletin
              </span>
              <span className="text-xs text-rose-200">
                {notices.length} active announcements
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Official Campus Announcements
            </h2>
            <p className="text-xs sm:text-sm text-rose-100 max-w-xl">
              Stay synchronized with academic notices, exam alerts, administrative schedules, and campus events.
            </p>
          </div>

          {canPublishNotices && (
            <button
              id="btn-open-publish-notice-modal"
              onClick={onOpenPublishModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-rose-50 text-rose-700 font-extrabold text-xs rounded-xl shadow-md transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Publish Notice</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            id="input-search-notices"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notices by title, keywords or publisher..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/70'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notices List */}
      {filteredNotices.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/90 shadow-sm">
          <BellRing className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">No notices found</p>
          <p className="text-xs text-slate-400 mt-1">
            {searchQuery ? 'Try adjusting your search query or selected category' : 'Check back later for university bulletins'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotices.map((notice) => {
            const isHigh = notice.priority === 'High';
            const isMedium = notice.priority === 'Medium';
            const canDelete = isOwner || notice.authorUid === userProfile?.uid || userProfile?.roles?.includes('Institution Admin');

            return (
              <div
                key={notice.id}
                id={`notice-item-${notice.id}`}
                className={`p-6 rounded-3xl border transition-all hover:shadow-md ${
                  isHigh
                    ? 'bg-gradient-to-r from-red-50/70 via-white to-white border-red-200/90 shadow-xs'
                    : isMedium
                    ? 'bg-gradient-to-r from-amber-50/70 via-white to-white border-amber-200/90 shadow-xs'
                    : 'bg-white border-slate-200/90 shadow-xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                      {notice.category}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                        isHigh
                          ? 'bg-red-500 text-white shadow-xs'
                          : isMedium
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {notice.priority} Priority
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(notice.createdAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    {canDelete && (
                      <button
                        id={`btn-delete-notice-${notice.id}`}
                        onClick={() => handleDelete(notice.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete notice"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-lg font-black text-slate-900 mb-2">
                  {notice.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line mb-4 font-normal">
                  {notice.description}
                </p>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 text-white flex items-center justify-center text-xs font-black shadow-xs">
                      {notice.authorName ? notice.authorName.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      {notice.authorName}
                    </span>
                    {notice.authorRole && (
                      <RoleBadge role={notice.authorRole} size="sm" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Publish Modal */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <Megaphone className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-800 text-base">Publish Official Notice</h3>
              </div>
              <button
                onClick={onClosePublishModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateNotice} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Announcement Title *
                </label>
                <input
                  id="input-notice-title"
                  type="text"
                  required
                  placeholder="e.g. Mid-Term Examination Schedule Released"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    id="select-notice-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  >
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Priority Level *
                  </label>
                  <select
                    id="select-notice-priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High (Urgent Alert)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Detailed Notice Description *
                </label>
                <textarea
                  id="textarea-notice-description"
                  required
                  rows={5}
                  placeholder="Enter the official details, guidelines, or instructions..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClosePublishModal}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-publish-notice"
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs disabled:opacity-50"
                >
                  {loading ? 'Publishing...' : 'Publish Instantly'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
