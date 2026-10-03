import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Accessibility Navigator | Navigate Campus Without Barriers',
  description: 'AI-powered college campus navigation system designed to help students with disabilities find accessible routes, facilities, and services across campus.',
  openGraph: {
    title: 'Accessibility Navigator | Navigate Campus Without Barriers',
    description: 'AI-powered college campus navigation system designed to help students with disabilities find accessible routes, facilities, and services across campus.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Accessibility Navigator | Navigate Campus Without Barriers',
    description: 'AI-powered college campus navigation system designed to help students with disabilities find accessible routes, facilities, and services across campus.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
