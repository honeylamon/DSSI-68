'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation'; // ✅ นำเข้า useRouter สำหรับการ Redirect
import pb from '../../lib/pocketbase'; 
import { useAuth } from '@/app/contexts/AuthContext'; // ✅ ใช้ AuthContext ที่คุณมีอยู่
import CreateProductForm from './CreateProductForm';
import { 
    FiPlus, FiX, FiRefreshCw, FiEdit, FiTrash2, 
    FiHome, FiBox, FiSave, FiAlertCircle, FiLock 
} from 'react-icons/fi';

// ... (PROMO_OPTIONS และ pageStyles คงเดิมเหมือนเวอร์ชันก่อน) ...
const PROMO_OPTIONS = [
    { label: 'ไม่มีโปรโมชั่น', value: 'none' },
    { label: 'ลด 50%', value: 'discount' },
    { label: '1 แถม 1', value: 'Buy One, Get One' },
    { label: 'สินค้าแนะนำ', value: 'featured' },
    { label: 'โปรโมชั่น', value: 'Promotion' }
];

const getPromoLabel = (value) => {
    const option = PROMO_OPTIONS.find(opt => opt.value === value);
    return option ? option.label : (value || '-');
};

const colors = { darkGreen: '#1A4D2E', orange: '#f59e0b', red: '#ef4444', gray: '#6b7280', border: '#e5e7eb', text: '#374151' };

