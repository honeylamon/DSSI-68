'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import pb from '../lip/pocketbase'; // << แก้ไข path ให้ถูกต้อง
import styles from './AdminDashboard.module.css';

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ฟังก์ชันสำหรับดึงข้อมูลสินค้าทั้งหมด
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const records = await pb.collection('products').getFullList({
        sort: '-created',
      });
      setProducts(records);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      alert("เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า");
    } finally {
      setIsLoading(false);
    }
  };

  // ดึงข้อมูลสินค้าเมื่อคอมโพเนนต์ถูกโหลดครั้งแรก
  useEffect(() => {
    fetchProducts();
  }, []);

  // --- ฟังก์ชัน CRUD ---

  // 1. CREATE: เพิ่มสินค้าใหม่
  const handleCreate = async () => {
    const name = prompt("กรอกชื่อสินค้า:");
    if (!name) return; // ถ้าผู้ใช้กดยกเลิก

    const price = prompt("กรอกราคา (ตัวเลขเท่านั้น):");
    if (!price || isNaN(price)) {
      alert("กรุณากรอกราคาเป็นตัวเลข");
      return;
    }

    try {
      await pb.collection('products').create({ name, price: parseFloat(price) });
      alert("เพิ่มสินค้าสำเร็จ!");
      fetchProducts(); // โหลดข้อมูลใหม่
    } catch (error) {
      console.error("Failed to create product:", error);
      alert("เกิดข้อผิดพลาดในการเพิ่มสินค้า");
    }
  };

  // 2. UPDATE: แก้ไขสินค้า
  const handleUpdate = async (id, currentName, currentPrice) => {
    const name = prompt("กรอกชื่อสินค้าใหม่:", currentName);
    if (!name) return;

    const price = prompt("กรอกราคาใหม่:", currentPrice);
    if (!price || isNaN(price)) {
      alert("กรุณากรอกราคาเป็นตัวเลข");
      return;
    }

    try {
      await pb.collection('products').update(id, { name, price: parseFloat(price) });
      alert("แก้ไขสินค้าสำเร็จ!");
      fetchProducts();
    } catch (error) {
      console.error("Failed to update product:", error);
      alert("เกิดข้อผิดพลาดในการแก้ไขสินค้า");
    }
  };

  // 3. DELETE: ลบสินค้า
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
    <div className={styles.dashboardContainer}>
      <header className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span className={styles.logo}>Baan Joy</span>
          <span className={styles.sellerText}>| Seller Center</span>
        </div>
        <Link href="/" className={styles.homeLink}>กลับหน้าหลัก</Link>
      </header>

      <main className={styles.main}>
        {/* เมนูหลัก (สามารถเพิ่มเมนูอื่นได้ในอนาคต) */}
        <div className={styles.menuGrid}>
          <div className={`${styles.menuCard} ${styles.active}`}>
            จัดการสินค้า
          </div>
          {/* <div className={styles.menuCard}>จัดการคำสั่งซื้อ</div> */}
          {/* <div className={styles.menuCard}>ดูสถิติ</div> */}
        </div>
        
        {/* ส่วนจัดการสินค้า */}
        <div className={styles.productManager}>
          <div className={styles.managerHeader}>
            <h2>รายการสินค้าทั้งหมด</h2>
            <button onClick={handleCreate} className={styles.addButton}>+ เพิ่มสินค้าใหม่</button>
          </div>

          {isLoading ? (
            <p>กำลังโหลดข้อมูล...</p>
          ) : (
            <table className={styles.productTable}>
              <thead>
                <tr>
                  <th>ชื่อสินค้า</th>
                  <th>ราคา (บาท)</th>
                  <th>วันที่สร้าง</th>
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? (
                  products.map((product) => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>{product.price.toFixed(2)}</td>
                      <td>{new Date(product.created).toLocaleDateString('th-TH')}</td>
                      <td>
                        <button 
                          onClick={() => handleUpdate(product.id, product.name, product.price)} 
                          className={styles.editButton}
                        >
                          แก้ไข
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id, product.name)} 
                          className={styles.deleteButton}
                        >
                          ลบ
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center' }}>ยังไม่มีสินค้าในระบบ</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}

