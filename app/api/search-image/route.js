import { NextResponse } from 'next/server';
import { ClarifaiStub, grpc } from 'clarifai-nodejs-grpc';

// ดึง PAT (API Key) จาก .env
const USER_ID = 'your-clarifai-user-id';
const APP_ID = 'your-clarifai-app-id';
const PAT = process.env.CLARIFAI_PAT;

const stub = ClarifaiStub.grpc();
const metadata = new grpc.Metadata();
metadata.set('authorization', 'Key ' + PAT);

export async function POST(request) {
  try {
    const { imageBase64 } = await request.json();

    const response = await new Promise((resolve, reject) => {
      stub.PostSearches(
        {
          user_app_id: { user_id: USER_ID, app_id: APP_ID },
          query: {
            ranks: [{ // ค้นหาด้วยรูปภาพ
              annotation: { data: { image: { base64: imageBase64 } } }
            }]
          },
          pagination: { per_page: 5, page: 1 } // เอา 5 อันดับแรก
        },
        metadata,
        (err, res) => {
          if (err) reject(err);
          if (res.status.code !== 10000) {
            reject(new Error('Clarifai error: ' + res.status.description));
          }
          resolve(res);
        }
      );
    });

    // ดึง product_id ที่เราเก็บไว้ใน "Metadata" ออกมา
    const productIds = response.hits
      .map(hit => hit.input?.data?.metadata?.product_id) // ดึง metadata
      .filter(Boolean); // กรองอันที่ไม่มี metadata ออก

    return NextResponse.json({ productIds: [...new Set(productIds)] }); // ส่ง ID กลับไป

  } catch (error) {
    console.error('Clarifai API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}