'use client';

import { useEffect, useState } from 'react';
import { RichTextEditor } from '@/components/RichTextEditor';

type Field = {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'rich' | 'select' | 'number' | 'image' | 'url' | 'date' | 'boolean';
  options?: string[];
  full?: boolean;
  hint?: string;
};

const ENTITIES: Record<string, { label: string; fields: Field[] }> = {
  team: {
    label: 'Team Members',
    fields: [
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'designation', label: 'Designation', type: 'text' },
      { key: 'category', label: 'Category', type: 'select', options: ['cofounder', 'leadership', 'team'] },
      { key: 'photo_url', label: 'Photo URL (square thumb)', type: 'image', hint: 'Square 400x400px, < 200KB, JPG/PNG' },
      { key: 'cutout_url', label: 'Cutout URL (transparent PNG, for founder stage)', type: 'image', full: true, hint: '1200x1500px portrait PNG with transparent background, < 800KB' },
      { key: 'bio', label: 'Bio', type: 'textarea', full: true },
      { key: 'pedigree', label: 'Pedigree (pipe-separated)', type: 'text', full: true, hint: 'e.g. NMIMS|NIT Trichy|Lodha Group' },
      { key: 'linkedin_url', label: 'LinkedIn URL', type: 'url' },
      { key: 'display_order', label: 'Display order', type: 'number' },
      { key: 'is_published', label: 'Published', type: 'boolean' },
    ],
  },
  awards: {
    label: 'Awards',
    fields: [
      { key: 'title', label: 'Title', type: 'text', full: true },
      { key: 'awarding_body', label: 'Awarding body', type: 'text' },
      { key: 'year', label: 'Year', type: 'number' },
      { key: 'image_url', label: 'Image URL', type: 'image' },
      { key: 'description', label: 'Description', type: 'textarea', full: true },
      { key: 'display_order', label: 'Display order', type: 'number' },
      { key: 'is_published', label: 'Published', type: 'boolean' },
    ],
  },
  news: {
    label: 'News & Press',
    fields: [
      { key: 'title', label: 'Title', type: 'text', full: true },
      { key: 'slug', label: 'Slug (URL)', type: 'text', hint: 'auto from title if blank' },
      { key: 'category', label: 'Category', type: 'select', options: ['news', 'blog', 'press'] },
      { key: 'author', label: 'Author', type: 'text' },
      { key: 'published_at', label: 'Published date', type: 'date' },
      { key: 'cover_image_url', label: 'Cover image URL', type: 'image', full: true },
      { key: 'external_url', label: 'External URL (if press link)', type: 'url', full: true, hint: 'If set, clicking opens this instead of detail page' },
      { key: 'excerpt', label: 'Excerpt (1-2 lines)', type: 'textarea', full: true },
      { key: 'content', label: 'Body (HTML)', type: 'rich', full: true },
      { key: 'meta_title', label: 'SEO title', type: 'text', full: true },
      { key: 'meta_description', label: 'SEO description', type: 'textarea', full: true },
      { key: 'is_published', label: 'Published', type: 'boolean' },
    ],
  },
  'case-studies': {
    label: 'Case Studies',
    fields: [
      { key: 'title', label: 'Title', type: 'text', full: true },
      { key: 'slug', label: 'Slug (URL)', type: 'text' },
      { key: 'subtitle', label: 'Subtitle', type: 'text', full: true },
      { key: 'client_name', label: 'Client name', type: 'text' },
      { key: 'cover_image_url', label: 'Cover image URL', type: 'image', full: true },
      { key: 'metric_1_label', label: 'Metric 1 label', type: 'text' },
      { key: 'metric_1_value', label: 'Metric 1 value', type: 'text' },
      { key: 'metric_2_label', label: 'Metric 2 label', type: 'text' },
      { key: 'metric_2_value', label: 'Metric 2 value', type: 'text' },
      { key: 'metric_3_label', label: 'Metric 3 label', type: 'text' },
      { key: 'metric_3_value', label: 'Metric 3 value', type: 'text' },
      { key: 'excerpt', label: 'Excerpt', type: 'textarea', full: true },
      { key: 'content', label: 'Body (HTML)', type: 'rich', full: true },
      { key: 'display_order', label: 'Display order', type: 'number' },
      { key: 'is_published', label: 'Published', type: 'boolean' },
    ],
  },
  testimonials: {
    label: 'Testimonials',
    fields: [
      { key: 'client_name', label: 'Client name', type: 'text' },
      { key: 'designation', label: 'Designation', type: 'text' },
      { key: 'company', label: 'Company', type: 'text' },
      { key: 'photo_url', label: 'Photo URL', type: 'image' },
      { key: 'quote', label: 'Quote', type: 'textarea', full: true },
      { key: 'rating', label: 'Rating (1-5)', type: 'number' },
      { key: 'display_order', label: 'Display order', type: 'number' },
      { key: 'is_published', label: 'Published', type: 'boolean' },
    ],
  },
  faqs: {
    label: 'FAQs',
    fields: [
      { key: 'scope', label: 'Scope', type: 'select', options: ['global', 'location', 'configuration', 'budget', 'project'] },
      { key: 'scope_ref_id', label: 'Scope ref ID (if not global)', type: 'number' },
      { key: 'question', label: 'Question', type: 'textarea', full: true },
      { key: 'answer', label: 'Answer', type: 'textarea', full: true },
      { key: 'display_order', label: 'Display order', type: 'number' },
      { key: 'is_published', label: 'Published', type: 'boolean' },
    ],
  },
  pages: {
    label: 'Static Pages',
    fields: [
      { key: 'slug', label: 'Slug (URL)', type: 'text' },
      { key: 'title', label: 'Title', type: 'text', full: true },
      { key: 'hero_image_url', label: 'Hero image URL', type: 'image' },
      { key: 'hero_video_url', label: 'Hero video URL', type: 'url' },
      { key: 'content', label: 'Body (HTML)', type: 'rich', full: true },
      { key: 'meta_title', label: 'SEO title', type: 'text', full: true },
      { key: 'meta_description', label: 'SEO description', type: 'textarea', full: true },
      { key: 'is_published', label: 'Published', type: 'boolean' },
    ],
  },
  partners: {
    label: 'Partners',
    fields: [
      { key: 'name', label: 'Partner name', type: 'text' },
      { key: 'category', label: 'Category', type: 'select', options: ['developer', 'banking', 'channel'] },
      { key: 'logo_url', label: 'Logo (transparent PNG)', type: 'image', full: true, hint: 'Recommended 240x80px PNG with transparent background' },
      { key: 'website_url', label: 'Website URL', type: 'url', full: true },
      { key: 'display_order', label: 'Display order', type: 'number' },
      { key: 'is_published', label: 'Published', type: 'boolean' },
    ],
  },
};

