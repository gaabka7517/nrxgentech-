import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Award,
  ShieldCheck,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
  ExternalLink,
  PlusCircle,
  Upload,
} from 'lucide-react';
import { NexGenLogo } from './NexGenLogo';
import { useAuth } from '../context/AuthContext';
import { DarkModeToggle } from './DarkModeToggle';

interface LayoutProps {
  children: React.ReactNode;
  activeRoute: string;
  onRouteChange: (route: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeRoute, onRouteChange }) => {
  const { userEmail, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', route: '/dashboard', icon: LayoutDashboard },
    { name: 'Students', route: '/students', icon: Users },
    { name: 'Certificates', route: '/certificates', icon: Award },
    { name: 'Verify Certificate', route: '/verify', icon: ShieldCheck, publicLink: true },
    { name: 'Settings', route: '/settings', icon: SettingsIcon },
  ];

  const handleNavClick = (route: string) => {
    onRouteChange(route);
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    onRouteChange('/login');
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#0b1120] text-[#172033] dark:text-[#f1f5f9] flex flex-col md:flex-row transition-colors">
      {/* Mobile Header */}
      <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <button
          onClick={() => onRouteChange('/dashboard')}
          className="flex items-center text-left focus:outline-hidden"
        >
          <NexGenLogo size="sm" showSubtitle={false} />
        </button>
        <div className="flex items-center gap-2">
          <DarkModeToggle variant="button" showLabel={false} />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-2xs z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-900 border-r border-gray-200/90 dark:border-gray-800 flex flex-col transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <button
            onClick={() => handleNavClick('/dashboard')}
            className="text-left focus:outline-hidden cursor-pointer"
          >
            <NexGenLogo size="md" showSubtitle={true} />
          </button>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Quick Buttons */}
        <div className="px-5 pt-4 pb-2 space-y-2">
          <button
            onClick={() => handleNavClick('/students/new')}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#5ACB00] to-[#4EB000] text-white text-xs font-bold shadow-xs hover:opacity-95 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Register Student</span>
          </button>
          <button
            onClick={() => handleNavClick('/certificates/upload')}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#075A91] to-[#064B79] text-white text-xs font-bold shadow-xs hover:opacity-95 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Certificate (All-in-One)</span>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-3 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            System Menu
          </div>
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive =
              activeRoute === item.route ||
              (item.route === '/students' && activeRoute.startsWith('/students')) ||
              (item.route === '/certificates' && activeRoute.startsWith('/certificates'));

            return (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.route)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#075A91] text-white shadow-xs'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? 'text-[#5ACB00]' : 'text-gray-400 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {item.publicLink && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      isActive ? 'bg-white/20 text-white' : 'bg-blue-50 dark:bg-blue-950/60 text-[#075A91] dark:text-blue-300'
                    }`}
                  >
                    Public
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Info & Bottom Controls (Dark Mode Toggle + Logout) */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/90 space-y-3">
          {/* Dark Mode Toggle Switch at the bottom of the sidebar */}
          <DarkModeToggle variant="sidebar" />

          <div className="flex items-center justify-between px-2 py-1">
            <div className="min-w-0 pr-2">
              <p className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">NexGen Admin</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate" title={userEmail || ''}>
                {userEmail || 'admin@nexgen.com'}
              </p>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-[#5ACB00] ring-4 ring-emerald-100 dark:ring-emerald-950/80 shrink-0" title="Online" />
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors cursor-pointer border border-rose-100 dark:border-rose-900/40"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Top desktop header bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white dark:bg-gray-900 border-b border-gray-200/80 dark:border-gray-800 sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-[#075A91] dark:text-blue-300 rounded-lg border border-blue-100 dark:border-blue-900">
              NexGen Learning Center
            </span>
            <span className="text-gray-400 text-sm">•</span>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Certificate Management Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Header Dark Mode Toggle Button */}
            <DarkModeToggle variant="button" />

            <a
              href="/verify"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#075A91] dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/70 rounded-lg transition-colors border border-sky-100 dark:border-sky-900"
            >
              <span>Public Verification Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">{children}</div>

        {/* Global Footer with NexGen Logo */}
        <footer className="mt-auto bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-6 px-4 sm:px-8 text-center text-xs text-gray-500 dark:text-gray-400">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl mx-auto">
            <div className="flex items-center gap-2">
              <NexGenLogo size="xs" showSubtitle={false} />
              <span className="text-gray-400">|</span>
              <span className="font-semibold text-gray-700 dark:text-gray-300">NexGen Technologies</span>
            </div>
            <div>
              &copy; {new Date().getFullYear()} NEXGEN TECHNOLOGIES. All rights reserved. Technology & Language Learning Center.
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};