const pageStyles = {
    dashboardContainer: { padding: '30px', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Kanit', sans-serif", backgroundColor: '#f8f9fa', minHeight: '100vh' },
    topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', backgroundColor: 'white', padding: '15px 25px', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
    brand: { display: 'flex', alignItems: 'center', gap: '10px' },
    logoText: { fontSize: '1.5rem', fontWeight: '800', color: colors.darkGreen },
    subText: { fontSize: '1rem', color: colors.orange, fontWeight: '500', backgroundColor: '#fff7ed', padding: '4px 10px', borderRadius: '20px' },
    navLink: { textDecoration: 'none', color: colors.gray, fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' },
    actionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
    pageTitle: { fontSize: '1.8rem', fontWeight: '700', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '12px' },
    btnGroup: { display: 'flex', gap: '10px' },
    btnBase: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
    btnAdd: { backgroundColor: colors.darkGreen, color: 'white' },
    btnClose: { backgroundColor: colors.red, color: 'white' },
    btnRefresh: { backgroundColor: 'white', color: colors.darkGreen, border: `1px solid ${colors.darkGreen}` },
    tableCard: { backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden', border: `1px solid ${colors.border}` },
    tableWrapper: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse', minWidth: '900px' },
    thead: { backgroundColor: '#f9fafb', borderBottom: `2px solid ${colors.border}` },
    th: { padding: '16px 20px', textAlign: 'left', fontSize: '0.9rem', color: '#4b5563', fontWeight: '600' },
    td: { padding: '16px 20px', verticalAlign: 'middle', borderBottom: '1px solid #f3f4f6' },
    imgWrapper: { width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f3f4f6', border: '1px solid #eee', position: 'relative' },
    badgeCategory: { padding: '4px 10px', borderRadius: '20px', backgroundColor: '#e0f2fe', color: '#0369a1', fontSize: '0.75rem', fontWeight: '600' },
    badgePromo: { padding: '4px 10px', borderRadius: '20px', backgroundColor: '#ffedd5', color: '#c2410c', fontSize: '0.75rem', fontWeight: '600' },
    actionBtn: { width: '36px', height: '36px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    btnEdit: { backgroundColor: '#fff7ed', color: colors.orange },
    btnDelete: { backgroundColor: '#fef2f2', color: colors.red },
    overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { backgroundColor: 'white', padding: '30px', borderRadius: '20px', width: '90%', maxWidth: '500px' },
    formLabel: { display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151', fontSize: '0.9rem' },
    formInput: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' },
    modalBtnGroup: { display: 'flex', gap: '10px', marginTop: '20px' }
};

export default function AdminProductsPage() {
    const { user, isLoading: authLoading } = useAuth(); // ✅ ดึงข้อมูล User จาก Context
    const router = useRouter();
    
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    
    const [showUpdateForm, setShowUpdateForm] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateFormData, setUpdateFormData] = useState({ name: '', price: '', relation: '', promoType: '', stock: 0 });

    // 🛡️ ส่วนการตรวจสอบสิทธิ์ (Security Guard)
    useEffect(() => {
        if (!authLoading) {
            // หากไม่ได้ล็อกอิน หรือ มีล็อกอินแต่ role ไม่ใช่ admin
            if (!user || user.role !== 'admin') {
                console.warn("Unauthorized access attempt redirected.");
                router.push('/'); // ดีดกลับหน้าแรก
            }
        }
    }, [user, authLoading, router]);

    const fetchAllData = async () => {
        // ... (โค้ดดึงข้อมูลเหมือนเดิม) ...
        setIsLoading(true);
        try {
            const productRecords = await pb.collection('products').getFullList({
                sort: '-created',
                expand: 'relation', 
                requestKey: null
            });
            setProducts(productRecords);

            const categoryRecords = await pb.collection('categories').getFullList({ requestKey: null });
            setCategories(categoryRecords);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user && user.role === 'admin') {
            fetchAllData();
        }
    }, [user]);

    // แสดงหน้า Loading ขณะกำลังเช็คสิทธิ์
    if (authLoading || (!user || user.role !== 'admin')) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: "'Kanit', sans-serif", color: colors.darkGreen }}>
                <FiLock size={50} style={{ marginBottom: '20px' }} />
                <h2>กำลังตรวจสอบสิทธิ์การเข้าถึง...</h2>
            </div>
        );
    }

    // ... (ส่วนการจัดการ Delete / Update / Render JSX เหมือนเดิมที่คุณมี) ...
    const handleDelete = async (id) => {
        if (!confirm('ยืนยันการลบสินค้า?')) return;
        try {
            await pb.collection('products').delete(id);
            setProducts(products.filter(p => p.id !== id));
        } catch (error) { alert('ลบไม่สำเร็จ: ' + error.message); }
    };

    const openUpdateModal = (product) => {
        setCurrentProduct(product);
        setUpdateFormData({
            name: product.name,
            price: product.price,
            relation: product.relation,
            promoType: product.promoType || 'none',
            stock: product.stock || 0 
        });
        setShowUpdateForm(true);
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            const dataToSend = { 
                name: updateFormData.name,
                price: parseInt(updateFormData.price) || 0,
                relation: updateFormData.relation, 
                promoType: updateFormData.promoType,
                stock: parseInt(updateFormData.stock) || 0 
            };

            await pb.collection('products').update(currentProduct.id, dataToSend);
            alert('บันทึกการแก้ไขเรียบร้อยแล้ว');
            setShowUpdateForm(false);
            fetchAllData(); 
        } catch (error) {
            console.error("Update Error:", error); 
            alert('บันทึกไม่สำเร็จ: กรุณาเช็ค API Rules');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div style={pageStyles.dashboardContainer}>
            {/* ส่วนหัว */}
            <div style={pageStyles.topBar}>
                <div style={pageStyles.brand}><span style={pageStyles.logoText}>Baan Joy</span><span style={pageStyles.subText}>Seller Centre</span></div>
                <Link href="/" style={pageStyles.navLink}><FiHome size={18} /> กลับหน้าหลัก</Link>
            </div>

            <div style={pageStyles.actionHeader}>
                <h1 style={pageStyles.pageTitle}><FiBox color={colors.darkGreen} size={28} /> จัดการสินค้า</h1>
                <div style={pageStyles.btnGroup}>
                    <button onClick={() => setShowCreateForm(!showCreateForm)} style={{...pageStyles.btnBase, ...(showCreateForm ? pageStyles.btnClose : pageStyles.btnAdd)}}>
                        {showCreateForm ? <><FiX size={20} /> ปิดฟอร์ม</> : <><FiPlus size={20} /> เพิ่มสินค้า</>}
                    </button>
                    <button onClick={fetchAllData} style={{...pageStyles.btnBase, ...pageStyles.btnRefresh}} title="รีเฟรชข้อมูล"><FiRefreshCw size={20} /></button>
                </div>
            </div>

            {/* ฟอร์มเพิ่มสินค้า */}
            {showCreateForm && (
                <div style={{ marginBottom: '30px', padding: '25px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <CreateProductForm onProductCreated={fetchAllData} onClose={() => setShowCreateForm(false)} />
                </div>
            )}

            {/* ตารางสินค้า */}
            {isLoading ? (<div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>กำลังโหลดข้อมูล...</div>) : (
                <div style={pageStyles.tableCard}>
                    <div style={pageStyles.tableWrapper}>
                        <table style={pageStyles.table}>
                            <thead style={pageStyles.thead}>
                                <tr>
                                    <th style={pageStyles.th}>รูปภาพ</th>
                                    <th style={pageStyles.th}>ชื่อสินค้า</th>
                                    <th style={pageStyles.th}>หมวดหมู่</th>
                                    <th style={pageStyles.th}>โปรโมชั่น</th>
                                    <th style={pageStyles.th}>สต็อก</th>
                                    <th style={pageStyles.th}>ราคา</th>
                                    <th style={{...pageStyles.th, textAlign:'right'}}>จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product.id}>
                                        <td style={pageStyles.td}>
                                            <div style={pageStyles.imgWrapper}>
                                                {product.picture ? (
                                                    <Image src={pb.files.getURL(product, product.picture)} alt={product.name} fill style={{ objectFit: 'cover' }} />
                                                ) : <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#ccc'}}><FiBox /></div>}
                                            </div>
                                        </td>
                                        <td style={{...pageStyles.td, fontWeight:'600'}}>{product.name}</td>
                                        <td style={pageStyles.td}><span style={pageStyles.badgeCategory}>{product.expand?.relation?.name || '-'}</span></td>
                                        <td style={pageStyles.td}>
                                            {product.promoType && product.promoType !== 'none' ? (
                                                <span style={pageStyles.badgePromo}>{getPromoLabel(product.promoType)}</span>
                                            ) : '-'}
                                        </td>
                                        <td style={{...pageStyles.td, fontWeight:'bold', color: (product.stock <= 0 ? colors.red : colors.text)}}>
                                            {product.stock || 0} ชิ้น
                                        </td>
                                        <td style={{...pageStyles.td, fontWeight:'700', color: colors.darkGreen}}>฿{product.price.toLocaleString()}</td>
                                        <td style={pageStyles.td}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button onClick={() => openUpdateModal(product)} style={{...pageStyles.actionBtn, ...pageStyles.btnEdit}} title="แก้ไข"><FiEdit size={18} /></button>
                                                <button onClick={() => handleDelete(product.id)} style={{...pageStyles.actionBtn, ...pageStyles.btnDelete}} title="ลบ"><FiTrash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal แก้ไขสินค้า */}
            {showUpdateForm && (
                <div style={pageStyles.overlay}>
                    <div style={pageStyles.modal}>
                        <h2 style={{ marginBottom: '20px', color: colors.darkGreen, display:'flex', alignItems:'center', gap:'10px' }}><FiEdit /> แก้ไขสินค้า</h2>
                        <form onSubmit={handleUpdateSubmit}>
                            <div style={{marginBottom:'15px'}}><label style={pageStyles.formLabel}>ชื่อสินค้า</label><input type="text" value={updateFormData.name} onChange={e => setUpdateFormData({...updateFormData, name: e.target.value})} style={pageStyles.formInput} required /></div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom:'15px' }}>
                                <div><label style={pageStyles.formLabel}>ราคา (บาท)</label><input type="number" value={updateFormData.price} onChange={e => setUpdateFormData({...updateFormData, price: e.target.value})} style={pageStyles.formInput} required /></div>
                                <div><label style={pageStyles.formLabel}>จำนวนสต็อก (ชิ้น)</label><input type="number" value={updateFormData.stock} onChange={e => setUpdateFormData({...updateFormData, stock: e.target.value})} style={pageStyles.formInput} required /></div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom:'20px' }}>
                                <div>
                                    <label style={pageStyles.formLabel}>หมวดหมู่</label>
                                    <select value={updateFormData.relation} onChange={e => setUpdateFormData({...updateFormData, relation: e.target.value})} style={{...pageStyles.formInput, cursor: 'pointer', backgroundColor: 'white'}} required>
                                        <option value="" disabled>-- เลือกหมวดหมู่ --</option>
                                        {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                                    </select>
                                </div>
                                <div>
                                    <label style={pageStyles.formLabel}>โปรโมชั่น</label>
                                    <select value={updateFormData.promoType} onChange={e => setUpdateFormData({...updateFormData, promoType: e.target.value})} style={{...pageStyles.formInput, cursor: 'pointer', backgroundColor: 'white'}}>
                                        {PROMO_OPTIONS.map((option) => (<option key={option.value} value={option.value}>{option.label}</option>))}
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="button" onClick={() => setShowUpdateForm(false)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#f3f4f6' }}><FiX /> ยกเลิก</button>
                                <button type="submit" disabled={isUpdating} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: colors.darkGreen, color: 'white' }}>
                                    <FiSave /> {isUpdating ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}