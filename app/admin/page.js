'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import pb from '../lib/pocketbase';
import { FiAlertCircle, FiShoppingBag, FiArrowRight, FiBox, FiClock, FiDollarSign, FiInfo } from 'react-icons/fi';

export default function AdminDashboard() {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [stats, setStats] = useState({
        totalSales: 0,
        totalOrders: 0,
        totalProducts: 0,
        pendingRefunds: 0 // ✅ เพิ่ม State สำหรับนับคำร้องขอคืนเงิน
    });
    
    const [recentOrders, setRecentOrders] = useState([]);
    const [lowStockProducts, setLowStockProducts] = useState([]);

    useEffect(() => {
        const checkAuth = async () => {
            const model = pb.authStore.model;
            if (!pb.authStore.isValid || !model || model.role !== 'admin') {
                alert("Access denied: เฉพาะ Admin เท่านั้น");
                router.push('/');
            } else {
                setIsAuthorized(true);
                fetchDashboardData();
            }
        };
        checkAuth();
    }, [router]);

    const fetchDashboardData = async () => {
        try {
            // 1. ดึงสถิติพื้นฐาน
            const productList = await pb.collection('products').getList(1, 1);
            const orderList = await pb.collection('orders').getList(1, 1);
            
            // ✅ 2. ดึงจำนวนคำร้องขอคืนเงิน (status = 'return_pending')
            const refundRequests = await pb.collection('orders').getList(1, 1, {
                filter: 'status = "return_pending"'
            });
            
            setStats({
                totalSales: 15400, 
                totalOrders: orderList.totalItems,
                totalProducts: productList.totalItems,
                pendingRefunds: refundRequests.totalItems // ✅ อัปเดตยอดคำร้อง
            });

            // 3. ดึงสินค้าที่สต็อกใกล้หมด
            const lowStock = await pb.collection('products').getList(1, 5, {
                filter: 'stock < 5',
                sort: 'stock'
            });
            setLowStockProducts(lowStock.items);

            // 4. ดึงออเดอร์ล่าสุด 5 รายการ
            const recent = await pb.collection('orders').getList(1, 5, {
                sort: '-created',
            });
            setRecentOrders(recent.items);

        } catch (e) {
            console.log("Error fetching dashboard data", e);
        }
    };

    if (!isAuthorized) return null;

    const colors = {
        darkGreen: '#1A4D2E',
        skyBlue: '#4FC3F7',
        lightPink: '#FFF0F3',
        hotPink: '#FF80AB',
        orange: '#f59e0b',
        red: '#ef4444', // ✅ เพิ่มสีแดงสำหรับแจ้งเตือนคืนเงิน
        white: '#FFFFFF'
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: colors.lightPink, padding: '40px', fontFamily: "'Kanit', sans-serif" }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                
                {/* Header */}
                <div style={{ marginBottom: '40px', borderBottom: `2px solid ${colors.skyBlue}`, paddingBottom: '20px' }}>
                    <h1 style={{ fontSize: '2.5rem', color: colors.darkGreen, marginBottom: '5px' }}>Admin Dashboard</h1>
                    <p style={{ color: '#555' }}>ระบบจัดการร้านค้า Baan Joy </p>
                </div>

                {/* 1. ส่วนแสดงสถิติ (เพิ่ม Card คืนเงินเข้าไป) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '25px', marginBottom: '40px' }}>
                    <div style={cardStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ color: '#888', margin: '0 0 5px 0' }}>ยอดขายรวม</p>
                                <h3 style={{ fontSize: '2rem', color: colors.darkGreen, margin: 0 }}>฿{stats.totalSales.toLocaleString()}</h3>
                            </div>
                            <div style={{ ...iconStyle, backgroundColor: '#E8F5E9', color: colors.darkGreen }}>💰</div>
                        </div>
                    </div>

                    <div style={cardStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ color: '#888', margin: '0 0 5px 0' }}>คำสั่งซื้อ</p>
                                <h3 style={{ fontSize: '2rem', color: '#0288D1', margin: 0 }}>{stats.totalOrders}</h3>
                            </div>
                            <div style={{ ...iconStyle, backgroundColor: '#E1F5FE', color: '#0288D1' }}>📃</div>
                        </div>
                    </div>

                    {/* ✅ ส่วนใหม่: แจ้งเตือนคืนเงิน (จะเปลี่ยนเป็นสีแดงถ้ามีคำร้องค้างอยู่) */}
                    <div style={{ ...cardStyle, border: stats.pendingRefunds > 0 ? `2px solid ${colors.red}` : '1px solid white' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ color: stats.pendingRefunds > 0 ? colors.red : '#888', margin: '0 0 5px 0', fontWeight: stats.pendingRefunds > 0 ? 'bold' : 'normal' }}>
                                    คำร้องคืนเงิน
                                </p>
                                <h3 style={{ fontSize: '2rem', color: stats.pendingRefunds > 0 ? colors.red : '#333', margin: 0 }}>
                                    {stats.pendingRefunds}
                                </h3>
                            </div>
                            <div style={{ ...iconStyle, backgroundColor: stats.pendingRefunds > 0 ? '#FEE2E2' : '#F5F5F5', color: colors.red }}>⚠️</div>
                        </div>
                    </div>

                    <div style={cardStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ color: '#888', margin: '0 0 5px 0' }}>สินค้าทั้งหมด</p>
                                <h3 style={{ fontSize: '2rem', color: colors.hotPink, margin: 0 }}>{stats.totalProducts}</h3>
                            </div>
                            <div style={{ ...iconStyle, backgroundColor: '#FCE4EC', color: colors.hotPink }}>📦</div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', marginBottom: '40px' }}>
                    {/* รายการสั่งซื้อล่าสุด */}
                    <div style={cardStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ color: colors.darkGreen, margin: 0, fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <FiClock /> คำสั่งซื้อล่าสุด
                            </h2>
                            <Link href="/admin/orders" style={{ color: colors.skyBlue, textDecoration: 'none', fontSize: '0.9rem' }}>ดูทั้งหมด</Link>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                                        <th style={tableThStyle}>ลูกค้า</th>
                                        <th style={tableThStyle}>ยอดเงิน</th>
                                        <th style={tableThStyle}>สถานะ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map(order => (
                                        <tr key={order.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                                            <td style={tableTdStyle}>{order.customerName || 'ไม่ระบุชื่อ'}</td>
                                            <td style={tableTdStyle}>฿{order.total_price?.toLocaleString()}</td>
                                            <td style={tableTdStyle}>
                                                <span style={{ 
                                                    padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem',
                                                    backgroundColor: order.status === 'return_pending' ? '#FEE2E2' : order.status === 'pending' ? '#fff3e0' : '#e8f5e9',
                                                    color: order.status === 'return_pending' ? colors.red : order.status === 'pending' ? '#ef6c00' : '#2e7d32'
                                                }}>
                                                    {order.status === 'return_pending' ? 'รอคืนเงิน' : order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* แจ้งเตือนสต็อกใกล้หมด */}
                    <div style={{ ...cardStyle, border: `1px solid ${colors.hotPink}` }}>
                        <h2 style={{ color: colors.hotPink, margin: '0 0 20px 0', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FiAlertCircle /> สต็อกใกล้หมด
                        </h2>
                        {lowStockProducts.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {lowStockProducts.map(item => (
                                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid #fff0f3' }}>
                                        <span style={{ fontSize: '0.95rem' }}>{item.name}</span>
                                        <span style={{ fontWeight: 'bold', color: item.stock <= 0 ? '#ef4444' : colors.orange }}>
                                            {item.stock} ชิ้น
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: '#999', textAlign: 'center' }}>สินค้าในสต็อกเพียงพอ</p>
                        )}
                        <Link href="/admin/products" style={{ display: 'block', textAlign: 'center', marginTop: '20px', color: colors.hotPink, fontSize: '0.85rem' }}>ไปจัดการสต็อก</Link>
                    </div>
                </div>

                {/* เมนูจัดการ */}
                <h2 style={{ color: colors.darkGreen, marginBottom: '20px', borderLeft: `5px solid ${colors.darkGreen}`, paddingLeft: '15px' }}>
                    เมนูจัดการ
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                    <Link href="/admin/products" style={actionCardStyle}>
                        <div style={{ ...iconStyle, backgroundColor: '#E8F5E9', color: colors.darkGreen, marginRight: '20px' }}>📦</div>
                        <div>
                            <h3 style={{ margin: '0 0 5px 0', color: colors.darkGreen }}>จัดการสินค้า</h3>
                            <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>เพิ่ม/ลบ/แก้ไข รายการสินค้า</p>
                        </div>
                        <div style={{ marginLeft: 'auto', fontSize: '1.5rem', color: colors.skyBlue }}>➔</div>
                    </Link>

                    <Link href="/admin/orders" style={actionCardStyle}>
                        <div style={{ ...iconStyle, backgroundColor: '#E1F5FE', color: '#0288D1', marginRight: '20px' }}>📃</div>
                        <div>
                            <h3 style={{ margin: '0 0 5px 0', color: '#0288D1' }}>จัดการคำสั่งซื้อ</h3>
                            <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>ตรวจสอบสถานะออเดอร์</p>
                        </div>
                        <div style={{ marginLeft: 'auto', fontSize: '1.5rem', color: colors.skyBlue }}>➔</div>
                    </Link>
                </div>
            </div>
        </div>
    );
}

// --- Styles ---
const cardStyle = {
    backgroundColor: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', border: '1px solid white'
};

const actionCardStyle = {
    backgroundColor: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', textDecoration: 'none', display: 'flex', alignItems: 'center', transition: 'transform 0.2s', cursor: 'pointer', border: '1px solid white'
};

const iconStyle = {
    width: '60px', height: '60px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px'
};

const tableThStyle = { padding: '12px 8px', fontSize: '0.85rem', color: '#888', fontWeight: '500' };
const tableTdStyle = { padding: '12px 8px', fontSize: '0.9rem', color: '#333' };