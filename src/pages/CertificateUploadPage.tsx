import React, { useState, useEffect } from 'react';
import { dataService } from '../services/dataService';
import { Student, Course } from '../types';
import {
  UploadCloud,
  Calendar,
  User,
  BookOpen,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  UserPlus,
  Users,
  Sparkles,
} from 'lucide-react';

interface CertificateUploadPageProps {
  onBack: () => void;
  onSuccess: (certId: string) => void;
  preselectedStudent?: Student | null;
}

export const CertificateUploadPage: React.FC<CertificateUploadPageProps> = ({
  onBack,
  onSuccess,
  preselectedStudent,
}) => {
  // Mode: 'new' (All-in-one: Student Name + Course + Certificate) or 'existing' (pick from registered)
  const [entryMode, setEntryMode] = useState<'new' | 'existing'>(
    preselectedStudent ? 'existing' : 'new'
  );

  // New Student fields
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentCourse, setNewStudentCourse] = useState('');

  // Existing Students fields
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(preselectedStudent?.id || '');

  // Certificate fields
  const [issueDate, setIssueDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [nextCertNumber, setNextCertNumber] = useState<string>('NEX-2026-0001');

  // Exact Original File state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  // Upload status
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    loadInitialData();
  }, [preselectedStudent]);

  const loadInitialData = async () => {
    try {
      const [stList, crsList, nextNum] = await Promise.all([
        dataService.getStudents(),
        dataService.getCourses(),
        dataService.getNextCertificateNumber(),
      ]);
      setStudents(stList);
      setCourses(crsList);
      setNextCertNumber(nextNum);

      if (crsList.length > 0 && !newStudentCourse) {
        setNewStudentCourse(crsList[0].name);
      }

      if (preselectedStudent) {
        setSelectedStudentId(preselectedStudent.id);
        setEntryMode('existing');
      } else if (stList.length > 0 && !selectedStudentId) {
        setSelectedStudentId(stList[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const selectedExistingStudent =
    students.find((s) => s.id === selectedStudentId) ||
    (preselectedStudent && preselectedStudent.id === selectedStudentId ? preselectedStudent : undefined) ||
    (preselectedStudent && entryMode === 'existing' ? preselectedStudent : undefined);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage('');
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate size (increased to 50MB)
      if (file.size > 50 * 1024 * 1024) {
        setErrorMessage('Faylku wuxuu ka weyn yahay 50MB (File exceeds 50MB limit).');
        return;
      }

      // Validate type - strictly authentic scanned documents
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      const isAllowed = allowedTypes.includes(file.type) || file.name.match(/\.(pdf|png|jpe?g)$/i);
      if (!isAllowed) {
        setErrorMessage('Faylka lama oggola. Fadlan soo geli PDF, JPG, ama PNG oo kaliya.');
        return;
      }

      setSelectedFile(file);

      // Create preview for images
      if (file.type.startsWith('image/') || file.name.match(/\.(png|jpe?g)$/i)) {
        const reader = new FileReader();
        reader.onload = () => setFilePreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    let studentId = '';
    let studentName = '';
    let studentCourse = '';

    if (entryMode === 'new') {
      if (!newStudentName.trim()) {
        setErrorMessage('Fadlan geli magaca ardayga (Please enter Student Name).');
        return;
      }
      if (!newStudentCourse.trim()) {
        setErrorMessage('Fadlan dooro koorsada (Please select Course).');
        return;
      }
      studentName = newStudentName.trim();
      studentCourse = newStudentCourse.trim();
    } else {
      if (!selectedExistingStudent) {
        setErrorMessage('Fadlan dooro ardayga diiwaangashan (Please select existing student).');
        return;
      }
      studentId = selectedExistingStudent.id;
      studentName = selectedExistingStudent.student_name;
      studentCourse = selectedExistingStudent.course;
    }

    if (!selectedFile) {
      setErrorMessage('Fadlan soo dooro faylka asalka ah ee shahaadada (Please select certificate file).');
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);

    try {
      const progressTimer = setInterval(() => {
        setUploadProgress((p) => (p < 85 ? p + 20 : p));
      }, 150);

      // 1. If new student, check if student already exists or create new student
      if (entryMode === 'new') {
        const cleanName = studentName.toLowerCase();
        const existingStudent = students.find(
          (s) => s.student_name.trim().toLowerCase() === cleanName
        );

        if (existingStudent) {
          studentId = existingStudent.id;
          studentCourse = existingStudent.course || studentCourse;
        } else {
          const createdStudent = await dataService.addStudent(studentName, studentCourse);
          studentId = createdStudent.id;
        }
      }

      // 2. Upload exact original file
      const uploadResult = await dataService.uploadFile(selectedFile, nextCertNumber);

      clearInterval(progressTimer);
      setUploadProgress(100);

      // 3. Create certificate record
      const newCert = await dataService.createCertificate({
        student_id: studentId,
        student_name: studentName,
        course: studentCourse,
        certificate_file_url: uploadResult.url,
        file_type: uploadResult.fileType,
        file_name: selectedFile.name,
        file_size: uploadResult.fileSize,
        issue_date: issueDate,
        verification_status: 'VALID',
      });

      setSuccessMessage(
        `Ardayga "${studentName}" iyo shahaadadiisii asalka ahayd si buuxda ayaa loo diiwaangeliyay!`
      );

      setTimeout(() => {
        onSuccess(newCert.id);
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Khalad ayaa dhacay xilliga diiwaangelinta.');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          type="button"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Certificates</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs p-6 sm:p-10">
        {/* Header Banner */}
        <div className="flex items-center justify-between pb-6 border-b border-gray-100 dark:border-gray-800 flex-wrap gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#075A91] to-[#5ACB00] text-white flex items-center justify-center shadow-xs">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#172033] dark:text-white">
                Register Student & Upload Certificate
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Hal mar ku wada dar: Magaca Ardayga, Koorsada, iyo Faylka Shahaadada Asalka ah
              </p>
            </div>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-950/50 px-3.5 py-1.5 rounded-xl border border-emerald-100 dark:border-emerald-800 text-right">
            <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-400 block">Certificate ID</span>
            <span className="font-mono text-sm font-extrabold text-[#5ACB00]">
              {nextCertNumber}
            </span>
          </div>
        </div>

        {/* Tab Mode Selector */}
        <div className="mt-6 p-1.5 bg-gray-100/90 dark:bg-gray-800/90 rounded-2xl flex gap-1">
          <button
            type="button"
            onClick={() => setEntryMode('new')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              entryMode === 'new'
                ? 'bg-white dark:bg-gray-700 text-[#075A91] dark:text-sky-300 shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4 text-[#5ACB00]" />
            <span>Arday Cusub (New Student + Certificate)</span>
          </button>

          <button
            type="button"
            onClick={() => setEntryMode('existing')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              entryMode === 'existing'
                ? 'bg-white dark:bg-gray-700 text-[#075A91] dark:text-sky-300 shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 text-[#075A91] dark:text-sky-400" />
            <span>Arday Hore (Existing Student)</span>
          </button>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="mt-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-emerald-800 dark:text-emerald-300 text-sm">
            <CheckCircle2 className="w-5 h-5 text-[#5ACB00] shrink-0" />
            <span className="font-bold">{successMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex items-center gap-3 text-rose-800 dark:text-rose-300 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}

        {/* Upload Progress Bar */}
        {isUploading && (
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-gray-300">
              <span>Ardayga & shahaadadii asalka ahayd ayaa la keydinayaa...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#5ACB00] to-[#075A91] transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Main Combined Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* OPTION A: NEW STUDENT (ALL-IN-ONE) */}
          {entryMode === 'new' && (
            <div className="space-y-5 p-5 bg-sky-50/40 dark:bg-gray-800/60 rounded-2xl border border-sky-100 dark:border-gray-700">
              <div className="flex items-center gap-2 text-xs font-extrabold text-[#075A91] dark:text-sky-400 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-[#5ACB00]" />
                <span>1. Macluumaadka Ardayga (Student Details)</span>
              </div>

              {/* Student Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                  Student Name (Magaca Ardayga) <span className="text-rose-500">*</span>
                </label>
                <div className="relative rounded-xl shadow-2xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    placeholder="e.g. Abdiwahab Ahmed"
                    className="block w-full pl-10 pr-4 py-3.5 border border-gray-300 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-[#075A91] bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              {/* Course */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                  Course (Koorsada uu bartay) <span className="text-rose-500">*</span>
                </label>
                <div className="relative rounded-xl shadow-2xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <select
                    required
                    value={newStudentCourse}
                    onChange={(e) => setNewStudentCourse(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3.5 border border-gray-300 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-[#075A91] bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium cursor-pointer"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* OPTION B: EXISTING STUDENT */}
          {entryMode === 'existing' && (
            <div className="p-5 bg-gray-50/70 dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                Dooro Arday Diiwaangashan (Select Existing Student) <span className="text-rose-500">*</span>
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                  <User className="w-4 h-4" />
                </div>
                <select
                  required
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3.5 border border-gray-300 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-[#075A91] bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium cursor-pointer"
                >
                  {students.length === 0 && <option value="">No students available.</option>}
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.student_name} — {st.course}
                    </option>
                  ))}
                </select>
              </div>

              {selectedExistingStudent && (
                <div className="mt-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-between text-xs">
                  <span className="font-bold text-[#075A91] dark:text-sky-400">{selectedExistingStudent.student_name}</span>
                  <span className="font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                    {selectedExistingStudent.course}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Issue Date */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
              Issue Date (Taariikhda Bixinta) <span className="text-rose-500">*</span>
            </label>
            <div className="relative rounded-xl shadow-2xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                type="date"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="block w-full pl-10 pr-4 py-3.5 border border-gray-300 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-[#075A91] bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium"
              />
            </div>
          </div>

          {/* Original Scanned Certificate File */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Upload Original Certificate (Faylka Shahaadada Asalka ah) <span className="text-rose-500">*</span>
            </label>

            {/* Drag & Drop Upload Zone */}
            <label className="relative border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-[#075A91] dark:hover:border-[#5ACB00] rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-gray-50/50 dark:bg-gray-800/50 hover:bg-sky-50/20 dark:hover:bg-gray-800 group">
              <input
                type="file"
                required
                accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
                onChange={handleFileChange}
                className="sr-only"
              />
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#075A91] dark:text-sky-300 group-hover:scale-110 flex items-center justify-center transition-transform mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                Guji halkan si aad u soo doorato shahaadada asalka ah (Browse File)
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                PDF, JPG, JPEG, PNG (Ilaa 50 MB) &bull; Waxba lagama beddelayo asalkeeda
              </p>
            </label>

            {/* Selected File Confirmation Card */}
            {selectedFile && (
              <div className="p-4 bg-emerald-50/90 dark:bg-emerald-950/60 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 text-[#5ACB00] flex items-center justify-center shadow-2xs">
                    {selectedFile.type === 'application/pdf' || selectedFile.name.endsWith('.pdf') ? (
                      <FileText className="w-5 h-5 text-rose-500" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-[#5ACB00]" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-gray-900 dark:text-white break-all">{selectedFile.name}</p>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                        100% Original
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {((selectedFile.size) / (1024 * 1024)).toFixed(2)} MB &bull; {selectedFile.type || 'Document'}
                    </p>
                  </div>
                </div>

                {filePreview && (
                  <div className="shrink-0 pl-3">
                    <img
                      src={filePreview}
                      alt="Certificate Preview"
                      className="w-16 h-12 object-cover rounded-lg border border-gray-200 dark:border-gray-700 shadow-2xs"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Submit Button */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onBack}
              disabled={isUploading}
              className="px-5 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !selectedFile}
              className="px-8 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-[#075A91] via-[#064B79] to-[#5ACB00] hover:opacity-95 rounded-xl transition-all shadow-md shadow-[#075A91]/25 cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4" />
              <span>
                {isUploading
                  ? 'Keydinayaa...'
                  : entryMode === 'new'
                  ? 'Register Student & Issue Certificate'
                  : 'Upload Certificate'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
