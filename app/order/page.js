// app/order/page.js
'use client'; // เพิ่มเพื่อให้สามารถใช้ Client Component ภายในได้

import React from 'react';
import OrderPage from '../components/OrderPage';

export default function PlaceOrder() {
  return (
    <main>
      <OrderPage />
    </main>
  );
}