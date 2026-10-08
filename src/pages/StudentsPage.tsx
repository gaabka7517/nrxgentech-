import React, { useState, useEffect } from 'react';
import { dataService } from '../services/dataService';
import { Student, Course, Certificate } from '../types';
import { DeleteModal } from '../components/DeleteModal';
import {
  Search,
  Filter,
  UserPlus,
  Edit2,
  Trash2,
  Award,
  CheckCircle2,
  Clock,
  Eye,
  X,
  FileCheck2,
} from 'lucide-react';

interface StudentsPageProps {
  onRegisterClick: () => void;
  onUploadCertForStudent: (student: Student) => void;
  onViewCertificate: (certId: string) => void;
}

export const StudentsPage: React.FC<StudentsPageProps> = ({
  onRegisterClick,
  onUploadCertForStudent,
  onViewCertificate,
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit modal state
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editName, setEditName] = useState('');
  const [editCourse, setEditCourse] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // View modal state
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);

  useEffect(() => {
    loadData();
  }, [search, selectedCourse]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [stList, crList, certList] = await Promise.all([
        dataService.getStudents(search, selectedCourse),
        dataService.getCourses(),
        dataService.getCertificates(),
      ]);
      setStudents(stList);
      setCourses(crList);
      setCertificates(certList);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await dataService.deleteStudent(deleteTarget.id);
      setDeleteTarget(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete student.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setEditName(student.student_name);
    setEditCourse(student.course);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    setIsSavingEdit(true);
    try {
      await dataService.updateStudent(editingStudent.id, editName, editCourse);
      setEditingStudent(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update student');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const getStudentCertificate = (student: Student) => {
    if (!student) return null;
    // 1. Direct match by student_id
    if (student.id) {
      const byId = certificates.find((c) => c.student_id === student.id);
      if (byId) return byId;
    }

    // 2. Match by student_name and course (case-insensitive & trimmed)
    const sName = student.student_name?.trim().toLowerCase();
    const sCourse = student.course?.trim().toLowerCase();

    if (sName) {
      const byNameAndCourse = certificates.find((c) => {
        const cName = c.student_name?.trim().toLowerCase();
        const cCourse = c.course?.trim().toLowerCase();
        return cName === sName && (!sCourse || !cCourse || cCourse === sCourse);
      });
      if (byNameAndCourse) return byNameAndCourse;

      // 3. Fallback match by student_name alone
      const byName = certificates.find((c) => {
        const cName = c.student_name?.trim().toLowerCase();
        return cName === sName;
      });
      if (byName) return byName;
    }

    return null;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#172033] dark:text-white">Student Database</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Registered students and issued certificate status
          </p>
        </div>

        <button
          onClick={onRegisterClick}
          type="button"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#5ACB00] to-[#4eb000] text-white text-sm font-bold shadow-xs hover:opacity-95 transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register Student</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#075A91] focus:bg-white dark:focus:bg-gray-800 transition-all font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full md:w-56 py-2.5 px-3 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#075A91] font-medium cursor-pointer"
          >
            <option value="ALL">All Courses ({courses.length})</option>
            {courses.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400 dark:text-gray-500 text-sm">Loading students...</div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center mx-auto mb-3">
              <UserPlus className="w-6 h-6" />
            </div>
            <p className="text-base font-bold text-gray-700 dark:text-gray-300">No students registered yet.</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-sm mx-auto">
              {search || selectedCourse !== 'ALL'
                ? 'No students matched your search criteria.'
                : 'Start by registering your first student into the system.'}
            </p>
            <button
              onClick={onRegisterClick}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#5ACB00] hover:bg-[#4eb000] rounded-xl transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register Student</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-50/80 dark:bg-gray-800/80 text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="py-3.5 px-5">Student Name</th>
                  <th className="py-3.5 px-5">Course</th>
                  <th className="py-3.5 px-5">Registration Date</th>
                  <th className="py-3.5 px-5">Certificate Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
                {students.map((student) => {
                  const cert = getStudentCertificate(student);
                  const regDate = new Date(student.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <tr key={student.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/60 transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#075A91]/10 dark:bg-blue-950/60 text-[#075A91] dark:text-sky-300 font-bold text-xs flex items-center justify-center uppercase shrink-0">
                            {student.student_name.slice(0, 2)}
                          </div>
                          <span className="font-bold text-gray-900 dark:text-white">{student.student_name}</span>
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-[#075A91] dark:text-sky-300 border border-blue-100 dark:border-blue-900">
                          {student.course}
                        </span>
                      </td>

                      <td className="py-4 px-5 text-xs text-gray-500 dark:text-gray-400">{regDate}</td>

                      <td className="py-4 px-5">
                        {cert ? (
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                cert.verification_status === 'VALID'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-[#5ACB00] border border-emerald-100 dark:border-emerald-800'
                                  : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800'
                              }`}
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{cert.verification_status}</span>
                            </span>
                            <button
                              onClick={() => onViewCertificate(cert.id)}
                              className="text-xs font-mono text-[#075A91] dark:text-sky-400 hover:underline"
                              title="View certificate"
                            >
                              {cert.certificate_number}
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-800">
                              <Clock className="w-3 h-3" />
                              <span>Not Issued</span>
                            </span>
                            <button
                              onClick={() => onUploadCertForStudent(student)}
                              className="text-xs font-bold text-[#075A91] dark:text-sky-400 hover:text-[#5ACB00] transition-colors"
                            >
                              + Issue
                            </button>
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setViewingStudent(student)}
                            className="p-1.5 text-gray-500 hover:text-[#075A91] hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                            title="View student profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(student)}
                            className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit student"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(student)}
                            className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Student View Modal */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-gray-100 relative">
            <button
              onClick={() => setViewingStudent(null)}
              className="absolute top-5 right-5 p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <div className="w-12 h-12 rounded-full bg-[#075A91] text-white flex items-center justify-center font-bold text-base">
                {viewingStudent.student_name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{viewingStudent.student_name}</h3>
                <span className="text-xs px-2 py-0.5 rounded-md bg-blue-50 text-[#075A91] font-semibold">
                  {viewingStudent.course}
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500">Student ID:</span>
                <span className="font-mono text-xs text-gray-800">{viewingStudent.id}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500">Registered On:</span>
                <span className="font-medium text-gray-800">
                  {new Date(viewingStudent.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500">Certificate:</span>
                {(() => {
                  const cert = getStudentCertificate(viewingStudent);
                  if (cert) {
                    return (
                      <span className="font-mono text-xs font-bold text-[#075A91]">
                        {cert.certificate_number} ({cert.verification_status})
                      </span>
                    );
                  }
                  return <span className="text-xs text-amber-600 font-medium">None Issued</span>;
                })()}
              </div>
            </div>

            <div className="mt-6 pt-3 flex gap-2">
              {(() => {
                const cert = getStudentCertificate(viewingStudent);
                if (cert) {
                  return (
                    <button
                      onClick={() => {
                        setViewingStudent(null);
                        onViewCertificate(cert.id);
                      }}
                      className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#075A91] hover:bg-[#064B79] flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Award className="w-4 h-4" />
                      <span>View Certificate</span>
                    </button>
                  );
                }
                return (
                  <button
                    onClick={() => {
                      const st = viewingStudent;
                      setViewingStudent(null);
                      onUploadCertForStudent(st);
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#5ACB00] hover:bg-[#4eb000] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <FileCheck2 className="w-4 h-4" />
                    <span>Issue Certificate Now</span>
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-md w-full p-6 shadow-xl border border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Edit Student</h3>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                  Student Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-[#075A91]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                  Course
                </label>
                <select
                  required
                  value={editCourse}
                  onChange={(e) => setEditCourse(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-[#075A91]"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#075A91] hover:bg-[#064B79] rounded-xl cursor-pointer"
                >
                  {isSavingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Student Record"
        message="Are you sure you want to delete this student record? This action cannot be undone."
        itemName={deleteTarget?.student_name}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        isDeleting={isDeleting}
      />
    </div>
  );
};
