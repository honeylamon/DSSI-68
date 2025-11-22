import PocketBase from 'pocketbase';
import ProductList from '@/app/components/ProductList';
import Link from 'next/link';

// บังคับให้โหลดข้อมูลใหม่ทุกครั้งที่มีการค้นหา
export const dynamic = 'force-dynamic';

const pb = new PocketBase('http://127.0.0.1:8090');

// ฟังก์ชันช่วยดึงรูปภาพ
function getProductImageUrl(record, filename) {
    if (!record || !filename) return '/placeholder.jpg';
    return pb.files.getURL(record, filename, { 'thumb': '100x100' });
}

export default async function SearchPage({ searchParams }) {
    // ✅ แก้ไขตรงนี้: ต้อง await searchParams ก่อนใช้งาน (สำหรับ Next.js 15)
    const resolvedSearchParams = await searchParams;
    const query = resolvedSearchParams.q || '';

    // ถ้าไม่มีคำค้นหา ให้แสดงข้อความแจ้งเตือน
    if (!query) {
        return (
            <div style={{ padding: '50px', textAlign: 'center' }}>
                <h2>กรุณาพิมพ์คำค้นหา</h2>
                <Link href="/" style={{ color: 'blue', textDecoration: 'underline' }}>กลับหน้าแรก</Link>
            </div>
        );
    }

    try {
        // 2. ค้นหาใน PocketBase (ฟิลเตอร์ชื่อสินค้าที่มีคำนี้อยู่)
        const result = await pb.collection('products').getList(1, 50, {
            filter: `name ~ "${query}"`, 
            sort: '-created',
        });

        // 3. จัดเตรียมข้อมูลรูปภาพ
        const products = result.items.map(p => ({
            product: p,
            imageUrl: getProductImageUrl(p, p.picture)
        }));

        return (
            <div style={{ padding: '2rem' }}>
                <h1 style={{ marginBottom: '20px' }}>ผลการค้นหา: "{query}"</h1>
                <p style={{ color: '#666', marginBottom: '20px' }}>
                    พบสินค้า {products.length} รายการ
                </p>
                
                <ProductList productsWithImages={products} />
                
                {products.length === 0 && (
                    <div style={{ marginTop: '40px', textAlign: 'center' }}>
                        <p style={{ fontSize: '1.2rem', color: '#888' }}>ไม่พบสินค้าที่ค้นหา ลองใช้คำอื่นดูนะครับ</p>
                        <Link href="/" style={{ color: 'blue', textDecoration: 'underline', marginTop: '10px', display: 'inline-block' }}>
                            กลับไปเลือกสินค้าหน้าแรก
                        </Link>
                    </div>
                )}
            </div>
        );

    } catch (error) {
        console.error("Search error:", error);
        return (
            <div style={{ padding: '50px', textAlign: 'center', color: 'red' }}>
                <h2>เกิดข้อผิดพลาดในการค้นหา</h2>
                <p>กรุณาลองใหม่อีกครั้ง</p>
            </div>
        );
    }
}