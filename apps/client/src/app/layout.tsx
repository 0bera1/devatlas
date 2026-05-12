import { AccessTokenRefreshScheduler } from '@/components/providers/access-token-refresh-scheduler';
import { AuthProvider } from '@/components/providers/auth-provider';
import { LocaleProvider } from '@/components/providers/locale-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { ToastProvider } from '@/components/providers/toast-provider';
import { ThemeInitScript } from '@/components/theme/theme-init-script';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'DevAtlas',
  description: 'DevAtlas uygulaması',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="flex min-h-full flex-col"
        suppressHydrationWarning
      >
        <ThemeInitScript />
        <AuthProvider>
          <LocaleProvider>
            <ThemeProvider>
              <QueryProvider>
                <AccessTokenRefreshScheduler />
                <ToastProvider>{children}</ToastProvider>
              </QueryProvider>
            </ThemeProvider>
          </LocaleProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
