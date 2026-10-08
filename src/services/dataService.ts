import { getSupabase } from '../lib/supabase';
import { Course, Student, Certificate, VerificationStatus, DashboardStats, SystemSettings } from '../types';
import { localDb } from './localDb';

const INITIAL_COURSES = [
  'Computer Basics',
  'Microsoft Office',
  'Graphic Design',
  'Video Editing',
  'Web Development',
  'Computer Networking',
  'Mobile Maintenance',
  'Hardware & Software',
  'CCTV',
  'AI & Digital Skills',
  'English',
  'Amharic',
  'Arabic',
  'Other',
];

const LOCAL_COURSES_KEY = 'nexgen_local_courses';
const LOCAL_STUDENTS_KEY = 'nexgen_local_students';
const LOCAL_CERTIFICATES_KEY = 'nexgen_local_certificates';
const LOCAL_SETTINGS_KEY = 'nexgen_local_settings';

// Helper to keep localStorage entries lightweight while full document blobs are in IndexedDB
function toLightweightCert(cert: Certificate): Certificate {
  if (cert.certificate_file_url && cert.certificate_file_url.startsWith('data:') && cert.certificate_file_url.length > 500) {
    return {
      ...cert,
      certificate_file_url: `indexeddb://${cert.id}`,
    };
  }
  return cert;
}

function safeSetItem(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn(`localStorage quota notice for ${key}:`, e);
    if (key === LOCAL_CERTIFICATES_KEY) {
      try {
        const parsed: Certificate[] = JSON.parse(value);
        const pruned = parsed.map(toLightweightCert);
        localStorage.setItem(key, JSON.stringify(pruned));
      } catch (inner) {
        console.warn('Fallback safeSetItem failed:', inner);
      }
    }
  }
}

