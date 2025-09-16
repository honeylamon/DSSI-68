'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext'; // สมมติว่า AuthContext อยู่ที่นี่

export default function AdminAuthGuard({ children }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // รอจนกว่าจะโหลดข้อมูลผู้ใช้เสร็จ
        if (loading) {
            return;
        }

        // ถ้าไม่ได้ล็อกอิน หรือไม่ได้เป็นแอดมิน
        if (!user || user.role !== 'admin') {
            alert('Access denied. You must be an admin to view this page.');
            router.push('/signin'); // ส่งไปหน้าล็อกอิน
        }
    }, [user, loading, router]);

    // ถ้าเป็นแอดมินจริง ให้แสดงเนื้อหาข้างใน (children)
    if (user && user.role === 'admin') {
        return <>{children}</>;
    }

    // ระหว่างรอ หรือถ้าเงื่อนไขไม่ผ่าน ให้แสดงหน้า loading หรือ null
    return <div>Loading...</div>; 
}