import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LuminaWeb Enhancement Service',
  description: 'AI-powered website optimization and enhancement service',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}