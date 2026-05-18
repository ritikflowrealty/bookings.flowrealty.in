import type { Metadata, Viewport } from 'next';
import { Onest, Fraunces } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';

const onest = Onest({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://booking.flowrealty.in';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Flow Realty Bookings | Premium Homes in Bangalore & Mysore',
    template: '%s | Flow Realty',
  },
  description:
    'Reserve your home in seconds. Curated residential projects across Bangalore, Mysore, and Bhubaneswar from India\'s leading developers.',
  keywords: [
    'Flow Realty',
    'Bangalore real estate',
    'Mysore property',
    'home booking',
    'Sipani City',
    'Sumadhura',
    'UKN Realty',
    'Razorpay booking',
  ],
  openGraph: {
    title: 'Flow Realty Bookings',
    description: 'Premium homes. Instant provisional booking. Backed by India\'s leading developers.',
    url: SITE_URL,
    siteName: 'Flow Realty',
    type: 'website',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Flow Realty Bookings',
    description: 'Premium homes. Instant provisional booking.',
  },
  robots: { index: true, follow: true },
  alternates: { canonical: SITE_URL },
};

export const viewport: Viewport = {
  themeColor: '#0B0B0F',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${onest.variable} ${fraunces.variable}`}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'RealEstateAgent',
              name: 'Flow Realty',
              url: SITE_URL,
              description:
                'Sales outsourcing partner for premium residential developers across India.',
              areaServed: ['Bangalore', 'Mysore', 'Bhubaneswar', 'Hyderabad'],
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Bangalore',
                addressRegion: 'Karnataka',
                addressCountry: 'IN',
              },
            }),
          }}
        />
      </head>
      <body className="min-h-screen bg-bg font-sans">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
