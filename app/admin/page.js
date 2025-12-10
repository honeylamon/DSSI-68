'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import pb from '../lib/pocketbase';
import TrainButton from '@/app/components/TrainButton';

export default function AdminDashboard() {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [stats, setStats] = useState({
        totalSales: 0,
        totalOrders: 0,
        totalProducts: 0
    });

    useEffect(() => {
        const checkAuth = async () => {
            const model = pb.authStore.model;
            if (!pb.authStore.isValid || !model || model.role !== 'admin') {
                alert("Access denied: เฉพาะ Admin เท่านั้น");
                router.push('/');
            } else {
                setIsAuthorized(true);
                // ดึงข้อมูลตัวอย่าง (หรือเชื่อมต่อจริงถ้ามี)
                try {
                    const productList = await pb.collection('products').getList(1, 1);
                    setStats({
                        totalSales: 15400,
                        totalOrders: 25,
                        totalProducts: productList.totalItems
                    });
                } catch (e) {
                    console.log("Error fetching stats", e);
                }
            }
        };
        checkAuth();
    }, [router]);

    if (!isAuthorized) return null;

    // --- ชุดสี (Color Palette) ---
    const colors = {
        darkGreen: '#1A4D2E',  // เขียวเข้ม
        skyBlue: '#4FC3F7',    // ฟ้าสดใส
        lightPink: '#FFF0F3',  // ชมพูอ่อน (พื้นหลัง)
        hotPink: '#FF80AB',    // ชมพูเข้ม (สำหรับไอคอน)
        white: '#FFFFFF'       // ขาว
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: colors.lightPink, padding: '40px', fontFamily: "'Kanit', sans-serif" }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                
                {/* Header */}
                <div style={{ marginBottom: '40px', borderBottom: `2px solid ${colors.skyBlue}`, paddingBottom: '20px' }}>
                    <h1 style={{ fontSize: '2.5rem', color: colors.darkGreen, marginBottom: '5px' }}>Admin Dashboard</h1>
                    <p style={{ color: '#555' }}>ระบบจัดการร้านค้า Baan Joy </p>
                </div>

                {/* 1. ส่วนแสดงสถิติ (Stats Cards) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '25px', marginBottom: '40px' }}>
                    
                    {/* การ์ด 1: ยอดขาย (ธีมเขียว) */}
                    <div style={cardStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ color: '#888', margin: '0 0 5px 0' }}>ยอดขายรวม</p>
                                <h3 style={{ fontSize: '2rem', color: colors.darkGreen, margin: 0 }}>฿{stats.totalSales.toLocaleString()}</h3>
                            </div>
                            <div style={{ ...iconStyle, backgroundColor: '#E8F5E9', color: colors.darkGreen }}>💰</div>
                        </div>
                    </div>

                    {/* การ์ด 2: ออเดอร์ (ธีมฟ้า) */}
                    <div style={cardStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ color: '#888', margin: '0 0 5px 0' }}>คำสั่งซื้อ</p>
                                <h3 style={{ fontSize: '2rem', color: '#0288D1', margin: 0 }}>{stats.totalOrders}</h3>
                            </div>
                            <div style={{ ...iconStyle, backgroundColor: '#E1F5FE', color: '#0288D1' }}>📃</div>
                        </div>
                    </div>

                    {/* การ์ด 3: สินค้า (ธีมชมพู) */}
                    <div style={cardStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ color: '#888', margin: '0 0 5px 0' }}>สินค้าทั้งหมด</p>
                                <h3 style={{ fontSize: '2rem', color: colors.hotPink, margin: 0 }}>{stats.totalProducts}</h3>
                            </div>
                            <div style={{ ...iconStyle, backgroundColor: '#FCE4EC', color: colors.hotPink }}>📦</div>
                        </div>
                    </div>
                </div>

                {/* 2. เมนูจัดการ (Action Cards) */}
                <h2 style={{ color: colors.darkGreen, marginBottom: '20px', borderLeft: `5px solid ${colors.darkGreen}`, paddingLeft: '15px' }}>
                    เมนูจัดการ
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                    
                    {/* ปุ่มไปจัดการสินค้า */}
                    <Link href="/admin/products" style={actionCardStyle}>
                        <div style={{ ...iconStyle, backgroundColor: '#E8F5E9', color: colors.darkGreen, marginRight: '20px' }}>
                            📦
                        </div>
                        <div>
                            <h3 style={{ margin: '0 0 5px 0', color: colors.darkGreen }}>จัดการสินค้า</h3>
                            <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>เพิ่ม/ลบ/แก้ไข รายการสินค้า</p>
                        </div>
                        <div style={{ marginLeft: 'auto', fontSize: '1.5rem', color: colors.skyBlue }}>➔</div>
                    </Link>

                    {/* ปุ่มไปจัดการออเดอร์ */}
                    <Link href="/admin/orders" style={actionCardStyle}>
                        <div style={{ ...iconStyle, backgroundColor: '#E1F5FE', color: '#0288D1', marginRight: '20px' }}>
                            📃
                        </div>
                        <div>
                            <h3 style={{ margin: '0 0 5px 0', color: '#0288D1' }}>จัดการคำสั่งซื้อ</h3>
                            <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>ตรวจสอบสถานะออเดอร์</p>
                        </div>
                        <div style={{ marginLeft: 'auto', fontSize: '1.5rem', color: colors.skyBlue }}>➔</div>
                    </Link>

                </div>

               
            </div>
        </div>
    );
}

// --- Styles ---
const cardStyle = {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '20px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
    border: '1px solid white'
};

const actionCardStyle = {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '20px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    transition: 'transform 0.2s',
    cursor: 'pointer',
    border: '1px solid white'
};

const iconStyle = {
    width: '60px',
    height: '60px',
    borderRadius: '15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px'
};