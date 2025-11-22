// app/components/Banner.js
import Image from 'next/image';

const Banner = () => {
  return (
    <div style={{ position: 'relative', width: '100%', height: '300px' }}>
      <Image 
        src="/images/bander.jpg" 
        alt="..." 
        fill 
        style={{ objectFit: 'cover' }} 
     />
      {/* ถ้าต้องการใส่ข้อความทับบน Banner สามารถใส่ตรงนี้ได้ */}
    </div>
  );
};

export default Banner;