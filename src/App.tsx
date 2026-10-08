import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { DarkModeToggle } from './components/DarkModeToggle';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { StudentsPage } from './pages/StudentsPage';
import { StudentNewPage } from './pages/StudentNewPage';
import { CertificatesPage } from './pages/CertificatesPage';
import { CertificateUploadPage } from './pages/CertificateUploadPage';
import { CertificateDetailPage } from './pages/CertificateDetailPage';
import { PublicVerifyPage } from './pages/PublicVerifyPage';
import { SettingsPage } from './pages/SettingsPage';
import { Student } from './types';

function AppContent() {
  const { isAuthenticated, isLoading, isRecoveryMode } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/dashboard';
  });

  // Auxiliary navigation state
  const [activeCertificateId, setActiveCertificateId] = useState<string | null>(null);
  const [studentForUpload, setStudentForUpload] = useState<Student | null>(null);

  // Sync with browser history
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
  };

  // Extract route parameters
  const verifyMatch = currentPath.match(/^\/verify(?:\/(.+))?$/);
  const isVerifyRoute = Boolean(verifyMatch);
  const verifyCertNumber = verifyMatch && verifyMatch[1] ? decodeURIComponent(verifyMatch[1]) : '';

  const certDetailMatch = currentPath.match(/^\/certificates\/([a-zA-Z0-9_-]+)$/);
  const isCertDetailRoute = Boolean(certDetailMatch) && currentPath !== '/certificates/upload';
  const certDetailId = certDetailMatch ? certDetailMatch[1] : activeCertificateId;

  // 1. Loading screen while auth initializes
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#075A91] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold text-gray-700">Loading NexGen Certificate System...</p>
      </div>
    );
  }

  // 2. PUBLIC ROUTE: /verify and /verify/:certificateNumber (No auth required)
  if (isVerifyRoute) {
    return (
      <PublicVerifyPage
        initialCertNumber={verifyCertNumber}
        onNavigateLogin={() => navigateTo('/login')}
      />
    );
  }

  // 3. PASSWORD RECOVERY ROUTE: If user entered via Supabase password reset link
  if (isRecoveryMode) {
    return (
      <LoginPage
        onLoginSuccess={() => navigateTo('/dashboard')}
        onNavigateVerify={() => navigateTo('/verify')}
      />
    );
  }

  // 4. AUTHENTICATION CHECK: If not logged in and not public verify, show Login
  if (!isAuthenticated) {
    return (
      <LoginPage
        onLoginSuccess={() => navigateTo('/dashboard')}
        onNavigateVerify={() => navigateTo('/verify')}
      />
    );
  }

  // 4. If logged in and on /login or root /, redirect to dashboard
  if (currentPath === '/login' || currentPath === '/') {
    return (
      <Layout activeRoute="/dashboard" onRouteChange={navigateTo}>
        <DashboardPage
          onNavigate={navigateTo}
          onViewCertificate={(id) => {
            setActiveCertificateId(id);
            navigateTo(`/certificates/${id}`);
          }}
          onPublicVerify={(num) => navigateTo(`/verify/${num}`)}
        />
      </Layout>
    );
  }

  // 5. PROTECTED ADMIN ROUTES (Inside Layout)
  let pageContent: React.ReactNode = null;

  if (currentPath === '/dashboard') {
    pageContent = (
      <DashboardPage
        onNavigate={navigateTo}
        onViewCertificate={(id) => {
          setActiveCertificateId(id);
          navigateTo(`/certificates/${id}`);
        }}
        onPublicVerify={(num) => navigateTo(`/verify/${num}`)}
      />
    );
  } else if (currentPath === '/students') {
    pageContent = (
      <StudentsPage
        onRegisterClick={() => navigateTo('/students/new')}
        onUploadCertForStudent={(student) => {
          setStudentForUpload(student);
          navigateTo('/certificates/upload');
        }}
        onViewCertificate={(certId) => {
          setActiveCertificateId(certId);
          navigateTo(`/certificates/${certId}`);
        }}
      />
    );
  } else if (currentPath === '/students/new') {
    pageContent = (
      <StudentNewPage
        onBack={() => navigateTo('/students')}
        onStudentCreated={() => navigateTo('/students')}
      />
    );
  } else if (currentPath === '/certificates/upload') {
    pageContent = (
      <CertificateUploadPage
        preselectedStudent={studentForUpload}
        onBack={() => {
          setStudentForUpload(null);
          navigateTo('/certificates');
        }}
        onSuccess={(certId) => {
          setStudentForUpload(null);
          setActiveCertificateId(certId);
          navigateTo(`/certificates/${certId}`);
        }}
      />
    );
  } else if (isCertDetailRoute && certDetailId) {
    pageContent = (
      <CertificateDetailPage
        certificateId={certDetailId}
        onBack={() => navigateTo('/certificates')}
        onPublicVerify={(num) => navigateTo(`/verify/${num}`)}
      />
    );
  } else if (currentPath === '/certificates') {
    pageContent = (
      <CertificatesPage
        onUploadClick={() => {
          setStudentForUpload(null);
          navigateTo('/certificates/upload');
        }}
        onViewCertificate={(certId) => {
          setActiveCertificateId(certId);
          navigateTo(`/certificates/${certId}`);
        }}
        onPublicVerify={(num) => navigateTo(`/verify/${num}`)}
      />
    );
  } else if (currentPath === '/settings') {
    pageContent = <SettingsPage />;
  } else {
    // Default fallback to dashboard
    pageContent = (
      <DashboardPage
        onNavigate={navigateTo}
        onViewCertificate={(id) => {
          setActiveCertificateId(id);
          navigateTo(`/certificates/${id}`);
        }}
        onPublicVerify={(num) => navigateTo(`/verify/${num}`)}
      />
    );
  }

  return (
    <Layout activeRoute={currentPath} onRouteChange={navigateTo}>
      {pageContent}
    </Layout>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
        <DarkModeToggle variant="floating" />
      </AuthProvider>
    </ThemeProvider>
  );
}
