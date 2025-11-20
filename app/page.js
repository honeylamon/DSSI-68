'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import PocketBase from 'pocketbase';
import Banner from './components/Banner'; // นำเข้า Banner component
import styles from './HomePage.module.css'; // หน้าแรก ต้อง import ไฟล์นี้

// ตรวจสอบว่า IP นี้ถูกต้อง
const pb = new PocketBase('http://127.0.0.1:8090');

function getImageUrl(record, filename) {
    if (!record || !filename) {
        return '/bander.jpg'; // ต้องมีรูปนี้ใน public/placeholder.jpg
    }
    try {
        return pb.getFileUrl(record, filename, { 'thumb': '200x200' });
    } catch (e) {
        console.error('Error getting file URL:', e);
        return '/placeholder.jpg';
    }
}

export default function HomePage() {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        const fetchCategories = async () => {
            try {
                const result = await pb.collection('categories').getFullList({
                    sort: 'name',
                    signal: signal,
                });
                setCategories(result);
            } catch (error) {
                if (!error.isAbort) {
                    console.error('Failed to fetch categories:', error);
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchCategories();

        return () => {
            controller.abort();
        };
    }, []);

    if (isLoading) {
        return <div style={{ textAlign: 'center', padding: '20px' }}>กำลังโหลดหมวดหมู่...</div>;
    }

    return (
        <div>
            <Banner />

            <div className={styles.homeContainer}>
                <h1 className={styles.title}>หมวดหมู่สินค้า</h1>
                <div className={styles.categoryGrid}>
                    {categories.map((category) => (
                        <Link href={`/category/${category.id}`} key={category.id} passHref>
                            <div className={styles.categoryCard}>
                                <div className={styles.categoryImageWrapper}>
                                  <Image
                                      src={getImageUrl(category, category.image)}
                                      alt={category.name}
                                      width={150}
                                      height={150}
                                      objectFit="cover"
                                  />
                                </div>
                                <h2 className={styles.categoryName}>{category.name}</h2>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}