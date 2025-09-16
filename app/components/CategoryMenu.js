'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import pb from '../lib/pocketbase';

// ฟังก์ชันสำหรับสร้าง URL ของรูปภาพ
function getCategoryImageUrl(record, filename) {
    if (!record || !filename) return '/placeholder.png'; // รูปสำรอง
    return pb.files.getUrl(record, filename, { thumb: '150x150' });
}

export default function CategoryMenu() {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const records = await pb.collection('categories').getFullList({ sort: 'created' });
                setCategories(records);
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            }
        };
        fetchCategories();
    }, []);

    return (
        <div style={{ padding: '2rem 1rem', backgroundColor: '#fff', textAlign: 'center' }}>
            <h2 style={{ marginBottom: '2rem', fontSize: '2rem' }}>หมวดหมู่</h2>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: '20px', 
                flexWrap: 'wrap' 
            }}>
                {/* เพิ่มลิงก์สำหรับ "สินค้าทั้งหมด" */}
                <Link href="/" style={{ textDecoration: 'none', color: 'black' }}>
                    <div style={{ 
                        border: '1px solid #ddd', 
                        borderRadius: '8px', 
                        padding: '10px', 
                        width: '150px', 
                        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '166px' // ความสูงเท่ากับการ์ดอื่น
                    }}>
                        <span style={{ fontWeight: 'bold' }}>สินค้าทั้งหมด</span>
                    </div>
                </Link>

                {categories.map(category => (
                    <Link key={category.id} href={`/category/${encodeURIComponent(category.name)}`} style={{ textDecoration: 'none', color: 'black' }}>
                        <div style={{ 
                            border: '1px solid #ddd', 
                            borderRadius: '8px', 
                            padding: '10px', 
                            width: '150px', 
                            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                            transition: 'transform 0.2s'
                        }}
                        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <div style={{ position: 'relative', width: '100%', height: '120px' }}>
                                <Image
                                    src={getCategoryImageUrl(category, category.category_image)}
                                    alt={category.name}
                                    layout="fill"
                                    objectFit="cover"
                                    style={{ borderRadius: '4px' }}
                                />
                            </div>
                            <span style={{ display: 'block', marginTop: '10px', fontWeight: 'bold' }}>
                                {category.name}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}