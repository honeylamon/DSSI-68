'use client';

import Image from 'next/image';
import { useCart } from '@/app/contexts/CartContext'; 

export default function ProductList({ productsWithImages }) { 
    const { addToCart } = useCart();

    if (!productsWithImages || productsWithImages.length === 0) {
        return <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>ไม่พบสินค้า</div>;
    }
    
    const handleAddToCart = (product) => {
        // ✅ ป้องกันการกดเพิ่มลงตะกร้าถ้าสินค้าหมด
        if (product.stock <= 0) return;

        const itemToAdd = {
            ...product,
            picture: product.picture || product.image, 
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

                // ✅ เช็คสถานะสินค้าหมด (Stock <= 0)
                const isSoldOut = product.stock <= 0;

                return (
                    <div key={product.id} style={{
                        border: '1px solid #e0e0e0',
                        borderRadius: '12px',
                        padding: '15px',
                        backgroundColor: '#fff',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        opacity: isSoldOut ? 0.8 : 1 // ทำให้กล่องดูจางลงเล็กน้อยถ้าของหมด
                    }}>
                        {/* ส่วนรูปภาพ */}
                        <div style={{ 
                            position: 'relative', 
                            width: '100%', 
                            paddingTop: '100%', 
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
                                        objectFit: 'cover',
                                        opacity: isSoldOut ? 0.5 : 1 // ✅ ถ้าหมดให้รูปจางลงเพื่อให้ข้อความชัดขึ้น
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

                            {/* ✅ เพิ่ม Overlay "สินค้าหมด" ทับรูปภาพ */}
                            {isSoldOut && (
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    backgroundColor: 'rgba(0,0,0,0.5)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 2
                                }}>
                                    <span style={{
                                        backgroundColor: '#ef4444',
                                        color: 'white',
                                        padding: '5px 12px',
                                        borderRadius: '4px',
                                        fontWeight: 'bold',
                                        fontSize: '0.9rem'
                                    }}>
                                        สินค้าหมด
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* ข้อมูลสินค้า */}
                        <div style={{ marginBottom: '10px' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '0 0 5px 0', color: isSoldOut ? '#999' : '#333' }}>
                                {product.name}
                            </h3>
                            <p style={{ 
                                margin: 0, 
                                color: isSoldOut ? '#ccc' : '#666', 
                                fontSize: '0.9rem',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {product.description || '-'}
                            </p>
                        </div>

                        {/* ปุ่มกด */}
                        <div style={{ marginTop: 'auto' }}>
                            <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: isSoldOut ? '#ccc' : '#3e594b', marginBottom: '10px' }}>
                                {product.price ? product.price.toLocaleString() : 0} บาท
                            </p>
                            <button 
                                onClick={() => handleAddToCart(product)} 
                                disabled={isSoldOut} // ✅ ปิดการทำงานปุ่มถ้าสินค้าหมด
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    backgroundColor: isSoldOut ? '#9ca3af' : '#3e594b', // ✅ เปลี่ยนสีปุ่มเป็นสีเทาถ้าของหมด
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: isSoldOut ? 'not-allowed' : 'pointer',
                                    transition: '0.2s',
                                    fontWeight: 'bold'
                                }}
                            >
                                {isSoldOut ? 'สินค้าหมด' : '+ เพิ่มลงตะกร้า'}
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}