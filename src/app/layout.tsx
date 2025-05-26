import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Pelota Libre TV - Ver fútbol en vivo y en directo',
  description: 'Ver Pelota Libre TV online en vivo y en directo. Disfruta de canales gratuitos de streaming para ver partidos de fútbol argentino, Copa Libertadores, Copa Sudamericana, Champions League y más, en FULL HD.',
  keywords: 'pelota libre, fútbol en vivo, streaming de fútbol, ver partidos online, fútbol gratis',
  authors: [{ name: 'Pelota Libre TV' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    title: 'Pelota Libre TV - Ver fútbol en vivo y en directo',
    description: 'Ver Pelota Libre TV online en vivo y en directo. Disfruta de canales gratuitos de streaming.',
    siteName: 'Pelota Libre TV',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
