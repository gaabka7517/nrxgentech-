import React, { useState, useEffect } from 'react';
import { dataService } from '../services/dataService';
import { Course, SystemSettings, VerificationStatus } from '../types';
import { NexGenLogo } from '../components/NexGenLogo';
import { DarkModeToggle } from '../components/DarkModeToggle';
import { useAuth } from '../context/AuthContext';
import {
  getStoredSupabaseConfig,
  saveStoredSupabaseConfig,
  testSupabaseConnection,
} from '../lib/supabase';
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Database,
  Plus,
  Trash2,
  BookOpen,
  RotateCcw,
  Shield,
  KeyRound,
  Mail,
  Lock,
  Sparkles,
  ExternalLink,
  HelpCircle,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { userEmail, updateAdminCredentials, getCustomAdminEmail } = useAuth();

  const [settings, setSettings] = useState<SystemSettings>({
    certificate_prefix: 'NEX',
    default_status: 'VALID',
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [newCourseName, setNewCourseName] = useState('');

  // Supabase connection state
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Admin Account & Password State
  const [adminEmailInput, setAdminEmailInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');
  const [adminCredsMsg, setAdminCredsMsg] = useState('');
  const [adminCredsError, setAdminCredsError] = useState('');
  const [adminCredsLoading, setAdminCredsLoading] = useState(false);

  const [savedMessage, setSavedMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [currSettings, courseList] = await Promise.all([
        dataService.getSettings(),
        dataService.getCourses(),
      ]);
      setSettings(currSettings);
      setCourses(courseList);

      const cfg = getStoredSupabaseConfig();
      setSupabaseUrl(cfg.url);
      setSupabaseAnonKey(cfg.anonKey);

      // Preload current admin email
      const customEmail = getCustomAdminEmail();
      setAdminEmailInput(customEmail || userEmail || 'admin@nexgen.com');
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveAdminCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminCredsMsg('');
    setAdminCredsError('');

    if (!adminEmailInput.trim() || !adminEmailInput.includes('@')) {
      setAdminCredsError('Fadlan geli email sax ah (Valid Gmail/Email address).');
      return;
    }

    if (adminPasswordInput && adminPasswordInput.length < 6) {
      setAdminCredsError('Furaha sirta ah (Password) waa inuu ugu yaraan ka koobnaadaa 6 xaraf.');
      return;
    }

    if (adminPasswordInput && adminPasswordInput !== adminConfirmPassword) {
      setAdminCredsError('Labada password isku mid maaha (Passwords do not match).');
      return;
    }

    setAdminCredsLoading(true);
    try {
      const res = await updateAdminCredentials(
        adminEmailInput.trim(),
        adminPasswordInput ? adminPasswordInput.trim() : undefined
      );

      if (res.success) {
        setAdminCredsMsg(
          res.message || 'Xogta Admin-ka (Gmail & Password) si guul leh ayaa loo cusbooneysiiyey!'
        );
        setAdminPasswordInput('');
        setAdminConfirmPassword('');
        setTimeout(() => setAdminCredsMsg(''), 6000);
      } else {
        setAdminCredsError(res.error || 'Cilad ayaa dhacday.');
      }
    } catch (err: any) {
      setAdminCredsError(err.message || 'Cilad ayaa dhacday markii la keydinayay.');
    } finally {
      setAdminCredsLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMessage('');
    setErrorMessage('');

    try {
      await dataService.updateSettings({
        certificate_prefix: settings.certificate_prefix.trim().toUpperCase(),
        default_status: settings.default_status,
      });

      // Save Supabase credentials to local storage and reinit
      saveStoredSupabaseConfig(supabaseUrl, supabaseAnonKey);

      setSavedMessage('Settings successfully saved!');
      setTimeout(() => setSavedMessage(''), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update settings');
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testSupabaseConnection(supabaseUrl, supabaseAnonKey);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Connection test failed.' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName.trim()) return;

    try {
      await dataService.addCourse(newCourseName.trim());
      setNewCourseName('');
      const updated = await dataService.getCourses();
      setCourses(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to add course');
    }
  };

  const handleDeleteCourse = async (courseId: string, courseName: string) => {
    if (!window.confirm(`Delete course "${courseName}"?`)) return;

    try {
      await dataService.deleteCourse(courseId);
      const updated = await dataService.getCourses();
      setCourses(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to delete course');
    }
  };

  const handleResetData = async () => {
    if (
      !window.confirm(
        'Reset sample database to default state? This will restore standard demonstration records.'
      )
    )
      return;

    await dataService.resetDemoData();
    window.location.reload();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-black text-[#172033] dark:text-white">System Settings</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Configure admin credentials, branding, certificate prefixes, courses, appearance, and Supabase connection
        </p>
      </div>

      {savedMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-emerald-800 dark:text-emerald-300 text-sm">
          <CheckCircle2 className="w-5 h-5 text-[#5ACB00] shrink-0" />
          <span className="font-semibold">{savedMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex items-center gap-3 text-rose-800 dark:text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      {/* 1. Admin Account & Login Credentials Management */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#075A91] dark:text-sky-400 flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 dark:text-white">Admin Account & Login Details</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                U yeel Gmail-kaaga iyo Password-kaaga gaarka ah si aad adigu kaliya ugula soo gasho
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-[#075A91] dark:text-sky-300 px-3 py-1.5 rounded-full border border-blue-100 dark:border-blue-900/60">
            <KeyRound className="w-3.5 h-3.5 text-[#5ACB00]" />
            <span>Active Admin: {userEmail || 'admin@nexgen.com'}</span>
          </span>
        </div>

        {adminCredsMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3 text-emerald-800 dark:text-emerald-200 text-xs">
            <CheckCircle2 className="w-5 h-5 text-[#5ACB00] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-emerald-900 dark:text-emerald-100 mb-0.5">Guul!</p>
              <p>{adminCredsMsg}</p>
            </div>
          </div>
        )}

        {adminCredsError && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex items-center gap-3 text-rose-800 dark:text-rose-200 text-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            <span className="font-semibold">{adminCredsError}</span>
          </div>
        )}

        {/* Form to change admin credentials */}
        <form onSubmit={handleSaveAdminCredentials} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                Admin Gmail / Email
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={adminEmailInput}
                  onChange={(e) => setAdminEmailInput(e.target.value)}
                  placeholder="tusaale@gmail.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-[#075A91]"
                />
              </div>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                Email-ka aad u isticmaali doonto login-ka
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                Password Cusub
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  placeholder="Furahaaga cusub (ugu yaraan 6)"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-[#075A91]"
                />
              </div>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                Kaga tag banaan haddii aadan rabin inaad beddesho furaha
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                Xaqiiji Password-ka
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={adminConfirmPassword}
                  onChange={(e) => setAdminConfirmPassword(e.target.value)}
                  placeholder="Ku celi furahaaga cusub"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-[#075A91]"
                />
              </div>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                Ku celi furaha si loo hubiyo
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={adminCredsLoading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#075A91] to-[#064B79] hover:from-[#064B79] hover:to-[#04385a] text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4" />
              <span>{adminCredsLoading ? 'Keydinayaa...' : 'Keydi Gmail-ka & Password-ka'}</span>
            </button>
          </div>
        </form>

        {/* Helpful instructions on Supabase and Vercel for Permanent Cloud Auth */}
        <div className="mt-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-800 dark:text-gray-200">
            <HelpCircle className="w-4 h-4 text-[#075A91] dark:text-sky-400" />
            <span>Sida loogu xiro Supabase Auth (Si aad mobilo iyo computer kasta ugula gasho):</span>
          </div>
          <ol className="text-xs text-gray-600 dark:text-gray-400 space-y-1.5 list-decimal list-inside leading-relaxed pl-1">
            <li>
              Gal <strong><a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-[#075A91] dark:text-sky-400 underline">supabase.com</a></strong> &rarr; Mashruucaaga <strong>sysvwhhltlokppdtdmbl</strong>.
            </li>
            <li>
              Dhinaca bidix guji <strong>Authentication</strong> &rarr; kadibna <strong>Users</strong>.
            </li>
            <li>
              Riix badhanka cagaaran ama buluugga ah ee <strong>Add user</strong> &rarr; dooro <strong>Create user</strong>.
            </li>
            <li>
              Geli Gmail-kaaga (tusaale <strong>abdiwahab7517@gmail.com</strong>) iyo <strong>Password-ka aad rabto</strong>, hubi in <em>Auto Confirm User</em> ay shidan tahay, kadibna guji <strong>Create user</strong>.
            </li>
          </ol>
        </div>
      </div>

      {/* Theme & Appearance Card */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs p-6 sm:p-8">
        <h2 className="text-lg font-black text-[#172033] dark:text-white mb-4">Appearance & Display</h2>
        <DarkModeToggle variant="switch" />
      </div>

      {/* Brand & System Information Card */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-100 dark:border-gray-800">
          <NexGenLogo size="xl" variant="official" />
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-black text-[#172033] dark:text-white">NEXGEN TECHNOLOGIES</h2>
            <p className="text-xs font-bold text-[#075A91] dark:text-sky-400 mt-0.5">
              Technology & Language Learning Center
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Official Certificate Management and Verification Platform
            </p>
          </div>
        </div>

        {/* Certificate Prefix & Default Status Form */}
        <form onSubmit={handleSaveSettings} className="mt-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                Certificate Prefix
              </label>
              <input
                type="text"
                required
                value={settings.certificate_prefix}
                onChange={(e) =>
                  setSettings({ ...settings, certificate_prefix: e.target.value.toUpperCase() })
                }
                placeholder="NEX"
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-sm font-mono uppercase focus:ring-2 focus:ring-[#075A91] font-bold text-[#075A91] dark:text-sky-400"
              />
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1.5">
                Certificates are generated as: <strong>{settings.certificate_prefix}-2026-0001</strong>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                Default Certificate Status
              </label>
              <select
                value={settings.default_status}
                onChange={(e) =>
                  setSettings({ ...settings, default_status: e.target.value as VerificationStatus })
                }
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-[#075A91] text-gray-900 dark:text-white font-semibold cursor-pointer"
              >
                <option value="VALID">VALID (Recommended)</option>
                <option value="REVOKED">REVOKED</option>
              </select>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1.5">
                Initial verification status applied to newly uploaded certificates.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#075A91] hover:bg-[#064B79] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save System Settings</span>
            </button>
          </div>
        </form>
      </div>

      {/* Course Management Card */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#5ACB00] flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 dark:text-white">Manage Courses</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Add and customize learning programs available for student enrollment
              </p>
            </div>
          </div>
          <span className="text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-full">
            {courses.length} Courses
          </span>
        </div>

        {/* Add Course Form */}
        <form onSubmit={handleAddCourse} className="flex gap-2">
          <input
            type="text"
            value={newCourseName}
            onChange={(e) => setNewCourseName(e.target.value)}
            placeholder="Enter new course title (e.g. Python Programming)..."
            className="flex-1 px-4 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-[#075A91]"
          />
          <button
            type="submit"
            className="px-5 py-2.5 text-xs font-bold text-white bg-[#5ACB00] hover:bg-[#4eb000] rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Course</span>
          </button>
        </form>

        {/* Course Chips List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-2">
          {courses.map((course) => (
            <div
              key={course.id}
              className="p-3 bg-gray-50 dark:bg-gray-800/80 rounded-xl border border-gray-200/70 dark:border-gray-700 flex items-center justify-between text-xs font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
            >
              <span className="truncate pr-2 font-bold">{course.name}</span>
              <button
                type="button"
                onClick={() => handleDeleteCourse(course.id, course.name)}
                className="text-gray-400 hover:text-rose-600 p-1 rounded-lg transition-colors cursor-pointer"
                title="Delete Course"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Supabase Free Tier Configuration Card */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#075A91] dark:text-blue-300 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 dark:text-white">Supabase Database Integration</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Connect your free Supabase PostgreSQL database & Storage bucket
              </p>
            </div>
          </div>
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full ${
              supabaseUrl && supabaseAnonKey
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-[#5ACB00] border border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
            }`}
          >
            {supabaseUrl && supabaseAnonKey ? 'Custom Supabase Linked' : 'Local / Offline Mode Active'}
          </span>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
          The system works out-of-the-box with persistent local storage. To connect your cloud-hosted
          Supabase Free Tier project, paste your project URL and Anon Key below. SQL schema is ready in{' '}
          <code className="text-[#075A91] dark:text-sky-300 bg-blue-50 dark:bg-blue-950/60 px-1 py-0.5 rounded font-mono">
            supabase/schema.sql
          </code>
          .
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
              Supabase Project URL
            </label>
            <input
              type="text"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              placeholder="https://xyzcompany.supabase.co"
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl text-xs font-mono focus:ring-2 focus:ring-[#075A91]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
              Supabase Anon Key
            </label>
            <input
              type="password"
              value={supabaseAnonKey}
              onChange={(e) => setSupabaseAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl text-xs font-mono focus:ring-2 focus:ring-[#075A91]"
            />
          </div>

          {testResult && (
            <div
              className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                testResult.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-[#5ACB00]" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              disabled={isTesting}
              onClick={handleTestConnection}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#075A91] dark:text-sky-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors cursor-pointer"
            >
              {isTesting ? 'Testing connection...' : 'Test Connection'}
            </button>
            <button
              type="button"
              onClick={handleSaveSettings}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#075A91] hover:bg-[#064B79] transition-colors cursor-pointer"
            >
              Save Credentials
            </button>
          </div>
        </div>
      </div>

      {/* Database Maintenance & Reset */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs p-6 sm:p-8 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-gray-900 dark:text-white">Reset Demo Database</h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            Reset database records to the default verified sample certificates (Abdiwahab Ahmed, etc.)
          </p>
        </div>
        <button
          onClick={handleResetData}
          type="button"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-xl transition-colors cursor-pointer border border-rose-100 dark:border-rose-900/40"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo Records</span>
        </button>
      </div>
    </div>
  );
};
