'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaSearch, FaCamera, FaSpinner } from 'react-icons/fa'; 

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const fileInputRef = useRef(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);

    try {
      const base64 = await convertToBase64(file);
      const imageBytes = base64.split(',')[1]; 

      // ✅ จุดเปลี่ยนสำคัญ: เรียกใช้ API ของเราเอง (ไม่เรียก Clarifai ตรงๆ แล้ว)
      const response = await fetch('/api/analyze-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: imageBytes })
      });

      if (!response.ok) throw new Error('การเชื่อมต่อล้มเหลว');

      const result = await response.json();
      
      // ดึงคำตอบ
      if (result.outputs?.[0]?.data?.concepts?.length > 0) {
        const aiAnswer = result.outputs[0].data.concepts[0].name;
        console.log("AI ตอบว่า:", aiAnswer);
        
        setQuery(aiAnswer); 
        router.push(`/search?q=${encodeURIComponent(aiAnswer)}`);
      } else {
        alert('AI มองไม่ออกว่าเป็นรูปอะไร');
      }

    } catch (error) {
      console.error("Error:", error);
      alert('เกิดข้อผิดพลาด ลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', position: 'relative' }}>
      <div style={{ position: 'relative', width: '100%' }}>
        <input
          type="text"
          placeholder={loading ? "AI กำลังวิเคราะห์..." : "ค้นหาสินค้า..."}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading}
          style={{ width: '100%', padding: '10px 40px 10px 15px', borderRadius: '20px', border: '1px solid #ccc' }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current.click()} 
          disabled={loading}
          style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}
        >
          {loading ? <FaSpinner className="fa-spin" /> : <FaCamera size={20} />}
        </button>
      </div>
      <button type="submit" style={{ padding: '10px', borderRadius: '50%', background: '#3e594b', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px' }}>
        <FaSearch />
      </button>
      <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" style={{ display: 'none' }} />
    </form>
  );
}