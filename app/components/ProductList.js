'use client';

import Image from 'next/image';
import { useCart } from '@/app/contexts/CartContext'; 

export default function ProductList({ productsWithImages }) { 
    const { addToCart } = useCart();

    if (!productsWithImages || productsWithImages.length === 0) {
        return <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>ไม่พบสินค้า</div>;
    }
    
    const handleAddToCart = (product) => {
        addToCart(product);
        alert(`เพิ่ม "${product.name}" ลงในตะกร้าแล้ว!`);
    };

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', 
            gap: '20px',
            padding: '10px',
            alignItems: 'stretch' // ✅ บังคับให้ทุกกล่องสูงเท่ากัน
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
                        justifyContent: 'space-between', 
                        height: '100%'             // ✅ ยืดเต็มความสูง
                    }}>
                        
                        {/* รูปภาพ (ล็อคความสูง) */}
                        <div style={{ 
                            height: '140px', 
                            width: '100%',
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center',
                            marginBottom: '10px',
                            overflow: 'hidden',
                            position: 'relative'
                        }}>
                            <Image
                                src={imageUrl}
                                alt={product.name}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                style={{ objectFit: 'contain' }}
                            />
                        </div>

                        {/* ชื่อสินค้า (ล็อคความสูง 2 บรรทัด) */}
                        <div style={{ flexGrow: 1, marginBottom: '10px' }}> 
                            <h3 style={{ 
                                fontSize: '1rem', 
                                margin: '0 0 5px 0',
                                height: '2.8em',       // ✅ ล็อคความสูง
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical'
                            }}>
                                {product.name}
                            </h3>
                            <p style={{ 
                                fontSize: '0.85rem', 
                                color: '#666', 
                                margin: 0,
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
                                {product.price ?? 0} บาท
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
                                    transition: '0.2s'
                                }}
                            >
                                + เพิ่ม
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}