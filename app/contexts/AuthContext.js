'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import pb from '../lib/pocketbase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // 1. เริ่มต้น state ทั้งหมดเป็น null หรือ true เพื่อให้ Server และ Client เหมือนกัน
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 2. ใช้ useEffect เพื่อเช็คสถานะล็อกอิน "หลังจาก" ที่หน้าเว็บโหลดเสร็จแล้วเท่านั้น
    // useEffect จะทำงานเฉพาะฝั่ง Client
    
    // ตั้งค่า user state จาก authStore ที่อาจมีอยู่แล้วใน cookie
    setUser(pb.authStore.model);

    // ติดตามการเปลี่ยนแปลงของ authStore (เมื่อมีการ login/logout)
    const unsubscribe = pb.authStore.onChange((token, model) => {
      setUser(model);
    });
    
    // เมื่อเช็คเสร็จแล้ว ให้ตั้งค่า loading เป็น false
    setLoading(false);
    
    // Cleanup function: หยุดติดตามเมื่อ component ถูก unmount
    return () => {
      unsubscribe();
    };
  }, []); // [] หมายถึงให้ทำงานแค่ครั้งเดียวตอนเริ่มต้น
  
  const logout = () => {
    pb.authStore.clear();
  };

  const value = { user, logout, loading };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}