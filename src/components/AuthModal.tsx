import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LogIn, 
  UserPlus, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  User, 
  Lock, 
  BookOpen, 
  Building2,
  GraduationCap
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { 
    loginWithGoogle, 
    loginWithUsername, 
    registerUser, 
    needsUsernameModal, 
    submitGoogleUsername 
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [program, setProgram] = useState('BS Computer Science');
  const [semester, setSemester] = useState('1st Semester');

  // Google username completion state
  const [googleUsername, setGoogleUsername] = useState('');
  const [googleDept, setGoogleDept] = useState('Computer Science');
  const [googleProgram, setGoogleProgram] = useState('BS Computer Science');
  const [googleSem, setGoogleSem] = useState('1st Semester');

  if (!isOpen && !needsUsernameModal) return null;

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      if (!needsUsernameModal) {
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await loginWithUsername(username, password);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!username.trim() || username.length < 3) {
      setError('Username must be at least 3 characters (letters, numbers, underscore)');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await registerUser({
        name,
        username,
        password,
        email,
        department,
        program,
        semester
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!googleUsername.trim() || googleUsername.length < 3) {
      setError('Please choose a valid unique username (at least 3 characters)');
      return;
    }
    setLoading(true);
    try {
      await submitGoogleUsername(googleUsername, googleDept, googleProgram, googleSem);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to complete profile');
    } finally {
      setLoading(false);
    }
  };

  // If user signed in via Google and needs to select unique username
  if (needsUsernameModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 p-6">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white mx-auto mb-3 shadow-md shadow-indigo-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Complete Campus Profile</h2>
            <p className="text-xs text-slate-500 mt-1">
              Select your unique campus username and academic details to finalize registration.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleGoogleComplete} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Unique Campus Username *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">@</span>
                <input
                  type="text"
                  required
                  placeholder="e.g. john_doe"
                  value={googleUsername}
                  onChange={(e) => setGoogleUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Lowercase letters, numbers, and underscores only</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  value={googleDept}
                  onChange={(e) => setGoogleDept(e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Semester</label>
                <input
                  type="text"
                  value={googleSem}
                  onChange={(e) => setGoogleSem(e.target.value)}
                  placeholder="e.g. 3rd Semester"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {loading ? 'Finalizing Profile...' : 'Enter Connect Campus'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-b from-indigo-50/50 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-800">Connect Campus</h3>
              <p className="text-[11px] text-slate-500">Real-Time University System</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switchers: Login / Register */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 py-2.5 text-xs font-bold transition-colors ${
              mode === 'login'
                ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setMode('register'); setError(null); }}
            className={`flex-1 py-2.5 text-xs font-bold transition-colors ${
              mode === 'register'
                ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Register Account
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign-in Option */}
          <div>
            <button
              id="btn-auth-google"
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl border border-slate-300 shadow-xs transition-colors"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.67v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.16z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.94H1.26v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.26c-.25-.72-.38-1.49-.38-2.26s.13-1.54.38-2.26V6.59H1.26C.46 8.19 0 10.03 0 12s.46 3.81 1.26 5.41l4.02-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.26 6.59l4.02 3.15c.95-2.84 3.6-4.99 6.72-4.99z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
            <p className="text-[10px] text-center text-slate-400 mt-1">
              Permanent Owner: sanaullahmawia980@gmail.com
            </p>
          </div>

          <div className="flex items-center my-3">
            <div className="flex-1 border-t border-slate-200"></div>
            <span className="px-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider">or with username</span>
            <div className="flex-1 border-t border-slate-200"></div>
          </div>

          {/* Form: Login or Register */}
          {mode === 'login' ? (
            <form onSubmit={handleUsernameLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Username or Email
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    id="input-login-username"
                    type="text"
                    required
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    id="input-login-password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <button
                id="btn-submit-login"
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  id="input-reg-name"
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Unique Username *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-bold text-sm">@</span>
                  <input
                    id="input-reg-username"
                    type="text"
                    required
                    placeholder="alex_cs"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Unique handle for chat and identification</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
                <input
                  id="input-reg-password"
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Semester</label>
                  <input
                    type="text"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <button
                id="btn-submit-register"
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-90 text-white font-semibold text-sm rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>{loading ? 'Creating Account...' : 'Register as Student'}</span>
              </button>
            </form>
          )}

          {/* Testing info box for dual-account verification */}
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            <span className="font-semibold text-slate-700">Multi-Account Real-Time Testing:</span>
            <p className="mt-0.5 text-slate-400">
              Open another tab or incognito window to sign in with a different username or Google account. Watch notices, chats, timetables, and roles update instantly!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
