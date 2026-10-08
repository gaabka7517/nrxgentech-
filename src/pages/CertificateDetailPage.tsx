import React, { useState, useEffect } from 'react';
import { dataService } from '../services/dataService';
import { Certificate, VerificationStatus } from '../types';
import { QRCodeCard } from '../components/QRCodeCard';
import { DeleteModal } from '../components/DeleteModal';
import {
  ArrowLeft,
  Download,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Printer,
  FileText,
  Eye,
  Maximize2,
  RotateCcw,
} from 'lucide-react';

interface CertificateDetailPageProps {
  certificateId: string;
  onBack: () => void;
  onPublicVerify: (certNumber: string) => void;
}

export const CertificateDetailPage: React.FC<CertificateDetailPageProps> = ({
  certificateId,
  onBack,
  onPublicVerify,
}) => {
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    loadCertificate();
  }, [certificateId]);

  const loadCertificate = async () => {
    setIsLoading(true);
    try {
      const item = await dataService.getCertificateById(certificateId);
      setCertificate(item);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!certificate) return;
    const nextStatus: VerificationStatus = certificate.verification_status === 'VALID' ? 'REVOKED' : 'VALID';

    const confirmMsg =
      nextStatus === 'REVOKED'
        ? `Are you sure you want to REVOKE certificate ${certificate.certificate_number}? Visitors will be warned that it is revoked.`
        : `Mark certificate ${certificate.certificate_number} as VALID?`;

    if (!window.confirm(confirmMsg)) return;

    setStatusUpdating(true);
    try {
      const updated = await dataService.updateCertificateStatus(certificate.id, nextStatus);
      setCertificate(updated);
    } catch (e: any) {
      alert(e.message || 'Failed to update certificate status');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleDownload = () => {
    if (!certificate) return;
    const a = document.createElement('a');
    a.href = certificate.certificate_file_url;
    a.download = certificate.file_name || `${certificate.certificate_number}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleOpenInNewTab = () => {
    if (!certificate) return;
    window.open(certificate.certificate_file_url, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDeleteConfirm = async () => {
    if (!certificate) return;
    setIsDeleting(true);
    try {
      await dataService.deleteCertificate(certificate.id);
      setShowDeleteModal(false);
      onBack();
    } catch (e: any) {
      alert(e.message || 'Failed to delete certificate');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-16 text-center text-gray-500 dark:text-gray-400">
        <div className="w-8 h-8 border-3 border-[#075A91] dark:border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold">Loading certificate record...</p>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="max-w-md mx-auto p-8 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Certificate Not Found</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">The requested certificate record could not be found.</p>
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl bg-[#075A91] text-white text-xs font-bold"
        >
          Return to Certificates
        </button>
      </div>
    );
  }

  const isValid = certificate.verification_status === 'VALID';
  const isPdf = certificate.file_type === 'application/pdf' || certificate.certificate_file_url.endsWith('.pdf');

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <button
          onClick={onBack}
          type="button"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Certificates</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownload}
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#075A91] dark:text-sky-400" />
            <span>Download</span>
          </button>

          <button
            onClick={handleOpenInNewTab}
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors shadow-2xs cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 text-[#075A91] dark:text-sky-400" />
            <span>Open in Tab</span>
          </button>

          <button
            onClick={handlePrint}
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors shadow-2xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#075A91] dark:text-sky-400" />
            <span>Print</span>
          </button>

          <button
            onClick={() => onPublicVerify(certificate.certificate_number)}
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#075A91] hover:bg-[#064B79] rounded-xl transition-colors shadow-2xs cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Public Verification Page</span>
          </button>

          <button
            onClick={() => setShowDeleteModal(true)}
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 rounded-xl transition-colors shadow-2xs cursor-pointer"
            title="Delete Certificate (Tirtir Shahaadada)"
          >
            <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>Delete Certificate</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Details Card & QR Code */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Certificate Meta Details */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Certificate Number
              </span>
              <h1 className="text-2xl sm:text-3xl font-black font-mono text-[#075A91] dark:text-sky-400 mt-0.5">
                {certificate.certificate_number}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold ${
                  isValid
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-[#5ACB00] border border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                }`}
              >
                {isValid ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                <span>{isValid ? 'VALID' : 'REVOKED'}</span>
              </span>

              <button
                type="button"
                disabled={statusUpdating}
                onClick={handleToggleStatus}
                className="text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-[#075A91] dark:hover:text-sky-400 hover:underline px-2 py-1 cursor-pointer"
              >
                {isValid ? 'Revoke?' : 'Restore to Valid?'}
              </button>
            </div>
          </div>

          {/* Student & Course attributes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-4 bg-gray-50/80 dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700">
              <span className="text-xs text-gray-400 dark:text-gray-500 font-semibold block uppercase tracking-wider">
                Student Name
              </span>
              <p className="text-lg font-black text-gray-900 dark:text-white mt-1">{certificate.student_name}</p>
            </div>

            <div className="p-4 bg-gray-50/80 dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700">
              <span className="text-xs text-gray-400 dark:text-gray-500 font-semibold block uppercase tracking-wider">
                Course Completed
              </span>
              <p className="text-lg font-black text-[#5ACB00] mt-1">{certificate.course}</p>
            </div>

            <div className="p-4 bg-gray-50/80 dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700">
              <span className="text-xs text-gray-400 dark:text-gray-500 font-semibold block uppercase tracking-wider">
                Issue Date
              </span>
              <p className="text-base font-bold text-gray-800 dark:text-gray-200 mt-1">
                {new Date(certificate.issue_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            <div className="p-4 bg-gray-50/80 dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700">
              <span className="text-xs text-gray-400 dark:text-gray-500 font-semibold block uppercase tracking-wider">
                File Type & Storage
              </span>
              <p className="text-xs font-mono text-gray-700 dark:text-gray-300 mt-1 truncate" title={certificate.file_name || ''}>
                {certificate.file_name || 'certificate-file'}
              </p>
            </div>
          </div>
        </div>

        {/* QR Code & Direct Public Link */}
        <div className="lg:col-span-1">
          <QRCodeCard certificateNumber={certificate.certificate_number} size={180} />
        </div>
      </div>

      {/* Document / Image Preview Section */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#075A91] dark:text-sky-400" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Certificate Document Viewer</h2>
          </div>
          <button
            onClick={handleOpenInNewTab}
            className="text-xs font-bold text-[#075A91] dark:text-sky-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Full Screen</span>
          </button>
        </div>

        {/* File Viewer Container */}
        <div className="bg-gray-100/80 dark:bg-gray-800/80 rounded-2xl p-4 sm:p-6 border border-gray-200/70 dark:border-gray-700 flex items-center justify-center min-h-[420px]">
          {isPdf ? (
            <div className="w-full flex flex-col items-center">
              <iframe
                src={certificate.certificate_file_url}
                title="PDF Certificate"
                className="w-full h-[600px] rounded-xl border border-gray-300 dark:border-gray-700 bg-white shadow-xs"
              />
            </div>
          ) : (
            <div className="w-full max-w-4xl flex justify-center">
              <img
                src={certificate.certificate_file_url}
                alt={`Certificate ${certificate.certificate_number}`}
                className="max-h-[700px] w-auto object-contain rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
              />
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        title="Delete Certificate Record"
        message="Are you sure you want to delete this certificate? This will remove the database record and associated certificate file."
        itemName={`${certificate.certificate_number} — ${certificate.student_name}`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteModal(false)}
        isDeleting={isDeleting}
      />
    </div>
  );
};
