'use client';

import { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();
const CART_KEY = 'cart';
const ADDRESS_KEY = 'shippingAddress';

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [address, setAddress] = useState(null);

  // --- โหลดข้อมูล ---
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCart = localStorage.getItem(CART_KEY);
      if (storedCart) {
        
        // --- [แก้ไข] นี่คือจุดที่ผมทำพลาดครับ ---
        const parsedCart = JSON.parse(storedCart);
        
        // 1. "cartWithSelection" ต้องไม่มีเครื่องหมายคำพูด
        const cartWithSelection = parsedCart.map(item => ({
          ...item,
          price: parseFloat(item.price), // 3. [อัปเกรด] แปลง price เป็นตัวเลข
          quantity: parseInt(item.quantity, 10), // 3. [อัปเกรด] แปลง quantity เป็นตัวเลข
          selected: item.selected !== undefined ? item.selected : true,
        }));
        
        // 2. setCartItems ต้องรับตัวแปร (array) ไม่ใช่ string
        setCartItems(cartWithSelection); 
      }
      
      const storedAddress = localStorage.getItem(ADDRESS_KEY);
      if (storedAddress) {
        setAddress(JSON.parse(storedAddress));
      }
    }
  }, []);

  // --- บันทึกตะกร้า (เหมือนเดิม) ---
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
    }
  }, [cartItems]);

  // --- บันทึกที่อยู่ (เหมือนเดิม) ---
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ADDRESS_KEY, JSON.stringify(address));
    }
  }, [address]);


  const saveAddress = (addressData) => {
    setAddress(addressData);
  };

  // --- [อัปเกรด] addToCart ---
  const addToCart = (product) => {
    setCartItems(prevItems => {
      const exist = prevItems.find(item => item.id === product.id);
      const productPrice = parseFloat(product.price); // [อัปเกรด] แปลงราคาทันที

      if (exist) {
        return prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1, selected: true } : item
        );
      }
      // [อัปเกรด] เพิ่ม price ที่แปลงเป็นตัวเลขแล้ว
      return [...prevItems, { ...product, price: productPrice, quantity: 1, selected: true }];
    });
  };

  // --- [อัปเกรด] updateQuantity (เพื่อให้แน่ใจว่าเป็นตัวเลข) ---
  const updateQuantity = (productId, quantity) => {
    const numQuantity = parseInt(quantity, 10); // ใช้ parseInt(..., 10)
    if (isNaN(numQuantity) || numQuantity < 1) return; // [อัปเกรด] เช็ค isNaN ด้วย

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity: numQuantity } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const toggleItemSelection = (productId) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const toggleAllSelection = (select) => {
    setCartItems(prevItems =>
      prevItems.map(item => ({ ...item, selected: select }))
    );
  };

  const removeSelectedItems = () => {
    setCartItems(prevItems => prevItems.filter(item => !item.selected));
  };
  
  const clearCart = () => {
    setCartItems([]);
    setAddress(null); 
  };

  const value = { 
    cartItems, 
    address, 
    saveAddress, 
    addToCart, 
    removeFromCart, 
    updateQuantity, 
    clearCart,
    toggleItemSelection,
    toggleAllSelection,
    removeSelectedItems
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}