export function ContentManagement({ authHeader }: { authHeader: () => HeadersInit }) {
  const [entity, setEntity] = useState<keyof typeof ENTITIES>('team');
  const [items, setItems] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | 'new' | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const r = await fetch(`/api/admin/content/${entity}`, { headers: authHeader() });
      const d = await r.json();
      if (d.ok) setItems(d.items);
      else setError(d.message);
    } catch (err: any) {
      setError(err?.message || 'Load failed.');
    }
  }
  useEffect(() => { load(); }, [entity]); // eslint-disable-line

  async function deleteItem(id: number) {
    if (!confirm('Delete this entry?')) return;
    await fetch(`/api/admin/content/${entity}/${id}`, { method: 'DELETE', headers: authHeader() });
    await load();
  }

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="inline-flex p-1 rounded-full glass overflow-x-auto max-w-full">
          {(Object.keys(ENTITIES) as (keyof typeof ENTITIES)[]).map((e) => (
            <button
              key={e}
              onClick={() => setEntity(e)}
              className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${
                entity === e ? 'bg-neon-gradient text-white' : 'text-ink-muted hover:text-ink'
              }`}
            >
              {ENTITIES[e].label}
            </button>
          ))}
        </div>
        <button onClick={() => setEditing('new')} className="btn-neon text-sm">+ New {ENTITIES[entity].label.replace(/s$/, '')}</button>
      </div>

      {error && <div className="mt-4 rounded-xl border border-neon-pink/30 bg-neon-pink/10 px-4 py-3 text-sm">{error}</div>}

      <div className="mt-6 grid gap-3">
        {items.length === 0 && (
          <div className="glass rounded-2xl p-8 text-center text-ink-muted">No {ENTITIES[entity].label.toLowerCase()} yet.</div>
        )}
        {items.map((it) => (
          <article key={it.id} className="glass rounded-2xl p-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <p className="font-medium truncate">
                {it.title || it.name || it.client_name || it.question || it.slug || `Entry #${it.id}`}
              </p>
              <p className="text-xs text-ink-dim truncate">
                {it.designation || it.subtitle || it.category || it.scope || it.awarding_body || ''}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {it.is_published === 0 && <span className="chip text-amber-300 border-amber-300/30">Draft</span>}
              <button onClick={() => setEditing(it)} className="btn-ghost text-xs px-3 py-1.5">Edit</button>
              <button onClick={() => deleteItem(it.id)} className="text-xs text-ink-dim hover:text-neon-pink">Delete</button>
            </div>
          </article>
        ))}
      </div>

      {editing !== null && (
        <ContentEditor
          entity={entity}
          fields={ENTITIES[entity].fields}
          item={editing === 'new' ? null : editing}
          authHeader={authHeader}
          onClose={() => setEditing(null)}
          onSaved={async () => { setEditing(null); await load(); }}
        />
      )}
    </section>
  );
}

