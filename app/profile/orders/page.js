'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import pb from '@/app/lib/pocketbase'; 
import { useAuth } from '@/app/contexts/AuthContext'; 

// --- Styles (CSS) ---
const colors = {
    primary: '#1A4D2E',
    success: '#10b981', 
    warning: '#f97316', 
    danger: '#ef4444', 
    text: '#374151',
    gray: '#6b7280',
    border: '#e5e7eb',
    background: '#f9fafb',
    white: '#FFFFFF',
    info: '#1E40AF'
};

const getStatusBadge = (status) => {
    let style = { padding: '6px 12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.85rem', display: 'inline-block' };
    let text = '';

    const currentStatus = status ? status.trim() : 'refunded';

    switch (currentStatus) {
        case 'pending':
            style.backgroundColor = '#FFEDD5'; style.color = colors.warning; text = 'รอดำเนินการ'; break;
        case 'processing':
            style.backgroundColor = '#E0F2F1'; style.color = colors.primary; text = 'กำลังจัดส่ง'; break;
        case 'completed':
            style.backgroundColor = '#D1FAE5'; style.color = colors.success; text = 'จัดส่งสำเร็จ'; break;
        case 'cancelled':
            style.backgroundColor = '#FEE2E2'; style.color = colors.danger; text = 'ยกเลิกแล้ว'; break;
        default:
            style.backgroundColor = '#DBEAFE'; style.color = colors.info; text = 'คืนเงินแล้ว'; break;
    }
    return <span style={style}>{text}</span>;
};

// Component ย่อยสำหรับการ์ดคำสั่งซื้อ
const OrderCard = ({ order }) => (
    <Link
        href={`/profile/orders/${order.id}`}
        style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '20px', border: `1px solid ${colors.border}`, borderRadius: '12px',
            backgroundColor: colors.white, textDecoration: 'none', transition: 'all 0.2s', marginBottom: '10px'
        }}
        onMouseOver={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = colors.primary; }}
        onMouseOut={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = colors.border; }}
    >
        <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 'bold', margin: '0 0 5px 0', color: colors.primary }}>#{order.id.substring(0, 8)}</p>
            <p style={{ fontSize: '0.85rem', color: colors.gray, margin: 0 }}>วันที่: {new Date(order.created).toLocaleDateString('th-TH')}</p>
        </div>
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            {getStatusBadge(order.status)}
            <p style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, color: colors.text }}>฿{order.total_price?.toLocaleString()}</p>
        </div>
    </Link>
);

export default function OrderHistoryPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);

    useEffect(() => {
        if (!isAuthLoading && !user) router.push('/signin');
    }, [user, isAuthLoading, router]);

    useEffect(() => {
        if (user) {
            const fetchOrders = async () => {
                setIsLoadingOrders(true);
                try {
                    const records = await pb.collection('orders').getFullList({
                        sort: '-created', filter: `user = '${user.id}'`,
                    });
                    setOrders(records);
                } catch (err) { console.error('Error:', err); }
                finally { setIsLoadingOrders(false); }
            };
            fetchOrders();
        }
    }, [user]);

    // ✅ จัดกลุ่มคำสั่งซื้อด้วย useMemo
    const groupedOrders = useMemo(() => {
        return {
            active: orders.filter(o => ['pending', 'processing'].includes(o.status)),
            completed: orders.filter(o => o.status === 'completed'),
            cancelled: orders.filter(o => !['pending', 'processing', 'completed'].includes(o.status))
        };
    }, [orders]);

    const SectionHeader = ({ title, color }) => (
        <h2 style={{ fontSize: '1.1rem', color: color, marginBottom: '15px', marginTop: '25px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: `1px solid ${colors.border}`, paddingBottom: '8px' }}>
            {title} ({orders.length > 0 ? (title === 'กำลังดำเนินการ' ? groupedOrders.active.length : title === 'สำเร็จแล้ว' ? groupedOrders.completed.length : groupedOrders.cancelled.length) : 0})
        </h2>
    );

    if (isAuthLoading || isLoadingOrders) return <div style={{ textAlign: 'center', padding: '100px', color: colors.primary }}>กำลังโหลด...</div>;
    if (!user) return null;

    return (
        <div style={{ maxWidth: '900px', margin: '40px auto', padding: '30px', backgroundColor: colors.white, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <h1 style={{ color: colors.primary, marginBottom: '10px' }}>📦 รายการคำสั่งซื้อของฉัน</h1>
            <Link href="/profile" style={{ color: colors.gray, textDecoration: 'none', fontSize: '0.9rem' }}>&larr; กลับไปหน้าโปรไฟล์</Link>

            {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', backgroundColor: colors.background, borderRadius: '12px', marginTop: '20px' }}>
                    <p>คุณยังไม่มีประวัติคำสั่งซื้อ</p>
                    <Link href="/" style={{ color: colors.primary, fontWeight: 'bold' }}>ไปเลือกซื้อสินค้า</Link>
                </div>
            ) : (
                <>
                    {/* --- 1. กลุ่มกำลังดำเนินการ --- */}
                    {groupedOrders.active.length > 0 && (
                        <div>
                            <SectionHeader title="กำลังดำเนินการ" color={colors.warning} />
                            {groupedOrders.active.map(order => <OrderCard key={order.id} order={order} />)}
                        </div>
                    )}

                    {/* --- 2. กลุ่มสำเร็จแล้ว --- */}
                    {groupedOrders.completed.length > 0 && (
                        <div>
                            <SectionHeader title="สำเร็จแล้ว" color={colors.success} />
                            {groupedOrders.completed.map(order => <OrderCard key={order.id} order={order} />)}
                        </div>
                    )}

                    {/* --- 3. กลุ่มยกเลิก/คืนเงิน --- */}
                    {groupedOrders.cancelled.length > 0 && (
                        <div>
                            <SectionHeader title="ยกเลิก/คืนเงิน" color={colors.gray} />
                            {groupedOrders.cancelled.map(order => <OrderCard key={order.id} order={order} />)}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}