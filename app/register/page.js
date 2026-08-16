"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    router.push("/");
    router.refresh();
  };

  return (
    <div style={{ maxWidth: 380, margin: "40px auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 18 }}>สมัครสมาชิก</h1>
      <form onSubmit={submit} className="card" style={{ padding: 20, display: "grid", gap: 14 }}>
        <div>
          <label style={{ fontSize: 13, color: "#AEB8E0", display: "block", marginBottom: 6 }}>ชื่อผู้ใช้</label>
          <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div>
          <label style={{ fontSize: 13, color: "#AEB8E0", display: "block", marginBottom: 6 }}>รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        </div>
        {error && <p style={{ color: "#49CAFF", fontSize: 13, margin: 0 }}>{error}</p>}
        
        <button className="btn-primary" disabled={loading}>{loading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}</button>

        {/* ปุ่ม Google ล็อกอินในหน้าสมัครสมาชิก */}
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="btn-ghost"
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            background: "#fff",
            color: "#000",
            fontWeight: 500,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          สมัคร/เข้าสู่ระบบด้วย Google
        </button>

        <p style={{ fontSize: 13, color: "#7A85B8", textAlign: "center", margin: 0 }}>
          มีบัญชีอยู่แล้ว? <Link href="/login" style={{ color: "#49CAFF" }}>เข้าสู่ระบบ</Link>
        </p>
      </form>
    </div>
  );
}