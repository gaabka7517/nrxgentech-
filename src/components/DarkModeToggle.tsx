import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface DarkModeToggleProps {
  variant?: 'floating' | 'button' | 'sidebar' | 'switch';
  className?: string;
  showLabel?: boolean;
}

export const DarkModeToggle: React.FC<DarkModeToggleProps> = ({
  variant = 'button',
  className = '',
  showLabel = true,
}) => {
  const { theme, isDark, toggleTheme } = useTheme();

  if (variant === 'floating') {
    return (
      <div className={`fixed bottom-6 right-6 z-50 no-print ${className}`}>
        <button
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="group flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-xl transition-all duration-300 backdrop-blur-md cursor-pointer border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 text-gray-800 dark:text-gray-100 hover:scale-105 active:scale-95 shadow-gray-400/20 dark:shadow-black/50"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          <div className="relative w-5 h-5 flex items-center justify-center">
            {isDark ? (
              <Sun className="w-5 h-5 text-amber-400 transition-transform duration-300 group-hover:rotate-45" />
            ) : (
              <Moon className="w-5 h-5 text-[#075A91] transition-transform duration-300 group-hover:-rotate-12" />
            )}
          </div>
          {showLabel && (
            <span className="text-xs font-bold tracking-wide select-none">
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </span>
          )}
        </button>
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
          isDark
            ? 'bg-gray-800/80 text-amber-300 hover:bg-gray-800 border border-gray-700'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200/80 border border-gray-200/60'
        } ${className}`}
        aria-label="Toggle Theme"
      >
        <div className="flex items-center gap-2">
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-[#075A91]" />
          )}
          <span>{isDark ? 'Dark Mode: ON' : 'Dark Mode: OFF'}</span>
        </div>
        <div
          className={`w-8 h-4.5 flex items-center rounded-full p-0.5 transition-colors ${
            isDark ? 'bg-[#5ACB00] justify-end' : 'bg-gray-300 justify-start'
          }`}
        >
          <div className="w-3.5 h-3.5 rounded-full bg-white shadow-xs transition-transform" />
        </div>
      </button>
    );
  }

  if (variant === 'switch') {
    return (
      <div className={`flex items-center justify-between ${className}`}>
        <div>
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            {isDark ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-[#075A91]" />}
            <span>System Theme (Dark Mode)</span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Switch between crisp light theme and eye-friendly dark theme.
          </p>
        </div>
        <button
          type="button"
          onClick={toggleTheme}
          role="switch"
          aria-checked={isDark}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
            isDark ? 'bg-[#5ACB00]' : 'bg-gray-300'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
              isDark ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    );
  }

  // Standard compact button for header or toolbars
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`p-2 rounded-xl transition-all cursor-pointer border flex items-center gap-1.5 text-xs font-semibold ${
        isDark
          ? 'bg-gray-800 text-amber-300 border-gray-700 hover:bg-gray-750'
          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
      } ${className}`}
    >
      {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#075A91]" />}
      {showLabel && <span>{isDark ? 'Light' : 'Dark'}</span>}
    </button>
  );
};
