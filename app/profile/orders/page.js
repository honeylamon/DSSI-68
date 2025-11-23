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
                        // ✅ ส่วนสำคัญ: หุ้มด้วย Link เพื่อให้คลิกไปหน้ารายละเอียดได้
                        <Link 
                            key={order.id} 
                            href={`/profile/orders/${order.id}`} 
                            style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            <div style={{ 
                                border: '1px solid #ddd', 
                                padding: '15px', 
                                marginBottom: '15px', 
                                borderRadius: '6px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                cursor: 'pointer', // เพิ่ม cursor เพื่อบ่งบอกว่าคลิกได้
                                transition: 'box-shadow 0.2s'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '10px' }}>
                                    <span>Order ID: {order.id.substring(0, 8)}...</span>
                                    <span>วันที่: {new Date(order.created).toLocaleDateString('th-TH')}</span>
                                </div>

                                {/* ✅ ส่วนแสดงรายการสินค้า (ตามที่คุณต้องการ) */}
                                <div style={{ 
                                    marginTop: '10px', 
                                    padding: '10px', 
                                    border: '1px solid #f0f0f0', 
                                    borderRadius: '4px',
                                    backgroundColor: '#fafafa'
                                }}>
                                    <h4 style={{ margin: '0 0 5px 0', fontSize: '1rem', color: '#6b7280' }}>รายละเอียดสินค้า:</h4>
                                    {order.items && order.items.map((item, index) => (
                                        <p key={index} style={{ margin: '2px 0', fontSize: '0.9rem' }}>
                                            * **{item.name || 'ไม่ระบุชื่อสินค้า'}** x **{item.quantity || 1}** ({(item.price * (item.quantity || 1) || 0).toLocaleString()} บาท)
                                        </p>
                                    ))}
                                    <p style={{ margin: '5px 0' }}>จำนวนรวม: {order.items ? order.items.length : 0} ชิ้น</p>
                                </div>
                                {/* 🛑 สิ้นสุดส่วนแสดงรายการสินค้า */}
                                
                                <p style={{ margin: '5px 0', marginTop: '15px' }}>ยอดรวม: <span style={{color: '#10b981', fontWeight: 'bold'}}>{order.total_price.toLocaleString()} บาท</span></p>
                                <p style={{ margin: '5px 0' }}>สถานะ: <span style={{
                                    backgroundColor: order.status === 'pending' ? '#ffedd5' : '#d1fae5', 
                                    color: order.status === 'pending' ? '#f97316' : '#059669',
                                    padding: '3px 8px',
                                    borderRadius: '4px',
                                    fontWeight: 'bold'
                                }}>{order.status}</span></p>
                                
                                <span style={{ 
                                    color: '#2563eb', 
                                    textDecoration: 'underline', 
                                    display: 'block', 
                                    marginTop: '10px',
                                    fontWeight: 'bold'
                                }}>ดูรายละเอียด →</span>

                            </div>
                        </Link>
                    ))}
                </div>
            )}
            
            <Link href="/" style={{ display: 'block', marginTop: '20px', color: '#6b7280' }}>
                ← กลับหน้าร้านค้า
            </Link>
        </div>
    );
}