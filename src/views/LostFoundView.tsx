import React, { useState, useEffect } from 'react';
import { LostFoundItem } from '../types';
import { 
  subscribeLostFound, 
  createLostFound, 
  updateLostFoundStatus, 
  deleteLostFound 
} from '../services/campusService';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  Plus, 
  MapPin, 
  Calendar, 
  User, 
  CheckCircle2, 
  Trash2, 
  AlertCircle, 
  X,
  Sparkles,
  Phone,
  HelpCircle
} from 'lucide-react';

interface LostFoundViewProps {
  isPostModalOpen: boolean;
  onClosePostModal: () => void;
  onOpenPostModal: () => void;
}

export const LostFoundView: React.FC<LostFoundViewProps> = ({
  isPostModalOpen,
  onClosePostModal,
  onOpenPostModal,
}) => {
  const { userProfile, isOwner, canModerate } = useAuth();
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'lost' | 'found'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'resolved'>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [type, setType] = useState<'lost' | 'found'>('lost');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [contactInfo, setContactInfo] = useState('');

  useEffect(() => {
    const unsub = subscribeLostFound(setItems);
    return () => unsub();
  }, []);

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    if (!title.trim() || !description.trim() || !location.trim()) {
      setError('Please fill in title, description, and location');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await createLostFound({
        type,
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        posterName: userProfile.name,
        posterUid: userProfile.uid,
        status: 'open',
        date,
        contactInfo: contactInfo.trim() || userProfile.email
      });

      // Reset
      setTitle('');
      setDescription('');
      setLocation('');
      setContactInfo('');
      onClosePostModal();
    } catch (err: any) {
      setError(err.message || 'Failed to post item');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'open' | 'claimed' | 'resolved') => {
    try {
      await updateLostFoundStatus(id, newStatus);
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this post?')) {
      try {
        await deleteLostFound(id);
      } catch (err) {
        console.error("Failed to delete item", err);
      }
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesStatus = filterStatus === 'all' || (filterStatus === 'open' ? item.status === 'open' : item.status !== 'open');
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-white p-6 sm:p-7 shadow-lg shadow-orange-500/10">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white flex items-center gap-1">
                <Search className="w-3.5 h-3.5 text-amber-200" />
                Campus Desk
              </span>
              <span className="text-xs text-orange-100 font-medium">
                {items.length} Tracked Belongings
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Campus Lost & Found Hub
            </h2>
            <p className="text-xs sm:text-sm text-orange-100 max-w-xl">
              Report misplaced items, claim discovered belongings, or coordinate direct return with student & faculty peers.
            </p>
          </div>

          <button
            id="btn-open-lostfound-modal"
            onClick={onOpenPostModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-orange-50 text-orange-800 font-extrabold text-xs rounded-xl shadow-md transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Post Item</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            id="input-search-lostfound"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items by keyword, item name or building location..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Type filters */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/60">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                filterType === 'all' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('lost')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                filterType === 'lost' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Lost
            </button>
            <button
              onClick={() => setFilterType('found')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                filterType === 'found' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Found
            </button>
          </div>

          {/* Status filters */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Statuses</option>
            <option value="open">Active / Unresolved</option>
            <option value="resolved">Resolved / Claimed</option>
          </select>
        </div>
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/90 shadow-sm">
          <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-800">No items found</p>
          <p className="text-xs text-slate-400 mt-1">
            {searchQuery ? 'No matching items with your filter criteria' : 'Nothing currently reported missing or discovered'}
          </p>
          <button
            onClick={onOpenPostModal}
            className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-xl text-xs font-bold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Post a lost or found item</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const isLost = item.type === 'lost';
            const isOpen = item.status === 'open';
            const isPoster = item.posterUid === userProfile?.uid;
            const canManage = isPoster || isOwner || canModerate;

            return (
              <div
                key={item.id}
                id={`lostfound-card-${item.id}`}
                className={`group relative p-5 rounded-3xl border transition-all flex flex-col justify-between overflow-hidden ${
                  isOpen 
                    ? 'bg-white border-slate-200/90 shadow-sm hover:border-amber-300 hover:shadow-md' 
                    : 'bg-slate-50/80 border-slate-200 opacity-80'
                }`}
              >
                <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${isLost ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                <div className="pl-1">
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-black tracking-wider ${
                        isLost
                          ? 'bg-amber-100 text-amber-900 border border-amber-300/80'
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-300/80'
                      }`}
                    >
                      {isLost ? 'MISSING / LOST' : 'FOUND ON CAMPUS'}
                    </span>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        isOpen
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {item.status === 'open' ? 'Active' : 'Resolved'}
                    </span>
                  </div>

                  <h3 className="font-black text-base text-slate-900 group-hover:text-amber-700 transition-colors mb-1.5">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line mb-3 line-clamp-3 font-normal">
                    {item.description}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate font-medium">{item.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{item.date}</span>
                    </div>
                    {item.contactInfo && (
                      <div className="flex items-center gap-2 text-slate-800 font-bold bg-amber-50/70 p-2 rounded-xl border border-amber-200/50">
                        <Phone className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="truncate text-xs">{item.contactInfo}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 mt-4 border-t border-slate-100 pl-1 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                      {item.posterName.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-bold text-slate-700 truncate max-w-[100px]">{item.posterName}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {canManage && isOpen && (
                      <button
                        onClick={() => handleStatusChange(item.id, 'resolved')}
                        className="px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors flex items-center gap-1 border border-emerald-200"
                        title="Mark as resolved"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Claimed</span>
                      </button>
                    )}
                    {canManage && !isOpen && (
                      <button
                        onClick={() => handleStatusChange(item.id, 'open')}
                        className="px-2.5 py-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                      >
                        Reopen
                      </button>
                    )}
                    {canManage && (
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete post"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Post Modal */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">Report Lost or Found Item</h3>
              <button
                onClick={onClosePostModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handlePostSubmit} className="mt-4 space-y-3.5">
              {/* Type Switcher */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Posting Type *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('lost')}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      type === 'lost'
                        ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-2xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    I Lost Something
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('found')}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      type === 'found'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-2xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    I Found Something
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Item Title *</label>
                <input
                  type="text"
                  required
                  placeholder={type === 'lost' ? 'e.g. Black Dell XPS Laptop Charger' : 'e.g. Blue Hydro Flask Water Bottle'}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Campus Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Science Library, 2nd Floor"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Color, brand, identifying marks, serial tags, or where item was deposited..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Details (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. WhatsApp: +1 234 567 890 / Room 410"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClosePostModal}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl shadow-xs disabled:opacity-50"
                >
                  {loading ? 'Posting...' : 'Publish Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
