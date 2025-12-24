'use client';

import { useCart } from '@/app/contexts/CartContext';
import Link from 'next/link';
import pb from '@/app/lib/pocketbase';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react'; 

// ✅ กำหนด URL ของ PocketBase (IP เครื่องของคุณ)
const POCKETBASE_URL = 'http://192.168.1.62:8090'; 

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
    const { user } = useAuth();
    const router = useRouter();
    
    // State สำหรับเก็บข้อมูลที่อยู่
    const [addressDetails, setAddressDetails] = useState({
        recipient: '',
        phone: '',
        address: '',
        city: '',
        postcode: ''
    });

    // ดึงข้อมูล User มาใส่ในฟอร์มอัตโนมัติ
    useEffect(() => {
        if (user) {
            setAddressDetails({
                recipient: user.name || user.username || '',
                phone: user.phone || '',       
                address: user.address || '',   
                city: user.city || '',         
                postcode: user.postcode || user.postalCode || '' 
            });
        }
    }, [user]);

    const totalPrice = Array.isArray(cart) 
        ? cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
        : 0;

    // --- ฟังก์ชันสั่งซื้อสินค้า ---
    const handleCheckout = async () => {
        if (!user) {
            alert('กรุณาเข้าสู่ระบบก่อนชำระเงิน');
            router.push('/signin');
            return;
        }

        if (cart.length === 0) return;
        
        // Validation ตรวจสอบข้อมูล
        if (!addressDetails.recipient || !addressDetails.address || !addressDetails.phone) {
            alert('กรุณากรอกชื่อ, เบอร์โทร และที่อยู่ให้ครบถ้วน');
            return;
        }

        try {
            const data = {
                user: user.id,
                items: JSON.stringify(cart),
                total_price: totalPrice,
                status: 'pending',
                address_detail: JSON.stringify(addressDetails), 
            };

            await pb.collection('orders').create(data);
            
            if (clearCart) {
                clearCart();
            } else {
                cart.forEach(item => removeFromCart(item.id));
            }

            alert('สั่งซื้อสำเร็จ! โปรดตรวจสอบสถานะในหน้าประวัติคำสั่งซื้อ');
            router.push('/profile/orders');

        } catch (error) {
            console.error(error);
            alert('เกิดข้อผิดพลาดในการสร้าง Order: ' + error.message);
        }
    };

    // กรณีตะกร้าว่าง
    if (!cart || cart.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <h1 style={{color: '#333'}}>ตะกร้าสินค้าของคุณว่างเปล่า</h1>
                <Link href="/" style={{ color: '#2563eb', textDecoration: 'underline' }}>
                    กลับไปเลือกซื้อสินค้า
                </Link>
            </div>
        );
    }

    const inputStyle = { width: '100%', padding: '10px', margin: '5px 0 15px 0', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' };
    const labelStyle = { fontWeight: 'bold', display: 'block', marginTop: '10px' };

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <h1 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>ตะกร้าสินค้า</h1>
            
            <div style={{ marginTop: '20px' }}>
                {cart.map((item, index) => {
                    // ✅ 1. เช็ค collectionId (ถ้าไม่มีให้เดาว่าเป็น products)
                    const collectionId = item.collectionId || item.collectionName || 'products';
                    
                    // ✅ 2. ดึงชื่อไฟล์รูป (รองรับทั้ง picture และ image)
                    const imageFilename = item.picture || item.image;

                    // ✅ 3. สร้าง URL
                    const imageUrl = (imageFilename && item.id) 
                        ? `${POCKETBASE_URL}/api/files/${collectionId}/${item.id}/${imageFilename}`
                        : null;

                    return (
                        <div key={item.id || index} style={{ display: 'flex', alignItems: 'center', padding: '1.5rem 0', borderBottom: '1px solid #eee' }}>
                            
                            {/* กรอบรูปภาพ */}
                            <div style={{ width: '80px', height: '80px', flexShrink: 0, marginRight: '1.5rem', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9f9f9'}}>
                                {imageUrl ? (
                                    <img 
                                        src={imageUrl} 
                                        alt={item.name} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                        onError={(e) => {
                                            e.target.style.display = 'none'; 
                                            e.target.nextSibling.style.display = 'block'; 
                                        }}
                                    />
                                ) : null}
                                <div style={{ display: imageUrl ? 'none' : 'block', fontSize: '0.8rem', color: '#999' }}>No Img</div>
                            </div>
                            
                            <div style={{ flexGrow: 1 }}>
                                <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>{item.name}</h3>
                                <p style={{ margin: 0, color: '#666' }}>{item.price} บาท</p>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '4px' }}>
                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} style={{ padding: '5px 10px', background: '#f5f5f5', border: 'none', cursor: 'pointer' }}>-</button>
                                <span style={{ padding: '0 15px', fontWeight: 'bold' }}>{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ padding: '5px 10px', background: '#f5f5f5', border: 'none', cursor: 'pointer' }}>+</button>
                            </div>
                            
                            <button onClick={() => removeFromCart(item.id)} style={{ marginLeft: '2rem', color: '#ef4444', background: 'none', border: '1px solid #ef4444', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>ลบ</button>
                        </div>
                    );
                })}
            </div>

            {/* ส่วนฟอร์มที่อยู่จัดส่ง */}
            <div style={{ marginTop: '40px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fefefe' }}>
                <h2 style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>ที่อยู่จัดส่ง</h2>
                
                <div style={{textAlign: 'right', marginBottom: '10px'}}>
                   <small style={{color: '#666'}}>* ข้อมูลถูกดึงมาจากโปรไฟล์ของคุณ (หากมี)</small>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                        <label style={labelStyle}>ชื่อผู้รับ</label>
                        <input type="text" style={inputStyle} value={addressDetails.recipient} 
                               onChange={(e) => setAddressDetails({...addressDetails, recipient: e.target.value})} />
                    </div>
                    <div>
                        <label style={labelStyle}>เบอร์โทรศัพท์</label>
                        <input type="text" style={inputStyle} value={addressDetails.phone} 
                               onChange={(e) => setAddressDetails({...addressDetails, phone: e.target.value})} />
                    </div>
                </div>
                
                <label style={labelStyle}>ที่อยู่ (บ้านเลขที่, ถนน, ตำบล)</label>
                <input type="text" style={inputStyle} value={addressDetails.address} 
                       onChange={(e) => setAddressDetails({...addressDetails, address: e.target.value})} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                        <label style={labelStyle}>จังหวัด/เมือง</label>
                        <input type="text" style={inputStyle} value={addressDetails.city} 
                               onChange={(e) => setAddressDetails({...addressDetails, city: e.target.value})} />
                    </div>
                    <div>
                        <label style={labelStyle}>รหัสไปรษณีย์</label>
                        <input type="text" style={inputStyle} value={addressDetails.postcode} 
                               onChange={(e) => setAddressDetails({...addressDetails, postcode: e.target.value})} />
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '2rem', textAlign: 'right', borderTop: '2px solid #eee', paddingTop: '20px' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>ยอดรวม: <span style={{ color: '#10b981' }}>{totalPrice.toLocaleString()}</span> บาท</h2>
                
                <button 
                    onClick={handleCheckout}
                    style={{ padding: '12px 30px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    ชำระเงิน
                </button>
            </div>
        </div>
    );
}