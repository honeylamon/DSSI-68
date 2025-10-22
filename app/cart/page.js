'use client';

import { useState, useEffect } from 'react'; // ต้อง import useEffect
import { useCart } from '@/app/contexts/CartContext';
import styles from './CartPage.module.css';
import Image from 'next/image';
import PocketBase from 'pocketbase';
import Link from 'next/link';

// ... (ส่วน pb และ getProductImageUrl เหมือนเดิม) ...
const pb = new PocketBase('http://122.155.211.233:8090');

function getProductImageUrl(record, filename) {
  if (!record || !filename) {
    return '/placeholder.jpg'; 
  }
  try {
    if (typeof record.id === 'undefined' || typeof record.collectionId === 'undefined') {
        if (typeof filename === 'string' && filename.startsWith('http')) {
            return filename;
        }
        return '/placeholder.jpg';
    }
    return pb.getFileUrl(record, filename, { 'thumb': '100x100' });
  } catch (e) {
    console.error('Error getting file URL:', e, record);
    return '/placeholder.jpg';
  }
}


export default function CartPage() {
  // --- [อัปเกรด] ดึงฟังก์ชันใหม่ๆ มาใช้ ---
  const { 
    cartItems, 
    address, 
    removeFromCart, 
    updateQuantity, 
    // clearCart, // เราจะเปลี่ยนไปใช้ removeSelectedItems
    toggleItemSelection,
    toggleAllSelection,
    removeSelectedItems
  } = useCart();
  
  const [deliveryMethod, setDeliveryMethod] = useState('pickup');

  // --- [อัปเกรด] คำนวณราคาสินค้า *เฉพาะที่ติ๊กเลือก* ---
  const selectedItems = cartItems.filter(item => item.selected);
  
  const subtotal = selectedItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shippingFee = (deliveryMethod === 'shipping' && selectedItems.length > 0) ? 50 : 0; // ถ้ามีของที่เลือกและส่ง ค่อยคิดค่าส่ง
  const totalPrice = subtotal + shippingFee;

  // --- [อัปเกรด] ตัวแปรสำหรับ Checkbox "เลือกทั้งหมด" ---
  // เช็คว่าติ๊กหมดทุกช่องหรือยัง (และต้องมีสินค้าอย่างน้อย 1 ชิ้น)
  const isAllSelected = cartItems.length > 0 && cartItems.every(item => item.selected);

  const handleToggleAll = () => {
    // ถ้าตอนนี้ติ๊กหมดแล้ว -> ให้เอาติ๊กออกทั้งหมด
    // ถ้ายังติ๊กไม่หมด -> ให้ติ๊กทั้งหมด
    toggleAllSelection(!isAllSelected);
  };

  // --- [อัปเกรด] แก้ไข handleCheckout ---
  const handleCheckout = (e) => {
    e.preventDefault();
    
    // --- [อัปเกรด] เช็คว่ามีของที่ "ติ๊กเลือก" หรือไม่ ---
    if (selectedItems.length === 0) {
      alert("กรุณาติ๊กเลือกสินค้าที่ต้องการสั่งซื้อก่อนครับ!");
      return;
    }
    
    if (deliveryMethod === 'shipping' && !address) {
      alert("กรุณาเพิ่มที่อยู่สำหรับจัดส่งด้วยครับ (กดปุ่ม +)");
      return;
    }

    const orderDetails = `
      รายการสินค้า (ที่สั่งซื้อ):
      ${selectedItems.map(item => `- ${item.name} x ${item.quantity}`).join('\n')} 
      --------------------
      ราคารวมทั้งหมด: ${totalPrice.toLocaleString()} บาท
      วิธีการรับสินค้า: ${deliveryMethod === 'pickup' ? 'รับที่หน้าร้าน' : 'จัดส่งพัสดุ'}
      ${deliveryMethod === 'shipping' ? `
      ที่อยู่จัดส่ง:
      ชื่อ: ${address.name}
      โทร: ${address.phone}
      ที่อยู่: ${address.fullAddress}
      ` : ''}
    `;

    console.log("ข้อมูลการสั่งซื้อ:", {
      items: selectedItems, // ส่งไปเฉพาะของที่เลือก
      totalPrice,
      deliveryMethod,
      address: deliveryMethod === 'shipping' ? address : 'N/A'
    });

    alert("การสั่งซื้อสำเร็จ!\n" + orderDetails);
    
    // --- [อัปเกรด] ลบเฉพาะสินค้าที่ติ๊กเลือก ออกจากตะกร้า ---
    removeSelectedItems();
  };

  return (
    <div className={styles.container}>
      <h1>ตะกร้าสินค้า</h1>
      {cartItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <p>ยังไม่มีสินค้าในตะกร้า</p>
          <Link href="/" style={{ color: '#3B5D50', textDecoration: 'underline' }}>กลับไปเลือกซื้อสินค้า</Link>
        </div>
      ) : (
        <>
          {/* --- [เพิ่มใหม่] ปุ่มเลือกทั้งหมด --- */}
          <div className={styles.selectAllBar}>
            <input 
              type="checkbox"
              id="selectAll"
              checked={isAllSelected}
              onChange={handleToggleAll}
            />
            <label htmlFor="selectAll">เลือกทั้งหมด ({cartItems.length} ชิ้น)</label>
          </div>
        
          <ul className={styles.itemList}>
            {cartItems.map(item => (
              <li key={item.id} className={styles.item}>
                {/* --- [เพิ่มใหม่] Checkbox ของสินค้าแต่ละชิ้น --- */}
                <input 
                  type="checkbox"
                  className={styles.itemCheckbox}
                  checked={item.selected}
                  onChange={() => toggleItemSelection(item.id)}
                />
                <Image
                  src={getProductImageUrl(item, item.picture)}
                  alt={item.name}
                  width={80}
                  height={80}
                  className={styles.itemImage}
                />
                <span className={styles.itemName}>{item.name}</span>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.id, e.target.value)}
                  min="1"
                  className={styles.quantityInput}
                />
                <span className={styles.itemPrice}>{(item.price * item.quantity).toLocaleString()} บาท</span>
                <button onClick={() => removeFromCart(item.id)} className={styles.removeButton}>ลบ</button>
              </li>
            ))}
          </ul>

          <div className={styles.summaryContainer}>
            <h2>สรุปรายการ (เฉพาะสินค้าที่เลือก)</h2>
            <div className={styles.summaryDetails}>
              <div className={styles.summaryRow}>
                {/* --- [อัปเกรด] แสดงจำนวนของที่เลือก --- */}
                <span>ราคาสินค้า ({selectedItems.length} ชิ้น)</span>
                <span>{subtotal.toLocaleString()} บาท</span>
              </div>
              <div className={styles.summaryRow}>
                <span>ค่าจัดส่ง</span>
                <span>{shippingFee.toLocaleString()} บาท</span>
              </div>
              <div className={`${styles.summaryRow} ${styles.total}`}>
                <span>ราคารวมทั้งหมด</span>
                <span>{totalPrice.toLocaleString()} บาท</span>
              </div>
            </div>

            <form onSubmit={handleCheckout} className={styles.checkoutForm}>
              {/* ... (ส่วนเลือกวิธีรับสินค้า และ ที่อยู่ เหมือนเดิม) ... */}
              <h3>เลือกวิธีรับสินค้า</h3>
              <div className={styles.deliveryOptions}>
                <label>
                  <input type="radio" value="pickup" checked={deliveryMethod === 'pickup'} onChange={(e) => setDeliveryMethod(e.target.value)} />
                  รับที่หน้าร้าน
                </label>
                <label>
                  <input type="radio" value="shipping" checked={deliveryMethod === 'shipping'} onChange={(e) => setDeliveryMethod(e.target.value)} />
                  จัดส่งพัสดุ
                </label>
              </div>

              {deliveryMethod === 'shipping' && (
                <div className={styles.addressDisplay}>
                  <label>ที่อยู่สำหรับจัดส่ง</label>
                  {address ? (
                    <div className={styles.addressBox}>
                      <p><strong>{address.name}</strong> ({address.phone})</p>
                      <p>{address.fullAddress}</p>
                      {address.note && <p><i>หมายเหตุ: {address.note}</i></p>}
                    </div>
                  ) : (
                    <p>ยังไม่ได้เพิ่มที่อยู่จัดส่ง</p>
                  )}
                  <Link href="/checkout/address" className={styles.addAddressButton}>
                    {address ? 'แก้ไขที่อยู่' : '➕ เพิ่มที่อยู่ใหม่'}
                  </Link>
                </div>
              )}
              {/* --- จบส่วนที่อยู่ --- */}

              <button type="submit" className={styles.confirmButton}>
                ยืนยันการสั่งซื้อ ({selectedItems.length} ชิ้น)
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}