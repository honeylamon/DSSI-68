import { NextResponse } from 'next/server';

const CLARIFAI_PAT = 'f7c7235762bf45e9aff6e48a10053a36';
const CLARIFAI_USER_ID = '8crja98urwmf';
const CLARIFAI_APP_ID = 'baanjoy-new-search';

// ✅ แก้ไขตรงนี้: ใช้รหัส ID ของโมเดล Food (แทนชื่อเล่น)
const MODEL_ID = 'bd367be194cf45149e75f01d59f77ba7'; 

export async function POST(request) {
    try {
        const body = await request.json();
        const { imageBase64 } = body;

        if (!imageBase64) {
            return NextResponse.json({ error: 'ไม่พบข้อมูลรูปภาพ' }, { status: 400 });
        }

        const raw = JSON.stringify({
            "user_app_id": {
                "user_id": CLARIFAI_USER_ID,
                "app_id": CLARIFAI_APP_ID
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

        // ส่งไปถาม AI
        const response = await fetch("https://api.clarifai.com/v2/models/" + MODEL_ID + "/outputs", {
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
            console.error("Clarifai Error:", errorText);
            throw new Error(`Clarifai Error (${response.status}): ${errorText}`);
        }

        const result = await response.json();
        return NextResponse.json(result);

    } catch (error) {
        console.error("Server Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}