'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import pb from '../lib/pocketbase'; // ตรวจสอบ path ให้ถูกต้อง

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    // 1. ตรวจสอบสถานะล็อกอินเมื่อโหลดหน้าเว็บ
    useEffect(() => {
        if (pb.authStore.isValid) {
            setUser(pb.authStore.model);
        }
    }, []);

    // ✅ ฟังก์ชันล็อกอินด้วย Google (ที่เพิ่มเข้ามาใหม่)
    const loginWithGoogle = async () => {
        try {
            const authData = await pb.collection('users').authWithOAuth2({ provider: 'google' });
            setUser(pb.authStore.model);
            return { success: true, data: authData };
        } catch (error) {
            console.error("Google login failed:", error);
            return { success: false, error: error.message };
        }
    };

    // 2. ฟังก์ชันสำหรับสมัครสมาชิก
    const signup = async (email, password, passwordConfirm, name) => {
        try {
            const data = { email, password, passwordConfirm, name };
            await pb.collection('users').create(data);
            await login(email, password);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    // 3. ฟังก์ชันสำหรับล็อกอิน
    const login = async (email, password) => {
        try {
            await pb.collection('users').authWithPassword(email, password);
            setUser(pb.authStore.model);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    // 4. ฟังก์ชันสำหรับออกจากระบบ
    const logout = () => {
        pb.authStore.clear(); 
        setUser(null);        
    };

    // ✅ ส่ง loginWithGoogle ออกไปให้หน้าอื่นใช้ด้วย
    const value = {
        user,
        signup,
        login,
        logout,
        loginWithGoogle 
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}