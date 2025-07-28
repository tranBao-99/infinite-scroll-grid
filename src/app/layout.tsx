import './globals.scss';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Infinite Scroll App',
  description: 'Scroll vô tận 4 hướng với hình ảnh lặp lại',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
