import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SectionReveal } from '@/components/SectionReveal';
import { EnquireForm } from '@/app/enquire/EnquireForm';
import { getSettings, setting } from '@/lib/settings';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export const metadata = {
  title: 'Contact Flow Realty | Speak to a Real Estate Advisor',
  description: 'Reach Flow Realty\'s sales advisors. Phone, email, and form. We respond within 2 hours during business days.',
};

export default async function ContactPage() {
  const s = await getSettings();
  const phone = setting(s, 'contact_phone', '+91 80 1234 5678');
  const email = setting(s, 'contact_email', 'hello@flowrealty.in');
  const addr1 = setting(s, 'contact_address', 'Richards Town, Bangalore');
  const addr2 = setting(s, 'contact_address_line_2', '3rd Floor, Clarke Road');
  const whatsapp = setting(s, 'whatsapp_number', '');

  return (
    <>
      <Navbar />
      <main className="pt-12 pb-24">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <SectionReveal>
            <span className="chip">Contact</span>
            <h1 className="mt-4 font-display text-5xl tracking-tight">Talk to us.</h1>
            <p className="mt-3 max-w-2xl text-ink-muted leading-relaxed">
              Whether you&rsquo;re looking for a home or want Flow to handle sales for your project, we respond within 2 hours.
            </p>
          </SectionReveal>

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <aside className="lg:col-span-5 grid gap-4">
              <a href={`tel:${phone.replace(/\s+/g, '')}`} className="glass rounded-2xl p-6 hover:bg-white/[0.07] transition-colors">
                <p className="label">Call</p>
                <p className="mt-2 font-display text-2xl">{phone}</p>
                <p className="text-xs text-ink-dim mt-1">Mon to Sat, 9 AM to 7 PM</p>
              </a>
              <a href={`mailto:${email}`} className="glass rounded-2xl p-6 hover:bg-white/[0.07] transition-colors">
                <p className="label">Email</p>
                <p className="mt-2 font-display text-2xl">{email}</p>
                <p className="text-xs text-ink-dim mt-1">Replies within 2 hours</p>
              </a>
              {whatsapp && (
                <a href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="glass rounded-2xl p-6 hover:bg-white/[0.07] transition-colors">
                  <p className="label">WhatsApp</p>
                  <p className="mt-2 font-display text-2xl">{whatsapp}</p>
                </a>
              )}
              <div className="glass rounded-2xl p-6">
                <p className="label">Visit</p>
                <p className="mt-2 font-display text-2xl">{addr1}</p>
                <p className="text-xs text-ink-dim mt-1">{addr2}</p>
              </div>
            </aside>

            <SectionReveal className="lg:col-span-7">
              <div className="glass rounded-3xl p-6 sm:p-8">
                <h2 className="font-display text-2xl">Tell us what you&rsquo;re looking for</h2>
                <p className="mt-1 text-sm text-ink-muted">An advisor calls within 2 hours.</p>
                <div className="mt-6">
                  <EnquireForm />
                </div>
              </div>
            </SectionReveal>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
