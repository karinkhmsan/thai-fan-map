"use client";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";

const pinIcon = new L.DivIcon({
  html: `<div style="width:26px;height:26px;border-radius:50% 50% 50% 0;background:linear-gradient(135deg,#49CAFF,#5271FF);transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>`,
  className: "",
  iconSize: [26, 26],
  iconAnchor: [13, 26],
});

// แผนที่ขนาดเล็กแบบดูอย่างเดียว โชว์ตำแหน่งที่ผู้โพสต์ปักหมุดไว้ ในหน้ารายละเอียดโพสต์
export default function EventLocationMap({ lat, lng }) {
  return (
    <div style={{ height: 180, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
      <MapContainer center={[lat, lng]} zoom={15} style={{ height: "100%", width: "100%" }} dragging={false} scrollWheelZoom={false} doubleClickZoom={false} zoomControl={false} touchZoom={false}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
          attribution='&copy; OpenStreetMap &copy; CARTO'
        />
        <Marker position={[lat, lng]} icon={pinIcon} />
      </MapContainer>
    </div>
  );
}