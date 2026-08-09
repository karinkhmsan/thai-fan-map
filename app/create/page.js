"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Plus, X } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { compressImages } from "@/lib/compressImage";
import provincesRaw from "@/data/provinces-th.json";

const PinPicker = dynamic(() => import("@/components/PinPicker"), { ssr: false });

const PROVINCES = provincesRaw.map(([name]) => name);
const PROVINCE_CENTER = Object.fromEntries(provincesRaw.map(([name, lat, lon]) => [name, { lat, lon }]));
const MAX_IMAGES = 6;

export default function CreatePage() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("game");
  const [province, setProvince] = useState(PROVINCES[0]);
  const [district, setDistrict] = useState("");
  const [districtOptions, setDistrictOptions] = useState([]);
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]); // dataURL previews (local only)
  const [files, setFiles] = useState([]); // actual File objects to upload
  const [pinLat, setPinLat] = useState(null);
  const [pinLng, setPinLng] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const fileRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/districts?province=${encodeURIComponent(province)}`)
      .then((r) => r.json())
      .then((d) => setDistrictOptions(d.districts || []));
    setDistrict("");
  }, [province]);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      if (!d.user) router.push("/login");
    });
  }, [router]);

  const handleFiles = async (fileList) => {
    const arr = Array.from(fileList).slice(0, MAX_IMAGES - files.length);
    if (arr.length === 0) return;
    setPreparing(true);
    const compressed = await compressImages(arr);
    setFiles((prev) => [...prev, ...compressed].slice(0, MAX_IMAGES));
    compressed.forEach((f) => {
      const reader = new FileReader();
      reader.onload = () => setImages((prev) => [...prev, reader.result]);
      reader.readAsDataURL(f);
    });
    setPreparing(false);
  };

  const removeImage = (i) => {
    setImages((prev) => prev.filter((_, idx) => idx !== i));
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
  };

  const canSubmit = title.trim() && description.trim() && province && !submitting;

  const submit = async () => {
    setError(""); setSubmitting(true);
    try {
      let urls = [];
      if (files.length) {
        const fd = new FormData();
        files.forEach((f) => fd.append("images", f));
        const upRes = await fetch("/api/upload", { method: "POST", body: fd });
        const upData = await upRes.json();
        if (!upRes.ok) throw new Error(upData.error || "อัปโหลดรูปไม่สำเร็จ");
        urls = upData.urls;
      }
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category, province, district, description, images: urls, lat: pinLat, lng: pinLng }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/event/${data.event.id}`);
    } catch (e) {
      setError(e.message || "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 600, margin: "0 0 18px" }}>สร้างโพสต์งานใหม่</h1>
      <div className="card" style={{ padding: 20, display: "grid", gap: 16 }}>
        <Field label="ชื่องาน">
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="เช่น เชียงใหม่ Retro Game Fest" />
        </Field>

        <Field label="ประเภทงาน">
          <div style={{ display: "flex", gap: 8 }}>
            {CATEGORIES.map((c) => (
              <button key={c.id} type="button" onClick={() => setCategory(c.id)} className="chip"
                style={{ borderColor: category === c.id ? c.color : undefined, background: category === c.id ? c.color + "22" : undefined, color: category === c.id ? c.color : undefined }}>
                {c.label}
              </button>
            ))}
          </div>
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="จังหวัด">
            <select className="input" value={province} onChange={(e) => setProvince(e.target.value)}>
              {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="อำเภอ">
            {districtOptions.length > 0 ? (
              <select className="input" value={district} onChange={(e) => setDistrict(e.target.value)}>
                <option value="">-- เลือกอำเภอ --</option>
                {districtOptions.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            ) : (
              <input className="input" value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="พิมพ์ชื่ออำเภอ" />
            )}
          </Field>
        </div>

        <Field label="รายละเอียดงาน">
          <textarea className="input" rows={5} value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="บอกเล่ารายละเอียดงาน สถานที่ วันเวลา กิจกรรมภายในงาน..." style={{ resize: "vertical", fontFamily: "inherit" }} />
        </Field>

        <Field label={`รูปภาพ (สูงสุด ${MAX_IMAGES} รูป)`}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {images.map((img, i) => (
              <div key={i} style={{ position: "relative", width: 84, height: 84 }}>
                <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }} />
                <button type="button" onClick={() => removeImage(i)}
                  style={{ position: "absolute", top: -6, right: -6, background: "#FF3D8A", border: "none", borderRadius: "50%", width: 20, height: 20, color: "#fff", cursor: "pointer" }}>
                  <X size={12} />
                </button>
              </div>
            ))}
            {images.length < MAX_IMAGES && (
              <div onClick={() => !preparing && fileRef.current.click()} style={{ width: 84, height: 84, borderRadius: 10, border: "1.5px dashed rgba(255,255,255,0.25)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: preparing ? "wait" : "pointer", color: "#8177AE", gap: 4, opacity: preparing ? 0.5 : 1 }}>
                <Plus size={18} /><span style={{ fontSize: 11 }}>{preparing ? "กำลังเตรียมรูป..." : "เพิ่มรูป"}</span>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => handleFiles(e.target.files)} />
          </div>
        </Field>

        <Field label="ปักหมุดตำแหน่งแม่นยำ (ไม่บังคับ)">
          <PinPicker
            lat={pinLat}
            lng={pinLng}
            centerLat={PROVINCE_CENTER[province]?.lat}
            centerLng={PROVINCE_CENTER[province]?.lon}
            onChange={(la, lo) => { setPinLat(la); setPinLng(lo); }}
          />
        </Field>

        {error && <p style={{ color: "#FF3D8A", fontSize: 13, margin: 0 }}>{error}</p>}
        <button disabled={!canSubmit} onClick={submit} className="btn-primary" style={{ opacity: canSubmit ? 1 : 0.4, padding: 12, fontSize: 15 }}>
          {submitting ? "กำลังโพสต์..." : "โพสต์งานลงแผนที่"}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 13, color: "#B8AEDB", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}