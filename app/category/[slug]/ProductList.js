'use client'; // <-- บรรทัดนี้สำคัญที่สุด! ทำให้ไฟล์นี้ทำงานฝั่งผู้ใช้

import Image from 'next/image';
import { useCart } from '@/app/contexts/CartContext'; // Import hook ตะกร้าสินค้า

export default function ProductList({ productsWithImages }) {
  // ดึงฟังก์ชัน addToCart มาจาก Context ที่เราสร้างไว้
  const { addToCart } = useCart();

  return (
    <ul>
      {productsWithImages.map(({ product, imageUrl }) => (
        <li key={product.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
          
          {/* ส่วนแสดงรูปภาพ */}
          <div style={{ position: 'relative', width: '100px', height: '100px', marginRight: '15px', flexShrink: 0 }}>
            <Image
              src={imageUrl}
              alt={product.name}
              width={100}
              height={100}
              objectFit="cover"
              style={{ borderRadius: '5px' }}
            />
          </div>

          {/* ส่วนแสดงรายละเอียด */}
          <div style={{ flexGrow: 1 }}>
            <h2>{product.name}</h2>
            <p>ราคา: {product.price.toLocaleString()} บาท</p>
            <p>คงเหลือ: {product.stock} {product.unit}</p>
          </div>

          {/* --- ส่วนปุ่มกด --- */}
          <div style={{ marginLeft: '15px' }}>
            <button
              onClick={() => {
                addToCart(product);
                // --- ผมลบ alert(...) จากตรงนี้ไปแล้ว ---
              }}
              style={{
                padding: '10px 15px',
                fontSize: '1rem',
                color: 'white',
                backgroundColor: '#28a745', // สีเขียว
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              เพิ่มลงตะกร้า
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

