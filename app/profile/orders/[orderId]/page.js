// app/profile/orders/[orderId]/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import pb from '@/app/lib/pocketbase'; 
import { useAuth } from '@/app/contexts/AuthContext'; 

// --- Styles ---
const colors = {
    primary: '#1A4D2E', // Dark Green
    secondary: '#4FC3F7', // Sky Blue
    success: '#10b981', // Green
    warning: '#f97316', // Orange
    danger: '#ef4444', // Red
    gray: '#6b7280',
    white: '#FFFFFF',
    border: '#e5e7eb',
    background: '#f9fafb'
};

// ฟังก์ชันสำหรับกำหนดสีสถานะ
const getStatusStyle = (status) => {
    switch (status) {
        case 'pending':
            return { backgroundColor: '#FFEDD5', color: colors.warning, border: `1px solid ${colors.warning}` };
        case 'processing': // สถานะใหม่ หลังชำระเงินสำเร็จ
            return { backgroundColor: '#F0F8FF', color: '#2563eb', border: `1px solid #2563eb` };
        case 'completed':
            return { backgroundColor: '#D1FAE5', color: colors.success, border: `1px solid ${colors.success}` };
        case 'cancelled':
            return { backgroundColor: '#FEE2E2', color: colors.danger, border: `1px solid ${colors.danger}` };
        default:
            return { backgroundColor: colors.gray, color: colors.white, border: `1px solid ${colors.gray}` };
    }
};

