'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import pb from '../lib/pocketbase'; // ตรวจสอบว่า path นี้ถูกต้อง (ชี้ไปที่ไฟล์ pocketbase.js)

export default function AdminAuthGuard({ children }) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        // 1. ดึงข้อมูลการล็อกอินปัจจุบันจาก PocketBase โดยตรง
        const isValid = pb.authStore.isValid;
        const model = pb.authStore.model;

        // 2. ถ้ายังไม่ได้ล็อกอิน (ไม่มี Token หรือไม่มีข้อมูล User) -> ดีดไปหน้า Login
        if (!isValid || !model) {
            router.push('/signin');
            return;
        }

        // 3. ถ้าล็อกอินแล้ว แต่ role ไม่ใช่ 'admin' -> ดีดกลับหน้าแรก
        // (ตรงนี้สำคัญ: ต้องเช็ค field 'role' ว่าเป็น 'admin' ตาม database ของคุณ)
        if (model.role !== 'admin') {
            alert("Access denied: เฉพาะ Admin เท่านั้นที่เข้าถึงหน้านี้ได้");
            router.push('/'); 
            return;
        }

        // 4. ถ้าผ่านเงื่อนไขทั้งหมด (ล็อกอินแล้ว + เป็น admin) -> อนุญาตให้ผ่าน
        setIsAuthorized(true);

    }, [router]);

    // ระหว่างที่กำลังตรวจสอบ (เสี้ยววินาที) ให้แสดงหน้าโหลด
    if (!isAuthorized) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh', 
                fontSize: '1.2rem',
                color: '#666'
            }}>
                <p>กำลังตรวจสอบสิทธิ์ Admin...</p>
            </div>
        );
    }

    // ถ้าอนุญาตแล้ว ให้แสดงเนื้อหาข้างใน (หน้า AdminPage)
    return <>{children}</>;
}