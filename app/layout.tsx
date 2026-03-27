import type { Metadata } from 'next';
import { Press_Start_2P } from 'next/font/google';
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
      <body suppressHydrationWarning>
        <div className="mc-noise" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}