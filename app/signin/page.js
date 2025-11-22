'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext'; // ต้องมีบรรทัดนี้

export default function LoginPage() {
    const router = useRouter();
    
    // 1. ดึง loginWithGoogle มาจาก AuthContext
    const { login, loginWithGoogle } = useAuth(); 
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // ฟังก์ชันล็อกอินปกติ
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const result = await login(email, password);
            if (result.success) {
                router.push('/');
            } else {
                setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    // ✅ 2. นี่คือฟังก์ชันที่หายไปครับ! (ต้องเพิ่มตรงนี้)
    const handleGoogleLogin = async () => {
        try {
            const result = await loginWithGoogle(); // เรียกใช้ฟังก์ชันจาก Context
            if (result.success) {
                router.push('/'); // ล็อกอินสำเร็จ ไปหน้าแรก
            } else {
                setError('การเชื่อมต่อกับ Google ล้มเหลว');
            }
        } catch (err) {
            setError(`Google login error: ${err.message}`);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>เข้าสู่ระบบ</h2>
            
            <form onSubmit={handleLogin}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#666' }}>Email</label>
                    <input 
                        type="email" 
                        required 
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#666' }}>Password</label>
                    <input 
                        type="password" 
                        required 
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                
                {error && <p style={{ color: 'red', marginBottom: '15px', fontSize: '0.9em', textAlign: 'center' }}>{error}</p>}

                <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#3e594b', color: 'white', border: 'none', borderRadius: '6px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}>
                    เข้าสู่ระบบ
                </button>
            </form>
            
            <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', color: '#888' }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#ddd' }}></div>
                <span style={{ padding: '0 10px', fontSize: '0.9rem' }}>หรือ</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#ddd' }}></div>
            </div>

            {/* ปุ่ม Google เรียกใช้ handleGoogleLogin */}
            <button 
                onClick={handleGoogleLogin} 
                style={{ 
                    width: '100%', 
                    padding: '12px', 
                    backgroundColor: 'white', 
                    color: '#333', 
                    border: '1px solid #ccc', 
                    borderRadius: '6px', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '10px',
                    fontWeight: '500'
                }}
            >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width="20" height="20" />
                เข้าสู่ระบบด้วย Google
            </button>

            <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem', color: '#666' }}>
                ยังไม่มีบัญชี? <Link href="/signup" style={{ color: '#3e594b', fontWeight: 'bold' }}>สมัครสมาชิก</Link>
            </p>
        </div>
    );
}