import type { Metadata } from 'next';
import { Press_Start_2P } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const minecraftFont = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-minecraft',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CodeQuest',
  description: 'Learn to code. Level up. Conquer the block.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={minecraftFont.variable}>
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