// Helper to generate a realistic sample SVG certificate for preview/download
export function generateCertificateDataUrl(studentName: string, course: string, certNumber: string, issueDate: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 850" width="1200" height="850">
    <defs>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#D4AF37"/>
        <stop offset="50%" stop-color="#FFF2A1"/>
        <stop offset="100%" stop-color="#AA7C11"/>
      </linearGradient>
      <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#075A91"/>
        <stop offset="100%" stop-color="#04385a"/>
      </linearGradient>
    </defs>
    
    <!-- Background -->
    <rect width="1200" height="850" fill="#FFFFFF"/>
    <rect x="25" y="25" width="1150" height="800" rx="16" fill="#FDFDFD" stroke="#075A91" stroke-width="8"/>
    <rect x="42" y="42" width="1116" height="766" rx="12" fill="none" stroke="#5ACB00" stroke-width="3" stroke-dasharray="12,6"/>
    
    <!-- Corner Ornaments -->
    <path d="M 45 110 L 110 45 L 45 45 Z" fill="#075A91"/>
    <path d="M 1155 110 L 1090 45 L 1155 45 Z" fill="#075A91"/>
    <path d="M 45 740 L 110 805 L 45 805 Z" fill="#075A91"/>
    <path d="M 1155 740 L 1090 805 L 1155 805 Z" fill="#075A91"/>

    <!-- Header & Brand: Official NexGen Emblem -->
    <g transform="translate(545, 60)">
      <!-- Laptop Screen -->
      <rect x="20" y="32" width="70" height="42" rx="4" fill="#FFFFFF" stroke="#5ACB00" stroke-width="2.5"/>
      <path d="M 22 62 Q 40 50 60 56 Q 75 62 88 54 L 88 72 L 22 72 Z" fill="#5ACB00"/>
      <!-- Laptop Base -->
      <path d="M 12 74 L 55 74 L 55 80 L 15 80 Z" fill="#075A91"/>
      <path d="M 55 74 L 98 74 L 95 80 L 55 80 Z" fill="#5ACB00"/>
      <!-- Book -->
      <path d="M 54 34 C 47 34 40 38 37 50 L 37 66 C 40 56 47 53 54 53 Z" fill="#5ACB00"/>
      <path d="M 56 34 C 63 34 70 38 73 50 L 73 66 C 70 56 63 53 56 53 Z" fill="#5ACB00"/>
      <!-- Brain -->
      <path d="M 47 24 C 42 24 39 27 39 30 C 35 31 35 35 38 36 C 38 39 43 41 48 39 C 50 42 56 42 58 37 C 59 34 56 28 53 26 Z" fill="#FFFFFF" stroke="#5ACB00" stroke-width="1.8"/>
      <!-- Blue Swoosh Arc -->
      <path d="M 23 8 C 14 26 10 56 44 87 C 62 103 90 88 107 75 C 88 90 60 88 42 72 C 24 55 21 30 29 8 Z" fill="#075A91"/>
    </g>

    <text x="600" y="175" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="28" fill="#5ACB00" letter-spacing="-0.5">NexGen</text>
    <text x="600" y="195" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="14" fill="#075A91" letter-spacing="0.5">Technologies</text>

    <text x="600" y="235" text-anchor="middle" font-family="serif" font-size="18" font-weight="bold" fill="#075A91" letter-spacing="6">NEXGEN TECHNOLOGIES LEARNING CENTER</text>
    <text x="600" y="280" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="44" font-weight="900" fill="#172033" letter-spacing="3">CERTIFICATE OF COMPLETION</text>
    <line x1="450" y1="305" x2="750" y2="305" stroke="#5ACB00" stroke-width="4" stroke-linecap="round"/>

    <!-- Body Text -->
    <text x="600" y="360" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#64748B">This is proudly presented and awarded to</text>
    
    <text x="600" y="440" text-anchor="middle" font-family="serif" font-size="52" font-weight="bold" fill="#075A91">${studentName}</text>
    <line x1="320" y1="465" x2="880" y2="465" stroke="#CBD5E1" stroke-width="1.5"/>

    <text x="600" y="515" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#475569">for successfully completing the comprehensive training program in</text>
    <text x="600" y="565" text-anchor="middle" font-family="sans-serif" font-size="34" font-weight="800" fill="#5ACB00">${course}</text>

    <!-- Signatures & Verification Info -->
    <g transform="translate(180, 680)">
      <!-- Left Signature -->
      <line x1="0" y1="0" x2="240" y2="0" stroke="#172033" stroke-width="2"/>
      <text x="120" y="25" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="bold" fill="#172033">Academic Director</text>
      <text x="120" y="45" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#64748B">NexGen Technologies</text>
    </g>

    <g transform="translate(780, 680)">
      <!-- Right Signature -->
      <line x1="0" y1="0" x2="240" y2="0" stroke="#172033" stroke-width="2"/>
      <text x="120" y="25" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="bold" fill="#172033">Managing Director</text>
      <text x="120" y="45" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#64748B">NexGen Technologies</text>
    </g>

    <!-- Central Security Stamp & Details -->
    <g transform="translate(600, 685)">
      <circle cx="0" cy="-10" r="42" fill="#F7F9FC" stroke="#5ACB00" stroke-width="3"/>
      <circle cx="0" cy="-10" r="34" fill="none" stroke="#075A91" stroke-width="1" stroke-dasharray="4,3"/>
      <text x="0" y="-14" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="bold" fill="#075A91">VERIFIED</text>
      <text x="0" y="1" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="bold" fill="#5ACB00">AUTHENTIC</text>
      <text x="0" y="52" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="bold" fill="#075A91">${certNumber}</text>
      <text x="0" y="70" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#64748B">Issued: ${issueDate}</text>
    </g>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// Initial demo data
function initLocalStore() {
  if (!localStorage.getItem(LOCAL_COURSES_KEY)) {
    const courses: Course[] = INITIAL_COURSES.map((name, index) => ({
      id: `crs-${index + 1}`,
      name,
      created_at: new Date('2026-01-01').toISOString(),
    }));
    localStorage.setItem(LOCAL_COURSES_KEY, JSON.stringify(courses));
  }

  if (!localStorage.getItem(LOCAL_STUDENTS_KEY)) {
    const students: Student[] = [
      {
        id: 'std-1',
        student_name: 'Abdiwahab Ahmed',
        course: 'Graphic Design',
        created_at: '2026-10-06T08:00:00.000Z',
      },
      {
        id: 'std-2',
        student_name: 'Fatima Zahra',
        course: 'Web Development',
        created_at: '2026-10-06T08:30:00.000Z',
      },
      {
        id: 'std-3',
        student_name: 'Mohamed Ali',
        course: 'Computer Networking',
        created_at: '2026-10-04T09:15:00.000Z',
      },
      {
        id: 'std-4',
        student_name: 'Halima Hassan',
        course: 'English',
        created_at: '2026-10-05T11:20:00.000Z',
      },
      {
        id: 'std-5',
        student_name: 'Yusuf Ibrahim',
        course: 'AI & Digital Skills',
        created_at: '2026-10-05T14:40:00.000Z',
      },
    ];
    localStorage.setItem(LOCAL_STUDENTS_KEY, JSON.stringify(students));
  }

  const rawCerts = localStorage.getItem(LOCAL_CERTIFICATES_KEY);
  if (!rawCerts) {
    const certs: Certificate[] = [
      {
        id: 'cert-1',
        certificate_number: 'NEX-2026-0001',
        student_id: 'std-1',
        student_name: 'Abdiwahab Ahmed',
        course: 'Graphic Design',
        certificate_file_url: generateCertificateDataUrl('Abdiwahab Ahmed', 'Graphic Design', 'NEX-2026-0001', 'October 6, 2026'),
        file_type: 'image/svg+xml',
        file_size: 4200,
        file_name: 'NEX-2026-0001-Abdiwahab-Ahmed.svg',
        issue_date: '2026-10-06',
        verification_status: 'VALID',
        created_at: '2026-10-06T08:05:00.000Z',
      },
      {
        id: 'cert-2',
        certificate_number: 'NEX-2026-0002',
        student_id: 'std-2',
        student_name: 'Fatima Zahra',
        course: 'Web Development',
        certificate_file_url: generateCertificateDataUrl('Fatima Zahra', 'Web Development', 'NEX-2026-0002', 'October 6, 2026'),
        file_type: 'image/svg+xml',
        file_size: 4180,
        file_name: 'NEX-2026-0002-Fatima-Zahra.svg',
        issue_date: '2026-10-06',
        verification_status: 'VALID',
        created_at: '2026-10-06T08:35:00.000Z',
      },
      {
        id: 'cert-3',
        certificate_number: 'NEX-2026-0003',
        student_id: 'std-3',
        student_name: 'Mohamed Ali',
        course: 'Computer Networking',
        certificate_file_url: generateCertificateDataUrl('Mohamed Ali', 'Computer Networking', 'NEX-2026-0003', 'October 4, 2026'),
        file_type: 'image/svg+xml',
        file_size: 4210,
        file_name: 'NEX-2026-0003-Mohamed-Ali.svg',
        issue_date: '2026-10-04',
        verification_status: 'REVOKED',
        created_at: '2026-10-04T09:20:00.000Z',
      },
    ];
    localDb.saveCertificates(certs);
    safeSetItem(LOCAL_CERTIFICATES_KEY, JSON.stringify(certs.map(toLightweightCert)));
  } else {
    try {
      const parsed: Certificate[] = JSON.parse(rawCerts);
      localDb.saveCertificates(parsed);
      safeSetItem(LOCAL_CERTIFICATES_KEY, JSON.stringify(parsed.map(toLightweightCert)));
    } catch (e) {
      console.warn('Certificate local migration warning:', e);
    }
  }

  if (!localStorage.getItem(LOCAL_SETTINGS_KEY)) {
    const settings: SystemSettings = {
      certificate_prefix: 'NEX',
      default_status: 'VALID',
    };
    localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(settings));
  }
}

