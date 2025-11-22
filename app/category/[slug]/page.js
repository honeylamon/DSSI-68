// app/category/[slug]/page.js

import Link from 'next/link';
import PocketBase from 'pocketbase';
import ProductList from '../../components/ProductList';

export const dynamic = 'force-dynamic';

const pb = new PocketBase('http://127.0.0.1:8090');

function getProductImageUrl(record, filename) {
    if (!record || !filename) {
        return '/placeholder.jpg';
    }
    return pb.files.getURL(record, filename, { 'thumb': '100x100' });
}

export default async function CategoryProductsPage({ params, searchParams }) {
    // ==================== ✅ FIX: ต้อง await ค่า params และ searchParams ก่อน ====================
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;

    const categoryId = resolvedParams.slug;
    const page = resolvedSearchParams['page'] ?? '1';
    const currentPage = parseInt(page, 10);
    // =========================================================================================

    const itemsPerPage = 5;
    let categoryName = 'หมวดหมู่';

    try {
        const [categoryData, productsData] = await Promise.all([
            pb.collection('categories').getOne(categoryId),
            pb.collection('products').getList(currentPage, itemsPerPage, {
                filter: `relation = "${categoryId}"`,
                sort: '-created',
            })
        ]);
        
        categoryName = categoryData.name;
        const products = productsData.items;
        const totalPages = productsData.totalPages;

        if (products.length === 0) {
            return (
                <div style={{ padding: '2rem' }}>
                    <h1>สินค้าในหมวดหมู่: {categoryName}</h1>
                    <div style={{ padding: '4rem', textAlign: 'center', color: '#555' }}>
                        ไม่พบสินค้าในหมวดหมู่นี้
                    </div>
                </div>
            );
        }

        const productsWithImages = products.map(p => ({
            product: p,
            imageUrl: getProductImageUrl(p, p.picture)
        }));

        return (
            <div style={{ padding: '2rem' }}>
                <h1>สินค้าในหมวดหมู่: {categoryName}</h1>
                <ProductList productsWithImages={productsWithImages} />

                {/* Pagination */}
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    {currentPage > 1 && <Link href={`/category/${categoryId}?page=${currentPage - 1}`}>Previous</Link>}
                    <span>Page {currentPage} of {totalPages}</span>
                    {currentPage < totalPages && <Link href={`/category/${categoryId}?page=${currentPage + 1}`}>Next</Link>}
                </div>
            </div>
        );

    } catch (e) {
        console.error("Error fetching data:", e);
        return (
            <div style={{ padding: '2rem' }}>
                 <h1>เกิดข้อผิดพลาด</h1>
                 <div style={{ padding: '4rem', textAlign: 'center', color: 'red' }}>
                    ไม่สามารถโหลดข้อมูลได้ หรือรหัสหมวดหมู่ไม่ถูกต้อง
                 </div>
            </div>
        );
    }
}