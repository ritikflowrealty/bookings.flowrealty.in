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
  brochure_url: string;
  trust_point_1: string;
  trust_point_2: string;
  trust_point_3: string;
  payment_provider: string;
  razorpay_key_id: string;
  razorpay_key_secret_new: string;
  cashfree_app_id: string;
  cashfree_secret_key_new: string;
  cashfree_mode: string;
  crm_endpoint: string;
  crm_form_data: string;
  crm_company_id: string;
  crm_access_token: string;
  crm_api_key: string;
  crm_project_name: string;
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
  brochure_url: '',
  trust_point_1: '',
  trust_point_2: '',
  trust_point_3: '',
  payment_provider: 'razorpay',
  razorpay_key_id: '',
  razorpay_key_secret_new: '',
  cashfree_app_id: '',
  cashfree_secret_key_new: '',
  cashfree_mode: 'test',
  crm_endpoint: '',
  crm_form_data: '',
  crm_company_id: '',
  crm_access_token: '',
  crm_api_key: '',
  crm_project_name: '',
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
          brochure_url: project.brochure_url || '',
          trust_point_1: project.trust_point_1 || '',
          trust_point_2: project.trust_point_2 || '',
          trust_point_3: project.trust_point_3 || '',
          payment_provider: project.payment_provider || 'razorpay',
          razorpay_key_id: project.razorpay_key_id || '',
          razorpay_key_secret_new: '',
          cashfree_app_id: project.cashfree_app_id || '',
          cashfree_secret_key_new: '',
          cashfree_mode: project.cashfree_mode || 'test',
          crm_endpoint: project.crm_endpoint || '',
          crm_form_data: project.crm_form_data || '',
          crm_company_id: project.crm_company_id || '',
          crm_access_token: project.crm_access_token || '',
          crm_api_key: project.crm_api_key || '',
          crm_project_name: project.crm_project_name || '',
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
        brochure_url: form.brochure_url,
        trust_point_1: form.trust_point_1,
        trust_point_2: form.trust_point_2,
        trust_point_3: form.trust_point_3,
        payment_provider: form.payment_provider,
        razorpay_key_id: form.razorpay_key_id,
        cashfree_app_id: form.cashfree_app_id,
        cashfree_mode: form.cashfree_mode,
        crm_endpoint: form.crm_endpoint,
        crm_form_data: form.crm_form_data,
        crm_company_id: form.crm_company_id,
        crm_access_token: form.crm_access_token,
        crm_api_key: form.crm_api_key,
        crm_project_name: form.crm_project_name,
      };
      if (form.razorpay_key_secret_new) {
        payload.razorpay_key_secret = form.razorpay_key_secret_new;
      }
      if (form.cashfree_secret_key_new) {
        payload.cashfree_secret_key = form.cashfree_secret_key_new;
      }

      let url = '/api/admin/projects';
      let method: 'POST' | 'PUT' = 'POST';
      if (form.id) {
        url = `/api/admin/projects/${form.id}`;
        method = 'PUT';
      } else {
        payload.slug = form.slug;
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
              Changes reflect on the booking page within 60 seconds.
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
            hint="Recommended 1200x800px, < 300KB, JPG/PNG/WebP"
            full
          />
          <Input
            label="Learn More URL"
            value={form.learn_more_url}
            onChange={(v) => set('learn_more_url', v)}
            hint="Optional, opens in a new tab"
          />
          <Input
            label="Brochure Download URL"
            value={form.brochure_url}
            onChange={(v) => set('brochure_url', v)}
            hint="PDF link. Shows download button on project page."
          />

          {/* Trust points */}
          <div className="sm:col-span-2 mt-2 pt-4 border-t border-white/10">
            <p className="label">Project page trust points (editable)</p>
            <p className="text-xs text-ink-dim mt-1">
              These appear as bullet points on the booking page. Leave blank to use defaults.
            </p>
          </div>
          <Input
            label="Trust point 1"
            value={form.trust_point_1}
            onChange={(v) => set('trust_point_1', v)}
            placeholder="e.g. Reserve through verified Razorpay checkout"
          />
          <Input
            label="Trust point 2"
            value={form.trust_point_2}
            onChange={(v) => set('trust_point_2', v)}
            placeholder="e.g. Sales team reaches out within 24 hours"
          />
          <Input
            label="Trust point 3"
            value={form.trust_point_3}
            onChange={(v) => set('trust_point_3', v)}
            placeholder="e.g. Site visit and possession handled end-to-end"
            full
          />

          {/* Payment provider selector */}
          <div className="sm:col-span-2 mt-2 pt-4 border-t border-white/10">
            <p className="label">Payment gateway (only one active per project)</p>
          </div>
          <div className="sm:col-span-2">
            <div className="flex gap-4">
              <label className={`flex-1 glass rounded-xl p-4 cursor-pointer border-2 transition ${form.payment_provider === 'razorpay' ? 'border-neon-magenta/60' : 'border-transparent'}`}>
                <input
                  type="radio"
                  name="payment_provider"
                  value="razorpay"
                  checked={form.payment_provider === 'razorpay'}
                  onChange={() => set('payment_provider', 'razorpay')}
                  className="mr-2 accent-[#D92EFF]"
                />
                <span className="font-medium">Razorpay</span>
              </label>
              <label className={`flex-1 glass rounded-xl p-4 cursor-pointer border-2 transition ${form.payment_provider === 'cashfree' ? 'border-neon-magenta/60' : 'border-transparent'}`}>
                <input
                  type="radio"
                  name="payment_provider"
                  value="cashfree"
                  checked={form.payment_provider === 'cashfree'}
                  onChange={() => set('payment_provider', 'cashfree')}
                  className="mr-2 accent-[#D92EFF]"
                />
                <span className="font-medium">Cashfree</span>
              </label>
            </div>
          </div>

          {/* Razorpay credentials */}
          {form.payment_provider === 'razorpay' && (
            <>
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
            </>
          )}

          {/* Cashfree credentials */}
          {form.payment_provider === 'cashfree' && (
            <>
              <Input
                label="Cashfree App ID"
                value={form.cashfree_app_id}
                onChange={(v) => set('cashfree_app_id', v)}
                placeholder="Your Cashfree App ID"
              />
              <Input
                label={form.id ? 'New Cashfree Secret (leave blank to keep)' : 'Cashfree Secret Key'}
                value={form.cashfree_secret_key_new}
                onChange={(v) => set('cashfree_secret_key_new', v)}
                type="password"
                placeholder="••••••••"
              />
              <div>
                <span className="label block mb-1.5">Cashfree Mode</span>
                <select
                  value={form.cashfree_mode}
                  onChange={(e) => set('cashfree_mode', e.target.value)}
                  className="input"
                >
                  <option value="test">Sandbox (Test)</option>
                  <option value="production">Production (Live)</option>
                </select>
              </div>
            </>
          )}

          {/* External CRM integration */}
          <div className="sm:col-span-2 mt-2 pt-4 border-t border-white/10">
            <p className="label">CRM Integration (Totalityre)</p>
            <p className="text-xs text-ink-dim mt-1">
              Leads from CPs will auto-push to the developer's CRM. Leave blank to skip.
            </p>
          </div>
          <Input
            label="CRM Access Token"
            value={form.crm_access_token || ''}
            onChange={(v) => set('crm_access_token', v)}
            placeholder="e.g. 67f66691d5245e1d3e724f21"
          />
          <Input
            label="CRM Access API Key"
            value={form.crm_api_key || ''}
            onChange={(v) => set('crm_api_key', v)}
            placeholder="e.g. dcb2149d142f6619715bb25e15ca24ff"
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
