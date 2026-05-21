'use client';

import { useEffect, useRef, useState } from 'react';

type FieldType = 'text' | 'textarea' | 'url' | 'image' | 'video' | 'number';
type Field = { key: string; label: string; hint?: string; type?: FieldType };
type Group = { id: string; label: string; description?: string; fields: Field[] };

const GROUPS: Group[] = [
  {
    id: 'hero',
    label: 'Homepage Hero',
    description: 'The full-viewport video banner at the top of the homepage.',
    fields: [
      { key: 'hero_video_url', label: 'Hero video', hint: 'MP4 or WebM. Muted, autoplay, looped. 10-20 seconds, < 8 MB recommended.', type: 'video' },
      { key: 'hero_video_poster', label: 'Hero video poster image', hint: '1920x1080 JPG/WebP. Shown while video loads.', type: 'image' },
      { key: 'hero_headline', label: 'Hero headline', hint: 'Last sentence is auto-highlighted in neon.' },
      { key: 'hero_subheadline', label: 'Hero subheadline', type: 'textarea' },
    ],
  },
  {
    id: 'numbers',
    label: 'Stat Numbers',
    description: 'Numbers shown on homepage stats counter and Why Choose Us.',
    fields: [
      { key: 'total_sales_value', label: 'Total residential sales value', hint: 'e.g. 3500', type: 'number' },
      { key: 'total_sales_unit', label: 'Sales value unit', hint: 'Cr or Lakhs' },
      { key: 'years_active', label: 'Years active', type: 'number' },
      { key: 'projects_count', label: 'Projects turnaround count', type: 'number' },
      { key: 'team_size', label: 'Team size', type: 'number' },
      { key: 'cp_distribution_size', label: 'CP network size', type: 'number' },
      { key: 'developers_count', label: 'Developer partners count', type: 'number' },
      { key: 'potential_inventory', label: 'Potential inventory next 12 months (Cr)', type: 'number' },
    ],
  },
  {
    id: 'contact',
    label: 'Contact Details',
    fields: [
      { key: 'contact_phone', label: 'Phone number' },
      { key: 'contact_email', label: 'Contact email' },
      { key: 'contact_address', label: 'Address line 1' },
      { key: 'contact_address_line_2', label: 'Address line 2' },
      { key: 'whatsapp_number', label: 'WhatsApp number', hint: 'With country code, no spaces. e.g. 919900000000' },
    ],
  },
  {
    id: 'cities',
    label: 'Cities & Coverage',
    fields: [
      { key: 'cities_covered', label: 'Cities covered', hint: 'Comma separated. e.g. Bangalore,Mysore,Bhubaneswar', type: 'textarea' },
      { key: 'coming_soon_cities', label: 'Coming soon cities', hint: 'Comma separated.', type: 'textarea' },
    ],
  },
  {
    id: 'social',
    label: 'Social Media',
    fields: [
      { key: 'social_linkedin', label: 'LinkedIn URL', type: 'url' },
      { key: 'social_instagram', label: 'Instagram URL', type: 'url' },
      { key: 'social_youtube', label: 'YouTube URL', type: 'url' },
      { key: 'social_twitter', label: 'X (Twitter) URL', type: 'url' },
      { key: 'social_facebook', label: 'Facebook URL', type: 'url' },
    ],
  },
  {
    id: 'about',
    label: 'About / Story Section',
    fields: [
      { key: 'about_headline', label: 'About headline', hint: 'Story banner under hero.', type: 'textarea' },
      { key: 'about_paragraph', label: 'About paragraph', type: 'textarea' },
    ],
  },
  {
    id: 'careers',
    label: 'Careers CTA',
    fields: [
      { key: 'careers_headline', label: 'Careers CTA headline' },
      { key: 'careers_subline', label: 'Careers CTA description', type: 'textarea' },
    ],
  },
];

