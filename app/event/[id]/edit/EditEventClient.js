"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, X, ArrowLeft, Trash2 } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { compressImages } from "@/lib/compressImage";
import provincesRaw from "@/data/provinces-th.json";

const PROVINCES = provincesRaw.map(([name]) => name);
const MAX_IMAGES = 6;

export default function EditEventClient({ event }) {
  const [title, setTitle] = useState(event.title);
  const [category, setCategory] = useState(event.category);
  const [province, setProvince] = useState(event.province);
  const [district, setDistrict] = useState(event.district || "");
  const [districtOptions, setDistrictOptions] = useState([]);
  const [description, setDescription] = useState(event.description);
  const [images, setImages] = useState(event.images || []); // ผสม URL เดิม + dataURL ที่เพิ่งเพิ่ม
  const [newFiles, setNewFiles] = useState([]); // ไฟล์ใหม่ที่ต้องอัปโหลดตอนบันทึก
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const fileRef = useRef(null);
  const router = useRouter();
  const isFirstRun = useRef(true);

  // โหลดรายชื่ออำเภอตามจังหวัด แต่ไม่ล้างค่า district เดิมตอนโหลดครั้งแรก
  useEffect(() => {
    fetch(`/api/districts?province=${encodeURIComponent(province)}`)
      .then((r) => r.json())
      .then((d) => setDistrictOptions(d.districts || []));
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    setDistrict("");
  }, [province]);

  const handleFiles = async (fileList) => {
    const arr = Array.from(fileList).slice(0, MAX_IMAGES - images.length);
    if (arr.length === 0) return;
    setPreparing(true);
    const compressed = await compressImages(arr);
    setNewFiles((prev) => [...prev, ...compressed].slice(0, MAX_IMAGES));
    compressed.forEach((f) => {
      const reader = new FileReader();
      reader.onload = () => setImages((prev) => [...prev, reader.result]);
      reader.readAsDataURL(f);
    });
    setPreparing(false);
  };

  const removeImage = (i) => {
    const removedUrl = images[i];
    // ถ้ารูปที่ลบเป็นรูปเดิม (URL จาก server) ไม่ต้องยุ่งกับ newFiles
    // ถ้าเป็นรูปใหม่ที่เพิ่งเพิ่ม (dataURL) ต้องตัดออกจาก newFiles ด้วยไม่งั้นจะอัปโหลดซ้ำ
    const isExisting = event.images.includes(removedUrl);
    if (!isExisting) {
      const newIndex = images.slice(0, i).filter((img) => !event.images.includes(img)).length;
      setNewFiles((prev) => prev.filter((_, idx) => idx !== newIndex));
    }
    setImages((prev) => prev.filter((_, idx) => idx !== i));
  };

  const canSubmit = title.trim() && description.trim() && province && !submitting;

  const submit = async () => {
    setError(""); setSubmitting(true);
    try {
      // อัปโหลดเฉพาะรูปใหม่ที่ยังไม่มี URL (dataURL ในเครื่อง)
      let uploadedUrls = [];
      if (newFiles.length) {
        const fd = new FormData();
        newFiles.forEach((f) => fd.append("images", f));
        const upRes = await fetch("/api/upload", { method: "POST", body: fd });
        const upData = await upRes.json();
        if (!upRes.ok) throw new Error(upData.error || "อัปโหลดรูปไม่สำเร็จ");
        uploadedUrls = upData.urls;
      }

      // รวมรูปเดิมที่เหลืออยู่ (ยังไม่ถูกลบ) กับรูปใหม่ที่อัปโหลดเสร็จแล้ว ตามลำดับเดิม
      let uploadIdx = 0;
      const finalImages = images.map((img) =>
        event.images.includes(img) ? img : uploadedUrls[uploadIdx++]
      );

      const res = await fetch(`/api/events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category, province, district, description, images: finalImages }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/event/${event.id}`);
    } catch (e) {
      setError(e.message || "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async () => {
    if (!confirm("ยืนยันลบโพสต์นี้?")) return;
    const res = await fetch(`/api/events/${event.id}`, { method: "DELETE" });
    if (res.ok) router.push("/profile");
  };

  return (
    <div>
      <Link href={`/event/${event.id}`} style={{ display: "flex", alignItems: "center", gap: 6, color: "#B8AEDB", fontSize: 13, textDecoration: "none", marginBottom: 12 }}>
        <ArrowLeft size={15} /> ย้อนกลับ
      </Link>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "0 0 18px" }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>แก้ไขโพสต์</h1>
        <button onClick={remove} style={{ background: "none", border: "none", color: "#FF3D8A", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
          <Trash2 size={15} /> ลบโพสต์
        </button>
      </div>

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

        {error && <p style={{ color: "#FF3D8A", fontSize: 13, margin: 0 }}>{error}</p>}
        <button disabled={!canSubmit} onClick={submit} className="btn-primary" style={{ opacity: canSubmit ? 1 : 0.4, padding: 12, fontSize: 15 }}>
          {submitting ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
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