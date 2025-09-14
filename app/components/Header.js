'use client'; // กำหนดให้เป็น Client Component เพื่อใช้ hook และ event ต่างๆ ในอนาคต
import Link from 'next/link';
import styles from './Header.module.css';

// เราสามารถเพิ่ม Logic การ Login ตรงนี้ได้ในอนาคต
export default function Header() {
  const handleLoginClick = () => {
    // ในอนาคตจะเปลี่ยนเป็นการเปิด Modal Login
    alert('ส่วนนี้จะเชื่อมต่อกับระบบ Login ครับ');
  };

  return (
    <header className={styles.header}>
      {/* คลิกที่โลโก้เพื่อกลับไปหน้าแรก */}
      <Link href="/" className={styles.logo}>
        Baan joy
      </Link>

      <div className={styles.searchBar}>
        <input type="text" placeholder="ค้นหาสินค้า..." />
        <button className={styles.cameraButton}>📷</button>
      </div>

      <div className={styles.profileIcon} onClick={handleLoginClick}>
        <span>👤</span>
      </div>
    </header>
  );
}
