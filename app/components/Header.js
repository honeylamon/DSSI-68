// app/components/Header.js
import React from 'react';
import Link from 'next/link'; // 1. Import <Link> เข้ามาใช้งาน

const Header = () => {
  return (
    <header style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '10px 20px', 
      backgroundColor: '#3B5D50', 
      color: 'white' 
    }}>
      <div style={{ fontFamily: 'cursive', fontSize: '24px' }}>
        Baan joy
      </div>
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

      {/* 2. แก้ไขส่วนของไอคอนโปรไฟล์ */}
      <Link href="/signin" style={{ textDecoration: 'none' }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          borderRadius: '50%', 
          backgroundColor: 'white',
          cursor: 'pointer', // เพิ่ม cursor pointer
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'black', // สีของไอคอนข้างใน (ถ้ามี)
          fontSize: '24px'
        }}>
          👤 {/* ใส่ไอคอนรูปคน (ตัวอย่าง) */}
        </div>
      </Link>
      
    </header>
  );
};

export default Header;