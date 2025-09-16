// app/page.js

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import PocketBase from 'pocketbase';
import Banner from './components/Banner'; // นำเข้า Banner component

const pb = new PocketBase('http://127.0.0.1:8090');

function getImageUrl(record, filename) {
    if (!record || !filename) return '/images/placeholder.jpg';
    return pb.getFileUrl(record, filename, { 'thumb': '100x100' });
}

export default function HomePage() {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const result = await pb.collection('categories').getFullList({
                    sort: 'name',
                });
                setCategories(result);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCategories();
    }, []);

    if (isLoading) {
        return <div style={{ textAlign: 'center', padding: '20px' }}>กำลังโหลดหมวดหมู่...</div>;
    }

    return (
        <div style={{ padding: '20px' }}>
            <Banner /> {/* เพิ่ม Banner component ที่นี่ */}
            
            <h1>หมวดหมู่</h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
                {categories.map((category) => (
                    <Link href={`/category/${category.id}`} key={category.id} passHref>
                        <div style={{
                            width: '200px',
                            border: '1px solid #ccc',
                            borderRadius: '10px',
                            padding: '10px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                            transition: 'transform 0.2s',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}>
                            <Image
                                src={getImageUrl(category, category.picture)}
                                alt={category.name}
                                width={100}
                                height={100}
                                objectFit="cover"
                                style={{ borderRadius: '5px' }}
                            />
                            <h2 style={{ fontSize: '1.2rem', marginTop: '10px' }}>{category.name}</h2>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}