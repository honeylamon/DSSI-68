//app/page.js
'use client';

import { Box } from '@mui/material';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import PocketBase from 'pocketbase';
import {
    Container,
    Grid,
    Card,
    CardMedia,
    CardContent,
    Typography,
    CircularProgress,
    CardActionArea
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Banner from './components/Banner';
import styles from './HomePage.module.css';

const pb = new PocketBase('http://127.0.0.1:8090');

const StyledCard = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: theme.shadows[12],
        '& .MuiCardMedia-root': {
            transform: 'scale(1.05)',
        },
    },
    borderRadius: '12px',
    overflow: 'hidden',
}));

const StyledCardMedia = styled(CardMedia)({
    paddingTop: '100%',
    overflow: 'hidden',
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
});

const StyledCardContent = styled(CardContent)(({ theme }) => ({
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    padding: theme.spacing(2),
    backgroundColor: '#fafafa',
}));

function getImageUrl(record, filename) {
    if (!record || !filename) {
        return '/images/bander.jpg';
    }
    try {
         return '/images/placeholder.jpg'; //return pb.getFileUrl(record, filename, { 'thumb': '300x300' });
    } catch (e) {
        console.error('Error getting file URL:', e);
        return '/images/placeholder.jpg';
    }
}

export default function HomePage() {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        const fetchCategories = async () => {
            try {
                const result = await pb.collection('categories').getFullList({
                    sort: 'name',
                    signal: signal,
                });
                setCategories(result);
            } catch (error) {
                if (!error.isAbort) {
                    console.error('Failed to fetch categories:', error);
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchCategories();

        return () => {
            controller.abort();
        };
    }, []);

    if (isLoading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="300px"
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Banner />

            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Typography
                    variant="h4"
                    component="h1"
                    sx={{
                        fontWeight: 700,
                        color: '#3B5D50',
                        mb: 4,
                        pb: 2,
                        borderBottom: '3px solid #6a9c89',
                        display: 'inline-block',
                    }}
                >
                    หมวดหมู่สินค้า
                </Typography>

                <Grid container spacing={3} sx={{ mt: 1 }}>
                    {categories.map((category) => (
                        <Grid item xs={12} sm={12} md={6} lg={4} key={category.id}>
                            <Link href={`/category/${category.id}`} passHref style={{ textDecoration: 'none' }}>
                                <CardActionArea component="div">
                                    <StyledCard>
                                        <StyledCardMedia
                                            component={() => (
                                                <div style={{ position: 'relative', width: '100%', paddingTop: '100%' }}>
                                                    <Image
                                                        src={getImageUrl(category, category.image)}
                                                        alt={category.name}
                                                        fill
                                                        style={{ objectFit: 'cover' }}
                                                    />
                                                </div>
                                            )}
                                        />
                                        <StyledCardContent>
                                            <Typography
                                                variant="h6"
                                                component="h2"
                                                sx={{
                                                    fontWeight: 600,
                                                    color: '#333',
                                                    fontSize: '1.1rem',
                                                }}
                                            >
                                                {category.name}
                                            </Typography>
                                        </StyledCardContent>
                                    </StyledCard>
                                </CardActionArea>
                            </Link>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
}