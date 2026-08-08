"use client";
import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Tooltip, ZoomControl, useMap } from "react-leaflet";
import L from "leaflet";
import * as topojson from "topojson-client";
import provincesRaw from "@/data/provinces-th.json";

const PROVINCES = provincesRaw.map(([name, lat, lon, nameEn]) => ({ name, lat, lon, nameEn }));

// property key ที่ไฟล์ GeoJSON ต้นทาง (apisit/thailand.json) ใช้เก็บชื่อจังหวัด — เป็นภาษาอังกฤษ
// เช่น "Mae Hong Son" — เผื่อไฟล์แหล่งอื่นใช้คีย์ชื่ออื่น เลยลองไล่หลายคีย์ไว้ด้วย
const NAME_KEYS = ["name", "NAME_1", "PROV_NAMT", "CHANGWAT_T", "changwat_t", "ADM1_TH", "province", "Prov_Name", "NAME_TH"];

const normalize = (s) => s.toLowerCase().replace(/[^a-zก-๙]/g, "");

function findFeatureProvinceName(feature) {
  const props = feature.properties || {};
  for (const key of NAME_KEYS) {
    if (props[key]) {
      const val = normalize(String(props[key]));
      const match = PROVINCES.find((p) => {
        const enNorm = normalize(p.nameEn || "");
        const thNorm = normalize(p.name);
        return val === enNorm || val === thNorm || (enNorm && (val.includes(enNorm) || enNorm.includes(val)));
      });
      if (match) return match.name;
    }
  }
  return null;
}

// ซูม/เลื่อนแผนที่ให้พอดีกับขอบเขตประเทศไทยอัตโนมัติ แล้วล็อกไม่ให้ซูมออกไกลกว่านี้
function FitBounds({ geo }) {
  const map = useMap();
  useEffect(() => {
    if (!geo) return;
    const bounds = L.geoJSON(geo).getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [24, 24] });
    }
  }, [geo, map]);
  return null;
}

export default function ThailandMap({ eventsByProvince, catColor, onPinClick }) {
  const [geo, setGeo] = useState(null);
  const [geoFailed, setGeoFailed] = useState(false);

  useEffect(() => {
    fetch("/data/thailand-provinces.geojson")
      .then((res) => {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then((data) => {
        // รองรับทั้งไฟล์ GeoJSON ตรงๆ (FeatureCollection) และไฟล์ TopoJSON ที่ต้องแปลงก่อน
        const converted = data.type === "Topology"
          ? topojson.feature(data, data.objects[Object.keys(data.objects)[0]])
          : data;
        setGeo(converted);
      })
      .catch(() => setGeoFailed(true));
  }, []);

  const provincesWithEvents = useMemo(
    () => PROVINCES.filter((p) => eventsByProvince[p.name]?.length),
    [eventsByProvince]
  );

  return (
    <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
      <MapContainer
        center={[13.7563, 100.5018]}
        zoom={6}
        minZoom={4}
        maxZoom={18}
        style={{ height: "100%", width: "100%", borderRadius: 0 }}
        zoomControl={false}
        scrollWheelZoom={true}
      >
        {/* แผนที่จริง สีสัน มีถนน แม่น้ำ ทะเล และชื่อเมือง/จังหวัดให้เห็นชัดเจน */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        <ZoomControl position="bottomleft" />

        <FitBounds geo={geo} />

        {geo && (
          <GeoJSON
            data={geo}
            style={(feature) => {
              const name = findFeatureProvinceName(feature);
              const hasEvents = name && eventsByProvince[name]?.length;
              const color = hasEvents ? catColor(eventsByProvince[name][0].category) : "#7F49FF";
              return {
                color,
                weight: hasEvents ? 2 : 1.4,
                opacity: hasEvents ? 0.9 : 0.55,
                fillColor: hasEvents ? catColor(eventsByProvince[name][0].category) : "#7F49FF",
                fillOpacity: hasEvents ? 0.28 : 0.04,
              };
            }}
            onEachFeature={(feature, layer) => {
              const name = findFeatureProvinceName(feature);
              if (name) {
                layer.bindTooltip(`${name} · ${eventsByProvince[name]?.length || 0} งาน`, { sticky: true });
                layer.on("click", () => onPinClick(name));
                layer.on("mouseover", () => layer.setStyle({ fillOpacity: 0.55 }));
                layer.on("mouseout", () => layer.setStyle({ fillOpacity: eventsByProvince[name]?.length ? 0.28 : 0.04 }));
              }
            }}
          />
        )}

        {/* หมุดสำหรับจังหวัดที่มีงาน วางทับไว้เสมอ ใช้ได้แม้โหลดขอบเขตจริงไม่สำเร็จ */}
        {provincesWithEvents.map((p) => {
          const evs = eventsByProvince[p.name];
          return (
            <CircleMarker
              key={p.name}
              center={[p.lat, p.lon]}
              radius={evs.length > 2 ? 9 : 6}
              pathOptions={{ color: "#150F2E", weight: 1.5, fillColor: catColor(evs[0].category), fillOpacity: 0.95 }}
              eventHandlers={{ click: () => onPinClick(p.name) }}
            >
              <Tooltip>{p.name} · {evs.length} งาน</Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {geoFailed && (
        <div style={{ position: "absolute", bottom: 90, left: 14, right: 14, zIndex: 5, background: "rgba(21,15,46,0.9)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "8px 12px", fontSize: 12, color: "#B8AEDB" }}>
          ยังไม่พบไฟล์ขอบเขตจังหวัดจริง — รันคำสั่ง <code>npm run setup:geo</code> แล้วรีสตาร์ตแอป (ตอนนี้ใช้หมุดแสดงตำแหน่งแทน)
        </div>
      )}
    </div>
  );
}