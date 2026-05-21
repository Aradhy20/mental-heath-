import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import { MUIProvider } from '@/components/providers/mui-provider';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)',  color: '#0d0d14' },
    { media: '(prefers-color-scheme: light)', color: '#F9FAFB' },
  ],
};

export const metadata: Metadata = {
  title: 'MindfulAI — Your Mental Wellness Copilot',
  description:
    'AI-powered mental health platform with real-time support, CBT tools, mood tracking, and personalized wellness insights. Your safe space to heal and grow.',
  keywords: ['mental health', 'AI therapy', 'wellness', 'CBT', 'mood tracking'],
  openGraph: {
    title: 'MindfulAI — Your Mental Wellness Copilot',
    description: 'AI-powered mental health support, available 24/7.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          <MUIProvider>{children}</MUIProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

