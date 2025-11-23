'use client';

import { useState } from 'react';
// ❌ เปลี่ยนจาก '../../../lib/pocketbase'
// ✅ เป็น '../../lib/pocketbase' (ถอยหลัง 2 ก้าว)
import pb from '../../lib/pocketbase'; 

// --- ชุดสี (Theme Colors) ---
const colors = {
    darkGreen: '#1A4D2E',
    skyBlue: '#4FC3F7',
    lightPink: '#FFF0F3',
    hotPink: '#FF80AB',
    white: '#FFFFFF',
    red: '#ef4444'
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
    fontFamily: "'Kanit', sans-serif" 
};
const labelStyle = { 
    display: 'block', 
    marginBottom: '8px', 
    color: '#333', 
    fontWeight: 'bold' 
};
const inputStyle = { 
    width: '100%', 
    padding: '12px', 
    borderRadius: '10px', 
    border: '1px solid #ddd', 
    fontSize: '16px' 
};
const fileInputStyle = { 
    width: '100%', 
    padding: '10px', 
    borderRadius: '10px', 
    border: '1px dashed #ccc', 
    backgroundColor: '#fafafa' 
};
const saveButtonStyle = {
    flex: 1,
    padding: '15px', 
    color: 'white', 
    border: 'none', 
    borderRadius: '12px', 
    fontSize: '18px', 
    fontWeight: 'bold', 
    cursor: 'pointer',
    transition: 'background-color 0.2s'
};
const cancelButtonStyle = {
    flex: 1,
    padding: '15px', 
    backgroundColor: '#E0E0E0', 
    color: '#555', 
    border: 'none', 
    borderRadius: '12px', 
    fontSize: '18px', 
    fontWeight: 'bold', 
    cursor: 'pointer',
    transition: 'background-color 0.2s'
};
// --- END CSS Styles ---


export default function CreateProductForm({ onSaveSuccess, onClose }) {
    const [formData, setFormData] = useState({ name: '', price: '', picture: null });
    const [isSaving, setIsSaving] = useState(false);

    // ✅ ฟังก์ชันแยกสำหรับ Name Input
    const handleNameChange = (e) => {
        setFormData(prev => ({ ...prev, name: e.target.value }));
    };

    // ✅ ฟังก์ชันแยกสำหรับ Price Input
    const handlePriceChange = (e) => {
        setFormData(prev => ({ ...prev, price: e.target.value }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, picture: e.target.files[0] }));
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('price', formData.price);
            if (formData.picture) {
                data.append('picture', formData.picture);
            }

            await pb.collection('products').create(data);
            
            alert('✅ เพิ่มสินค้าสำเร็จ!');
            
            onSaveSuccess(); 
            onClose(); 

        } catch (error) {
            console.error(error);
            alert('❌ เกิดข้อผิดพลาด: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div style={modalOverlayStyle}>
            <div style={{ ...modalContentStyle, backgroundColor: colors.white }}>
                <h2 style={{ color: colors.darkGreen, textAlign: 'center', marginBottom: '30px' }}>+ เพิ่มสินค้าใหม่</h2>
                
                <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* ชื่อสินค้า */}
                    <div>
                        <label style={labelStyle}>ชื่อสินค้า</label>
                        <input type="text" name="name" required value={formData.name} onChange={handleNameChange} style={inputStyle}/>
                    </div>
                    
                    {/* ราคา */}
                    <div>
                        <label style={labelStyle}>ราคา (บาท)</label>
                        <input type="number" name="price" required value={formData.price} onChange={handlePriceChange} style={inputStyle}/>
                    </div>
                    
                    {/* รูปภาพ */}
                    <div>
                        <label style={labelStyle}>รูปภาพสินค้า</label>
                        <input type="file" name="picture" accept="image/*" onChange={handleFileChange} style={fileInputStyle}/>
                        {formData.picture && <p style={{fontSize: '0.85rem', color: colors.darkGreen, marginTop: '5px'}}>ไฟล์ที่เลือก: {formData.picture.name}</p>}
                    </div>

                    {/* ปุ่มบันทึก/ยกเลิก */}
                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                        <button 
                            type="button" 
                            onClick={onClose}
                            style={cancelButtonStyle}
                        >
                            ยกเลิก
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSaving || !formData.name || !formData.price}
                            style={{ ...saveButtonStyle, backgroundColor: colors.darkGreen, opacity: (isSaving || !formData.name || !formData.price) ? 0.7 : 1 }}
                        >
                            {isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}