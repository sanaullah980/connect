import React, { useState, useEffect } from 'react';
import { TimetableClass } from '../types';
import { subscribeTimetable, saveTimetableClass, deleteTimetableClass } from '../services/campusService';
import { useAuth } from '../context/AuthContext';
import { 
  CalendarDays, 
  Clock, 
  MapPin, 
  User, 
  Plus, 
  Edit2, 
  Trash2, 
  AlertCircle, 
  X,
  Sparkles
} from 'lucide-react';

export const TimetableView: React.FC = () => {
  const { userProfile, isOwner, canManageTimetable } = useAuth();
  const [classes, setClasses] = useState<TimetableClass[]>([]);
  const [selectedDay, setSelectedDay] = useState<TimetableClass['day']>('Monday');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<TimetableClass | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [subject, setSubject] = useState('');
  const [day, setDay] = useState<TimetableClass['day']>('Monday');
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('10:30 AM');
  const [instructor, setInstructor] = useState('');
  const [room, setRoom] = useState('Room 301');

  const daysList: TimetableClass['day'][] = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  useEffect(() => {
    const unsub = subscribeTimetable(setClasses);
    return () => unsub();
  }, []);

  const handleOpenAdd = () => {
    setEditingClass(null);
    setSubject('');
    setDay(selectedDay);
    setStartTime('09:00 AM');
    setEndTime('10:30 AM');
    setInstructor(userProfile?.name || '');
    setRoom('Room 201');
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cls: TimetableClass) => {
    setEditingClass(cls);
    setSubject(cls.subject);
    setDay(cls.day);
    setStartTime(cls.startTime);
    setEndTime(cls.endTime);
    setInstructor(cls.instructor);
    setRoom(cls.room);
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !instructor.trim() || !room.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await saveTimetableClass({
        subject: subject.trim(),
        day,
        startTime,
        endTime,
        instructor: instructor.trim(),
        room: room.trim(),
        updatedBy: userProfile?.name || 'Staff'
      }, editingClass?.id);

      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save class schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this class from the schedule?')) {
      try {
        await deleteTimetableClass(id);
      } catch (err) {
        console.error("Failed to delete class", err);
      }
    }
  };

  const dayClasses = classes.filter(c => c.day === selectedDay);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white p-6 sm:p-7 shadow-lg shadow-teal-500/10">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5 text-amber-300" />
                Academic Schedule
              </span>
              <span className="text-xs text-emerald-100 font-medium">
                {classes.length} Total Weekly Classes
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Weekly Course Timetable & Lecture Halls
            </h2>
            <p className="text-xs sm:text-sm text-teal-100 max-w-xl">
              Real-time course scheduling, faculty instructors, lecture hall assignments, and class periods.
            </p>
          </div>

          {canManageTimetable && (
            <button
              id="btn-add-class-schedule"
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-teal-50 text-teal-800 font-extrabold text-xs rounded-xl shadow-md transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Class Schedule</span>
            </button>
          )}
        </div>
      </div>

      {/* Day of Week Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none bg-white p-2.5 rounded-2xl border border-slate-200/90 shadow-sm">
        {daysList.map((d) => {
          const count = classes.filter(c => c.day === d).length;
          const isSelected = selectedDay === d;
          return (
            <button
              key={d}
              id={`tab-day-${d.toLowerCase()}`}
              onClick={() => setSelectedDay(d)}
              className={`flex-1 min-w-[100px] py-2.5 px-3 rounded-xl text-xs font-black transition-all flex flex-col items-center gap-1 ${
                isSelected
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span>{d}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {count} {count === 1 ? 'class' : 'classes'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Class Schedule Grid */}
      {dayClasses.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/90 shadow-sm">
          <CalendarDays className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-800">No classes scheduled for {selectedDay}</p>
          <p className="text-xs text-slate-400 mt-1">
            Free day or no lectures assigned for this day.
          </p>
          {canManageTimetable && (
            <button
              onClick={handleOpenAdd}
              className="mt-3 inline-flex items-center gap-1 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-bold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule a course on {selectedDay}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dayClasses.map((cls, idx) => (
            <div
              key={cls.id}
              id={`class-card-${cls.id}`}
              className="group relative p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
            >
              <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-emerald-500 to-teal-600" />
              <div className="pl-1">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    {cls.startTime} - {cls.endTime}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {cls.room}
                  </span>
                </div>

                <h3 className="font-black text-base text-slate-900 group-hover:text-emerald-700 transition-colors mb-1">
                  {cls.subject}
                </h3>
                
                <div className="flex items-center gap-2 text-xs text-slate-600 mt-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">
                    {cls.instructor ? cls.instructor.charAt(0).toUpperCase() : 'P'}
                  </div>
                  <span className="font-semibold text-slate-800">{cls.instructor}</span>
                </div>
              </div>

              <div className="pt-3 mt-4 border-t border-slate-100 pl-1 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Lecture #{idx + 1}
                </span>

                {canManageTimetable && (
                  <div className="flex items-center gap-1">
                    <button
                      id={`btn-edit-class-${cls.id}`}
                      onClick={() => handleOpenEdit(cls)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                      title="Edit class"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id={`btn-delete-class-${cls.id}`}
                      onClick={() => handleDelete(cls.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete class"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Timetable Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">
                {editingClass ? 'Edit Scheduled Class' : 'Add Class Schedule'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
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

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Course / Subject Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Computing (CS-402)"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Day of Week *</label>
                  <select
                    value={day}
                    onChange={(e) => setDay(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white"
                  >
                    {daysList.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Room / Hall *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lab 4 / Room 302"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time *</label>
                  <input
                    type="text"
                    required
                    placeholder="09:00 AM"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Time *</label>
                  <input
                    type="text"
                    required
                    placeholder="10:30 AM"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Instructor / Professor *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Jennifer Vance"
                  value={instructor}
                  onChange={(e) => setInstructor(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs rounded-xl shadow-xs disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingClass ? 'Update Class' : 'Add Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
