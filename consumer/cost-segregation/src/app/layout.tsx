import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CostSeg Pro — Cost Segregation Analysis Reports',
  description: 'Generate professional cost segregation analysis reports for residential properties. Maximize tax savings with accelerated depreciation.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}
