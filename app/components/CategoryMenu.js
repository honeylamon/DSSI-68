// app/components/CategoryMenu.js
import Image from 'next/image';
import styles from './CategoryMenu.module.css';

// 1. เปลี่ยนโครงสร้างข้อมูลให้มีรูปภาพด้วย
const categories = [
  { name: 'ผักผลไม้', image: '/images/veg.jpg' },         // <-- แก้ชื่อไฟล์
  { name: 'เนื้อสัตว์', image: '/images/meet.jpg' },        // <-- แก้ชื่อไฟล์
  { name: 'เครื่องดื่ม', image: '/images/drinks.jpg' },     // <-- แก้ชื่อไฟล์
  { name: 'อาหารแช่แข็ง', image: '/images/frozen.jpg' },  // <-- แก้ชื่อไฟล์
  { name: 'อาหารแห้ง', image: '/images/1.-บะหมี่กึ่งสำเร็จรูป.webp' },       // <-- แก้ชื่อไฟล์
  { name: 'เครื่องปรุงและส่วนผสม', image: '/images/เครื่องปรุง.jpg' },
  { name: 'คำสั่งซื้อของฉัน', image: '/images/box.png' }  // <-- แก้ชื่อไฟล์
];

const CategoryMenu = () => {
  return (
    <div className={styles.categorySection}>
      <h2 className={styles.title}>หมวดหมู่</h2>
      <div className={styles.categoryGrid}>
        {categories.map((category) => (
          <div key={category.name} className={styles.categoryCard}>
            {/* 2. เพิ่ม Component Image เข้าไป */}
            <div style={{ position: 'relative', width: '100%', height: '80px' }}>

              <Image
                src={category.image}
                alt={category.name}
                layout="fill"
                objectFit="cover"
                style={{ borderRadius: '5px' }}
              />
            </div>
            <span style={{ marginTop: '10px', display: 'inline-block' }}>
              {category.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryMenu;