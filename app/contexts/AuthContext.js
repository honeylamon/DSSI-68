'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import pb from '../lib/pocketbase'; // ตรวจสอบ path ให้ถูกต้อง (ปกติคือ ../lib/pocketbase)

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    // 1. ตรวจสอบสถานะล็อกอินเมื่อโหลดหน้าเว็บ
    useEffect(() => {
        // ถ้ามีข้อมูลใน LocalStorage ของ PocketBase ให้ดึงมาใช้ได้เลย
        if (pb.authStore.isValid) {
            setUser(pb.authStore.model);
        }
    }, []);

    // 2. ฟังก์ชันสำหรับสมัครสมาชิก
    const signup = async (email, password, passwordConfirm, name) => {
        // สร้าง object ข้อมูล
        const data = {
            email,
            password,
            passwordConfirm,
            name,
        };
        
        // ส่งคำขอสร้าง user (ถ้า error จะ throw ออกไปให้หน้าเว็บจัดการ)
        await pb.collection('users').create(data);
        
        // สมัครเสร็จแล้ว ล็อกอินให้อัตโนมัติเลย
        await login(email, password);
    };

    // 3. ฟังก์ชันสำหรับล็อกอิน (ตัวสำคัญที่แก้ปัญหา login is not a function)
    const login = async (email, password) => {
        // ส่งคำขอล็อกอิน
        await pb.collection('users').authWithPassword(email, password);
        
        // ถ้าล็อกอินผ่าน บรรทัดนี้จะทำงาน: อัปเดตสถานะ User
        setUser(pb.authStore.model);
    };

    // 4. ฟังก์ชันสำหรับออกจากระบบ
    const logout = () => {
        pb.authStore.clear(); // ล้างข้อมูลใน PocketBase
        setUser(null);        // ล้างข้อมูลใน State
    };

    // ส่งตัวแปรและฟังก์ชันทั้งหมดออกไปให้หน้าอื่นใช้
    return (
        <AuthContext.Provider value={{ user, signup, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom Hook เพื่อให้เรียกใช้ได้ง่ายๆ เช่น const { login } = useAuth();
export function useAuth() {
    return useContext(AuthContext);
}