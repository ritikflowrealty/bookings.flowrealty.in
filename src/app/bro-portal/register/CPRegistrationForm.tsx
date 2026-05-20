'use client';

import { useState } from 'react';

type Form = {
  full_name: string;
  email: string;
  mobile: string;
  whatsapp: string;
  rera_number: string;
  aadhaar_number: string;
  pan_number: string;
  company_name: string;
  city: string;
};

type FileSlot = 'rera_doc' | 'aadhaar_doc' | 'pan_doc' | 'photo';

export function CPRegistrationForm() {
  const [form, setForm] = useState<Form>({
    full_name: '',
    email: '',
    mobile: '',
    whatsapp: '',
    rera_number: '',
    aadhaar_number: '',
    pan_number: '',
    company_name: '',
    city: 'Bangalore',
  });
  const [files, setFiles] = useState<Partial<Record<FileSlot, File>>>({});
  const [uploadProgress, setUploadProgress] = useState<Partial<Record<FileSlot, number>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof Form>(k: K, v: Form[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function setFile(slot: FileSlot, f: File | undefined) {
    setFiles((s) => ({ ...s, [slot]: f }));
  }

  async function uploadOne(slot: FileSlot, file: File): Promise<string> {
    // Get pre-signed URL from server
    const r = await fetch('/api/cp/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slot, filename: file.name, contentType: file.type }),
    });
    const d = await r.json();
    if (!r.ok || !d.ok) throw new Error(d.message || `Could not get upload URL for ${slot}`);

    // Upload file directly to R2
    const put = await fetch(d.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });
    if (!put.ok) throw new Error(`Upload failed for ${slot}`);
    setUploadProgress((p) => ({ ...p, [slot]: 100 }));
    return d.publicUrl;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validation
    if (form.full_name.trim().length < 2) return setError('Enter your full name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError('Enter a valid email.');
    if (!/^[6-9]\d{9}$/.test(form.mobile)) return setError('Enter a 10-digit Indian mobile.');
    if (!form.rera_number.trim()) return setError('RERA number is required.');
    if (!/^\d{12}$/.test(form.aadhaar_number)) return setError('Aadhaar must be 12 digits.');
    if (!/^[A-Z]{5}\d{4}[A-Z]$/.test(form.pan_number.toUpperCase()))
      return setError('PAN must look like ABCDE1234F.');
    if (!files.rera_doc) return setError('Upload RERA certificate.');
    if (!files.aadhaar_doc) return setError('Upload Aadhaar.');
    if (!files.pan_doc) return setError('Upload PAN.');
    if (!files.photo) return setError('Upload your photo.');

    setSubmitting(true);
    try {
      // Upload all 4 files in parallel
      const [reraUrl, aadhaarUrl, panUrl, photoUrl] = await Promise.all([
        uploadOne('rera_doc', files.rera_doc!),
        uploadOne('aadhaar_doc', files.aadhaar_doc!),
        uploadOne('pan_doc', files.pan_doc!),
        uploadOne('photo', files.photo!),
      ]);

      const r = await fetch('/api/cp/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          pan_number: form.pan_number.toUpperCase(),
          rera_doc_url: reraUrl,
          aadhaar_doc_url: aadhaarUrl,
          pan_doc_url: panUrl,
          photo_url: photoUrl,
        }),
      });
      const d = await r.json();
      if (!r.ok || !d.ok) {
        setError(d.message || 'Registration failed.');
        setSubmitting(false);
        return;
      }
      setDone(true);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Try again.');
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto w-14 h-14 rounded-full bg-neon-gradient flex items-center justify-center shadow-glow">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="mt-5 font-display text-2xl">Registration submitted</h3>
        <p className="mt-2 text-ink-muted max-w-md mx-auto">
          Our team reviews registrations within 24 hours. We&rsquo;ll email you at <strong>{form.email}</strong> the moment you&rsquo;re approved, and you can sign in.
        </p>
        <a href="/bro-portal/login" className="btn-ghost mt-8 inline-flex">Go to sign in</a>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      <SectionTitle>Personal details</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Full name" required value={form.full_name} onChange={(v) => set('full_name', v)} />
        <Input label="Email" type="email" required value={form.email} onChange={(v) => set('email', v)} />
        <Input label="Mobile (10 digits)" required maxLength={10} value={form.mobile} onChange={(v) => set('mobile', v.replace(/\D/g, ''))} />
        <Input label="WhatsApp (optional)" maxLength={10} value={form.whatsapp} onChange={(v) => set('whatsapp', v.replace(/\D/g, ''))} />
        <Input label="Company name" value={form.company_name} onChange={(v) => set('company_name', v)} />
        <Field label="City">
          <select className="input" value={form.city} onChange={(e) => set('city', e.target.value)}>
            <option>Bangalore</option>
            <option>Mysore</option>
            <option>Bhubaneswar</option>
            <option>Hyderabad</option>
            <option>Other</option>
          </select>
        </Field>
      </div>

      <SectionTitle>KYC details</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="RERA number" required value={form.rera_number} onChange={(v) => set('rera_number', v)} />
        <Input label="Aadhaar number (12 digits)" required maxLength={12} value={form.aadhaar_number} onChange={(v) => set('aadhaar_number', v.replace(/\D/g, ''))} />
        <Input label="PAN" required value={form.pan_number} onChange={(v) => set('pan_number', v.toUpperCase())} />
      </div>

      <SectionTitle>Documents</SectionTitle>
      <p className="text-xs text-ink-dim -mt-2">JPG, PNG or PDF. Max 5 MB per file.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FileInput label="RERA certificate" required onChange={(f) => setFile('rera_doc', f)} progress={uploadProgress.rera_doc} />
        <FileInput label="Aadhaar (front + back)" required onChange={(f) => setFile('aadhaar_doc', f)} progress={uploadProgress.aadhaar_doc} />
        <FileInput label="PAN card" required onChange={(f) => setFile('pan_doc', f)} progress={uploadProgress.pan_doc} />
        <FileInput label="Your photo" required onChange={(f) => setFile('photo', f)} progress={uploadProgress.photo} />
      </div>

      {error && (
        <div className="rounded-xl border border-neon-pink/30 bg-neon-pink/10 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <button type="submit" disabled={submitting} className="btn-neon">
        {submitting ? 'Submitting…' : 'Submit registration'}
      </button>
      <p className="text-[11px] text-ink-dim">
        Files are uploaded directly to Cloudflare R2. We never store them on the booking server.
      </p>
    </form>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="font-display text-lg pt-2 border-t border-white/5 first:border-0 first:pt-0">{children}</h3>;
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block">
      <span className="label block mb-1.5">
        {label}{required && <span className="text-neon-pink ml-0.5">*</span>}
      </span>
      {children}
    </label>
  );
}

function Input({
  label, required, type = 'text', value, onChange, maxLength, placeholder,
}: {
  label: string; required?: boolean; type?: string; value: string;
  onChange: (v: string) => void; maxLength?: number; placeholder?: string;
}) {
  return (
    <Field label={label} required={required}>
      <input
        type={type}
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        placeholder={placeholder}
      />
    </Field>
  );
}

function FileInput({
  label, required, onChange, progress,
}: { label: string; required?: boolean; onChange: (f: File | undefined) => void; progress?: number }) {
  return (
    <Field label={label} required={required}>
      <div className="flex items-center gap-3">
        <input
          type="file"
          accept="image/png,image/jpeg,application/pdf"
          onChange={(e) => onChange(e.target.files?.[0])}
          className="input file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-white/10 file:text-white file:cursor-pointer"
        />
        {progress === 100 && <span className="text-xs text-emerald-300">✓ Uploaded</span>}
      </div>
    </Field>
  );
}
