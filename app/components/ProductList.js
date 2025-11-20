// app/components/ProductList.js
'use client';

import Image from 'next/image';
// ✅ 1. Import useCart เข้ามาเพื่อเชื่อมต่อกับระบบตะกร้า
import { useCart } from '@/app/contexts/CartContext'; 
import styles from './ProductList.module.css'; // สมมติว่าคุณมีไฟล์ CSS นี้

export default function ProductList({ productsWithImages }) { 
    // ✅ 2. เรียกใช้ฟังก์ชัน addToCart จาก Context
    const { addToCart } = useCart();

    if (!productsWithImages || productsWithImages.length === 0) {
        return <p className={styles.emptyMessage}>ไม่พบสินค้า</p>;
    }
    
    // สร้างฟังก์ชัน handle เพื่อให้โค้ดอ่านง่าย
    const handleAddToCart = (product) => {
        // เรียกใช้ฟังก์ชันจาก Context พร้อมส่งข้อมูลสินค้าทั้งหมดไป
        addToCart(product);
        // แจ้งเตือนผู้ใช้ว่าเพิ่มสินค้าสำเร็จแล้ว
        alert(`เพิ่ม "${product.name}" ลงในตะกร้าแล้ว!`);
    };

    return (
        <div className={styles.productListContainer}> 
            {productsWithImages.map(({ product, imageUrl }) => {
                // เพิ่มการป้องกัน Error หากข้อมูล product ไม่สมบูรณ์
                if (!product) return null;

                return (
                    <div key={product.id} className={styles.productItem}>
                        <div className={styles.imageContainer}>
                            <Image
                                src={imageUrl}
                                alt={product?.name || 'รูปภาพสินค้า'}
                                width={100}
                                height={100}
                                style={{ objectFit: 'cover', borderRadius: '8px' }}
                            />
                        </div>
                        <div className={styles.detailsContainer}>
                            <h3 className={styles.productName}>{product.name}</h3>
                            <p className={styles.productDescription}>
                                {product.description || 'ไม่มีรายละเอียด'}
                            </p>
                        </div>
                        <div className={styles.priceContainer}>
                            <p className={styles.productPrice}>{product.price ?? 0} บาท</p>
                        </div>
                        <div className={styles.actionContainer}>
                            {/* ✅ 3. แก้ไข onClick ให้เรียกใช้ฟังก์ชัน handleAddToCart ที่เราสร้างไว้ */}
                            <button 
                                onClick={() => handleAddToCart(product)} 
                                className={styles.addButton}
                                aria-label={`เพิ่ม ${product.name} ลงในตะกร้า`}
                            >+</button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}