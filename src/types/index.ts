export interface Course {
  id: string;
  name: string;
  created_at: string;
}

export interface Student {
  id: string;
  student_name: string;
  course: string;
  created_at: string;
}

export type VerificationStatus = 'VALID' | 'REVOKED';

export interface Certificate {
  id: string;
  certificate_number: string;
  student_id: string;
  student_name: string;
  course: string;
  certificate_file_url: string;
  file_type: string;
  file_size?: number;
  file_name?: string;
  issue_date: string;
  verification_status: VerificationStatus;
  created_at: string;
}

export interface SystemSettings {
  certificate_prefix: string;
  default_status: VerificationStatus;
  supabase_url?: string;
  supabase_anon_key?: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalCertificates: number;
  validCertificates: number;
  revokedCertificates: number;
  totalCourses: number;
}
