import React, { useState, useEffect } from 'react';
import { TimetableClass, TimetablePdfUpload } from '../types';
import { 
  subscribeTimetable, 
  saveTimetableClass, 
  deleteTimetableClass, 
  saveTimetableBatch,
  clearAllTimetableClasses,
  subscribeTimetablePdfs
} from '../services/campusService';
import { parseTimetablePdf, ParseResult } from '../services/timetablePdfService';
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
  FileUp, 
  CheckCircle2, 
  Filter, 
  SlidersHorizontal,
  Layers,
  GraduationCap,
  Calendar,
  AlertTriangle,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

export const TimetableView: React.FC = () => {
  const { userProfile, isOwner, canManageTimetable } = useAuth();
  
  const [classes, setClasses] = useState<TimetableClass[]>([]);
  const [timetablePdfs, setTimetablePdfs] = useState<TimetablePdfUpload[]>([]);
  const [selectedDay, setSelectedDay] = useState<TimetableClass['day']>('Monday');
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [filterMode, setFilterMode] = useState<'personalized' | 'all'>('personalized');
  const [selectedProgram, setSelectedProgram] = useState<string>('All Programs');

  // Single Class Add/Edit Modal
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<TimetableClass | null>(null);

  // PDF Uploader & Review Workflow States
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isParsingPdf, setIsParsingPdf] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [reviewedEntries, setReviewedEntries] = useState<TimetableClass[]>([]);
  const [academicTermInput, setAcademicTermInput] = useState('Fall 2026');
  const [publishing, setPublishing] = useState(false);

  // Form states for manual class entry
  const [subject, setSubject] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [day, setDay] = useState<TimetableClass['day']>('Monday');
  const [startTime, setStartTime] = useState('08:30');
  const [endTime, setEndTime] = useState('10:00');
  const [instructor, setInstructor] = useState('');
  const [room, setRoom] = useState('Hall B-201');
  const [programName, setProgramName] = useState(userProfile?.program || 'BS Artificial Intelligence');
  const [semester, setSemester] = useState(userProfile?.semester || 'Semester 3');
  const [section, setSection] = useState(userProfile?.section || 'Section A');

  const daysList: TimetableClass['day'][] = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  useEffect(() => {
    const unsub = subscribeTimetable(setClasses);
    const unsubPdfs = subscribeTimetablePdfs(setTimetablePdfs);
    return () => {
      unsub();
      unsubPdfs();
    };
  }, []);

  // Handlers for single class
  const handleOpenAdd = () => {
    setEditingClass(null);
    setSubject('');
    setSubjectCode('');
    setDay(selectedDay);
    setStartTime('08:30');
    setEndTime('10:00');
    setInstructor(userProfile?.roles?.includes('Teacher') ? (userProfile.name || '') : '');
    setRoom('Room 201');
    setProgramName(userProfile?.program || 'BS Artificial Intelligence');
    setSemester(userProfile?.semester || 'Semester 3');
    setSection(userProfile?.section || 'Section A');
    setIsClassModalOpen(true);
  };

  const handleOpenEdit = (cls: TimetableClass) => {
    setEditingClass(cls);
    setSubject(cls.subject);
    setSubjectCode(cls.subjectCode || '');
    setDay(cls.day);
    setStartTime(cls.startTime);
    setEndTime(cls.endTime);
    setInstructor(cls.instructor);
    setRoom(cls.room);
    setProgramName(cls.programName || 'BS Artificial Intelligence');
    setSemester(cls.semester || 'Semester 3');
    setSection(cls.section || 'Section A');
    setIsClassModalOpen(true);
  };

  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveTimetableClass({
        subject: subject.trim(),
        subjectCode: subjectCode.trim() || undefined,
        day,
        startTime,
        endTime,
        instructor: instructor.trim(),
        room: room.trim(),
        programName,
        semester,
        section,
        academicTerm: academicTermInput,
        updatedBy: userProfile?.name || 'Academic Administration'
      }, editingClass?.id);
      setIsClassModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to save class schedule entry.');
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (!confirm('Are you sure you want to remove this class from the schedule?')) return;
    try {
      await deleteTimetableClass(id);
    } catch (err) {
      console.error(err);
    }
  };

  // PDF Upload & Parser
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingPdf(true);
    try {
      const result = await parseTimetablePdf(file, academicTermInput);
      setParseResult(result);
      setReviewedEntries(result.entries);
    } catch (err) {
      console.error('PDF parsing error:', err);
      alert('Error parsing timetable PDF. Please ensure the file is a valid PDF.');
    } finally {
      setIsParsingPdf(false);
    }
  };

  // Publish Extracted Timetable
  const handlePublishTimetable = async (replaceExisting: boolean = false) => {
    if (!reviewedEntries.length || !userProfile) return;
    setPublishing(true);
    try {
      if (replaceExisting) {
        await clearAllTimetableClasses();
      }

      await saveTimetableBatch(reviewedEntries, {
        fileName: parseResult?.fileName || 'Timetable.pdf',
        term: academicTermInput,
        academicYear: '2025-2026',
        status: 'published',
        entriesCount: reviewedEntries.length,
        programsCount: parseResult?.programsDetected.length || 1,
        sectionsCount: parseResult?.sectionsDetected.length || 1,
        reviewNeededCount: reviewedEntries.filter(e => e.needsReview).length,
        uploadedBy: userProfile.name,
        uploadedAt: new Date().toISOString()
      });

      alert(`Successfully published ${reviewedEntries.length} timetable entries to Connect PAF!`);
      setIsPdfModalOpen(false);
      setParseResult(null);
      setReviewedEntries([]);
    } catch (err) {
      console.error(err);
      alert('Failed to publish timetable. Please try again.');
    } finally {
      setPublishing(false);
    }
  };

  // Filtering classes based on personalized vs all programs
  const filteredClasses = classes.filter(cls => {
    if (filterMode === 'personalized' && userProfile) {
      const isTeacher = userProfile.roles?.includes('Teacher');
      if (isTeacher) {
        return cls.instructor.toLowerCase().includes((userProfile.name || '').toLowerCase());
      }
      
      // Match Student's Program and Semester
      let matches = true;
      if (userProfile.program && cls.programName) {
        matches = matches && (
          cls.programName.toLowerCase().includes(userProfile.program.toLowerCase()) ||
          userProfile.program.toLowerCase().includes(cls.programName.toLowerCase())
        );
      }
      if (userProfile.semester && cls.semester) {
        matches = matches && (
          cls.semester.toLowerCase() === userProfile.semester.toLowerCase() ||
          cls.semester.replace(/\D/g, '') === userProfile.semester.replace(/\D/g, '')
        );
      }
      if (userProfile.section && cls.section) {
        matches = matches && (
          cls.section.toLowerCase() === userProfile.section.toLowerCase()
        );
      }
      return matches;
    }

    if (selectedProgram !== 'All Programs' && cls.programName) {
      return cls.programName === selectedProgram;
    }

    return true;
  });

  const dayClasses = filteredClasses
    .filter(c => c.day === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Distinct programs in the timetable
  const distinctPrograms = Array.from(new Set(classes.map(c => c.programName).filter(Boolean))) as string[];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-[#0A2540] text-white p-6 sm:p-8 shadow-sm border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold mb-3 border border-white/10">
              <CalendarDays className="w-3.5 h-3.5 text-emerald-400" />
              <span>Fall 2026 Academic Term</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              University Course Timetable
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-xl leading-relaxed">
              Real-time lecture schedules, room assignments, and faculty instructor slots. Schedules are automatically synchronized with your cohort.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {canManageTimetable && (
              <>
                <button
                  onClick={() => setIsPdfModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all"
                >
                  <FileUp className="w-4 h-4" />
                  <span>Upload Timetable PDF</span>
                </button>
                <button
                  onClick={handleOpenAdd}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/20 transition-all shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Class Slot</span>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>
      </div>

      {/* Control Bar: Mode Toggle, Day Tabs, and Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
        {/* Personalization Mode Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setFilterMode('personalized')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterMode === 'personalized'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              My Enrolled Cohort
            </button>
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterMode === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Degree Programs
            </button>
          </div>

          {filterMode === 'all' && (
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 focus:outline-none"
            >
              <option value="All Programs">All Programs</option>
              {distinctPrograms.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          )}
        </div>

        {/* Day / Week View Mode Switch */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start lg:self-auto">
          <button
            onClick={() => setViewMode('day')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'day' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Day View
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'week' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Full Week Grid
          </button>
        </div>
      </div>

      {/* Cohort Status Pill */}
      {filterMode === 'personalized' && (
        <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Showing timetable classes matching <strong>{userProfile?.program || 'BS Artificial Intelligence'}</strong> • <strong>{userProfile?.semester || 'Semester 3'}</strong> • <strong>{userProfile?.section || 'Section A'}</strong>
            </span>
          </div>
          <span className="text-[11px] font-mono text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
            {filteredClasses.length} Scheduled Classes
          </span>
        </div>
      )}

      {/* Day Selector Buttons (when in Day view) */}
      {viewMode === 'day' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {daysList.map((d) => {
            const countForDay = filteredClasses.filter(c => c.day === d).length;
            const isSelected = selectedDay === d;
            return (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition-all duration-150 flex items-center gap-2 whitespace-nowrap border ${
                  isSelected
                    ? 'bg-[#0A2540] text-white border-[#0A2540] shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span>{d}</span>
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {countForDay}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* TIMETABLE CONTENT: DAY VIEW */}
      {viewMode === 'day' && (
        <div className="space-y-3">
          {dayClasses.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs max-w-lg mx-auto">
              <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No classes scheduled on {selectedDay}</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                No lecture slots found for your active cohort on this day.
              </p>
              {canManageTimetable && (
                <button
                  onClick={handleOpenAdd}
                  className="mt-4 px-4 py-2 bg-[#0A2540] text-white text-xs font-bold rounded-xl hover:bg-[#12365c] transition-all inline-flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Class to {selectedDay}</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dayClasses.map((cls) => (
                <div
                  key={cls.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-[#0A2540] text-white text-[10px] font-mono font-bold">
                          {cls.subjectCode || 'CLASS'}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500">
                          {cls.programName || 'Degree Cohort'}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-mono font-bold">
                        {cls.section || 'Sec A'}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {cls.subject}
                    </h3>

                    <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                        <div>
                          <p className="text-[10px] text-slate-400 font-semibold">Time Slot</p>
                          <p className="font-bold text-slate-700 font-mono text-[11px]">
                            {cls.startTime} — {cls.endTime}
                          </p>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <p className="text-[10px] text-emerald-600 font-semibold">Lecture Venue</p>
                          <p className="font-bold text-emerald-900 text-[11px] truncate">
                            {cls.room}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-600 px-1">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium text-[11px] truncate">
                        Instructor: <strong>{cls.instructor}</strong>
                      </span>
                    </div>
                  </div>

                  {canManageTimetable && (
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(cls)}
                        className="px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteClass(cls.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                        title="Delete slot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TIMETABLE CONTENT: WEEK VIEW GRID */}
      {viewMode === 'week' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs overflow-x-auto">
          <div className="min-w-[800px] grid grid-cols-5 gap-3">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((d) => {
              const dayItems = filteredClasses
                .filter(c => c.day === d)
                .sort((a, b) => a.startTime.localeCompare(b.startTime));

              return (
                <div key={d} className="space-y-3">
                  <div className="p-2.5 bg-slate-100 rounded-xl text-center">
                    <p className="font-bold text-xs text-slate-800">{d}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{dayItems.length} lectures</p>
                  </div>

                  <div className="space-y-2">
                    {dayItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all text-xs"
                      >
                        <span className="font-mono text-[10px] font-bold text-indigo-600 block">
                          {item.startTime} - {item.endTime}
                        </span>
                        <p className="font-bold text-slate-900 mt-1 line-clamp-1">{item.subject}</p>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">{item.instructor}</p>
                        <p className="text-[10px] font-semibold text-emerald-700 truncate mt-1 flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5" />
                          {item.room}
                        </p>
                      </div>
                    ))}
                    {dayItems.length === 0 && (
                      <div className="p-4 text-center text-slate-400 text-[11px] italic">
                        No classes
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PDF UPLOADER & REVIEW MODAL */}
      {isPdfModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-[#0A2540] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileUp className="w-5 h-5 text-emerald-400" />
                <div>
                  <h2 className="text-base font-bold text-white">Upload Master Timetable PDF</h2>
                  <p className="text-[11px] text-slate-300">Automatic PDF text parsing & timetable structuring</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsPdfModalOpen(false);
                  setParseResult(null);
                  setReviewedEntries([]);
                }}
                className="text-slate-300 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {!parseResult ? (
                <div className="space-y-4">
                  <div className="p-8 border-2 border-dashed border-slate-300 rounded-3xl text-center hover:border-emerald-500 transition-colors bg-slate-50">
                    <FileUp className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <h3 className="font-bold text-sm text-slate-800">
                      Select University Timetable PDF
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Upload the master timetable PDF for Fall 2026. The system extracts classes, room assignments, sections, and instructors.
                    </p>

                    <label className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0A2540] hover:bg-[#12365c] text-white font-bold text-xs cursor-pointer shadow-xs transition-all">
                      <FileUp className="w-4 h-4" />
                      <span>Choose PDF File</span>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handlePdfUpload}
                        className="hidden"
                      />
                    </label>

                    {isParsingPdf && (
                      <div className="mt-4 flex items-center justify-center gap-2 text-indigo-600 font-bold">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Processing & Extracting Timetable Text...</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-2xl text-blue-900">
                    <h4 className="font-bold text-xs mb-1">Intelligent Timetable Extraction:</h4>
                    <p className="text-[11px] text-blue-800/80 leading-relaxed">
                      Supports PAF-IAST standard schedule tables, multi-column weekly matrices, section markers (e.g. BS AI Sec A, BS DS), teacher codes, and room tags (LH-1, Lab 4).
                    </p>
                  </div>
                </div>
              ) : (
                /* REVIEW & CORRECTION SCREEN */
                <div className="space-y-4">
                  {/* Summary Metric Bar */}
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                    <div className="flex items-center gap-2 text-emerald-900 font-bold mb-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Timetable PDF Processed Successfully</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="bg-white p-2 rounded-xl border border-emerald-100">
                        <span className="text-[10px] text-slate-500 block">Classes Extracted</span>
                        <strong className="text-emerald-800 text-sm font-mono">{reviewedEntries.length}</strong>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-emerald-100">
                        <span className="text-[10px] text-slate-500 block">Programs Detected</span>
                        <strong className="text-emerald-800 text-sm font-mono">{parseResult.programsDetected.length}</strong>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-emerald-100">
                        <span className="text-[10px] text-slate-500 block">Sections Detected</span>
                        <strong className="text-emerald-800 text-sm font-mono">{parseResult.sectionsDetected.length}</strong>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-emerald-100">
                        <span className="text-[10px] text-slate-500 block">Review Flags</span>
                        <strong className="text-amber-600 text-sm font-mono">{parseResult.needsReviewCount}</strong>
                      </div>
                    </div>
                  </div>

                  {/* List of Extracted Classes to Review */}
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    <h4 className="font-bold text-slate-700 text-xs">Extracted Classes Preview & Corrections:</h4>
                    {reviewedEntries.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className={`p-3 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                          item.needsReview ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{item.subject}</span>
                            <span className="font-mono text-[10px] text-slate-500">({item.day} • {item.startTime} - {item.endTime})</span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5">
                            {item.programName} • {item.semester} • {item.section} • Room: <strong>{item.room}</strong> • Instructor: <strong>{item.instructor}</strong>
                          </p>
                          {item.needsReview && (
                            <p className="text-[10px] text-amber-700 font-semibold mt-1 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              {item.reviewNote || 'Flagged for inspection'}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => {
                              const updated = reviewedEntries.filter((_, i) => i !== idx);
                              setReviewedEntries(updated);
                            }}
                            className="text-slate-400 hover:text-rose-600 p-1"
                            title="Remove class"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setParseResult(null)}
                      className="text-xs text-slate-500 hover:text-slate-800"
                    >
                      ← Upload different file
                    </button>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        disabled={publishing}
                        onClick={() => handlePublishTimetable(false)}
                        className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs"
                      >
                        Append to Existing
                      </button>
                      <button
                        type="button"
                        disabled={publishing}
                        onClick={() => handlePublishTimetable(true)}
                        className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                      >
                        {publishing ? 'Publishing...' : 'Replace & Publish Master Timetable'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SINGLE CLASS ADD / EDIT MODAL */}
      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="bg-[#0A2540] text-white p-5 flex items-center justify-between">
              <h2 className="text-base font-bold text-white">
                {editingClass ? 'Edit Class Slot' : 'Add Class Slot'}
              </h2>
              <button
                onClick={() => setIsClassModalOpen(false)}
                className="text-slate-300 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Machine Learning"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0A2540]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject Code</label>
                  <input
                    type="text"
                    placeholder="e.g. AI-301"
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Day of Week</label>
                  <select
                    value={day}
                    onChange={(e) => setDay(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs"
                  >
                    {daysList.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="text"
                    required
                    placeholder="08:30"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Time</label>
                  <input
                    type="text"
                    required
                    placeholder="10:00"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Instructor</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Tariq Mahmood"
                    value={instructor}
                    onChange={(e) => setInstructor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lecture Room / Lab</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lab 4 (AI Center)"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Program</label>
                  <select
                    value={programName}
                    onChange={(e) => setProgramName(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-xl border border-slate-300 bg-white text-xs"
                  >
                    <option value="BS Artificial Intelligence">BS AI</option>
                    <option value="BS Data Science">BS DS</option>
                    <option value="BS Computer Science">BS CS</option>
                    <option value="BS Software Engineering">BS SE</option>
                    <option value="BS Electrical Engineering">BS EE</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Semester</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-xl border border-slate-300 bg-white text-xs"
                  >
                    <option value="Semester 1">Sem 1</option>
                    <option value="Semester 2">Sem 2</option>
                    <option value="Semester 3">Sem 3</option>
                    <option value="Semester 4">Sem 4</option>
                    <option value="Semester 5">Sem 5</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Section</label>
                  <select
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-xl border border-slate-300 bg-white text-xs"
                  >
                    <option value="Section A">Sec A</option>
                    <option value="Section B">Sec B</option>
                    <option value="Section C">Sec C</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsClassModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs"
                >
                  Save Schedule Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
