// app/profile/orders/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import pb from '@/app/lib/pocketbase'; 
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

    useEffect(() => {
        if (!isAuthLoading && !user) {
            router.push('/signin');
        }
    }, [user, isAuthLoading, router]);

    useEffect(() => {
        let isMounted = true; 
        
        if (user) {
            const fetchOrders = async () => {
                setIsLoadingOrders(true);
                setError(null);
                try {
                    const records = await pb.collection('orders').getFullList({
                        sort: '-created', 
                        filter: `user.id = '${user.id}'`, 
                    });
                    
                    if (isMounted) {
                        setOrders(records);
                    }
                } catch (err) {
                    if (isMounted) {
                        console.error('Failed to fetch orders:', err);
                        if (err.message && err.message.includes('autocancelled')) {
                             setError('การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง');
                        } else {
                            setError('เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อ');
                        }
                        setOrders([]); 
                    }
                } finally {
                    if (isMounted) {
                        setIsLoadingOrders(false);
                    }
                }
            };
            fetchOrders();
        }
        
        return () => {
            isMounted = false;
        };
    }, [user]);

    if (isAuthLoading || isLoadingOrders) {
        return <div style={{ textAlign: 'center', padding: '100px', fontSize: '1.2rem', color: colors.primary }}>กำลังโหลดประวัติคำสั่งซื้อ...</div>;
    }
    
    if (!user) return null;

    return (
        <div style={{ maxWidth: '900px', margin: '40px auto', padding: '30px', backgroundColor: colors.white, borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            
            <h1 style={{ color: colors.primary, borderBottom: `2px solid ${colors.border}`, paddingBottom: '15px', marginBottom: '25px' }}>
                รายการคำสั่งซื้อทั้งหมด
            </h1>
            
            <div style={{ marginBottom: '20px' }}>
                <Link href="/profile" style={{ color: colors.gray, textDecoration: 'none', fontWeight: 'bold' }}>
                    &larr; กลับไปหน้าโปรไฟล์
                </Link>
            </div>

            {error && (
                <div style={{ padding: '15px', backgroundColor: colors.danger, color: colors.white, borderRadius: '8px', marginBottom: '20px' }}>
                    {error}
                </div>
            )}

            {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px', backgroundColor: colors.background, borderRadius: '8px' }}>
                    <p style={{ fontSize: '1.1rem', color: colors.text }}>คุณยังไม่มีประวัติคำสั่งซื้อ</p>
                    <Link href="/" style={{ color: colors.primary, textDecoration: 'underline', marginTop: '10px', display: 'inline-block' }}>
                        เริ่มเลือกซื้อสินค้า
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {orders.map((order) => (
                        <Link
                            key={order.id}
                            href={`/profile/orders/${order.id}`}
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
                                transition: 'all 0.2s',
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
                            <div style={{ flex: 1 }}>
                                <p style={{ fontWeight: 'bold', margin: '0 0 5px 0', color: colors.primary }}>
                                    รหัสคำสั่งซื้อ: #{order.id.substring(0, 8)} 
                                </p>
                                <p style={{ fontSize: '0.9rem', color: colors.gray, margin: 0 }}>
                                    วันที่สั่งซื้อ: {new Date(order.created).toLocaleDateString('th-TH')}
                                </p>
                                
                                {/* แสดงหมายเลขพัสดุในหน้ารายการหลัก (ถ้ามีข้อมูล) */}
                                {order.tracking_number && (
                                    <p style={{ fontSize: '0.9rem', color: colors.success, fontWeight: 'bold', marginTop: '8px' }}>
                                        📦 เลขพัสดุ: {order.tracking_number}
                                    </p>
                                )}
                            </div>
                            
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