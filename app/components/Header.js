'use client'; 

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// --- 1. แก้ไข Path ของ AuthContext ---
import { useAuth } from '@/app/contexts/AuthContext'; 
// --- 2. Import CartContext เข้ามา ---
import { useCart } from '@/app/contexts/CartContext'; 

// --- 3. ลบบรรทัดที่ import ตัวเองทิ้งไป ---
// import Header from '@/components/Header'; // <-- ลบบรรทัดนี้

// --- 4. เปลี่ยนเป็น 'export default function' เพื่อความชัดเจน ---
export default function Header() {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${query}`);
    }
  };
  
  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 20px',
      backgroundColor: '#3B5D50',
      color: 'white'
    }}>
      <Link href="/" style={{ fontFamily: 'cursive', fontSize: '24px', textDecoration: 'none', color: 'white' }}>
        Baan Joy
      </Link>
      
      {/* --- ช่องค้นหาที่ใช้งานได้ --- */}
      <form onSubmit={handleSearch} style={{ flexGrow: 0.5 }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหาสินค้า..."
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '5px',
            border: 'none'
          }}
        />
      </form>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* --- ตะกร้าสินค้า --- */}
        <Link href="/cart" style={{ color: 'white', textDecoration: 'none', fontSize: '16px' }}>
          ตะกร้า ({totalCartItems})
        </Link>
        
        {/* --- ส่วน Login --- */}
        {user ? (
          <>
            <span style={{ fontSize: '14px' }}>Welcome, {user.name || user.email}</span>
            <button 
              onClick={logout} 
              style={{ 
                cursor: 'pointer', 
                backgroundColor: '#f44336', 
                color: 'white', 
                border: 'none', 
                padding: '8px 12px', 
                borderRadius: '5px' 
              }}>
              Logout
            </button>
          </>
        ) : (
          <Link href="/signin" style={{ textDecoration: 'none' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'white',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: 'black',
              fontSize: '24px'
            }}>
              👤
            </div>
          </Link>
        )}
      </div>
    </header>
  );
};

