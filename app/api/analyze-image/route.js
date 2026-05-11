import { NextResponse } from 'next/server';

const CLARIFAI_PAT = '58651d7fe1f54147968861e01ba720db';
const USER_ID = 'bobbabiya';
const APP_ID = 'Baanjoy';

export async function POST(request) {
    try {
        const body = await request.json();
        const { imageBase64 } = body;

        if (!imageBase64) {
            return NextResponse.json({ error: 'No image data' }, { status: 400 });
        }

        const SEARCH_URL = `https://api.clarifai.com/v2/users/${USER_ID}/apps/${APP_ID}/inputs/searches`;

        const raw = JSON.stringify({
            "searches": [{
                "query": {
                    "ranks": [{
                        "annotation": {
                            "data": {
                                "image": {
                                    "base64": imageBase64
                                }
                            }
                        }
                    }]
                }
            }]
        });

        console.log("🚀 กำลังส่งรูปไปค้นหาในฐานข้อมูลสินค้า...");

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
            throw new Error(`Clarifai error (${response.status}): ${errorText}`);
        }

        const result = await response.json();
        const hits = result.hits ?? [];

        if (hits.length > 0) {
            const best = hits[0];
            console.log(`✅ เจอสินค้าที่เหมือนที่สุด! (score: ${best.score})`);
            console.log(`ID: ${best.input?.id}`);

            return NextResponse.json({
                success: true,
                matchScore: best.score,
                matchedImageId: best.input?.id,
                matchedImageUrl: best.input?.data?.image?.url
            });
        } else {
            return NextResponse.json({ success: false, message: 'ไม่พบสินค้าที่ใกล้เคียง' });
        }

    } catch (error) {
        console.error("❌ Server Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}