// Execute initial load
initLocalStore();

export const dataService = {
  // --- COURSES ---
  async getCourses(): Promise<Course[]> {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb.from('courses').select('*').order('name', { ascending: true });
        if (!error && data) return data as Course[];
      } catch (e) {
        console.warn('Supabase getCourses failed, using local fallback:', e);
      }
    }
    const raw = localStorage.getItem(LOCAL_COURSES_KEY);
    return raw ? JSON.parse(raw) : [];
  },

  async addCourse(name: string): Promise<Course> {
    const trimmed = name.trim();
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb.from('courses').insert({ name: trimmed }).select().single();
        if (!error && data) {
          // also sync to local store
          const local = await this.getCourses();
          localStorage.setItem(LOCAL_COURSES_KEY, JSON.stringify([...local, data]));
          return data as Course;
        }
      } catch (e) {
        console.warn('Supabase addCourse failed, using local store:', e);
      }
    }
    const courses = await this.getCourses();
    if (courses.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      throw new Error(`Course "${trimmed}" already exists.`);
    }
    const newCourse: Course = {
      id: `crs-${Date.now()}`,
      name: trimmed,
      created_at: new Date().toISOString(),
    };
    courses.push(newCourse);
    localStorage.setItem(LOCAL_COURSES_KEY, JSON.stringify(courses));
    return newCourse;
  },

  async deleteCourse(id: string): Promise<void> {
    const sb = getSupabase();
    if (sb) {
      try {
        await sb.from('courses').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteCourse failed:', e);
      }
    }
    const courses = (await this.getCourses()).filter((c) => c.id !== id);
    localStorage.setItem(LOCAL_COURSES_KEY, JSON.stringify(courses));
  },

  // --- STUDENTS ---
  async getStudents(search?: string, courseFilter?: string): Promise<Student[]> {
    const raw = localStorage.getItem(LOCAL_STUDENTS_KEY);
    let localStudents: Student[] = raw ? JSON.parse(raw) : [];

    const sb = getSupabase();
    if (sb) {
      try {
        let query = sb.from('students').select('*').order('created_at', { ascending: false });
        if (search) {
          query = query.ilike('student_name', `%${search}%`);
        }
        if (courseFilter && courseFilter !== 'ALL') {
          query = query.eq('course', courseFilter);
        }
        const { data, error } = await query;
        if (!error && data && Array.isArray(data) && data.length > 0) {
          // Merge with any local students not yet in Supabase
          const sbIds = new Set(data.map((s: any) => s.id));
          const unsynced = localStudents.filter((s) => !sbIds.has(s.id));
          const merged = [...data, ...unsynced];
          localStorage.setItem(LOCAL_STUDENTS_KEY, JSON.stringify(merged));
          return merged as Student[];
        }
      } catch (e) {
        console.warn('Supabase getStudents failed, using local store:', e);
      }
    }

    let students = [...localStudents];
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      students = students.filter((s) => s.student_name.toLowerCase().includes(q));
    }
    if (courseFilter && courseFilter !== 'ALL') {
      students = students.filter((s) => s.course === courseFilter);
    }
    return students.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async getStudentById(id: string): Promise<Student | null> {
    const list = await this.getStudents();
    const found = list.find((s) => s.id === id);
    if (found) return found;

    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb.from('students').select('*').eq('id', id).maybeSingle();
        if (!error && data) return data as Student;
      } catch (e) {
        console.warn('Supabase getStudentById failed:', e);
      }
    }
    return null;
  },

  async addStudent(studentName: string, course: string): Promise<Student> {
    const name = studentName.trim();
    const crs = course.trim();
    if (!name) throw new Error('Student Name is required.');
    if (!crs) throw new Error('Course is required.');

    // 1. Create student record
    let newStudent: Student = {
      id: `std-${Date.now()}`,
      student_name: name,
      course: crs,
      created_at: new Date().toISOString(),
    };

    // 2. Always persist locally immediately so student is NEVER lost
    const raw = localStorage.getItem(LOCAL_STUDENTS_KEY);
    const existing: Student[] = raw ? JSON.parse(raw) : [];
    existing.unshift(newStudent);
    localStorage.setItem(LOCAL_STUDENTS_KEY, JSON.stringify(existing));

    // 3. Sync to Supabase if connected
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb
          .from('students')
          .insert({ student_name: name, course: crs })
          .select()
          .single();
        if (!error && data) {
          // Update the local entry with the real Supabase UUID
          const updatedList = existing.map((s) => (s.id === newStudent.id ? data : s));
          localStorage.setItem(LOCAL_STUDENTS_KEY, JSON.stringify(updatedList));
          return data as Student;
        } else if (error) {
          console.warn('Supabase insert note:', error.message);
        }
      } catch (e) {
        console.warn('Supabase addStudent network warning:', e);
      }
    }

    return newStudent;
  },

  async updateStudent(id: string, studentName: string, course: string): Promise<Student> {
    const name = studentName.trim();
    const crs = course.trim();
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb
          .from('students')
          .update({ student_name: name, course: crs })
          .eq('id', id)
          .select()
          .single();
        if (!error && data) return data as Student;
      } catch (e) {
        console.warn('Supabase updateStudent failed:', e);
      }
    }

    const students = await this.getStudents();
    const index = students.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Student not found.');
    students[index].student_name = name;
    students[index].course = crs;
    localStorage.setItem(LOCAL_STUDENTS_KEY, JSON.stringify(students));
    return students[index];
  },

  async deleteStudent(id: string): Promise<void> {
    const sb = getSupabase();
    if (sb) {
      try {
        await sb.from('students').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteStudent failed:', e);
      }
    }
    const students = (await this.getStudents()).filter((s) => s.id !== id);
    localStorage.setItem(LOCAL_STUDENTS_KEY, JSON.stringify(students));
  },

  // --- CERTIFICATES ---
  async getCertificates(search?: string, courseFilter?: string, statusFilter?: string): Promise<Certificate[]> {
    const dbCerts = await localDb.getAllCertificates();
    const raw = localStorage.getItem(LOCAL_CERTIFICATES_KEY);
    let localCerts: Certificate[] = [];
    if (raw) {
      try {
        localCerts = JSON.parse(raw);
      } catch (e) {}
    }

    // Merge preferring localDb since it stores authentic full files
    const certMap = new Map<string, Certificate>();
    for (const c of localCerts) {
      certMap.set(c.id, c);
    }
    for (const c of dbCerts) {
      const existing = certMap.get(c.id);
      if (!existing || (!c.certificate_file_url.startsWith('indexeddb://') && c.certificate_file_url)) {
        certMap.set(c.id, c);
      }
    }
    const combinedCerts = Array.from(certMap.values());

    const sb = getSupabase();
    if (sb) {
      try {
        let query = sb.from('certificates').select('*').order('created_at', { ascending: false });
        if (search) {
          query = query.or(`certificate_number.ilike.%${search}%,student_name.ilike.%${search}%,course.ilike.%${search}%`);
        }
        if (courseFilter && courseFilter !== 'ALL') {
          query = query.eq('course', courseFilter);
        }
        if (statusFilter && statusFilter !== 'ALL') {
          query = query.eq('verification_status', statusFilter);
        }
        const { data, error } = await query;
        if (!error && data && Array.isArray(data) && data.length > 0) {
          const sbIds = new Set(data.map((c: any) => c.id));
          const unsynced = combinedCerts.filter((c) => !sbIds.has(c.id));
          const merged = [...data, ...unsynced];
          safeSetItem(LOCAL_CERTIFICATES_KEY, JSON.stringify(merged.map(toLightweightCert)));
          return merged as Certificate[];
        }
      } catch (e) {
        console.warn('Supabase getCertificates failed, local fallback:', e);
      }
    }

    let certs = combinedCerts;

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      certs = certs.filter(
        (c) =>
          c.certificate_number.toLowerCase().includes(q) ||
          c.student_name.toLowerCase().includes(q) ||
          c.course.toLowerCase().includes(q)
      );
    }
    if (courseFilter && courseFilter !== 'ALL') {
      certs = certs.filter((c) => c.course === courseFilter);
    }
    if (statusFilter && statusFilter !== 'ALL') {
      certs = certs.filter((c) => c.verification_status === statusFilter);
    }

    return certs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async getCertificateById(id: string): Promise<Certificate | null> {
    const dbCert = await localDb.getCertificateById(id);
    if (dbCert && dbCert.certificate_file_url && !dbCert.certificate_file_url.startsWith('indexeddb://')) {
      return dbCert;
    }

    const list = await this.getCertificates();
    const found = list.find((c) => c.id === id);
    if (found) {
      if (found.certificate_file_url.startsWith('indexeddb://') && dbCert) {
        return dbCert;
      }
      return found;
    }

    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb.from('certificates').select('*').eq('id', id).maybeSingle();
        if (!error && data) return data as Certificate;
      } catch (e) {
        console.warn('Supabase getCertificateById failed:', e);
      }
    }
    return dbCert || null;
  },

  async getCertificateByNumber(certNumber: string): Promise<Certificate | null> {
    const cleanNumber = certNumber.trim().toUpperCase();
    const dbCert = await localDb.getCertificateByNumber(cleanNumber);
    if (dbCert && dbCert.certificate_file_url && !dbCert.certificate_file_url.startsWith('indexeddb://')) {
      return dbCert;
    }

    const list = await this.getCertificates();
    const found = list.find((c) => c.certificate_number.toUpperCase() === cleanNumber);
    if (found) {
      if (found.certificate_file_url.startsWith('indexeddb://') && dbCert) {
        return dbCert;
      }
      return found;
    }

    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb
          .from('certificates')
          .select('id, certificate_number, student_id, student_name, course, issue_date, verification_status, certificate_file_url, file_type, created_at')
          .ilike('certificate_number', cleanNumber)
          .maybeSingle();
        if (!error && data) return data as Certificate;
      } catch (e) {
        console.warn('Supabase getCertificateByNumber failed:', e);
      }
    }
    return dbCert || null;
  },

  // Generates next incremental certificate number: NEX-YEAR-0001
  async getNextCertificateNumber(prefixOverride?: string): Promise<string> {
    const settings = await this.getSettings();
    const prefix = prefixOverride || settings.certificate_prefix || 'NEX';
    const currentYear = new Date().getFullYear();

    const certs = await this.getCertificates();
    const pattern = new RegExp(`^${prefix}-${currentYear}-(\\d+)$`, 'i');
    let maxNum = 0;

    for (const c of certs) {
      const match = c.certificate_number.match(pattern);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }

    const nextSeq = String(maxNum + 1).padStart(4, '0');
    return `${prefix}-${currentYear}-${nextSeq}`;
  },

  async createCertificate(payload: {
    student_id: string;
    student_name: string;
    course: string;
    certificate_file_url: string;
    file_type: string;
    file_size?: number;
    file_name?: string;
    issue_date: string;
    verification_status?: VerificationStatus;
  }): Promise<Certificate> {
    const certNumber = await this.getNextCertificateNumber();
    const settings = await this.getSettings();

    const newRecord: Certificate = {
      id: `cert-${Date.now()}`,
      certificate_number: certNumber,
      student_id: payload.student_id,
      student_name: payload.student_name,
      course: payload.course,
      certificate_file_url: payload.certificate_file_url,
      file_type: payload.file_type,
      file_size: payload.file_size || 0,
      file_name: payload.file_name || `${certNumber}.${payload.file_type.split('/')[1] || 'pdf'}`,
      issue_date: payload.issue_date,
      verification_status: payload.verification_status || settings.default_status || 'VALID',
      created_at: new Date().toISOString(),
    };

    // 1. Save full record to IndexedDB (no 5MB quota limit)
    await localDb.saveCertificate(newRecord);

    // 2. Persist safely to localStorage with lightweight version
    const raw = localStorage.getItem(LOCAL_CERTIFICATES_KEY);
    let existing: Certificate[] = [];
    if (raw) {
      try {
        existing = JSON.parse(raw);
      } catch (e) {}
    }
    existing.unshift(toLightweightCert(newRecord));
    safeSetItem(LOCAL_CERTIFICATES_KEY, JSON.stringify(existing));

    // 3. Sync to Supabase if connected
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb.from('certificates').insert(newRecord).select().single();
        if (!error && data) {
          await localDb.saveCertificate(data as Certificate);
          const updatedList = existing.map((c) => (c.id === newRecord.id ? toLightweightCert(data) : c));
          safeSetItem(LOCAL_CERTIFICATES_KEY, JSON.stringify(updatedList));
          return data as Certificate;
        } else if (error) {
          console.warn('Supabase certificate insert note:', error.message);
        }
      } catch (e) {
        console.warn('Supabase createCertificate failed:', e);
      }
    }

    return newRecord;
  },

  async updateCertificateStatus(id: string, status: VerificationStatus): Promise<Certificate> {
    const cert = await this.getCertificateById(id);
    if (cert) {
      cert.verification_status = status;
      await localDb.saveCertificate(cert);
    }

    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb
          .from('certificates')
          .update({ verification_status: status })
          .eq('id', id)
          .select()
          .single();
        if (!error && data) return data as Certificate;
      } catch (e) {
        console.warn('Supabase updateCertificateStatus failed:', e);
      }
    }

    const certs = await this.getCertificates();
    const index = certs.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Certificate not found.');
    certs[index].verification_status = status;
    safeSetItem(LOCAL_CERTIFICATES_KEY, JSON.stringify(certs.map(toLightweightCert)));
    return certs[index];
  },

  async deleteCertificate(id: string): Promise<void> {
    await localDb.deleteCertificate(id);
    const cert = await this.getCertificateById(id);
    const sb = getSupabase();
    if (sb && cert) {
      try {
        // Also remove from storage bucket if stored in Supabase
        if (cert.file_name) {
          await sb.storage.from('certificates').remove([cert.file_name]);
        }
        await sb.from('certificates').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteCertificate failed:', e);
      }
    }

    const certs = (await this.getCertificates()).filter((c) => c.id !== id);
    safeSetItem(LOCAL_CERTIFICATES_KEY, JSON.stringify(certs.map(toLightweightCert)));
  },

  // --- UPLOAD FILE HELPER ---
  async uploadFile(file: File, certNumber: string): Promise<{ url: string; fileType: string; fileName: string; fileSize: number }> {
    const ext = file.name.split('.').pop() || 'pdf';
    const fileName = `${certNumber}_${Date.now()}.${ext}`;

    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb.storage.from('certificates').upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

        if (!error && data) {
          const { data: publicUrlData } = sb.storage.from('certificates').getPublicUrl(data.path);
          return {
            url: publicUrlData.publicUrl,
            fileType: file.type || 'application/pdf',
            fileName: data.path,
            fileSize: file.size,
          };
        }
      } catch (e) {
        console.warn('Supabase storage upload failed, falling back to base64 reader:', e);
      }
    }

    // Local Base64 FileReader fallback
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          url: reader.result as string,
          fileType: file.type || 'application/pdf',
          fileName: file.name,
          fileSize: file.size,
        });
      };
      reader.onerror = () => reject(new Error('Failed to read certificate file.'));
      reader.readAsDataURL(file);
    });
  },

  // --- DASHBOARD STATS ---
  async getDashboardStats(): Promise<DashboardStats> {
    const students = await this.getStudents();
    const certs = await this.getCertificates();
    const courses = await this.getCourses();

    const validCertificates = certs.filter((c) => c.verification_status === 'VALID').length;
    const revokedCertificates = certs.filter((c) => c.verification_status === 'REVOKED').length;

    return {
      totalStudents: students.length,
      totalCertificates: certs.length,
      validCertificates,
      revokedCertificates,
      totalCourses: courses.length,
    };
  },

  // --- SETTINGS ---
  async getSettings(): Promise<SystemSettings> {
    const raw = localStorage.getItem(LOCAL_SETTINGS_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        // ignore
      }
    }
    return {
      certificate_prefix: 'NEX',
      default_status: 'VALID',
    };
  },

  async updateSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
    const current = await this.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(updated));
    return updated;
  },

  // Reset to default demo data
  async resetDemoData(): Promise<void> {
    await localDb.clearAll();
    localStorage.removeItem(LOCAL_COURSES_KEY);
    localStorage.removeItem(LOCAL_STUDENTS_KEY);
    localStorage.removeItem(LOCAL_CERTIFICATES_KEY);
    localStorage.removeItem(LOCAL_SETTINGS_KEY);
    initLocalStore();
  },
};
