'use client';

import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext'; // ตรวจสอบ path ให้ถูกต้อง

export default function AdminLink() {
    const { user } = useAuth();

    // ถ้าไม่มี user หรือ user ไม่ใช่ admin -> ไม่ต้องแสดงอะไรเลย (return null)
    // ตรงนี้เช็ค role === 'admin' ให้ตรงกับใน Database ของคุณ
    if (!user || user.role !== 'admin') {
        return null;
    }

    // ถ้าเป็น Admin ให้แสดงปุ่มนี้
    return (
        <Link 
            href="/admin" 
            style={{ 
                display: 'inline-block',
                marginLeft: '15px', 
                padding: '5px 10px',
                backgroundColor: '#ef4444', // สีแดงให้เด่นๆ
                color: 'white', 
                borderRadius: '5px',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: 'bold'
            }}
        >
            จัดการสินค้า (Admin)
        </Link>
    );
}