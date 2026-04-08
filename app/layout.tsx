import type { Metadata } from 'next';
import { Press_Start_2P, Inter, Plus_Jakarta_Sans, Instrument_Serif } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const minecraftFont = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-minecraft',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-instrument',
  display: 'swap',
  style: 'italic',
});

export const metadata: Metadata = {
  title: 'CodeQuest',
  description: 'Learn to code. Level up. Conquer the block.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${minecraftFont.variable} ${inter.variable} ${plusJakartaSans.variable} ${instrumentSerif.variable}`}>
      <head>
        <Script 
          src="https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js" 
          strategy="beforeInteractive"
        />
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}