import { NextResponse } from 'next/server';

// 🔴 1. ใส่ Key ใหม่ของคุณตรงนี้ (ห้ามใช้ตัวเดิมที่ขึ้นต้นด้วย f7c...)
const CLARIFAI_PAT = '045f82dd01134d2fa616eafeac6ccad8'; 

export async function POST(request) {
    try {
        const body = await request.json();
        const { imageBase64 } = body;

        if (!imageBase64) {
            return NextResponse.json({ error: 'No image data' }, { status: 400 });
        }

        // ✅ ใช้ URL แบบมาตรฐานที่สุด (ชี้ไปที่โมเดล Food Recognition V1.0)
        const MODEL_URL = "https://api.clarifai.com/v2/models/food-item-recognition/versions/1d5fd481e0cf4826aa72ec3ff049e044/outputs";

        const raw = JSON.stringify({
            // ✅ จุดสำคัญ: ระบุว่า "ฉันกำลังจะใช้โมเดลของ user: clarifai ใน app: main"
            // (ต้องใส่ตรงนี้ เพื่อแก้ Error 11102 / Model not found)
            "user_app_id": {
                "user_id": "clarifai",
                "app_id": "main"
            },
            "inputs": [
                {
                    "data": {
                        "image": {
                            "base64": imageBase64
                        }
                    }
                }
            ]
        });

        console.log("🚀 กำลังส่งรูปไปถาม AI...");

        const response = await fetch(MODEL_URL, {
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
        
        // เช็คว่า AI ตอบอะไรกลับมาบ้าง (ดูใน Terminal)
        if (result.outputs?.[0]?.data?.concepts) {
            const topAnswer = result.outputs[0].data.concepts[0].name;
            console.log("✅ AI ทายว่า:", topAnswer);
        }

        return NextResponse.json(result);

    } catch (error) {
        console.error("❌ Server Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}