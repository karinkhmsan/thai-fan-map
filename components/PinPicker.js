"use client";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { AlertTriangle, X } from "lucide-react";

// ไอคอนหมุดสีธีมเว็บ (ค่า default ของ react-leaflet ชี้ไปที่รูปที่ไม่มีอยู่จริงถ้าไม่ตั้งเอง)
const pinIcon = new L.DivIcon({
  html: `<div style="width:26px;height:26px;border-radius:50% 50% 50% 0;background:linear-gradient(135deg,#FF3D8A,#7F49FF);transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>`,
  className: "",
  iconSize: [26, 26],
  iconAnchor: [13, 26],
});

function ClickCatcher({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// mini map ให้ผู้โพสต์เลือกปักหมุดตำแหน่งแม่นยำ (ไม่บังคับ) — ใช้ในหน้าสร้าง/แก้ไขโพสต์
export default function PinPicker({ lat, lng, centerLat, centerLng, onChange }) {
  const hasPin = lat != null && lng != null;
  const center = hasPin ? [lat, lng] : [centerLat || 13.7563, centerLng || 100.5018];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 6, background: "rgba(255,193,69,0.08)", border: "1px solid rgba(255,193,69,0.25)", borderRadius: 10, padding: "10px 12px", marginBottom: 10, fontSize: 12, color: "#FFC145", lineHeight: 1.6 }}>
        <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>
          ปักหมุดได้เฉพาะ<b>สถานที่สาธารณะ</b>ที่เปิดให้คนทั่วไปเข้าร่วมได้จริงเท่านั้น
          ห้ามปักที่พักส่วนตัวหรือใช้ระบุตำแหน่งของบุคคลใดบุคคลหนึ่งเป็นการเฉพาะ
        </span>
      </div>

      <div style={{ position: "relative", height: 220, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.12)" }}>
        <MapContainer center={center} zoom={hasPin ? 15 : 11} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
            maxZoom={20}
            attribution='&copy; OpenStreetMap &copy; CARTO'
          />
          <ClickCatcher onPick={(la, lo) => onChange(la, lo)} />
          {hasPin && (
            <Marker
              position={[lat, lng]}
              icon={pinIcon}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const p = e.target.getLatLng();
                  onChange(p.lat, p.lng);
                },
              }}
            />
          )}
        </MapContainer>

        {hasPin && (
          <button
            type="button"
            onClick={() => onChange(null, null)}
            style={{ position: "absolute", top: 8, right: 8, zIndex: 500, background: "rgba(21,15,46,0.9)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "5px 10px", fontSize: 12, color: "#FF3D8A", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
          >
            <X size={12} /> ล้างหมุด
          </button>
        )}
      </div>
      <p style={{ fontSize: 11, color: "#5A5182", margin: "6px 0 0" }}>
        {hasPin ? "แตะที่แผนที่หรือลากหมุดเพื่อปรับตำแหน่ง" : "แตะบนแผนที่เพื่อปักหมุด (ไม่บังคับ — ข้ามได้ถ้าไม่สะดวก)"}
      </p>
    </div>
  );
}