'use client';

import { useEffect, useState } from 'react';
import pb from '../lib/pocketbase';
import AdminAuthGuard from '../components/AdminAuthGuard';
import ProductEditRow from '../components/ProductEditRow';

export default function AdminPage() {
    const [existingProducts, setExistingProducts] = useState([]);
    const [newRows, setNewRows] = useState([]);
    const [categories, setCategories] = useState([]);

    const fetchAllData = async () => {
        try {
            const productRecords = await pb.collection('products').getFullList({ expand: 'relation', sort: '-created' });
            const categoryRecords = await pb.collection('categories').getFullList();
            
            setExistingProducts(productRecords);
            setCategories(categoryRecords);
        } catch (error) { console.error("Failed to fetch data:", error); }
    };

    useEffect(() => { fetchAllData(); }, []);

    // --- ส่วนจัดการ "สินค้าใหม่" ---
    const handleAddRow = () => setNewRows(prev => [...prev, { id: Date.now(), picture: null }]);
    const handleUpdateNewRow = (id, updatedData) => setNewRows(prev => prev.map(row => (row.id === id ? { ...row, ...updatedData } : row)));
    const handleDeleteNewRow = (id) => setNewRows(prev => prev.filter(row => row.id !== id));
    const handleSaveNewProducts = async () => {
        if (newRows.length === 0) return alert("ไม่มีสินค้าใหม่ให้บันทึก");
        try {
            for (const row of newRows) {
                const formData = new FormData();
                formData.append('name', row.name);
                formData.append('price', row.price);
                formData.append('stock', row.stock);
                formData.append('relation', row.relation);
                if (row.picture) formData.append('picture', row.picture);
                await pb.collection('products').create(formData);
            }
            alert("บันทึกสินค้าใหม่ทั้งหมดเรียบร้อย!");
            setNewRows([]);
            fetchAllData();
        } catch (error) { alert(`เกิดข้อผิดพลาด: ${error.message}`); }
    };

    // --- ส่วนจัดการ "สินค้าที่มีอยู่แล้ว" ---
    const handleUpdateExistingProduct = (id, updatedData) => {
        setExistingProducts(prev => prev.map(p => (p.id === id ? { ...p, ...updatedData } : p)));
    };
    
    const handleSaveExistingProduct = async (productId) => {
        try {
            const productToSave = existingProducts.find(p => p.id === productId);
            if (!productToSave) return;
            
            const formData = new FormData();
            formData.append('name', productToSave.name);
            formData.append('price', productToSave.price);
            formData.append('stock', productToSave.stock);
            formData.append('relation', productToSave.relation);
            
            if (productToSave.picture instanceof File) {
                formData.append('picture', productToSave.picture);
            }
            
            await pb.collection('products').update(productId, formData);
            alert(`อัปเดตสินค้า "${productToSave.name}" สำเร็จ!`);
            await fetchAllData();
        } catch (error) {
            alert(`อัปเดตไม่สำเร็จ: ${error.message}`);
        }
    };

    const handleDeleteExistingProduct = async (productId, productName) => {
        if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ "${productName}"?`)) {
            try {
                await pb.collection('products').delete(productId);
                alert('ลบสินค้าสำเร็จ!');
                fetchAllData();
            } catch (error) { alert(`เกิดข้อผิดพลาดในการลบ: ${error.message}`); }
        }
    };

    return (
        <AdminAuthGuard>
            <div style={{ padding: '20px', maxWidth: '1200px', margin: 'auto' }}>
                <h1>จัดการสินค้า (Admin)</h1>
                
                {/* ส่วนเพิ่มสินค้าใหม่ */}
                <div style={{ border: '1px solid #ccc', padding: '15px', marginTop: '20px', borderRadius: '8px' }}>
                    <h2>เพิ่มสินค้าใหม่</h2>
                    {newRows.map(row => (
                        <ProductEditRow key={row.id} rowData={row} onUpdate={handleUpdateNewRow} onDelete={handleDeleteNewRow} categories={categories} />
                    ))}
                    <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
                        <button onClick={handleAddRow}>+ เพิ่มแถว</button>
                        <button onClick={handleSaveNewProducts} style={{backgroundColor: 'green', color: 'white'}}>บันทึกสินค้าใหม่ทั้งหมด</button>
                    </div>
                </div>

                {/* ส่วนแก้ไขสินค้าที่มีอยู่ */}
                <div style={{ marginTop: '40px' }}>
                    <h2>รายการสินค้าทั้งหมด (แก้ไขได้)</h2>
                    <div style={{ display: 'flex', gap: '10px', fontWeight: 'bold', padding: '10px 0', borderBottom: '2px solid black' }}>
                        <div style={{ width: '100px' }}>รูป</div>
                        <div style={{ flex: 3 }}>ชื่อสินค้า</div>
                        <div style={{ flex: 1 }}>ราคา</div>
                        <div style={{ flex: 1 }}>คงเหลือ</div>
                        <div style={{ flex: 2 }}>หมวดหมู่</div>
                        <div style={{ width: '120px' }}>Actions</div>
                    </div>
                    {existingProducts.map(product => (
                        <ProductEditRow 
                            key={product.id}
                            rowData={{ 
                                ...product,
                                relation: product.expand?.relation?.id || '' 
                            }}
                            onUpdate={handleUpdateExistingProduct}
                            onDelete={() => handleDeleteExistingProduct(product.id, product.name)}
                            onSave={handleSaveExistingProduct}
                            categories={categories}
                            isExisting={true}
                        />
                    ))}
                </div>
            </div>
        </AdminAuthGuard>
    );
}