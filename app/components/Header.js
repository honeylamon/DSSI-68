// app/components/Header.js
'use client'; // <-- 1. เพิ่มบรรทัดนี้เพื่อบอกว่าเป็น Client Component

import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext'; // <-- 2. Import useAuth เข้ามา

const Header = () => {
  const { user, logout } = useAuth(); // <-- 3. เรียกใช้ useAuth เพื่อดึงข้อมูล user

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
        Baan joy
      </Link>
      <div style={{ flexGrow: 0.5 }}>
        <input
          type="text"
          placeholder="ค้นหาสินค้า..."
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '5px',
            border: 'none'
          }}
        />
      </div>

      {/* --- 4. ส่วนสำคัญ: เปลี่ยนการแสดงผลตามสถานะ user --- */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        {user ? (
          // === ถ้า user ล็อกอินแล้ว ===
          <>
            <span style={{ fontSize: '14px' }}>Welcome, {user.name || user.email}</span>
            {user.role === 'admin' && (
              <Link href="/admin" style={{ color: 'white', textDecoration: 'underline' }}>
                Admin
              </Link>
            )}
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
          // === ถ้า user ยังไม่ได้ล็อกอิน ===
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

export default Header;