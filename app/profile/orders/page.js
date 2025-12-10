// app/profile/orders/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import pb from '@/app/lib/pocketbase'; // ✅ ตรวจสอบ Path ให้ถูกต้อง
import { useAuth } from '@/app/contexts/AuthContext'; 

// --- Styles (CSS) ---
const colors = {
    primary: '#1A4D2E', // Dark Green
    success: '#10b981', 
    warning: '#f97316', 
    danger: '#ef4444', 
    text: '#374151',
    gray: '#6b7280',
    border: '#e5e7eb',
    background: '#f9fafb',
    white: '#FFFFFF'
};

// ฟังก์ชันช่วยแสดงสถานะเป็น Badge
// ... (ฟังก์ชัน getStatusBadge เหมือนเดิม)
const getStatusBadge = (status) => {
    let style = { 
        padding: '4px 8px', 
        borderRadius: '4px', 
        fontWeight: 'bold', 
        fontSize: '0.9rem' 
    };
    let text = '';

    switch (status) {
        case 'pending':
            style.backgroundColor = '#FFEDD5';
            style.color = colors.warning;
            text = 'รอดำเนินการ';
            break;
        case 'processing':
            style.backgroundColor = '#E0F2F1';
            style.color = colors.primary;
            text = 'กำลังจัดส่ง';
            break;
        case 'completed':
            style.backgroundColor = '#D1FAE5';
            style.color = colors.success;
            text = 'จัดส่งสำเร็จ';
            break;
        case 'cancelled':
            style.backgroundColor = '#FEE2E2';
            style.color = colors.danger;
            text = 'ยกเลิกแล้ว';
            break;
        default:
            style.backgroundColor = colors.gray;
            style.color = colors.white;
            text = 'ไม่ระบุสถานะ';
            break;
    }
    return <span style={style}>{text}</span>;
};

export default function OrderHistoryPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);
    const [error, setError] = useState(null);

    // 1. ตรวจสอบการล็อกอิน (ไม่เปลี่ยน)
    useEffect(() => {
        if (!isAuthLoading && !user) {
            router.push('/signin');
        }
    }, [user, isAuthLoading, router]);

    // 2. ดึงข้อมูลคำสั่งซื้อ (ปรับปรุงเพื่อจัดการ Auto-Cancellation)
    useEffect(() => {
        let isMounted = true; // สร้าง Flag สำหรับ Component Mount
        
        if (user) {
            const fetchOrders = async () => {
                setIsLoadingOrders(true);
                setError(null);
                try {
                    // ดึงข้อมูลคำสั่งซื้อทั้งหมด
                    const records = await pb.collection('orders').getFullList({
                        sort: '-created', 
                        filter: `user.id = '${user.id}'`, 
                    });
                    
                    if (isMounted) { // ✅ เช็ค Flag ก่อนตั้งค่า State
                        setOrders(records);
                    }
                } catch (err) {
                    if (isMounted) { // ✅ เช็ค Flag ก่อนตั้งค่า Error
                        console.error('Failed to fetch orders:', err);
                        
                        // ตรวจสอบข้อผิดพลาด Auto-Cancellation โดยเฉพาะ
                        if (err.message && err.message.includes('autocancelled')) {
                             setError('การเชื่อมต่อกับเซิร์ฟเวอร์ฐานข้อมูลหมดเวลา กรุณาลองใหม่อีกครั้ง');
                        } else {
                            setError('เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อ');
                        }
                        setOrders([]); 
                    }
                } finally {
                    if (isMounted) { // ✅ เช็ค Flag ก่อนตั้งค่า Loading
                        setIsLoadingOrders(false);
                    }
                }
            };
            fetchOrders();
        }
        
        // 3. Cleanup Function
        return () => {
            isMounted = false; // เมื่อ Component ถูก Unmount/Re-render ให้ตั้งค่าเป็น false
        };
    }, [user]); // Dependency คือ user

    // --- การแสดงผล (ส่วนที่เหลือเหมือนเดิม) ---
    // ... (ส่วนการแสดงผล: loading, no user, error, orders list)
    if (isAuthLoading || isLoadingOrders) {
        return <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.2rem', color: colors.primary }}>กำลังโหลดประวัติคำสั่งซื้อ...</div>;
    }
    
    if (!user) {
        return null;
    }

    return (
        <div style={{ maxWidth: '900px', margin: '40px auto', padding: '30px', backgroundColor: colors.white, borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            
            <h1 style={{ color: colors.primary, borderBottom: `2px solid ${colors.border}`, paddingBottom: '15px', marginBottom: '25px' }}>
                รายการคำสั่งซื้อทั้งหมด
            </h1>
            
            <div style={{ marginBottom: '20px' }}>
                <Link 
                    href="/profile" 
                    style={{ color: colors.gray, textDecoration: 'none', fontWeight: 'bold' }}
                >
                    &larr; กลับไปหน้าโปรไฟล์
                </Link>
            </div>

            {error && (
                <div style={{ padding: '15px', backgroundColor: colors.danger, color: colors.white, borderRadius: '8px', marginBottom: '20px' }}>
                    {error}
                </div>
            )}

            {orders.length === 0 ? (
                // แสดงข้อความเมื่อไม่มีคำสั่งซื้อ
                <div style={{ textAlign: 'center', padding: '50px', backgroundColor: colors.background, borderRadius: '8px' }}>
                    <p style={{ fontSize: '1.1rem', color: colors.text }}>คุณยังไม่มีประวัติคำสั่งซื้อ</p>
                    <Link 
                        href="/" 
                        style={{ color: colors.primary, textDecoration: 'underline', marginTop: '10px', display: 'inline-block' }}
                    >
                        เริ่มเลือกซื้อสินค้า
                    </Link>
                </div>
            ) : (
                // แสดงรายการคำสั่งซื้อ
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {orders.map((order) => (
                        <Link
                            key={order.id}
                            href={`/profile/orders/${order.id}`} // ลิงก์ไปยังหน้ารายละเอียดคำสั่งซื้อ
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '15px',
                                border: `1px solid ${colors.border}`,
                                borderRadius: '8px',
                                backgroundColor: colors.white,
                                textDecoration: 'none',
                                color: colors.text,
                                transition: 'box-shadow 0.2s, transform 0.2s',
                            }}
                            onMouseOver={e => {
                                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseOut={e => {
                                e.currentTarget.style.boxShadow = 'none';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            {/* รายละเอียดคำสั่งซื้อ */}
                            <div style={{ flex: 1 }}>
                                <p style={{ fontWeight: 'bold', margin: '0 0 5px 0', color: colors.primary }}>
                                    รหัสคำสั่งซื้อ: #{order.id.substring(0, 8)} 
                                </p>
                                <p style={{ fontSize: '0.9rem', color: colors.gray, margin: 0 }}>
                                    วันที่สั่งซื้อ: {new Date(order.created).toLocaleDateString('th-TH')}
                                </p>
                            </div>
                            
                            {/* สถานะ & ยอดรวม */}
                            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
                                {getStatusBadge(order.status)}
                                <p style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '0', color: colors.text }}>
                                    ฿{order.total_price ? order.total_price.toLocaleString() : '0.00'}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}