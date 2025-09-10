// app/page.js
import Header from './components/Header';
import Banner from './components/Banner'; // เพิ่มบรรทัดนี้
import CategoryMenu from './components/CategoryMenu'; // เพิ่มบรรทัดนี้

export default function HomePage() {
  return (
    <main style={{ backgroundColor: '#F7FAFC' }}>
      <Header />
      <Banner />
      <CategoryMenu />
      {/* ส่วนรายการสินค้าจะมาต่อตรงนี้ */}
    </main>
  );
}