'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import pb from '../../lib/pocketbase'; // อย่าลืมปรับ path ให้ถูกต้องถ้ามีการเปลี่ยนโครงสร้าง

// --- 1. CSS Styles (Global Styles) ---
const colors = {
    darkGreen: '#1A4D2E',  
    skyBlue: '#4FC3F7',    
    lightPink: '#FFF0F3',  
    white: '#FFFFFF',       
    orange: '#f59e0b',
    lightOrange: '#fffbe3',
    red: '#ef4444',
    green: '#10b981',
    gray: '#6b7280'
};

// สไตล์สำหรับปุ่มสถานะ
const getStatusStyle = (status) => {
    switch (status) {
        case 'pending':
            return { backgroundColor: '#FFEDD5', color: '#F97316', border: '1px solid #F97316' }; // ส้ม
        case 'completed':
            return { backgroundColor: '#D1FAE5', color: '#059669', border: '1px solid #059669' }; // เขียว
        case 'cancelled':
            return { backgroundColor: '#FEE2E2', color: '#DC2626', border: '1px solid #DC2626' }; // แดง
        default:
            return { backgroundColor: '#E5E7EB', color: '#4B5563', border: '1px solid #4B5563' }; // เทา
    }
};

const tableHeaderStyle = { padding: '20px', background: colors.darkGreen, color: 'white', textAlign: 'left', borderBottom: '2px solid white' };
const tableDataStyle = { padding: '15px', borderBottom: `1px solid ${colors.lightPink}`, color: '#333' };


export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    
    // --- 2. ดึงข้อมูลคำสั่งซื้อ ---
    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            // ดึงข้อมูลคำสั่งซื้อทั้งหมด พร้อม expand ข้อมูล user (เพื่อแสดงชื่อลูกค้า)
            const records = await pb.collection('orders').getFullList({
                sort: '-created', // ล่าสุดขึ้นก่อน
                expand: 'user', // ดึงข้อมูล user ที่เกี่ยวข้อง
                requestKey: null
            });
            setOrders(records);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    // --- 3. ฟังก์ชันจัดการการเปลี่ยนสถานะ ---
    const handleStatusChange = async (orderId, newStatus) => {
        if (!confirm(`คุณต้องการเปลี่ยนสถานะ Order ${orderId} เป็น '${newStatus}' ใช่หรือไม่?`)) {
            return;
        }

        setIsUpdating(true);
        try {
            await pb.collection('orders').update(orderId, { status: newStatus });
            alert(`เปลี่ยนสถานะ Order ${orderId} เป็น '${newStatus}' สำเร็จ!`);
            fetchOrders(); // ดึงข้อมูลใหม่เพื่ออัปเดตตาราง
        } catch (error) {
            console.error("Error updating order status:", error);
            alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ: ' + error.message);
        } finally {
            setIsUpdating(false);
        }
    };
    
    // --- 4. Render UI ---
    return (
        <div style={{ minHeight: '100vh', backgroundColor: colors.lightPink, padding: '40px', fontFamily: "'Kanit', sans-serif" }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                
                <div style={{ marginBottom: '20px' }}>
                    <Link href="/admin" style={{ color: colors.darkGreen, textDecoration: 'none', display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                        <span style={{ marginRight: '5px' }}>⬅</span> กลับไปหน้า Dashboard
                    </Link>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: `2px solid ${colors.skyBlue}`, paddingBottom: '20px' }}>
                    <h1 style={{ margin: 0, color: colors.darkGreen, fontSize: '2rem' }}>📄 จัดการคำสั่งซื้อ (Orders Management)</h1>
                </div>

                {isLoading ? (
                    <p style={{ textAlign: 'center', color: colors.darkGreen }}>กำลังโหลดรายการคำสั่งซื้อ...</p>
                ) : (
                    <div style={{ overflowX: 'auto', background: 'white', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th style={{ ...tableHeaderStyle, borderRadius: '20px 0 0 0', width: '15%' }}>รหัส Order</th>
                                    <th style={{ ...tableHeaderStyle, width: '20%' }}>ลูกค้า</th>
                                    <th style={{ ...tableHeaderStyle, width: '15%', textAlign: 'right' }}>ยอดรวม</th>
                                    <th style={{ ...tableHeaderStyle, width: '15%' }}>สถานะ</th>
                                    <th style={{ ...tableHeaderStyle, width: '20%' }}>วันที่สั่งซื้อ</th>
                                    <th style={{ ...tableHeaderStyle, width: '15%', textAlign: 'center', borderRadius: '0 20px 0 0' }}>จัดการสถานะ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.length > 0 ? (
                                    orders.map((order) => (
                                        <tr key={order.id} style={{ transition: 'background-color 0.2s', '&:hover': { backgroundColor: '#f9f9f9' } }}>
                                            <td style={tableDataStyle}>{order.id.substring(0, 8)}...</td>
                                            <td style={tableDataStyle}>
                                                {order.expand?.user?.name || order.expand?.user?.email || 'N/A'}
                                            </td>
                                            <td style={{...tableDataStyle, textAlign: 'right', fontWeight: 'bold', color: colors.green}}>
                                                ฿{order.total_price ? order.total_price.toLocaleString() : '0'}
                                            </td>
                                            <td style={tableDataStyle}>
                                                <span style={{ 
                                                    ...getStatusStyle(order.status), 
                                                    padding: '5px 10px', 
                                                    borderRadius: '15px', 
                                                    fontSize: '0.85rem' 
                                                }}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td style={tableDataStyle}>
                                                {new Date(order.created).toLocaleDateString('th-TH', { 
                                                    year: 'numeric', 
                                                    month: 'short', 
                                                    day: 'numeric', 
                                                    hour: '2-digit', 
                                                    minute: '2-digit' 
                                                })}
                                            </td>
                                            <td style={{...tableDataStyle, textAlign: 'center'}}>
                                                {order.status === 'pending' && (
                                                    <button 
                                                        onClick={() => handleStatusChange(order.id, 'completed')}
                                                        disabled={isUpdating}
                                                        style={{ ...getStatusStyle('completed'), padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
                                                    >
                                                        {isUpdating ? 'กำลังอัปเดต...' : 'เสร็จสิ้น'}
                                                    </button>
                                                )}
                                                {order.status === 'completed' && (
                                                    <span style={{ color: colors.green, fontWeight: 'bold' }}>จัดส่งสำเร็จ</span>
                                                )}
                                                {order.status === 'cancelled' && (
                                                    <span style={{ color: colors.red, fontWeight: 'bold' }}>ยกเลิกแล้ว</span>
                                                )}
                                                
                                                {/* ปุ่มยกเลิก (แสดงเสมอ ยกเว้นถูกยกเลิกไปแล้ว) */}
                                                {order.status !== 'cancelled' && (
                                                    <button 
                                                        onClick={() => handleStatusChange(order.id, 'cancelled')}
                                                        disabled={isUpdating}
                                                        style={{ 
                                                            ...getStatusStyle('cancelled'), 
                                                            padding: '8px 12px', 
                                                            borderRadius: '8px', 
                                                            cursor: 'pointer', 
                                                            fontWeight: 'bold', 
                                                            fontSize: '0.85rem',
                                                            marginLeft: '10px'
                                                        }}
                                                    >
                                                        ยกเลิก
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: colors.gray }}>
                                            ยังไม่มีคำสั่งซื้อในระบบ
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}