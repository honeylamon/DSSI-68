'use client';

import Link from 'next/link';
import { useCart } from '@/app/contexts/CartContext';
import { useAuth } from '@/app/contexts/AuthContext'; 
import styles from './Header.module.css';
import AdminLink from './AdminLink'; 
import SearchBar from './SearchBar'; // 👈 1. ต้องมีบรรทัดนี้ (นำเข้า SearchBar)

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

            {/* ✅ 2. เปลี่ยนจาก <input> ธรรมดา เป็น <SearchBar /> ตรงนี้ครับ */}
            <div className={styles.searchContainer}>
                 <SearchBar /> 
            </div>

            <div className={styles.actionsContainer}>
                <Link href="/cart" className={styles.cartLink}>ตะกร้า ({totalItems})</Link>

                {user ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className={styles.welcomeText}>Welcome, {user.name}</span>
                        <AdminLink /> 
                        <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
                    </div>
                ) : (
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