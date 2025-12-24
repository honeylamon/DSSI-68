'use client';

import Image from 'next/image';
import { useCart } from '@/app/contexts/CartContext'; 

export default function ProductList({ productsWithImages }) { 
    const { addToCart } = useCart();

    if (!productsWithImages || productsWithImages.length === 0) {
        return <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>ไม่พบสินค้า</div>;
    }
    
    const handleAddToCart = (product) => {
        // ✅ ตรวจสอบข้อมูลก่อนส่งเข้าตะกร้า (Debug)
        console.log("Adding product to cart:", product);

        // ✅ สร้าง Object สินค้าใหม่ เพื่อให้แน่ใจว่ามีข้อมูลครบถ้วน โดยเฉพาะรูปภาพ
        const itemToAdd = {
            ...product, // ดึงข้อมูลเดิมมาทั้งหมด (id, name, price)
            
            // ✅ บังคับส่งชื่อไฟล์รูปภาพ (ใช้ picture ตาม Database ของคุณ)
            picture: product.picture || product.image, 
            
            // ✅ บังคับส่ง collectionId (จำเป็นสำหรับสร้าง URL รูปภาพ)
            collectionId: product.collectionId || 'products'
        };

        addToCart(itemToAdd);
        alert(`เพิ่ม "${product.name}" ลงในตะกร้าแล้ว!`);
    };

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', 
            gap: '20px',
            padding: '10px',
            alignItems: 'stretch'
        }}> 
            {productsWithImages.map(({ product, imageUrl }) => {
                if (!product) return null;

                return (
                    <div key={product.id} style={{
                        border: '1px solid #e0e0e0',
                        borderRadius: '12px',
                        padding: '15px',
                        backgroundColor: '#fff',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                    }}>
                        {/* ส่วนรูปภาพ */}
                        <div style={{ 
                            position: 'relative', 
                            width: '100%', 
                            paddingTop: '100%', // อัตราส่วน 1:1
                            marginBottom: '10px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            backgroundColor: '#f9f9f9'
                        }}>
                            {imageUrl ? (
                                <img 
                                    src={imageUrl} 
                                    alt={product.name}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />
                            ) : (
                                <div style={{
                                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc'
                                }}>
                                    No Image
                                </div>
                            )}
                        </div>

                        {/* ข้อมูลสินค้า */}
                        <div style={{ marginBottom: '10px' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '0 0 5px 0', color: '#333' }}>
                                {product.name}
                            </h3>
                            <p style={{ 
                                margin: 0, 
                                color: '#666', 
                                fontSize: '0.9rem',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {product.description || '-'}
                            </p>
                        </div>

                        {/* ปุ่มกด (ดันลงล่างสุด) */}
                        <div style={{ marginTop: 'auto' }}>
                            <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#3e594b', marginBottom: '10px' }}>
                                {product.price ? product.price.toLocaleString() : 0} บาท
                            </p>
                            <button 
                                onClick={() => handleAddToCart(product)} 
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    backgroundColor: '#3e594b',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    transition: '0.2s',
                                    fontWeight: 'bold'
                                }}
                            >
                                + เพิ่มลงตะกร้า
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}