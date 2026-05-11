'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import pb from '../../lib/pocketbase'; 
import { useAuth } from '@/app/contexts/AuthContext';
import CreateProductForm from './CreateProductForm';
import { 
    FiPlus, FiX, FiRefreshCw, FiEdit, FiTrash2, 
    FiHome, FiBox, FiSave, FiSearch, FiAlertTriangle, FiCheckCircle
} from 'react-icons/fi';

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

const colors = { 
    darkGreen: '#1A4D2E', 
    orange: '#f59e0b', 
    red: '#ef4444', 
    gray: '#6b7280', 
    border: '#e5e7eb', 
    text: '#374151',
    lightBg: '#f9fafb'
};

export default function AdminProductsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    
    // ✅ ระบบค้นหาและกรอง
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');

    const [showUpdateForm, setShowUpdateForm] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateFormData, setUpdateFormData] = useState({ name: '', price: '', relation: '', promoType: '', stock: 0 });

    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'admin')) {
            router.push('/');
        }
    }, [user, authLoading, router]);

    const fetchAllData = async () => {
        setIsLoading(true);
        try {
            const productRecords = await pb.collection('products').getFullList({
                sort: '-created', expand: 'relation', requestKey: null
            });
            setProducts(productRecords);
            const categoryRecords = await pb.collection('categories').getFullList({ requestKey: null });
            setCategories(categoryRecords);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { if (user && user.role === 'admin') fetchAllData(); }, [user]);

    // ✅ คำนวณสถิติ (Stats)
    const stats = useMemo(() => {
        const outOfStock = products.filter(p => (p.stock || 0) <= 0).length;
        const lowStock = products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 5).length;
        return { total: products.length, outOfStock, lowStock };
    }, [products]);

    // ✅ กรองข้อมูลสินค้า
    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchCategory = filterCategory === 'all' || p.relation === filterCategory;
            return matchSearch && matchCategory;
        });
    }, [products, searchTerm, filterCategory]);

    const handleDelete = async (id) => {
        if (!confirm('ยืนยันการลบสินค้า?')) return;
        try {
            await pb.collection('products').delete(id);
            fetchAllData();
        } catch (error) { alert('ลบไม่สำเร็จ'); }
    };

    const openUpdateModal = (product) => {
        setCurrentProduct(product);
        setUpdateFormData({
            name: product.name, price: product.price, relation: product.relation,
            promoType: product.promoType || 'none', stock: product.stock || 0 
        });
        setShowUpdateForm(true);
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            await pb.collection('products').update(currentProduct.id, {
                ...updateFormData,
                price: parseFloat(updateFormData.price),
                stock: parseInt(updateFormData.stock)
            });
            alert('แก้ไขข้อมูลสำเร็จ');
            setShowUpdateForm(false);
            fetchAllData();
        } catch (error) { alert('บันทึกไม่สำเร็จ'); }
        finally { setIsUpdating(false); }
    };

    if (authLoading || (!user || user.role !== 'admin')) return null;

    return (
        <div style={uiStyles.container}>
            {/* Header */}
            <div style={uiStyles.topBar}>
                <div style={uiStyles.brand}>
                    <FiBox size={30} color={colors.darkGreen} />
                    <div>
                        <h1 style={uiStyles.logoText}>คลังสินค้า Baan Joy</h1>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: colors.gray }}>ระบบจัดการสต็อกและรายการสินค้าออนไลน์</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <Link href="/" style={uiStyles.backBtn}><FiHome /> กลับหน้าหลัก</Link>
                    <button onClick={fetchAllData} style={uiStyles.refreshBtn}><FiRefreshCw /></button>
                </div>
            </div>

            {/* ✅ 1. บัตรสรุปยอดสินค้า (Stats Cards) */}
            <div style={uiStyles.statsGrid}>
                <div style={{ ...uiStyles.statCard, borderLeft: `5px solid ${colors.darkGreen}` }}>
                    <div style={uiStyles.statIcon}><FiBox size={24} color={colors.darkGreen} /></div>
                    <div><h3 style={uiStyles.statValue}>{stats.total}</h3><p style={uiStyles.statLabel}>สินค้าทั้งหมด</p></div>
                </div>
                <div style={{ ...uiStyles.statCard, borderLeft: `5px solid ${colors.red}` }}>
                    <div style={uiStyles.statIcon}><FiX size={24} color={colors.red} /></div>
                    <div><h3 style={uiStyles.statValue}>{stats.outOfStock}</h3><p style={uiStyles.statLabel}>สินค้าหมด</p></div>
                </div>
                <div style={{ ...uiStyles.statCard, borderLeft: `5px solid ${colors.orange}` }}>
                    <div style={uiStyles.statIcon}><FiAlertTriangle size={24} color={colors.orange} /></div>
                    <div><h3 style={uiStyles.statValue}>{stats.lowStock}</h3><p style={uiStyles.statLabel}>สต็อกใกล้หมด</p></div>
                </div>
            </div>

            {/* ✅ 2. แถบค้นหาและกรอง (Control Bar) */}
            <div style={uiStyles.controlBar}>
                <div style={uiStyles.searchGroup}>
                    <div style={uiStyles.inputWithIcon}>
                        <FiSearch color="#999" />
                        <input 
                            type="text" 
                            placeholder="ค้นหาชื่อสินค้า..." 
                            style={uiStyles.searchInput}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={uiStyles.filterSelect}>
                        <option value="all">ทุกหมวดหมู่</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <button onClick={() => setShowCreateForm(true)} style={uiStyles.addBtn}>
                    <FiPlus /> เพิ่มสินค้าใหม่
                </button>
            </div>

            {/* Table */}
            {isLoading ? (
                <div style={uiStyles.loadingBox}>กำลังดึงข้อมูล...</div>
            ) : (
                <div style={uiStyles.tableCard}>
                    <table style={uiStyles.table}>
                        <thead>
                            <tr>
                                <th style={{ ...uiStyles.th, width: '100px' }}>รูปภาพ</th>
                                <th style={uiStyles.th}>ชื่อสินค้า</th>
                                <th style={uiStyles.th}>หมวดหมู่</th>
                                <th style={uiStyles.th}>ราคา</th>
                                <th style={uiStyles.th}>สถานะสต็อก</th>
                                <th style={{ ...uiStyles.th, textAlign: 'right' }}>จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((p) => (
                                <tr key={p.id} style={uiStyles.tr}>
                                    <td style={uiStyles.td}>
                                        <div style={uiStyles.imgBox}>
                                            {p.picture ? (
                                                <Image src={pb.files.getURL(p, p.picture)} alt={p.name} fill style={{ objectFit: 'cover' }} />
                                            ) : <FiBox size={20} color="#ccc" />}
                                        </div>
                                    </td>
                                    <td style={uiStyles.td}>
                                        <div style={{ fontWeight: '700', fontSize: '1rem', color: colors.text }}>{p.name}</div>
                                        {p.promoType && p.promoType !== 'none' && (
                                            <span style={uiStyles.promoBadge}>{getPromoLabel(p.promoType)}</span>
                                        )}
                                    </td>
                                    <td style={uiStyles.td}>
                                        <span style={uiStyles.catBadge}>{p.expand?.relation?.name || '-'}</span>
                                    </td>
                                    <td style={{ ...uiStyles.td, fontWeight: '700', color: colors.darkGreen, fontSize: '1.1rem' }}>
                                        ฿{p.price.toLocaleString()}
                                    </td>
                                    <td style={uiStyles.td}>
                                        <div style={{
                                            ...uiStyles.stockBadge,
                                            backgroundColor: (p.stock <= 0 ? '#fee2e2' : p.stock <= 5 ? '#ffedd5' : '#dcfce7'),
                                            color: (p.stock <= 0 ? colors.red : p.stock <= 5 ? colors.orange : '#166534')
                                        }}>
                                            {p.stock <= 0 ? 'สินค้าหมด' : `${p.stock} ชิ้น`}
                                        </div>
                                    </td>
                                    <td style={{ ...uiStyles.td, textAlign: 'right' }}>
                                        <div style={uiStyles.actionGroup}>
                                            <button onClick={() => openUpdateModal(p)} style={uiStyles.editBtn} title="แก้ไข"><FiEdit /></button>
                                            <button onClick={() => handleDelete(p.id)} style={uiStyles.delBtn} title="ลบ"><FiTrash2 /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modals */}
            {showCreateForm && (
                <div style={uiStyles.overlay}>
                    <CreateProductForm onProductCreated={fetchAllData} onClose={() => setShowCreateForm(false)} />
                </div>
            )}

            {showUpdateForm && (
                <div style={uiStyles.overlay}>
                    <div style={uiStyles.modal}>
                        <div style={uiStyles.modalHeader}>
                            <h2 style={{ margin: 0, color: colors.darkGreen }}>แก้ไขข้อมูลสินค้า</h2>
                            <FiX onClick={() => setShowUpdateForm(false)} style={{ cursor: 'pointer', fontSize: '1.5rem' }} />
                        </div>
                        <form onSubmit={handleUpdateSubmit}>
                            <div style={uiStyles.formGroup}><label style={uiStyles.label}>ชื่อสินค้า</label><input type="text" value={updateFormData.name} onChange={e => setUpdateFormData({...updateFormData, name: e.target.value})} style={uiStyles.modalInput} required /></div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div style={uiStyles.formGroup}><label style={uiStyles.label}>ราคา (บาท)</label><input type="number" value={updateFormData.price} onChange={e => setUpdateFormData({...updateFormData, price: e.target.value})} style={uiStyles.modalInput} required /></div>
                                <div style={uiStyles.formGroup}><label style={uiStyles.label}>สต็อก (ชิ้น)</label><input type="number" value={updateFormData.stock} onChange={e => setUpdateFormData({...updateFormData, stock: e.target.value})} style={uiStyles.modalInput} required /></div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div style={uiStyles.formGroup}><label style={uiStyles.label}>หมวดหมู่</label>
                                    <select value={updateFormData.relation} onChange={e => setUpdateFormData({...updateFormData, relation: e.target.value})} style={uiStyles.modalInput} required>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div style={uiStyles.formGroup}><label style={uiStyles.label}>โปรโมชั่น</label>
                                    <select value={updateFormData.promoType} onChange={e => setUpdateFormData({...updateFormData, promoType: e.target.value})} style={uiStyles.modalInput}>
                                        {PROMO_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                                <button type="button" onClick={() => setShowUpdateForm(false)} style={uiStyles.cancelBtn}>ยกเลิก</button>
                                <button type="submit" disabled={isUpdating} style={uiStyles.saveBtn}>{isUpdating ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- Styles ฉบับจัดใหม่ให้ไม่เบียด ---
const uiStyles = {
    container: { padding: '40px', maxWidth: '1250px', margin: '0 auto', fontFamily: "'Kanit', sans-serif", color: colors.text, backgroundColor: '#fcfcfc', minHeight: '100vh' },
    topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' },
    brand: { display: 'flex', alignItems: 'center', gap: '15px' },
    logoText: { fontSize: '1.8rem', fontWeight: '800', color: colors.darkGreen, margin: 0 },
    backBtn: { textDecoration: 'none', color: colors.gray, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '10px', border: `1px solid ${colors.border}`, backgroundColor: 'white', fontSize: '0.9rem' },
    refreshBtn: { padding: '10px', borderRadius: '10px', border: `1px solid ${colors.darkGreen}`, backgroundColor: 'white', color: colors.darkGreen, cursor: 'pointer', display: 'flex' },
    
    // ✅ สไตล์บัตรสถิติ
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' },
    statCard: { backgroundColor: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '20px' },
    statIcon: { backgroundColor: '#f0f4f1', padding: '12px', borderRadius: '12px', display: 'flex' },
    statValue: { margin: 0, fontSize: '1.5rem', fontWeight: '800', color: '#333' },
    statLabel: { margin: 0, fontSize: '0.85rem', color: colors.gray },

    controlBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', gap: '20px' },
    searchGroup: { display: 'flex', gap: '12px', flex: 1 },
    inputWithIcon: { position: 'relative', display: 'flex', alignItems: 'center', backgroundColor: 'white', border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '0 15px', flex: 1, boxShadow: '0 2px 5px rgba(0,0,0,0.02)' },
    searchInput: { border: 'none', outline: 'none', padding: '12px 10px', width: '100%', fontSize: '0.95rem', backgroundColor: 'transparent' },
    filterSelect: { padding: '0 15px', borderRadius: '12px', border: `1px solid ${colors.border}`, backgroundColor: 'white', cursor: 'pointer', fontSize: '0.9rem' },
    addBtn: { backgroundColor: colors.darkGreen, color: 'white', border: 'none', padding: '12px 25px', borderRadius: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(26, 77, 46, 0.2)' },
    
    tableCard: { backgroundColor: 'white', borderRadius: '20px', border: `1px solid ${colors.border}`, overflow: 'hidden', boxShadow: '0 4px 25px rgba(0,0,0,0.03)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '20px', textAlign: 'left', fontSize: '0.85rem', color: colors.gray, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', backgroundColor: colors.lightBg },
    td: { padding: '22px 20px', verticalAlign: 'middle', borderBottom: `1px solid ${colors.lightBg}` },
    tr: { transition: 'background 0.2s' },
    imgBox: { width: '56px', height: '56px', borderRadius: '12px', overflow: 'hidden', position: 'relative', backgroundColor: '#f3f4f6', border: '1px solid #eee' },
    
    stockBadge: { padding: '6px 15px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', display: 'inline-block', minWidth: '80px', textAlign: 'center' },
    promoBadge: { fontSize: '0.7rem', color: colors.orange, backgroundColor: '#fff7ed', padding: '3px 8px', borderRadius: '6px', marginTop: '6px', display: 'inline-block', border: '1px solid #ffedd5' },
    catBadge: { backgroundColor: '#e0f2fe', color: '#0369a1', padding: '5px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700' },
    
    actionGroup: { display: 'flex', gap: '8px', justifyContent: 'flex-end' },
    editBtn: { backgroundColor: '#fff7ed', color: colors.orange, border: 'none', padding: '10px', borderRadius: '10px', cursor: 'pointer' },
    delBtn: { backgroundColor: '#fef2f2', color: colors.red, border: 'none', padding: '10px', borderRadius: '10px', cursor: 'pointer' },
    
    loadingBox: { padding: '100px', textAlign: 'center', color: colors.gray },
    overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(4px)' },
    modal: { backgroundColor: 'white', padding: '35px', borderRadius: '24px', width: '90%', maxWidth: '650px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
    formGroup: { marginBottom: '18px' },
    label: { display: 'block', marginBottom: '8px', fontWeight: 'bold', color: colors.darkGreen, fontSize: '0.9rem' },
    modalInput: { width: '100%', padding: '12px 15px', borderRadius: '10px', border: `1px solid ${colors.border}`, outline: 'none', fontSize: '1rem' },
    saveBtn: { flex: 1, padding: '14px', backgroundColor: colors.darkGreen, color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' },
    cancelBtn: { flex: 1, padding: '14px', backgroundColor: '#f3f4f6', color: colors.text, border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }
};