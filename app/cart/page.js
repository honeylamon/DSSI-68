'use client';

import { useCart } from '@/app/contexts/CartContext';
import Link from 'next/link';
import pb from '@/app/lib/pocketbase';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react'; 
import { 
    FiTrash2, FiMinus, FiPlus, FiMapPin, FiTruck, 
    FiShoppingBag, FiPhone, FiCreditCard, FiShoppingCart,
    FiCheckSquare, FiSquare
} from 'react-icons/fi';

// --- Styles ---
const styles = {
    container: { maxWidth: '900px', margin: '40px auto', padding: '20px', fontFamily: "'Kanit', sans-serif" },
    title: { fontSize: '2rem', fontWeight: 'bold', marginBottom: '20px', color: '#1A4D2E', display: 'flex', alignItems: 'center', gap: '10px' },
    card: { backgroundColor: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: '20px' },
    emptyCart: { textAlign: 'center', padding: '50px', color: '#666' },
    itemRow: { display: 'flex', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '15px' },
    checkboxContainer: { cursor: 'pointer', marginRight: '15px', color: '#10b981', display: 'flex', alignItems: 'center' },
    itemInfo: { display: 'flex', alignItems: 'center', gap: '15px', flexGrow: 1 },
    itemImg: { width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', backgroundColor: '#f9f9f9' },
    itemName: { fontSize: '1.1rem', fontWeight: '600', color: '#333' },
    itemPrice: { color: '#10b981', fontWeight: 'bold' },
    qtyControl: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#f3f4f6', padding: '5px 10px', borderRadius: '8px' },
    qtyBtn: { border: 'none', background: 'transparent', cursor: 'pointer', color: '#555', display: 'flex', alignItems: 'center' },
    removeBtn: { color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '8px' },
    sectionTitle: { fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '15px', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' },
    inputGroup: { marginBottom: '15px' },
    label: { display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555', fontSize: '0.9rem' },
    input: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', outline: 'none' },
    deliveryOption: { display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', borderRadius: '10px', borderWidth: '2px', borderStyle: 'solid', borderColor: '#eee', cursor: 'pointer', marginBottom: '10px', transition: 'all 0.2s' },
    deliveryOptionSelected: { borderColor: '#10b981', backgroundColor: '#ecfdf5' },
    radio: { width: '20px', height: '20px', accentColor: '#10b981' },
    
    // ✅ สไตล์สำหรับแผนที่
    mapContainer: { width: '100%', height: '280px', borderRadius: '12px', overflow: 'hidden', marginTop: '15px', border: '1px solid #ddd' },
    mapInfoBox: { padding:'15px', backgroundColor:'#f0fdf4', borderRadius:'12px', border:'1px dashed #10b981', color:'#166534', marginTop: '15px' },

    summary: { marginTop: '20px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '12px' },
    totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '20px' },
    checkoutBtn: { width: '100%', padding: '15px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)' }
};

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
    const { user } = useAuth();
    const router = useRouter();
    
    const [deliveryType, setDeliveryType] = useState('delivery'); 
    const [selectedIds, setSelectedIds] = useState([]);
    const [addressDetails, setAddressDetails] = useState({
        recipient: '', phone: '', address: '', city: '', postcode: ''
    });

    // โหลดข้อมูลผู้ใช้เริ่มต้น
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

    // เริ่มต้นให้เลือกสินค้าทั้งหมดในตะกร้า
    useEffect(() => {
        if (cart.length > 0 && selectedIds.length === 0) {
            setSelectedIds(cart.map(item => item.id));
        }
    }, [cart]);

    const toggleSelectAll = () => {
        if (selectedIds.length === cart.length) setSelectedIds([]);
        else setSelectedIds(cart.map(item => item.id));
    };

    const toggleItem = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
        );
    };

    const selectedItems = Array.isArray(cart) ? cart.filter(item => selectedIds.includes(item.id)) : [];
    const selectedTotalPrice = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const handleCheckout = async () => {
        if (!user) { alert('กรุณาเข้าสู่ระบบก่อน'); router.push('/signin'); return; }
        if (selectedItems.length === 0) { alert('กรุณาเลือกสินค้าอย่างน้อย 1 รายการ'); return; }
        if (!addressDetails.recipient || !addressDetails.phone) { alert('กรุณากรอกชื่อและเบอร์โทรผู้รับ'); return; }
        if (deliveryType === 'delivery' && (!addressDetails.address || !addressDetails.city || !addressDetails.postcode)) {
            alert('กรุณากรอกที่อยู่จัดส่งให้ครบถ้วน'); return;
        }

        const finalTotal = selectedTotalPrice + (deliveryType === 'delivery' ? 50 : 0);
        if (!confirm(`ยืนยันยอดชำระรวม ${finalTotal.toLocaleString()} บาท?`)) return;

        try {
            pb.autoCancellation(false);
            const orderData = {
                user: user.id,
                name: addressDetails.recipient,  // ✅ แก้จาก customerName → name ให้ตรงกับ PocketBase
                total_price: finalTotal, 
                status: 'pending',
                items: JSON.stringify(selectedItems),
                phone: addressDetails.phone,
                address: deliveryType === 'delivery' 
                    ? `${addressDetails.address} ${addressDetails.city} ${addressDetails.postcode}`
                    : 'รับสินค้าที่หน้าร้าน (Aunflata 18, 7656 Verdal)'
            };

            const record = await pb.collection('orders').create(orderData);

            for (const item of selectedItems) {
                try {
                    await pb.collection('products').update(item.id, { "stock-": item.quantity });
                    removeFromCart(item.id);
                } catch (stockError) { console.error(`Error processing stock for ${item.name}:`, stockError); }
            }
            router.push(`/checkout/payment/${record.id}`);
        } catch (error) {
            console.error('Checkout error:', error);
            alert('เกิดข้อผิดพลาดในการสั่งซื้อ');
        }
    };

    if (cart.length === 0) {
        return (
            <div style={styles.container}>
                <div style={styles.card}><div style={styles.emptyCart}>
                    <FiShoppingCart size={60} color="#ddd" style={{marginBottom:'20px'}}/>
                    <h2>ตะกร้าของคุณว่างเปล่า</h2>
                    <Link href="/" style={{ color: '#10b981', textDecoration: 'none', fontWeight: 'bold' }}>ไปเลือกซื้อสินค้ากันเถอะ</Link>
                </div></div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <h1 style={styles.title}><FiShoppingCart /> ตะกร้าสินค้าของฉัน</h1>

            {/* ✅ ส่วนเลือกทั้งหมด */}
            <div 
                style={{...styles.card, padding:'15px 25px', marginBottom:'10px', display:'flex', alignItems:'center', gap:'10px', cursor:'pointer'}} 
                onClick={toggleSelectAll}
            >
                {selectedIds.length === cart.length ? <FiCheckSquare size={24} color="#10b981"/> : <FiSquare size={24} color="#ccc"/>}
                <span style={{fontWeight:'bold'}}>เลือกทั้งหมด ({cart.length} รายการ)</span>
            </div>

            {/* รายการสินค้า */}
            <div style={styles.card}>
                {cart.map((item) => (
                    <div key={item.id} style={{...styles.itemRow, opacity: selectedIds.includes(item.id) ? 1 : 0.6}}>
                        <div style={styles.checkboxContainer} onClick={() => toggleItem(item.id)}>
                            {selectedIds.includes(item.id) ? <FiCheckSquare size={24} /> : <FiSquare size={24} color="#ccc" />}
                        </div>
                        <div style={styles.itemInfo}>
                            <img src={item.image ? pb.files.getURL(item, item.image) : 'https://via.placeholder.com/80'} alt={item.name} style={styles.itemImg} />
                            <div>
                                <div style={styles.itemName}>{item.name}</div>
                                <div style={styles.itemPrice}>฿{item.price.toLocaleString()}</div>
                            </div>
                        </div>
                        <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                            <div style={styles.qtyControl}>
                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={styles.qtyBtn}><FiMinus /></button>
                                <span style={{fontWeight:'bold', minWidth:'20px', textAlign:'center'}}>{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={styles.qtyBtn}><FiPlus /></button>
                            </div>
                            <button onClick={() => removeFromCart(item.id)} style={styles.removeBtn}><FiTrash2 size={18} /></button>
                        </div>
                    </div>
                ))}
            </div>

            {/* ข้อมูลการจัดส่ง */}
            <div style={styles.card}>
                <h2 style={styles.sectionTitle}><FiMapPin /> ข้อมูลการจัดส่ง</h2>
                <div style={{marginBottom:'20px'}}>
                    <label style={{...styles.deliveryOption, ...(deliveryType === 'delivery' ? styles.deliveryOptionSelected : {})}}>
                        <input type="radio" name="deliveryType" checked={deliveryType === 'delivery'} onChange={() => setDeliveryType('delivery')} style={styles.radio}/>
                        <div style={{marginLeft: '10px'}}>
                            <div style={{fontWeight:'bold', display:'flex', alignItems:'center', gap:'5px'}}><FiTruck /> จัดส่งตามที่อยู่</div>
                            <div style={{fontSize:'0.85rem', color:'#666'}}>รอรับสินค้าที่บ้าน</div>
                        </div>
                    </label>
                    <label style={{...styles.deliveryOption, ...(deliveryType === 'pickup' ? styles.deliveryOptionSelected : {})}}>
                        <input type="radio" name="deliveryType" checked={deliveryType === 'pickup'} onChange={() => setDeliveryType('pickup')} style={styles.radio}/>
                        <div style={{marginLeft: '10px'}}>
                            <div style={{fontWeight:'bold', display:'flex', alignItems:'center', gap:'5px'}}><FiShoppingBag /> รับสินค้าที่ร้าน (Self Pickup)</div>
                            <div style={{fontSize:'0.85rem', color:'#666'}}>ไปรับสินค้าเองที่ร้าน (ฟรีค่าส่ง)</div>
                        </div>
                    </label>
                </div>

                {/* ✅ แสดง Google Maps เมื่อเลือกรับสินค้าที่ร้าน */}
                {deliveryType === 'pickup' && (
                    <div style={{ marginBottom: '25px' }}>
                        <div style={styles.mapContainer}>
                            <iframe 
                                width="100%" 
                                height="100%" 
                                frameBorder="0" 
                                style={{ border: 0 }}
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1746.5458023192083!2d11.481600!3d63.793700!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x466d1838f72a9e33%3A0x7b6e9e4f4e9e4e4e!2sAunflata%2018%2C%207656%20Verdal!5e0!3m2!1sth!2sno!4v1715000000000!5m2!1sth!2sno"
                                allowFullScreen
                            ></iframe>
                        </div>
                        <div style={styles.mapInfoBox}>
                            <h3 style={{marginTop:0, marginBottom:'5px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '5px'}}><FiMapPin /> พิกัดร้าน Baan Joy</h3>
                            <p style={{fontWeight:'bold', margin:0}}>Aunflata 18, 7656 Verdal</p>
                            <p style={{margin:0, fontSize: '0.9rem'}}><FiPhone /> ติดต่อ: 4827 7305</p>
                        </div>
                    </div>
                )}

                <div style={styles.inputGroup}>
                    <label style={styles.label}>ชื่อผู้รับ</label>
                    <input type="text" style={styles.input} value={addressDetails.recipient} onChange={(e) => setAddressDetails({...addressDetails, recipient: e.target.value})} />
                </div>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>เบอร์โทรศัพท์</label>
                    <input type="text" style={styles.input} value={addressDetails.phone} onChange={(e) => setAddressDetails({...addressDetails, phone: e.target.value})} />
                </div>
                {deliveryType === 'delivery' && (
                    <div>
                        <div style={styles.inputGroup}><label style={styles.label}>ที่อยู่จัดส่ง</label>
                            <textarea rows="3" style={{...styles.input, resize:'none'}} value={addressDetails.address} onChange={(e) => setAddressDetails({...addressDetails, address: e.target.value})} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div><label style={styles.label}>จังหวัด/เมือง</label>
                                <input type="text" style={styles.input} value={addressDetails.city} onChange={(e) => setAddressDetails({...addressDetails, city: e.target.value})} />
                            </div>
                            <div><label style={styles.label}>รหัสไปรษณีย์</label>
                                <input type="text" style={styles.input} value={addressDetails.postcode} onChange={(e) => setAddressDetails({...addressDetails, postcode: e.target.value})} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* สรุปยอดเงิน */}
            <div style={styles.summary}>
                <div style={styles.totalRow}>
                    <span>ค่าสินค้า ({selectedIds.length} รายการ)</span>
                    <span>฿{selectedTotalPrice.toLocaleString()}</span>
                </div>
                {deliveryType === 'delivery' && (
                    <div style={{...styles.totalRow, fontSize:'1rem', color:'#666'}}><span>ค่าจัดส่ง</span><span>฿50</span></div>
                )}
                <div style={{borderTop:'2px solid #eee', margin:'15px 0'}}></div>
                <div style={{...styles.totalRow, fontSize:'1.5rem', color:'#10b981'}}>
                    <span>ยอดรวมสุทธิ</span>
                    <span>฿{(selectedTotalPrice + (deliveryType === 'delivery' ? 50 : 0)).toLocaleString()}</span>
                </div>
                <button onClick={handleCheckout} style={styles.checkoutBtn}>
                    <FiCreditCard /> ยืนยันการสั่งซื้อสินค้า ({selectedIds.length})
                </button>
            </div>
        </div>
    );
}