// ไฟล์: upload-catalog.js

const CLARIFAI_PAT = '4f7672ba6c24468eaf049f1caf6fc733';
const USER_ID = 'bobbabiya';
const APP_ID = 'Baanjoy';

// สมมติว่านี่คือข้อมูลสินค้าของคุณ (ในของจริง คุณอาจจะดึงค่าเหล่านี้มาจาก Database)
const products = [
    {
        id: "PD-001", // รหัสสินค้าชิ้นที่ 1
        imageUrl: "https://example.com/image-of-shirt.jpg", 
        name: "เสื้อยืดคอกลม สีดำ"
    },
    {
        id: "PD-002", // รหัสสินค้าชิ้นที่ 2
        imageUrl: "https://example.com/image-of-pants.jpg",
        name: "กางเกงยีนส์ ทรงกระบอก"
    }
    // ... สามารถใส่เพิ่มได้สูงสุด 128 รูปต่อการส่ง 1 ครั้ง
];

async function uploadToClarifai() {
    const URL = `https://api.clarifai.com/v2/users/${USER_ID}/apps/${APP_ID}/inputs`;

    // 1. แปลงรูปแบบข้อมูลของเรา ให้ตรงกับฟอร์แมตที่ Clarifai ต้องการ
    const clarifaiInputs = products.map(product => ({
        id: product.id, // 🌟 สำคัญ: บังคับให้ ID ใน Clarifai ตรงกับรหัสสินค้าของเรา
        data: {
            image: {
                url: product.imageUrl 
            },
            metadata: {
                name: product.name // เก็บชื่อหรือข้อมูลอื่นๆ เสริมไว้ได้
            }
        }
    }));

    const raw = JSON.stringify({ inputs: clarifaiInputs });

    console.log(`🚀 กำลังอัปโหลดสินค้า ${clarifaiInputs.length} รายการไปที่คลัง...`);

    try {
        const response = await fetch(URL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Key ' + CLARIFAI_PAT
            },
            body: raw
        });

        const result = await response.json();

        if (response.ok) {
            console.log("✅ อัปโหลดสำเร็จ!");
            console.log(JSON.stringify(result.status, null, 2));
        } else {
            console.error("❌ อัปโหลดไม่สำเร็จ เกิดข้อผิดพลาดจาก API:");
            console.error(JSON.stringify(result, null, 2));
        }

    } catch (error) {
        console.error("❌ เกิดข้อผิดพลาดในระบบ:", error);
    }
}

// สั่งรันฟังก์ชัน
uploadToClarifai();