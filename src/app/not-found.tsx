import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-5 lg:px-8 py-24 text-center">
        <p className="text-7xl font-display neon-text">404</p>
        <h1 className="mt-4 font-display text-3xl">Page not found</h1>
        <p className="mt-2 text-ink-muted">
          The project may have been disabled, or the link is incorrect.
        </p>
        <Link href="/" className="btn-neon mt-8 inline-flex">
          Back to home
        </Link>
      </main>
      <Footer />
    </>
  );
}
