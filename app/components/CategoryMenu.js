import Link from 'next/link';

const CategoryMenu = ({ categories }) => {
  return (
    <div className="category-menu-container">
      <h2 className="category-title">หมวดหมู่สินค้า</h2>
      <div className="category-grid">
        {categories.map((category) => (
          <Link key={category.id} href={`/category/${category.name}`} className="category-item">
            {category.name}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryMenu;