'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import pb from '../lib/pocketbase';

export default function AdminPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- 1. ตรวจสอบสิทธิ์ ---
  useEffect(() => {
    const checkAuth = () => {
        const model = pb.authStore.model;
        if (!pb.authStore.isValid || !model || model.role !== 'admin') {
            alert("Access denied: เฉพาะ Admin เท่านั้น");
            router.push('/'); 
        } else {
            setIsAuthorized(true);
            fetchProducts();
        }
    };
    checkAuth();
  }, [router]);

  // --- 2. ดึงข้อมูลสินค้า (แก้ Error ตรงนี้) ---
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      // ✅ ใส่ requestKey: null -> สั่งให้ห้ามยกเลิกคำสั่ง แม้จะโหลดซ้ำ (แก้ Auto-cancelled)
      // ✅ ลบ expand: 'relation' ออก -> เพราะไม่มี field นี้จริง
      const records = await pb.collection('products').getFullList({ 
        sort: '-created',
        requestKey: null 
      });
      setProducts(records);
    } catch (error) {
      // ถ้าเป็น error จากการยกเลิก (Auto-cancel) ไม่ต้องแจ้งเตือนแดงๆ
      if (error.isAbort) return;
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- 3. ฟังก์ชัน เพิ่ม/แก้ไข/ลบ ---
  const handleCreate = async () => {
    const name = prompt("ชื่อสินค้า:");
    if (!name) return;
    const price = prompt("ราคา:");
    if (!price) return;

    try {
      await pb.collection('products').create({ name, price: parseFloat(price) });
      alert("เพิ่มสินค้าสำเร็จ!");
      fetchProducts();
    } catch (e) { alert("Error: " + e.message); }
  };

  const handleUpdate = async (id, oldName, oldPrice) => {
    const name = prompt("แก้ไขชื่อสินค้า:", oldName);
    if (!name) return;
    const price = prompt("แก้ไขราคา:", oldPrice);
    if (!price) return;

    try {
      await pb.collection('products').update(id, { name, price: parseFloat(price) });
      alert("แก้ไขสำเร็จ!");
      fetchProducts();
    } catch (e) { alert("Error: " + e.message); }
  };

  const handleDelete = async (id) => {
    if (confirm("ต้องการลบสินค้าจริงหรือไม่?")) {
      try {
        await pb.collection('products').delete(id);
        fetchProducts();
      } catch (e) { alert("Error: " + e.message); }
    }
  };

  // --- 4. แสดงผล ---
  if (!isAuthorized) return <div style={{padding:'50px', textAlign:'center'}}>กำลังตรวจสอบสิทธิ์...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom:'1px solid #ccc', paddingBottom:'10px' }}>
        <h1 style={{ margin: 0 }}>🛠️ จัดการสินค้า (Admin)</h1>
        <Link href="/" style={{ color: 'blue', textDecoration: 'none', fontWeight:'bold' }}>← กลับหน้าร้านค้า</Link>
      </div>

      <button onClick={handleCreate} style={{ backgroundColor: '#10b981', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', marginBottom: '20px' }}>
        + เพิ่มสินค้าใหม่
      </button>

      {isLoading ? <p>กำลังโหลดข้อมูล...</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
          <thead>
            <tr style={{ background: '#374151', color: 'white', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>ชื่อสินค้า</th>
              <th style={{ padding: '12px' }}>ราคา</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
                products.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>{p.name}</td>
                    <td style={{ padding: '12px', color:'#d97706', fontWeight:'bold' }}>{p.price}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button onClick={() => handleUpdate(p.id, p.name, p.price)} style={{ marginRight: '8px', padding:'5px 10px', background:'#f59e0b', color:'white', border:'none', borderRadius:'4px', cursor:'pointer' }}>แก้ไข</button>
                    <button onClick={() => handleDelete(p.id)} style={{ padding:'5px 10px', background:'#ef4444', color:'white', border:'none', borderRadius:'4px', cursor:'pointer' }}>ลบ</button>
                    </td>
                </tr>
                ))
            ) : (
                <tr><td colSpan="3" style={{padding:'20px', textAlign:'center'}}>ไม่มีสินค้า</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}