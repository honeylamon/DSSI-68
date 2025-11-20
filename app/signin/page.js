// src/app/signin/page.js
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import pb from '../lib/pocketbase';
import { useAuth } from '@/app/contexts/AuthContext';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // ฟังก์ชันสำหรับล็อกอินด้วย Email/Password
    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            // 1. ส่งข้อมูลไปล็อกอิน
            await login(email, password);
            
            // 2. ไม่ว่าจะเป็นใคร (Admin หรือ ลูกค้า) ให้กลับไปหน้าแรกเหมือนกันหมด
            router.push('/');

        } catch (error) {
            alert(`Login failed: ${error.message}`);
        }
    };

    // ฟังก์ชันสำหรับล็อกอินด้วย Facebook
    const handleFacebookLogin = async () => {
        try {
            await pb.collection('users').authWithOAuth2({ provider: 'facebook' });
            router.push('/');
        } catch (error) {
            alert(`Facebook login failed: ${error.message}`);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>เข้าสู่ระบบ</h2>
            <form onSubmit={handleLogin}>
                <div style={{ marginBottom: '15px' }}>
                    <label>Email</label>
                    <input 
                        type="email" 
                        required 
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>Password</label>
                    <input 
                        type="password" 
                        required 
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#3B82F6', color: 'white', border: 'none', borderRadius: '5px' }}>
                    Login
                </button>
            </form>
            <hr style={{ margin: '20px 0' }} />
            <button onClick={handleFacebookLogin} style={{ width: '100%', padding: '10px', backgroundColor: '#1877F2', color: 'white', border: 'none', borderRadius: '5px', marginBottom: '15px' }}>
                Login with Facebook
            </button>
            <p>
                Don't have an account? <Link href="/signup" style={{ color: '#3B82F6' }}>Sign up</Link>
            </p>
        </div>
    );
}