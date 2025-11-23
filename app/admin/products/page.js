'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import pb from '../../lib/pocketbase'; 

// --- 1. CSS Styles (Global Styles) ---
// Styles เหล่านี้ถูกย้ายมาอยู่ด้านบนของไฟล์เพื่อให้ component ลูกเรียกใช้ได้ง่าย
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

const modalOverlayStyle = { 
    position: 'fixed', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    backgroundColor: 'rgba(0, 0, 0, 0.6)', 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center',
    zIndex: 1000 
};
const modalContentStyle = { 
    padding: '30px', 
    borderRadius: '15px', 
    maxWidth: '500px', 
    width: '90%', 
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)', 
    maxHeight: '90vh',
    overflowY: 'auto'
};
const labelStyle = { 
    display: 'block', 
    marginBottom: '8px', 
    fontWeight: 'bold', 
    color: '#333' 
};
const inputStyle = { 
    width: '100%', 
    padding: '12px', 
    borderRadius: '10px', 
    border: '1px solid #ddd', 
    fontSize: '16px',
    backgroundColor: 'white',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23000000%22%20d%3D%22M287%20197.4l-116.7-116.7c-4.9-4.9-12.8-4.9-17.7%200l-116.7%20116.7c-4.9%204.9-4.9%2012.8%200%2017.7s12.8%204.9%2017.7%200L146.2%20108.8l107.8%20107.8c4.8%204.8%2012.7%204.9%2017.7%200s4.9-12.7%200-17.7z%22%2F%3E%3C%2Fsvg%3E")`, 
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 10px top 50%',
    backgroundSize: '12px'
};
const fileInputStyle = { 
    width: '100%', 
    padding: '12px', 
    borderRadius: '10px', 
    border: '1px solid #ddd', 
    fontSize: '16px',
    backgroundColor: 'white'
};
const saveButtonStyle = { 
    padding: '12px 20px', 
    border: 'none', 
    borderRadius: '10px', 
    color: 'white', 
    fontWeight: 'bold', 
    cursor: 'pointer',
    transition: 'background-color 0.3s'
};
const cancelButtonStyle = { 
    padding: '12px 20px', 
    border: '1px solid #ccc', 
    borderRadius: '10px', 
    backgroundColor: '#eee', 
    color: '#333', 
    fontWeight: 'bold', 
    cursor: 'pointer',
    transition: 'background-color 0.3s'
};
// --- END Styles ---


