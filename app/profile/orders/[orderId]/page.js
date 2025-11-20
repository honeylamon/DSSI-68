'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import pb from '@/app/lib/pocketbase';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function OrderHistoryPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Redirect ไปหน้า Login ถ้า User ไม่อยู่
        if (!user) {
            router.push('/signin');
            return;
        }

        const fetchOrders = async () => {
            try {
                // ดึงรายการคำสั่งซื้อของ User ที่ล็อกอินอยู่
                // filter: กรองเฉพาะ Order ของ user.id นี้
                // requestKey: null เพื่อแก้ปัญหา Next.js auto-cancellation
                const records = await pb.collection('orders').getFullList({
                    filter: `user = '${user.id}'`, 
                    sort: '-created',
                    requestKey: null 
                });

                setOrders(records);
            } catch (error) {
                console.error("Failed to fetch order history:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, [user, router]);

    // ถ้ากำลังโหลดข้อมูล (หรือถ้า User เป็น null หลัง Logout)
    if (isLoading || !user) {
        return <div style={{padding:'50px', textAlign:'center'}}>กำลังโหลดประวัติคำสั่งซื้อ...</div>;
    }

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
            <h1 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>ประวัติคำสั่งซื้อ</h1>
            
            {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px', border: '1px dashed #ccc', borderRadius: '8px' }}>
                    <p style={{fontSize: '1.1rem'}}>คุณยังไม่มีคำสั่งซื้อ</p>
                    <Link href="/" style={{ color: '#2563eb', textDecoration: 'underline', fontWeight: 'bold' }}>
                        เริ่มเลือกซื้อสินค้า
                    </Link>
                </div>
            ) : (
                <div style={{ marginTop: '20px' }}>
                    {orders.map((order) => (
                        <div key={order.id} style={{ 
                            border: '1px solid #ddd', 
                            padding: '15px', 
                            marginBottom: '15px', 
                            borderRadius: '6px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '10px' }}>
                                <span>Order ID: {order.id.substring(0, 8)}...</span>
                                <span>วันที่: {new Date(order.created).toLocaleDateString('th-TH')}</span>
                            </div>
                            {/* แสดงจำนวนสินค้าที่สั่ง */}
                            <p style={{ margin: '5px 0' }}>
                                จำนวนสินค้า: {order.items ? order.items.length : 0} ชิ้น
                            </p>
                            <p style={{ margin: '5px 0' }}>ยอดรวม: <span style={{color: '#10b981', fontWeight: 'bold'}}>{order.total_price.toLocaleString()} บาท</span></p>
                            <p style={{ margin: '5px 0' }}>สถานะ: <span style={{
                                backgroundColor: order.status === 'pending' ? '#ffedd5' : '#d1fae5', 
                                color: order.status === 'pending' ? '#f97316' : '#059669',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontWeight: 'bold'
                            }}>{order.status}</span></p>
                            
                            {/* ลิงก์สำหรับดูรายละเอียด Order แต่ละตัว (ถ้าสร้างหน้า detail เสร็จแล้ว) */}
                            {/* <Link href={`/profile/orders/${order.id}`} style={{ color: '#2563eb', textDecoration: 'underline', marginTop: '10px', display: 'inline-block' }}>
                                ดูรายละเอียด
                            </Link> */}
                        </div>
                    ))}
                </div>
            )}
            
            <Link href="/" style={{ display: 'block', marginTop: '20px', color: '#6b7280' }}>
                ← กลับหน้าร้านค้า
            </Link>
        </div>
    );
}