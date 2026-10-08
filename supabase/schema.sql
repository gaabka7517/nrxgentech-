-- ==============================================================================
-- NEXGEN TECHNOLOGIES CERTIFICATE MANAGEMENT SYSTEM
-- Supabase PostgreSQL Schema & Security Policies
-- ==============================================================================

-- 1. COURSES TABLE
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. STUDENTS TABLE (Strictly Student Name and Course only)
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_name TEXT NOT NULL,
    course TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. CERTIFICATES TABLE
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certificate_number TEXT NOT NULL UNIQUE,
    student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
    student_name TEXT NOT NULL,
    course TEXT NOT NULL,
    certificate_file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT DEFAULT 0,
    file_name TEXT,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    verification_status TEXT NOT NULL DEFAULT 'VALID' CHECK (verification_status IN ('VALID', 'REVOKED')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. INDEXES FOR HIGH-SPEED LOOKUP
CREATE INDEX IF NOT EXISTS idx_students_name ON public.students(student_name);
CREATE INDEX IF NOT EXISTS idx_students_course ON public.students(course);
CREATE INDEX IF NOT EXISTS idx_certificates_number ON public.certificates(certificate_number);
CREATE INDEX IF NOT EXISTS idx_certificates_student_name ON public.certificates(student_name);
CREATE INDEX IF NOT EXISTS idx_certificates_status ON public.certificates(verification_status);

-- 5. INITIAL COURSES SEED
INSERT INTO public.courses (name) VALUES
    ('Computer Basics'),
    ('Microsoft Office'),
    ('Graphic Design'),
    ('Video Editing'),
    ('Web Development'),
    ('Computer Networking'),
    ('Mobile Maintenance'),
    ('Hardware & Software'),
    ('CCTV'),
    ('AI & Digital Skills'),
    ('English'),
    ('Amharic'),
    ('Arabic'),
    ('Other')
ON CONFLICT (name) DO NOTHING;

-- 6. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Drop any previous restrictive policies
DROP POLICY IF EXISTS "Admins manage courses" ON public.courses;
DROP POLICY IF EXISTS "Public read courses" ON public.courses;
DROP POLICY IF EXISTS "Admins full access students" ON public.students;
DROP POLICY IF EXISTS "Admins manage certificates" ON public.certificates;
DROP POLICY IF EXISTS "Public can verify certificates" ON public.certificates;

-- Courses Policies
CREATE POLICY "Allow all access to courses"
    ON public.courses FOR ALL
    USING (true)
    WITH CHECK (true);

-- Students Policies
CREATE POLICY "Allow all access to students"
    ON public.students FOR ALL
    USING (true)
    WITH CHECK (true);

-- Certificates Policies
CREATE POLICY "Allow all access to certificates"
    ON public.certificates FOR ALL
    USING (true)
    WITH CHECK (true);

-- 7. SUPABASE STORAGE BUCKET CONFIGURATION
-- Run in Supabase SQL Editor to initialize or update the 'certificates' bucket:
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'certificates',
    'certificates',
    true, -- public URLs for view/download of authorized certificates
    52428800, -- 50MB limit
    ARRAY['application/pdf', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET
    allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png'],
    file_size_limit = 52428800;

-- Drop previous restrictive storage policies
DROP POLICY IF EXISTS "Admins can upload certificates" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update and delete certificate files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete certificate files" ON storage.objects;
DROP POLICY IF EXISTS "Public can view certificates" ON storage.objects;

-- Storage Policies:
CREATE POLICY "Allow public read certificates"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'certificates');

CREATE POLICY "Allow upload certificates"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'certificates');

CREATE POLICY "Allow manage certificate files"
    ON storage.objects FOR ALL
    USING (bucket_id = 'certificates');
