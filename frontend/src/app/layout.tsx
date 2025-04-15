import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'XEIN Platform | GLOBAL',
  description: 'XEIN staking platform',
  icons: {
    icon: '/images/favicon.png',
    apple: '/images/favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" style={{ backgroundColor: '#000000' }}>
      <head>
        <link rel="icon" href="/images/favicon.png" />
        <link rel="apple-touch-icon" href="/images/favicon.png" />
      </head>
      <body className={inter.className} style={{ backgroundColor: '#000000' }}>
        <AuthProvider>
          <NotificationProvider>
            <main className="min-h-screen bg-transparent pt-16">
              {children}
            </main>
            <ToastContainer />
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
} 