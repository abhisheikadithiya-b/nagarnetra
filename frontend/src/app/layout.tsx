import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'NagarNetra • Urban Telemetry Grid',
  description: 'Turning public buses into mobile edge AI sensors for automated road defect verification and transit fusion.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-[#FAF8F5] dark:bg-[#0B0F17] text-[#16191F] dark:text-[#F8FAFC] antialiased transition-colors duration-200">
        <ThemeProvider>
          <Header />
          <main className="flex-1 flex flex-col">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
