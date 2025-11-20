// app/contexts/CartContext.js
'use client';

import { createContext, useContext, useState, useEffect } from 'react';

// 1. สร้าง Context
const CartContext = createContext();

export function CartProvider({ children }) {
    const [cart, setCart] = useState([]);

    // 2. เมื่อเปิดเว็บครั้งแรก ให้ดึงข้อมูลตะกร้าที่เคยบันทึกไว้ (ถ้ามี)
    useEffect(() => {
        try {
            const storedCart = localStorage.getItem('my-cart');
            if (storedCart) {
                setCart(JSON.parse(storedCart));
            }
        } catch (error) {
            console.error("Failed to parse cart from localStorage", error);
        }
    }, []);

    // ==================== ✅ FIX HERE / นี่คือส่วนที่สำคัญที่สุดที่หายไป ====================
    // 3. ทุกครั้งที่ state 'cart' มีการเปลี่ยนแปลง ให้บันทึกข้อมูลใหม่ลงไป
    useEffect(() => {
        // ไม่ต้องบันทึกถ้าเป็น state เริ่มต้นที่ยังเป็น array ว่าง
        if (cart.length > 0 || localStorage.getItem('my-cart')) {
             localStorage.setItem('my-cart', JSON.stringify(cart));
        }
    }, [cart]);
    // =================================================================================

    // 4. Logic การเพิ่มสินค้า (อันนี้ถูกต้องอยู่แล้ว แต่ใส่ไว้เพื่อความสมบูรณ์)
    const addToCart = (product) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);

            if (existingItem) {
                // ถ้ามีของอยู่แล้ว ให้อัปเดตจำนวน +1
                return prevCart.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                // ถ้ายังไม่มี ให้เพิ่มเข้าไปใหม่ และกำหนดจำนวนเป็น 1
                return [...prevCart, { ...product, quantity: 1 }];
            }
        });
    };

    // (เพิ่มเติม) Logic การลบและอัปเดตจำนวน
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

    const value = {
        cart,
        addToCart,
        removeFromCart,
        updateQuantity
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}

// 5. Custom Hook เพื่อง่ายต่อการเรียกใช้
export function useCart() {
    return useContext(CartContext);
}