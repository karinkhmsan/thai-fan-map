"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { MapPin, Search, Plus, Shield, User, Rss, Menu, Heart, LogOut, LogIn, X, BarChart3, FileText, ShieldCheck ,HelpCircle} from "lucide-react";
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
      {/* พื้นหลังจางๆ เมื่อ drawer เปิด กดเพื่อปิดได้ */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 90 }}
        />
      )}

      {/* หน้าต่างลอย (drawer) — เด้งออกมาจากฝั่งซ้ายเต็มความสูงจอ */}
      <div
        ref={drawerRef}
        style={{
          position: "fixed", top: 0, left: 0, height: "100vh", width: 264,
          maxWidth: "82vw", background: "#141A3D", zIndex: 100,
          transform: menuOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.25s ease", boxShadow: "4px 0 24px rgba(0,0,0,0.4)",
          display: "flex", flexDirection: "column", overflowY: "auto",
          borderRight: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 14px 10px" }}>
          <Link href="/" onClick={() => setMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: 17, textDecoration: "none", color: "#fff" }}>
            <MapPin size={19} color="#FFFFFF" />
            <span>FanQuest<span style={{ color: "#49CAFF" }}>Map</span></span>
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
          <MenuLink href="/" icon={<MapPin size={16} color="#FFFFFF" />} label="หน้าหลัก (แผนที่)" onClick={() => setMenuOpen(false)} />
          <MenuLink href="/feed" icon={<Rss size={16} color="#49CAFF" />} label="ฟีดโพสต์" onClick={() => setMenuOpen(false)} />
          <MenuLink href="/help" icon={<HelpCircle size={16} color="#7A85B8" />} label="วิธีใช้งาน" onClick={() => setMenuOpen(false)} />
          <MenuLink href="/support" icon={<Heart size={16} color="#49CAFF" />} label="สนับสนุนเรา" onClick={() => setMenuOpen(false)} />
          <button
            onClick={() => { setMenuOpen(false); setStatsOpen(true); }}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 8, background: "none", border: "none", color: "#E4E9FF", fontSize: 13, cursor: "pointer", textAlign: "left" }}
          >
            <BarChart3 size={16} color="#7A85B8" /> สถิติ
          </button>
          {user && (
            <MenuLink href="/profile" icon={<User size={16} color="#7A85B8" />} label="โปรไฟล์" onClick={() => setMenuOpen(false)} />
          )}
          {user && user.role === "ADMIN" && (
            <MenuLink href="/admin" icon={<Shield size={16} color="#7A85B8" />} label="Admin" onClick={() => setMenuOpen(false)} />
          )}
          <div style={{ height: 1, background: "rgba(255,255,255,0.16)", margin: "8px 4px" }} />
          <MenuLink href="/terms" icon={<FileText size={16} color="#7A85B8" />} label="ข้อกำหนดการใช้งาน" onClick={() => setMenuOpen(false)} />
          <MenuLink href="/privacy" icon={<ShieldCheck size={16} color="#7A85B8" />} label="นโยบายความเป็นส่วนตัว" onClick={() => setMenuOpen(false)} />
          <div style={{ height: 1, background: "rgba(255,255,255,0.16)", margin: "8px 4px" }} />
          {user ? (
            <button
              onClick={logout}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 8, background: "none", border: "none", color: "#49CAFF", fontSize: 13, cursor: "pointer", textAlign: "left" }}
            >
              <LogOut size={16} /> ออกจากระบบ
            </button>
          ) : (
            <MenuLink href="/login" icon={<LogIn size={16} color="#7A85B8" />} label="เข้าสู่ระบบ" onClick={() => setMenuOpen(false)} />
          )}
        </div>
      </div>

      {/* แถบบนสุด — ทุกอย่าง (ปุ่มเมนู, โลโก้, ค้นหา, โปรไฟล์, สร้างโพสต์) อยู่ในแถบเดียวกันจริงๆ
          ไม่ใช้ position:fixed ลอยทับอีกต่อไป กันปัญหาซ้อน/ล้นขอบแถบแบบที่ผ่านมา */}
      <header
        ref={headerRef}
        style={{
          position: "sticky", top: 0, zIndex: 50,
          backdropFilter: "blur(12px)", background: "rgba(11,14,46,0.92)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div
          className="navbar-row"
          style={{
            maxWidth: 1200, margin: "0 auto", padding: "10px 14px",
            display: "flex", alignItems: "center", gap: 10,
          }}
        >
          {/* ซ้าย: ปุ่มเมนู (3 ขีด) + โลโก้ */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="เมนู"
              style={{
                width: 36, height: 36, borderRadius: 10, padding: 0, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
                color: "#fff", cursor: "pointer",
              }}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            <Link href="/" className="navbar-logo" aria-label="FanQuestMap หน้าแรก">
              <MapPin size={19} color="#FFFFFF" />
              <span className="navbar-logo-text">
                FanQuest<span style={{ color: "#49CAFF" }}>Map</span>
              </span>
            </Link>
          </div>

          {/* กลาง: กล่องค้นหา ยืดเต็มพื้นที่ที่เหลือ */}
          <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
            <Search size={15} style={{ position: "absolute", left: 12, top: 10, color: "#7A85B8" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหางาน จังหวัด หรืออำเภอ..."
              className="input"
              style={{ paddingLeft: 34, width: "100%", height: 36, fontSize: 13 }}
            />
            {results.length > 0 && (
              <div className="card" style={{ position: "absolute", top: 42, left: 0, right: 0, maxHeight: 240, overflowY: "auto", padding: 6, zIndex: 60, background: "#141A3D" }}>
                {results.map((e) => (
                  <div key={e.id} onClick={() => { router.push(`/event/${e.id}`); setSearch(""); }}
                    style={{ padding: "8px 10px", borderRadius: 8, cursor: "pointer", display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "#fff" }}>{e.title}</span>
                    <span style={{ fontSize: 12, color: "#7A85B8" }}>{e.province}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ขวา: รูปโปรไฟล์ + ปุ่มสร้างโพสต์ อยู่ในแถวเดียวกัน ไม่ลอยแยกอีกแล้ว */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {user ? (
              <Link
                href="/profile"
                aria-label="โปรไฟล์"
                style={{
                  width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                  background: user.avatarUrl ? "transparent" : (user.avatarColor || "#5271FF"),
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 600, fontSize: 14, overflow: "hidden",
                  border: "2px solid #49CAFF",
                }}
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  user.username ? user.username[0].toUpperCase() : <User size={16} />
                )}
              </Link>
            ) : (
              <Link href="/login" className="btn-ghost" style={{ padding: "7px 12px", fontSize: 12, whiteSpace: "nowrap" }}>
                เข้าสู่ระบบ
              </Link>
            )}

            <Link
              href="/create"
              className="btn-primary"
              style={{ padding: "7px 12px", fontSize: 13, display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}
            >
              <Plus size={15} /> <span className="mobile-hide">สร้างโพสต์</span>
            </Link>
          </div>
        </div>
      </header>

      <StatsModal open={statsOpen} onClose={() => setStatsOpen(false)} />

      <style jsx>{`
        .navbar-logo {
          display: flex;
          align-items: center;
          gap: 6px;
          text-decoration: none;
          color: #fff;
          font-weight: 700;
          font-size: 16px;
          white-space: nowrap;
        }
        @media (max-width: 640px) {
          .navbar-logo-text {
            display: none;
          }
          .navbar-row {
            padding: 8px 10px !important;
            gap: 6px !important;
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
      style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 8, color: "#E4E9FF", fontSize: 13, textDecoration: "none" }}
    >
      {icon} {label}
    </Link>
  );
}