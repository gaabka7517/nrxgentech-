import React, { useState, useEffect } from 'react';
import { dataService } from '../services/dataService';
import { Course } from '../types';
import { UserPlus, ArrowLeft, CheckCircle2, AlertCircle, BookOpen, User } from 'lucide-react';

interface StudentNewPageProps {
  onBack: () => void;
  onStudentCreated: (studentId: string) => void;
}

export const StudentNewPage: React.FC<StudentNewPageProps> = ({ onBack, onStudentCreated }) => {
  const [studentName, setStudentName] = useState('');
  const [course, setCourse] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const list = await dataService.getCourses();
      setCourses(list);
      if (list.length > 0 && !course) {
        setCourse(list[0].name);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!studentName.trim()) {
      setErrorMessage('Please enter the student full name.');
      return;
    }
    if (!course.trim()) {
      setErrorMessage('Please select a course.');
      return;
    }

    setIsLoading(true);
    try {
      const newStudent = await dataService.addStudent(studentName, course);
      setSuccessMessage(`Student "${newStudent.student_name}" registered successfully!`);
      setTimeout(() => {
        onStudentCreated(newStudent.id);
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to register student.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          type="button"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Students</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs p-6 sm:p-10">
        <div className="flex items-center gap-3.5 pb-6 border-b border-gray-100 dark:border-gray-800">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#5ACB00] to-[#4eb000] text-white flex items-center justify-center shadow-xs">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#172033] dark:text-white">Register Student</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Enter student name and enrolled course to add to NexGen system
            </p>
          </div>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="mt-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-emerald-800 dark:text-emerald-300 text-sm">
            <CheckCircle2 className="w-5 h-5 text-[#5ACB00] shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex items-center gap-3 text-rose-800 dark:text-rose-300 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}

        {/* Minimal registration form: STRICTLY ONLY Student Name and Course */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div>
            <label
              htmlFor="student_name"
              className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2"
            >
              Student Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative rounded-xl shadow-2xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="student_name"
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g. Abdiwahab Ahmed"
                autoFocus
                className="block w-full pl-10 pr-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-hidden focus:ring-2 focus:ring-[#075A91] focus:border-[#075A91] transition-all font-medium"
              />
            </div>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1.5">
              Enter the full legal name exactly as it should appear on certificates.
            </p>
          </div>

          <div>
            <label
              htmlFor="course"
              className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2"
            >
              Course <span className="text-rose-500">*</span>
            </label>
            <div className="relative rounded-xl shadow-2xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <BookOpen className="w-4 h-4" />
              </div>
              <select
                id="course"
                required
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="block w-full pl-10 pr-10 py-3.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#075A91] focus:border-[#075A91] transition-all font-medium cursor-pointer"
              >
                {courses.length === 0 && <option value="">Loading courses...</option>}
                {courses.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => {
                // Navigate to all-in-one upload
                window.history.pushState({}, '', '/certificates/upload');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
              className="text-xs font-bold text-[#075A91] dark:text-sky-400 hover:text-[#5ACB00] transition-colors cursor-pointer"
            >
              &rarr; Ma rabtaa inaad hal mar ku darto ardayga iyo shahaadadiisa? Guji halkan
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onBack}
                className="px-5 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-7 py-3 text-sm font-bold text-white bg-gradient-to-r from-[#5ACB00] to-[#4eb000] hover:opacity-95 rounded-xl transition-all shadow-md shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? 'Registering...' : 'Register Student'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
