// app/signin/page.js
import React from 'react';
import Link from 'next/link';

const SignInPage = () => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      backgroundColor: '#F7FAFC',
      position: 'relative'
    }}>
      
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

      <div style={{ 
        padding: '40px', 
        backgroundColor: 'white', 
        borderRadius: '10px', 
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        width: '350px',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '20px', color: '#2D3748' }}>Sign in</h1>
        
        {/* Form */}
        <form>
          <input 
            type="email" 
            placeholder="email" 
            style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #CBD5E0' }} 
          />
          <input 
            type="password" 
            placeholder="password" 
            style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '5px', border: '1px solid #CBD5E0' }} 
          />
          <button 
            type="submit" 
            style={{ 
              width: '100%', 
              padding: '12px', 
              backgroundColor: '#3B5D50', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px', 
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Sign in
          </button>
        </form>

        <p style={{ margin: '20px 0', color: '#A0AEC0' }}>or</p>

        {/* Social Logins */}
        <div>
          <button style={{ width: '100%', padding: '12px', marginBottom: '10px', border: '1px solid #CBD5E0', borderRadius: '5px', backgroundColor: 'white', cursor: 'pointer' }}>
            Sign in with Google
          </button>
          <button style={{ width: '100%', padding: '12px', border: '1px solid #CBD5E0', borderRadius: '5px', backgroundColor: 'white', cursor: 'pointer' }}>
            Sign in with Facebook
          </button>
        </div>
        
        {/* --- ส่วนที่เพิ่มเข้ามา --- */}
        <p style={{ marginTop: '20px' }}>
          Don't have an account?{' '}
          <Link href="/signup" style={{ color: '#3B5D50', textDecoration: 'underline' }}>
            Sign up
          </Link>
        </p>

      </div>
    </div>
  );
};

export default SignInPage;