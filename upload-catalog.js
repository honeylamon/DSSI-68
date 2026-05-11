const CLARIFAI_PAT = '58651d7fe1f54147968861e01ba720db';
const CLARIFAI_USER_ID = 'bobbabiya';
const CLARIFAI_APP_ID = 'Baanjoy';

const POCKETBASE_URL = 'http://localhost:8090';
const COLLECTION_NAME = 'products';

async function fetchAllProducts() {
    let page = 1;
    let all = [];
    console.log('📦 กำลังดึงข้อมูลสินค้าจาก PocketBase...');
    while (true) {
        const res = await fetch(`${POCKETBASE_URL}/api/collections/${COLLECTION_NAME}/records?page=${page}&perPage=100`);
        const data = await res.json();
        all = all.concat(data.items);
        console.log(`  หน้า ${page}: ${data.items.length} รายการ (รวม ${all.length}/${data.totalItems})`);
        if (all.length >= data.totalItems) break;
        page++;
    }
    return all;
}

async function toBase64(record) {
    const url = `${POCKETBASE_URL}/api/files/${record.collectionId}/${record.id}/${record.picture}`;
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const buffer = await res.arrayBuffer();
        return Buffer.from(buffer).toString('base64');
    } catch (e) {
        console.warn(`  ⚠️ ดาวน์โหลดรูปไม่ได้ (${record.id}): ${e.message}`);
        return null;
    }
}

async function uploadBatch(inputs) {
    const res = await fetch(
        `https://api.clarifai.com/v2/users/${CLARIFAI_USER_ID}/apps/${CLARIFAI_APP_ID}/inputs`,
        {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Key ' + CLARIFAI_PAT
            },
            body: JSON.stringify({ inputs })
        }
    );
    const result = await res.json();
    if (!res.ok) {
        console.error('❌ Clarifai error:', JSON.stringify(result.status ?? result, null, 2));
        // แสดง error ของแต่ละ input
        if (result.inputs) {
            result.inputs.forEach((inp, i) => {
                if (inp.status?.code !== 10000) {
                    console.error(`  Input ${i} (${inputs[i]?.id}):`, inp.status);
                }
            });
        }
        return false;
    }
    return true;
}

async function main() {
    try {
        const products = await fetchAllProducts();
        console.log(`\n✅ ได้สินค้าทั้งหมด ${products.length} รายการ`);
        console.log('🖼️  กำลังดาวน์โหลดรูปและแปลงเป็น base64...\n');

        const clarifaiInputs = [];

        for (const p of products) {
            if (!p.picture) {
                console.warn(`  ⚠️ ${p.id} ไม่มีรูป ข้ามไป`);
                continue;
            }
            process.stdout.write(`  ${p.name || p.id}... `);
            const base64 = await toBase64(p);
            if (!base64) continue;

            // Clarifai ID ต้องเป็น lowercase alphanumeric และ - _ เท่านั้น
            const safeId = p.id.toLowerCase().replace(/[^a-z0-9_-]/g, '_');

            clarifaiInputs.push({
                id: safeId,
                data: {
                    image: { base64 },
                    metadata: {
                        pb_id: p.id,        // เก็บ ID จริงจาก PocketBase ไว้ใน metadata
                        name: p.name ?? ''
                    }
                }
            });
            console.log(`✅ (id: ${safeId})`);
        }

        console.log(`\n📤 กำลังอัปโหลด ${clarifaiInputs.length} รายการเข้า Clarifai...`);

        const BATCH_SIZE = 32;
        for (let i = 0; i < clarifaiInputs.length; i += BATCH_SIZE) {
            const batch = clarifaiInputs.slice(i, i + BATCH_SIZE);
            const batchNum = Math.floor(i / BATCH_SIZE) + 1;
            const total = Math.ceil(clarifaiInputs.length / BATCH_SIZE);
            process.stdout.write(`  Batch ${batchNum}/${total}... `);
            const ok = await uploadBatch(batch);
            console.log(ok ? '✅' : '❌');
            if (i + BATCH_SIZE < clarifaiInputs.length) {
                await new Promise(r => setTimeout(r, 1500));
            }
        }

        console.log('\n🎉 เสร็จแล้ว!');
    } catch (error) {
        console.error('❌ เกิดข้อผิดพลาด:', error.message);
    }
}

main();