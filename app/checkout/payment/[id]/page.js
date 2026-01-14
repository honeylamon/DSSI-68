'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import pb from '@/app/lib/pocketbase';
import { FiCopy, FiUpload, FiCheckCircle, FiInfo, FiArrowLeft } from 'react-icons/fi';

const styles = {
    container: { maxWidth: '600px', margin: '40px auto', padding: '20px', fontFamily: "'Kanit', sans-serif" },
    card: { backgroundColor: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', textAlign: 'center' },
    orderInfo: { marginBottom: '20px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' },
    bankBox: { backgroundColor: '#f0fdf4', border: '2px dashed #10b981', borderRadius: '12px', padding: '20px', margin: '20px 0', textAlign: 'left' },
    uploadArea: { border: '2px dashed #ddd', borderRadius: '12px', padding: '30px', cursor: 'pointer', marginTop: '20px', transition: 'all 0.2s', backgroundColor: '#fafafa' },
    previewImg: { width: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '8px' },
    btnSubmit: { width: '100%', padding: '15px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)' },
    btnBack: { display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#666', textDecoration: 'none', marginBottom: '20px', cursor: 'pointer', background: 'none', border: 'none', fontSize: '1rem' }
};

export default function PaymentPage() {
    const { id } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState(null);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // ✅ ปิด Auto-cancellation เพื่อป้องกัน Error Status 0
        pb.autoCancellation(false);

        const fetchOrder = async () => {
            try {
                // ✅ ใช้ requestKey: null เพื่อให้แน่ใจว่าคำขอจะไม่ถูกยกเลิก
                const record = await pb.collection('orders').getOne(id, {
                    requestKey: null
                });
                setOrder(record);
            } catch (error) {
                if (error.isAbort) return; // ข้ามถ้าเป็นการยกเลิกปกติ
                console.error('Error fetching order:', error);
                alert('ไม่พบข้อมูลคำสั่งซื้อ');
            }
        };

        if (id) {
            fetchOrder();
        }
    }, [id]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleUploadSlip = async () => {
        if (!file) return alert('กรุณาเลือกไฟล์สลิปโอนเงินก่อนยืนยัน');
        
        setLoading(true);
        try {
            // ✅ ปิด Auto-cancellation ก่อนส่งข้อมูล
            pb.autoCancellation(false);

            const formData = new FormData();
            formData.append('slip', file); // 'slip' ต้องตรงกับชื่อ field ใน PocketBase
            formData.append('status', 'pending'); // ตั้งสถานะเป็นรอตรวจสอบ

            await pb.collection('orders').update(id, formData);
            
            alert('ส่งหลักฐานการโอนเงินเรียบร้อยแล้ว! ขอบคุณที่อุดหนุนครับ');
            router.push('/profile/orders'); // ไปหน้าประวัติการสั่งซื้อ
        } catch (error) {
            console.error('Upload error:', error);
            alert('เกิดข้อผิดพลาดในการอัปโหลด: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!order) return <div style={{textAlign:'center', padding:'100px', fontFamily: "'Kanit', sans-serif"}}>กำลังเตรียมข้อมูลการชำระเงิน...</div>;

    return (
        <div style={styles.container}>
            <button onClick={() => router.back()} style={styles.btnBack}>
                <FiArrowLeft /> ย้อนกลับ
            </button>

            <div style={styles.card}>
                <FiCheckCircle size={60} color="#10b981" />
                <h1 style={{margin: '15px 0', color: '#1A4D2E'}}>คำสั่งซื้อสำเร็จ</h1>
                
                <div style={styles.orderInfo}>
                    <p style={{margin: 0, color: '#64748b'}}>รหัสคำสั่งซื้อ</p>
                    <p style={{fontSize: '1.2rem', fontWeight: 'bold', color: '#1e293b'}}>#{order.id.substring(0,8)}</p>
                </div>

                <div style={{fontSize: '1.1rem', color: '#334155'}}>ยอดรวมที่ต้องชำระ</div>
                <div style={{fontSize: '2.2rem', fontWeight: '800', color: '#10b981', margin: '5px 0'}}>
                    ฿{order.total_price?.toLocaleString()}
                </div>

                <div style={styles.bankBox}>
                    <h3 style={{marginTop: 0, display:'flex', alignItems:'center', gap:'8px', color: '#166534'}}>
                        <FiInfo /> ข้อมูลบัญชีสำหรับโอนเงิน
                    </h3>
                    <div style={{fontSize: '1.05rem', lineHeight: '1.8'}}>
                        <p style={{margin: '5px 0'}}><strong>ธนาคาร:</strong> กสิกรไทย (K-Bank)</p>
                        <p style={{margin: '5px 0'}}><strong>ชื่อบัญชี:</strong> ร้านบ้านจอย (Baan Joy)</p>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', backgroundColor: 'white', padding: '10px', borderRadius: '8px', marginTop: '10px', border: '1px solid #bbf7d0'}}>
                            <span style={{fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '1px'}}>123-4-56789-0</span>
                            <button 
                                onClick={() => {navigator.clipboard.writeText('1234567890'); alert('คัดลอกเลขบัญชีแล้ว')}} 
                                style={{border:'none', background:'#10b981', color: 'white', padding: '6px 12px', borderRadius: '6px', cursor:'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px'}}
                            >
                                <FiCopy /> คัดลอก
                            </button>
                        </div>
                    </div>
                </div>

                <div style={{textAlign: 'left', marginTop: '25px'}}>
                    <label style={{fontWeight:'bold', color: '#334155', display: 'flex', alignItems: 'center', gap: '5px'}}>
                        <FiUpload /> แนบสลิปการโอนเงิน
                    </label>
                    <div 
                        style={{
                            ...styles.uploadArea,
                            borderColor: preview ? '#10b981' : '#ddd',
                            backgroundColor: preview ? '#f0fdf4' : '#fafafa'
                        }} 
                        onClick={() => document.getElementById('slip-upload').click()}
                    >
                        {preview ? (
                            <img src={preview} style={styles.previewImg} alt="slip preview" />
                        ) : (
                            <div style={{color:'#94a3b8'}}>
                                <FiUpload size={40} style={{marginBottom: '10px'}} />
                                <p style={{margin: 0}}>คลิกเพื่ออัปโหลดรูปภาพสลิป</p>
                                <p style={{fontSize: '0.8rem', marginTop: '5px'}}>(รองรับไฟล์ JPG, PNG)</p>
                            </div>
                        )}
                        <input id="slip-upload" type="file" hidden accept="image/*" onChange={handleFileChange} />
                    </div>
                </div>

                <button 
                    onClick={handleUploadSlip} 
                    style={{
                        ...styles.btnSubmit, 
                        backgroundColor: loading ? '#94a3b8' : '#10b981',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                    disabled={loading}
                >
                    {loading ? 'กำลังส่งหลักฐาน...' : 'ยืนยันการแจ้งโอนเงิน'}
                </button>
                
                <p style={{fontSize: '0.85rem', color: '#94a3b8', marginTop: '15px'}}>
                    หลังจากส่งสลิปแล้ว รอการตรวจสอบจากทางร้านประมาณ 1-2 วันทำการ
                </p>
            </div>
        </div>
    );
}