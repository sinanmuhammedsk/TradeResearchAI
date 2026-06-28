import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import ParticleBackground from '../components/ParticleBackground';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'AI Stock Analysis & Automated Investment Research Agent',
  description: 'Autonomous financial intelligence tool for real-time stock analysis. Scan balance sheets, market news catalysts, equity sentiment, and SWOT profiles to generate institutional-grade stock valuation reports.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} h-full font-sans antialiased`}
      >
        <ParticleBackground />
        {children}
      </body>
    </html>
  );
}
