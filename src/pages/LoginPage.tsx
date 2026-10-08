import React, { useState } from 'react';
import { NexGenLogo } from '../components/NexGenLogo';
import { useAuth } from '../context/AuthContext';
import { DarkModeToggle } from '../components/DarkModeToggle';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  KeyRound,
  X,
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onNavigateVerify: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onNavigateVerify }) => {
  const { login, sendPasswordReset, isRecoveryMode, updateUserPassword, setIsRecoveryMode, recoveryError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotError, setForgotError] = useState('');

  // Password recovery (Set new password) state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resettingPassword, setResettingPassword] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        onLoginSuccess();
      } else {
        setErrorMessage(result.error || 'Invalid credentials. Please verify your email and password.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMessage('');
    setForgotError('');
    setForgotLoading(true);

    try {
      const res = await sendPasswordReset(forgotEmail);
      if (res.success) {
        setForgotMessage(
          res.message || 'Password reset link sent! Please check your email inbox to reset your password.'
        );
      } else {
        setForgotError(res.error || 'Failed to dispatch password recovery email.');
      }
    } catch (err: any) {
      setForgotError(err.message || 'Failed to send reset link.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleUpdatePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');

    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match. Please re-enter.');
      return;
    }

    if (newPassword.length < 6) {
      setResetError('Password must be at least 6 characters long.');
      return;
    }

    setResettingPassword(true);
    try {
      const res = await updateUserPassword(newPassword);
      if (res.success) {
        setResetSuccess(true);
        setTimeout(() => {
          onLoginSuccess();
        }, 1500);
      } else {
        setResetError(res.error || 'Failed to update password.');
      }
    } catch (err: any) {
      setResetError(err.message || 'Error occurred while updating password.');
    } finally {
      setResettingPassword(false);
    }
  };

  const handleQuickDemoFill = () => {
    setEmail('admin@nexgen.com');
    setPassword('adminpassword123');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#0b1120] text-[#172033] dark:text-[#f1f5f9] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative transition-colors">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <DarkModeToggle variant="button" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        {/* Official NexGen Logo */}
        <div className="flex justify-center mb-5">
          <NexGenLogo size="xl" variant="official" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172033] dark:text-white tracking-tight">
          {isRecoveryMode ? 'Set New Password' : 'Admin Portal Login'}
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {isRecoveryMode
            ? 'Enter your new administrator password to regain access'
            : 'Enter authorized administrative credentials to manage students & certificates'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white dark:bg-gray-900 py-8 px-6 shadow-xl shadow-gray-200/50 dark:shadow-black/50 rounded-3xl border border-gray-100 dark:border-gray-800 sm:px-10">
          {/* Recovery Mode View (When admin clicks Supabase reset link in email) */}
          {isRecoveryMode ? (
            <div className="space-y-5">
              {resetSuccess && (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-[#5ACB00] shrink-0" />
                  <span className="font-bold">Password updated successfully! Redirecting...</span>
                </div>
              )}

              {resetError && (
                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex items-center gap-2.5 text-rose-800 dark:text-rose-300 text-sm">
                  <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span className="font-semibold">{resetError}</span>
                </div>
              )}

              <form onSubmit={handleUpdatePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    New Password
                  </label>
                  <div className="relative rounded-xl shadow-2xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="block w-full pl-10 pr-3.5 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#075A91]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative rounded-xl shadow-2xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="block w-full pl-10 pr-3.5 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#075A91]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={resettingPassword || resetSuccess}
                  className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#075A91] to-[#064B79] hover:from-[#064B79] hover:to-[#04385a] shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {resettingPassword ? 'Updating Password...' : 'Save Password & Sign In'}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setIsRecoveryMode(false)}
                    className="text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer"
                  >
                    Back to regular login
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Regular Sign In View */
            <>
              {recoveryError && (
                <div className="mb-5 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-sm">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                    <div className="flex-1">
                      <p className="font-bold">Password Reset Link Issue</p>
                      <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">{recoveryError}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotEmail(email || '');
                          setForgotMessage('');
                          setForgotError('');
                          setShowForgotModal(true);
                        }}
                        className="mt-2 text-xs font-bold text-[#075A91] dark:text-sky-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        Request a fresh password reset link &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="mb-5 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-850 flex items-start gap-3 text-rose-700 dark:text-rose-300 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                  <div>
                    <p className="font-semibold">Authentication Error</p>
                    <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">{errorMessage}</p>
                  </div>
                </div>
              )}

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    Admin Email
                  </label>
                  <div className="relative rounded-xl shadow-2xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@nexgen.com"
                      className="block w-full pl-10 pr-3.5 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-hidden focus:ring-2 focus:ring-[#075A91] focus:border-[#075A91] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(email || '');
                        setForgotMessage('');
                        setForgotError('');
                        setShowForgotModal(true);
                      }}
                      className="text-xs font-bold text-[#075A91] dark:text-sky-400 hover:text-[#5ACB00] transition-colors cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative rounded-xl shadow-2xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="block w-full pl-10 pr-3.5 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-hidden focus:ring-2 focus:ring-[#075A91] focus:border-[#075A91] transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#075A91] to-[#064B79] hover:from-[#064B79] hover:to-[#04385a] shadow-md shadow-[#075A91]/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  <span>{isLoading ? 'Signing in...' : 'Login'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick Demo Credentials shortcut */}
              <div className="mt-5 p-3 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300">
                  <Sparkles className="w-3.5 h-3.5 text-[#5ACB00]" />
                  <span className="font-medium">Default staff: <strong className="font-mono">admin@nexgen.com</strong></span>
                </div>
                <button
                  type="button"
                  onClick={handleQuickDemoFill}
                  className="text-xs font-bold text-[#075A91] dark:text-sky-400 hover:underline cursor-pointer"
                >
                  Auto-fill
                </button>
              </div>

              <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Looking to verify a student certificate?</p>
                <button
                  onClick={onNavigateVerify}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#075A91] dark:text-sky-400 hover:text-[#5ACB00] transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Go to Public Certificate Verification</span>
                </button>
              </div>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500">
          NexGen Technologies &bull; Technology and Language Learning Center
        </p>
      </div>

      {/* Forgot Password Modal (Integrated with Supabase Auth) */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 dark:border-gray-800 relative">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-5 right-5 p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#075A91] dark:text-blue-300 flex items-center justify-center">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white">Reset Admin Password</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Supabase Secure Recovery</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300 mt-4 leading-relaxed">
              Enter your registered administrator email address. We will send you an official
              Supabase password recovery link to reset your account password securely.
            </p>

            {forgotMessage ? (
              <div className="mt-4 space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-medium text-emerald-900 dark:text-emerald-200">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-[#5ACB00] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-sm text-emerald-900 dark:text-emerald-100 mb-1">Email Dispatched Successfully!</p>
                      <p className="leading-relaxed">{forgotMessage}</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-emerald-200/60 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 space-y-1">
                    <p>&bull; Check your Inbox and Spam/Junk folders.</p>
                    <p>&bull; Click the recovery link to return here and set your new password.</p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(false);
                      setForgotMessage('');
                    }}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-[#075A91] hover:bg-[#064B79] rounded-xl transition-colors cursor-pointer"
                  >
                    Done & Return to Login
                  </button>
                </div>
              </div>
            ) : (
              <>
                {forgotError && (
                  <div className="mt-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-800 dark:text-rose-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    <span>{forgotError}</span>
                  </div>
                )}

                <form onSubmit={handleForgotSubmit} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                      Administrator Email
                    </label>
                    <div className="relative rounded-xl shadow-2xs">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="admin@nexgen.com"
                        autoFocus
                        className="block w-full pl-10 pr-3.5 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#075A91] focus:outline-hidden"
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">
                      Must match an administrator account registered in Supabase Auth.
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className="px-4 py-2.5 text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#075A91] to-[#064B79] hover:from-[#064B79] hover:to-[#04385a] rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{forgotLoading ? 'Sending...' : 'Send Recovery Link'}</span>
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
