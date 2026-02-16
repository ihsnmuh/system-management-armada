import type { Metadata } from 'next';
import { Public_Sans, Geist_Mono } from 'next/font/google';
import './globals.css';
import QueryProvider from './providers/query-provider';
import Navbar from '@/components/Navbar';
import 'leaflet/dist/leaflet.css';

import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';

const publicSans = Public_Sans({
  variable: '--font-public-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'System Management Armada',
  description:
    'Sistem dashboard monitoring armada real-time berbasis Next.js dengan integrasi MBTA API untuk pelacakan kendaraan, rute, dan jadwal.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${publicSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <Navbar />
          <Toaster />
          <main>{children}</main>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryProvider>
      </body>
    </html>
  );
}
