'use client';

import { useState } from 'react';
import { useCart } from '@/app/contexts/CartContext';
import { useRouter } from 'next/navigation';
import styles from './AddressPage.module.css';

export default function AddressPage() {
  const { address, saveAddress } = useCart();
  const router = useRouter();

  // ตั้งค่าเริ่มต้นจาก address ที่มีอยู่ (ถ้ามี)
  const [name, setName] = useState(address?.name || '');
  const [phone, setPhone] = useState(address?.phone || '');
  const [fullAddress, setFullAddress] = useState(address?.fullAddress || '');
  const [note, setNote] = useState(address?.note || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    const addressData = { name, phone, fullAddress, note };
    
    // 1. บันทึกที่อยู่ลง Context (ซึ่งจะไป save ลง LocalStorage)
    saveAddress(addressData);
    
    // 2. แสดง Alert (ไม่จำเป็น)
    alert('บันทึกที่อยู่เรียบร้อยแล้ว');
    
    // 3. กลับไปหน้าตะกร้าสินค้า
    router.push('/cart');
  };

  return (
    <div className={styles.container}>
      <button onClick={() => router.back()} className={styles.backButton}>
        &larr; กลับ
      </button>
      <h1>{address ? 'แก้ไขที่อยู่จัดส่ง' : 'เพิ่มที่อยู่ใหม่'}</h1>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="name">ชื่อ - นามสกุล</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="phone">เบอร์โทรศัพท์</label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="fullAddress">ที่อยู่ (บ้านเลขที่, ถนน, ตำบล, อำเภอ, จังหวัด, รหัสไปรษณีย์)</label>
          <textarea
            id="fullAddress"
            rows="4"
            value={fullAddress}
            onChange={(e) => setFullAddress(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="note">หมายเหตุ (ถ้ามี)</label>
          <input
            type="text"
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        
        <button type="submit" className={styles.saveButton}>
          บันทึกที่อยู่
        </button>
      </form>
    </div>
  );
}
