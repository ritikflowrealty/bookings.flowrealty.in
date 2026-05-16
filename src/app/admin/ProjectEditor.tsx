'use client';

import { useEffect, useState } from 'react';

type Editable = {
  id?: number;
  slug: string;
  name: string;
  developer: string;
  city: string;
  description: string;
  highlight_text: string;
  image_url: string;
  learn_more_url: string;
  razorpay_key_id: string;
  // We only ever send a new secret on save; never display existing one.
  razorpay_key_secret_new: string;
  is_visible?: number;
  booking_enabled?: number;
  payment_enabled?: number;
};

const empty: Editable = {
  slug: '',
  name: '',
  developer: '',
  city: '',
  description: '',
  highlight_text: '',
  image_url: '',
  learn_more_url: '',
  razorpay_key_id: '',
  razorpay_key_secret_new: '',
};

export function ProjectEditor({
  project,
  onClose,
  onSaved,
  authHeader,
}: {
  project: any | null;
  onClose: () => void;
  onSaved: () => void;
  authHeader: () => HeadersInit;
}) {
  const [form, setForm] = useState<Editable>(() =>
    project
      ? {
          id: project.id,
          slug: project.slug,
          name: project.name,
          developer: project.developer,
          city: project.city,
          description: project.description || '',
          highlight_text: project.highlight_text || '',
          image_url: project.image_url || '',
          learn_more_url: project.learn_more_url || '',
          razorpay_key_id: project.razorpay_key_id || '',
          razorpay_key_secret_new: '',
        }
      : empty
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function set<K extends keyof Editable>(k: K, v: Editable[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save() {
    setError(null);
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: form.name,
        developer: form.developer,
        city: form.city,
        description: form.description,
        highlight_text: form.highlight_text,
        image_url: form.image_url,
        learn_more_url: form.learn_more_url,
        razorpay_key_id: form.razorpay_key_id,
      };
      // Only send new secret if user typed one; otherwise server keeps the stored one.
      if (form.razorpay_key_secret_new) {
        payload.razorpay_key_secret = form.razorpay_key_secret_new;
      }

      let url = '/api/admin/projects';
      let method: 'POST' | 'PUT' = 'POST';
      if (form.id) {
        url = `/api/admin/projects/${form.id}`;
        method = 'PUT';
      } else {
        payload.slug = form.slug;
        // For new projects, require both key + secret to allow enabling later
        if (form.razorpay_key_secret_new)
          payload.razorpay_key_secret = form.razorpay_key_secret_new;
      }

      const r = await fetch(url, { method, headers: authHeader(), body: JSON.stringify(payload) });
      const d = await r.json();
      if (!r.ok || !d.ok) {
        setError(d.message || 'Save failed.');
        setSaving(false);
        return;
      }
      onSaved();
    } catch (err: any) {
      setError(err?.message || 'Save failed.');
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-3xl glass-strong rounded-3xl shadow-card max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 z-10 backdrop-blur-2xl bg-bg/80 border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl">
              {form.id ? 'Edit project' : 'Add project'}
            </h2>
            <p className="text-xs text-ink-muted">
              Changes save instantly and reflect on the booking page within 60 seconds.
            </p>
          </div>
          <button onClick={onClose} className="btn-ghost text-sm">Cancel</button>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {!form.id && (
            <Input label="Slug (URL)" value={form.slug} onChange={(v) => set('slug', v)}
              hint="auto-generated from name if blank" />
          )}
          <Input label="Project name" value={form.name} onChange={(v) => set('name', v)} required />
          <Input label="Developer" value={form.developer} onChange={(v) => set('developer', v)} required />
          <Input label="City" value={form.city} onChange={(v) => set('city', v)} required />
          <Input
            label="Highlight (e.g. 500 units booked)"
            value={form.highlight_text}
            onChange={(v) => set('highlight_text', v)}
            hint="Leave blank to hide the badge"
            full
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={(v) => set('description', v)}
          />
          <Input
            label="Image URL"
            value={form.image_url}
            onChange={(v) => set('image_url', v)}
            hint="Recommended 1200×800px, < 300KB, JPG/PNG/WebP"
            full
          />
          <Input
            label="Learn More URL"
            value={form.learn_more_url}
            onChange={(v) => set('learn_more_url', v)}
            hint="Optional, opens in a new tab"
            full
          />

          <div className="sm:col-span-2 mt-2 pt-4 border-t border-white/10">
            <p className="label">Razorpay credentials (per project)</p>
            <p className="text-xs text-ink-dim mt-1">
              Booking and payment toggles can only be turned on after both key id and secret are
              saved. Secrets are write-only and never shown again after saving.
            </p>
          </div>
          <Input
            label="Razorpay Key ID"
            value={form.razorpay_key_id}
            onChange={(v) => set('razorpay_key_id', v)}
            placeholder="rzp_test_xxx or rzp_live_xxx"
          />
          <Input
            label={form.id ? 'New Razorpay Secret (leave blank to keep)' : 'Razorpay Secret'}
            value={form.razorpay_key_secret_new}
            onChange={(v) => set('razorpay_key_secret_new', v)}
            type="password"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="mx-6 mb-4 rounded-xl border border-neon-pink/30 bg-neon-pink/10 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div className="sticky bottom-0 backdrop-blur-2xl bg-bg/80 border-t border-white/10 px-6 py-4 flex items-center justify-end gap-3">
          <button onClick={onClose} className="btn-ghost text-sm">Cancel</button>
          <button onClick={save} disabled={saving} className="btn-neon text-sm">
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  hint,
  required,
  type = 'text',
  placeholder,
  full,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  full?: boolean;
}) {
  return (
    <label className={`block ${full ? 'sm:col-span-2' : ''}`}>
      <span className="label block mb-1.5">
        {label}
        {required && <span className="text-neon-pink ml-0.5">*</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input"
        placeholder={placeholder}
      />
      {hint && <span className="block mt-1 text-[11px] text-ink-dim">{hint}</span>}
    </label>
  );
}

function Textarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block sm:col-span-2">
      <span className="label block mb-1.5">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input min-h-[100px] resize-y"
        rows={3}
      />
    </label>
  );
}
