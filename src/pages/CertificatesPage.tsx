import React, { useState, useEffect } from 'react';
import { dataService } from '../services/dataService';
import { Certificate, Course, VerificationStatus } from '../types';
import { DeleteModal } from '../components/DeleteModal';
import {
  Search,
  Filter,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Download,
  ShieldCheck,
  Trash2,
  Calendar,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';

interface CertificatesPageProps {
  onUploadClick: () => void;
  onViewCertificate: (certId: string) => void;
  onPublicVerify: (certNumber: string) => void;
}

export const CertificatesPage: React.FC<CertificatesPageProps> = ({
  onUploadClick,
  onViewCertificate,
  onPublicVerify,
}) => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Certificate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadData();
  }, [search, selectedCourse, selectedStatus]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [cList, crsList] = await Promise.all([
        dataService.getCertificates(search, selectedCourse, selectedStatus),
        dataService.getCourses(),
      ]);
      setCertificates(cList);
      setCourses(crsList);
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
      await dataService.deleteCertificate(deleteTarget.id);
      setDeleteTarget(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete certificate');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (cert: Certificate) => {
    const nextStatus: VerificationStatus = cert.verification_status === 'VALID' ? 'REVOKED' : 'VALID';
    const confirmMsg =
      nextStatus === 'REVOKED'
        ? `Are you sure you want to REVOKE certificate ${cert.certificate_number}? Visitors will see it as revoked.`
        : `Mark certificate ${cert.certificate_number} as VALID?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await dataService.updateCertificateStatus(cert.id, nextStatus);
      await loadData();
    } catch (e: any) {
      alert(e.message || 'Failed to update certificate status');
    }
  };

  const handleDownloadFile = (cert: Certificate) => {
    const a = document.createElement('a');
    a.href = cert.certificate_file_url;
    a.download = cert.file_name || `${cert.certificate_number}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#172033] dark:text-white">Certificate Management</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Browse, search, verify authenticity, and manage all student certificates
          </p>
        </div>

        <button
          onClick={onUploadClick}
          type="button"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#075A91] to-[#064B79] text-white text-sm font-bold shadow-xs hover:opacity-95 transition-all cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Certificate</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs flex flex-col lg:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Certificate #, Student Name, or Course..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#075A91] focus:bg-white dark:focus:bg-gray-800 transition-all font-medium"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full lg:w-auto">
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full sm:w-48 py-2.5 px-3 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#075A91] font-medium cursor-pointer"
            >
              <option value="ALL">All Courses ({courses.length})</option>
              {courses.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full sm:w-36 py-2.5 px-3 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#075A91] font-medium cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="VALID">Valid Only</option>
            <option value="REVOKED">Revoked Only</option>
          </select>
        </div>
      </div>

      {/* Certificates Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400 dark:text-gray-500 text-sm">Loading certificates...</div>
        ) : certificates.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <p className="text-base font-bold text-gray-700 dark:text-gray-300">No certificates uploaded yet.</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-sm mx-auto">
              {search || selectedCourse !== 'ALL' || selectedStatus !== 'ALL'
                ? 'No certificates match the selected filters.'
                : 'Upload your first verified student certificate to get started.'}
            </p>
            <button
              onClick={onUploadClick}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#075A91] hover:bg-[#064B79] rounded-xl transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Certificate</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-50/80 dark:bg-gray-800/80 text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="py-3.5 px-5">Certificate ID</th>
                  <th className="py-3.5 px-5">Student Name</th>
                  <th className="py-3.5 px-5">Course</th>
                  <th className="py-3.5 px-5">Issue Date</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
                {certificates.map((cert) => {
                  const isValid = cert.verification_status === 'VALID';
                  return (
                    <tr key={cert.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/60 transition-colors">
                      <td className="py-4 px-5">
                        <button
                          onClick={() => onViewCertificate(cert.id)}
                          className="font-mono font-bold text-xs text-[#075A91] dark:text-sky-400 hover:text-[#5ACB00] bg-blue-50/70 dark:bg-blue-950/60 hover:bg-blue-100/70 dark:hover:bg-blue-900/60 px-2.5 py-1 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>{cert.certificate_number}</span>
                        </button>
                      </td>

                      <td className="py-4 px-5">
                        <span className="font-bold text-gray-900 dark:text-white">{cert.student_name}</span>
                      </td>

                      <td className="py-4 px-5">
                        <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                          {cert.course}
                        </span>
                      </td>

                      <td className="py-4 px-5 text-xs text-gray-500 dark:text-gray-400">
                        {new Date(cert.issue_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>

                      <td className="py-4 px-5">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(cert)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-transform hover:scale-105 cursor-pointer ${
                            isValid
                              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-[#5ACB00] border border-emerald-100 dark:border-emerald-800'
                              : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800'
                          }`}
                          title="Click to toggle status (Valid / Revoked)"
                        >
                          {isValid ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5" />
                          )}
                          <span>{cert.verification_status}</span>
                        </button>
                      </td>

                      <td className="py-4 px-5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => onViewCertificate(cert.id)}
                            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-[#075A91] dark:hover:text-[#5ACB00] hover:bg-sky-50 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                            title="View Certificate Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDownloadFile(cert)}
                            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-[#5ACB00] hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition-colors cursor-pointer"
                            title="Download Certificate File"
                          >
                            <Download className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onPublicVerify(cert.certificate_number)}
                            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-[#075A91] dark:hover:text-sky-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors cursor-pointer"
                            title="Open Public Verification Link"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setDeleteTarget(cert)}
                            className="p-1.5 text-rose-500 hover:text-white hover:bg-rose-600 rounded-lg transition-colors cursor-pointer"
                            title="Delete Certificate (Tirtir Shahaadadan)"
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

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Certificate (Tirtir Shahaadada)"
        message="Ma hubtaa inaad tirtirto shahaadadan? Tirtiristu waxay si joogto ah meesha uga saaraysaa xogta shahaadada iyo faylkeedaba. (Are you sure you want to delete this certificate?)"
        itemName={deleteTarget ? `${deleteTarget.certificate_number} — ${deleteTarget.student_name} (${deleteTarget.course})` : ''}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        isDeleting={isDeleting}
      />
    </div>
  );
};
