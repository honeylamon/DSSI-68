// app/layout.js
import './globals.css'; 
import { Inter } from 'next/font/google';

// Import Providers และ Header
import { AuthProvider } from '@/app/contexts/AuthContext';
import { CartProvider } from '@/app/contexts/CartContext';
import Header from '@/app/components/Header'; // <-- Import Header ที่เราเพิ่งสร้าง

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Baan Joy',
  description: 'ร้านค้า Baan Joy',
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            
            {/* เรียกใช้ Component Header ที่นี่ */}
            <Header />

            {/* {children} คือเนื้อหาของแต่ละหน้า */}
            <main>
              {children}
            </main>

            {/* คุณสามารถเพิ่ม Footer ตรงนี้ได้ถ้าต้องการ */}

          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}