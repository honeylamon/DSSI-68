// ในไฟล์ app/page.js
// ... import อื่นๆ ...
import Link from 'next/link'; // อย่าลืม import Link

// ... ในฟังก์ชัน HomePage() ...

// เพิ่ม state นี้เข้าไปด้านบนสุดของฟังก์ชัน
const [isLoggedIn, setIsLoggedIn] = useState(false); 
const [user, setUser] = useState(null);

// เพิ่ม useEffect นี้เข้าไป
useEffect(() => {
  setIsLoggedIn(pb.authStore.isValid);
  setUser(pb.authStore.model);
  
  const unsubscribe = pb.authStore.onChange(() => {
    setIsLoggedIn(pb.authStore.isValid);
    setUser(pb.authStore.model);
  });

  return () => unsubscribe();
}, []);


// ... ในส่วน return (...) ...
// หา <header> แล้วเพิ่มปุ่ม Admin เข้าไป

<header className={styles.header}>
  <div className={styles.logo}>Baan joy</div>
  {/* ... ส่วน search ... */}
  <div className={styles.authControls}>
    {isLoggedIn ? (
      <>
        <span className={styles.welcomeText}>สวัสดี, {user?.email}</span>
        <Link href="/admin" className={styles.adminButton}>จัดการร้านค้า</Link>
        {/* เพิ่มปุ่ม Logout ตรงนี้ได้ถ้าต้องการ */}
      </>
    ) : (
      <div className={styles.profileIcon}>
        <span>👤</span>
      </div>
    )}
  </div>
</header>



