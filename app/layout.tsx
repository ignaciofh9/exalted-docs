import './global.css';
import { RootProvider } from 'fumadocs-ui/provider';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';
import { GameDataProvider } from '@/app/GameDataContext/GameDataContext';
import type { Metadata } from 'next';

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'FE10 Exalted',
  description: 'Documentation for FE10 Exalted',
  icons: {
    icon: [
      { url: '/images/logo/favicon.ico', sizes: 'any' },
      { url: '/images/logo/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/images/logo/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/images/logo/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { url: '/images/logo/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/images/logo/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body>
        <RootProvider>
          <GameDataProvider>{children}</GameDataProvider>
        </RootProvider>
      </body>
    </html>
  );
}