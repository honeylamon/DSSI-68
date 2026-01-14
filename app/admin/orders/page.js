'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import pb from '../../lib/pocketbase'; 
import { 
    FiHome, FiRefreshCw, FiEye, FiCheck, FiX, FiFileText, 
    FiPackage, FiUser, FiMapPin, FiTruck, FiCreditCard 
} from 'react-icons/fi';

pb.autoCancellation(false);

const colors = { 
    darkGreen: '#1A4D2E', 
    orange: '#f59e0b', 
    red: '#ef4444', 
    green: '#10b981', 
    gray: '#6b7280', 
    bg: '#f8f9fa',
    white: '#FFFFFF'
};

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null); // เก็บออเดอร์ที่เลือกดูรายละเอียด
    const [trackingInputs, setTrackingInputs] = useState({});
    const [editingOrderId, setEditingOrderId] = useState(null);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const records = await pb.collection('orders').getFullList({ sort: '-created', expand: 'user' });
            setOrders(records);
        } catch (error) { console.error("Fetch Error:", error); }
        finally { setIsLoading(false); }
    };

    useEffect(() => { fetchOrders(); }, []);

    const handleTrackingChange = (orderId, value) => {
        setTrackingInputs(prev => ({ ...prev, [orderId]: value }));
    };

    const updateStatus = async (orderId, newStatus, trackingNum = null) => {
        if (newStatus === 'shipped' && !trackingNum) return alert("กรุณากรอกเลขพัสดุ");
        if (!confirm(`ยืนยันการเปลี่ยนสถานะ?`)) return;

        try {
            const data = { status: newStatus };
            if (trackingNum) data.tracking = trackingNum;

            await pb.collection('orders').update(orderId, data);
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...data } : o));
            setSelectedOrder(null); // ปิด Modal หลังอัปเดต
            alert("ดำเนินการสำเร็จ");
        } catch (error) { alert("เกิดข้อผิดพลาด: " + error.message); }
    };

    // ฟังก์ชันคำนวณราคา
    const calculateTotals = (order) => {
        const items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
        const itemsTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = (order.total_price || 0) - itemsTotal;
        return { items, itemsTotal, shipping };
    };

    return (
        <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Kanit', sans-serif", backgroundColor: colors.bg, minHeight: '100vh' }}>
            {/* Header ส่วนบน */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', backgroundColor: 'white', padding: '15px 25px', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ fontSize: '1.5rem', fontWeight: '800', color: colors.darkGreen }}>Baan Joy</span><span style={{ fontSize: '1rem', color: colors.orange, fontWeight: '500' }}>Admin Control</span></div>
                <Link href="/" style={{ textDecoration: 'none', color: colors.gray, display: 'flex', alignItems: 'center', gap: '8px' }}><FiHome /> ไปหน้าเว็บ</Link>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '12px' }}><FiFileText color={colors.darkGreen} /> รายการคำสั่งซื้อ</h1>
                <button onClick={fetchOrders} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', backgroundColor: 'white', border: `1px solid ${colors.darkGreen}`, borderRadius: '8px', cursor: 'pointer' }}><FiRefreshCw /> รีเฟรช</button>
            </div>

            {/* ตารางรายการออเดอร์ */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f9fafb' }}>
                        <tr>
                            <th style={{ padding: '16px', textAlign: 'left' }}>Order ID</th>
                            <th style={{ padding: '16px', textAlign: 'left' }}>ลูกค้า</th>
                            <th style={{ padding: '16px', textAlign: 'left' }}>ราคารวม</th>
                            <th style={{ padding: '16px', textAlign: 'left' }}>สถานะ</th>
                            <th style={{ padding: '16px', textAlign: 'center' }}>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center' }}>กำลังโหลด...</td></tr>
                        ) : (
                            orders.map((order) => (
                                <tr key={order.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                                    <td style={{ padding: '16px' }}>#{order.id.slice(0, 8)}</td>
                                    <td style={{ padding: '16px' }}>{order.customerName || 'ลูกค้าทั่วไป'}</td>
                                    <td style={{ padding: '16px', fontWeight: 'bold', color: colors.darkGreen }}>฿{order.total_price?.toLocaleString()}</td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', border: '1px solid', 
                                            backgroundColor: order.status === 'paid' ? '#dcfce7' : order.status === 'shipped' ? '#d1fae5' : '#ffedd5',
                                            color: order.status === 'paid' ? '#166534' : order.status === 'shipped' ? '#059669' : '#f97316' }}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                        <button 
                                            onClick={() => setSelectedOrder(order)} 
                                            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #ddd', cursor: 'pointer', backgroundColor: 'white', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                                        >
                                            <FiEye /> รายละเอียด
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- Modal รายละเอียดคำสั่งซื้อ (เพิ่มใหม่) --- */}
            {selectedOrder && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '20px', width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', padding: '30px', position: 'relative' }}>
                        <button onClick={() => setSelectedOrder(null)} style={{ position: 'absolute', top: '20px', right: '20px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.5rem' }}><FiX /></button>
                        
                        <h2 style={{ marginBottom: '20px', color: colors.darkGreen }}>รายละเอียดออเดอร์ #{selectedOrder.id}</h2>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                            {/* ฝั่งซ้าย: สินค้าและที่อยู่ */}
                            <div>
                                <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}><FiPackage /> รายการสินค้า</h4>
                                <div style={{ border: '1px solid #eee', borderRadius: '10px', padding: '15px', marginBottom: '20px' }}>
                                    {calculateTotals(selectedOrder).items.map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                            <span>{item.name} x {item.quantity}</span>
                                            <span>฿{(item.price * item.quantity).toLocaleString()}</span>
                                        </div>
                                    ))}
                                    <div style={{ borderTop: '1px solid #eee', marginTop: '10px', paddingTop: '10px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}><span>ค่าสินค้า:</span><span>฿{calculateTotals(selectedOrder).itemsTotal.toLocaleString()}</span></div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}><span>ค่าจัดส่ง:</span><span>฿{calculateTotals(selectedOrder).shipping.toLocaleString()}</span></div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem', marginTop: '5px' }}><span>ยอดรวม:</span><span>฿{selectedOrder.total_price?.toLocaleString()}</span></div>
                                    </div>
                                </div>

                                <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}><FiUser /> ข้อมูลการจัดส่ง</h4>
                                <div style={{ backgroundColor: '#f9fafb', padding: '15px', borderRadius: '10px', fontSize: '0.9rem' }}>
                                    <p><strong>ชื่อ:</strong> {selectedOrder.customerName}</p>
                                    <p><strong>เบอร์โทร:</strong> {selectedOrder.phone}</p>
                                    <p><strong>ที่อยู่:</strong> {selectedOrder.address}</p>
                                    <p><strong>รูปแบบ:</strong> {selectedOrder.deliveryType === 'delivery' ? '🚚 ส่งตามที่อยู่' : '🏪 รับที่ร้าน'}</p>
                                </div>
                            </div>

                            {/* ฝั่งขวา: สลิปและการจัดการ */}
                            <div style={{ textAlign: 'center' }}>
                                <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', justifyContent: 'center' }}><FiCreditCard /> หลักฐานการโอน</h4>
                                {selectedOrder.slip ? (
                                    <a href={pb.files.getUrl(selectedOrder, selectedOrder.slip)} target="_blank" rel="noreferrer">
                                        <img src={pb.files.getUrl(selectedOrder, selectedOrder.slip)} style={{ width: '100%', maxHeight: '350px', objectFit: 'contain', borderRadius: '10px', border: '1px solid #eee' }} alt="slip" />
                                    </a>
                                ) : <div style={{ height: '200px', backgroundColor: '#eee', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>ไม่มีแนบสลิป</div>}

                                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {selectedOrder.status === 'pending' && (
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button onClick={() => updateStatus(selectedOrder.id, 'paid')} style={{ flex: 1, padding: '12px', backgroundColor: colors.green, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>อนุมัติสลิป</button>
                                            <button onClick={() => updateStatus(selectedOrder.id, 'rejected')} style={{ flex: 1, padding: '12px', backgroundColor: colors.red, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>สลิปไม่ผ่าน</button>
                                        </div>
                                    )}
                                    {selectedOrder.status === 'paid' && (
                                        <div style={{ backgroundColor: '#fff7ed', padding: '15px', borderRadius: '10px', border: '1px solid #fed7aa' }}>
                                            <input 
                                                type="text" 
                                                placeholder="กรอกเลขพัสดุ..." 
                                                style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                                                onChange={(e) => handleTrackingChange(selectedOrder.id, e.target.value)}
                                            />
                                            <button 
                                                onClick={() => updateStatus(selectedOrder.id, 'shipped', trackingInputs[selectedOrder.id])}
                                                style={{ width: '100%', padding: '12px', backgroundColor: colors.darkGreen, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                                            >
                                                ยืนยันการจัดส่ง
                                            </button>
                                        </div>
                                    )}
                                    <button onClick={() => updateStatus(selectedOrder.id, 'cancelled')} style={{ color: colors.red, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>ยกเลิกออเดอร์นี้</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}