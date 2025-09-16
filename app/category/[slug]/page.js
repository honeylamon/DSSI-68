// app/category/[slug]/page.js (Server Component)

import Image from 'next/image';
import PocketBase from 'pocketbase';
import Link from 'next/link';

const pb = new PocketBase('http://127.0.0.1:8090');

// ฟังก์ชันสำหรับสร้าง URL ของรูปภาพจาก PocketBase
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

// รับค่า `params` และ `searchParams` จาก Next.js
export default async function CategoryProductsPage({ params, searchParams }) {
    const categoryId = params.slug;
    const currentPage = parseInt(searchParams.page) || 1; // ดึงหมายเลขหน้าจาก URL ถ้าไม่มีให้เป็นหน้า 1

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

    if (error) {
        return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>{error}</div>;
    }

    if (products.length === 0) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>ไม่พบสินค้าในหมวดหมู่นี้</div>;
    }

    return (
        <div style={{ padding: '2rem' }}>
            <h1>สินค้าในหมวดหมู่: {categoryName}</h1>
            <ul>
                {products.map((product) => (
                    <li key={product.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                        <div style={{ position: 'relative', width: '100px', height: '100px', marginRight: '15px', flexShrink: 0 }}>
                            <Image
                                src={getProductImageUrl(product, product.picture)}
                                alt={product.name}
                                width={100}
                                height={100}
                                objectFit="cover"
                                style={{ borderRadius: '5px' }}
                            />
                        </div>
                        <div>
                            <h2>{product.name}</h2>
                            <p>ราคา: {product.price} บาท</p>
                            <p>คงเหลือ: {product.stock} {product.unit}</p>
                        </div>
                    </li>
                ))}
            </ul>

            {/* ส่วน Pagination */}
            <div style={{ marginTop: '20px' }}>
                <span>หน้า: </span>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Link
                        key={page}
                        href={`/category/${categoryId}?page=${page}`}
                        passHref
                        style={{
                            margin: '0 5px',
                            padding: '8px 12px',
                            border: `1px solid ${page === currentPage ? '#0070f3' : '#ccc'}`,
                            borderRadius: '5px',
                            backgroundColor: page === currentPage ? '#0070f3' : '#fff',
                            color: page === currentPage ? '#fff' : '#000',
                            textDecoration: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        {page}
                    </Link>
                ))}
            </div>
        </div>
    );
}