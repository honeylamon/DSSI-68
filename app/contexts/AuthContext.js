'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import pb from '../lib/pocketbase'; // ตรวจสอบ path ให้ถูกต้อง

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true); 

    useEffect(() => {
        // ใช้ pb.authStore.onChange เพื่อฟังการเปลี่ยนแปลงสถานะและตรวจสอบสถานะเริ่มต้น
        const unsubscribe = pb.authStore.onChange((token, model) => {
            if (model) {
                setUser(model);
                // Log: ยืนยันว่าล็อกอิน
                console.log("AuthContext: User is logged in. ID:", model.id.substring(0, 8) + '...');
            } else {
                setUser(null);
                // Log: ยืนยันว่าไม่ได้ล็อกอิน
                console.log("AuthContext: User is logged out.");
            }
            // สำคัญ: ตั้งค่า isLoading เป็น false เสมอเมื่อตรวจสอบเสร็จสิ้นแล้ว
            setIsLoading(false); 
        }, true); 

        return () => {
            unsubscribe();
        };
    }, []);

    const loginWithGoogle = async () => {
        try {
            await pb.collection('users').authWithOAuth2({ provider: 'google' });
            return { success: true };
        } catch (error) {
            console.error("Google login failed:", error);
            return { success: false, error: error.message };
        }
    };

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

    const login = async (email, password) => {
        try {
            await pb.collection('users').authWithPassword(email, password);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const logout = () => {
        pb.authStore.clear(); 
    };

    const value = {
        user,
        isLoading, 
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

export const useAuth = () => {
    return useContext(AuthContext);
};