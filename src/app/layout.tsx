import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sidd.Whizz | Event Host, Emcee & Public Speaker [DEMO]',
  description:
    'Siddharth Maurya — Live event host, corporate emcee, and conference moderator. Official portfolio and booking enquiry platform [DEMO].',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
};

export const viewport: Viewport = {
  themeColor: '#090611',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-primary selection:text-foreground">
        {children}
      </body>
    </html>
  );
}

