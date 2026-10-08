# NEXGEN TECHNOLOGIES — Certificate Management System

A modern, full-stack, responsive web platform built for **NexGen Technologies** (technology and language learning center). The system enables staff to register students, upload and securely store completion certificates, generate unique QR-coded credentials, and provide an instant public verification portal for employers and institutions.

---

## 1. Project Overview

The **NexGen Technologies Certificate Management System** streamlines academic credential issuance and validation:

- **Ultra-Simple Student Registration**: Strictly records **Student Name** and **Course** (zero unnecessary personal data).
- **Automated Certificate ID Generation**: Standardized formatting (e.g., `NEX-2026-0001`) with automatic incrementing.
- **Secure File Storage**: Supports PDF, JPG, JPEG, and PNG uploads up to 10 MB in Supabase Storage.
- **QR Code Verification**: Generates high-resolution QR codes that point directly to the public verification endpoint.
- **Public Verification Portal**: Accessible at `/verify` and `/verify/:certificateNumber` without requiring an account or login. Displays authentic credentials or clear revoked/not-found notices while keeping private database details hidden.
- **Free-Tier Architecture**: Engineered entirely to operate within generous free tiers (Supabase Free, Vercel Hobby, open-source libraries).

---

## 2. Technology Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS (Brand colors: NexGen Green `#5ACB00`, NexGen Blue `#075A91`, Background `#F7F9FC`, Text `#172033`)
- **Icons**: Lucide React
- **QR Code Engine**: `qrcode` (Free open-source Canvas/SVG generator)
- **Backend & Database**: Supabase PostgreSQL + Row Level Security (RLS)
- **Authentication**: Supabase Auth (with local hybrid fallback)
- **File Storage**: Supabase Storage (`certificates` bucket)
- **Hosting**: Vercel Free / Hobby or Cloud Run

---

## 3. How to Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and click **Start your project** (Free).
2. Sign in with GitHub or your email.
3. Click **New Project**.
4. Choose an organization, enter project name: `nexgen-certificates`.
5. Set a strong database password and pick your nearest region.
6. Click **Create new project** and wait 1–2 minutes for provisioning.

---

## 4. How to Create the Database & Tables

Once your Supabase project is ready:
1. In the Supabase sidebar, click **SQL Editor**.
2. Click **New Query**.
3. Open the file `supabase/schema.sql` from this repository.
4. Copy the entire contents and paste into the Supabase SQL Editor.
5. Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`).

This will create:
- `courses` table (with the 14 default courses)
- `students` table (UUID primary key, student_name, course)
- `certificates` table (unique certificate_number, relations, status)
- High-speed lookup indexes

---

## 5. How to Run SQL Schema & Policies

The `supabase/schema.sql` script also enables **Row Level Security (RLS)**:
- **Public**: Can verify certificates by certificate number and read course names.
- **Authenticated Admins**: Have full CRUD access to register students, upload certificates, update statuses, or delete records.

If you ever need to re-run policies, execute `supabase/schema.sql` again in the Supabase SQL Editor.

---

## 6. How to Configure Supabase Storage

1. In Supabase Dashboard, click **Storage** in the sidebar.
2. Click **New Bucket**.
3. Name the bucket: `certificates`.
4. Toggle **Public bucket** to `ON` (so verified document URLs can be displayed to students/employers).
5. Set allowed MIME types: `application/pdf`, `image/jpeg`, `image/png`.
6. Set maximum file size: `10MB` (`10485760` bytes).
7. Save the bucket.

*(Note: The provided `supabase/schema.sql` includes the storage bucket creation and policies automatically).*

---

## 7. How to Create an Admin Account

### Option A: Via Supabase Dashboard
1. Go to **Authentication** -> **Users** in your Supabase project.
2. Click **Add user** -> **Create user**.
3. Enter:
   - Email: `admin@nexgen.com`
   - Password: `your-secure-password`
4. Confirm creation.

### Option B: Built-in Local Administrator
For immediate evaluation or offline operation:
- Email: `admin@nexgen.com`
- Password: `adminpassword123`

---

## 8. How to Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Add your Supabase project credentials (found in **Project Settings -> API**):

```env
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

> **Security Note**: Never expose `SUPABASE_SERVICE_ROLE_KEY` in frontend code. Only use `VITE_SUPABASE_ANON_KEY`.

You can also enter or test your Supabase URL and Key directly in the application UI under **Settings -> Supabase Database Integration**.

---

## 9. How to Run Locally

1. Clone or extract the repository:
   ```bash
   cd applet
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the local development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 10. How to Deploy to Vercel (100% Free Tier)

1. Push your repository to **GitHub**.
2. Visit [https://vercel.com](https://vercel.com) and log in.
3. Click **Add New...** -> **Project**.
4. Import your `nexgen-certificates` GitHub repository.
5. In **Build and Output Settings**:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. In **Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
7. Click **Deploy**. Your system is live with a free SSL certificate!

---

## 11. How to Connect GitHub

1. Initialize git if not already tracked:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: NexGen Technologies Certificate System"
   ```
2. Create a new repository on [GitHub](https://github.com/new).
3. Connect and push:
   ```bash
   git remote add origin https://github.com/your-username/nexgen-certificates.git
   git branch -M main
   git push -u origin main
   ```

---

## 12. How Certificate Verification Works

1. **Student Completion**: Staff registers a student (Name and Course only) and uploads their signed/scanned certificate file (or generates a digital certificate).
2. **ID & QR Generation**: The system assigns an incrementing Certificate Number (e.g., `NEX-2026-0001`) and creates a QR code pointing to `${domain}/verify/NEX-2026-0001`.
3. **Physical / Digital Distribution**: The student receives the certificate with the embedded QR code.
4. **Instant Public Scan**:
   - Anyone scanning the QR code or visiting `/verify` enters the Certificate Number.
   - **Valid**: Green indicator `✓ VALID CERTIFICATE` showing Student Name, Course, Issue Date, and status `VALID`.
   - **Revoked**: Warning indicator `⚠ CERTIFICATE REVOKED`.
   - **Invalid/Not Found**: Clear error `✕ CERTIFICATE NOT FOUND`.
   - **Zero Data Leakage**: Sensitive administrator emails, storage paths, and internal IDs are never exposed on public pages.
