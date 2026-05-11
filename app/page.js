'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
    Box, 
    Container, 
    Grid, 
    Card, 
    CardContent, 
    Typography, 
    Skeleton, 
    CardActionArea,
    Button 
} from '@mui/material';
import { styled } from '@mui/material/styles';

import { useCart } from '@/app/contexts/CartContext'; 
import pb from '@/app/lib/pocketbase'; 
import Banner from './components/Banner'; 

// ✅ 1. เพิ่มชุดข้อมูลโปรโมชั่นเพื่อให้ตรงกับหน้า Admin
const PROMO_OPTIONS = [
    { label: 'ไม่มีโปรโมชั่น', value: 'none' },
    { label: 'ลด 50%', value: 'discount' },
    { label: '1 แถม 1', value: 'Buy One, Get One' },
    { label: 'สินค้าแนะนำ', value: 'featured' },
    { label: 'โปรโมชั่น', value: 'Promotion' }
];

const getPromoLabel = (value) => {
    const option = PROMO_OPTIONS.find(opt => opt.value === value);
    return option ? option.label : (value || '-');
};

// --- Styled Components ---

// ✅ แก้ไขสไตล์การ์ดหมวดหมู่ให้บังคับความสูงเท่ากัน
const CategoryCard = styled(Card)(({ theme }) => ({
    height: '180px', // 📌 บังคับความสูงคงที่เพื่อให้ทุกใบเท่ากัน
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '16px',
    padding: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: theme.shadows[4],
    },
}));

const StyledCard = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: theme.shadows[8],
    },
}));

const PromoBadge = styled(Box)({
    position: 'absolute',
    top: '12px',
    left: '12px',
    backgroundColor: '#fff7ed',
    color: '#f59e0b',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    border: '1px solid #ffedd5',
    zIndex: 2,
});

const OutOfStockOverlay = styled(Box)({
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 3,
});

export default function HomePage() {
    const [categories, setCategories] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart(); 

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [catResult, productsResult] = await Promise.all([
                    pb.collection('categories').getFullList({ sort: 'created', requestKey: null }),
                    pb.collection('products').getFullList({ sort: '-created', requestKey: null })
                ]);
                setCategories(catResult);
                setAllProducts(productsResult);
            } catch (error) { console.error(error); }
            finally { setLoading(false); }
        };
        fetchData();
    }, []);

    const getImageUrl = (record, fileName) => {
        if (!fileName) return 'https://via.placeholder.com/400x300?text=No+Image';
        return `${pb.baseUrl}/api/files/${record.collectionId}/${record.id}/${fileName}`;
    };

    return (
        <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh', pb: 10, fontFamily: "'Kanit', sans-serif" }}>
            <Banner />
            <Container maxWidth="lg" sx={{ pt: 5 }}>

                {/* --- หมวดหมู่สินค้า (ฉบับแก้ไขขนาด) --- */}
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A4D2E', mb: 3, borderLeft: '6px solid #1A4D2E', pl: 2 }}>หมวดหมู่สินค้า</Typography>
                <Grid container spacing={2} sx={{ mb: 8 }}>
                    {loading ? [1,2,3,4,5].map(i => <Grid item xs={6} sm={4} md={2.4} key={i}><Skeleton variant="rectangular" height={180} sx={{ borderRadius: '16px' }} /></Grid>) : (
                        categories.map((category) => (
                            <Grid item xs={6} sm={4} md={2.4} key={category.id}>
                                <Link href={`/category/${category.id}`} style={{ textDecoration: 'none' }}>
                                    <CardActionArea sx={{ borderRadius: '16px' }}>
                                        <CategoryCard elevation={0}>
                                            {/* 🖼️ บังคับรูปกึ่งกลางและขนาดพอดี */}
                                            <Box sx={{ 
                                                position: 'relative', 
                                                width: '100%', 
                                                height: '100px', // บังคับความสูงรูปภาพ
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mb: 1
                                            }}>
                                                <Image 
                                                    src={getImageUrl(category, category.image || category.picture)} 
                                                    alt={category.name} fill sizes="20vw"
                                                    style={{ objectFit: 'contain', padding: '5px' }} 
                                                />
                                            </Box>
                                            <Typography sx={{ 
                                                fontWeight: 700, color: '#333', fontSize: '0.95rem',
                                                textAlign: 'center', width: '100%',
                                                overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical'
                                            }}>
                                                {category.name}
                                            </Typography>
                                        </CategoryCard>
                                    </CardActionArea>
                                </Link>
                            </Grid>
                        ))
                    )}
                </Grid>

                {/* --- สินค้าทั้งหมด --- */}
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A4D2E', mb: 3, borderLeft: '6px solid #1A4D2E', pl: 2 }}>สินค้าทั้งหมด</Typography>
                <Grid container spacing={2}>
                    {loading ? [1,2,3,4,5].map(i => <Grid item xs={6} sm={4} md={2.4} key={i}><Skeleton variant="rectangular" height={300} sx={{ borderRadius: '16px' }} /></Grid>) : (
                        allProducts.map((product) => (
                            <Grid item xs={6} sm={4} md={2.4} key={product.id}>
                                <StyledCard elevation={0}>
                                    {product.stock <= 0 && <OutOfStockOverlay><Box sx={{ bgcolor: '#ef4444', color: 'white', px: 2, py: 1, borderRadius: 2, fontWeight: 'bold' }}>สินค้าหมด</Box></OutOfStockOverlay>}
                                    {product.stock > 0 && product.promoType && product.promoType !== 'none' && <PromoBadge>{getPromoLabel(product.promoType)}</PromoBadge>}
                                    <Link href={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
                                        <Box sx={{ position: 'relative', width: '100%', pt: '100%', backgroundColor: '#fff' }}>
                                            <Image src={getImageUrl(product, product.picture)} alt={product.name} fill style={{ objectFit: 'contain', padding: '10px' }} />
                                        </Box>
                                    </Link>
                                    <CardContent sx={{ p: '12px !important', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 600, height: '2.8em', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', color: '#2d3748' }}>{product.name}</Typography>
                                            <Typography variant="h6" sx={{ color: '#1A4D2E', fontWeight: 800, my: 1 }}>฿{product.price?.toLocaleString()}</Typography>
                                        </Box>
                                        <Button 
                                            variant="contained" fullWidth disabled={product.stock <= 0}
                                            onClick={(e) => { e.preventDefault(); addToCart({ ...product, quantity: 1 }); }}
                                            sx={{ bgcolor: '#1A4D2E', borderRadius: '8px', textTransform: 'none' }}
                                        >
                                            {product.stock <= 0 ? 'สินค้าหมด' : '+ เพิ่มลงตะกร้า'}
                                        </Button>
                                    </CardContent>
                                </StyledCard>
                            </Grid>
                        ))
                    )}
                </Grid>
            </Container>
        </Box>
    );
}