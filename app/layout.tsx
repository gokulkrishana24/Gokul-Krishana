import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';

const bodyFont = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const displayFont = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://gokulkrishana.vercel.app'),
  title: 'Gokul Krishana — Cybersecurity Student & Full-Stack Developer',
  description:
    'Gokul Krishana is a Computer Science Engineering student specializing in Cybersecurity, building software systems, AI/ML applications, computer vision projects and interactive digital experiences.',
  keywords: ['Gokul Krishana', 'portfolio', 'cybersecurity', 'full-stack developer', 'AI/ML', 'computer vision'],
  authors: [{ name: 'Gokul Krishana' }],
  openGraph: {
    title: 'Gokul Krishana — Cybersecurity Student & Full-Stack Developer',
    description:
      'Gokul Krishana is a Computer Science Engineering student specializing in Cybersecurity, building software systems, AI/ML applications, computer vision projects and interactive digital experiences.',
    url: '/',
    siteName: 'Gokul Krishana',
    type: 'profile',
    images: [{ url: '/images/og.jpg', width: 1200, height: 630, alt: 'Gokul Krishana' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gokul Krishana — Cybersecurity Student & Full-Stack Developer',
    description:
      'Gokul Krishana is a Computer Science Engineering student specializing in Cybersecurity, building software systems, AI/ML applications, computer vision projects and interactive digital experiences.',
    images: ['/images/og.jpg'],
  },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
  },
};

export const viewport: Viewport = {
  themeColor: '#070A10',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bodyFont.variable} ${displayFont.variable}`}>
      <body>{children}</body>
    </html>
  );
}
