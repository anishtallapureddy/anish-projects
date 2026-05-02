import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EdgeDesk — Trading & Research',
  description:
    'Personal trading intelligence: structured setups and research notes for US equities & options. Prototype, not financial advice.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
