import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSupabase } from '../lib/supabase';

interface AuthContextType {
  isAuthenticated: boolean;
  userEmail: string | null;
  isLoading: boolean;
  isRecoveryMode: boolean;
  recoveryError: string | null;
  setIsRecoveryMode: (active: boolean) => void;
  setRecoveryError: (err: string | null) => void;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  updateUserPassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  updateAdminCredentials: (
    email: string,
    password?: string
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
  getCustomAdminEmail: () => string | null;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_AUTH_KEY = 'nexgen_admin_session';
const CUSTOM_ADMIN_CREDS_KEY = 'nexgen_custom_admin_credentials';

interface StoredAdminCreds {
  email: string;
  passwordHash?: string;
  updatedAt: number;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [recoveryError, setRecoveryError] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash || '';
      const search = window.location.search || '';
      const params = new URLSearchParams(hash.startsWith('#') ? hash.substring(1) : search);
      const errDesc = params.get('error_description');
      const errCode = params.get('error_code');
      if (errDesc) {
        return decodeURIComponent(errDesc.replace(/\+/g, ' '));
      }
      if (errCode) {
        return `Password recovery link error: ${errCode}`;
      }
    }
    return null;
  });

  const [isRecoveryMode, setIsRecoveryMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    return (
      hash.includes('type=recovery') ||
      search.includes('type=recovery')
    );
  });

  useEffect(() => {
    // Check initial session
    const checkSession = async () => {
      try {
        const sb = getSupabase();
        if (sb) {
          const { data } = await sb.auth.getSession();
          if (data.session) {
            setIsAuthenticated(true);
            setUserEmail(data.session.user.email || 'Admin');
            setIsLoading(false);
            return;
          }
        }

        // Check local persisted admin session
        const stored = localStorage.getItem(LOCAL_AUTH_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.email) {
            setIsAuthenticated(true);
            setUserEmail(parsed.email);
          }
        }
      } catch (err) {
        console.error('Session check error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen to Supabase Auth state changes if client exists
    const sb = getSupabase();
    if (sb) {
      const { data: authListener } = sb.auth.onAuthStateChange(async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setIsRecoveryMode(true);
        }
        if (session) {
          setIsAuthenticated(true);
          setUserEmail(session.user.email || 'Admin');
        } else {
          const stored = localStorage.getItem(LOCAL_AUTH_KEY);
          if (!stored) {
            setIsAuthenticated(false);
            setUserEmail(null);
          }
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  const getCustomAdminEmail = (): string | null => {
    try {
      const raw = localStorage.getItem(CUSTOM_ADMIN_CREDS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredAdminCreds;
        return parsed.email || null;
      }
    } catch (e) {
      console.warn('Failed to parse custom admin credentials', e);
    }
    return null;
  };

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (!cleanEmail || !cleanPass) {
      return { success: false, error: 'Please enter both email and password.' };
    }

    // 1. Try Supabase Auth if configured and user is in Supabase
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPass,
        });

        if (!error && data.session) {
          setIsAuthenticated(true);
          setUserEmail(data.session.user.email || cleanEmail);
          localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify({ email: cleanEmail, timestamp: Date.now() }));
          return { success: true };
        }
      } catch (err: any) {
        console.warn('Supabase auth attempt failed, checking credentials:', err);
      }
    }

    // 2. Check Custom Local Admin Credentials (configured by administrator in Settings)
    let hasCustomCreds = false;
    try {
      const rawCustom = localStorage.getItem(CUSTOM_ADMIN_CREDS_KEY);
      if (rawCustom) {
        const customCreds = JSON.parse(rawCustom) as StoredAdminCreds;
        if (customCreds.email) {
          hasCustomCreds = true;
          if (customCreds.email.toLowerCase() === cleanEmail) {
            if (customCreds.passwordHash && customCreds.passwordHash === cleanPass) {
              setIsAuthenticated(true);
              setUserEmail(customCreds.email);
              localStorage.setItem(
                LOCAL_AUTH_KEY,
                JSON.stringify({ email: customCreds.email, timestamp: Date.now() })
              );
              return { success: true };
            }
          }
        }
      }
    } catch (e) {
      console.warn('Error verifying custom admin credentials', e);
    }

    // 3. Environment Variable / Default Admin Credentials (only if custom admin not configured)
    if (!hasCustomCreds) {
      const defaultAdminEmail = (import.meta.env.VITE_ADMIN_DEFAULT_EMAIL || 'admin@nexgen.com').toLowerCase();
      const defaultAdminPass = import.meta.env.VITE_ADMIN_DEFAULT_PASSWORD || 'adminpassword123';

      if (cleanEmail === defaultAdminEmail && cleanPass === defaultAdminPass) {
        setIsAuthenticated(true);
        setUserEmail(cleanEmail);
        localStorage.setItem(
          LOCAL_AUTH_KEY,
          JSON.stringify({ email: cleanEmail, timestamp: Date.now() })
        );
        return { success: true };
      }
    }

    return {
      success: false,
      error: 'Email ama Password-ka waa khalad. Fadlan hubi xogtaada ama ku gal Supabase / Settings credentials.',
    };
  };

  const updateAdminCredentials = async (
    newEmail: string,
    newPassword?: string
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    const cleanEmail = newEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Fadlan geli email sax ah (Valid email address).' };
    }

    if (newPassword && newPassword.length < 6) {
      return { success: false, error: 'Furaha sirta ah (Password) waa inuu ka koobnaadaa ugu yaraan 6 xaraf.' };
    }

    try {
      const existingRaw = localStorage.getItem(CUSTOM_ADMIN_CREDS_KEY);
      let existing: Partial<StoredAdminCreds> = {};
      if (existingRaw) {
        try {
          existing = JSON.parse(existingRaw);
        } catch {}
      }

      const updatedCreds: StoredAdminCreds = {
        email: cleanEmail,
        passwordHash: newPassword || existing.passwordHash || 'admin123',
        updatedAt: Date.now(),
      };

      localStorage.setItem(CUSTOM_ADMIN_CREDS_KEY, JSON.stringify(updatedCreds));

      // Also update currently active session if authenticated
      setUserEmail(cleanEmail);
      localStorage.setItem(
        LOCAL_AUTH_KEY,
        JSON.stringify({ email: cleanEmail, timestamp: Date.now() })
      );

      // If Supabase user is logged in and new password provided, try to update Supabase password too
      const sb = getSupabase();
      if (sb && newPassword) {
        try {
          await sb.auth.updateUser({ password: newPassword });
        } catch (sbErr) {
          console.warn('Could not update Supabase password directly:', sbErr);
        }
      }

      return {
        success: true,
        message: 'Admin Gmail-ka iyo Password-ka cusub si guul leh ayaa loo keydiyey!',
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to save admin credentials.' };
    }
  };

  const sendPasswordReset = async (
    email: string
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, error: 'Fadlan geli email-kaaga (Please enter your email).' };
    }

    const sb = getSupabase();
    if (sb) {
      try {
        const redirectUrl = `${window.location.origin}/login#type=recovery`;
        const { error } = await sb.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: redirectUrl,
        });

        if (!error) {
          return {
            success: true,
            message: `Password reset link ayaa loo diray ${cleanEmail}. Fadlan ka eeg sanduuqaaga fariimaha (Inbox/Spam).`,
          };
        } else {
          return {
            success: false,
            error: error.message || 'Failed to send password reset email. Please try again.',
          };
        }
      } catch (err: any) {
        console.warn('Supabase password reset failed:', err);
      }
    }

    // Local fallback message
    return {
      success: true,
      message: `If an account with ${cleanEmail} exists, password reset instructions have been dispatched. Please check your inbox.`,
    };
  };

  const updateUserPassword = async (
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    const sb = getSupabase();
    if (sb) {
      try {
        const { error } = await sb.auth.updateUser({ password: newPassword });
        if (!error) {
          setIsRecoveryMode(false);
          setRecoveryError(null);
          if (window.history.replaceState) {
            window.history.replaceState(null, '', window.location.pathname);
          }
          return { success: true };
        } else {
          return { success: false, error: error.message || 'Failed to update password.' };
        }
      } catch (err: any) {
        return { success: false, error: err.message || 'Error updating password.' };
      }
    }

    // Local fallback
    setIsRecoveryMode(false);
    setRecoveryError(null);
    return { success: true };
  };

  const logout = async () => {
    try {
      const sb = getSupabase();
      if (sb) {
        await sb.auth.signOut();
      }
    } catch (err) {
      console.warn('Supabase sign out error:', err);
    }
    localStorage.removeItem(LOCAL_AUTH_KEY);
    setIsAuthenticated(false);
    setUserEmail(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userEmail,
        isLoading,
        isRecoveryMode,
        recoveryError,
        setIsRecoveryMode,
        setRecoveryError,
        login,
        sendPasswordReset,
        updateUserPassword,
        updateAdminCredentials,
        getCustomAdminEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
