import './globals.css';
import { Inter } from 'next/font/google';
import Header from '@/app/components/Header';
import Providers from '@/app/components/Providers';

// ✅ 1. Import ตัวนี้เข้ามา
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Baan Joy',
  description: 'ร้านค้า Baan Joy',
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body className={inter.className}>
        {/* ✅ 2. เอา AppRouterCacheProvider มาหุ้มข้างใน body เป็นตัวแรกสุด */}
        <AppRouterCacheProvider>
            <Providers>
              <Header />
              <main>
                {children}
              </main>
            </Providers>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}