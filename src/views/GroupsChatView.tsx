import React, { useState, useEffect, useRef } from 'react';
import { SubjectGroup, GroupMessage } from '../types';
import { 
  subscribeGroups, 
  createGroup, 
  subscribeGroupMessages, 
  sendGroupMessage, 
  deleteGroupMessage 
} from '../services/campusService';
import { useAuth } from '../context/AuthContext';
import { RoleBadge } from '../components/RoleBadge';
import { 
  MessageSquare, 
  Send, 
  Plus, 
  Users, 
  Trash2, 
  Sparkles, 
  X, 
  AlertCircle,
  Hash,
  ArrowLeft
} from 'lucide-react';

export const GroupsChatView: React.FC = () => {
  const { userProfile, isOwner } = useAuth();
  const [groups, setGroups] = useState<SubjectGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<SubjectGroup | null>(null);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(false);
  const [loadingSend, setLoadingSend] = useState(false);

  // New group form
  const [groupName, setGroupName] = useState('');
  const [groupCode, setGroupCode] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [groupError, setGroupError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Subscribe to all groups
  useEffect(() => {
    const unsub = subscribeGroups((allGroups) => {
      setGroups(allGroups);
      if (allGroups.length > 0 && !selectedGroup) {
        setSelectedGroup(allGroups[0]);
      }
    });
    return () => unsub();
  }, [selectedGroup]);

  // Subscribe to messages in the active group (proper unsubscribe on group switch)
  useEffect(() => {
    if (!selectedGroup) return;

    const unsub = subscribeGroupMessages(selectedGroup.id, (msgs) => {
      setMessages(msgs);
      // Auto-scroll to bottom on new message
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    });

    return () => {
      unsub();
    };
  }, [selectedGroup?.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup || !userProfile || !messageInput.trim() || loadingSend) return;

    const textToSend = messageInput.trim();
    setMessageInput('');
    setLoadingSend(true);
    try {
      await sendGroupMessage(selectedGroup.id, textToSend, userProfile);
    } catch (err) {
      console.error("Failed to send message", err);
      // restore if failed
      setMessageInput(textToSend);
    } finally {
      setLoadingSend(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    if (!groupName.trim() || !groupCode.trim()) {
      setGroupError('Please provide group name and course code');
      return;
    }

    try {
      const newId = await createGroup(groupName.trim(), groupCode.trim(), groupDesc.trim(), userProfile);
      setGroupName('');
      setGroupCode('');
      setGroupDesc('');
      setIsNewGroupModalOpen(false);
      // switch to newly created group
      setSelectedGroup({
        id: newId,
        name: groupName.trim(),
        code: groupCode.trim(),
        description: groupDesc.trim(),
        createdBy: userProfile.uid,
        createdAt: new Date().toISOString()
      });
    } catch (err: any) {
      setGroupError(err.message || 'Failed to create group');
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (!selectedGroup) return;
    try {
      await deleteGroupMessage(selectedGroup.id, msgId);
    } catch (err) {
      console.error("Failed to delete message", err);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] min-h-[550px] flex flex-col md:flex-row bg-white rounded-3xl border border-slate-200/90 shadow-md overflow-hidden">
      {/* Left Sidebar: Groups list */}
      <div className={`w-full md:w-80 border-r border-slate-200/80 flex flex-col shrink-0 bg-slate-50/50 ${
        selectedGroup ? 'hidden md:flex' : 'flex'
      }`}>
        <div className="p-4 border-b border-slate-200/70 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900">Study Channels</h3>
              <p className="text-[11px] text-slate-400">{groups.length} active communities</p>
            </div>
          </div>
          <button
            id="btn-create-subject-group"
            onClick={() => { setGroupError(null); setIsNewGroupModalOpen(true); }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-all shadow-2xs border border-blue-200/50"
            title="Create group"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
          {groups.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="font-semibold text-slate-600">No study groups yet</p>
              <p className="text-[11px] text-slate-400 mt-1">Create a group for your course or department</p>
              <button
                onClick={() => setIsNewGroupModalOpen(true)}
                className="mt-3 px-3 py-1.5 bg-blue-600 text-white font-bold rounded-xl text-xs shadow-xs"
              >
                + Create First Group
              </button>
            </div>
          ) : (
            groups.map((group, idx) => {
              const isSelected = selectedGroup?.id === group.id;
              const gradients = [
                'from-blue-600 to-indigo-600',
                'from-emerald-600 to-teal-600',
                'from-purple-600 to-pink-600',
                'from-amber-500 to-rose-600',
                'from-sky-500 to-blue-600',
              ];
              const grad = gradients[idx % gradients.length];

              return (
                <button
                  key={group.id}
                  id={`group-item-${group.id}`}
                  onClick={() => setSelectedGroup(group)}
                  className={`w-full text-left p-3.5 rounded-2xl transition-all relative ${
                    isSelected
                      ? 'bg-white border-2 border-blue-500 shadow-sm'
                      : 'bg-white/80 hover:bg-white border border-slate-200/70 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${grad} text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs`}>
                      {group.code ? group.code.slice(0, 3).toUpperCase() : '#'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-[10px] font-black text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                          {group.code}
                        </span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0"></span>
                        )}
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 truncate">
                        {group.name}
                      </h4>
                      {group.description && (
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {group.description}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Area: Active Chat */}
      <div className={`flex-1 flex flex-col h-full bg-gradient-to-b from-slate-50/60 to-slate-100/40 ${
        !selectedGroup ? 'hidden md:flex items-center justify-center' : 'flex'
      }`}>
        {selectedGroup ? (
          <>
            {/* Chat Room Header */}
            <div className="p-4 bg-white border-b border-slate-200/80 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedGroup(null)}
                  className="md:hidden p-1.5 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                  <Hash className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-base text-slate-900">{selectedGroup.name}</h3>
                    <span className="text-[10px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
                      {selectedGroup.code}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate max-w-md">
                    {selectedGroup.description || 'Campus real-time subject channel'}
                  </p>
                </div>
              </div>

              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/70">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0"></span>
                <span>Live Sync Active</span>
              </span>
            </div>

            {/* Chat Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                    <MessageSquare className="w-7 h-7" />
                  </div>
                  <p className="text-sm font-bold text-slate-700">No messages in this channel yet</p>
                  <p className="text-xs text-slate-400 mt-1">Be the first to say hello or ask a course question!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderUid === userProfile?.uid;
                  const canDelete = isMe || isOwner || userProfile?.roles?.includes('Institution Admin') || userProfile?.roles?.includes('Moderator');

                  return (
                    <div
                      key={msg.id}
                      id={`chat-msg-${msg.id}`}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}
                    >
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-xs font-bold text-slate-700">
                          {isMe ? 'You' : msg.senderName}
                        </span>
                        {msg.senderRole && (
                          <RoleBadge role={msg.senderRole} size="sm" />
                        )}
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {canDelete && (
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 transition-opacity"
                            title="Delete message"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div
                        className={`max-w-[85%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                          isMe
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-xs font-normal'
                            : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs shadow-xs'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3.5 bg-white border-t border-slate-200/80 flex items-center gap-2.5">
              <input
                id="input-group-chat-message"
                type="text"
                placeholder={`Message #${selectedGroup.code}...`}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
              <button
                id="btn-send-chat-message"
                type="submit"
                disabled={!messageInput.trim() || loadingSend}
                className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-2xl shadow-md transition-all disabled:opacity-40 flex items-center gap-1.5"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </>
        ) : (
          <div className="text-center p-12 text-slate-400">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <Users className="w-8 h-8" />
            </div>
            <p className="text-base font-bold text-slate-800">Select a study group channel</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Real-time university discussion room with instant updates across devices
            </p>
          </div>
        )}
      </div>

      {/* New Group Modal */}
      {isNewGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">Create Subject Discussion Group</h3>
              <button
                onClick={() => setIsNewGroupModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {groupError && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{groupError}</span>
              </div>
            )}

            <form onSubmit={handleCreateGroup} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Group / Course Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Artificial Intelligence & Robotics"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Course Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CS-430"
                  value={groupCode}
                  onChange={(e) => setGroupCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Topic focus, homework coordination, syllabus queries..."
                  value={groupDesc}
                  onChange={(e) => setGroupDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewGroupModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
