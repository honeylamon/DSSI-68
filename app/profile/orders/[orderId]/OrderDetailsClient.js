// app/profile/orders/[orderId]/OrderDetailsClient.js
'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './OrderDetailsPage.module.css'; // ใช้ CSS Module เดียวกัน

// Helper function สำหรับแสดงสถานะ
const getStatusText = (status) => {
    switch (status) {
        case 'New': return 'คำสั่งซื้อใหม่';
        case 'Processing': return 'กำลังดำเนินการ';
        case 'Shipping': return 'จัดเตรียมสินค้า';
        case 'Shipped': return 'จัดส่งแล้ว';
        case 'Delivered': return 'จัดส่งสำเร็จ';
        case 'Cancelled': return 'ยกเลิกแล้ว';
        default: return 'ไม่ทราบสถานะ';
    }
};

export default function OrderDetailsClient({
    orderId,
    orderItems,
    orderStatus,
    address,
    totalPrice,
    trackingNumber,
    shippingMethod
}) {
    const router = useRouter();
    
    // --- Logic ปุ่ม ---
    const handleCopy = () => {
        if (trackingNumber && navigator.clipboard) {
            navigator.clipboard.writeText(trackingNumber);
            alert('คัดลอกเลขพัสดุแล้ว');
        } else if (trackingNumber) {
            alert('เลขพัสดุ: ' + trackingNumber);
        }
    };
    
    const handleTrack = () => {
        if (trackingNumber) {
            // ตัวอย่าง URL สำหรับค้นหาพัสดุ (สามารถเปลี่ยนเป็นบริษัทขนส่งอื่นได้)
            const trackingUrl = `https://track.thailandpost.co.th/?trackNumber=${trackingNumber}`;
            window.open(trackingUrl, '_blank');
        }
    };

    return (
        <div className={styles.container}>
            {/* Header: ปุ่มย้อนกลับและชื่อหน้า */}
            <div className={styles.header}>
                <button onClick={() => router.back()} className={styles.backButton}>
                    &larr;
                </button>
                <h1 className={styles.pageTitle}>รายละเอียดคำสั่งซื้อ</h1>
            </div>

            {/* ส่วนที่อยู่จัดส่ง */}
            {shippingMethod === 'delivery' && address && (
                <div className={styles.addressSection}>
                    <p className={styles.sectionTitle}>ที่อยู่จัดส่ง</p>
                    <p className={styles.addressDetail}>
                        {address.fullAddress}
                    </p>
                </div>
            )}
            
            <div className={styles.orderSummary}>
                
                {/* รายละเอียดสินค้า */}
                <div className={styles.itemContainer}>
                    {/* หัวตารางสินค้า */}
                    <div className={styles.itemHeader}>
                        <p className={styles.itemHeaderName}>ชื่อ</p>
                        <p className={styles.itemHeaderQty}>จำนวน</p>
                    </div>

                    {orderItems.map((item) => (
                        <div key={item.name} className={styles.orderItem}>
                            {/* รูปภาพ */}
                            <Image 
                                src={item.imageUrl} 
                                alt={item.name} 
                                width={80} 
                                height={80} 
                                style={{ objectFit: 'cover', borderRadius: '4px' }}
                            />
                            
                            <div className={styles.itemInfo}>
                                <p className={styles.itemName}>{item.name}</p>
                                <p className={styles.itemDescription}>
                                    ราคาต่อหน่วย: {item.price || 0} บาท
                                </p>
                            </div>
                            
                            <p className={styles.itemQuantity}>x {item.quantity}</p>
                        </div>
                    ))}
                </div>

                {/* สถานะคำสั่งซื้อ */}
                <div className={styles.statusSection}>
                    <p className={styles.sectionTitle}>สถานะ</p>
                    <div className={styles.trackingInfo}>
                        <p>
                            เลขพัสดุ: <span className={styles.trackingNumber}>{trackingNumber || 'ไม่มีเลขพัสดุ'}</span>
                            {trackingNumber && (
                                <>
                                    <button className={styles.trackingButton} onClick={handleCopy}>
                                        คัดลอก
                                    </button>
                                    <button className={styles.trackingButton} onClick={handleTrack}>
                                        ค้นหา
                                    </button>
                                </>
                            )}
                        </p>
                        <div className={styles.statusBox}>
                            {/* Icon จัดส่ง */}
                            <div className={styles.statusIconContainer}>
                                {/* ต้องมีไฟล์ /public/images/shipping_box.png */}
                                <img src="/images/shipping_box.png" alt="สถานะ" className={styles.statusIcon} />
                            </div>
                            
                            <p className={styles.orderStatusText}>{getStatusText(orderStatus)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* สรุปราคารวมด้านล่าง (Footer) */}
            <div className={styles.footerSummary}>
                <div className={styles.totalAmountBox}>
                    <p className={styles.totalLabel}>ยอดรวมการสั่งซื้อ</p>
                    <p className={styles.totalPrice}>
                        {totalPrice} ฿
                    </p>
                </div>
                <button className={styles.confirmReceivedButton}>
                    ชำระแล้ว
                </button>
            </div>
        </div>
    );
}