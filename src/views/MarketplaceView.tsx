import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  MarketplaceListing, 
  MarketplaceMessage 
} from '../types';
import { 
  subscribeMarketplace, 
  createMarketplaceListing, 
  updateMarketplaceListing, 
  deleteMarketplaceListing,
  subscribeMarketplaceMessages,
  sendMarketplaceMessage,
  reportMarketplaceListing
} from '../services/campusService';
import { 
  ShoppingBag, 
  Plus, 
  Search, 
  Filter, 
  Tag, 
  MapPin, 
  Clock, 
  MessageSquare, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Bookmark, 
  Send, 
  X, 
  ExternalLink,
  DollarSign,
  ShieldCheck,
  User,
  SlidersHorizontal
} from 'lucide-react';

const CATEGORIES = [
  'All Categories',
  'Books',
  'Electronics',
  'Calculators',
  'Stationery',
  'Furniture',
  'Hostel items',
  'Bikes',
  'Clothing',
  'Other'
] as const;

export const MarketplaceView: React.FC = () => {
  const { userProfile, currentUser, isOwner } = useAuth();
  
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [selectedType, setSelectedType] = useState<'all' | 'for_sale' | 'wanted' | 'free'>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'my' | 'saved'>('all');
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('paf_saved_marketplace') || '[]');
    } catch {
      return [];
    }
  });

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeListingForChat, setActiveListingForChat] = useState<MarketplaceListing | null>(null);
  const [chatMessages, setChatMessages] = useState<MarketplaceMessage[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Report Modal
  const [reportListingItem, setReportListingItem] = useState<MarketplaceListing | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  // Create Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [category, setCategory] = useState<MarketplaceListing['category']>('Books');
  const [condition, setCondition] = useState<MarketplaceListing['condition']>('Like New');
  const [listingType, setListingType] = useState<MarketplaceListing['listingType']>('for_sale');
  const [campus, setCampus] = useState('Main Campus, Mang');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeMarketplace((data) => {
      setListings(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Listen to messages when a listing chat is opened
  useEffect(() => {
    if (!activeListingForChat) return;
    const unsubMessages = subscribeMarketplaceMessages(activeListingForChat.id, currentUser?.uid, (msgs) => {
      setChatMessages(msgs);
    });
    return () => unsubMessages();
  }, [activeListingForChat?.id, currentUser?.uid]);

  const toggleSave = (id: string) => {
    const updated = savedIds.includes(id) 
      ? savedIds.filter(item => item !== id)
      : [...savedIds, id];
    setSavedIds(updated);
    localStorage.setItem('paf_saved_marketplace', JSON.stringify(updated));
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    setSubmitting(true);
    try {
      await createMarketplaceListing({
        title: title.trim(),
        description: description.trim(),
        price: listingType === 'free' ? 0 : Number(price),
        category,
        condition,
        listingType,
        campus,
        sellerUid: userProfile.uid,
        sellerName: userProfile.name,
        sellerDepartment: userProfile.department || 'Academic Department',
        sellerProgram: userProfile.program || 'Undergraduate',
        status: 'active',
        imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60'
      });
      setIsCreateModalOpen(false);
      // Reset
      setTitle('');
      setDescription('');
      setPrice(0);
      setImageUrl('');
    } catch (err) {
      console.error(err);
      alert('Failed to post listing. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeListingForChat || !newMessageText.trim() || !userProfile) return;
    setSendingMessage(true);
    try {
      await sendMarketplaceMessage(
        activeListingForChat.id,
        activeListingForChat.title,
        activeListingForChat.sellerUid,
        newMessageText.trim(),
        userProfile
      );
      setNewMessageText('');
    } catch (err) {
      console.error(err);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleStatusChange = async (listingId: string, newStatus: 'active' | 'reserved' | 'sold') => {
    try {
      await updateMarketplaceListing(listingId, { status: newStatus });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm('Are you sure you want to remove this listing?')) return;
    try {
      await deleteMarketplaceListing(listingId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReportSubmit = async () => {
    if (!reportListingItem || !reportReason.trim() || !userProfile) return;
    try {
      await reportMarketplaceListing(reportListingItem.id, reportListingItem.title, reportReason.trim(), userProfile);
      setReportSubmitted(true);
      setTimeout(() => {
        setReportListingItem(null);
        setReportReason('');
        setReportSubmitted(false);
      }, 1500);
    } catch (err) {
      console.error(err);
    }
  };

  // Filter listings
  const filteredListings = listings.filter((item) => {
    if (activeTab === 'my') {
      if (item.sellerUid !== userProfile?.uid) return false;
    }
    if (activeTab === 'saved') {
      if (!savedIds.includes(item.id)) return false;
    }
    if (selectedCategory !== 'All Categories' && item.category !== selectedCategory) {
      return false;
    }
    if (selectedType !== 'all' && item.listingType !== selectedType) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchDept = (item.sellerDepartment || '').toLowerCase().includes(q);
      return matchTitle || matchDesc || matchDept;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner - PAF Navy Aesthetic */}
      <div className="rounded-3xl bg-[#0A2540] text-white p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold mb-3 border border-white/10">
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
              <span>PAF-IAST Student & Faculty Exchange</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Campus Marketplace
            </h1>
            <p className="text-slate-300 text-sm sm:text-base mt-2 leading-relaxed">
              Buy, sell, or donate textbooks, scientific calculators, hostel equipment, and electronics securely with verified students and faculty.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm flex items-center gap-2 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Post Listing</span>
            </button>
          </div>
        </div>

        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
      </div>

      {/* Tabs & Search Controls */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Browse All ({listings.length})
          </button>
          <button
            onClick={() => setActiveTab('my')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'my'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Listings
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'saved'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved ({savedIds.length})</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search textbooks, calculators, hostel items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A2540] transition-all"
          />
        </div>
      </div>

      {/* Category Pills & Listing Type */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 overflow-x-auto pb-1">
        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto py-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                selectedCategory === cat
                  ? 'bg-[#0A2540] text-white border-[#0A2540] shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto text-xs">
          <span className="text-slate-400 text-[11px] font-semibold">Type:</span>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#0A2540]"
          >
            <option value="all">All Types</option>
            <option value="for_sale">For Sale</option>
            <option value="wanted">Wanted</option>
            <option value="free">Free / Giveaway</option>
          </select>
        </div>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-72 bg-slate-100 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs max-w-lg mx-auto">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400 mb-4">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No marketplace listings found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            {searchQuery || selectedCategory !== 'All Categories'
              ? 'Try changing your search keywords or category filters.'
              : 'Be the first to post a study resource, calculator, or item on campus!'}
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-5 px-4 py-2 bg-[#0A2540] text-white text-xs font-bold rounded-xl hover:bg-[#12365c] transition-all inline-flex items-center gap-2 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create First Listing</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredListings.map((item) => {
            const isMyListing = item.sellerUid === userProfile?.uid;
            const isSaved = savedIds.includes(item.id);

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col overflow-hidden hover:shadow-md ${
                  item.status === 'sold'
                    ? 'border-slate-200 opacity-75'
                    : item.status === 'reserved'
                    ? 'border-amber-200 bg-amber-50/10'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Image Container */}
                <div className="relative h-44 w-full bg-slate-100 overflow-hidden group">
                  <img
                    src={item.imageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60'}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Price Tag Overlay */}
                  <div className="absolute bottom-2.5 left-2.5">
                    <span className="px-2.5 py-1 rounded-lg bg-[#0A2540]/90 backdrop-blur-xs text-white font-extrabold text-xs tracking-tight shadow-md">
                      {item.listingType === 'free' ? 'FREE' : item.listingType === 'wanted' ? 'WANTED' : `PKR ${item.price.toLocaleString()}`}
                    </span>
                  </div>

                  {/* Condition Badge */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-slate-800 text-[10px] font-bold border border-slate-200/80 shadow-xs">
                      {item.condition}
                    </span>
                  </div>

                  {/* Bookmark Button */}
                  <button
                    onClick={() => toggleSave(item.id)}
                    className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-slate-600 hover:text-rose-600 transition-colors shadow-xs"
                    title="Save to favorites"
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>

                  {/* Status Banner */}
                  {item.status !== 'active' && (
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center">
                      <span className="px-3 py-1 rounded-full bg-white text-slate-900 font-black text-xs uppercase tracking-wider shadow-lg">
                        {item.status}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1">
                      <span className="font-semibold text-indigo-600">{item.category}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        {item.campus}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                      {item.title}
                    </h3>
                    
                    <p className="text-xs text-slate-600 line-clamp-2 mt-1.5 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Seller & Action Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="w-6 h-6 rounded-full bg-[#0A2540] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                        {item.sellerName.charAt(0)}
                      </div>
                      <div className="truncate">
                        <p className="text-[11px] font-bold text-slate-800 truncate">{item.sellerName}</p>
                        <p className="text-[10px] text-slate-400 truncate">{item.sellerProgram || item.sellerDepartment}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isMyListing ? (
                        <div className="flex items-center gap-1">
                          <select
                            value={item.status}
                            onChange={(e) => handleStatusChange(item.id, e.target.value as any)}
                            className="text-[10px] font-semibold bg-slate-100 rounded-md px-1.5 py-1 border border-slate-200"
                          >
                            <option value="active">Active</option>
                            <option value="reserved">Reserved</option>
                            <option value="sold">Sold</option>
                          </select>
                          <button
                            onClick={() => handleDeleteListing(item.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                            title="Delete listing"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setActiveListingForChat(item)}
                          className="px-2.5 py-1 bg-[#0A2540] hover:bg-[#12365c] text-white text-[11px] font-bold rounded-lg flex items-center gap-1 shadow-2xs transition-colors"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Chat</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE LISTING MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-[#0A2540] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">Post to Campus Marketplace</h2>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-300 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Listing Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['for_sale', 'wanted', 'free'] as const).map((type) => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setListingType(type)}
                      className={`py-2 rounded-xl font-bold capitalize border text-xs transition-all ${
                        listingType === type
                          ? 'bg-[#0A2540] text-white border-[#0A2540]'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {type.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Item Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Casio fx-991EX Scientific Calculator"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0A2540] text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs"
                  >
                    {CATEGORIES.filter(c => c !== 'All Categories').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs"
                  >
                    <option value="Brand New">Brand New</option>
                    <option value="Like New">Like New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                  </select>
                </div>
              </div>

              {listingType !== 'free' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Price (PKR)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">PKR</span>
                    <input
                      type="number"
                      required
                      min="0"
                      step="50"
                      placeholder="e.g. 3500"
                      value={price || ''}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full pl-12 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0A2540] text-xs font-mono font-bold"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Campus / Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Main Campus / Hostel Block B / Library"
                  value={campus}
                  onChange={(e) => setCampus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Image URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Leave empty to use a high-quality default academic equipment photo.
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description & Details</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe condition, reason for selling, accessories included..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0A2540] text-xs"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Privacy Safe: Your phone number is not public. Students message you directly in Connect PAF.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-xs"
                >
                  {submitting ? 'Publishing...' : 'Publish Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IN-APP CHAT DRAWER / MODAL */}
      {activeListingForChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[560px]">
            {/* Chat Header */}
            <div className="bg-[#0A2540] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
                  <ShoppingBag className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="truncate">
                  <h3 className="font-bold text-xs sm:text-sm text-white truncate">
                    {activeListingForChat.title}
                  </h3>
                  <p className="text-[11px] text-slate-300 truncate">
                    Seller: {activeListingForChat.sellerName} • {activeListingForChat.listingType === 'free' ? 'FREE' : `PKR ${activeListingForChat.price.toLocaleString()}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveListingForChat(null)}
                className="text-slate-300 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
              <div className="text-center py-2">
                <span className="text-[10px] text-slate-400 bg-white px-2.5 py-1 rounded-full border border-slate-200 font-medium">
                  Connect PAF Secure Campus Messenger
                </span>
              </div>

              {chatMessages.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  <MessageSquare className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="font-semibold text-slate-600">No messages yet</p>
                  <p className="text-[11px] mt-0.5">Send an inquiry about item availability or meeting location.</p>
                </div>
              ) : (
                chatMessages.map((msg) => {
                  const isMe = msg.senderUid === userProfile?.uid;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5 px-1">
                        <span>{msg.senderName}</span>
                      </div>
                      <div
                        className={`max-w-[80%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed ${
                          isMe
                            ? 'bg-[#0A2540] text-white rounded-br-xs'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-2xs'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask about availability or meeting on campus..."
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
              />
              <button
                type="submit"
                disabled={sendingMessage || !newMessageText.trim()}
                className="p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
