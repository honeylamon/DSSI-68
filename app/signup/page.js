'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import pb from '../lib/pocketbase';

export default function SignupPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');

    const handleSignUp = async (e) => {
        e.preventDefault();

        try {
            // ข้อมูลสำหรับสร้างผู้ใช้ใหม่
            const data = {
                name: name,
                email: email,
                password: password,
                passwordConfirm: passwordConfirm,
            };

            // สร้างผู้ใช้ใน PocketBase
            await pb.collection('users').create(data);
            
            alert('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
            
            // ไปยังหน้าเข้าสู่ระบบหลังสมัครเสร็จ
            router.push('/signin');

        } catch (error) {
            alert(`สมัครสมาชิกไม่สำเร็จ: ${error.message}`);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>สมัครสมาชิก</h2>
            <form onSubmit={handleSignUp}>
                <div style={{ marginBottom: '15px' }}>
                    <label>ชื่อ</label>
                    <input 
                        type="text" 
                        required 
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>อีเมล</label>
                    <input 
                        type="email" 
                        required 
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>รหัสผ่าน</label>
                    <input 
                        type="password" 
                        required 
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>ยืนยันรหัสผ่าน</label>
                    <input 
                        type="password" 
                        required 
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                    />
                </div>
                <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#3B82F6', color: 'white', border: 'none', borderRadius: '5px' }}>
                    สมัครสมาชิก
                </button>
            </form>
            <p style={{ marginTop: '15px' }}>
                มีบัญชีอยู่แล้วใช่ไหม? <Link href="/signin" style={{ color: '#3B82F6' }}>เข้าสู่ระบบ</Link>
            </p>
        </div>
    );
}