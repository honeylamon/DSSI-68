'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; 
import { useAuth } from '@/app/contexts/AuthContext'; 
import pb from '@/app/lib/pocketbase'; 

// --- Styles (ธีม Baan Joy) ---
const colors = {
    primary: '#1A4D2E',
    danger: '#ef4444',
    warning: '#f59e0b',
    text: '#374151',
    border: '#e5e7eb',
    background: '#f9fafb',
    white: '#FFFFFF',
    buttonHover: '#3e594b',
};

export default function ProfilePage() {
    const { user, logout, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();

    // --- State สำหรับการจัดการข้อมูล ---
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        avatar: null
    });

    // ✅ FIX 1: ย้ายการ Redirect ไปไว้ใน useEffect
    useEffect(() => {
        if (!isAuthLoading && !user) {
            router.push('/signin');
        }
    }, [user, isAuthLoading, router]);

    // โหลดข้อมูลเดิมเข้า Form
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                address: user.address || '',
                city: user.city || '',
                postalCode: user.postcode || user.postalCode || '', // รองรับทั้งสองชื่อ
                avatar: null
            });
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prev => ({ ...prev, avatar: e.target.files[0] }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('phone', formData.phone);
            data.append('address', formData.address);
            data.append('city', formData.city);
            data.append('postalCode', formData.postalCode); // เช็คชื่อ field ใน PocketBase ให้ตรง

            if (formData.avatar) {
                data.append('avatar', formData.avatar);
            }

            await pb.collection('users').update(user.id, data);
            
            // รีโหลดหน้าเพื่อให้ข้อมูลอัปเดต (หรือจะใช้วิธี update context ก็ได้)
            alert('บันทึกข้อมูลสำเร็จ');
            setIsEditing(false);
            window.location.reload(); 

        } catch (error) {
            console.error('Error updating profile:', error);
            alert('เกิดข้อผิดพลาด: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (isAuthLoading) return <div style={{ textAlign: 'center', padding: '50px' }}>กำลังโหลด...</div>;
    
    // ✅ FIX 2: ถ้าไม่มี User ให้ return null ไปก่อน (การ redirect จะทำใน useEffect ข้างบน)
    if (!user) return null;

    return (
        <div style={{ maxWidth: '700px', margin: '40px auto', padding: '30px', backgroundColor: colors.white, borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            
            <h1 style={{ color: colors.primary, borderBottom: `2px solid ${colors.border}`, paddingBottom: '15px', marginBottom: '25px' }}>
                ข้อมูลส่วนตัว
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
                <div style={{ 
                    width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#eee', 
                    marginRight: '20px', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center',
                    border: `1px solid ${colors.border}`
                }}>
                    {user.avatar ? (
                        <img 
                            src={pb.files.getUrl(user, user.avatar)} 
                            alt="Profile" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    ) : (
                        <span style={{ fontSize: '2rem' }}>👤</span>
                    )}
                </div>
                <div>
                    <h2 style={{ margin: 0, color: colors.text }}>{user.name || user.username}</h2>
                    <p style={{ margin: '5px 0 0', color: '#666' }}>{user.email}</p>
                </div>
            </div>

            {!isEditing ? (
                // --- โหมดแสดงผล (View Mode) ---
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={gridStyle}>
                        <div>
                            <label style={labelStyle}>ชื่อ-นามสกุล</label>
                            <div style={inputStyle}>{user.name || '-'}</div>
                        </div>
                        <div>
                            <label style={labelStyle}>เบอร์โทรศัพท์</label>
                            <div style={inputStyle}>{user.phone || '-'}</div>
                        </div>
                    </div>
                    <div>
                        <label style={labelStyle}>ที่อยู่</label>
                        <div style={inputStyle}>{user.address || '-'}</div>
                    </div>
                    <div style={gridStyle}>
                        <div>
                            <label style={labelStyle}>จังหวัด</label>
                            <div style={inputStyle}>{user.city || '-'}</div>
                        </div>
                        <div>
                            <label style={labelStyle}>รหัสไปรษณีย์</label>
                            <div style={inputStyle}>{user.postcode || user.postalCode || '-'}</div>
                        </div>
                    </div>

                    <button onClick={() => setIsEditing(true)} style={{ ...btnStyle, backgroundColor: colors.warning, marginTop: '20px' }}>
                        แก้ไขข้อมูล
                    </button>
                </div>
            ) : (
                // --- โหมดแก้ไข (Edit Mode) ---
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={gridStyle}>
                        <div>
                            <label style={labelStyle}>ชื่อ-นามสกุล</label>
                            <input type="text" name="name" value={formData.name} onChange={handleInputChange} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>เบอร์โทรศัพท์</label>
                            <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} style={inputStyle} />
                        </div>
                    </div>
                    <div>
                        <label style={labelStyle}>ที่อยู่</label>
                        <textarea name="address" value={formData.address} onChange={handleInputChange} rows="3" style={{...inputStyle, resize: 'vertical'}} />
                    </div>
                    <div style={gridStyle}>
                        <div>
                            <label style={labelStyle}>จังหวัด</label>
                            <input type="text" name="city" value={formData.city} onChange={handleInputChange} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>รหัสไปรษณีย์</label>
                            <input type="text" name="postalCode" value={formData.postalCode} onChange={handleInputChange} style={inputStyle} />
                        </div>
                    </div>
                    
                    <div>
                        <label style={labelStyle}>เปลี่ยนรูปโปรไฟล์</label>
                        <input type="file" accept="image/*" onChange={handleFileChange} style={inputStyle} />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                        <button type="submit" disabled={isSaving} style={{ ...btnStyle, backgroundColor: colors.primary }}>
                            {isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                        </button>
                        <button type="button" onClick={() => setIsEditing(false)} style={{ ...btnStyle, backgroundColor: '#9ca3af' }}>ยกเลิก</button>
                    </div>
                </form>
            )}

            <div style={{ marginTop: '25px', borderTop: `1px solid ${colors.border}`, paddingTop: '20px' }}>
                <Link href="/profile/orders" style={linkStyle}>ดูประวัติและติดตามคำสั่งซื้อทั้งหมด</Link>
                {/* <button onClick={() => { logout(); router.push('/'); }} style={logoutBtnStyle}>ออกจากระบบ (Logout)</button> */}
            </div>
        </div>
    );
}

// --- Internal Styles ---
const gridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' };
const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' };
const inputStyle = { width: '100%', padding: '10px', borderRadius: '5px', border: `1px solid ${colors.border}`, boxSizing: 'border-box' };
const btnStyle = { flex: 1, padding: '12px', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const linkStyle = { display: 'block', padding: '15px', backgroundColor: colors.primary, color: 'white', borderRadius: '8px', textDecoration: 'none', textAlign: 'center', fontWeight: 'bold' };
const logoutBtnStyle = { width: '100%', marginTop: '10px', padding: '12px', backgroundColor: colors.danger, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };