// app/components/Banner.js
import Image from 'next/image';

const Banner = () => {
  return (
    <div style={{ position: 'relative', width: '100%', height: '300px' }}>
      <Image
        src="/images/bander.jpg" // <-- เปลี่ยนชื่อไฟล์ตรงนี้
        alt="Baan Joy Banner"
        layout="fill"
        objectFit="cover"
        priority // เพิ่ม priority เพื่อให้รูปนี้โหลดก่อนรูปอื่น
      />
      {/* ถ้าต้องการใส่ข้อความทับบน Banner สามารถใส่ตรงนี้ได้ */}
    </div>
  );
};

export default Banner;