export default function OrderDetailPage() {
    const { orderId } = useParams();
    const router = useRouter();
    const { user, isLoading: isAuthLoading } = useAuth();

    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // 1. ตรวจสอบการล็อกอิน
    useEffect(() => {
        if (!isAuthLoading && !user) {
            router.push('/signin');
        }
    }, [user, isAuthLoading, router]);

    // 2. ดึงข้อมูลคำสั่งซื้อ (เพิ่ม isMounted Flag)
    useEffect(() => {
        let isMounted = true; // Flag สำหรับ Component Mount
        
        const fetchOrder = async () => {
            if (!orderId || !user) return; // ไม่ดึงข้อมูลถ้าไม่มี ID หรือ User

            setIsLoading(true);
            setError(null);
            
            try {
                // ดึงคำสั่งซื้อ
                const record = await pb.collection('orders').getOne(orderId);

                // ตรวจสอบว่าคำสั่งซื้อนี้เป็นของผู้ใช้ที่ล็อกอินอยู่หรือไม่ (เพิ่มความปลอดภัย)
                if (record.user !== user.id) {
                    if (isMounted) {
                        setError('คุณไม่มีสิทธิ์เข้าถึงคำสั่งซื้อนี้');
                        setOrder(null);
                    }
                    return;
                }
                
                if (isMounted) { // ✅ เช็ค Flag ก่อนตั้งค่า State
                    setOrder(record);
                }
            } catch (err) {
                if (isMounted) { // ✅ เช็ค Flag ก่อนตั้งค่า Error
                    console.error('Failed to fetch order:', err);
                    
                    // ปรับปรุงการจัดการ Error สำหรับ PocketBase Autocancellation
                    if (err.message && err.message.includes('autocancelled')) {
                        setError('การเชื่อมต่อฐานข้อมูลถูกยกเลิกอัตโนมัติ กรุณาลองใหม่');
                    } else if (err.status === 404) {
                        setError('ไม่พบคำสั่งซื้อนี้');
                    } else {
                        setError('เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อ');
                    }
                    setOrder(null);
                }
            } finally {
                if (isMounted) { // ✅ เช็ค Flag ก่อนตั้งค่า Loading
                    setIsLoading(false);
                }
            }
        };

        if (user && orderId) {
            fetchOrder();
        }

        // Cleanup Function: ทำงานเมื่อ Component ถูก Unmount
        return () => {
            isMounted = false;
        };
    }, [orderId, user]); // Dependency คือ orderId และ user

    // --- การแสดงผล ---

    if (isAuthLoading || isLoading) {
        return <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.2rem', color: colors.primary }}>กำลังโหลดรายละเอียดคำสั่งซื้อ...</div>;
    }
    
    if (!user) {
        return null;
    }

    if (error) {
        return (
            <div style={{ maxWidth: '800px', margin: '40px auto', padding: '30px', backgroundColor: colors.white, borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <div style={{ padding: '20px', backgroundColor: colors.danger, color: colors.white, borderRadius: '8px', marginBottom: '20px' }}>
                    <strong>เกิดข้อผิดพลาด:</strong> {error}
                </div>
                <Link 
                    href="/profile/orders" 
                    style={{ color: colors.primary, textDecoration: 'underline', fontWeight: 'bold' }}
                >
                    &larr; กลับไปหน้ารายการคำสั่งซื้อ
                </Link>
            </div>
        );
    }
    
    if (!order) {
        return <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.2rem', color: colors.gray }}>ไม่พบข้อมูลคำสั่งซื้อที่ต้องการ</div>;
    }

    // แสดงรายละเอียดคำสั่งซื้อ
    return (
        <div style={{ maxWidth: '800px', margin: '40px auto', padding: '30px', backgroundColor: colors.white, borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            
            <h1 style={{ color: colors.primary, borderBottom: `2px solid ${colors.border}`, paddingBottom: '15px', marginBottom: '25px' }}>
                รายละเอียดคำสั่งซื้อ #{orderId.substring(0, 8)}
            </h1>
            
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link 
                    href="/profile/orders" 
                    style={{ color: colors.gray, textDecoration: 'none', fontWeight: 'bold' }}
                >
                    &larr; กลับไปหน้ารายการคำสั่งซื้อ
                </Link>
                <div style={{ 
                    ...getStatusStyle(order.status),
                    padding: '8px 12px',
                    borderRadius: '20px',
                    fontWeight: 'bold'
                }}>
                    {/* แสดงสถานะภาษาไทย */}
                    {order.status === 'pending' ? 'รอดำเนินการ' : 
                     order.status === 'processing' ? 'กำลังจัดส่ง' :
                     order.status === 'completed' ? 'จัดส่งสำเร็จ' :
                     order.status === 'cancelled' ? 'ยกเลิกแล้ว' : 'ไม่ระบุสถานะ'}
                </div>
            </div>

            {/* ข้อมูลคำสั่งซื้อ */}
            <div style={{ border: `1px solid ${colors.border}`, padding: '20px', borderRadius: '10px', backgroundColor: colors.background, marginBottom: '20px' }}>
                <p style={{ margin: '5px 0' }}><strong>วันที่สั่งซื้อ:</strong> {new Date(order.created).toLocaleDateString('th-TH')}</p>
                <p style={{ margin: '5px 0' }}><strong>ช่องทางการชำระเงิน:</strong> {order.payment_method || 'N/A'}</p>
            </div>

            {/* รายการสินค้า */}
            <h2 style={{marginTop: '30px', borderBottom: '1px solid #eee', paddingBottom: '5px', color: colors.primary}}>รายการสินค้า</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Array.isArray(order.items) && order.items.map((item, index) => (
                    <div 
                        key={index}
                        style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px dashed ${colors.border}` }}
                    >
                        <div style={{ flex: 2 }}>
                            {/* item.name ควรเป็นชื่อสินค้าที่บันทึกไว้ ณ เวลาที่สั่ง */}
                            {item.name || 'สินค้าที่ถูกลบไปแล้ว'}
                        </div>
                        <div style={{ flex: 1, textAlign: 'center', color: colors.gray }}>
                            x {item.quantity}
                        </div>
                        <div style={{ flex: 1, textAlign: 'right', fontWeight: 'bold' }}>
                            {/* ใช้ price_at_order หรือ price เป็นค่าสำรอง */}
                            ฿{(item.quantity * (item.price_at_order || item.price || 0)).toLocaleString()}
                        </div>
                    </div>
                ))}
            </div>

            {/* สรุปยอดรวม */}
            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '2px solid #ccc', textAlign: 'right' }}>
                <p style={{ margin: '5px 0', fontSize: '1.2rem', fontWeight: 'bold', color: colors.primary }}>
                    รวมทั้งสิ้น: <span style={{ color: colors.success, fontSize: '1.4rem' }}>฿{order.total_price ? order.total_price.toLocaleString() : '0.00'}</span>
                </p>
            </div>

            {/* ข้อมูลการจัดส่ง */}
            <h2 style={{marginTop: '30px', borderBottom: '1px solid #eee', paddingBottom: '5px', color: colors.gray}}>ที่อยู่สำหรับจัดส่ง</h2>
            <div style={{padding: '15px', border: `1px solid ${colors.border}`, borderRadius: '8px', backgroundColor: colors.background}}>
                <p><strong>ชื่อผู้รับ:</strong> {order.name || 'N/A'}</p>
                <p><strong>เบอร์โทร:</strong> {order.phone || 'N/A'}</p>
                <p style={{whiteSpace: 'pre-wrap', margin: 0}}><strong>ที่อยู่:</strong> {order.address || 'N/A'}</p>
            </div>
            
            {/* ... อาจเพิ่มส่วนอื่นๆ เช่น ปุ่มยกเลิกคำสั่งซื้อ (ถ้าสถานะเป็น 'pending') ... */}

        </div>
    );
}