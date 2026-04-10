import type { Metadata } from 'next';
import { Outfit, Noto_Sans_JP } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { DisableNumberScroll } from '@/components/DisableNumberScroll';

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

const notoSansJP = Noto_Sans_JP({
  variable: '--font-noto-sans-jp',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Trecahub - トレカ投資・資産管理',
  description: 'トレーディングカードの投資・資産管理アプリ',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${outfit.variable} ${notoSansJP.variable}`}
      style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
    >
      <body>
        <div className="noise" />
        {children}
        <DisableNumberScroll />
        <Script
          src="https://code.iconify.design/3/3.1.0/iconify.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
