'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import pb from '../../lib/pocketbase'; 
import { 
    FiHome, FiRefreshCw, FiEye, FiCheck, FiX, FiFileText, 
    FiPackage, FiUser, FiMapPin, FiTruck, FiCreditCard, 
    FiAlertCircle, FiTrash2
} from 'react-icons/fi';

pb.autoCancellation(false);

const colors = { 
    primary: '#1A4D2E', 
    success: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
    white: '#FFFFFF',
    border: '#E5E7EB',
    lightBg: '#F9FAFB'
};

export default function AdminOrdersPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();

    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null); 
    const [trackingInputs, setTrackingInputs] = useState({});
    const [refundSlipFile, setRefundSlipFile] = useState(null);

    useEffect(() => {
        if (!isAuthLoading && (!user || (user.role !== 'admin' && !user.isAdmin))) {
            router.push('/');
        }
    }, [user, isAuthLoading, router]);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const records = await pb.collection('orders').getFullList({ 
                sort: '-created', expand: 'user' 
            });
            setOrders(records);
        } catch (error) { console.error("Fetch Error:", error); } 
        finally { setIsLoading(false); }
    };

    useEffect(() => { if (user) fetchOrders(); }, [user]);

    const updateStatus = async (orderId, newStatus, trackingNum = null, file = null) => {
        if (newStatus === 'shipped' && !trackingNum) return alert("กรุณากรอกเลขพัสดุก่อนจัดส่ง");
        if (newStatus === 'refunded' && !file) return alert("กรุณาแนบสลิปคืนเงินเพื่อเป็นหลักฐาน");

        let confirmMsg = `ต้องการเปลี่ยนสถานะเป็น ${newStatus} ใช่หรือไม่?`;
        let shouldReturnStock = false;

        if (newStatus === 'refunded') {
            shouldReturnStock = confirm("โอนคืนแล้วใช่ไหม? ต้องการคืนสินค้ากลับเข้าสต็อกด้วยหรือไม่?");
        } else if (!confirm(confirmMsg)) return;

        try {
            const formData = new FormData();
            formData.append('status', newStatus);
            if (trackingNum) formData.append('tracking', trackingNum);
            if (file) formData.append('admin_refund_slip', file);

            if (newStatus === 'cancelled' || (newStatus === 'refunded' && shouldReturnStock)) {
                const targetOrder = orders.find(o => o.id === orderId);
                // ✅ แก้ไขจุดนี้ให้เช็คประเภทข้อมูลก่อนคืนสต็อก
                const items = typeof targetOrder.items === 'string' ? JSON.parse(targetOrder.items) : targetOrder.items;
                for (const item of items) {
                    const product = await pb.collection('products').getOne(item.id);
                    await pb.collection('products').update(item.id, { stock: (product.stock || 0) + (item.quantity || 0) });
                }
            }

            await pb.collection('orders').update(orderId, formData);
            alert("อัปเดตเรียบร้อย!");
            fetchOrders(); setSelectedOrder(null); setRefundSlipFile(null);
        } catch (error) { alert("Error: " + error.message); }
    };

    const calculateTotals = (order) => {
        // ✅ แก้ไขจุดที่มีปัญหา JSON.parse ให้ปลอดภัย
        const items = typeof order.items === 'string' ? JSON.parse(order.items || '[]') : (order.items || []);
        const itemsTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        return { items, itemsTotal };
    };

    if (isAuthLoading || !user) return null;

    return (
        <div style={{ padding: '40px', maxWidth: '1300px', margin: '0 auto', fontFamily: "'Kanit', sans-serif" }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ color: colors.primary, fontWeight: '800' }}>Order Management</h1>
                <button onClick={fetchOrders} style={secondaryButtonStyle}><FiRefreshCw /> รีเฟรชข้อมูล</button>
            </div>

            <div style={tableContainerStyle}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: colors.lightBg }}>
                            <th style={thStyle}>ORDER ID</th>
                            <th style={thStyle}>ลูกค้า</th>
                            <th style={thStyle}>TOTAL</th>
                            <th style={thStyle}>สถานะ</th>
                            <th style={{ ...thStyle, textAlign: 'center' }}>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.id} style={trStyle}>
                                <td style={{ padding: '16px', fontWeight: 'bold' }}>#{order.id.slice(0, 8)}</td>
                                <td style={{ padding: '16px' }}>{order.customerName}</td>
                                <td style={{ padding: '16px', fontWeight: 'bold' }}>฿{order.total_price?.toLocaleString()}</td>
                                <td style={{ padding: '16px' }}>{getStatusBadge(order.status)}</td>
                                <td style={{ padding: '16px', textAlign: 'center' }}>
                                    <button onClick={() => setSelectedOrder(order)} style={viewButtonStyle}><FiEye /> จัดการ</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedOrder && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <div style={modalHeaderStyle}>
                            <h2 style={{ margin: 0 }}>Order Details #{selectedOrder.id.toUpperCase()}</h2>
                            <FiX onClick={() => setSelectedOrder(null)} style={{ cursor: 'pointer', fontSize: '1.5rem' }} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', padding: '30px' }}>
                            <div>
                                <h4 style={sectionTitleStyle}><FiPackage /> รายการสินค้า</h4>
                                <div style={infoBoxStyle}>
                                    {/* ✅ จุดที่แก้ไข Error JSON.parse */}
                                    {(typeof selectedOrder.items === 'string' ? JSON.parse(selectedOrder.items || '[]') : (selectedOrder.items || [])).map((item, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span>{item.name} x {item.quantity}</span>
                                            <span style={{ fontWeight: '600' }}>฿{(item.price * item.quantity).toLocaleString()}</span>
                                        </div>
                                    ))}
                                    <div style={{ borderTop: '1px solid #ddd', marginTop: '10px', paddingTop: '10px', fontWeight: 'bold', fontSize: '1.2rem', color: colors.primary }}>
                                        ยอดรวม: ฿{selectedOrder.total_price?.toLocaleString()}
                                    </div>
                                </div>

                                {selectedOrder.refund_reason && (
                                    <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#FFF5F5', border: `1px solid ${colors.danger}`, borderRadius: '12px' }}>
                                        <h4 style={{ color: colors.danger, margin: '0 0 10px 0' }}><FiAlertCircle /> ข้อมูลคืนสินค้า</h4>
                                        <p><strong>เหตุผล:</strong> {selectedOrder.refund_reason}</p>
                                        {selectedOrder.refund_evidence && (
                                            <img src={pb.files.getURL(selectedOrder, selectedOrder.refund_evidence)} style={{ width: '100%', borderRadius: '10px', marginTop: '10px' }} alt="evidence" />
                                        )}
                                    </div>
                                )}
                            </div>

                            <div style={{ textAlign: 'center' }}>
                                <h4><FiCreditCard /> หลักฐานการชำระเงิน</h4>
                                {selectedOrder.slip ? (
                                    <img src={pb.files.getURL(selectedOrder, selectedOrder.slip)} style={slipImageStyle} alt="slip" />
                                ) : <div style={emptySlipStyle}>ไม่มีสลิป</div>}

                                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {/* ส่วนจัดการเลขพัสดุ */}
                                    {!['cancelled', 'refunded'].includes(selectedOrder.status) && (
                                        <div style={actionCardStyle}>
                                            <p style={{ fontWeight: 'bold', marginBottom: '10px', textAlign: 'left' }}>ระบุเลขพัสดุ:</p>
                                            <input type="text" placeholder="Tracking Number" defaultValue={selectedOrder.tracking} style={inputStyle} onChange={(e) => setTrackingInputs({...trackingInputs, [selectedOrder.id]: e.target.value})} />
                                            <button onClick={() => updateStatus(selectedOrder.id, 'shipped', trackingInputs[selectedOrder.id] || selectedOrder.tracking)} style={primaryButtonStyle}>ยืนยันการจัดส่ง</button>
                                        </div>
                                    )}

                                    {/* ส่วนคืนเงิน */}
                                    {!['cancelled', 'refunded'].includes(selectedOrder.status) && (
                                        <div style={{ ...actionCardStyle, backgroundColor: '#F0FDF4', border: `1px solid ${colors.success}` }}>
                                            <p style={{ fontWeight: 'bold', marginBottom: '10px', textAlign: 'left', color: colors.success }}>แนบสลิปคืนเงิน:</p>
                                            <input type="file" accept="image/*" onChange={(e) => setRefundSlipFile(e.target.files[0])} style={{ marginBottom: '10px', fontSize: '0.8rem' }} />
                                            <button onClick={() => updateStatus(selectedOrder.id, 'refunded', null, refundSlipFile)} style={successButtonStyle}>ยืนยันคืนเงิน</button>
                                        </div>
                                    )}

                                    {selectedOrder.status === 'pending' && (
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button onClick={() => updateStatus(selectedOrder.id, 'paid')} style={{ flex: 1, ...successButtonStyle }}>อนุมัติสลิป</button>
                                            <button onClick={() => updateStatus(selectedOrder.id, 'rejected')} style={{ flex: 1, ...dangerButtonStyle }}>สลิปไม่ถูก</button>
                                        </div>
                                    )}
                                    <button onClick={() => updateStatus(selectedOrder.id, 'cancelled')} style={{ color: colors.danger, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>ยกเลิกรายการ (คืนสต็อก)</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- Helpers & Styles ---
const getStatusBadge = (status) => {
    let base = { padding: '5px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' };
    if (status === 'return_pending') return <span style={{ ...base, backgroundColor: '#FEE2E2', color: colors.danger }}>รอคืนเงิน</span>;
    if (status === 'refunded') return <span style={{ ...base, backgroundColor: '#F3F4F6', color: colors.gray }}>คืนเงินแล้ว</span>;
    if (status === 'paid') return <span style={{ ...base, backgroundColor: '#D1FAE5', color: colors.success }}>จ่ายแล้ว</span>;
    return <span style={{ ...base, backgroundColor: '#FEF3C7', color: colors.warning }}>{status}</span>;
};

const tableContainerStyle = { backgroundColor: 'white', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', overflow: 'hidden' };
const thStyle = { padding: '15px', textAlign: 'left', fontSize: '0.85rem', color: '#666' };
const trStyle = { borderTop: '1px solid #eee' };
const modalOverlayStyle = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContentStyle = { backgroundColor: 'white', borderRadius: '20px', width: '90%', maxWidth: '950px', maxHeight: '90vh', overflowY: 'auto' };
const modalHeaderStyle = { padding: '20px 30px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const infoBoxStyle = { backgroundColor: '#F9FAFB', padding: '20px', borderRadius: '12px' };
const sectionTitleStyle = { margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px' };
const actionCardStyle = { padding: '15px', borderRadius: '12px', border: '1px solid #eee' };
const slipImageStyle = { width: '100%', maxHeight: '350px', objectFit: 'contain', borderRadius: '10px' };
const inputStyle = { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '10px' };
const primaryButtonStyle = { width: '100%', padding: '12px', backgroundColor: colors.primary, color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };
const successButtonStyle = { width: '100%', padding: '12px', backgroundColor: colors.success, color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };
const dangerButtonStyle = { width: '100%', padding: '12px', backgroundColor: colors.danger, color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };
const secondaryButtonStyle = { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: 'white', border: `1px solid ${colors.primary}`, borderRadius: '10px', color: colors.primary, cursor: 'pointer' };
const viewButtonStyle = { padding: '6px 12px', borderRadius: '6px', border: '1px solid #ddd', cursor: 'pointer', backgroundColor: 'white' };
const emptySlipStyle = { height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', borderRadius: '10px' };