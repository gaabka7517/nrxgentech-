import React, { useState, useEffect } from 'react';
import { dataService } from '../services/dataService';
import { Certificate } from '../types';
import { NexGenLogo } from '../components/NexGenLogo';
import { DarkModeToggle } from '../components/DarkModeToggle';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Calendar,
  BookOpen,
  User,
  Hash,
  ArrowRight,
  Eye,
  Download,
  Lock,
} from 'lucide-react';

interface PublicVerifyPageProps {
  initialCertNumber?: string;
  onNavigateLogin?: () => void;
}

export const PublicVerifyPage: React.FC<PublicVerifyPageProps> = ({
  initialCertNumber = '',
  onNavigateLogin,
}) => {
  const [certInput, setCertInput] = useState(initialCertNumber);
  const [searchedNumber, setSearchedNumber] = useState('');
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showDocPreview, setShowDocPreview] = useState(false);

  useEffect(() => {
    if (initialCertNumber) {
      setCertInput(initialCertNumber);
      handleVerify(initialCertNumber);
    }
  }, [initialCertNumber]);

  const handleVerify = async (queryNumber?: string) => {
    const target = (queryNumber || certInput).trim().toUpperCase();
    if (!target) return;

    setIsSearching(true);
    setHasSearched(true);
    setSearchedNumber(target);
    setShowDocPreview(false);

    try {
      const result = await dataService.getCertificateByNumber(target);
      setCertificate(result);
    } catch (err) {
      console.error(err);
      setCertificate(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify();
  };

  const isValid = certificate && certificate.verification_status === 'VALID';
  const isRevoked = certificate && certificate.verification_status === 'REVOKED';

  return (
    <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#0b1120] text-[#172033] dark:text-[#f1f5f9] flex flex-col justify-between antialiased transition-colors">
      {/* Top Public Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200/80 dark:border-gray-800 px-4 sm:px-8 py-4 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NexGenLogo size="sm" showSubtitle={true} />
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <DarkModeToggle variant="button" />
            {onNavigateLogin && (
              <button
                onClick={onNavigateLogin}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-[#075A91] dark:hover:text-[#5ACB00] transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Admin Login</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Verification Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col items-center">
        {/* Verification Header */}
        <div className="text-center max-w-xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#075A91] dark:text-blue-300 text-xs font-bold border border-blue-100 dark:border-blue-900">
            <ShieldCheck className="w-4 h-4 text-[#5ACB00]" />
            <span>Official Credential Verification Portal</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-[#172033] dark:text-white tracking-tight">
            CERTIFICATE VERIFICATION
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Verify the authenticity of a NexGen Technologies certificate. Enter the unique
            Certificate ID printed on the document or scanned QR code.
          </p>
        </div>

        {/* Verification Search Bar */}
        <div className="w-full max-w-2xl mt-8">
          <form onSubmit={handleSubmit} className="relative flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-gray-400 dark:text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={certInput}
                onChange={(e) => setCertInput(e.target.value)}
                placeholder="Enter Certificate Number (e.g. NEX-2026-0001)"
                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-2xl text-base font-mono uppercase placeholder:font-sans placeholder:normal-case placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-hidden focus:border-[#075A91] focus:ring-4 focus:ring-[#075A91]/10 transition-all shadow-xs"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="py-4 px-8 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-[#075A91] to-[#064B79] hover:from-[#064B79] hover:to-[#04385a] shadow-md shadow-[#075A91]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
            >
              <span>{isSearching ? 'Verifying...' : 'Verify Certificate'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Helper hint */}
          <div className="mt-3 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 px-2">
            <span>Standard format: NEX-YYYY-XXXX</span>
            <button
              type="button"
              onClick={() => {
                setCertInput('NEX-2026-0001');
                handleVerify('NEX-2026-0001');
              }}
              className="text-[#075A91] dark:text-sky-400 font-medium hover:underline cursor-pointer"
            >
              Try sample: NEX-2026-0001
            </button>
          </div>
        </div>

        {/* Results Display */}
        {hasSearched && (
          <div className="w-full max-w-2xl mt-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* 1. VALID CERTIFICATE */}
            {isValid && (
              <div className="bg-white dark:bg-gray-900 rounded-3xl border-2 border-[#5ACB00] shadow-xl overflow-hidden">
                {/* Header Badge */}
                <div className="bg-gradient-to-r from-[#5ACB00] to-[#4eb000] p-6 text-white text-center">
                  <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 backdrop-blur-xs">
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-wide uppercase">
                    ✓ VALID CERTIFICATE
                  </h2>
                  <p className="text-xs text-emerald-100 font-medium mt-1">
                    This certificate is authentic and recorded in the NexGen Technologies official registry.
                  </p>
                </div>

                {/* NexGen Logo & Details */}
                <div className="p-6 sm:p-8 space-y-6">
                  <div className="flex justify-center pb-5 border-b border-gray-100 dark:border-gray-800">
                    <NexGenLogo size="lg" variant="official" />
                  </div>

                  {/* Public fields ONLY */}
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-800/70 rounded-xl">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Student:
                      </span>
                      <span className="text-base font-black text-gray-900 dark:text-white mt-0.5 sm:mt-0">
                        {certificate.student_name}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-800/70 rounded-xl">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Course:
                      </span>
                      <span className="text-base font-black text-[#5ACB00] mt-0.5 sm:mt-0">
                        {certificate.course}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-800/70 rounded-xl">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Certificate Number:
                      </span>
                      <span className="text-base font-mono font-black text-[#075A91] dark:text-sky-400 mt-0.5 sm:mt-0">
                        {certificate.certificate_number}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-800/70 rounded-xl">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Issue Date:
                      </span>
                      <span className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-0.5 sm:mt-0">
                        {new Date(certificate.issue_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                        Status:
                      </span>
                      <span className="text-sm font-extrabold text-[#5ACB00] mt-0.5 sm:mt-0">
                        VALID
                      </span>
                    </div>
                  </div>

                  {/* Public Document View Toggle */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => setShowDocPreview(!showDocPreview)}
                      className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-[#075A91] dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/60 transition-colors flex items-center justify-center gap-2 cursor-pointer border border-sky-100 dark:border-sky-900"
                    >
                      <Eye className="w-4 h-4" />
                      <span>{showDocPreview ? 'Hide Document' : 'View Verified Certificate Document'}</span>
                    </button>

                    <a
                      href={certificate.certificate_file_url}
                      download={`${certificate.certificate_number}.pdf`}
                      className="py-3 px-5 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </a>
                  </div>

                  {/* Document preview container */}
                  {showDocPreview && (
                    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 mt-4 flex justify-center">
                      {certificate.file_type === 'application/pdf' ? (
                        <iframe
                          src={certificate.certificate_file_url}
                          title="Certificate Document"
                          className="w-full h-[450px] rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
                        />
                      ) : (
                        <img
                          src={certificate.certificate_file_url}
                          alt="Certificate"
                          className="max-h-[500px] w-auto object-contain rounded-xl shadow-md"
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. REVOKED CERTIFICATE */}
            {isRevoked && (
              <div className="bg-white dark:bg-gray-900 rounded-3xl border-2 border-rose-500 shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-rose-600 to-amber-600 p-6 text-white text-center">
                  <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 backdrop-blur-xs">
                    <AlertTriangle className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-wide uppercase">
                    ⚠ CERTIFICATE REVOKED
                  </h2>
                  <p className="text-xs text-rose-100 font-medium mt-1">
                    This certificate was officially issued but has been marked as REVOKED by NexGen Technologies.
                  </p>
                </div>

                <div className="p-6 sm:p-8 space-y-6">
                  <div className="flex justify-center pb-5 border-b border-gray-100 dark:border-gray-800">
                    <NexGenLogo size="lg" variant="official" />
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-800/70 rounded-xl">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Student:</span>
                      <span className="text-base font-black text-gray-900 dark:text-white">{certificate.student_name}</span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-800/70 rounded-xl">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Course:</span>
                      <span className="text-base font-bold text-gray-800 dark:text-gray-200">{certificate.course}</span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-800/70 rounded-xl">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Certificate Number:</span>
                      <span className="text-base font-mono font-bold text-gray-900 dark:text-white">{certificate.certificate_number}</span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-800/70 rounded-xl">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Issue Date:</span>
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                        {new Date(certificate.issue_date).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800">
                      <span className="text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300">Status:</span>
                      <span className="text-sm font-black text-rose-600 dark:text-rose-400">REVOKED</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. CERTIFICATE NOT FOUND */}
            {!certificate && (
              <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl p-8 sm:p-10 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-100 dark:border-rose-900">
                  <XCircle className="w-10 h-10" />
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                    ✕ CERTIFICATE NOT FOUND
                  </h2>
                  <p className="text-sm font-semibold text-rose-600 dark:text-rose-400 mt-1">
                    Certificate Number "{searchedNumber}" could not be verified.
                  </p>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  The certificate number could not be verified in our records. Please check the
                  certificate number and try again, or contact NexGen Technologies administration.
                </p>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setCertInput('');
                      setHasSearched(false);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
                  >
                    Clear & Try Again
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Public Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200/80 dark:border-gray-800 py-6 px-4 text-center text-xs text-gray-500 dark:text-gray-400">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <NexGenLogo size="xs" showSubtitle={false} />
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <span className="font-semibold text-gray-700 dark:text-gray-300">NEXGEN TECHNOLOGIES</span>
          </div>
          <p>&copy; {new Date().getFullYear()} NexGen Technologies Learning Center. Official Public Verification System.</p>
        </div>
      </footer>
    </div>
  );
};
