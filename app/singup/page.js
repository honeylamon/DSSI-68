// app/signup/page.js
import React from 'react';
import Link from 'next/link';

const SignUpPage = () => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      backgroundColor: '#F7FAFC',
      position: 'relative'
    }}>
      
      {/* --- ส่วนที่แก้ไข --- */}
      <Link href="/" style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textDecoration: 'none',
        color: '#4A5568',
        fontSize: '24px',
        border: '1px solid #E2E8F0'
      }}>
        &larr;
      </Link>
      {/* --- จบส่วนที่แก้ไข --- */}

      <div style={{ 
        padding: '40px', 
        backgroundColor: 'white', 
        borderRadius: '10px', 
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        width: '350px',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '20px', color: '#2D3748' }}>Sign up</h1>
        
        {/* ... โค้ดส่วนที่เหลือเหมือนเดิม ... */}
        
        <p style={{ marginTop: '20px' }}>
          Already have an account?{' '}
          <Link href="/signin" style={{ color: '#3B5D50', textDecoration: 'underline' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;