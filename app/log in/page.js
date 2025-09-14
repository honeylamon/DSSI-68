"use client";
import { useState } from "react";
import pb from "../lip/pocketbase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await pb.collection("users").authWithPassword(email, password);
      alert("เข้าสู่ระบบสำเร็จ!");
      window.location.href = "/";
    } catch (err) {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await pb.collection("users").authWithOAuth2({ provider: "google" });
      window.location.href = "/";
    } catch (err) {
      setError("Google Login ล้มเหลว");
    }
  };

  const handleFacebookLogin = async () => {
    try {
      await pb.collection("users").authWithOAuth2({ provider: "facebook" });
      window.location.href = "/";
    } catch (err) {
      setError("Facebook Login ล้มเหลว");
    }
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "50px auto",
        padding: "20px",
        textAlign: "center",
        border: "1px solid #ddd",
        borderRadius: "10px",
        background: "#fff",
      }}
    >
      <h2>Sign in</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", padding: "10px", margin: "10px 0" }}
        />
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", padding: "10px", margin: "10px 0" }}
        />
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
          }}
        >
          เข้าสู่ระบบ
        </button>
      </form>

      <p style={{ margin: "15px 0" }}>or</p>

      <button
        onClick={handleGoogleLogin}
        style={{
          width: "100%",
          padding: "10px",
          margin: "5px 0",
          backgroundColor: "white",
          border: "1px solid #ddd",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        <img
          src="/images/google.png"
          width="20"
          style={{ verticalAlign: "middle", marginRight: "8px" }}
        />
        Sign in with Google
      </button>

      <button
        onClick={handleFacebookLogin}
        style={{
          width: "100%",
          padding: "10px",
          margin: "5px 0",
          backgroundColor: "white",
          border: "1px solid #ddd",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        <img
          src="/images/facebook.png"
          width="20"
          style={{ verticalAlign: "middle", marginRight: "8px" }}
        />
        Sign in with Facebook
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