export function SettingsEditor({ authHeader }: { authHeader: () => HeadersInit }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [activeGroup, setActiveGroup] = useState<string>('hero');
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/settings', { headers: authHeader() })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setValues(d.settings || {});
      })
      .catch((err) => setError(err?.message || 'Load failed.'));
  }, []); // eslint-disable-line

  function set(k: string, v: string) {
    setValues((s) => ({ ...s, [k]: v }));
  }

  async function save() {
    setError(null);
    setSaving(true);
    setSavedAt(null);
    try {
      const r = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: authHeader(),
        body: JSON.stringify(values),
      });
      const d = await r.json();
      if (!r.ok || !d.ok) {
        setError(d.message || 'Save failed.');
      } else {
        setSavedAt(new Date().toLocaleTimeString());
      }
    } finally {
      setSaving(false);
    }
  }

  const group = GROUPS.find((g) => g.id === activeGroup) || GROUPS[0];

  return (
    <section className="mt-6">
      <div className="glass rounded-3xl p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div>
            <h3 className="font-display text-2xl">Site settings</h3>
            <p className="text-xs text-ink-muted">Edit every value the public site reads from CMS.</p>
          </div>
          <div className="flex items-center gap-3">
            {savedAt && <span className="text-xs text-emerald-300">Saved at {savedAt}</span>}
            <button onClick={save} disabled={saving} className="btn-neon text-sm">
              {saving ? 'Saving…' : 'Save all settings'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-neon-pink/30 bg-neon-pink/10 px-4 py-3 text-sm">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 self-start">
            <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible -mx-4 lg:mx-0 px-4 lg:px-0 pb-2 lg:pb-0">
              {GROUPS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setActiveGroup(g.id)}
                  className={`text-left text-sm px-4 py-2.5 rounded-xl whitespace-nowrap lg:whitespace-normal transition-colors ${
                    activeGroup === g.id
                      ? 'bg-neon-gradient text-white shadow-glow'
                      : 'text-ink-muted hover:text-ink hover:bg-white/5'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </aside>

          {/* Form */}
          <div>
            <div className="mb-5">
              <h4 className="font-display text-xl">{group.label}</h4>
              {group.description && (
                <p className="text-sm text-ink-muted mt-1">{group.description}</p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {group.fields.map((f) => (
                <FieldRow
                  key={f.key}
                  field={f}
                  value={values[f.key] || ''}
                  onChange={(v) => set(f.key, v)}
                  authHeader={authHeader}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FieldRow({
  field,
  value,
  onChange,
  authHeader,
}: {
  field: Field;
  value: string;
  onChange: (v: string) => void;
  authHeader: () => HeadersInit;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const isFile = field.type === 'image' || field.type === 'video';
  const fullWidth = field.type === 'textarea' || field.type === 'image' || field.type === 'video';

  async function uploadFile(file: File) {
    setUploadError(null);
    setUploading(true);
    try {
      const r = await fetch('/api/admin/upload-url', {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({ type: 'misc', filename: file.name, contentType: file.type }),
      });
      const d = await r.json();
      if (!r.ok || !d.ok) throw new Error(d.message || 'Could not get upload URL.');
      const put = await fetch(d.uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
      if (!put.ok) throw new Error('Upload to R2 failed.');
      onChange(d.publicUrl);
    } catch (err: any) {
      setUploadError(err?.message || 'Upload failed.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <label className={fullWidth ? 'block sm:col-span-2' : 'block'}>
      <span className="label block mb-1.5">{field.label}</span>

      {field.type === 'textarea' && (
        <textarea
          className="input min-h-[90px]"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {field.type === 'number' && (
        <input
          type="number"
          min={0}
          className="input"
          value={value}
          onChange={(e) => onChange(String(Math.max(0, Number(e.target.value || 0))))}
        />
      )}

      {(field.type === 'text' || !field.type) && (
        <input type="text" className="input" value={value} onChange={(e) => onChange(e.target.value)} />
      )}

      {field.type === 'url' && (
        <input type="url" className="input" value={value} onChange={(e) => onChange(e.target.value)} />
      )}

      {isFile && (
        <>
          <div className="flex items-center gap-2">
            <input
              type="url"
              className="input"
              placeholder="https://...r2.dev/..."
              value={value}
              onChange={(e) => onChange(e.target.value)}
            />
            <input
              ref={fileRef}
              type="file"
              accept={field.type === 'video' ? 'video/*' : 'image/*'}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadFile(f);
              }}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="btn-ghost text-xs whitespace-nowrap px-3 py-2"
            >
              {uploading ? 'Uploading…' : 'Choose file'}
            </button>
          </div>
          {value && field.type === 'image' && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={value} alt="" className="mt-2 h-20 w-auto rounded-lg border border-white/10 object-cover" />
          )}
          {value && field.type === 'video' && (
            <video src={value} muted playsInline className="mt-2 h-24 w-auto rounded-lg border border-white/10" />
          )}
          {uploadError && <p className="text-xs text-neon-pink mt-1">{uploadError}</p>}
        </>
      )}

      {field.hint && <span className="block mt-1 text-[11px] text-ink-dim">{field.hint}</span>}
    </label>
  );
}
