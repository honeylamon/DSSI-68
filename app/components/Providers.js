// app/components/Providers.js
'use client'; // 👈 บรรทัดนี้สำคัญมาก บอกว่าเป็นฝั่ง Client

import { AuthProvider } from '@/app/contexts/AuthContext';
import { CartProvider } from '@/app/contexts/CartContext';

export default function Providers({ children }) {
  return (
    // ระบบล็อกอิน ครอบ ระบบตะกร้า อีกที
    <AuthProvider>
      <CartProvider>
        {children} {/* children คือหน้าเว็บทั้งหมดของเรา */}
      </CartProvider>
    </AuthProvider>
  );
}