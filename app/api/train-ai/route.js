import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';

// 🔴 1. ตั้งค่า Key ต่างๆ (ใช้ชุดเดียวกับหน้า Search)
const CLARIFAI_PAT = '045f82dd01134d2fa616eafeac6ccad8'; 
const CLARIFAI_USER_ID = '8crja98urwmf';
const CLARIFAI_APP_ID = 'baanjoy-new-search';

// เชื่อมต่อ PocketBase (หลังบ้านคุยกันเอง)
const pb = new PocketBase('http://127.0.0.1:8090');

export async function POST(request) {
    try {
        console.log("🚀 เริ่มต้นการ Train AI...");

        // 1. ดึงข้อมูลสินค้าทั้งหมดจาก PocketBase
        // (เอามาแค่ id, name, picture)
        const products = await pb.collection('products').getFullList({
            sort: '-created',
        });

        console.log(`📦 พบสินค้าในร้านทั้งหมด ${products.length} ชิ้น`);

        let successCount = 0;
        let failCount = 0;

        // 2. วนลูปสินค้าทีละชิ้น เพื่อส่งไป Clarifai
        for (const product of products) {
            // ข้ามถ้าไม่มีรูป
            if (!product.picture) continue;

            try {
                // สร้าง URL ของรูปภาพ
                const imageUrl = pb.files.getURL(product, product.picture);

                // ต้องโหลดรูปมาแปลงเป็น Base64 ก่อนส่งให้ Clarifai
                // (เพราะ Clarifai บางทีโหลดจาก localhost ไม่ได้ เราต้องส่งเนื้อไฟล์ไปเลย)
                const imageRes = await fetch(imageUrl);
                const arrayBuffer = await imageRes.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const base64Image = buffer.toString('base64');

                // เตรียมข้อมูลส่ง Clarifai (Add Input)
                const raw = JSON.stringify({
                    "user_app_id": {
                        "user_id": CLARIFAI_USER_ID,
                        "app_id": CLARIFAI_APP_ID
                    },
                    "inputs": [
                        {
                            "data": {
                                "image": {
                                    "base64": base64Image,
                                    "allow_duplicate_url": true // อนุญาตให้ส่งซ้ำได้ (เผื่ออัปเดต)
                                },
                                "concepts": [
                                    {
                                        "id": product.id,        // ใช้ ID สินค้าเป็นรหัส
                                        "name": product.name,    // ใช้ชื่อสินค้าเป็น Label (เช่น "Yakult")
                                        "value": 1               // บอกว่า "ใช่" (Positive Example)
                                    }
                                ]
                            }
                        }
                    ]
                });

                // ยิงไปที่ Clarifai (Endpoint สำหรับเพิ่ม Inputs)
                const clarifaiRes = await fetch("https://api.clarifai.com/v2/inputs", {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': 'Key ' + CLARIFAI_PAT
                    },
                    body: raw
                });

                if (!clarifaiRes.ok) {
                    const errText = await clarifaiRes.text();
                    console.error(`❌ Train ล้มเหลว (${product.name}):`, errText);
                    failCount++;
                } else {
                    console.log(`✅ Train สำเร็จ: ${product.name}`);
                    successCount++;
                }

            } catch (err) {
                console.error(`❌ Error กับสินค้า ${product.name}:`, err.message);
                failCount++;
            }
        }

        return NextResponse.json({ 
            message: `Train เสร็จสิ้น! สำเร็จ ${successCount} / ล้มเหลว ${failCount}`,
            success: true 
        });

    } catch (error) {
        console.error("Server Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}