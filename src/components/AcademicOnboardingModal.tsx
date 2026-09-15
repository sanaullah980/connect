import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscribeDepartments, subscribePrograms } from '../services/campusService';
import { AcademicDepartment, AcademicProgram } from '../types';
import { 
  GraduationCap, 
  User, 
  Building2, 
  BookOpen, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles,
  School,
  AlertCircle
} from 'lucide-react';

interface AcademicOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AcademicOnboardingModal: React.FC<AcademicOnboardingModalProps> = ({
  isOpen,
  onClose
}) => {
  const { userProfile, updateAcademicProfile } = useAuth();
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [departments, setDepartments] = useState<AcademicDepartment[]>([]);
  const [programs, setPrograms] = useState<AcademicProgram[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState(userProfile?.name || '');
  const [studentId, setStudentId] = useState(userProfile?.studentId || '');
  const [institution, setInstitution] = useState(userProfile?.institution || 'PAF-IAST');
  const [campus, setCampus] = useState(userProfile?.campus || 'Main Campus, Mang (Haripur)');
  const [departmentId, setDepartmentId] = useState(userProfile?.departmentId || 'AI');
  const [departmentName, setDepartmentName] = useState(userProfile?.department || 'Artificial Intelligence');
  const [programId, setProgramId] = useState(userProfile?.programId || 'BS-AI');
  const [programName, setProgramName] = useState(userProfile?.program || 'BS Artificial Intelligence');
  const [batch, setBatch] = useState(userProfile?.batch || '2024');
  const [academicYear, setAcademicYear] = useState(userProfile?.academicYear || '2025-2026');
  const [semester, setSemester] = useState(userProfile?.semester || 'Semester 3');
  const [section, setSection] = useState(userProfile?.section || 'Section A');

  useEffect(() => {
    const unsubDept = subscribeDepartments((list) => {
      setDepartments(list);
      if (list.length > 0 && !departmentName) {
        setDepartmentId(list[0].code);
        setDepartmentName(list[0].name);
      }
    });

    const unsubProg = subscribePrograms((list) => {
      setPrograms(list);
      if (list.length > 0 && !programName) {
        setProgramId(list[0].code);
        setProgramName(list[0].name);
      }
    });

    return () => {
      unsubDept();
      unsubProg();
    };
  }, []);

  useEffect(() => {
    if (userProfile) {
      if (userProfile.name) setName(userProfile.name);
      if (userProfile.studentId) setStudentId(userProfile.studentId);
      if (userProfile.department) setDepartmentName(userProfile.department);
      if (userProfile.departmentId) setDepartmentId(userProfile.departmentId);
      if (userProfile.program) setProgramName(userProfile.program);
      if (userProfile.programId) setProgramId(userProfile.programId);
      if (userProfile.batch) setBatch(userProfile.batch);
      if (userProfile.semester) setSemester(userProfile.semester);
      if (userProfile.section) setSection(userProfile.section);
    }
  }, [userProfile]);

  if (!isOpen) return null;

  const handleDepartmentChange = (deptCode: string) => {
    setDepartmentId(deptCode);
    const found = departments.find(d => d.code === deptCode);
    if (found) {
      setDepartmentName(found.name);
    }
    // Filter programs matching department
    const matchingPrograms = programs.filter(p => p.departmentId === deptCode);
    if (matchingPrograms.length > 0) {
      setProgramId(matchingPrograms[0].code);
      setProgramName(matchingPrograms[0].name);
    }
  };

  const handleProgramChange = (progCode: string) => {
    setProgramId(progCode);
    const found = programs.find(p => p.code === progCode);
    if (found) {
      setProgramName(found.name);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      await updateAcademicProfile({
        name: name.trim(),
        studentId: studentId.trim(),
        institution,
        campus,
        department: departmentName,
        departmentId,
        program: programName,
        programId,
        batch,
        academicYear,
        semester,
        section,
        isProfileComplete: true,
        updatedAt: new Date().toISOString()
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save academic profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with PAF Navy Theme */}
        <div className="bg-[#0A2540] text-white p-6 relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center border border-white/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  PAF-IAST
                </span>
                <span className="text-xs text-slate-300">Student & Faculty Onboarding</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white mt-1">
                Complete Your Academic Profile
              </h2>
            </div>
          </div>

          <p className="text-xs text-slate-300 mt-2.5">
            Your academic details automatically personalize your timetable, targeted official notices, class groups, and course materials.
          </p>

          {/* Stepper Indicators */}
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/10 text-xs">
            <div className={`flex items-center gap-2 ${step === 1 ? 'text-white font-bold' : 'text-slate-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 1 ? 'bg-white text-[#0A2540]' : 'bg-white/10 text-slate-300'}`}>
                1
              </span>
              <span>Identity</span>
            </div>
            <div className="w-8 h-0.5 bg-white/20"></div>
            <div className={`flex items-center gap-2 ${step === 2 ? 'text-white font-bold' : 'text-slate-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 2 ? 'bg-white text-[#0A2540]' : 'bg-white/10 text-slate-300'}`}>
                2
              </span>
              <span>Institution</span>
            </div>
            <div className="w-8 h-0.5 bg-white/20"></div>
            <div className={`flex items-center gap-2 ${step === 3 ? 'text-white font-bold' : 'text-slate-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 3 ? 'bg-white text-[#0A2540]' : 'bg-white/10 text-slate-300'}`}>
                3
              </span>
              <span>Class & Section</span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: IDENTITY */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Muhammad Hamza"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0A2540] text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  University Roll No / Student ID
                </label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. 2024-BSAI-042 or Faculty ID"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0A2540] text-sm font-mono"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Used for verified student verification and departmental rosters.
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                <span className="font-semibold text-slate-800">Account Username: </span>
                <span className="font-mono text-indigo-600">@{userProfile?.username || 'user'}</span>
                <p className="mt-1 text-[11px] text-slate-500">
                  Unique handle associated with your Connect PAF campus login.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: INSTITUTION & CAMPUS */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Higher Education Institution
                </label>
                <input
                  type="text"
                  value={institution}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm font-medium"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Pak-Austria Fachhochschule: Institute of Applied Sciences & Technology
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Campus Location
                </label>
                <input
                  type="text"
                  value={campus}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm font-medium"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Khanpur Road, Mang, Haripur, Khyber Pakhtunkhwa
                </span>
              </div>

              <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl flex items-start gap-3">
                <School className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900">
                  <p className="font-bold">PAF-IAST Verified Campus Network</p>
                  <p className="text-blue-800/80 mt-0.5">
                    Connect PAF coordinates university timetables, subject groups, and institutional announcements across all university academic blocks.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: DEPARTMENT, PROGRAM, BATCH, SEMESTER & SECTION */}
          {step === 3 && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Academic Department
                  </label>
                  <select
                    value={departmentId}
                    onChange={(e) => handleDepartmentChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0A2540] text-sm bg-white"
                  >
                    <option value="AI">Artificial Intelligence</option>
                    <option value="DS">Data Science</option>
                    <option value="CS">Computer Science</option>
                    <option value="SE">Software Engineering</option>
                    <option value="EE">Electrical Engineering</option>
                    <option value="ME">Mechanical Engineering</option>
                    <option value="CHE">Chemical Engineering</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.code}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Degree Program
                  </label>
                  <select
                    value={programName}
                    onChange={(e) => {
                      setProgramName(e.target.value);
                      const found = programs.find(p => p.name === e.target.value);
                      if (found) setProgramId(found.code);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0A2540] text-sm bg-white"
                  >
                    <option value="BS Artificial Intelligence">BS Artificial Intelligence</option>
                    <option value="BS Data Science">BS Data Science</option>
                    <option value="BS Computer Science">BS Computer Science</option>
                    <option value="BS Software Engineering">BS Software Engineering</option>
                    <option value="BS Electrical Engineering">BS Electrical Engineering</option>
                    <option value="MS Data Science">MS Data Science</option>
                    <option value="MS Artificial Intelligence">MS Artificial Intelligence</option>
                    {programs.map((p) => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Batch
                  </label>
                  <select
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Academic Year
                  </label>
                  <select
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    <option value="2025-2026">2025-2026</option>
                    <option value="2026-2027">2026-2027</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Semester
                  </label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-sm bg-white font-medium"
                  >
                    <option value="Semester 1">Semester 1</option>
                    <option value="Semester 2">Semester 2</option>
                    <option value="Semester 3">Semester 3</option>
                    <option value="Semester 4">Semester 4</option>
                    <option value="Semester 5">Semester 5</option>
                    <option value="Semester 6">Semester 6</option>
                    <option value="Semester 7">Semester 7</option>
                    <option value="Semester 8">Semester 8</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Section
                  </label>
                  <select
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-sm bg-white font-bold"
                  >
                    <option value="Section A">Section A</option>
                    <option value="Section B">Section B</option>
                    <option value="Section C">Section C</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Targeting set: <strong>{programName} • {semester} • {section}</strong>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium text-xs flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div></div>
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3)}
              className="px-5 py-2 rounded-xl bg-[#0A2540] text-white hover:bg-[#12365c] font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-all"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Saving Profile...' : 'Save & Open Dashboard'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
