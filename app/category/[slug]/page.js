// app/category/[slug]/page.js (Server Component)

import Image from 'next/image';
import PocketBase from 'pocketbase';
import Link from 'next/link';
import { useCart } from '@/app/contexts/CartContext'; // Import hook ตะกร้าสินค้า 
import ProductList from './ProductList';

const pb = new PocketBase('http://127.0.0.1:8090');

// ฟังก์ชันสำหรับสร้าง URL ของรูปภาพจาก PocketBase (เหมือนเดิม)
function getProductImageUrl(record, filename) {
    if (!record || !filename) {
        return '/images/placeholder.jpg';
    }
    try {
        return pb.getFileUrl(record, filename, { 'thumb': '100x100' });
    } catch (e) {
        console.error(`Error generating image URL for record ID ${record.id}:`, e);
        return '/images/placeholder.jpg';
    }
}

// รับค่า `params` และ `searchParams` จาก Next.js (เหมือนเดิม)
export default async function CategoryProductsPage({ params, searchParams }) {
    // ... ส่วนโค้ดดึงข้อมูลทั้งหมดจาก PocketBase ยังคงเหมือนเดิมเป๊ะ ...
    const categoryId = params.slug;
    const currentPage = parseInt(searchParams.page) || 1;
    const itemsPerPage = 5;
    let categoryName = '...';
    let products = [];
    let totalPages = 1;
    let error = null;
    try {
        const categoryData = await pb.collection('categories').getOne(categoryId);
        categoryName = categoryData.name;
        const productsData = await pb.collection('products').getList(currentPage, itemsPerPage, {
            filter: `relation = "${categoryId}"`,
            sort: '-created',
        });
        products = productsData.items;
        totalPages = productsData.totalPages;
    } catch (e) {
        error = 'ไม่สามารถโหลดข้อมูลได้';
        console.error("An error occurred on the server:", e);
    }
    
    // ... ส่วนจัดการ error และ "ไม่พบสินค้า" ยังคงเหมือนเดิม ...
    if (error) {
        return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>{error}</div>;
    }
    if (products.length === 0) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>ไม่พบสินค้าในหมวดหมู่นี้</div>;
    }

    // --- 2. เตรียมข้อมูล (product พร้อม imageUrl) ก่อนส่งให้ Client Component ---
    const productsWithImages = products.map(product => ({
        product: product, // ข้อมูลสินค้าทั้งหมด
        imageUrl: getProductImageUrl(product, product.picture) // URL รูปภาพ
    }));

    return (
        <div style={{ padding: '2rem' }}>
            <h1>สินค้าในหมวดหมู่: {categoryName}</h1>
            
            {/* --- 3. เปลี่ยนจาก .map เดิม มาใช้ Component ใหม่ตรงนี้ --- */}
            <ProductList productsWithImages={productsWithImages} />

            {/* ส่วน Pagination ยังคงเหมือนเดิม */}
            <div style={{ marginTop: '20px' }}>
                {/* ... โค้ด Pagination ทั้งหมดของคุณ ... */}
            </div>
        </div>
    );
}