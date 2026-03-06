'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import pb from '@/app/lib/pocketbase'; 
import { useAuth } from '@/app/contexts/AuthContext'; 
import { 
    FiArrowLeft, FiTruck, FiMapPin, FiPackage, FiClock, 
    FiCheckCircle, FiXCircle, FiInfo, FiX, FiCamera
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
        case 'processing': return <div style={{ ...baseStyle, backgroundColor: '#E1F5FE', color: '#0288D1' }}><FiPackage /> กำลังเตรียมสินค้า</div>;
        case 'shipped': return <div style={{ ...baseStyle, backgroundColor: '#D1FAE5', color: colors.success }}><FiTruck /> จัดส่งแล้ว</div>;
        case 'completed': return <div style={{ ...baseStyle, backgroundColor: '#DCFCE7', color: '#166534' }}><FiCheckCircle /> สำเร็จแล้ว</div>;
        case 'cancelled': return <div style={{ ...baseStyle, backgroundColor: '#FEE2E2', color: colors.danger }}><FiXCircle /> ยกเลิกรายการ</div>;
        case 'return_pending': return <div style={{ ...baseStyle, backgroundColor: '#FEF3C7', color: '#D97706' }}><FiInfo /> รอตรวจสอบคืนสินค้า</div>;
        case 'refunded': return <div style={{ ...baseStyle, backgroundColor: '#F3F4F6', color: colors.gray }}><FiCheckCircle /> คืนเงินสำเร็จ</div>;
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

    // State สำหรับฟอร์มคืนสินค้า
    const [showRefundForm, setShowRefundForm] = useState(false);
    const [refundReason, setRefundReason] = useState('');
    const [refundFile, setRefundFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    // ✅ ฟังก์ชันแจ้งคืนเงิน/คืนสินค้า (ใช้ FormData เพื่อส่งไฟล์รูปภาพ)
    const handleRequestRefund = async (e) => {
        e.preventDefault();
        if (!refundReason || !refundFile) return alert('กรุณาระบุเหตุผลและแนบรูปหลักฐาน');
        
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('status', 'return_pending');
            formData.append('refund_reason', refundReason);
            formData.append('refund_evidence', refundFile);

            await pb.collection('orders').update(orderId, formData);
            
            alert('ส่งคำร้องเรียบร้อยแล้ว ทีมงานจะตรวจสอบหลักฐานของท่าน');
            window.location.reload(); 
        } catch (err) {
            alert('เกิดข้อผิดพลาด: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ✅ ฟังก์ชันยืนยันรับสินค้า
    const handleConfirmReceipt = async () => {
        if (!confirm('คุณได้รับสินค้าเรียบร้อยแล้วใช่หรือไม่?')) return;
        try {
            await pb.collection('orders').update(orderId, { status: 'completed' });
            setOrder({ ...order, status: 'completed' });
            alert('ยืนยันการรับสินค้าสำเร็จ! ตอนนี้คุณสามารถแจ้งคืนสินค้าได้หากพบปัญหา');
        } catch (err) { alert('เกิดข้อผิดพลาด: ' + err.message); }
    };

    // ✅ ฟังก์ชันยกเลิกออเดอร์ (เฉพาะ pending) พร้อมคืนสต็อกเข้าตารางสินค้า
    const handleCancelOrder = async () => {
        if (!confirm('ยืนยันการยกเลิกคำสั่งซื้อ? เมื่อยกเลิกแล้วระบบจะคืนสต็อกสินค้าให้ร้านทันที')) return;
        setIsSubmitting(true);
        try {
            // 1. คืนสต็อกสินค้า (วนลูปตามรายการที่มีในออเดอร์)
            const orderItems = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
            for (const item of orderItems) {
                try {
                    const product = await pb.collection('products').getOne(item.id);
                    await pb.collection('products').update(item.id, {
                        stock: (product.stock || 0) + (item.quantity || 0)
                    });
                } catch (pErr) {
                    console.error("คืนสต็อกไม่สำเร็จสำหรับสินค้า:", item.id);
                }
            }

            // 2. เปลี่ยนสถานะออเดอร์เป็น cancelled
            await pb.collection('orders').update(orderId, { status: 'cancelled' });
            
            alert('ยกเลิกรายการและคืนสต็อกสำเร็จ');
            window.location.reload();
        } catch (err) {
            console.error("Cancel Error:", err);
            alert('ไม่สามารถยกเลิกได้: กรุณาเช็ค API Rules ใน PocketBase');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ⛔ ป้องกัน Error: Cannot read properties of null (reading 'status')
    if (isAuthLoading || isLoading) return <div style={{ textAlign: 'center', padding: '100px' }}>กำลังโหลดข้อมูล...</div>;
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
                <div style={{ textAlign: 'right' }}>
                    {getStatusBadge(order.status)}
                    
                    {/* ปุ่มยกเลิก (แสดงเฉพาะตอนรอตรวจสอบสลิป) */}
                    {order.status === 'pending' && (
                        <div style={{ marginTop: '10px' }}>
                            <button 
                                onClick={handleCancelOrder} 
                                disabled={isSubmitting}
                                style={{ color: colors.danger, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.9rem', fontWeight: 'bold' }}
                            >
                                {isSubmitting ? 'กำลังดำเนินการ...' : 'ยกเลิกคำสั่งซื้อ'}
                            </button>
                        </div>
                    )}

                    {/* ปุ่มคืนสินค้า (แสดงเฉพาะเมื่อกดยืนยันรับของแล้วเท่านั้น) */}
                    {order.status === 'completed' && (
                        <div style={{ marginTop: '10px' }}>
                            <button 
                                onClick={() => setShowRefundForm(true)} 
                                style={{ backgroundColor: 'transparent', color: colors.danger, border: `1px solid ${colors.danger}`, borderRadius: '8px', cursor: 'pointer', padding: '5px 10px', fontSize: '0.8rem', fontWeight: 'bold' }}
                            >
                                แจ้งปัญหา / คืนเงินคืนสินค้า
                            </button>
                        </div>
                    )}
                </div>
            </div>
            
            <Link href="/profile" style={{ color: colors.gray, textDecoration: 'none', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '25px' }}>
                <FiArrowLeft /> กลับ
            </Link>

            {/* ฟอร์มแจ้งคืนสินค้า (จะโชว์เมื่อกดปุ่ม) */}
            {showRefundForm && (
                <div style={{ backgroundColor: '#fff5f5', border: `2px solid ${colors.danger}`, borderRadius: '12px', padding: '20px', marginBottom: '25px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                        <h3 style={{ margin: 0, color: colors.danger }}>แจ้งคืนสินค้า/คืนเงิน</h3>
                        <FiX onClick={() => setShowRefundForm(false)} style={{ cursor: 'pointer' }} />
                    </div>
                    <form onSubmit={handleRequestRefund}>
                        <textarea 
                            required 
                            value={refundReason} 
                            onChange={(e) => setRefundReason(e.target.value)} 
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '15px', fontFamily: 'inherit' }} 
                            placeholder="ระบุเหตุผลและหลักฐาน เช่น สินค้าแตกหัก, ได้ของไม่ครบ..." 
                        />
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>แนบรูปหลักฐาน (วิดีโอแกะกล่องหรือรูปสินค้าที่เสียหาย)</label>
                        <input 
                            type="file" 
                            accept="image/*" 
                            required 
                            onChange={(e) => setRefundFile(e.target.files[0])} 
                            style={{ marginBottom: '15px', display: 'block' }} 
                        />
                        <button 
                            type="submit" 
                            disabled={isSubmitting} 
                            style={{ width: '100%', padding: '12px', backgroundColor: colors.danger, color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            {isSubmitting ? 'กำลังส่งข้อมูล...' : 'ส่งคำร้องขอคืนเงิน'}
                        </button>
                    </form>
                </div>
            )}

            {/* ส่วนแสดง Tracking และปุ่มยืนยันรับสินค้า */}
            {order.status === 'shipped' && (
                <div style={{ backgroundColor: '#ecfdf5', border: '2px solid #10b981', borderRadius: '12px', padding: '20px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ color: '#065f46', fontWeight: 'bold', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><FiTruck /> สินค้าจัดส่งแล้ว</div>
                        {order.tracking && <div style={{ marginTop: '5px', fontSize: '1.2rem' }}>เลขพัสดุ: <strong style={{ color: '#059669' }}>{order.tracking}</strong></div>}
                    </div>
                    <button onClick={handleConfirmReceipt} style={{ backgroundColor: colors.success, color: 'white', border: 'none', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>ยืนยันการรับสินค้า</button>
                </div>
            )}

            {/* รายการสินค้าที่สั่งซื้อ */}
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
                    <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: colors.primary }}>฿{order.total_price?.toLocaleString()}</span>
                </div>
            </div>

            {/* ข้อมูลที่อยู่จัดส่ง */}
            <div style={{ border: `1px solid ${colors.border}`, padding: '20px', borderRadius: '12px' }}>
                <h3 style={{ margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '8px' }}><FiMapPin /> ข้อมูลที่อยู่จัดส่ง</h3>
                <p style={{ margin: '5px 0' }}><strong>ผู้รับ:</strong> {order.customerName}</p>
                <p style={{ margin: '5px 0' }}><strong>เบอร์โทรศัพท์:</strong> {order.phone}</p>
                <p style={{ margin: '5px 0', color: colors.gray }}>{order.address}</p>
            </div>
        </div>
    );
}