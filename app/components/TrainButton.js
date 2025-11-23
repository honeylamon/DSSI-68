'use client';

import { useState } from 'react';

export default function TrainButton() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');

    const handleTrain = async () => {
        if (!confirm('ยืนยันที่จะส่งข้อมูลสินค้าทั้งหมดไปสอน AI? (อาจใช้เวลาสักครู่)')) return;

        setLoading(true);
        setStatus('กำลังประมวลผล... กรุณารอสักครู่ ⏳');

        try {
            const res = await fetch('/api/train-ai', { method: 'POST' });
            const data = await res.json();

            if (data.success) {
                alert(data.message);
                setStatus('✅ อัปเดตข้อมูล AI เรียบร้อยแล้ว!');
            } else {
                setStatus('❌ เกิดข้อผิดพลาด: ' + data.error);
            }
        } catch (error) {
            setStatus('❌ Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', border: '1px dashed #ccc', borderRadius: '10px', margin: '20px 0' }}>
            <h3> ระบบสอน AI อัตโนมัติ</h3>
            <p style={{ color: '#666', fontSize: '14px' }}>
                เมื่อคุณเพิ่มสินค้าใน PocketBase เสร็จแล้ว ให้กดปุ่มนี้เพื่อส่งข้อมูลไปให้ AI จำ
            </p>
            
            <button 
                onClick={handleTrain}
                disabled={loading}
                style={{
                    marginTop: '10px',
                    padding: '10px 20px',
                    backgroundColor: loading ? '#ccc' : '#4F46E5', // สีม่วงสวยๆ
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '16px'
                }}
            >
                {loading ? 'กำลังส่งข้อมูล... (ห้ามปิดหน้าจอ)' : '🚀 เริ่มสอน AI เดี๋ยวนี้'}
            </button>
            
            {status && <p style={{ marginTop: '10px', fontWeight: 'bold' }}>{status}</p>}
        </div>
    );
}