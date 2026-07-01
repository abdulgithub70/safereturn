import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: {
    default: 'SafeReturn — Missing Child Platform',
    template: '%s | SafeReturn',
  },
  description:
    'Helping reunite missing children with their families through community reporting and verification.',
  keywords: ['missing child', 'child safety', 'reunification', 'amber alert'],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://safereturn.org'),
  openGraph: {
    title: 'SafeReturn — Missing Child Platform',
    description: 'Helping reunite missing children with their families.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'hsl(var(--card))',
              color: 'hsl(var(--card-foreground))',
              border: '1px solid hsl(var(--border))',
            },
          }}
        />
      </body>
    </html>
  );
}
