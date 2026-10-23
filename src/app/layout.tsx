import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { ThemeScript } from '@/components/theme/ThemeSync';
import './globals.css';

export const metadata: Metadata = {
  title: 'FinQuest – All your money. In one place.',
  description: 'Private personal wealth management. Track 20+ asset classes, net worth, cashflow, and goals with zero bank logins.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <ThemeScript />
      </head>
      <body>
        {children}
        <Toaster position="top-right" richColors theme="dark" />
      </body>
    </html>
  );
}
