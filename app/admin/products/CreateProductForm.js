'use client';

import { useState, useEffect } from 'react';
import pb from '../../lib/pocketbase'; 

// --- ชุดสี (Theme Colors) ---
const colors = {
    darkGreen: '#1A4D2E',
    skyBlue: '#4FC3F7',
    lightPink: '#FFF0F3',
    hotPink: '#FF80AB',
    white: '#FFFFFF',
    red: '#ef4444',
    orange: '#f59e0b'
};

// --- CSS Styles for Modal Component ---
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
    padding: '40px',
    borderRadius: '20px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
    width: '100%',
    maxWidth: '500px',
    animation: 'fadeIn 0.3s',
    fontFamily: "'Kanit', sans-serif",
    backgroundColor: colors.white
};

const titleStyle = { 
    marginBottom: '25px', 
    color: colors.darkGreen, 
    textAlign: 'center' 
};
const labelStyle = { 
    display: 'block', 
    marginBottom: '5px', 
    marginTop: '15px', 
    fontWeight: 'bold', 
    color: colors.darkGreen 
};
const inputStyle = { 
    width: '100%', 
    padding: '12px', 
    border: '1px solid #ccc', 
    borderRadius: '8px', 
    boxSizing: 'border-box' 
};
const fileInputStyle = { 
    padding: '10px', 
    width: '100%', 
    border: '1px solid #ccc', 
    borderRadius: '8px', 
    boxSizing: 'border-box',
    backgroundColor: colors.lightPink
};
const cancelButtonStyle = { 
    padding: '12px 20px', 
    border: 'none', 
    borderRadius: '8px', 
    color: colors.white, 
    cursor: 'pointer', 
    backgroundColor: '#9ca3af' 
};
const saveButtonStyle = { 
    padding: '12px 20px', 
    border: 'none', 
    borderRadius: '8px', 
    color: colors.white, 
    cursor: 'pointer', 
    fontWeight: 'bold' 
};
const errorStyle = { 
    color: colors.red, 
    marginBottom: '10px', 
    textAlign: 'center' 
};

export default function CreateProductForm({ onClose, onProductCreated }) {
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        stock: '0', 
        category: '', 
        picture: null,
    });
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    
    const [categories, setCategories] = useState([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);

    // --- ฟังก์ชันดึงหมวดหมู่ ---
    const fetchCategories = async () => {
        setIsLoadingCategories(true);
        try {
            const catRecords = await pb.collection('categories').getFullList({ requestKey: null });
            setCategories(catRecords);
            
            // ตั้งค่าหมวดหมู่แรกเป็นค่าเริ่มต้น ถ้ามี
            if (catRecords.length > 0) {
                setFormData(p => ({ ...p, category: catRecords[0].id }));
            }
        } catch (err) {
            console.error("Failed to fetch categories:", err);
            setErrorMessage("ไม่สามารถดึงรายการหมวดหมู่ได้");
        } finally {
            setIsLoadingCategories(false);
        }
    };
    
    // ดึงหมวดหมู่เมื่อ component ถูก mount
    useEffect(() => {
        fetchCategories();
    }, []);
    // --- สิ้นสุดส่วนดึงหมวดหมู่ ---


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(p => ({ ...p, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData(p => ({ ...p, picture: e.target.files[0] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setIsSaving(true);

        if (!formData.category) {
            setErrorMessage("กรุณาเลือกหมวดหมู่สินค้า");
            setIsSaving(false);
            return;
        }

        try {
            const dataToCreate = new FormData();
            dataToCreate.append('name', formData.name);
            dataToCreate.append('price', parseFloat(formData.price));
            dataToCreate.append('stock', parseInt(formData.stock)); 
            dataToCreate.append('relation', formData.category); 

            if (formData.picture) {
                dataToCreate.append('picture', formData.picture);
            }

            await pb.collection('products').create(dataToCreate);

            alert(`เพิ่มสินค้า "${formData.name}" สำเร็จ!`);
            onClose(); 
            onProductCreated(); 
        } catch (error) {
            console.error("Failed to create product:", error);
            setErrorMessage("เกิดข้อผิดพลาดในการบันทึก: " + (error.message || 'Unknown Error'));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
                <h2 style={titleStyle}>เพิ่มสินค้าใหม่</h2>
                {errorMessage && <p style={errorStyle}>{errorMessage}</p>}
                
                <form onSubmit={handleSubmit}>
                    {/* ชื่อสินค้า */}
                    <div>
                        <label style={labelStyle}>ชื่อสินค้า</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required style={inputStyle}/>
                    </div>
                    
                    {/* ราคา */}
                    <div>
                        <label style={labelStyle}>ราคา</label>
                        <input type="number" name="price" value={formData.price} onChange={handleChange} required min="0" step="0.01" style={inputStyle}/>
                    </div>
                    
                    {/* สต็อก */}
                    <div>
                        <label style={labelStyle}>สต็อก (Stock)</label>
                        <input type="number" name="stock" value={formData.stock} onChange={handleChange} required min="0" step="1" style={inputStyle}/>
                    </div>

                    {/* ✅ ส่วนการแสดงหมวดหมู่ */}
                    <div>
                        <label style={labelStyle}>หมวดหมู่</label>
                        {isLoadingCategories ? (
                            <p style={{color: colors.darkGreen}}>กำลังดึงรายการหมวดหมู่...</p>
                        ) : categories.length > 0 ? (
                            <select 
                                name="category" 
                                value={formData.category} 
                                onChange={handleChange} 
                                required 
                                style={inputStyle}
                            >
                                <option value="">--- เลือกหมวดหมู่ ---</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {/* 🔴 แก้ไขตรงนี้: ใช้ .name แทน [t name] เพื่อดึงชื่อหมวดหมู่ที่ถูกต้อง */}
                                        {cat.name || cat.id} 
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <p style={errorStyle}>ไม่พบหมวดหมู่! โปรดสร้างหมวดหมู่ใน PocketBase ก่อน</p> 
                        )}
                    </div>
                    
                    {/* รูปภาพ */}
                    <div>
                        <label style={labelStyle}>รูปภาพสินค้า</label>
                        <input type="file" name="picture" accept="image/*" onChange={handleFileChange} style={fileInputStyle}/>
                        {formData.picture && <p style={{fontSize: '0.85rem', color: colors.darkGreen, marginTop: '5px'}}>ไฟล์ที่เลือก: {formData.picture.name}</p>}
                    </div>

                    {/* ปุ่มบันทึก/ยกเลิก */}
                    <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
                        <button 
                            type="button" 
                            onClick={onClose}
                            style={{...cancelButtonStyle, flex: 1}}
                        >
                            ยกเลิก
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSaving || !formData.name || !formData.price || !formData.category || isLoadingCategories}
                            style={{ 
                                flex: 1,
                                ...saveButtonStyle, 
                                backgroundColor: colors.darkGreen, 
                                opacity: (isSaving || !formData.name || !formData.price || !formData.category || isLoadingCategories) ? 0.7 : 1 
                            }}
                        >
                            {isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}