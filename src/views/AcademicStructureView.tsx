import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AcademicDepartment, AcademicProgram, UserProfile } from '../types';
import { 
  subscribeDepartments, 
  subscribePrograms, 
  saveDepartment, 
  deleteDepartment, 
  saveProgram, 
  deleteProgram,
  subscribeAllUsers
} from '../services/campusService';
import { 
  Building2, 
  GraduationCap, 
  Plus, 
  Edit2, 
  Trash2, 
  Users, 
  BookOpen, 
  X, 
  CheckCircle2, 
  School,
  Search,
  Filter
} from 'lucide-react';

export const AcademicStructureView: React.FC = () => {
  const { userProfile, isOwner, canManageUsers } = useAuth();

  const [departments, setDepartments] = useState<AcademicDepartment[]>([]);
  const [programs, setPrograms] = useState<AcademicProgram[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [activeTab, setActiveTab] = useState<'departments' | 'programs' | 'cohorts'>('departments');

  // Modals
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<AcademicDepartment | null>(null);
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [deptHead, setDeptHead] = useState('');
  const [deptDescription, setDeptDescription] = useState('');

  const [isProgModalOpen, setIsProgModalOpen] = useState(false);
  const [editingProg, setEditingProg] = useState<AcademicProgram | null>(null);
  const [progName, setProgName] = useState('');
  const [progCode, setProgCode] = useState('');
  const [progDeptId, setProgDeptId] = useState('');
  const [progDuration, setProgDuration] = useState('4 Years');
  const [progDegreeLevel, setProgDegreeLevel] = useState<'Undergraduate' | 'Graduate' | 'Postgraduate'>('Undergraduate');

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsubDept = subscribeDepartments(setDepartments);
    const unsubProg = subscribePrograms(setPrograms);
    const unsubUsers = subscribeAllUsers(setUsers);
    return () => {
      unsubDept();
      unsubProg();
      unsubUsers();
    };
  }, []);

  // Department Handlers
  const handleOpenDeptModal = (dept?: AcademicDepartment) => {
    if (dept) {
      setEditingDept(dept);
      setDeptName(dept.name);
      setDeptCode(dept.code);
      setDeptHead(dept.headOfDepartment || '');
      setDeptDescription(dept.description || '');
    } else {
      setEditingDept(null);
      setDeptName('');
      setDeptCode('');
      setDeptHead('');
      setDeptDescription('');
    }
    setIsDeptModalOpen(true);
  };

  const handleSaveDept = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveDepartment({
        name: deptName.trim(),
        code: deptCode.trim().toUpperCase(),
        headOfDepartment: deptHead.trim() || undefined,
        description: deptDescription.trim() || undefined,
        isActive: true
      }, editingDept?.id);
      setIsDeptModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to save department.');
    }
  };

  const handleDeleteDept = async (id: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return;
    try {
      await deleteDepartment(id);
    } catch (err) {
      console.error(err);
    }
  };

  // Program Handlers
  const handleOpenProgModal = (prog?: AcademicProgram) => {
    if (prog) {
      setEditingProg(prog);
      setProgName(prog.name);
      setProgCode(prog.code);
      setProgDeptId(prog.departmentId);
      setProgDuration(prog.durationYears || '4 Years');
      setProgDegreeLevel(prog.degreeLevel || 'Undergraduate');
    } else {
      setEditingProg(null);
      setProgName('');
      setProgCode('');
      setProgDeptId(departments[0]?.code || 'AI');
      setProgDuration('4 Years');
      setProgDegreeLevel('Undergraduate');
    }
    setIsProgModalOpen(true);
  };

  const handleSaveProg = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parentDept = departments.find(d => d.code === progDeptId);
      await saveProgram({
        name: progName.trim(),
        code: progCode.trim().toUpperCase(),
        departmentId: progDeptId,
        departmentName: parentDept?.name || 'Department',
        durationYears: progDuration,
        degreeLevel: progDegreeLevel,
        isActive: true
      }, editingProg?.id);
      setIsProgModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to save degree program.');
    }
  };

  const handleDeleteProg = async (id: string) => {
    if (!confirm('Are you sure you want to delete this academic program?')) return;
    try {
      await deleteProgram(id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-[#0A2540] text-white p-6 sm:p-8 shadow-sm border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold mb-3 border border-white/10">
              <School className="w-3.5 h-3.5 text-emerald-400" />
              <span>PAF-IAST Academic Governance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Academic Departments & Degree Programs
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-xl leading-relaxed">
              Manage university faculties, accredited degree offerings, batches, and view student & faculty enrollments across departments.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => handleOpenDeptModal()}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/20 transition-all shadow-xs"
            >
              <Building2 className="w-4 h-4" />
              <span>Add Department</span>
            </button>
            <button
              onClick={() => handleOpenProgModal()}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-xs"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Add Degree Program</span>
            </button>
          </div>
        </div>

        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('departments')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'departments' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Departments ({departments.length})
          </button>
          <button
            onClick={() => setActiveTab('programs')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'programs' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Degree Programs ({programs.length})
          </button>
          <button
            onClick={() => setActiveTab('cohorts')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'cohorts' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Enrolled Cohorts
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search academic units..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
          />
        </div>
      </div>

      {/* TAB 1: DEPARTMENTS */}
      {activeTab === 'departments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments
            .filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.code.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((dept) => {
              const deptPrograms = programs.filter(p => p.departmentId === dept.code);
              const deptUsers = users.filter(u => u.department === dept.name || u.departmentId === dept.code);

              return (
                <div
                  key={dept.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-slate-300 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-1 rounded-lg bg-[#0A2540] text-white font-mono font-bold text-xs">
                        {dept.code}
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {deptPrograms.length} Programs
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900">{dept.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {dept.description || 'Core academic faculty at PAF-IAST.'}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <strong>{deptUsers.length}</strong> enrolled
                      </span>
                      <span className="text-[11px] text-slate-400">
                        HOD: {dept.headOfDepartment || 'Faculty Chair'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenDeptModal(dept)}
                      className="px-2.5 py-1 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteDept(dept.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg"
                      title="Delete department"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* TAB 2: DEGREE PROGRAMS */}
      {activeTab === 'programs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {programs
            .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.code.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((prog) => {
              const progUsers = users.filter(u => u.program === prog.name || u.programId === prog.code);

              return (
                <div
                  key={prog.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-slate-300 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-mono font-bold text-xs">
                        {prog.code}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        {prog.degreeLevel || 'Undergraduate'}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900">{prog.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Department: <strong>{prog.departmentName || prog.departmentId}</strong>
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <strong>{progUsers.length}</strong> active students
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        {prog.durationYears || '4 Years'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenProgModal(prog)}
                      className="px-2.5 py-1 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteProg(prog.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg"
                      title="Delete program"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* TAB 3: ENROLLED COHORTS DIRECTORY */}
      {activeTab === 'cohorts' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="pb-3 font-bold">User</th>
                  <th className="pb-3 font-bold">Roll / Student ID</th>
                  <th className="pb-3 font-bold">Department</th>
                  <th className="pb-3 font-bold">Degree Program</th>
                  <th className="pb-3 font-bold">Semester & Sec</th>
                  <th className="pb-3 font-bold">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.uid} className="hover:bg-slate-50/80">
                    <td className="py-3 pr-3">
                      <p className="font-bold text-slate-900">{u.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">@{u.username}</p>
                    </td>
                    <td className="py-3 font-mono text-slate-700">
                      {u.studentId || '—'}
                    </td>
                    <td className="py-3 text-slate-600">
                      {u.department || 'Computing'}
                    </td>
                    <td className="py-3 font-semibold text-slate-800">
                      {u.program || 'BS AI'}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                        {u.semester || 'Sem 3'} • {u.section || 'Sec A'}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                        {u.roles?.[0] || 'Student'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DEPARTMENT MODAL */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="bg-[#0A2540] text-white p-5 flex items-center justify-between">
              <h2 className="text-base font-bold text-white">
                {editingDept ? 'Edit Academic Department' : 'Add Academic Department'}
              </h2>
              <button
                onClick={() => setIsDeptModalOpen(false)}
                className="text-slate-300 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDept} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Artificial Intelligence & Computing"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0A2540]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI or CS"
                  value={deptCode}
                  onChange={(e) => setDeptCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Head of Department (HOD)</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Muhammad Tariq"
                  value={deptHead}
                  onChange={(e) => setDeptHead(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description / Focus</label>
                <textarea
                  rows={2}
                  placeholder="Faculty mission and laboratory specializations..."
                  value={deptDescription}
                  onChange={(e) => setDeptDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsDeptModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs"
                >
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROGRAM MODAL */}
      {isProgModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="bg-[#0A2540] text-white p-5 flex items-center justify-between">
              <h2 className="text-base font-bold text-white">
                {editingProg ? 'Edit Degree Program' : 'Add Degree Program'}
              </h2>
              <button
                onClick={() => setIsProgModalOpen(false)}
                className="text-slate-300 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProg} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Program Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BS Artificial Intelligence"
                  value={progName}
                  onChange={(e) => setProgName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0A2540]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Program Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BS-AI"
                    value={progCode}
                    onChange={(e) => setProgCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Parent Department</label>
                  <select
                    value={progDeptId}
                    onChange={(e) => setProgDeptId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.code}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Degree Level</label>
                  <select
                    value={progDegreeLevel}
                    onChange={(e) => setProgDegreeLevel(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs"
                  >
                    <option value="Undergraduate">Undergraduate (BS)</option>
                    <option value="Graduate">Graduate (MS/MPhil)</option>
                    <option value="Postgraduate">Postgraduate (PhD)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Duration</label>
                  <input
                    type="text"
                    value={progDuration}
                    onChange={(e) => setProgDuration(e.target.value)}
                    placeholder="4 Years (8 Semesters)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsProgModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs"
                >
                  Save Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
