"use client";
import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { List, X, MapPin } from "lucide-react";
import { CATEGORIES, catInfo } from "@/lib/categories";

const ThailandMap = dynamic(() => import("@/components/ThailandMap"), { ssr: false });

export default function HomeClient({ initialEvents }) {
  const [catFilter, setCatFilter] = useState("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const router = useRouter();

  const filteredEvents = useMemo(
    () => initialEvents.filter((e) => catFilter === "all" || e.category === catFilter),
    [initialEvents, catFilter]
  );

  const eventsByProvince = useMemo(() => {
    const map = {};
    filteredEvents.forEach((e) => {
      (map[e.province] = map[e.province] || []).push(e);
    });
    return map;
  }, [filteredEvents]);

  const pinnedEvents = useMemo(
    () => filteredEvents.filter((e) => e.lat != null && e.lng != null),
    [filteredEvents]
  );

  const goToEvent = (id) => router.push(`/event/${id}`);

  const PostItem = ({ e }) => (
    <button className="map-post-item" onClick={() => goToEvent(e.id)}>
      <span className="cat-dot" style={{ background: catInfo(e.category).color }} />
      <span className="map-post-text">
        <span className="map-post-title">{e.title}</span>
        <span className="map-post-loc">
          <MapPin size={10} /> {e.district ? `${e.district}, ` : ""}{e.province}
        </span>
      </span>
    </button>
  );

  return (
    <div className="map-page">
      {/* แผนที่จริงเต็มจอ */}
      <ThailandMap
        eventsByProvince={eventsByProvince}
        pinnedEvents={pinnedEvents}
        catColor={(id) => catInfo(id).color}
        onPinClick={(name) => router.push(`/province/${encodeURIComponent(name)}`)}
      />

      {/* มุมซ้ายบน: หัวข้อ + ตัวกรองหมวดหมู่ ลอยทับแผนที่ */}
      <div className="map-overlay-top">
        <div className="map-title card">
          <h1>แผนที่งานแฟนคลับทั่วไทย</h1>
          <p>คลิกจังหวัดหรือหมุดเพื่อดูงานในพื้นที่นั้นๆ</p>
        </div>
        <div className="map-filters">
          <button
            className={`chip ${catFilter === "all" ? "active" : ""}`}
            onClick={() => setCatFilter("all")}
            style={{
              borderColor: catFilter === "all" ? "#7F77DD" : undefined,
              background: catFilter === "all" ? "#7F77DD22" : "rgba(21,15,46,0.85)",
              color: catFilter === "all" ? "#7F77DD" : undefined,
            }}
          >
            ทั้งหมด
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              className={`chip ${catFilter === c.id ? "active" : ""}`}
              onClick={() => setCatFilter(c.id)}
              style={{
                borderColor: catFilter === c.id ? c.color : undefined,
                background: catFilter === c.id ? c.color + "22" : "rgba(21,15,46,0.85)",
                color: catFilter === c.id ? c.color : undefined,
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* มุมขวา: แผงโพสต์ต่างๆ (เดสก์ท็อป) */}
      <div className="map-posts-panel card">
        <div className="map-posts-header">
          <span>โพสต์ล่าสุด ({filteredEvents.length})</span>
        </div>
        <div className="map-posts-list">
          {filteredEvents.map((e) => (
            <PostItem key={e.id} e={e} />
          ))}
          {filteredEvents.length === 0 && (
            <p className="map-posts-empty">ยังไม่มีงานในหมวดนี้ ลองเป็นคนแรกที่โพสต์งานดูสิ!</p>
          )}
        </div>
      </div>

      {/* ปุ่มลอยเปิดรายการโพสต์ (มือถือ) */}
      <button className="mobile-posts-toggle" onClick={() => setSheetOpen(true)}>
        <List size={16} /> ดูโพสต์ทั้งหมด ({filteredEvents.length})
      </button>

      {/* แผ่นรายการโพสต์เลื่อนขึ้นจากด้านล่าง (มือถือ) */}
      {sheetOpen && (
        <div className="mobile-sheet-backdrop" onClick={() => setSheetOpen(false)}>
          <div className="mobile-sheet" onClick={(ev) => ev.stopPropagation()}>
            <div className="mobile-sheet-handle" />
            <div className="mobile-sheet-header">
              <span>โพสต์ทั้งหมด ({filteredEvents.length})</span>
              <button onClick={() => setSheetOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="mobile-sheet-list">
              {filteredEvents.map((e) => (
                <PostItem key={e.id} e={e} />
              ))}
              {filteredEvents.length === 0 && (
                <p className="map-posts-empty">ยังไม่มีงานในหมวดนี้ ลองเป็นคนแรกที่โพสต์งานดูสิ!</p>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .map-page {
          position: relative;
          isolation: isolate;
          width: 100%;
          height: calc(100vh - var(--navbar-h, 112px));
          height: calc(100dvh - var(--navbar-h, 112px));
          min-height: 420px;
          overflow: hidden;
        }

        .map-overlay-top {
          position: absolute;
          top: 14px;
          left: 14px;
          right: 14px;
          z-index: 30;
          transform: translateZ(0);
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-width: 320px;
          pointer-events: none;
        }
        .map-overlay-top > * {
          pointer-events: auto;
        }

        .map-title {
          padding: 12px 14px;
          background: rgba(21, 15, 46, 0.85);
          backdrop-filter: blur(10px);
        }
        .map-title h1 {
          font-size: 17px;
          font-weight: 600;
          margin: 0 0 3px;
        }
        .map-title p {
          font-size: 12px;
          color: #b8aedb;
          margin: 0;
        }

        .map-filters {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .map-filters :global(.chip) {
          font-size: 12px;
          padding: 6px 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.25);
        }

        .map-posts-panel {
          position: absolute;
          top: 64px;
          right: 14px;
          bottom: 14px;
          width: 300px;
          z-index: 30;
          transform: translateZ(0);
          background: rgba(21, 15, 46, 0.9);
          backdrop-filter: blur(12px);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .map-posts-header {
          padding: 14px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 14px;
          font-weight: 500;
          flex-shrink: 0;
        }
        .map-posts-list {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .map-posts-empty {
          padding: 20px 10px;
          text-align: center;
          font-size: 13px;
          color: #5a5182;
        }

        :global(.map-post-item) {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          text-align: left;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          padding: 9px 10px;
          cursor: pointer;
          color: #fff;
          font-family: inherit;
        }
        :global(.map-post-item:hover) {
          background: rgba(255, 255, 255, 0.09);
        }
        :global(.cat-dot) {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        :global(.map-post-text) {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        :global(.map-post-title) {
          font-size: 13px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        :global(.map-post-loc) {
          font-size: 11px;
          color: #8177ae;
          display: flex;
          align-items: center;
          gap: 3px;
        }

        .mobile-posts-toggle {
          display: none;
        }

        .mobile-sheet-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.55);
          z-index: 60;
          display: flex;
          align-items: flex-end;
        }
        .mobile-sheet {
          width: 100%;
          max-height: 72vh;
          border-radius: 20px 20px 0 0;
          background: #191332;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .mobile-sheet-handle {
          width: 40px;
          height: 4px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          margin: 10px auto 6px;
          flex-shrink: 0;
        }
        .mobile-sheet-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px 10px;
          font-size: 14px;
          font-weight: 500;
          flex-shrink: 0;
        }
        .mobile-sheet-header button {
          background: none;
          border: none;
          color: #b8aedb;
          cursor: pointer;
          padding: 4px;
        }
        .mobile-sheet-list {
          overflow-y: auto;
          padding: 4px 12px 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        @media (max-width: 768px) {
          .map-posts-panel {
            display: none;
          }
          .map-overlay-top {
            max-width: none;
          }
          .map-title p {
            display: none;
          }
          .map-title {
            padding: 10px 12px;
          }
          .map-title h1 {
            font-size: 15px;
          }
          .mobile-posts-toggle {
            display: flex;
            align-items: center;
            gap: 6px;
            position: fixed;
            bottom: calc(16px + env(safe-area-inset-bottom, 0px));
            left: 50%;
            transform: translateX(-50%) translateZ(0);
            z-index: 30;
            background: linear-gradient(135deg, #ff3d8a, #7f49ff);
            color: #fff;
            border: none;
            border-radius: 999px;
            padding: 10px 18px;
            font-size: 13px;
            font-weight: 500;
            font-family: inherit;
            cursor: pointer;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.45);
            white-space: nowrap;
          }
        }
      `}</style>
    </div>
  );
}