export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State สำหรับ Modal เพิ่มสินค้า
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', price: '', category: '', picture: null });
  const [isSaving, setIsSaving] = useState(false);

  // State สำหรับ Modal แก้ไขสินค้า
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null); 
  const [updateFormData, setUpdateFormData] = useState({ name: '', price: '', category: '', picture: null });
  const [isUpdating, setIsUpdating] = useState(false);
  
  // State สำหรับเก็บรายการหมวดหมู่ทั้งหมด
  const [categories, setCategories] = useState([]); 

  // --- 2. การจัดการข้อมูลสินค้าและหมวดหมู่ ---
  useEffect(() => {
    fetchProducts();
    fetchCategories(); 
  }, []);
  
  const fetchCategories = async () => { /* ... โค้ดเดิม ... */ 
    try {
        const records = await pb.collection('categories').getFullList({ sort: 'name' });
        setCategories(records);
    } catch (error) {
        console.error("Failed to fetch categories:", error);
    }
  };
  const fetchProducts = async () => { /* ... โค้ดเดิม ... */ 
    setIsLoading(true);
    try {
        const records = await pb.collection('products').getFullList({
            sort: '-created',
            expand: 'category', 
            requestKey: null
        });
        setProducts(records);
    } catch (error) {
        console.error("Failed to fetch products:", error);
    } finally {
        setIsLoading(false);
    }
  };
  const handleDelete = async (id) => { /* ... โค้ดเดิม ... */ 
    if (confirm("คุณแน่ใจหรือไม่ที่จะลบสินค้านี้?")) {
        try {
            await pb.collection('products').delete(id);
            alert('ลบสินค้าสำเร็จ!');
            fetchProducts();
        } catch (error) {
            console.error("Error deleting product:", error);
            alert('ลบสินค้าไม่สำเร็จ: ' + error.message);
        }
    }
  };
  
  // --- 3. การจัดการฟอร์มเพิ่มสินค้า (Create Handler) ---
  const handleCreateChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'picture') {
        setFormData(prev => ({ ...prev, picture: files ? files[0] : null }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  const handleCreateSubmit = async (e) => { /* ... โค้ดเดิม ... */ 
    e.preventDefault();
    setIsSaving(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('price', formData.price);
      data.append('category', formData.category);
      if (formData.picture) { data.append('picture', formData.picture); }
      await pb.collection('products').create(data);
      alert('✅ เพิ่มสินค้าสำเร็จ!');
      setShowCreateForm(false);
      setFormData({ name: '', price: '', category: '', picture: null });
      fetchProducts(); 
    } catch (error) {
      console.error(error);
      alert('❌ เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // --- 4. การจัดการฟอร์มแก้ไขสินค้า (Update Handlers) ---
  const handleUpdateClick = (product) => { /* ... โค้ดเดิม ... */ 
    setCurrentProduct(product);
    setUpdateFormData({ 
        name: product.name, 
        price: product.price, 
        category: product.expand?.category?.id || '',
        picture: null 
    });
    setShowUpdateForm(true);
  };
  const handleUpdateChange = (e) => { /* ... โค้ดเดิม ... */ 
    const { name, value, files } = e.target;
    if (name === 'picture') {
        setUpdateFormData(prev => ({ ...prev, picture: files ? files[0] : null }));
    } else {
        setUpdateFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  const handleUpdateSubmit = async (e) => { /* ... โค้ดเดิม ... */ 
    e.preventDefault();
    setIsUpdating(true);
    try {
        const data = new FormData();
        data.append('name', updateFormData.name);
        data.append('price', updateFormData.price);
        data.append('category', updateFormData.category);
        if (updateFormData.picture) { data.append('picture', updateFormData.picture); }
        await pb.collection('products').update(currentProduct.id, data);
        alert('✅ แก้ไขสินค้าสำเร็จ!');
        setShowUpdateForm(false);
        setCurrentProduct(null);
        fetchProducts(); 
    } catch (error) {
        console.error(error);
        alert('❌ เกิดข้อผิดพลาดในการแก้ไข: ' + error.message);
    } finally {
        setIsUpdating(false);
    }
  };
  
  
  // --- 5. Main Render (ตารางสินค้า) ---
  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.lightPink, padding: '40px', fontFamily: "'Kanit', sans-serif" }}>
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ marginBottom: '20px' }}>
            <Link href="/admin" style={{ color: colors.darkGreen, textDecoration: 'none', display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                <span style={{ marginRight: '5px' }}>⬅</span> กลับไปหน้า Dashboard
            </Link>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: `2px solid ${colors.skyBlue}`, paddingBottom: '20px' }}>
            <h1 style={{ margin: 0, color: colors.darkGreen, fontSize: '2rem' }}>📦 รายการสินค้าทั้งหมด</h1>
            
            {/* ปุ่มเพิ่มสินค้าใหม่ */}
            <button onClick={() => setShowCreateForm(true)} style={{ 
                padding:'12px 24px', 
                background: colors.skyBlue, 
                color: colors.darkGreen,    
                border: 'none',
                cursor: 'pointer',
                borderRadius:'12px',
                fontWeight: 'bold',
                boxShadow: '0 4px 10px rgba(79, 195, 247, 0.5)',
                display: 'flex',
                alignItems: 'center'
            }}>
               <span style={{ marginRight: '8px', fontSize: '1.2rem' }}>+</span> เพิ่มสินค้า
            </button>
        </div>

        {isLoading ? <p style={{ textAlign: 'center', color: colors.darkGreen }}>กำลังโหลดข้อมูล...</p> : (
          <div style={{ overflowX: 'auto', background: 'white', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: `1px solid ${colors.white}` }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: colors.darkGreen, color: 'white', textAlign: 'left' }}><th style={{ padding: '20px', borderRadius: '20px 0 0 0' }}>รูปภาพ</th>
                  <th style={{ padding: '20px' }}>ชื่อสินค้า</th>
                  <th style={{ padding: '20px' }}>ราคา</th>
                  <th style={{ padding: '20px' }}>หมวดหมู่</th>
                  <th style={{ padding: '20px', textAlign: 'center', borderRadius: '0 20px 0 0' }}>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? (
                    products.map((p) => (
                        <tr key={p.id} style={{ borderBottom: `1px solid ${colors.lightPink}` }}><td style={{ padding: '15px' }}>
                                {p.picture ? (
                                    <img 
                                        src={pb.files.getURL(p, p.picture)} 
                                        alt={p.name} 
                                        style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }} 
                                    />
                                ) : (
                                    <div style={{ width: '70px', height: '70px', background: '#eee', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>No Pic</div>
                                )}
                            </td>
                            <td style={{ padding: '15px', fontWeight: 'bold', color: '#333', fontSize: '1.1rem' }}>{p.name}</td>
                            <td style={{ padding: '15px', color: '#0288D1', fontWeight: 'bold', fontSize: '1.1rem' }}>฿{p.price}</td>
                            <td style={{ padding: '15px', color: colors.darkGreen }}>
                                {p.expand?.category?.name || 'ไม่มี'}
                            </td>
                            <td style={{ padding: '15px', textAlign: 'center' }}>
                                <button 
                                    onClick={() => handleUpdateClick(p)} 
                                    style={{ 
                                        marginRight:'10px', 
                                        padding:'8px 16px', 
                                        background: colors.lightOrange, 
                                        color: colors.orange, 
                                        border: `1px solid ${colors.orange}`, 
                                        borderRadius:'8px', 
                                        cursor:'pointer', 
                                        fontWeight: 'bold' 
                                    }}
                                >
                                    แก้ไข
                                </button>
                                <button onClick={() => handleDelete(p.id)} style={{ padding:'8px 16px', background: colors.lightRed, color: colors.red, border: `1px solid ${colors.red}`, borderRadius:'8px', cursor:'pointer', fontWeight: 'bold' }}>ลบ</button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#888' }}>ยังไม่มีสินค้าในร้าน</td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 6. แสดง Modal เพิ่มสินค้า */}
        {showCreateForm && categories.length > 0 && (
            <CreateFormModal 
                colors={colors} 
                categories={categories}
                formData={formData}
                isSaving={isSaving}
                setShowCreateForm={setShowCreateForm}
                handleCreateChange={handleCreateChange}
                handleCreateSubmit={handleCreateSubmit}
            />
        )}
        
        {/* 7. แสดง Modal แก้ไขสินค้า */}
        {showUpdateForm && currentProduct && categories.length > 0 && (
            <UpdateFormModal 
                colors={colors}
                categories={categories}
                currentProduct={currentProduct}
                updateFormData={updateFormData}
                isUpdating={isUpdating}
                setShowUpdateForm={setShowUpdateForm}
                handleUpdateChange={handleUpdateChange}
                handleUpdateSubmit={handleUpdateSubmit}
            />
        )}
      </div>
    </div>
  );
}
// --- END ProductsPage Component ---


// ----------------------------------------------------
// --- 8. Component Modal เพิ่มสินค้า (ถูกย้ายออกมา) ---
// ----------------------------------------------------

const CreateFormModal = ({ colors, categories, formData, isSaving, setShowCreateForm, handleCreateChange, handleCreateSubmit }) => (
    <div style={modalOverlayStyle}>
        <div style={{ ...modalContentStyle, backgroundColor: colors.white }}>
            <h2 style={{ color: colors.darkGreen, textAlign: 'center', marginBottom: '30px' }}>+ เพิ่มสินค้าใหม่</h2>
            
            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* ชื่อสินค้า */}
                <div>
                    <label style={labelStyle}>ชื่อสินค้า</label>
                    <input 
                        type="text" 
                        name="name" 
                        required 
                        value={formData.name} 
                        onChange={handleCreateChange} 
                        style={inputStyle}
                    />
                </div>
                
                {/* ราคา */}
                <div>
                    <label style={labelStyle}>ราคา (บาท)</label>
                    <input 
                        type="number" 
                        name="price" 
                        required 
                        value={formData.price} 
                        onChange={handleCreateChange} 
                        style={inputStyle}
                    />
                </div>
                
                {/* ช่องเลือกหมวดหมู่ */}
                <div>
                      <label style={labelStyle}>หมวดหมู่สินค้า</label>
                      <select
                          name="category"
                          required
                          value={formData.category} 
                          onChange={handleCreateChange} 
                          style={inputStyle}
                      >
                          <option value="">-- เลือกหมวดหมู่ --</option>
                          {categories.map((cat) => (
                              <option key={cat.id} value={cat.id}> 
                                  {cat.name} 
                              </option>
                          ))}
                      </select>
                  </div>
                
                {/* รูปภาพ */}
                <div>
                    <label style={labelStyle}>รูปภาพสินค้า</label>
                    <input 
                        type="file" 
                        name="picture" 
                        accept="image/*" 
                        onChange={handleCreateChange} 
                        style={fileInputStyle}
                    />
                    {formData.picture && <p style={{fontSize: '0.85rem', color: colors.darkGreen, marginTop: '5px'}}>ไฟล์ที่เลือก: {formData.picture.name}</p>}
                </div>

                {/* ปุ่มบันทึก/ยกเลิก */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button 
                        type="button" 
                        onClick={() => setShowCreateForm(false)} 
                        style={{...cancelButtonStyle, flex: 1}}
                    >
                        ยกเลิก
                    </button>
                    <button 
                        type="submit" 
                        disabled={isSaving || !formData.name || !formData.price || !formData.category}
                        style={{ 
                          flex: 1,
                          ...saveButtonStyle, 
                          backgroundColor: colors.darkGreen, 
                          opacity: (isSaving || !formData.name || !formData.price || !formData.category) ? 0.7 : 1 
                        }}
                    >
                        {isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                    </button>
                </div>
            </form>
        </div>
    </div>
);

// ----------------------------------------------------
// --- 9. Component Modal แก้ไขสินค้า (ถูกย้ายออกมา) ---
// ----------------------------------------------------
const UpdateFormModal = ({ colors, categories, currentProduct, updateFormData, isUpdating, setShowUpdateForm, handleUpdateChange, handleUpdateSubmit }) => (
    <div style={modalOverlayStyle}>
        <div style={{ ...modalContentStyle, backgroundColor: colors.white }}>
            <h2 style={{ color: colors.orange, textAlign: 'center', marginBottom: '30px' }}>✏️ แก้ไขสินค้า: {currentProduct?.name}</h2>
            
            <form onSubmit={handleUpdateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* ชื่อสินค้า */}
                <div>
                    <label style={labelStyle}>ชื่อสินค้า</label>
                    <input 
                        type="text" 
                        name="name" 
                        required 
                        value={updateFormData.name} 
                        onChange={handleUpdateChange} 
                        style={inputStyle}
                    />
                </div>
                
                {/* ราคา */}
                <div>
                    <label style={labelStyle}>ราคา (บาท)</label>
                    <input 
                        type="number" 
                        name="price" 
                        required 
                        value={updateFormData.price} 
                        onChange={handleUpdateChange} 
                        style={inputStyle}
                    />
                </div>
                
                {/* ช่องเลือกหมวดหมู่ */}
                <div>
                      <label style={labelStyle}>หมวดหมู่สินค้า</label>
                      <select
                          name="category"
                          required
                          value={updateFormData.category} 
                          onChange={handleUpdateChange} 
                          style={inputStyle}
                      >
                          <option value="">-- เลือกหมวดหมู่ --</option>
                          {categories.map((cat) => (
                              <option key={cat.id} value={cat.id}> 
                                  {cat.name} 
                              </option>
                          ))}
                      </select>
                  </div>

                {/* รูปภาพ */}
                <div>
                    <label style={labelStyle}>รูปภาพสินค้า (ทิ้งว่างไว้ถ้าไม่เปลี่ยน)</label>
                    <input 
                        type="file" 
                        name="picture" 
                        accept="image/*" 
                        onChange={handleUpdateChange} 
                        style={fileInputStyle}
                    />
                    {updateFormData.picture ? (
                        <p style={{fontSize: '0.85rem', color: colors.darkGreen, marginTop: '5px'}}>ไฟล์ใหม่ที่เลือก: {updateFormData.picture.name}</p>
                    ) : (
                        <p style={{fontSize: '0.85rem', color: '#888', marginTop: '5px'}}>รูปภาพปัจจุบัน: {currentProduct?.picture || 'ไม่มีรูป'}</p>
                    )}
                </div>

                {/* ปุ่มบันทึก/ยกเลิก */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button 
                        type="button" 
                        onClick={() => setShowUpdateForm(false)} 
                        style={{...cancelButtonStyle, flex: 1}}
                    >
                        ยกเลิก
                    </button>
                    <button 
                        type="submit" 
                        disabled={isUpdating || !updateFormData.name || !updateFormData.price || !updateFormData.category}
                        style={{ 
                            flex: 1,
                            ...saveButtonStyle, 
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
);