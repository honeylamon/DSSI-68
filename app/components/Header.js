'use client';

import Link from 'next/link';
import { useCart } from '@/app/contexts/CartContext';
import { useAuth } from '@/app/contexts/AuthContext'; 
import styles from './Header.module.css';
import AdminLink from './AdminLink'; // ✅ 1. Import มาแล้ว

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
                 <input type="text" placeholder="ค้นหาสินค้า..." className={styles.searchInput}/>
            </div>

            <div className={styles.actionsContainer}>
                <Link href="/cart" className={styles.cartLink}>ตะกร้า ({totalItems})</Link>

                {user ? (
                    // ✅ ถ้าล็อกอินแล้ว
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className={styles.welcomeText}>Welcome, {user.name}</span>
                        
                        {/* 👇 2. วางปุ่ม AdminLink ตรงนี้ครับ */}
                        <AdminLink /> 

                        <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
                    </div>
                ) : (
                    // ❌ ถ้ายังไม่ล็อกอิน
                    <Link href="/signin" className={styles.profileLink}>
                        <div className={styles.profileIcon}>
                            <span>👤</span>
                        </div>
                    </Link>
                )}
            </div>
        </header>
    );
}