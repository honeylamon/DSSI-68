import { NextResponse } from 'next/server';

// 1. ใส่ Key ของคุณ (แนะนำให้ใช้ Key จากบัญชีใหม่ที่ยังมีเครดิต)
const CLARIFAI_PAT = '4f7672ba6c24468eaf049f1caf6fc733'; 
const USER_ID = 'bobbabiya'; // เช่น 'my-username'
const APP_ID = 'Baanjoy';   // เช่น 'my-shop-catalog'

export async function POST(request) {
    try {
        const body = await request.json();
        const { imageBase64 } = body;

        if (!imageBase64) {
            return NextResponse.json({ error: 'No image data' }, { status: 400 });
        }

        // ✅ เปลี่ยน URL เป็น Endpoint สำหรับการ "ค้นหา (Search)"
        const SEARCH_URL = `https://api.clarifai.com/v2/users/${USER_ID}/apps/${APP_ID}/searches`;

        const raw = JSON.stringify({
            "query": {
                "ranks": [
                    {
                        "annotation": {
                            "data": {
                                "image": {
                                    "base64": imageBase64
                                }
                            }
                        }
                    }
                ]
            }
        });

        console.log("🚀 กำลังส่งรูปไปค้นหาในฐานข้อมูลสินค้าของเรา...");

        const response = await fetch(SEARCH_URL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Key ' + CLARIFAI_PAT
            },
            body: raw
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ Clarifai API Error:", errorText);
            throw new Error(`AI ตอบกลับมาว่า Error (${response.status}): ${errorText}`);
        }

        const result = await response.json();
        
        // ✅ ดึงข้อมูลรูปภาพในคลังของเราที่ "หน้าตาเหมือนที่สุด"
        if (result.hits && result.hits.length > 0) {
            // ระบบจะเรียงลำดับความเหมือนจากมากไปน้อย (hits[0] คือเหมือนสุด)
            const bestMatchScore = result.hits[0].score; // ความแม่นยำ (เช่น 0.95 คือเหมือน 95%)
            const bestMatchImageUrl = result.hits[0].input.data.image.url; // URL ของรูปในคลัง
            const bestMatchId = result.hits[0].input.id; // รหัสอ้างอิงรูปภาพ
            
            console.log(`✅ เจอสินค้าที่เหมือนที่สุด! (ความแม่นยำ: ${bestMatchScore})`);
            console.log(`ID สินค้า: ${bestMatchId}`);
            
            // ส่งข้อมูลนี้กลับไปให้หน้าเว็บ (Frontend) ไปจัดการต่อ
            return NextResponse.json({
                success: true,
                matchScore: bestMatchScore,
                matchedImageId: bestMatchId,
                matchedImageUrl: bestMatchImageUrl
            });
        } else {
             return NextResponse.json({ success: false, message: 'ไม่พบสินค้าที่ใกล้เคียง' });
        }

    } catch (error) {
        console.error("❌ Server Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}