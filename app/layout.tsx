import type { Metadata } from 'next';
import { Playfair_Display, Inter, Cormorant_Garamond } from 'next/font/google';
import './globals.css';

const playfair = Playfair_Display({
  variable: '--font-heading',
  subsets: ['latin'],
  display: 'swap',
});

const inter = Inter({
  variable: '--font-body',
  subsets: ['latin'],
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  variable: '--font-accent',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CRM — Concierge Nurse Business Society',
  description: 'Internal CRM for managing contacts, campaigns, and community',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} ${cormorant.variable} h-full`}>
      <body className="h-full antialiased">
        {children}
      </body>
    </html>
  );
}
