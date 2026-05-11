'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import pb from '../../lib/pocketbase'; 
import { 
    FiRefreshCw, FiEye, FiX, FiPackage, FiTruck, FiCreditCard, 
    FiClock, FiCheckCircle, FiSearch, FiAlertCircle, FiUser, FiPhone, FiMapPin
} from 'react-icons/fi';

// ✅ ป้องกัน Error autocancelled (ClientResponseError 0)
pb.autoCancellation(false); 

const colors = { 
    primary: '#1A4D2E', 
    success: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
    white: '#FFFFFF',
    border: '#E5E7EB',
    lightBg: '#F9FAFB',
    dangerLight: '#FFF5F5'
};

export default function AdminOrdersPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();

    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null); 
    const [trackingInputs, setTrackingInputs] = useState({});

    useEffect(() => {
        if (!isAuthLoading && (!user || (user.role !== 'admin' && !user.isAdmin))) {
            router.push('/');
        }
    }, [user, isAuthLoading, router]);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const records = await pb.collection('orders').getFullList({ 
                sort: '-created', 
                expand: 'user', 
                requestKey: null 
            });
            // 🔍 Debug: แสดง key ทั้งหมดใน expand เพื่อหาชื่อ field จริง
            if (records.length > 0) {
                console.log('=== DEBUG expand ===');
                console.log('expand keys:', Object.keys(records[0].expand || {}));
                console.log('expand full:', records[0].expand);
            }
            setOrders(records);
        } catch (error) { console.error("Fetch Error:", error); } 
        finally { setIsLoading(false); }
    };

    useEffect(() => { if (user) fetchOrders(); }, [user]);

    // ✅ ฟังก์ชันดึงชื่อลูกค้า
    const getOrderCustomerName = (order) => {
        // 1. ตรวจสอบฟิลด์ name ในออเดอร์ก่อน
        if (order.name && order.name !== 'N/A' && order.name.trim() !== '') {
            return order.name;
        }
        // 2. ดึงจาก expand.user
        const expandedUser = order.expand?.user;
        if (expandedUser) {
            if (expandedUser.name && expandedUser.name.trim() !== '') return expandedUser.name;
            if (expandedUser.username && expandedUser.username.trim() !== '') return expandedUser.username;
            if (expandedUser.email) return expandedUser.email.split('@')[0];
        }
        return 'ไม่ระบุชื่อ';
    };

    // ✅ ฟังก์ชันคำนวณค่าจัดส่ง (จาก ยอดสุทธิ - ราคาสินค้าทั้งหมด)
    const calculateFees = (order) => {
        const items = typeof order.items === 'string' ? JSON.parse(order.items || '[]') : (order.items || []);
        const itemsTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shippingFee = order.total_price - itemsTotal;
        return { itemsTotal, shippingFee: shippingFee > 0 ? shippingFee : 0 };
    };

    const filteredOrders = useMemo(() => {
        const term = (searchTerm || '').toLowerCase();
        return orders.filter(o => 
            (o.tracking && o.tracking.toLowerCase().includes(term)) ||
            (getOrderCustomerName(o).toLowerCase().includes(term)) ||
            (o.id && o.id.toLowerCase().includes(term))
        );
    }, [orders, searchTerm]);

    const groupedOrders = useMemo(() => {
        return {
            pending: filteredOrders.filter(o => ['pending', 'paid'].includes(o.status)),
            completed: filteredOrders.filter(o => ['shipped', 'completed'].includes(o.status)),
            cancelled: filteredOrders.filter(o => !['pending', 'paid', 'shipped', 'completed'].includes(o.status))
        };
    }, [filteredOrders]);

    const updateStatus = async (orderId, newStatus, trackingNum = null) => {
        if (newStatus === 'shipped' && !trackingNum) return alert("กรุณากรอกเลขพัสดุ");
        if (!confirm(`ต้องการเปลี่ยนสถานะเป็น ${newStatus} ใช่หรือไม่?`)) return;
        try {
            // ✅ ส่งเฉพาะ tracking ถ้ามีค่า ป้องกัน 400 Bad Request
            const updateData = { status: newStatus };
            if (trackingNum) updateData.tracking = trackingNum;
            await pb.collection('orders').update(orderId, updateData);
            alert("อัปเดตเรียบร้อย!");
            fetchOrders(); setSelectedOrder(null);
        } catch (error) { alert(error.message); }
    };

    const safeParseItems = (itemsData) => {
        try {
            if (typeof itemsData === 'string') return JSON.parse(itemsData || '[]');
            if (Array.isArray(itemsData)) return itemsData;
            return [];
        } catch (e) { return []; }
    };

    const OrderTable = ({ items, title, icon, color }) => (
        <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.2rem', color: color, marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                {icon} {title} ({items.length})
            </h2>
            <div style={tableContainerStyle}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: colors.lightBg }}>
                            <th style={thStyle}>ORDER ID</th>
                            <th style={thStyle}>ลูกค้า</th>
                            <th style={thStyle}>เลขพัสดุ</th>
                            <th style={thStyle}>TOTAL</th>
                            <th style={thStyle}>สถานะ</th>
                            <th style={{ ...thStyle, textAlign: 'center' }}>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 ? (
                            <tr><td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: '#999' }}>ไม่มีรายการ</td></tr>
                        ) : (
                            items.map((order) => (
                                <tr key={order.id} style={trStyle}>
                                    <td style={{ padding: '16px', fontWeight: 'bold' }}>#{order.id.slice(0, 8)}</td>
                                    {/* ✅ แสดงชื่อลูกค้าในตารางดึงจากโปรไฟล์ */}
                                    <td style={{ padding: '16px' }}>{getOrderCustomerName(order)}</td>
                                    <td style={{ padding: '16px', color: colors.info }}>{order.tracking || '-'}</td>
                                    <td style={{ padding: '16px', fontWeight: 'bold' }}>฿{order.total_price?.toLocaleString()}</td>
                                    <td style={{ padding: '16px' }}>{getStatusBadge(order.status)}</td>
                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                        <button onClick={() => setSelectedOrder(order)} style={viewButtonStyle}><FiEye /> จัดการ</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    if (isAuthLoading || !user) return null;

    return (
        <div style={{ padding: '40px', maxWidth: '1300px', margin: '0 auto', fontFamily: "'Kanit', sans-serif" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ color: colors.primary, fontWeight: '800' }}>Order Management</h1>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={searchBoxStyle}><FiSearch /><input type="text" placeholder="ค้นหาเลขพัสดุ / ชื่อ / ID..." style={searchInputStyle} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                    <button onClick={fetchOrders} style={secondaryButtonStyle}><FiRefreshCw /> รีเฟรชข้อมูล</button>
                </div>
            </div>

            {isLoading ? <div style={{ textAlign: 'center', padding: '100px' }}>กำลังโหลด...</div> : (
                <>
                    <OrderTable items={groupedOrders.pending} title="รายการใหม่ / รอตรวจสอบ" icon={<FiClock />} color={colors.warning} />
                    <OrderTable items={groupedOrders.completed} title="จัดส่งแล้ว / สำเร็จแล้ว" icon={<FiCheckCircle />} color={colors.success} />
                    <OrderTable items={groupedOrders.cancelled} title="ยกเลิก / คืนเงิน" icon={<FiX />} color={colors.gray} />
                </>
            )}

            {selectedOrder && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <div style={modalHeaderStyle}>
                            <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Order Details #{selectedOrder.id.toUpperCase()}</h2>
                            <FiX onClick={() => setSelectedOrder(null)} style={{ cursor: 'pointer', fontSize: '1.5rem' }} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '30px', padding: '30px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                                <div>
                                    <h4 style={subTitleTitleStyle}><FiPackage /> รายการสินค้า</h4>
                                    <div style={infoCardStyle}>
                                        {safeParseItems(selectedOrder.items).map((item, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                                <span>{item.name} x {item.quantity}</span>
                                                <span style={{ fontWeight: '600' }}>฿{(item.price * item.quantity).toLocaleString()}</span>
                                            </div>
                                        ))}
                                        <div style={{ borderTop: '1px solid #eee', marginTop: '15px', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}>
                                                <span>รวมสินค้า:</span>
                                                <span>฿{calculateFees(selectedOrder).itemsTotal.toLocaleString()}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}>
                                                <span>ค่าจัดส่ง:</span>
                                                <span>฿{calculateFees(selectedOrder).shippingFee.toLocaleString()}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.3rem', fontWeight: 'bold', color: '#000', marginTop: '5px' }}>
                                                <span>ยอดรวมสุทธิ:</span>
                                                <span>฿{selectedOrder.total_price?.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 style={subTitleTitleStyle}><FiMapPin /> ที่อยู่จัดส่ง</h4>
                                    <div style={infoCardStyle}>
                                        {/* ✅ ชื่อผู้รับดึงจากข้อมูลส่วนตัว (Profile) แน่นอน */}
                                        <p style={addressRowStyle}><FiUser /> <strong>ชื่อผู้รับ:</strong> {getOrderCustomerName(selectedOrder)}</p>
                                        <p style={addressRowStyle}><FiPhone /> <strong>เบอร์โทรศัพท์:</strong> {selectedOrder.phone || '-'}</p>
                                        <p style={addressRowStyle}><FiMapPin /> <strong>ที่อยู่:</strong> {selectedOrder.address || '-'}</p>
                                        <p style={addressRowStyle}><strong>เลขพัสดุเดิม:</strong> {selectedOrder.tracking || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <h4 style={subTitleTitleStyle}><FiCreditCard /> หลักฐานการโอนเงิน</h4>
                                    <div style={slipContainerStyle}>
                                        {selectedOrder.slip ? <img src={pb.files.getURL(selectedOrder, selectedOrder.slip)} style={{ width: '100%', objectFit: 'contain' }} alt="slip" /> : <div style={{ color: '#999' }}>ยังไม่ได้แนบสลิป</div>}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {!['cancelled', 'refunded'].includes(selectedOrder.status) && (
                                        <div style={actionCardStyle}>
                                            <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>ระบุเลขพัสดุ:</p>
                                            <input type="text" placeholder="Tracking Number" style={inputStyle} value={trackingInputs[selectedOrder.id] ?? selectedOrder.tracking ?? ''} onChange={(e) => setTrackingInputs({...trackingInputs, [selectedOrder.id]: e.target.value})} />
                                            <button onClick={() => updateStatus(selectedOrder.id, 'shipped', trackingInputs[selectedOrder.id] || selectedOrder.tracking)} style={primaryButtonStyle}>ยืนยันการจัดส่ง</button>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <button onClick={() => updateStatus(selectedOrder.id, 'completed')} style={mainSuccessButtonStyle}>อนุมัติและคืนเงินแล้ว</button>
                                        <button onClick={() => updateStatus(selectedOrder.id, 'cancelled')} style={manageSecondaryButtonStyle}>ปฏิเสธและจบออเดอร์</button>
                                        <button onClick={() => updateStatus(selectedOrder.id, 'refunded')} style={cancelLinkStyle}>คืนเงินแล้ว (คืนสต็อก)</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- Styles & Helpers ---
const getStatusBadge = (status) => {
    let base = { padding: '5px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' };
    if (status === 'shipped' || status === 'completed') return <span style={{ ...base, backgroundColor: '#D1FAE5', color: colors.success }}>{status}</span>;
    if (status === 'cancelled' || status === 'rejected') return <span style={{ ...base, backgroundColor: '#FEE2E2', color: colors.danger }}>{status}</span>;
    return <span style={{ ...base, backgroundColor: '#FEF3C7', color: colors.warning }}>{status}</span>;
};

const thStyle = { padding: '15px', textAlign: 'left', fontSize: '0.85rem', color: '#666' };
const trStyle = { borderTop: '1px solid #eee' };
const tableContainerStyle = { backgroundColor: 'white', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', overflow: 'hidden' };
const modalOverlayStyle = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContentStyle = { backgroundColor: 'white', borderRadius: '24px', width: '90%', maxWidth: '980px', maxHeight: '92vh', overflowY: 'auto' };
const modalHeaderStyle = { padding: '20px 30px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const subTitleTitleStyle = { margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', color: '#333' };
const infoCardStyle = { backgroundColor: '#F9FAFB', padding: '20px', borderRadius: '12px', border: '1px solid #f0f0f0' };
const addressRowStyle = { margin: '0 0 8px 0', lineHeight: '1.5', display: 'flex', alignItems: 'center', gap: '8px' };
const slipContainerStyle = { height: '320px', backgroundColor: '#eee', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid #ddd' };
const actionCardStyle = { padding: '15px', borderRadius: '12px', border: '1px solid #eee' };
const inputStyle = { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '10px' };
const primaryButtonStyle = { width: '100%', padding: '12px', backgroundColor: colors.primary, color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };
const mainSuccessButtonStyle = { padding: '14px', backgroundColor: colors.success, color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' };
const manageSecondaryButtonStyle = { padding: '14px', backgroundColor: '#64748b', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' };
const cancelLinkStyle = { background: 'none', border: 'none', color: colors.danger, textDecoration: 'underline', cursor: 'pointer', fontWeight: 'bold', marginTop: '5px', textAlign: 'center' };
const searchBoxStyle = { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'white', padding: '0 15px', borderRadius: '10px', border: '1px solid #ddd', width: '320px' };
const searchInputStyle = { border: 'none', outline: 'none', padding: '10px 0', width: '100%', fontSize: '0.9rem' };
const viewButtonStyle = { padding: '6px 12px', borderRadius: '6px', border: '1px solid #ddd', cursor: 'pointer', backgroundColor: 'white' };
const secondaryButtonStyle = { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: 'white', border: `1px solid ${colors.primary}`, borderRadius: '10px', color: colors.primary, cursor: 'pointer' };