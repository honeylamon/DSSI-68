// app/profile/orders/[orderId]/OrderDetailsClient.js
'use client';

import { useState, useEffect } from 'react';
import pb from '@/app/lib/pocketbase';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function OrderDetailsClient({ orderId }) {
    const { user } = useAuth();
    const router = useRouter();
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // จำลองการอัปเดตสถานะการชำระเงิน
    const handlePayment = () => {
        // **นี่คือส่วนที่คุณต้องเชื่อมต่อกับ Payment Gateway จริง**
        
        alert("จำลอง: กำลังเข้าสู่หน้าชำระเงิน...");
        // ในระบบจริง: ถ้าชำระสำเร็จ คุณต้องเรียก API เพื่ออัปเดตสถานะใน PocketBase
        // เช่น: pb.collection('orders').update(orderId, { status: 'paid' });
        
        // จำลองการเปลี่ยนสถานะเป็น 'processing' หลังชำระเงินสำเร็จ
        setOrder(prev => ({ ...prev, status: 'processing' })); 
    };

    useEffect(() => {
        if (!user) {
            router.push('/signin');
            return;
        }

        const fetchOrder = async () => {
            try {
                // ดึง Order เฉพาะ ID นั้น
                const record = await pb.collection('orders').getOne(orderId);
                setOrder(record);
            } catch (error) {
                console.error("Failed to fetch order details:", error);
                // ถ้าดึงข้อมูลไม่ได้ (เช่น สิทธิ์ไม่พอ)
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrder();
    }, [orderId, user, router]);

    if (isLoading) {
        return <div style={{padding:'50px', textAlign:'center'}}>กำลังโหลดรายละเอียดคำสั่งซื้อ...</div>;
    }

    if (!order) {
        return <div style={{padding:'50px', textAlign:'center'}}>ไม่พบคำสั่งซื้อนี้ หรือคุณไม่มีสิทธิ์เข้าถึง</div>;
    }

    // --- ส่วนแสดงผลรายละเอียด Order ---
    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
            <h1 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>รายละเอียดคำสั่งซื้อ</h1>
            <p><strong>Order ID:</strong> {orderId}</p>
            <p><strong>วันที่สั่ง:</strong> {new Date(order.created).toLocaleDateString('th-TH')}</p>
            
            <h2 style={{marginTop: '30px', borderBottom: '1px solid #ddd', paddingBottom: '5px'}}>สรุปยอดเงินและสถานะ</h2>
            <p><strong>ยอดรวมทั้งหมด:</strong> <span style={{color: '#10b981', fontWeight: 'bold', fontSize: '1.2rem'}}>{order.total_price.toLocaleString()} บาท</span></p>
            <p><strong>สถานะปัจจุบัน:</strong> 
                <span style={{color: order.status === 'pending' ? '#f97316' : '#059669', fontWeight: 'bold'}}>
                    {order.status === 'pending' ? 'รอชำระเงิน' : 'ชำระเงินแล้ว / อยู่ในระหว่างการจัดส่ง'}
                </span>
            </p>
            
            {/* ✅ ส่วนสำคัญ: ปุ่มชำระเงิน (แสดงเฉพาะเมื่อสถานะเป็น pending) */}
            {order.status === 'pending' && (
                <button 
                    onClick={handlePayment} 
                    style={{ 
                        backgroundColor: '#ff9800', 
                        color: 'white', 
                        padding: '12px 25px', 
                        border: 'none', 
                        borderRadius: '5px', 
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        marginTop: '20px',
                        transition: 'background-color 0.2s'
                    }}
                >
                    ชำระเงินตอนนี้ ({order.total_price.toLocaleString()} บาท)
                </button>
            )}

            <h2 style={{marginTop: '30px', borderBottom: '1px solid #ddd', paddingBottom: '5px'}}>รายการสินค้าที่สั่ง</h2>
            {order.items && order.items.map((item, index) => (
                <div key={index} style={{ border: '1px solid #f0f0f0', padding: '10px', marginBottom: '10px', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
                    <p style={{ margin: '0 0 5px 0' }}><strong>สินค้า:</strong> {item.name}</p>
                    <p style={{ margin: '0 0 5px 0' }}><strong>จำนวน:</strong> {item.quantity}</p>
                    <p style={{ margin: 0 }}><strong>ราคารวม (เฉพาะรายการ):</strong> {(item.price * item.quantity).toLocaleString()} บาท</p>
                </div>
            ))}
            
            <h2 style={{marginTop: '30px', borderBottom: '1px solid #ddd', paddingBottom: '5px'}}>ที่อยู่สำหรับจัดส่ง</h2>
            <p><strong>ชื่อผู้รับ:</strong> {order.name || 'N/A'}</p>
            <p><strong>เบอร์โทร:</strong> {order.phone || 'N/A'}</p>
            <p style={{whiteSpace: 'pre-wrap'}}><strong>ที่อยู่:</strong> {order.address || 'N/A'}</p>
            
            <Link href="/profile/orders" style={{ display: 'block', marginTop: '40px', color: '#6b7280', textDecoration: 'underline' }}>
                ← กลับไปดูประวัติคำสั่งซื้อ
            </Link>
        </div>
    );
}