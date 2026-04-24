import type { Metadata } from 'next';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { Providers } from './providers';
import { Josefin_Sans, Lato } from 'next/font/google';

const josefinSans = Josefin_Sans({
  subsets: ['latin'],
  variable: '--font-josefin',
  display: 'swap',
});

const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-lato',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PDF Intelligence Platform',
  description: 'Multi-agent AI system for PDF analysis',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${josefinSans.variable} ${lato.variable}`}>
      <body>
        <AppRouterCacheProvider>
          <Providers>{children}</Providers>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
