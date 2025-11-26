import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabase";
import { FaPlus, FaFileAlt, FaTrash, FaCopy, FaExchangeAlt, FaCheckSquare, FaRegSquare } from "react-icons/fa";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State cho chức năng So sánh
  const [compareMode, setCompareMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  // --- 1. Load Data ---
  const fetchCVs = async () => {
    // (Giữ nguyên logic Guest/User cũ của bạn)
    if (user?.isGuest) {
      const localData = localStorage.getItem("guest_cvs");
      setCvs(localData ? JSON.parse(localData) : []);
      setLoading(false);
      return;
    }
    const userId = user?.uid || user?.id;
    if (!userId) { setLoading(false); return; }

    const { data } = await supabase.from("resumes").select("*").eq("user_id", userId).order("updated_at", { ascending: false });
    setCvs(data || []);
    setLoading(false);
  };

  useEffect(() => { if (user) fetchCVs(); }, [user]);

  // --- 2. Xử lý Xóa (Giữ nguyên) ---
  const handleDelete = async (id) => {
    if (!window.confirm("Xóa CV này?")) return;
    if (user?.isGuest) {
        const newCvs = cvs.filter(cv => cv.id !== id);
        setCvs(newCvs);
        localStorage.setItem("guest_cvs", JSON.stringify(newCvs));
        return;
    }
    await supabase.from("resumes").delete().eq("id", id);
    setCvs(cvs.filter((cv) => cv.id !== id));
  };

  // --- 3. FR-4.1: Xử lý NHÂN BẢN (Duplicate) ---
  const handleDuplicate = async (cv) => {
    const newTitle = `${cv.title} (Copy)`;
    
    if (user?.isGuest) {
        const newId = `guest_cv_${Date.now()}`;
        const newCV = { ...cv, id: newId, title: newTitle, updated_at: new Date() };
        const newList = [newCV, ...cvs];
        setCvs(newList);
        localStorage.setItem("guest_cvs", JSON.stringify(newList));
        return;
    }

    // User thật: Tạo bản ghi mới trong DB (Bỏ id cũ để nó tự sinh id mới)
    const { id, created_at, ...cvDataWithoutId } = cv; 
    const { data, error } = await supabase.from("resumes").insert([{
        ...cvDataWithoutId,
        title: newTitle,
        updated_at: new Date()
    }]).select();

    if (!error && data) {
        setCvs([data[0], ...cvs]);
        alert("Đã nhân bản thành công!");
    }
  };

  // --- 4. FR-4.2: Xử lý SO SÁNH ---
  const toggleSelection = (id) => {
      if (selectedIds.includes(id)) {
          setSelectedIds(selectedIds.filter(i => i !== id));
      } else {
          if (selectedIds.length >= 2) {
              alert("Chỉ được chọn tối đa 2 CV để so sánh!");
              return;
          }
          setSelectedIds([...selectedIds, id]);
      }
  };

  const handleCompare = () => {
      if (selectedIds.length !== 2) return alert("Vui lòng chọn đúng 2 CV!");
      // Chuyển hướng sang trang so sánh
      navigate(`/compare/${selectedIds[0]}/${selectedIds[1]}`);
  };

  if (loading) return <div className="p-8 text-center">Đang tải...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 pb-24">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Quản lý CV</h1>
        <div className="flex gap-3">
            {/* Toggle chế độ so sánh */}
            <button 
                onClick={() => { setCompareMode(!compareMode); setSelectedIds([]); }}
                className={`flex items-center gap-2 px-4 py-2 rounded border font-medium transition ${compareMode ? 'bg-purple-100 text-purple-700 border-purple-300' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
                <FaExchangeAlt /> {compareMode ? "Hủy so sánh" : "So sánh CV"}
            </button>

            <Link to="/editor/new" className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 shadow-md">
                <FaPlus /> Tạo Mới
            </Link>
        </div>
      </div>

      {/* Thanh công cụ khi đang so sánh */}
      {compareMode && (
          <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg mb-6 flex justify-between items-center animate-fade-in">
              <span className="text-purple-800 font-medium">Đã chọn: {selectedIds.length}/2 CV</span>
              <button 
                  onClick={handleCompare}
                  disabled={selectedIds.length !== 2}
                  className={`px-6 py-2 rounded font-bold shadow transition ${selectedIds.length === 2 ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                  So sánh ngay
              </button>
          </div>
      )}

      {/* Grid Danh sách */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {cvs.map((cv) => (
            <div key={cv.id} 
                 className={`relative bg-white rounded-xl shadow-sm border transition overflow-hidden group 
                 ${selectedIds.includes(cv.id) ? 'ring-2 ring-purple-500 border-purple-500 bg-purple-50' : 'border-gray-200 hover:shadow-md'}`}>
              
              {/* Checkbox So sánh (Chỉ hiện khi bật mode) */}
              {compareMode && (
                  <div className="absolute top-3 left-3 z-10 cursor-pointer" onClick={() => toggleSelection(cv.id)}>
                      {selectedIds.includes(cv.id) 
                        ? <FaCheckSquare className="text-purple-600 bg-white rounded" size={24}/> 
                        : <FaRegSquare className="text-gray-400 bg-white rounded" size={24}/>}
                  </div>
              )}

              {/* Thumbnail */}
              <div className="h-40 bg-gray-100 flex items-center justify-center border-b relative">
                <FaFileAlt className="text-gray-300 text-4xl" />
                {/* Chỉ cho click vào edit nếu KHÔNG ở chế độ so sánh */}
                {!compareMode && (
                    <Link to={`/editor/${cv.id}`} className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition cursor-pointer" />
                )}
              </div>

              <div className="p-4">
                <h3 className="font-bold text-gray-800 truncate mb-1" title={cv.title}>{cv.title}</h3>
                <p className="text-xs text-gray-500 mb-4">Cập nhật: {new Date(cv.updated_at).toLocaleDateString()}</p>

                <div className="flex gap-2">
                  <Link to={`/editor/${cv.id}`} className="flex-1 text-center bg-gray-100 text-gray-700 py-2 rounded text-sm font-medium hover:bg-gray-200">
                    Sửa
                  </Link>
                  
                  {/* Nút Duplicate */}
                  <button onClick={() => handleDuplicate(cv)} className="p-2 text-blue-500 bg-blue-50 rounded hover:bg-blue-100" title="Nhân bản">
                    <FaCopy />
                  </button>

                  <button onClick={() => handleDelete(cv.id)} className="p-2 text-red-500 bg-red-50 rounded hover:bg-red-100" title="Xóa">
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}