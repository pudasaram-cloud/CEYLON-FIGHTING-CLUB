import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { ClubProvider } from '@/context/ClubContext';
import { ToastContainer } from '@/components/ui/ToastContainer';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CEYLON FIGHTING CLUB | Management System',
  description: 'Manage Fighters. Build Champions. Official combat sports management platform for Ceylon Fighting Club (CFC) headquarters.',
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
    <html lang="en" className={`${outfit.variable} ${inter.variable} dark`}>
      <body className="bg-black text-white min-h-screen antialiased selection:bg-blue-600 selection:text-white">
        <ClubProvider>
          {children}
          <ToastContainer />
        </ClubProvider>
      </body>
    </html>
  );
}
