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
    // background: '#FFF0F3', // Light Pink (ไม่ใช้ใน Component หลัก)
    success: '#10b981', // Green
    warning: '#f97316', // Orange
    danger: '#ef4444', // Red
    gray: '#6b7280',
    white: '#FFFFFF'
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
            return { backgroundColor: '#E5E7EB', color: colors.gray, border: `1px solid ${colors.gray}` };
    }
};

export default function OrderDetailPage() {
    const { user } = useAuth();
    const router = useRouter();
    const params = useParams(); 
    
    // ✅ แก้ไข: ดึงค่าจาก params ให้ตรงกับชื่อโฟลเดอร์ [orderId]
    const orderId = params.orderId; 
    
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // 💰 ฟังก์ชันสำหรับจัดการการชำระเงิน
    const handlePayment = async () => {
        if (!order) return;

        // **!!! สำคัญ !!!** // 1. ตรงนี้คือจุดที่คุณต้องเรียก Payment Gateway จริง
        alert(`กำลังเข้าสู่ระบบชำระเงิน Order ID: ${orderId} ยอด ${order.total_price.toLocaleString()} บาท...`);
        
        try {
            // 2. เมื่อได้รับ Callback ว่าชำระเงินสำเร็จแล้ว ค่อยอัปเดตสถานะใน PocketBase
            // เราจำลองการอัปเดตสถานะเป็น 'processing' ทันที
            const updatedOrder = await pb.collection('orders').update(orderId, {
                 status: 'processing', // เปลี่ยนสถานะ
            });
            
            setOrder(updatedOrder);
            alert("✅ ชำระเงินสำเร็จ! สถานะอัปเดตเป็น 'Processing'");

        } catch (error) {
            console.error("Payment or Update failed:", error);
            alert("🛑 เกิดข้อผิดพลาดในการชำระเงินหรืออัปเดตสถานะ");
        }
    };

    useEffect(() => {
        if (!user) {
            router.push('/signin');
            return;
        }

        if (orderId) {
            fetchOrderDetail(orderId);
        }
    }, [user, router, orderId]);

    const fetchOrderDetail = async (id) => {
        try {
            const record = await pb.collection('orders').getOne(id, {
                // ต้อง expand 'items.product' เพื่อดึงข้อมูลสินค้าในรายการ Order นั้นๆ (ถ้า items เก็บเป็น relations)
                // ถ้า items เก็บเป็น JSON array ใน order record อยู่แล้ว ไม่จำเป็นต้อง expand
                // เราจะใช้โครงสร้างที่ง่ายกว่า คือใช้ข้อมูลสินค้าที่ถูกบันทึกไว้ใน items: [] โดยตรง
                expand: 'user', // ดึงข้อมูล user มาเช็คสิทธิ์เท่านั้น
                requestKey: null 
            });

            // ตรวจสอบความปลอดภัย
            if (record.user !== user.id) {
                alert("Order นี้ไม่ใช่ของคุณ!");
                router.push('/profile/orders'); 
                return;
            }

            setOrder(record);
        } catch (error) {
            console.error("Failed to fetch order detail:", error);
            setOrder(null);
        } finally {
            setIsLoading(false);
        }
    };
    
    // --- Render Loading / Error ---
    if (isLoading) {
        return <div style={{padding:'50px', textAlign:'center'}}>กำลังโหลดรายละเอียดคำสั่งซื้อ...</div>;
    }

    if (!order) {
        return (
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '50px', textAlign: 'center' }}>
                <h1 style={{color: colors.danger}}>ไม่พบคำสั่งซื้อ</h1>
                <Link href="/profile/orders" style={{ color: colors.primary }}>
                    ← กลับไปหน้าประวัติคำสั่งซื้อ
                </Link>
            </div>
        );
    }
    
    // --- Render Detail ---
    return (
        <div style={{ maxWidth: '900px', margin: '30px auto', padding: '30px', fontFamily: 'sans-serif', backgroundColor: colors.white, borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
            <Link href="/profile/orders" style={{ color: colors.gray, textDecoration: 'none', display: 'block', marginBottom: '20px' }}>
                ← กลับไปหน้าประวัติคำสั่งซื้อ
            </Link>
            
            <h1 style={{ color: colors.primary, borderBottom: `3px solid ${colors.secondary}`, paddingBottom: '10px', marginBottom: '30px' }}>
                รายละเอียดคำสั่งซื้อ #{order.id.substring(0, 10)}
            </h1>

            {/* Header / Status */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '15px', border: `1px solid ${colors.secondary}`, borderRadius: '10px', backgroundColor: '#F0F8FF' }}>
                <p style={{ margin: 0, fontWeight: 'bold', color: colors.primary }}>
                    วันที่สั่งซื้อ: {new Date(order.created).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
                <span style={{ 
                    padding: '8px 15px', 
                    borderRadius: '20px', 
                    fontWeight: 'bold',
                    ...getStatusStyle(order.status)
                }}>
                    สถานะ: {order.status}
                </span>
            </div>
            
            {/* 💰 ปุ่มชำระเงิน (แสดงเฉพาะเมื่อสถานะเป็น pending) */}
            {order.status === 'pending' && (
                <div style={{ textAlign: 'center', margin: '20px 0' }}>
                    <button 
                        onClick={handlePayment} 
                        style={{ 
                            backgroundColor: '#ff9800', 
                            color: 'white', 
                            padding: '12px 25px', 
                            border: 'none', 
                            borderRadius: '8px', 
                            cursor: 'pointer',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            transition: 'background-color 0.2s'
                        }}
                    >
                        ชำระเงินตอนนี้ ({order.total_price.toLocaleString()} บาท)
                    </button>
                    <p style={{ color: colors.gray, marginTop: '10px', fontSize: '0.9rem' }}>
                        คลิกเพื่อดำเนินการชำระเงินและอัปเดตสถานะ
                    </p>
                </div>
            )}
            
            {/* รายการสินค้า */}
            <h2 style={{ color: colors.gray, fontSize: '1.4rem', borderBottom: '1px solid #eee', paddingBottom: '5px', marginTop: '30px' }}>รายการสินค้าที่สั่ง</h2>
            <div style={{ marginTop: '15px' }}>
                {/* * โค้ดเดิมใช้ order.expand?.items?.map ซึ่งน่าจะเกิดจากโครงสร้าง PocketBase ที่เก็บ Order Items เป็น relation
                  * แต่ตามภาพที่คุณส่งมา (list order) items ถูกเก็บเป็น JSON array ที่มี name/quantity/price อยู่แล้ว
                  * ผมจึงเปลี่ยนมาใช้ order.items?.map เพื่อให้ทำงานได้ถ้า items เป็น JSON array
                */}
                {order.items?.map((item, index) => (
                    <div key={index} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        padding: '10px 0', 
                        borderBottom: '1px dotted #eee',
                        alignItems: 'center'
                    }}>
                        <div style={{ flex: 3 }}>
                            <p style={{ margin: 0, fontWeight: 'bold', color: colors.primary }}>
                                {item.name || 'ไม่พบชื่อสินค้า'} 
                            </p>
                            <p style={{ margin: 0, color: colors.gray, fontSize: '0.9rem' }}>
                                {item.product ? `(รหัสสินค้า: ${item.product.substring(0, 8)}...)` : ''}
                            </p>
                        </div>
                        <div style={{ flex: 1, textAlign: 'center', color: colors.gray }}>
                            x {item.quantity}
                        </div>
                        <div style={{ flex: 1, textAlign: 'right', fontWeight: 'bold' }}>
                            ฿{(item.quantity * (item.price || item.price_at_order || 0)).toLocaleString()}
                        </div>
                    </div>
                ))}
            </div>

            {/* สรุปยอดรวม */}
            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '2px solid #ccc', textAlign: 'right' }}>
                <p style={{ margin: '5px 0', fontSize: '1.2rem', fontWeight: 'bold', color: colors.primary }}>
                    รวมทั้งสิ้น: <span style={{ color: colors.success, fontSize: '1.4rem' }}>฿{order.total_price.toLocaleString()}</span>
                </p>
            </div>

            {/* ✅ ส่วนที่เพิ่ม: ข้อมูลการจัดส่ง */}
            <h2 style={{marginTop: '30px', borderBottom: '1px solid #eee', paddingBottom: '5px', color: colors.gray}}>ที่อยู่สำหรับจัดส่ง</h2>
            <div style={{padding: '15px', border: '1px solid #f0f0f0', borderRadius: '8px', backgroundColor: '#fafafa'}}>
                <p><strong>ชื่อผู้รับ:</strong> {order.name || 'N/A'}</p>
                <p><strong>เบอร์โทร:</strong> {order.phone || 'N/A'}</p>
                <p style={{whiteSpace: 'pre-wrap', margin: 0}}><strong>ที่อยู่:</strong> {order.address || 'N/A'}</p>
            </div>
            {/* 🛑 สิ้นสุดส่วนที่เพิ่ม */}

        </div>
    );
}