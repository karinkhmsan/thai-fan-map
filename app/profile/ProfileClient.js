"use client";
import { useState, useCallback } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Trash2, Camera, Link as LinkIcon, Edit3, Check, X } from "lucide-react";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/lib/cropImage";

export default function ProfileClient({ user, myEvents: initialEvents }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    bio: user.bio || "",
    avatarUrl: user.avatarUrl || "",
    facebookUrl: user.facebookUrl || "",
    instagramUrl: user.instagramUrl || "",
    tiktokUrl: user.tiktokUrl || "",
  });

  // State สำหรับการ Crop รูป
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const logout = async () => {
  await fetch("/api/auth/logout", { method: "POST" });
  await signOut({ redirect: false });
  router.push("/");
  router.refresh();
};

  const remove = async (id) => {
    if (!confirm("ยืนยันลบโพสต์นี้?")) return;
    const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  };

  // เลือกไฟล์แล้วเปิดหน้าต่าง Crop
  const onFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener("load", () => setImageSrc(reader.result));
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // กดยืนยัน Crop แล้วทำการ Upload ขึ้น R2
  const handleCropAndUpload = async () => {
    try {
      setUploading(true);
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const file = new File([croppedImageBlob], "avatar.jpg", { type: "image/jpeg" });

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      console.log("Upload Response Data:", data); // กด F12 ดูค่านี้ใน Console ได้เลย

      // รองรับชื่อฟิลด์ URL ทุกรูปแบบที่ API อาจจะส่งมา
      const uploadedUrl = data.url || data.publicUrl || data.location || (Array.isArray(data.urls) ? data.urls[0] : null);

      if (res.ok && uploadedUrl) {
        setForm((prev) => ({ ...prev, avatarUrl: uploadedUrl }));
        setImageSrc(null); // ปิด Pop-up
      } else {
        alert("อัปโหลดไม่สำเร็จ: " + (data.error || JSON.stringify(data)));
      }
    } catch (e) {
      console.error(e);
      alert("เกิดข้อผิดพลาดในการตัดขอบรูปภาพ: " + e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setIsEditing(false);
      router.refresh();
    }
  };

  return (
    <div style={{ maxWidth: 650, margin: "0 auto" }}>
      {/* Pop-up Modal สำหรับ Crop รูป */}
      {imageSrc && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.85)", zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ position: "relative", width: "100%", maxWidth: 400, height: 300, background: "#333", borderRadius: 12, overflow: "hidden" }}>
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>

          <div style={{ width: "100%", maxWidth: 400, marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#fff", fontSize: 12 }}>
              <span>Zoom</span>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-label="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                style={{ flex: 1 }}
              />
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setImageSrc(null)} style={{ padding: "8px 16px", background: "#444", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                <X size={14} /> ยกเลิก
              </button>
              <button onClick={handleCropAndUpload} disabled={uploading} style={{ padding: "8px 16px", background: "#E91E63", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                <Check size={14} /> {uploading ? "กำลังอัปโหลด..." : "ตกลง"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* การ์ดโปรไฟล์หลัก */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <div className="profile-header-row">
          <div style={{ position: "relative", width: 70, height: 70, flexShrink: 0 }}>
            {form.avatarUrl ? (
              <img src={form.avatarUrl} alt="avatar" style={{ width: 70, height: 70, borderRadius: "50%", objectFit: "cover" }} />
            ) : (
              <div style={{ width: 70, height: 70, borderRadius: "50%", background: user.avatarColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 600 }}>
                {user.username[0]}
              </div>
            )}
            {isEditing && (
              <label style={{ position: "absolute", bottom: 0, right: 0, background: "#E91E63", color: "#fff", padding: 6, borderRadius: "50%", cursor: "pointer" }}>
                <Camera size={14} />
                <input type="file" accept="image/*" onChange={onFileChange} style={{ display: "none" }} />
              </label>
            )}
          </div>

          <div className="profile-name-block" style={{ flex: 1, minWidth: 0 }}>
            <div className="profile-username" style={{ fontSize: 18, fontWeight: 600 }}>
              {user.username}
            </div>
            <div style={{ fontSize: 12, color: "#8177AE" }}>เข้าร่วมเมื่อ {new Date(user.createdAt).toLocaleDateString("th-TH")}</div>
          </div>

          <div className="profile-actions" style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setIsEditing(!isEditing)} className="btn-ghost" style={{ display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>
              <Edit3 size={14} /> {isEditing ? "ยกเลิก" : "แก้ไขโปรไฟล์"}
            </button>
            <button onClick={logout} className="btn-ghost" style={{ color: "#FF3D8A", whiteSpace: "nowrap" }}>ออกจากระบบ</button>
          </div>
        </div>

        {/* โหมดแก้ไขข้อมูล */}
        {isEditing ? (
          <form onSubmit={handleSave} style={{ display: "grid", gap: 12, marginTop: 16 }}>
            <div>
              <label style={{ fontSize: 12, color: "#B8AEDB" }}>แนะนำตัวเอง (Bio)</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="เพิ่มคำอธิบายเกี่ยวกับตัวคุณ..."
                rows={3}
                style={{ width: "100%", padding: 8, borderRadius: 8, background: "#1a1829", color: "#fff", border: "1px solid #332d4f" }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#B8AEDB" }}>Facebook URL</label>
              <input
                type="url"
                value={form.facebookUrl}
                onChange={(e) => setForm({ ...form, facebookUrl: e.target.value })}
                placeholder="https://facebook.com/yourprofile"
                style={{ width: "100%", padding: 8, borderRadius: 8, background: "#1a1829", color: "#fff", border: "1px solid #332d4f" }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#B8AEDB" }}>Instagram URL</label>
              <input
                type="url"
                value={form.instagramUrl}
                onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })}
                placeholder="https://instagram.com/yourprofile"
                style={{ width: "100%", padding: 8, borderRadius: 8, background: "#1a1829", color: "#fff", border: "1px solid #332d4f" }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#B8AEDB" }}>TikTok URL</label>
              <input
                type="url"
                value={form.tiktokUrl}
                onChange={(e) => setForm({ ...form, tiktokUrl: e.target.value })}
                placeholder="https://tiktok.com/@yourprofile"
                style={{ width: "100%", padding: 8, borderRadius: 8, background: "#1a1829", color: "#fff", border: "1px solid #332d4f" }}
              />
            </div>
            <button type="submit" style={{ padding: "10px 16px", background: "#E91E63", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 500, justifySelf: "start" }}>
              บันทึกการเปลี่ยนแปลง
            </button>
          </form>
        ) : (
          <div style={{ marginTop: 12 }}>
            {user.bio && <p style={{ fontSize: 14, color: "#D1C9EF", marginBottom: 12 }}>{user.bio}</p>}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 13 }}>
              {user.facebookUrl && (
                <a href={user.facebookUrl} target="_blank" rel="noreferrer" style={{ color: "#4267B2", display: "flex", alignItems: "center", gap: 4 }}>
                  <LinkIcon size={14} /> Facebook
                </a>
              )}
              {user.instagramUrl && (
                <a href={user.instagramUrl} target="_blank" rel="noreferrer" style={{ color: "#E1306C", display: "flex", alignItems: "center", gap: 4 }}>
                  <LinkIcon size={14} /> Instagram
                </a>
              )}
              {user.tiktokUrl && (
                <a href={user.tiktokUrl} target="_blank" rel="noreferrer" style={{ color: "#00f2fe", display: "flex", alignItems: "center", gap: 4 }}>
                  <LinkIcon size={14} /> TikTok
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* รายการโพสต์ของฉัน */}
      <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
        <User size={16} /> โพสต์ของฉัน ({initialEvents.length})
      </h3>
      <div style={{ display: "grid", gap: 12 }}>
        {initialEvents.map((e) => (
          <div key={e.id} className="card" style={{ padding: 14, display: "flex", gap: 12, alignItems: "center" }}>
            <Link href={`/event/${e.id}`} style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{e.title}</div>
              <div style={{ fontSize: 12, color: "#B8AEDB" }}>{e.province} · {e.commentCount ?? 0} ความคิดเห็น</div>
            </Link>
            <button onClick={() => remove(e.id)} style={{ background: "none", border: "none", color: "#FF3D8A", cursor: "pointer", padding: 6 }}>
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {initialEvents.length === 0 && <p style={{ fontSize: 13, color: "#5A5182" }}>คุณยังไม่เคยโพสต์งานเลย ลองสร้างโพสต์แรกของคุณดูสิ!</p>}
      </div>

      <style jsx>{`
        .profile-header-row {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;
        }
        @media (max-width: 640px) {
          .profile-header-row {
            flex-wrap: wrap;
          }
          .profile-username {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .profile-actions {
            width: 100%;
            order: 3;
            margin-top: 4px;
          }
          .profile-actions button {
            flex: 1;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}