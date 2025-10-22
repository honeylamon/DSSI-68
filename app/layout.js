import { AuthProvider } from '@/app/contexts/AuthContext';
import { CartProvider } from '@/app/contexts/CartContext'; // <-- 1. Import
import './globals.css';
import Header from '@/app/components/Header'; // สมมติว่า Header อยู่ที่นี่

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>
        <AuthProvider>
          <CartProvider> {/* <-- 2. นำมาครอบ */}
            <Header /> {/* Header ควรอยู่ข้างในเพื่อให้เข้าถึงตะกร้าได้ */}
            <main>{children}</main>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}