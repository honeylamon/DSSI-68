'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import pb from '@/app/lib/pocketbase'; 
import { useAuth } from '@/app/contexts/AuthContext'; 
import { 
    FiArrowLeft, FiTruck, FiMapPin, FiPackage, FiClock, 
    FiCheckCircle, FiXCircle, FiInfo, FiX, FiUser, FiPhone
} from 'react-icons/fi';

const colors = {
    primary: '#1A4D2E', success: '#10b981', warning: '#f97316', 
    danger: '#ef4444', gray: '#6b7280', white: '#FFFFFF',
    border: '#e5e7eb', background: '#f9fafb', text: '#374151'
};

const getStatusBadge = (status) => {
    const baseStyle = { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '25px', fontWeight: 'bold', fontSize: '0.95rem' };
    switch (status) {
        case 'pending': return <div style={{ ...baseStyle, backgroundColor: '#FFEDD5', color: colors.warning }}><FiClock /> รอตรวจสอบสลิป</div>;
        case 'paid': return <div style={{ ...baseStyle, backgroundColor: '#D1FAE5', color: colors.success }}><FiCheckCircle /> ชำระเงินแล้ว</div>;
        case 'shipped': return <div style={{ ...baseStyle, backgroundColor: '#D1FAE5', color: colors.success }}><FiTruck /> จัดส่งแล้ว</div>;
        case 'completed': return <div style={{ ...baseStyle, backgroundColor: '#DCFCE7', color: '#166534' }}><FiCheckCircle /> สำเร็จแล้ว</div>;
        case 'cancelled': return <div style={{ ...baseStyle, backgroundColor: '#FEE2E2', color: colors.danger }}><FiXCircle /> ยกเลิกรายการ</div>;
        default: return <div style={{ ...baseStyle, backgroundColor: colors.gray, color: colors.white }}>{status}</div>;
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
                // ✅ เพิ่มการ expand: 'user' เพื่อดึงชื่อจากโปรไฟล์มาโชว์
                const record = await pb.collection('orders').getOne(orderId, {
                    expand: 'user'
                });
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

    // ✅ ฟังก์ชันช่วยดึงชื่อผู้รับ
    const getOrderCustomerName = (orderData) => {
        if (orderData.name && orderData.name !== 'N/A' && orderData.name.trim() !== '') return orderData.name;
        return orderData.expand?.user?.name || orderData.expand?.user?.username || 'ไม่ระบุชื่อ';
    };

    // ✅ ฟังก์ชันช่วยคำนวณค่าส่ง
    const calculateFees = (orderData) => {
        const items = typeof orderData.items === 'string' ? JSON.parse(orderData.items || '[]') : (orderData.items || []);
        const itemsTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shippingFee = orderData.total_price - itemsTotal;
        return { itemsTotal, shippingFee: shippingFee > 0 ? shippingFee : 0 };
    };

    if (isAuthLoading || isLoading) return <div style={{ textAlign: 'center', padding: '100px' }}>กำลังโหลดข้อมูล...</div>;
    if (error) return <div style={{ textAlign: 'center', padding: '100px', color: colors.danger }}>{error}</div>;
    if (!order) return null;

    const orderItems = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
    const { itemsTotal, shippingFee } = calculateFees(order);

    return (
        <div style={{ maxWidth: '850px', margin: '40px auto', padding: '30px', backgroundColor: colors.white, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontFamily: "'Kanit', sans-serif" }}>
            
            <div style={{ marginBottom: '25px', borderBottom: `2px solid ${colors.border}`, paddingBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ color: colors.primary, fontSize: '1.8rem', margin: '0' }}>รายละเอียดการสั่งซื้อ</h1>
                    <p style={{ color: colors.gray, margin: '5px 0 0 0' }}>หมายเลขคำสั่งซื้อ: <strong>#{orderId.toUpperCase()}</strong></p>
                </div>
                <div>{getStatusBadge(order.status)}</div>
            </div>
            
            <Link href="/profile/orders" style={{ color: colors.gray, textDecoration: 'none', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '25px' }}>
                <FiArrowLeft /> กลับ
            </Link>

            {/* รายการสินค้า */}
            <div style={{ backgroundColor: colors.background, padding: '25px', borderRadius: '12px', marginBottom: '25px' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}><FiPackage /> รายการสินค้า</h3>
                {orderItems.map((item, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span>{item.name} x {item.quantity}</span>
                        <span style={{ fontWeight: 'bold' }}>฿{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                ))}
                <div style={{ borderTop: '1px solid #ddd', marginTop: '15px', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: colors.gray }}>
                        <span>รวมสินค้า:</span>
                        <span>฿{itemsTotal.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: colors.gray }}>
                        {/* ✅ แสดงค่าจัดส่งตามจริง */}
                        <span>ค่าจัดส่ง:</span>
                        <span>฿{shippingFee.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>ยอดรวมทั้งสิ้น</span>
                        <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: colors.primary }}>฿{order.total_price?.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* ข้อมูลที่อยู่จัดส่ง */}
            <div style={{ border: `1px solid ${colors.border}`, padding: '25px', borderRadius: '12px' }}>
                <h3 style={{ margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '8px' }}><FiMapPin /> ข้อมูลที่อยู่จัดส่ง</h3>
                {/* ✅ แสดงชื่อผู้รับที่ดึงจากโปรไฟล์ */}
                <p style={{ margin: '8px 0' }}><FiUser /> <strong>ชื่อผู้รับ:</strong> {getOrderCustomerName(order)}</p>
                <p style={{ margin: '8px 0' }}><FiPhone /> <strong>เบอร์โทรศัพท์:</strong> {order.phone || '-'}</p>
                <p style={{ margin: '8px 0', color: colors.text, lineHeight: '1.6' }}>{order.address}</p>
            </div>
        </div>
    );
}