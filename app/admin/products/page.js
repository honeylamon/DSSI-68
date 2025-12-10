'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import pb from '../../lib/pocketbase'; 
import CreateProductForm from './CreateProductForm';

// --- 1. CSS Styles (Global Styles for Page & Modals) ---
const colors = {
    darkGreen: '#1A4D2E',
    skyBlue: '#4FC3F7',
    lightPink: '#FFF0F3',
    hotPink: '#FF80AB',
    white: '#FFFFFF',
    red: '#ef4444',
    lightRed: '#FFEBEE',
    orange: '#f59e0b',
    lightOrange: '#fffbe3'
};

const pageStyles = {
    dashboardContainer: { padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Kanit', sans-serif" },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px' },
    logo: { fontSize: '1.5rem', fontWeight: 'bold', color: colors.darkGreen },
    sellerText: { marginLeft: '10px', fontSize: '1.2rem', color: colors.orange },
    homeLink: { textDecoration: 'none', color: colors.darkGreen, fontWeight: 'bold' },
    managerHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
    addButton: { padding: '10px 15px', backgroundColor: colors.darkGreen, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
    productTable: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
    th: { backgroundColor: colors.lightPink, padding: '12px', textAlign: 'left', borderBottom: '2px solid #ccc', color: colors.darkGreen },
    td: { padding: '12px', borderBottom: '1px solid #eee', verticalAlign: 'middle' },
    editButton: { padding: '5px 10px', backgroundColor: colors.orange, color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginRight: '5px' },
    deleteButton: { padding: '5px 10px', backgroundColor: colors.red, color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    // Styles สำหรับ Modal Update (ที่ถูกซ่อนไว้)
    modalOverlayStyle: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContentStyle: { padding: '30px', borderRadius: '15px', maxWidth: '500px', width: '90%', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', backgroundColor: colors.white },
    labelStyle: { display: 'block', marginBottom: '5px', marginTop: '15px', fontWeight: 'bold', color: colors.darkGreen },
    inputStyle: { width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '8px', boxSizing: 'border-box' },
    cancelButtonStyle: { padding: '10px 15px', border: 'none', borderRadius: '8px', color: colors.white, cursor: 'pointer', backgroundColor: '#9ca3af' },
    saveButtonStyle: { padding: '10px 15px', border: 'none', borderRadius: '8px', color: colors.white, cursor: 'pointer', fontWeight: 'bold' }
};


export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false); 
  
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [categories, setCategories] = useState([]); 

  const [updateFormData, setUpdateFormData] = useState({
    name: '',
    price: '',
    stock: '', 
    category: '', 
    picture: null,
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');
  
  // --- 2. ฟังก์ชันหลักสำหรับดึงข้อมูล (รวม Expand) ---
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const records = await pb.collection('products').getFullList({
        sort: '-created',
        expand: 'relation', 
        requestKey: null 
      });
      setProducts(records);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ดึงรายการหมวดหมู่ (สำหรับ Modal แก้ไข)
  const fetchCategories = async () => {
    try {
        const catRecords = await pb.collection('categories').getFullList({ requestKey: null });
        setCategories(catRecords);
    } catch (err) {
        console.error("Failed to fetch categories for update form:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // --- 3. ฟังก์ชัน CRUD ---
  const handleOpenCreate = () => {
    setShowCreateForm(true);
  };
  
  const handleOpenUpdate = (product) => {
      const categoryId = product.expand?.relation?.id || product.relation || ''; 

      setCurrentProduct(product);
      setUpdateFormData({
          name: product.name,
          price: product.price?.toString() ?? '0',
          stock: product.stock?.toString() ?? '0', 
          category: categoryId,
          picture: null,
      });
      setShowUpdateForm(true);
      setUpdateError('');
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!currentProduct) return;
    setIsUpdating(true);
    setUpdateError('');

    try {
      const dataToUpdate = new FormData();
      dataToUpdate.append('name', updateFormData.name);
      dataToUpdate.append('price', parseFloat(updateFormData.price));
      dataToUpdate.append('stock', parseInt(updateFormData.stock));
      dataToUpdate.append('relation', updateFormData.category);

      if (updateFormData.picture) {
        dataToUpdate.append('picture', updateFormData.picture);
      }

      await pb.collection('products').update(currentProduct.id, dataToUpdate);

      alert("แก้ไขสินค้าสำเร็จ!");
      setShowUpdateForm(false);
      fetchProducts();
    } catch (err) {
      console.error("Failed to update product:", err);
      setUpdateError("เกิดข้อผิดพลาดในการบันทึก: " + (err.message || 'Unknown Error'));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (confirm(`คุณต้องการลบ "${name}" ใช่หรือไม่?`)) {
      try {
        await pb.collection('products').delete(id);
        alert("ลบสินค้าสำเร็จ!");
        fetchProducts();
      } catch (error) {
        console.error("Failed to delete product:", error);
        alert("เกิดข้อผิดพลาดในการลบสินค้า");
      }
    }
  };

  // --- ส่วนแสดงผล ---
  return (
    <div style={pageStyles.dashboardContainer}>
      <header style={pageStyles.header}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={pageStyles.logo}>Baan Joy</span>
          <span style={pageStyles.sellerText}>| Seller Center</span>
        </div>
        <Link href="/" style={pageStyles.homeLink}>กลับหน้าหลัก</Link>
      </header>

      <main>
        <div style={pageStyles.productManager}>
          <div style={pageStyles.managerHeader}>
            <h2>รายการสินค้าทั้งหมด</h2>
            {/* ✅ ส่ง categories ให้ CreateProductForm เพื่อแก้ปัญหาการดึงหมวดหมู่ */}
            <button onClick={handleOpenCreate} style={pageStyles.addButton}>+ เพิ่มสินค้าใหม่</button>
          </div>

          {isLoading ? (
            <p>กำลังโหลดข้อมูล...</p>
          ) : (
            <table style={pageStyles.productTable}>
              <thead><tr>
                  <th style={pageStyles.th}>รูปภาพ</th>
                  <th style={pageStyles.th}>ชื่อสินค้า</th>
                  <th style={pageStyles.th}>หมวดหมู่</th> 
                  <th style={pageStyles.th}>ราคา (บาท)</th>
                  <th style={pageStyles.th}>สต็อก</th>
                  <th style={pageStyles.th}>วันที่สร้าง</th>
                  <th style={pageStyles.th}>จัดการ</th>
              </tr></thead>
              
              <tbody>{products.length > 0 ? products.map((product) => (
                    <tr key={product.id}>
                      <td style={pageStyles.td}>
                          {product.picture && (
                            <img 
                                src={pb.files.getUrl(product, product.picture, { thumb: '40x40' })} 
                                alt={product.name} 
                                style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '5px' }} 
                            />
                          )}
                      </td>
                      <td style={pageStyles.td}>{product.name}</td>
                      
                      {/* 🔴 แก้ไขจุดที่ 1: เปลี่ยนจาก 't name' เป็น 'name' (สำหรับตารางแสดงผล) */}
                      <td style={pageStyles.td}>{product.expand?.relation?.name || 'ไม่มี'}</td> 
                      
                      <td style={pageStyles.td}>{product.price?.toFixed(2) ?? '0.00'}</td>
                      <td style={pageStyles.td}>{product.stock ?? 0}</td>
                      <td style={pageStyles.td}>{new Date(product.created).toLocaleDateString('th-TH')}</td>
                      <td style={pageStyles.td}>
                        <button 
                          onClick={() => handleOpenUpdate(product)} 
                          style={pageStyles.editButton}
                        >
                          แก้ไข
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id, product.name)} 
                          style={pageStyles.deleteButton}
                        >
                          ลบ
                        </button>
                      </td>
                    </tr>
                )) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', ...pageStyles.td }}>ยังไม่มีสินค้าในระบบ</td>
                    </tr>
                )}</tbody>
            </table>
          )}
        </div>
      </main>

      {/* --- 4. Create Product Modal --- */}
      {showCreateForm && (
          <CreateProductForm 
            onClose={() => setShowCreateForm(false)} 
            onProductCreated={fetchProducts}
          />
      )}
      
      {/* --- 5. Update Product Modal --- */}
      {showUpdateForm && currentProduct && (
          <div style={pageStyles.modalOverlayStyle}>
              <div style={pageStyles.modalContentStyle}>
                  <h2 style={{color: colors.orange, marginBottom: '10px'}}>แก้ไขสินค้า: {currentProduct.name}</h2>
                  {updateError && <p style={{color: colors.red, marginBottom: '10px'}}>{updateError}</p>}
                  
                  <form onSubmit={handleUpdateSubmit}>
                      {/* ชื่อสินค้า */}
                      <div>
                          <label style={pageStyles.labelStyle}>ชื่อสินค้า</label>
                          <input type="text" name="name" value={updateFormData.name} onChange={(e) => setUpdateFormData(p => ({...p, name: e.target.value}))} required style={pageStyles.inputStyle}/>
                      </div>
                      
                      {/* ราคา */}
                      <div>
                          <label style={pageStyles.labelStyle}>ราคา</label>
                          <input type="number" name="price" value={updateFormData.price} onChange={(e) => setUpdateFormData(p => ({...p, price: e.target.value}))} required min="0" step="0.01" style={pageStyles.inputStyle}/>
                      </div>

                      {/* สต็อก */}
                      <div>
                          <label style={pageStyles.labelStyle}>สต็อก (Stock)</label>
                          <input type="number" name="stock" value={updateFormData.stock} onChange={(e) => setUpdateFormData(p => ({...p, stock: e.target.value}))} required min="0" step="1" style={pageStyles.inputStyle}/>
                      </div>
                      
                      {/* หมวดหมู่ */}
                      <div>
                          <label style={pageStyles.labelStyle}>หมวดหมู่</label>
                          {categories.length > 0 ? (
                              <select 
                                  name="category" 
                                  value={updateFormData.category} 
                                  onChange={(e) => setUpdateFormData(p => ({...p, category: e.target.value}))} 
                                  required 
                                  style={pageStyles.inputStyle}
                              >
                                  {/* 🔴 แก้ไขจุดที่ 2: เปลี่ยนจาก 't name' เป็น 'name' (สำหรับ Modal แก้ไข) */}
                                  {categories.map((cat) => (
                                      <option key={cat.id} value={cat.id}>{cat.name || cat.id}</option>
                                  ))}
                              </select>
                          ) : (
                              <p style={{color: colors.red}}>ไม่พบหมวดหมู่</p>
                          )}
                      </div>
                      
                      {/* รูปภาพ */}
                      <div>
                          <label style={pageStyles.labelStyle}>รูปภาพสินค้า</label>
                          <input 
                              type="file" 
                              name="picture" 
                              accept="image/*" 
                              onChange={(e) => setUpdateFormData(p => ({...p, picture: e.target.files[0]}))} 
                              style={{padding: '5px', width: '100%'}}
                          />
                          {updateFormData.picture ? (
                              <p style={{fontSize: '0.85rem', color: colors.darkGreen, marginTop: '5px'}}>ไฟล์ใหม่ที่เลือก: {updateFormData.picture.name}</p>
                          ) : (
                              <p style={{fontSize: '0.85rem', color: '#888', marginTop: '5px'}}>รูปภาพปัจจุบัน: {currentProduct.picture || 'ไม่มีรูป'}</p>
                          )}
                      </div>

                      {/* ปุ่มบันทึก/ยกเลิก */}
                      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                          <button 
                              type="button" 
                              onClick={() => setShowUpdateForm(false)} 
                              style={{...pageStyles.cancelButtonStyle, flex: 1}}
                          >
                              ยกเลิก
                          </button>
                          <button 
                              type="submit" 
                              disabled={isUpdating || !updateFormData.name || !updateFormData.price || !updateFormData.category}
                              style={{ 
                                  flex: 1,
                                  ...pageStyles.saveButtonStyle, 
                                  backgroundColor: colors.orange, 
                                  opacity: (isUpdating || !updateFormData.name || !updateFormData.price || !updateFormData.category) ? 0.7 : 1 
                              }}
                          >
                              {isUpdating ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

    </div>
  );
}