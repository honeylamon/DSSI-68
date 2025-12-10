// app/profile/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; 
import { useAuth } from '@/app/contexts/AuthContext'; // ตรวจสอบ Path ให้ถูกต้อง
import pb from '@/app/lib/pocketbase'; // ตรวจสอบ Path ให้ถูกต้อง

// --- Styles (Theme Colors) ---
const colors = {
    primary: '#1A4D2E', // Dark Green
    danger: '#ef4444', // Red
    text: '#374151',
    border: '#e5e7eb',
    background: '#f9fafb',
    white: '#FFFFFF',
    buttonHover: '#3e594b',
};

export default function ProfilePage() {
    // ดึงข้อมูล User และฟังก์ชัน Logout จาก Context
    const { user, logout, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();

    // ฟังก์ชัน Logout 
    const handleLogout = () => {
        logout();
        router.push('/');
    };

    // --- การจัดการสถานะการโหลด/ไม่ได้ล็อกอิน ---
    if (isAuthLoading) {
        return <div style={{ textAlign: 'center', padding: '50px', color: colors.text }}>กำลังโหลดข้อมูลผู้ใช้...</div>;
    }

    if (!user) {
        // ดีดไปหน้าล็อกอินถ้ายังไม่มี User
        if (!isAuthLoading) {
            router.push('/signin');
        }
        return null;
    }
    // ------------------------------------------

    return (
        <div style={{ maxWidth: '600px', margin: '40px auto', padding: '30px', backgroundColor: colors.white, borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            
            <h1 style={{ color: colors.primary, borderBottom: `2px solid ${colors.border}`, paddingBottom: '15px', marginBottom: '25px' }}>
                ข้อมูลบัญชีของคุณ
            </h1>

            {/* ส่วนแสดงข้อมูล User */}
            <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: colors.background, borderRadius: '10px' }}>
                <p style={{ margin: '5px 0', fontSize: '1.1rem' }}>
                    <strong>ชื่อผู้ใช้ (Username):</strong> {user.username}
                </p>
                <p style={{ margin: '5px 0', fontSize: '1.1rem' }}>
                    <strong>อีเมล:</strong> {user.email}
                </p>
            </div>

            {/* ======================================================= */}
            {/* ✅ ลิงก์สำหรับดูประวัติคำสั่งซื้อ (Order History) - ไม่มีอีโมจิ */}
            {/* ======================================================= */}
            <div style={{ marginTop: '30px', borderTop: `1px solid ${colors.border}`, paddingTop: '20px' }}>
                <Link 
                    href="/profile/orders" // ชี้ไปยังหน้าประวัติคำสั่งซื้อ
                    style={{ 
                        display: 'block', 
                        padding: '15px', 
                        backgroundColor: colors.primary, 
                        color: colors.white, 
                        borderRadius: '8px', 
                        textDecoration: 'none',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        fontSize: '1rem',
                        transition: 'background-color 0.2s',
                        cursor: 'pointer'
                    }}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = colors.buttonHover}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = colors.primary}
                >
                    ดูประวัติและติดตามคำสั่งซื้อทั้งหมด
                </Link>
            </div>
            {/* ======================================================= */}

            {/* ปุ่ม Logout */}
            <div style={{ marginTop: '30px', textAlign: 'center' }}>
                <button 
                    onClick={handleLogout}
                    style={{ 
                        padding: '10px 20px', 
                        backgroundColor: colors.danger, 
                        color: colors.white, 
                        border: 'none', 
                        borderRadius: '6px', 
                        cursor: 'pointer', 
                        fontSize: '1rem',
                        transition: 'opacity 0.2s',
                    }}
                >
                    ออกจากระบบ (Logout)
                </button>
            </div>
        </div>
    );
}