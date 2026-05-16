import type { Metadata, Viewport } from 'next';
import { Instrument_Sans, Fraunces } from 'next/font/google';
import './globals.css';

const instrument = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-instrument',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
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
    'Book your provisional unit in 60 seconds. Premium residential projects across Bangalore, Mysuru, Bhubaneswar, with secure Razorpay checkout.',
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
    <html lang="en" className={`${instrument.variable} ${fraunces.variable}`}>
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
                'Sales outsourcing partner for premium residential developers in South India.',
              areaServed: ['Bangalore', 'Mysuru', 'Bhubaneswar', 'Hyderabad'],
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
      <body className="min-h-screen bg-bg font-sans">{children}</body>
    </html>
  );
}
