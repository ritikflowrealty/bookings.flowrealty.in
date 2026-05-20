'use client';

import { useEffect, useState } from 'react';

const fields: { key: string; label: string; hint?: string; type?: 'text' | 'textarea' | 'url' }[] = [
  { key: 'hero_video_url', label: 'Hero video URL (R2)', hint: 'MP4 or WebM. Muted, autoplay, looped. 6-12 seconds, < 5 MB.', type: 'url' },
  { key: 'hero_video_poster', label: 'Hero video poster image URL', type: 'url' },
  { key: 'hero_headline', label: 'Hero headline' },
  { key: 'hero_subheadline', label: 'Hero subheadline', type: 'textarea' },
  { key: 'contact_phone', label: 'Phone number' },
  { key: 'contact_email', label: 'Contact email' },
  { key: 'contact_address', label: 'Address line 1' },
  { key: 'contact_address_line_2', label: 'Address line 2' },
  { key: 'cities_covered', label: 'Cities (comma separated)', hint: 'e.g. Bangalore,Mysore,Bhubaneswar' },
  { key: 'coming_soon_cities', label: 'Coming soon cities (comma separated)' },
  { key: 'total_sales_value', label: 'Total residential sales value', hint: 'e.g. 3500' },
  { key: 'total_sales_unit', label: 'Sales value unit', hint: 'Cr or Lakhs' },
  { key: 'years_active', label: 'Years active' },
  { key: 'cp_distribution_size', label: 'CP distribution network size' },
  { key: 'team_size', label: 'Team size' },
  { key: 'developers_count', label: 'Developer count' },
  { key: 'projects_count', label: 'Projects count' },
  { key: 'social_linkedin', label: 'LinkedIn URL', type: 'url' },
  { key: 'social_instagram', label: 'Instagram URL', type: 'url' },
  { key: 'social_youtube', label: 'YouTube URL', type: 'url' },
  { key: 'whatsapp_number', label: 'WhatsApp number (with country code)' },
];

export function SettingsEditor({ authHeader }: { authHeader: () => HeadersInit }) {
  const [values, setValues] = useState<Record<string, string>>({});
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

  return (
    <section className="mt-6">
      <div className="glass rounded-3xl p-6 sm:p-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="font-display text-2xl">Site settings</h3>
            <p className="text-xs text-ink-muted">These values populate the public site instantly.</p>
          </div>
          <div className="flex items-center gap-3">
            {savedAt && <span className="text-xs text-emerald-300">Saved at {savedAt}</span>}
            <button onClick={save} disabled={saving} className="btn-neon text-sm">
              {saving ? 'Saving…' : 'Save settings'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-neon-pink/30 bg-neon-pink/10 px-4 py-3 text-sm">{error}</div>
        )}

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map((f) => (
            <label key={f.key} className={f.type === 'textarea' ? 'block sm:col-span-2' : 'block'}>
              <span className="label block mb-1.5">{f.label}</span>
              {f.type === 'textarea' ? (
                <textarea className="input min-h-[80px]" value={values[f.key] || ''} onChange={(e) => set(f.key, e.target.value)} />
              ) : (
                <input
                  type={f.type === 'url' ? 'url' : 'text'}
                  className="input"
                  value={values[f.key] || ''}
                  onChange={(e) => set(f.key, e.target.value)}
                />
              )}
              {f.hint && <span className="block mt-1 text-[11px] text-ink-dim">{f.hint}</span>}
            </label>
          ))}
        </div>
      </div>
    </section>
  );
}
