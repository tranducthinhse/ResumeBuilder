import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase";
export default function Profile() {
  const { user } = useAuth();
  const [personal, setPersonal] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    avatar: "",
    summary: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      const ref = doc(db, "users", user.uid, "cvs", "profile"); // 1 CV riêng cho profile
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const sec = snap.data().sections?.find(s => s.type === "personal");
        if (sec) setPersonal(sec.content);
      }
      setLoading(false);
    };
    loadProfile();
  }, [user]);

  const handleChange = (field, value) => {
    setPersonal(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const ref = doc(db, "users", user.uid, "cvs", "profile");
      await setDoc(ref, {
        title: "Profile",
        templateId: "profile",
        sections: [{ type: "personal", content: personal }],
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      });
      alert("Lưu hồ sơ thành công!");
    } catch (err) {
      alert("Lưu thất bại: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  return (
    <div className="max-w-xl mx-auto bg-white p-6 shadow mt-6">
      <h2 className="text-2xl font-bold mb-4">Hồ sơ cá nhân</h2>

      <div className="mb-2">
        <label className="block text-sm">Họ và tên</label>
        <input
          value={personal.name}
          onChange={e => handleChange("name", e.target.value)}
          className="p-2 border w-full rounded"
        />
      </div>

      <div className="mb-2">
        <label className="block text-sm">Email</label>
        <input
          value={personal.email}
          onChange={e => handleChange("email", e.target.value)}
          className="p-2 border w-full rounded"
        />
      </div>

      <div className="mb-2">
        <label className="block text-sm">Số điện thoại</label>
        <input
          value={personal.phone}
          onChange={e => handleChange("phone", e.target.value)}
          className="p-2 border w-full rounded"
        />
      </div>

      <div className="mb-2">
        <label className="block text-sm">Địa chỉ</label>
        <input
          value={personal.address}
          onChange={e => handleChange("address", e.target.value)}
          className="p-2 border w-full rounded"
        />
      </div>

      <div className="mb-2">
        <label className="block text-sm">Tóm tắt</label>
        <textarea
          value={personal.summary}
          onChange={e => handleChange("summary", e.target.value)}
          className="p-2 border w-full rounded"
          rows={3}
        />
      </div>

      <div className="mb-2">
        <label className="block text-sm">Avatar (URL)</label>
        <input
          value={personal.avatar}
          onChange={e => handleChange("avatar", e.target.value)}
          className="p-2 border w-full rounded"
        />
      </div>

      <button
        onClick={handleSave}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        disabled={saving}
      >
        {saving ? "Đang lưu..." : "Lưu hồ sơ"}
      </button>
    </div>
  );
}
