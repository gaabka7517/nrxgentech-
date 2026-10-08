import React, { useState, useEffect } from 'react';
import { dataService } from '../services/dataService';
import { Certificate, DashboardStats } from '../types';
import {
  Users,
  Award,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  UserPlus,
  Upload,
  ArrowRight,
  Eye,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (route: string) => void;
  onViewCertificate: (certId: string) => void;
  onPublicVerify: (certNumber: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onViewCertificate,
  onPublicVerify,
}) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalCertificates: 0,
    validCertificates: 0,
    revokedCertificates: 0,
    totalCourses: 0,
  });
  const [recentCerts, setRecentCerts] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const [dashStats, certList] = await Promise.all([
        dataService.getDashboardStats(),
        dataService.getCertificates(),
      ]);
      setStats(dashStats);
      // Show latest 5-8 certificates
      setRecentCerts(certList.slice(0, 6));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#075A91] via-[#064B79] to-[#04385a] rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-[#075A91]/15">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-bold text-white mb-3 backdrop-blur-xs">
              <span className="w-2 h-2 rounded-full bg-[#5ACB00]" />
              NexGen Admin Center
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Certificate Management System
            </h1>
            <p className="text-sm text-blue-100 mt-2">
              Welcome back. Manage student enrollments, issue verified completion certificates,
              and track public credentials in real time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('/students/new')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#5ACB00] hover:bg-[#4eb000] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register Student</span>
            </button>
            <button
              onClick={() => onNavigate('/certificates/upload')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 cursor-pointer backdrop-blur-xs"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Certificate</span>
            </button>
          </div>
        </div>

        {/* Subtle decorative circles */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full pointer-events-none blur-2xl" />
        <div className="absolute right-40 -top-20 w-48 h-48 bg-[#5ACB00]/15 rounded-full pointer-events-none blur-xl" />
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Total Students */}
        <div className="bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs flex items-center justify-between hover:border-[#075A91]/40 transition-colors">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500">
              Total Students
            </span>
            <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">
              {isLoading ? '...' : stats.totalStudents}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Registered in system</p>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#075A91] dark:text-blue-300 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Total Certificates */}
        <div className="bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs flex items-center justify-between hover:border-[#5ACB00]/40 transition-colors">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500">
              Total Certificates
            </span>
            <p className="text-3xl font-black text-[#075A91] dark:text-sky-400 mt-1">
              {isLoading ? '...' : stats.totalCertificates}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Issued documents</p>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-[#5ACB00] flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Valid Certificates */}
        <div className="bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs flex items-center justify-between hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500">
              Valid Certificates
            </span>
            <p className="text-3xl font-black text-[#5ACB00] mt-1">
              {isLoading ? '...' : stats.validCertificates}
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Publicly verified</span>
            </p>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-[#5ACB00] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Revoked Certificates */}
        <div className="bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs flex items-center justify-between hover:border-rose-300 dark:hover:border-rose-700 transition-colors">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500">
              Revoked
            </span>
            <p className="text-3xl font-black text-rose-600 dark:text-rose-400 mt-1">
              {isLoading ? '...' : stats.revokedCertificates}
            </p>
            <p className="text-xs text-rose-500 dark:text-rose-400 font-semibold mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Suspended records</span>
            </p>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recent Certificates Table Section */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs p-6 sm:p-7 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-[#172033] dark:text-white">Recent Certificates</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Latest issued credentials and active verification records
            </p>
          </div>

          <button
            onClick={() => onNavigate('/certificates')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#075A91] dark:text-sky-400 hover:text-[#5ACB00] transition-colors cursor-pointer"
          >
            <span>View All ({stats.totalCertificates})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {recentCerts.length === 0 ? (
          <div className="p-12 text-center text-gray-400 dark:text-gray-500 text-sm">
            <Award className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
            <p className="font-semibold text-gray-700 dark:text-gray-300">No certificates uploaded yet.</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Upload student certificates to view them here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-50/80 dark:bg-gray-800/80 text-[11px] uppercase tracking-wider text-gray-400 dark:text-gray-400 font-bold border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="py-3 px-4">Certificate Number</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
                {recentCerts.map((cert) => {
                  const isValid = cert.verification_status === 'VALID';
                  return (
                    <tr key={cert.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-xs text-[#075A91] dark:text-sky-400">
                        {cert.certificate_number}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">{cert.student_name}</td>
                      <td className="py-3.5 px-4">
                        <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-md text-gray-700 dark:text-gray-300">
                          {cert.course}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-gray-500 dark:text-gray-400">
                        {new Date(cert.issue_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            isValid
                              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-[#5ACB00] border border-emerald-100 dark:border-emerald-800'
                              : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800'
                          }`}
                        >
                          {isValid ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                          <span>{cert.verification_status}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => onViewCertificate(cert.id)}
                            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-[#075A91] dark:hover:text-[#5ACB00] hover:bg-sky-50 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onPublicVerify(cert.certificate_number)}
                            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-[#5ACB00] hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition-colors cursor-pointer"
                            title="Verify Publicly"
                          >
                            <ShieldCheck className="w-4 h-4" />
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
    </div>
  );
};
