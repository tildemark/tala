import type { Metadata } from 'next';
import React from 'react';
import './globals.css';
import { Layout1 } from '@/components/layouts/layout-1';
import { ThemeProvider } from 'next-themes';

export const metadata: Metadata = {
  title: 'TALA - Philippine Accounting System',
  description: 'Multi-tenant BIR-compliant accounting system for Philippine businesses',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <Layout1>{children}</Layout1>
        </ThemeProvider>
      </body>
    </html>
  );
}
