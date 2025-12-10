'use client';

import Link from 'next/link';
import { useCart } from '@/app/contexts/CartContext';
import { useAuth } from '@/app/contexts/AuthContext'; 
import styles from './Header.module.css';
import AdminLink from './AdminLink'; 
import SearchBar from './SearchBar'; 

export default function Header() {
    const { cart } = useCart();
    const { user, logout } = useAuth(); 

    const totalItems = Array.isArray(cart)
        ? cart.reduce((sum, item) => sum + item.quantity, 0)
        : 0;

    const handleLogout = () => {
        logout();
        alert('ออกจากระบบสำเร็จ');
    };

    return (
        <header className={styles.mainHeader}>
            <div className={styles.logoContainer}>
                 <Link href="/" className={styles.logoLink}>Baan Joy</Link>
            </div>

            <div className={styles.searchContainer}>
                 <SearchBar /> 
            </div>

            <div className={styles.actionsContainer}>
                {/* ลิงก์ตะกร้าสินค้า */}
                <Link href="/cart" className={styles.cartLink}>ตะกร้า ({totalItems})</Link>

                {user ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        
                        {/* ✅ NEW: ปุ่ม/ไอคอน PROFILE สำหรับผู้ใช้ที่ล็อกอินแล้ว */}
                        <Link href="/profile" className={styles.profileLink}>
                            <div className={styles.profileIcon} title={`โปรไฟล์ของ ${user.name || user.username}`}>
                                <span>👤</span> 
                            </div>
                        </Link>
                        
                        {/* ปุ่ม Admin (จะแสดงเฉพาะ Admin เท่านั้น ตาม logic ใน AdminLink.js) */}
                        <AdminLink /> 
                        
                        {/* ปุ่ม Logout */}
                        <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
                    </div>
                ) : (
                    // ถ้ายังไม่ได้ล็อกอิน ให้แสดงปุ่ม Sign In
                    <Link href="/signin" className={styles.profileLink}>
                        <div className={styles.profileIcon} title="เข้าสู่ระบบ">
                            <span>👤</span>
                        </div>
                    </Link>
                )}
            </div>
        </header>
    );
}