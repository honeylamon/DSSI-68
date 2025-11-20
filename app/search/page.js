'use client';

import pb from '@/app/lib/pb'; 
import ProductList from '@/app/components/ProductList'; 
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaSearch, FaImage } from 'react-icons/fa'; // ต้องติดตั้ง react-icons

// 2. [เพิ่ม]
// เพิ่ม Helper function สำหรับดึง URL รูปภาพ
// (สมมติว่า field รูปภาพใน DB ชื่อ 'picture')
function getProductImageUrl(record, filename) {
  if (!record || !filename) {
    return '/images/placeholder.jpg'; // รูปสำรอง
  }
  try {
    // ใช้ pb instance ที่ import เข้ามา
    return pb.getFileUrl(record, filename, { thumb: '100x100' });
  } catch (e) {
    console.warn('Error getting image URL for search:', e);
    return '/images/placeholder.jpg';
  }
}

// Helper: สร้าง filter query (เหมือนเดิม)
function buildFilter(ids) {
  return `(${ids.map(id => `id='${id}'`).join(' || ')})`;
}

async function getProducts(searchParams) {
  const q = searchParams.q; 
  const imageResults = searchParams.image_results;

  try {
    let products = []; // ตัวแปรเก็บผลลัพธ์ดิบ
    let title = "";

    if (q) {
      // --- ค้นหาด้วยข้อความ ---
      const filter = `(name ~ '${q}' || description ~ '${q}')`;
      products = await pb.collection('products').getFullList({
        filter: filter,
        sort: '-created'
      });
      title = `ผลการค้นหา: "${q}"`;

    } else if (imageResults) {
      // --- ค้นหาด้วยรูปภาพ ---
      const productIds = imageResults.split(',');
      const filter = buildFilter(productIds);
      const allFoundProducts = await pb.collection('products').getFullList({
        filter: filter,
      });
      // จัดลำดับสินค้าตามที่ Clarifai ส่งกลับมา
      products = productIds.map(id => 
        allFoundProducts.find(p => p.id === id)
      ).filter(Boolean);
      title = "สินค้าที่คล้ายกัน";
    } else {
      return { productsWithImages: [], title: "กรุณาระบุคำค้นหา" };
    }

    // 3. [สำคัญ]
    // แปลง 'products' (array)
    // ให้เป็น 'productsWithImages' (array of objects)
    // ตามรูปแบบที่ ProductList.js ต้องการ
    const productsWithImages = products.map(product => ({
      product: product,
      imageUrl: getProductImageUrl(product, product.picture) // 'product.picture' คือ field รูปใน DB
    }));

    // 4. [แก้ไข] ส่ง prop ที่ถูกต้องกลับไป
    return { productsWithImages, title };

  } catch (error) {
    console.error("Search Error:", error);
    // 5. [แก้ไข]
    return { productsWithImages: [], title: "เกิดข้อผิดพลาดในการค้นหา" };
  }
}


export default function SearchPage() {
  const searchParams = useSearchParams();
  const [result, setResult] = useState({ productsWithImages: [], title: "" });
  const [query, setQuery] = useState('');
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    let isActive = true;
    async function fetchData() {
      const params = Object.fromEntries(searchParams.entries());
      const data = await getProducts(params);
      if (isActive) setResult(data);
    }
    fetchData();
    return () => { isActive = false; };
  }, [searchParams]);

  const handleTextSearch = () => {
    // redirect หรือ set params สำหรับค้นหาข้อความ
    window.location.href = `/search?q=${encodeURIComponent(query)}`;
  };

  const handleImageSearch = () => {
    // อัปโหลดรูปภาพและ redirect ด้วย image_results (ต้องมีฝั่ง API รองรับ)
    // ตัวอย่าง: window.location.href = `/search?image_results=xxx,yyy`;
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="ค้นหาสินค้า..."
        />
        <button onClick={handleTextSearch}>
          <FaSearch /> ค้นหาข้อความ
        </button>
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          id="image-upload"
          onChange={e => setImageFile(e.target.files[0])}
        />
        <label htmlFor="image-upload" style={{ cursor: 'pointer' }}>
          <FaImage /> ค้นหาด้วยรูป
        </label>
        <button onClick={handleImageSearch} disabled={!imageFile}>
          ค้นหาด้วยรูป
        </button>
      </div>
      <h2>{result.title}</h2>
      <ProductList productsWithImages={result.productsWithImages} />
    </div>
  );
}