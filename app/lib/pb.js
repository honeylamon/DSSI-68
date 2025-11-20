import PocketBase from 'pocketbase';

// สร้าง pb instance แค่ครั้งเดียวตรงนี้
const pb = new PocketBase('http://127.0.0.1:8090');

// สั่งให้มันโหลด auth state (จาก cookie/localStorage) ทุกครั้งที่แอปโหลด
// นี่คือส่วนสำคัญสำหรับ Client Components
if (typeof window !== 'undefined') {
    pb.authStore.loadFromCookie(document.cookie || '');
}

export default pb;