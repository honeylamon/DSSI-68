// app/page.js (Final Perfect Version)
'use client';
import { useEffect, useState, useCallback } from 'react';
import pb from '@/lib/pocketbase';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(pb.authStore.model);

  const fetchProducts = useCallback(async () => {
    try {
      const records = await pb.collection('products').getFullList({ sort: '-created' });
      setProducts(records);
    } catch (error) {
      if (!error.isAbort) {
        console.error("Fetch error:", error);
      }
      setProducts([]); 
    }
  }, []);

  useEffect(() => {
    // ติดตามการเปลี่ยนแปลงสถานะ login/logout
    const unsubscribe = pb.authStore.onChange((token, model) => {
        setUser(model);
        fetchProducts(); // ดึงข้อมูลใหม่ทุกครั้งที่สถานะเปลี่ยน
    }, true); // true เพื่อให้ทำงานครั้งแรกที่เปิดหน้าเว็บ

    return () => {
        unsubscribe();
    };
  }, [fetchProducts]);

  return <AuthAndProductManager user={user} products={products} fetchProducts={fetchProducts} />;
}

// --- ส่วนจัดการ UI และฟังก์ชันต่างๆ ---
function AuthAndProductManager({ user, products, fetchProducts }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const isAdmin = user && user.role === 'admin';

    const handleLogin = async () => {
        try {
          await pb.collection('users').authWithPassword(email, password);
        } catch (e) { alert('Login Failed'); }
    };

    const handleSignup = async () => {
        try {
          await pb.collection('users').create({ email, password, passwordConfirm: password, role: 'user' });
          alert('Signup Successful! Please login.');
        } catch (e) { alert('Signup Failed'); }
    };

    const handleLogout = () => pb.authStore.clear();

    const handleCreate = async () => {
        const name = prompt("Enter product name:");
        const price = prompt("Enter product price:");
        if (name && price) {
          await pb.collection('products').create({ name, price: parseFloat(price) });
          fetchProducts();
        }
    };

    const handleUpdate = async (id, currentName, currentPrice) => {
        const name = prompt("Enter new name:", currentName);
        const price = prompt("Enter new price:", currentPrice);
        if (name && price) {
          await pb.collection('products').update(id, { name, price: parseFloat(price) });
          fetchProducts();
        }
    };

    const handleDelete = async (id) => {
        if (confirm("Are you sure?")) {
          await pb.collection('products').delete(id);
          fetchProducts();
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px', backgroundColor: 'white', borderRadius: '8px' }}>
        <h1 style={{ textAlign: 'center' }}>Baan Joy Product Management</h1>
        <div style={{ padding: '20px', border: '1-px solid #ccc', borderRadius: '8px', marginBottom: '20px' }}>
            {user ? (
            <div>
                <p>Welcome, {user.email} {isAdmin ? '(Admin)' : ''}</p>
                <button onClick={handleLogout} style={{ ...buttonStyle, backgroundColor: '#e74c3c' }}>Logout</button>
            </div>
            ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
                <button onClick={handleLogin} style={{ ...buttonStyle, backgroundColor: '#3498db' }}>Login</button>
                <button onClick={handleSignup} style={{ ...buttonStyle, backgroundColor: '#9b59b6' }}>Sign Up</button>
            </div>
            )}
        </div>
        <hr style={{ margin: '20px 0' }}/>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Product List</h2>
            {isAdmin && <button onClick={handleCreate} style={{ ...buttonStyle, backgroundColor: '#2ecc71' }}>+ Add New</button>}
        </div>
        <div>
            {products.map(p => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1-px solid #eee' }}>
                <div>
                <p style={{ fontWeight: 'bold' }}>{p.name}</p>
                <p>Price: {p.price} THB</p>
                </div>
                {isAdmin && (
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => handleUpdate(p.id, p.name, p.price)} style={{ ...buttonStyle, backgroundColor: '#f1c40f' }}>Edit</button>
                    <button onClick={() => handleDelete(p.id)} style={{ ...buttonStyle, backgroundColor: '#e74c3c' }}>Delete</button>
                </div>
                )}
            </div>
            ))}
        </div>
        </div>
    );
}
const inputStyle = { padding: '10px', border: '1-px solid #ccc', borderRadius: '4px' };
const buttonStyle = { padding: '10px 15px', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer' };