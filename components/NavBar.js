"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { MapPin, Search, Plus, Shield, User, Rss, Menu, Heart, LogOut, LogIn, X, BarChart3, FileText, ShieldCheck } from "lucide-react";
import StatsModal from "./StatsModal";

export default function NavBar({ initialUser }) {
  const [user, setUser] = useState(initialUser);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const router = useRouter();
  const headerRef = useRef(null);
  const drawerRef = useRef(null);

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  // วัดความสูงจริงของแถบบน แล้วเก็บไว้เป็น CSS variable
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const setVar = () => {
      document.documentElement.style.setProperty("--navbar-h", `${el.offsetHeight}px`);
    };
    setVar();
    const ro = new ResizeObserver(setVar);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!search.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/events/search?q=${encodeURIComponent(search.trim())}`);
      const { events } = await res.json();
      setResults(events || []);
    }, 200);
    return () => clearTimeout(t);
  }, [search]);

  // ปิดเมนู (drawer ซ้าย) เมื่อคลิกข้างนอก
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  // ปิด drawer ด้วยปุ่ม Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const logout = async () => {
    setMenuOpen(false);
    await fetch("/api/auth/logout", { method: "POST" });
    await signOut({ redirect: false });
    router.push("/");
    router.refresh();
  };

  return (
    <>
      {/* ปุ่มเมนูรวม (3 ขีด) — ลอยยึดมุมซ้ายบนตลอด ไม่อยู่ในแถบเนื้อหากลางจอแล้ว */}
      <button
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="เมนู"
        style={{
          position: "fixed", top: 14, left: 14, zIndex: 210,
          width: 40, height: 40, borderRadius: 12, padding: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(21,15,46,0.92)", border: "1px solid rgba(255,255,255,0.12)",
          color: "#fff", cursor: "pointer", backdropFilter: "blur(8px)",
        }}
      >
        {menuOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* พื้นหลังจางๆ เมื่อ drawer เปิด กดเพื่อปิดได้ */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 195 }}
        />
      )}

      {/* หน้าต่างลอย (drawer) — เด้งออกมาจากฝั่งซ้ายเต็มความสูงจอ */}
      <div
        ref={drawerRef}
        style={{
          position: "fixed", top: 0, left: 0, height: "100vh", width: 264,
          maxWidth: "82vw", background: "#191332", zIndex: 200,
          transform: menuOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.25s ease", boxShadow: "4px 0 24px rgba(0,0,0,0.4)",
          display: "flex", flexDirection: "column", overflowY: "auto",
          borderRight: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 14px 10px" }}>
          <Link href="/" onClick={() => setMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: 17, textDecoration: "none", color: "#fff" }}>
            <MapPin size={19} color="#FFC145" />
            <span>FanQuest<span style={{ color: "#FF3D8A" }}>Map</span></span>
          </Link>
          <button
            onClick={() => setMenuOpen(false)}
            className="btn-ghost"
            style={{ width: 30, height: 30, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
            aria-label="ปิดเมนู"
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: 6 }}>
          <MenuLink href="/" icon={<MapPin size={16} color="#FFC145" />} label="หน้าหลัก (แผนที่)" onClick={() => setMenuOpen(false)} />
          <MenuLink href="/feed" icon={<Rss size={16} color="#FF3D8A" />} label="ฟีดโพสต์" onClick={() => setMenuOpen(false)} />
          <MenuLink href="/support" icon={<Heart size={16} color="#FF3D8A" />} label="สนับสนุนเรา" onClick={() => setMenuOpen(false)} />
          <button
            onClick={() => { setMenuOpen(false); setStatsOpen(true); }}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 8, background: "none", border: "none", color: "#E4DEFF", fontSize: 13, cursor: "pointer", textAlign: "left" }}
          >
            <BarChart3 size={16} color="#8177AE" /> สถิติ
          </button>
          {user && (
            <MenuLink href="/profile" icon={<User size={16} color="#8177AE" />} label="โปรไฟล์" onClick={() => setMenuOpen(false)} />
          )}
          {user && user.role === "ADMIN" && (
            <MenuLink href="/admin" icon={<Shield size={16} color="#8177AE" />} label="Admin" onClick={() => setMenuOpen(false)} />
          )}
          <div style={{ height: 1, background: "rgba(255,255,255,0.16)", margin: "8px 4px" }} />
          <MenuLink href="/terms" icon={<FileText size={16} color="#8177AE" />} label="ข้อกำหนดการใช้งาน" onClick={() => setMenuOpen(false)} />
          <MenuLink href="/privacy" icon={<ShieldCheck size={16} color="#8177AE" />} label="นโยบายความเป็นส่วนตัว" onClick={() => setMenuOpen(false)} />
          <div style={{ height: 1, background: "rgba(255,255,255,0.16)", margin: "8px 4px" }} />
          {user ? (
            <button
              onClick={logout}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 8, background: "none", border: "none", color: "#FF3D8A", fontSize: 13, cursor: "pointer", textAlign: "left" }}
            >
              <LogOut size={16} /> ออกจากระบบ
            </button>
          ) : (
            <MenuLink href="/login" icon={<LogIn size={16} color="#8177AE" />} label="เข้าสู่ระบบ" onClick={() => setMenuOpen(false)} />
          )}
        </div>
      </div>

      {/* รูปโปรไฟล์ / ล็อกอิน — ลอยยึดมุมขวาบน */}
      {user ? (
        <Link
          href="/profile"
          style={{
            position: "fixed", top: 14, right: 14, zIndex: 210,
            width: 40, height: 40, borderRadius: "50%",
            background: user.avatarUrl ? "transparent" : (user.avatarColor || "#E91E63"),
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 600, fontSize: 15, overflow: "hidden",
            border: "2px solid #FF3D8A",
          }}
        >
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            user.username ? user.username[0].toUpperCase() : <User size={18} />
          )}
        </Link>
      ) : (
        <Link
          href="/login"
          className="btn-ghost"
          style={{ position: "fixed", top: 14, right: 14, zIndex: 210, padding: "8px 14px", fontSize: 12 }}
        >
          เข้าสู่ระบบ
        </Link>
      )}

      {/* ปุ่มสร้างโพสต์ — ดึงลงมาอยู่ใต้รูปโปรไฟล์ ฝั่งขวา */}
      <Link
        href="/create"
        className="btn-primary"
        style={{
          position: "fixed", top: 62, right: 14, zIndex: 210,
          padding: "7px 14px", fontSize: 13, display: "flex", alignItems: "center", gap: 4,
          boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
        }}
      >
        <Plus size={15} /> <span className="mobile-hide">สร้างโพสต์</span>
      </Link>

      {/* โลโก้ — ลอยยึดข้างปุ่มเมนู มุมซ้ายบน ให้เห็นแบรนด์ตลอดแม้ไม่เปิดเมนู */}
      <Link href="/" className="navbar-logo" aria-label="FanQuestMap หน้าแรก">
        <MapPin size={19} color="#FFC145" />
        <span className="navbar-logo-text">
          FanQuest<span style={{ color: "#FF3D8A" }}>Map</span>
        </span>
      </Link>

      <header ref={headerRef} style={{ position: "sticky", top: 0, zIndex: 50, backdropFilter: "blur(12px)", background: "rgba(21,15,46,0.92)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="navbar-search-row" style={{ maxWidth: 1000, margin: "0 auto", padding: "10px 66px", display: "flex", flexDirection: "column", gap: 10 }}>

          {/* แถบล่าง: กล่องค้นหา (ปุ่มเมนู/โปรไฟล์/สร้างโพสต์ย้ายไปลอยมุมจอแล้ว เว้นที่ตรงนี้ไว้ให้ค้นหาเต็มแถว) */}
          <div style={{ position: "relative", width: "100%" }}>
            <Search size={15} style={{ position: "absolute", left: 12, top: 10, color: "#8177AE" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหางาน จังหวัด หรืออำเภอ..."
              className="input"
              style={{ paddingLeft: 34, width: "100%", height: 36, fontSize: 13 }}
            />
            {results.length > 0 && (
              <div className="card" style={{ position: "absolute", top: 42, left: 0, right: 0, maxHeight: 240, overflowY: "auto", padding: 6, zIndex: 60, background: "#191332" }}>
                {results.map((e) => (
                  <div key={e.id} onClick={() => { router.push(`/event/${e.id}`); setSearch(""); }}
                    style={{ padding: "8px 10px", borderRadius: 8, cursor: "pointer", display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "#fff" }}>{e.title}</span>
                    <span style={{ fontSize: 12, color: "#8177AE" }}>{e.province}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </header>

      <StatsModal open={statsOpen} onClose={() => setStatsOpen(false)} />

      <style jsx>{`
        .navbar-logo {
          position: fixed;
          top: 14px;
          left: 64px;
          z-index: 210;
          height: 40px;
          display: flex;
          align-items: center;
          gap: 6px;
          text-decoration: none;
          color: #fff;
          font-weight: 700;
          font-size: 16px;
          white-space: nowrap;
        }
        .navbar-search-row {
          padding-left: 200px !important;
        }
        @media (max-width: 640px) {
          .navbar-logo-text {
            display: none;
          }
          .navbar-search-row {
            padding-left: 66px !important;
          }
        }
      `}</style>
    </>
  );
}

function MenuLink({ href, icon, label, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 8, color: "#E4DEFF", fontSize: 13, textDecoration: "none" }}
    >
      {icon} {label}
    </Link>
  );
}