import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabase"; 
import { FaCamera, FaSave, FaUser, FaExclamationTriangle, FaTrashAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user, updateUser, logout } = useAuth(); 
  const navigate = useNavigate();
  
  // State dữ liệu form
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
  const [deleting, setDeleting] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  // 1. Load dữ liệu
  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      try {
        // Load từ bảng profiles
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.uid || user.id)
          .single();

        if (data) {
          setPersonal({
            name: data.full_name || "",
            email: user.email, 
            phone: data.phone || "",
            address: data.address || "",
            avatar: data.avatar_url || "",
            summary: data.summary || ""
          });
          setPreview(data.avatar_url);
        } else {
            // Nếu chưa có profile trong DB (Lần đầu login bằng Google/Email)
            // Lấy thông tin từ user_metadata của Supabase (Google trả về full_name, avatar_url, picture)
            const meta = user.user_metadata || {};
            const googleAvatar = meta.avatar_url || meta.picture || "";
            const googleName = meta.full_name || meta.name || "";

            setPersonal(prev => ({
                ...prev, 
                email: user.email, 
                name: googleName,
                avatar: googleAvatar
            }));
            if (googleAvatar) setPreview(googleAvatar);
        }
      } catch (err) {
        console.error("Lỗi tải profile:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [user]);

  // Cleanup preview
  useEffect(() => {
    return () => {
      if (preview && file) URL.revokeObjectURL(preview);
    };
  }, [file, preview]);

  const handleChange = (field, value) => {
    setPersonal(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = e => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  // 2. Lưu Profile
  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      let avatarUrl = personal.avatar;

      // Upload ảnh nếu có
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id || user.uid}.${fileExt}`; 
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
          
        avatarUrl = publicUrlData.publicUrl;
      }

      // Upsert profile
      const updates = {
        id: user.id || user.uid,
        full_name: personal.name,
        phone: personal.phone,
        address: personal.address,
        summary: personal.summary,
        avatar_url: avatarUrl,
        updated_at: new Date(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;

      updateUser({ avatar: avatarUrl, full_name: personal.name });
      setFile(null); 
      alert("Đã lưu hồ sơ thành công!");

    } catch (err) {
      console.error("Save error:", err);
      alert("Lỗi khi lưu: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // 🔥 FR-7.2: XÓA TÀI KHOẢN & DỮ LIỆU
  const handleDeleteAccount = async () => {
    const confirmMsg = "CẢNH BÁO: Hành động này sẽ xóa vĩnh viễn toàn bộ CV và thông tin cá nhân của bạn. Bạn không thể khôi phục lại được. Bạn có chắc chắn muốn xóa không?";
    if (!window.confirm(confirmMsg)) return;

    setDeleting(true);
    const userId = user.id || user.uid;

    try {
      // 1. Xóa toàn bộ CV trong bảng resumes
      const { error: resumeError } = await supabase.from('resumes').delete().eq('user_id', userId);
      if (resumeError) throw resumeError;

      // 2. Xóa Profile
      const { error: profileError } = await supabase.from('profiles').delete().eq('id', userId);
      if (profileError) throw profileError;

      // 3. Xóa Avatar trong Storage (Nếu có) - Bỏ qua lỗi nếu không tìm thấy file
      try {
          const fileExt = personal.avatar?.split('.').pop();
          if(fileExt) {
             await supabase.storage.from('avatars').remove([`${userId}.${fileExt}`]);
          }
      } catch (e) { console.log("Không có avatar để xóa"); }

      // 4. Đăng xuất & Chuyển trang
      await logout();
      alert("Tài khoản của bạn đã được dọn dẹp sạch sẽ. Hẹn gặp lại!");
      navigate("/login");

    } catch (err) {
      console.error("Delete error:", err);
      alert("Lỗi khi xóa dữ liệu: " + err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="text-center mt-10">Đang tải dữ liệu...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      
      {/* Phần Form Chính */}
      <div className="bg-white p-8 shadow-lg rounded-xl mb-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2 flex items-center gap-2">
          <FaUser className="text-blue-600"/> Hồ sơ cá nhân
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Avatar */}
          <div className="md:col-span-1 flex flex-col items-center">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 shadow-sm bg-gray-200">
                 {preview ? (
                  <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <FaUser size={40} />
                  </div>
                )}
              </div>
              
              <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer shadow-md transition-transform transform hover:scale-110">
                <FaCamera size={16} />
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
          </div>

          {/* Form Fields */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
              <input type="text" value={personal.name} onChange={e => handleChange("name", e.target.value)} className="input-field w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={personal.email} disabled className="input-field w-full border p-2 rounded bg-gray-100 text-gray-500 cursor-not-allowed" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                    <input type="tel" value={personal.phone} onChange={e => handleChange("phone", e.target.value)} className="input-field w-full border p-2 rounded" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                    <input type="text" value={personal.address} onChange={e => handleChange("address", e.target.value)} className="input-field w-full border p-2 rounded" />
                </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giới thiệu bản thân</label>
              <textarea value={personal.summary} onChange={e => handleChange("summary", e.target.value)} className="input-field w-full border p-2 rounded" rows={4} />
            </div>

            <button onClick={handleSave} disabled={saving} className={`flex items-center justify-center gap-2 px-6 py-2 rounded text-white font-medium transition-colors ${saving ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}>
              {saving ? "Đang lưu..." : <><FaSave /> Lưu hồ sơ</>}
            </button>
          </div>
        </div>
      </div>

      {/* 🔥 KHU VỰC NGUY HIỂM (DANGER ZONE) */}
      {!user.isGuest && (
          <div className="bg-red-50 border border-red-200 p-6 rounded-xl">
            <h3 className="text-lg font-bold text-red-700 flex items-center gap-2 mb-2">
                <FaExclamationTriangle/> Khu vực nguy hiểm
            </h3>
            <p className="text-sm text-red-600 mb-4">
                Xóa tài khoản sẽ xóa vĩnh viễn tất cả CV, hình ảnh và thông tin cá nhân của bạn khỏi hệ thống. Hành động này không thể hoàn tác.
            </p>
            <button 
                onClick={handleDeleteAccount} 
                disabled={deleting}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-bold text-sm flex items-center gap-2 shadow-sm"
            >
                {deleting ? "Đang xóa dữ liệu..." : <><FaTrashAlt/> Xóa tài khoản vĩnh viễn</>}
            </button>
          </div>
      )}
    </div>
  );
}