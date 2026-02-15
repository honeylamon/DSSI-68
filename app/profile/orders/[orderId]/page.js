'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import pb from '@/app/lib/pocketbase'; 
import { useAuth } from '@/app/contexts/AuthContext'; 
import { 
    FiArrowLeft, FiTruck, FiMapPin, FiPackage, FiCreditCard, 
    FiClock, FiCheckCircle, FiXCircle, FiUser, FiPhone, 
    FiShoppingBag, FiInfo, FiCheck, FiHash
} from 'react-icons/fi';

const colors = {
    primary: '#1A4D2E', 
    success: '#10b981', 
    warning: '#f97316', 
    danger: '#ef4444',  
    gray: '#6b7280',
    white: '#FFFFFF',
    border: '#e5e7eb',
    background: '#f9fafb',
    text: '#374151'
};

const getStatusBadge = (status) => {
    const baseStyle = { 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '6px', 
        padding: '8px 16px', 
        borderRadius: '25px', 
        fontWeight: 'bold', 
        fontSize: '0.95rem' 
    };

    switch (status) {
        case 'pending': 
            return <div style={{ ...baseStyle, backgroundColor: '#FFEDD5', color: colors.warning }}><FiClock /> รอตรวจสอบสลิป</div>;
        case 'processing': 
            return <div style={{ ...baseStyle, backgroundColor: '#E1F5FE', color: '#0288D1' }}><FiPackage /> กำลังเตรียมสินค้า</div>;
        case 'shipped': 
            return <div style={{ ...baseStyle, backgroundColor: '#D1FAE5', color: colors.success }}><FiTruck /> จัดส่งแล้ว</div>;
        case 'completed': 
            return <div style={{ ...baseStyle, backgroundColor: '#DCFCE7', color: '#166534' }}><FiCheckCircle /> สำเร็จแล้ว</div>;
        case 'cancelled': 
            return <div style={{ ...baseStyle, backgroundColor: '#FEE2E2', color: colors.danger }}><FiXCircle /> ยกเลิกรายการ</div>;
        default: 
            return <div style={{ ...baseStyle, backgroundColor: colors.gray, color: colors.white }}>{status}</div>;
    }
};

export default function OrderDetailPage() {
    const { orderId } = useParams();
    const router = useRouter();
    const { user, isLoading: isAuthLoading } = useAuth();

    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isAuthLoading && !user) router.push('/signin');
    }, [user, isAuthLoading, router]);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderId || !user) return;
            setIsLoading(true);
            try {
                pb.autoCancellation(false);
                const record = await pb.collection('orders').getOne(orderId);
                if (record.user !== user.id) {
                    setError('คุณไม่มีสิทธิ์เข้าถึงคำสั่งซื้อนี้');
                    return;
                }
                setOrder(record);
            } catch (err) {
                setError('ไม่พบข้อมูลคำสั่งซื้อ');
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrder();
    }, [orderId, user]);

    const handleConfirmReceipt = async () => {
        if (!confirm('คุณได้รับสินค้าเรียบร้อยแล้วใช่หรือไม่?')) return;
        try {
            await pb.collection('orders').update(orderId, { status: 'completed' });
            setOrder({ ...order, status: 'completed' });
            alert('ขอบคุณที่ใช้บริการ Baan Joy ค่ะ!');
        } catch (err) {
            alert('เกิดข้อผิดพลาด: ' + err.message);
        }
    };

    if (isAuthLoading || isLoading) return <div style={{ textAlign: 'center', padding: '100px', fontFamily: "'Kanit', sans-serif" }}>กำลังโหลดข้อมูล...</div>;
    if (error) return <div style={{ textAlign: 'center', padding: '100px', color: colors.danger }}>{error}</div>;
    if (!order) return null;

    const orderItems = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);

    return (
        <div style={{ maxWidth: '850px', margin: '40px auto', padding: '30px', backgroundColor: colors.white, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontFamily: "'Kanit', sans-serif" }}>
            
            <div style={{ marginBottom: '25px', borderBottom: `2px solid ${colors.border}`, paddingBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ color: colors.primary, fontSize: '1.8rem', margin: '0' }}>รายละเอียดการสั่งซื้อ</h1>
                    <p style={{ color: colors.gray, margin: '5px 0 0 0' }}>หมายเลขคำสั่งซื้อ: <strong>#{orderId.toUpperCase()}</strong></p>
                </div>
                {getStatusBadge(order.status)}
            </div>
            
            <Link href="/profile" style={{ color: colors.gray, textDecoration: 'none', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '25px' }}>
                <FiArrowLeft /> กลับ
            </Link>

            {/* ✅ แก้ไขจาก tracking_number เป็น tracking ให้ตรงกับฐานข้อมูล */}
            {order.status === 'shipped' && order.tracking && (
                <div style={{ backgroundColor: '#ecfdf5', border: '2px solid #10b981', borderRadius: '12px', padding: '20px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ color: '#065f46', fontWeight: 'bold', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FiTruck /> สินค้าจัดส่งแล้ว
                        </div>
                        <div style={{ marginTop: '5px', fontSize: '1.2rem' }}>
                            เลขพัสดุ: <strong style={{ color: '#059669' }}>{order.tracking}</strong>
                        </div>
                    </div>
                    <button 
                        onClick={handleConfirmReceipt}
                        style={{ backgroundColor: colors.success, color: 'white', border: 'none', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        ยืนยันการรับสินค้า
                    </button>
                </div>
            )}

            {order.status === 'pending' && !order.slip && (
                <div style={{ backgroundColor: '#fffbeb', border: '1px solid #f59e0b', borderRadius: '12px', padding: '20px', marginBottom: '25px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#b45309', fontWeight: 'bold', marginBottom: '10px' }}>
                        <FiInfo /> กรุณาแจ้งชำระเงินเพื่อดำเนินการต่อ
                    </div>
                    <Link href={`/checkout/payment/${order.id}`} style={{ backgroundColor: '#f59e0b', color: 'white', textDecoration: 'none', padding: '10px', borderRadius: '8px', display: 'block', textAlign: 'center', fontWeight: 'bold' }}>
                        ไปหน้าแจ้งโอนเงิน
                    </Link>
                </div>
            )}

            <div style={{ backgroundColor: colors.background, padding: '20px', borderRadius: '12px', marginBottom: '25px' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>รายการสินค้า</h3>
                {orderItems.map((item, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span>{item.name} x {item.quantity}</span>
                        <span style={{ fontWeight: 'bold' }}>฿{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                ))}
                <div style={{ borderTop: '2px solid #ddd', marginTop: '15px', paddingTop: '15px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>รวมทั้งสิ้น</span>
                    <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: colors.primary }}>฿{order.total_price.toLocaleString()}</span>
                </div>
            </div>

            <div style={{ border: `1px solid ${colors.border}`, padding: '20px', borderRadius: '12px' }}>
                <h3 style={{ margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '8px' }}><FiMapPin /> ข้อมูลที่อยู่จัดส่ง</h3>
                <p style={{ margin: '5px 0' }}><strong>ผู้รับ:</strong> {order.customerName}</p>
                <p style={{ margin: '5px 0' }}><strong>เบอร์โทรศัพท์:</strong> {order.phone}</p>
                <p style={{ margin: '5px 0', color: colors.gray }}>{order.address}</p>
            </div>
            
        </div>
    );
}