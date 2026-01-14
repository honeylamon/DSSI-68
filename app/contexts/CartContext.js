// app/contexts/CartContext.js
'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cart, setCart] = useState([]);

    // 1. โหลดข้อมูลจาก LocalStorage ตอนเริ่ม
    useEffect(() => {
        try {
            const storedCart = localStorage.getItem('my-cart'); // ใช้ key เดิมของคุณ 'my-cart'
            if (storedCart) {
                setCart(JSON.parse(storedCart));
            }
        } catch (error) {
            console.error("Failed to parse cart from localStorage", error);
        }
    }, []);

    // 2. บันทึกลง LocalStorage ทุกครั้งที่ cart เปลี่ยน
    useEffect(() => {
        // บันทึกเฉพาะเมื่อมีการโหลดข้อมูลเสร็จแล้ว หรือมีการเปลี่ยนแปลง
        localStorage.setItem('my-cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);

            if (existingItem) {
                return prevCart.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                return [...prevCart, { ...product, quantity: 1 }];
            }
        });
    };

    const removeFromCart = (productId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(productId);
            return;
        }
        setCart(prevCart =>
            prevCart.map(item =>
                item.id === productId ? { ...item, quantity: newQuantity } : item
            )
        );
    };

    // ✅✅ 3. เพิ่มฟังก์ชันนี้สำหรับล้างตะกร้า
    const clearCart = () => {
        setCart([]); // ล้าง state
        localStorage.removeItem('my-cart'); // ล้างใน LocalStorage ด้วย
    };

    const value = {
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart // ✅✅ 4. ส่งออกฟังก์ชันนี้ไปให้หน้าอื่นใช้
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}