function ContentEditor({
  entity, fields, item, authHeader, onClose, onSaved,
}: {
  entity: string;
  fields: Field[];
  item: any | null;
  authHeader: () => HeadersInit;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<any>(item || fields.reduce((acc, f) => ({
    ...acc,
    [f.key]: f.type === 'boolean' ? true : f.type === 'number' ? 0 : '',
  }), {}));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(k: string, v: any) {
    setForm((s: any) => ({ ...s, [k]: v }));
  }

  async function uploadImage(file: File): Promise<string> {
    setUploading(true);
    try {
      const r = await fetch('/api/admin/upload-url', {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({ type: 'misc', filename: file.name, contentType: file.type }),
      });
      const d = await r.json();
      if (!r.ok || !d.ok) throw new Error(d.message || 'Upload URL failed.');
      const put = await fetch(d.uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
      if (!put.ok) throw new Error('Upload failed.');
      return d.publicUrl;
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const url = item ? `/api/admin/content/${entity}/${item.id}` : `/api/admin/content/${entity}`;
      const method = item ? 'PUT' : 'POST';
      const r = await fetch(url, { method, headers: authHeader(), body: JSON.stringify(form) });
      const d = await r.json();
      if (!r.ok || !d.ok) {
        setError(d.message || 'Save failed.');
      } else {
        onSaved();
      }
    } catch (err: any) {
      setError(err?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-3xl glass-strong rounded-3xl shadow-card max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 z-10 backdrop-blur-2xl bg-bg/80 border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <h3 className="font-display text-xl">{item ? 'Edit' : 'New'} entry</h3>
          <button onClick={onClose} className="btn-ghost text-sm">Cancel</button>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map((f) => {
            const value = form[f.key] ?? '';
            const wrapClass = f.full ? 'block sm:col-span-2' : 'block';
            if (f.type === 'boolean') {
              return (
                <label key={f.key} className={`${wrapClass} flex items-center gap-3 cursor-pointer`}>
                  <input
                    type="checkbox"
                    checked={value !== 0 && value !== false}
                    onChange={(e) => set(f.key, e.target.checked ? 1 : 0)}
                    className="h-4 w-4 accent-[#D92EFF]"
                  />
                  <span className="text-sm">{f.label}</span>
                </label>
              );
            }
            if (f.type === 'select') {
              return (
                <label key={f.key} className={wrapClass}>
                  <span className="label block mb-1.5">{f.label}</span>
                  <select className="input" value={value} onChange={(e) => set(f.key, e.target.value)}>
                    <option value="">—</option>
                    {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </label>
              );
            }
            if (f.type === 'rich') {
              return (
                <label key={f.key} className={wrapClass}>
                  <span className="label block mb-1.5">{f.label}{f.hint ? ` · ${f.hint}` : ''}</span>
                  <RichTextEditor
                    value={value}
                    onChange={(html) => set(f.key, html)}
                    placeholder="Write the body. Use the toolbar for formatting."
                  />
                </label>
              );
            }
            if (f.type === 'textarea') {
              return (
                <label key={f.key} className={wrapClass}>
                  <span className="label block mb-1.5">{f.label}{f.hint ? ` · ${f.hint}` : ''}</span>
                  <textarea
                    className="input min-h-[80px]"
                    value={value}
                    onChange={(e) => set(f.key, e.target.value)}
                    rows={3}
                  />
                </label>
              );
            }
            if (f.type === 'image') {
              return (
                <label key={f.key} className={wrapClass}>
                  <span className="label block mb-1.5">{f.label}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      className="input"
                      value={value}
                      onChange={(e) => set(f.key, e.target.value)}
                      placeholder="https://...r2.dev/..."
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const url = await uploadImage(file);
                          set(f.key, url);
                        } catch (err: any) {
                          setError(err?.message || 'Upload failed.');
                        }
                      }}
                      className="text-xs file:mr-2 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-white/10 file:text-white file:cursor-pointer"
                    />
                  </div>
                  {value && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={value} alt="" className="mt-2 h-20 w-auto rounded-lg border border-white/10" />
                  )}
                  {uploading && <p className="text-xs text-ink-muted mt-1">Uploading…</p>}
                </label>
              );
            }
            return (
              <label key={f.key} className={wrapClass}>
                <span className="label block mb-1.5">{f.label}{f.hint ? ` · ${f.hint}` : ''}</span>
                <input
                  type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : f.type === 'url' ? 'url' : 'text'}
                  className="input"
                  value={value}
                  min={f.type === 'number' ? 0 : undefined}
                  onChange={(e) => set(f.key, f.type === 'number' ? Math.max(0, Number(e.target.value)) : e.target.value)}
                />
              </label>
            );
          })}
        </div>

        {error && <div className="mx-6 mb-4 rounded-xl border border-neon-pink/30 bg-neon-pink/10 px-4 py-3 text-sm">{error}</div>}

        <div className="sticky bottom-0 backdrop-blur-2xl bg-bg/80 border-t border-white/10 px-6 py-4 flex items-center justify-end gap-3">
          <button onClick={onClose} className="btn-ghost text-sm">Cancel</button>
          <button onClick={save} disabled={saving} className="btn-neon text-sm">
            {saving ? 'Saving…' : item ? 'Save changes' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}
