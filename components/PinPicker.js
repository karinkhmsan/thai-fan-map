"use client";
import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { AlertTriangle, X } from "lucide-react";

// ระยะห่างโดยประมาณ (กม.) จากจุดศูนย์กลางจังหวัด ถ้าเกินนี้แสดงว่าน่าจะปักผิดจังหวัด
// (ไม่มีขอบเขตจังหวัดจริงในระบบ ใช้ระยะจากจุดศูนย์กลางแทนแบบคร่าวๆ)
const PROVINCE_MISMATCH_KM = 120;

function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ซิงค์แผนที่กับจังหวัดที่เลือก: พอเปลี่ยนจังหวัด (centerLat/centerLng เปลี่ยน) ให้เลื่อนแผนที่ไปหาเลย
// ถ้ายังไม่ได้ปักหมุด ให้บินไปกลางจังหวัดนั้นเสมอ
// ถ้าปักหมุดไว้แล้ว จะไม่ดึงแผนที่หนีจากหมุดเดิม (เดี๋ยวผู้ใช้งง) แค่ขยับ view คร่าวๆ พอให้เห็นทั้งหมุดเก่ากับจังหวัดใหม่
function SyncToProvince({ centerLat, centerLng, hasPin, lat, lng }) {
  const map = useMap();
  const prevCenter = useRef(null);

  useEffect(() => {
    if (centerLat == null || centerLng == null) return;
    const changed =
      !prevCenter.current || prevCenter.current[0] !== centerLat || prevCenter.current[1] !== centerLng;
    prevCenter.current = [centerLat, centerLng];
    if (!changed) return;

    if (!hasPin) {
      map.flyTo([centerLat, centerLng], 11, { duration: 0.6 });
    } else {
      // มีหมุดอยู่แล้ว: ปรับมุมมองให้เห็นทั้งหมุดเดิมและจุดกลางจังหวัดใหม่ แทนที่จะกระโดดทิ้งหมุด
      map.flyToBounds(
        [
          [lat, lng],
          [centerLat, centerLng],
        ],
        { padding: [40, 40], maxZoom: 12, duration: 0.6 }
      );
    }
  }, [centerLat, centerLng, hasPin, lat, lng, map]);

  // เผื่อกล่องแผนที่เพิ่งถูกขยาย/แสดงผลครั้งแรก Leaflet มักคำนวณขนาดผิดจนมีแถบเทาว่างๆ
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 250);
    return () => clearTimeout(t);
  }, [map]);

  return null;
}

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

  const mismatchKm =
    hasPin && centerLat != null && centerLng != null ? distanceKm(lat, lng, centerLat, centerLng) : 0;
  const looksMismatched = mismatchKm > PROVINCE_MISMATCH_KM;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 6, background: "rgba(255,193,69,0.08)", border: "1px solid rgba(255,193,69,0.25)", borderRadius: 10, padding: "10px 12px", marginBottom: 10, fontSize: 12, color: "#FFC145", lineHeight: 1.6 }}>
        <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>
          ปักหมุดได้เฉพาะ<b>สถานที่สาธารณะ</b>ที่เปิดให้คนทั่วไปเข้าร่วมได้จริงเท่านั้น
          ห้ามปักที่พักส่วนตัวหรือใช้ระบุตำแหน่งของบุคคลใดบุคคลหนึ่งเป็นการเฉพาะ
        </span>
      </div>

      {looksMismatched && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 6, background: "rgba(255,61,138,0.08)", border: "1px solid rgba(255,61,138,0.3)", borderRadius: 10, padding: "10px 12px", marginBottom: 10, fontSize: 12, color: "#FF3D8A", lineHeight: 1.6 }}>
          <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>หมุดที่ปักอยู่ไกลจากจังหวัดที่เลือกไว้พอสมควร ลองเช็คว่าเลือกจังหวัดถูกต้องหรือปักหมุดผิดตำแหน่งหรือเปล่า</span>
        </div>
      )}

      {/* กล่องแผนที่: ขยายเป็น responsive (vh แทน px ตายตัว) ให้ใช้งานง่ายขึ้นทั้งจอเล็ก/จอใหญ่ */}
      <div
        className="pin-picker-map"
        style={{ position: "relative", height: "min(52vh, 420px)", minHeight: 260, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.12)" }}
      >
        <MapContainer center={center} zoom={hasPin ? 15 : 11} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true} tap={true}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
            maxZoom={20}
            attribution='&copy; OpenStreetMap &copy; CARTO'
          />
          <SyncToProvince centerLat={centerLat} centerLng={centerLng} hasPin={hasPin} lat={lat} lng={lng} />
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