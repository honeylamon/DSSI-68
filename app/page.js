'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
    Box, 
    Container, 
    Grid, 
    Card, 
    CardMedia, 
    CardContent, 
    Typography, 
    Skeleton, 
    CardActionArea 
} from '@mui/material';
import { styled } from '@mui/material/styles';

// ✅ เรียกใช้ pb จาก lib กลาง
import pb from '@/app/lib/pocketbase'; 
import Banner from './components/Banner'; // แบนเนอร์ (ถ้ามี)

// --- Styled Components ---
const StyledCard = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: theme.shadows[10],
    },
}));

const StyledCardContent = styled(CardContent)({
    flexGrow: 1,
    textAlign: 'center',
    backgroundColor: '#fff',
    padding: '15px !important',
});

// สไตล์แบนเนอร์โปรโมชั่น (เผื่อใช้ในหน้านี้)
const PromoBanner = styled('div')({
    width: '100%',
    height: '320px', 
    borderRadius: '20px',
    overflow: 'hidden',
    position: 'relative',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    cursor: 'pointer',
    '&:hover img': {
        transform: 'scale(1.05)',
    },
    '@media (max-width: 600px)': {
        height: '200px',
    },
});

const TextOverlay = styled('div')({
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', 
    padding: '20px',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    height: '60%'
});

export default function HomePage() {
    const [categories, setCategories] = useState([]);
    const [promotions, setPromotions] = useState([]); 
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. ดึง Categories
                // ✅ ใส่ requestKey: null เพื่อแก้ปัญหา autocancelled
                const catResult = await pb.collection('categories').getFullList({
                    sort: 'created',
                    requestKey: null 
                });
                console.log("Categories:", catResult); 
                setCategories(catResult);

                // 2. ดึง Promotions
                try {
                    // ✅ ใส่ requestKey: null เช่นกัน
                    const promoResult = await pb.collection('products').getList(1, 5, { 
                        sort: '-created',
                        filter: 'promoType != ""',
                        requestKey: null
                    });
                    setPromotions(promoResult.items);
                } catch (err) {
                    // ถ้า error เพราะถูกยกเลิก เราจะไม่แสดง error แดงๆ
                    if (err.name !== 'ClientResponseError' || err.status !== 0) {
                        console.error("Error fetching promotions:", err);
                    }
                }

            } catch (error) {
                // ป้องกันการแจ้งเตือน error ที่ไม่จำเป็น
                if (error.name !== 'ClientResponseError' || error.status !== 0) {
                    console.error("Error fetching data:", error);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Helper สร้าง URL รูปภาพ
    const getImageUrl = (record, fileName) => {
        if (!fileName) return 'https://via.placeholder.com/400x300?text=No+Image';
        return `${pb.baseUrl}/api/files/${record.collectionId}/${record.id}/${fileName}`;
    };

    return (
        <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh', pb: 10 }}>
            
            {/* แบนเนอร์หลัก */}
            <Banner />

            <Container maxWidth="lg" sx={{ pt: 5 }}>

                {/* --- 📦 ส่วนที่ 1: หมวดหมู่สินค้า --- */}
                <Typography variant="h5" component="h2" sx={{ fontWeight: 800, color: '#1A4D2E', mb: 3, borderLeft: '6px solid #1A4D2E', pl: 2, borderRadius:'2px' }}>
                    หมวดหมู่สินค้า
                </Typography>

                {loading ? (
                    <Grid container spacing={3} sx={{ mb: 6 }}>
                        {[1, 2, 3, 4].map((item) => (
                            <Grid item xs={12} sm={6} md={3} key={item}>
                                <Skeleton variant="rectangular" height={220} sx={{ borderRadius: '16px' }} />
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Grid container spacing={3} sx={{ mb: 8 }}>
                        {categories.map((category) => {
                            // ดึงรูปภาพ (เช็คหลายชื่อเผื่อไว้)
                            const catImage = category.image || category.img || category.picture || category.icon;
                            const imageUrl = getImageUrl(category, catImage);

                            return (
                                <Grid item xs={12} sm={6} md={3} key={category.id}>
                                    <Link href={`/category/${category.id}`} passHref style={{ textDecoration: 'none' }}>
                                        <CardActionArea sx={{ borderRadius: '16px' }}>
                                            <StyledCard elevation={0}>
                                                
                                                <div style={{ position: 'relative', width: '100%', paddingTop: '80%', backgroundColor: '#f9f9f9' }}>
                                                    <Image
                                                        src={imageUrl}
                                                        alt={category.name}
                                                        fill
                                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                        style={{ objectFit: 'cover' }}
                                                    />
                                                </div>

                                                <StyledCardContent>
                                                    <Typography variant="h6" component="h3" sx={{ fontWeight: 700, color: '#2d3748', fontSize: '1.1rem' }}>
                                                        {category.name}
                                                    </Typography>
                                                </StyledCardContent>
                                            </StyledCard>
                                        </CardActionArea>
                                    </Link>
                                </Grid>
                            );
                        })}
                    </Grid>
                )}

                {/* --- 🔥 ส่วนที่ 2: โปรโมชั่นแนะนำ --- */}
                {!loading && promotions.length > 0 && (
                    <Box sx={{ mb: 6 }}>
                        <Typography variant="h5" component="h2" sx={{ fontWeight: 800, color: '#1A4D2E', mb: 3, display:'flex', alignItems:'center', gap:1 }}>
                            🔥 โปรโมชั่นแนะนำ
                        </Typography>
                        
                        <Grid container spacing={3}>
                            {promotions.map((product) => {
                                const imgName = product.picture || product.image;
                                const imgUrl = getImageUrl(product, imgName);

                                return (
                                    <Grid item xs={12} md={promotions.length === 1 ? 12 : 6} key={product.id}>
                                        <Link href={`/product/${product.id}`} passHref style={{textDecoration:'none'}}>
                                            <PromoBanner>
                                                <Image
                                                    src={imgUrl}
                                                    alt={product.name}
                                                    fill
                                                    style={{ objectFit: 'cover', transition: 'transform 0.5s' }}
                                                />
                                                
                                                <TextOverlay>
                                                    <span style={{ 
                                                        backgroundColor: '#ff3d00', 
                                                        color: 'white', 
                                                        padding: '4px 10px', 
                                                        borderRadius: '4px', 
                                                        fontSize: '0.9rem', 
                                                        fontWeight: 'bold',
                                                        alignSelf: 'flex-start',
                                                        marginBottom: '5px',
                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                                                    }}>
                                                        {product.promoType}
                                                    </span>
                                                    <Typography variant="h6" sx={{ fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                                                        {product.name}
                                                    </Typography>
                                                </TextOverlay>
                                            </PromoBanner>
                                        </Link>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </Box>
                )}

            </Container>
        </Box>
    );
}