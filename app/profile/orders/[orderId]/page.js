'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import pb from '@/app/lib/pocketbase'; 
import { useAuth } from '@/app/contexts/AuthContext'; 
// นำเข้าไอคอนแทน Emoji
import { 
    FiArrowLeft, 
    FiTruck, 
    FiMapPin, 
    FiPackage, 
    FiCreditCard, 
    FiClock, 
    FiCheckCircle, 
    FiXCircle,
    FiUser,
    FiPhone,
    FiShoppingBag
} from 'react-icons/fi';

const colors = {
    primary: '#1A4D2E', 
    success: '#10b981', 
    warning: '#f97316', 
    danger: '#ef4444',  
    gray: '#6b7280',
    white: '#FFFFFF',
    border: '#e5e7eb',
    background: '#f9fafb'
};

const getStatusBadge = (status) => {
    const baseStyle = { 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '6px', 
        padding: '6px 14px', 
        borderRadius: '20px', 
        fontWeight: '600', 
        fontSize: '0.9rem' 
    };

    switch (status) {
        case 'pending': 
            return <div style={{ ...baseStyle, backgroundColor: '#FFEDD5', color: colors.warning }}><FiClock /> รอดำเนินการ</div>;
        case 'paid': 
            return <div style={{ ...baseStyle, backgroundColor: '#dcfce7', color: '#166534' }}><FiCheckCircle /> ชำระเงินแล้ว</div>;
        case 'shipped': 
            return <div style={{ ...baseStyle, backgroundColor: '#D1FAE5', color: colors.success }}><FiTruck /> จัดส่งแล้ว</div>;
        case 'cancelled': case 'rejected': 
            return <div style={{ ...baseStyle, backgroundColor: '#FEE2E2', color: colors.danger }}><FiXCircle /> ยกเลิก/สลิปไม่ผ่าน</div>;
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
                // ตรวจสอบสิทธิ์เจ้าของออเดอร์
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

    if (isAuthLoading || isLoading) return <div style={{ textAlign: 'center', padding: '100px', fontFamily: "'Kanit', sans-serif" }}>กำลังโหลดข้อมูล...</div>;
    if (error) return <div style={{ textAlign: 'center', padding: '100px', color: colors.danger }}>{error}</div>;
    if (!order) return null;

    // --- เตรียมข้อมูลและการคำนวณ ---
    const orderItems = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
    
    // ✅ ดึงข้อมูลที่อยู่และชื่อผู้รับ (Fallback ตรวจสอบหลายฟิลด์ป้องกันชื่อไม่ขึ้น)
    let addressData = {};
    if (order.address_detail) {
        try {
            addressData = typeof order.address_detail === 'string' ? JSON.parse(order.address_detail) : order.address_detail;
        } catch (e) { console.error(e); }
    }

    const recipientName = order.customerName || addressData.recipient || addressData.name || user?.name || 'ไม่ระบุชื่อ';
    const recipientPhone = order.phone || addressData.phone || user?.phone || '-';
    const shippingAddress = order.address || addressData.address || 'รับที่หน้าร้าน';

    // ✅ คำนวณราคาสินค้าจริง และค่าจัดส่งจากส่วนต่าง
    const itemsTotal = orderItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
    const totalAmount = order.total_price || 0;
    const shippingFee = totalAmount - itemsTotal;

    return (
        <div style={{ maxWidth: '850px', margin: '40px auto', padding: '30px', backgroundColor: colors.white, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontFamily: "'Kanit', sans-serif" }}>
            
            {/* ส่วนหัวรายการ */}
            <div style={{ marginBottom: '25px', borderBottom: `2px solid ${colors.border}`, paddingBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ color: colors.primary, fontSize: '1.8rem', margin: '0 0 5px 0' }}>รายละเอียดคำสั่งซื้อ</h1>
                    <p style={{ color: colors.gray, margin: 0 }}>รหัสรายการ: <strong>#{orderId.substring(0, 10)}</strong></p>
                </div>
                {getStatusBadge(order.status)}
            </div>
            
            <Link href="/profile/orders" style={{ color: colors.gray, textDecoration: 'none', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '25px' }}>
                <FiArrowLeft /> กลับหน้ารายการทั้งหมด
            </Link>

            {/* ข้อมูลการจัดส่งและรับสินค้า */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', border: `1px solid ${colors.border}`, padding: '20px', borderRadius: '12px', backgroundColor: colors.background, marginBottom: '30px' }}>
                <div>
                    <p style={{ margin: '8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiClock color={colors.gray} /> <strong>วันที่สั่งซื้อ:</strong> {new Date(order.created).toLocaleDateString('th-TH')}
                    </p>
                    <p style={{ margin: '8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiCreditCard color={colors.gray} /> <strong>ช่องทางการชำระเงิน:</strong> {order.payment_method || 'โอนเงินผ่านธนาคาร'}
                    </p>
                </div>
                <div>
                    <p style={{ margin: '8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {order.deliveryType === 'delivery' ? <FiTruck color={colors.primary} /> : <FiShoppingBag color={colors.primary} />}
                        <strong>วิธีการรับสินค้า:</strong> 
                        <span style={{ color: colors.primary, fontWeight: '700', marginLeft: '5px' }}>
                            {order.deliveryType === 'delivery' ? 'จัดส่งตามที่อยู่' : 'รับที่หน้าร้าน (Self Pickup)'}
                        </span>
                    </p>
                    {order.tracking && (
                        <p style={{ margin: '8px 0', color: colors.success, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FiPackage /> <strong>เลขพัสดุ:</strong> {order.tracking}
                        </p>
                    )}
                </div>
            </div>

            {/* รายการสินค้า */}
            <h2 style={{ fontSize: '1.2rem', color: colors.primary, marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FiPackage /> สินค้าในคำสั่งซื้อนี้
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {orderItems.map((item, index) => {
                    const imageUrl = (item.image && item.id) ? `${pb.baseUrl}/api/files/products/${item.id}/${item.image}` : null;
                    return (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', padding: '15px', border: `1px solid ${colors.border}`, borderRadius: '12px' }}>
                            <div style={{ width: '70px', height: '70px', borderRadius: '8px', overflow: 'hidden', marginRight: '15px', border: '1px solid #eee', flexShrink: 0 }}>
                                {imageUrl ? (
                                    <img src={imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '0.7rem' }}>ไม่มีรูป</div>
                                )}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{item.name}</div>
                                <div style={{ color: colors.gray, fontSize: '0.85rem' }}>จำนวน {item.quantity} ชิ้น</div>
                            </div>
                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: colors.primary }}>
                                ฿{((item.price || 0) * (item.quantity || 0)).toLocaleString()}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* สรุปยอดเงิน */}
            <div style={{ marginTop: '30px', padding: '20px', backgroundColor: colors.background, borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: colors.gray }}>
                    <span>ค่ารวมสินค้า</span>
                    <span style={{ fontWeight: '600' }}>฿{itemsTotal.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: colors.gray }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FiTruck /> ค่าจัดส่ง ({order.deliveryType === 'delivery' ? 'จัดส่งด่วน' : 'รับเองที่ร้าน'})
                    </span>
                    <span style={{ fontWeight: '600' }}>฿{shippingFee > 0 ? shippingFee.toLocaleString() : '0'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', paddingTop: '15px', borderTop: `2px solid ${colors.border}` }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: colors.primary }}>ยอดรวมสุทธิ</span>
                    <span style={{ color: colors.success, fontSize: '1.8rem', fontWeight: 'bold' }}>฿{totalAmount.toLocaleString()}</span>
                </div>
            </div>

            {/* ข้อมูลผู้รับและที่อยู่ */}
            <h2 style={{ marginTop: '40px', fontSize: '1.2rem', color: colors.primary, marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FiMapPin /> ข้อมูลผู้รับและที่อยู่จัดส่ง
            </h2>
            <div style={{ padding: '25px', border: `1px solid ${colors.border}`, borderRadius: '12px', backgroundColor: '#fff', lineHeight: '1.8' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <FiUser color={colors.gray} /> 
                    <strong>ชื่อผู้รับ:</strong> 
                    <span style={{ marginLeft: '5px', color: colors.text, fontWeight: '600' }}>{recipientName}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <FiPhone color={colors.gray} /> 
                    <strong>เบอร์โทรศัพท์:</strong> 
                    <span style={{ marginLeft: '5px' }}>{recipientPhone}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'start', gap: '10px' }}>
                    <FiMapPin color={colors.gray} style={{ marginTop: '6px' }} /> 
                    <div>
                        <strong>ที่อยู่จัดส่ง:</strong> 
                        <div style={{ color: colors.gray, marginTop: '2px' }}>{shippingAddress}</div>
                    </div>
                </div>
            </div>
            
        </div>
    );
}