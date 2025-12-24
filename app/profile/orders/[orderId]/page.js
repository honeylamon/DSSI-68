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
    success: '#10b981', // Green
    warning: '#f97316', // Orange
    danger: '#ef4444', // Red
    gray: '#6b7280',
    white: '#FFFFFF',
    border: '#e5e7eb',
    background: '#f9fafb'
};

// ฟังก์ชันสำหรับกำหนดสีสถานะ
const getStatusStyle = (status) => {
    switch (status) {
        case 'pending': return { backgroundColor: '#FFEDD5', color: colors.warning, border: `1px solid ${colors.warning}` };
        case 'processing': return { backgroundColor: '#F0F8FF', color: '#2563eb', border: `1px solid #2563eb` };
        case 'completed': return { backgroundColor: '#D1FAE5', color: colors.success, border: `1px solid ${colors.success}` };
        case 'cancelled': return { backgroundColor: '#FEE2E2', color: colors.danger, border: `1px solid ${colors.danger}` };
        default: return { backgroundColor: colors.gray, color: colors.white, border: `1px solid ${colors.gray}` };
    }
};

export default function OrderDetailPage() {
    const { orderId } = useParams();
    const router = useRouter();
    const { user, isLoading: isAuthLoading } = useAuth();

    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // 1. ตรวจสอบการล็อกอิน
    useEffect(() => {
        if (!isAuthLoading && !user) {
            router.push('/signin');
        }
    }, [user, isAuthLoading, router]);

    // 2. ดึงข้อมูลคำสั่งซื้อ
    useEffect(() => {
        let isMounted = true;
        
        const fetchOrder = async () => {
            if (!orderId || !user) return;

            setIsLoading(true);
            setError(null);
            
            try {
                const record = await pb.collection('orders').getOne(orderId);

                if (record.user !== user.id) {
                    if (isMounted) { setError('คุณไม่มีสิทธิ์เข้าถึงคำสั่งซื้อนี้'); setOrder(null); }
                    return;
                }
                
                if (isMounted) {
                    console.log("Order Data:", record); // เช็คข้อมูลใน Console
                    setOrder(record);
                }
            } catch (err) {
                if (isMounted) {
                    console.error('Failed to fetch order:', err);
                    if (err.status === 404) setError('ไม่พบคำสั่งซื้อนี้');
                    else setError('เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อ');
                    setOrder(null);
                }
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        if (user && orderId) fetchOrder();

        return () => { isMounted = false; };
    }, [orderId, user]);


    // --- เตรียมข้อมูลก่อนแสดงผล (Data Pre-processing) ---
    
    // 1. แกะข้อมูลที่อยู่ (Address)
    let addressData = {};
    if (order && order.address_detail) {
        // กรณีมี field address_detail (ระบบใหม่)
        try {
            addressData = typeof order.address_detail === 'string' 
                ? JSON.parse(order.address_detail) 
                : order.address_detail;
        } catch (e) { console.error("Parse Address Error", e); }
    } else if (order) {
        // Fallback: กรณีข้อมูลเก่า หรือเก็บแยก field
        addressData = {
            recipient: order.name || order.recipient_name || 'ไม่ระบุ',
            phone: order.phone || order.phone_number || 'ไม่ระบุ',
            address: order.address || order.shipping_address || 'ไม่ระบุ'
        };
    }

    // 2. แกะรายการสินค้า (Items)
    let orderItems = [];
    if (order && order.items) {
        try {
            orderItems = typeof order.items === 'string' 
                ? JSON.parse(order.items) 
                : order.items;
        } catch (e) { console.error("Parse Items Error", e); }
    }


    // --- การแสดงผล ---

    if (isAuthLoading || isLoading) return <div style={{ textAlign: 'center', padding: '50px', color: colors.primary }}>กำลังโหลด...</div>;
    if (!user) return null;

    if (error) {
        return (
            <div style={{ maxWidth: '800px', margin: '40px auto', padding: '30px', textAlign: 'center' }}>
                <p style={{ color: colors.danger }}>{error}</p>
                <Link href="/profile/orders" style={{ color: colors.primary }}>&larr; กลับไปหน้ารายการ</Link>
            </div>
        );
    }
    
    if (!order) return <div style={{ textAlign: 'center', padding: '50px' }}>ไม่พบข้อมูล</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '40px auto', padding: '30px', backgroundColor: colors.white, borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            
            <h1 style={{ color: colors.primary, borderBottom: `2px solid ${colors.border}`, paddingBottom: '15px', marginBottom: '25px' }}>
                รายละเอียดคำสั่งซื้อ #{orderId.substring(0, 8)}
            </h1>
            
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link href="/profile/orders" style={{ color: colors.gray, textDecoration: 'none', fontWeight: 'bold' }}>
                    &larr; กลับไปหน้ารายการคำสั่งซื้อ
                </Link>
                <div style={{ ...getStatusStyle(order.status), padding: '8px 12px', borderRadius: '20px', fontWeight: 'bold' }}>
                    {order.status === 'pending' ? 'รอดำเนินการ' : 
                     order.status === 'processing' ? 'กำลังจัดส่ง' :
                     order.status === 'completed' ? 'จัดส่งสำเร็จ' :
                     order.status === 'cancelled' ? 'ยกเลิกแล้ว' : order.status}
                </div>
            </div>

            {/* ข้อมูลทั่วไป */}
            <div style={{ border: `1px solid ${colors.border}`, padding: '20px', borderRadius: '10px', backgroundColor: colors.background, marginBottom: '20px' }}>
                <p style={{ margin: '5px 0' }}><strong>วันที่สั่งซื้อ:</strong> {new Date(order.created).toLocaleDateString('th-TH')}</p>
                <p style={{ margin: '5px 0' }}><strong>ช่องทางการชำระเงิน:</strong> {order.payment_method || 'N/A'}</p>
            </div>

            {/* ✅ รายการสินค้า (แก้ไขให้มีรูป) */}
            <h2 style={{marginTop: '30px', borderBottom: '1px solid #eee', paddingBottom: '5px', color: colors.primary}}>รายการสินค้า</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {orderItems.map((item, index) => {
                    // สร้าง URL รูปภาพ
                    const collectionId = item.collectionId || 'products';
                    const imageUrl = (item.image && item.id) 
                        ? `${pb.baseUrl}/api/files/${collectionId}/${item.id}/${item.image}`
                        : null;

                    return (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', paddingBottom: '15px', borderBottom: `1px dashed ${colors.border}` }}>
                            
                            {/* ส่วนแสดงรูปภาพ */}
                            <div style={{ width: '70px', height: '70px', borderRadius: '8px', overflow: 'hidden', marginRight: '15px', border: '1px solid #eee', backgroundColor: '#f9f9f9', flexShrink: 0 }}>
                                {imageUrl ? (
                                    <img src={imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: '#ccc' }}>No Img</div>
                                )}
                            </div>

                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 'bold', fontSize: '1.05rem' }}>{item.name || 'สินค้า'}</div>
                                <div style={{ fontSize: '0.9rem', color: colors.gray }}>x {item.quantity}</div>
                            </div>
                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: colors.primary }}>
                                ฿{((item.quantity || 0) * (item.price || item.price_at_order || 0)).toLocaleString()}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* สรุปยอดรวม */}
            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '2px solid #ccc', textAlign: 'right' }}>
                <p style={{ margin: '5px 0', fontSize: '1.2rem', fontWeight: 'bold', color: colors.primary }}>
                    รวมทั้งสิ้น: <span style={{ color: colors.success, fontSize: '1.4rem' }}>฿{order.total_price ? order.total_price.toLocaleString() : '0.00'}</span>
                </p>
            </div>

            {/* ✅ ข้อมูลการจัดส่ง (แก้ไขให้ดึงจาก addressData) */}
            <h2 style={{marginTop: '30px', borderBottom: '1px solid #eee', paddingBottom: '5px', color: colors.gray}}>ที่อยู่สำหรับจัดส่ง</h2>
            <div style={{padding: '20px', border: `1px solid ${colors.border}`, borderRadius: '8px', backgroundColor: colors.background}}>
                <p style={{ marginBottom: '8px' }}><strong>ชื่อผู้รับ:</strong> {addressData.recipient || 'ไม่ระบุ'}</p>
                <p style={{ marginBottom: '8px' }}><strong>เบอร์โทร:</strong> {addressData.phone || '-'}</p>
                <p style={{ marginBottom: '8px' }}><strong>ที่อยู่:</strong> {addressData.address || '-'}</p>
                {(addressData.city || addressData.postcode) && (
                    <p style={{ margin: 0 }}><strong>จังหวัด/รหัสไปรษณีย์:</strong> {addressData.city} {addressData.postcode}</p>
                )}
            </div>
            
        </div>
    );
}