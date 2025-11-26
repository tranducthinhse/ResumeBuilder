import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../services/supabase";
import { useAuth } from "../context/AuthContext";
import { ModernTemplate, MinimalistTemplate } from "../components/CVTemplates";
import { FaArrowLeft, FaPrint, FaLock, FaPen } from "react-icons/fa";
import { useReactToPrint } from "react-to-print";

export default function ViewCV() {
  const { id } = useParams();
  const { user } = useAuth(); // User hiện tại (người đang xem)
  const componentRef = useRef();

  const [cv, setCv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // FR-3.1.1: Người xem cũng có thể tải PDF
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: cv ? `CV_${cv.title}` : "Resume",
  });

  useEffect(() => {
    const fetchCV = async () => {
      try {
        // FR-3.2.2: Gọi API
        // Nếu CV Private và user không phải chủ -> Supabase trả về lỗi -> Nhảy vào catch
        const { data, error } = await supabase
          .from("resumes")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setCv(data);
      } catch (err) {
        console.error("Lỗi:", err);
        setError("CV này không tồn tại hoặc đang ở chế độ Riêng tư.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCV();
  }, [id]);

  if (loading) return <div className="h-screen flex items-center justify-center">Đang tải dữ liệu...</div>;

  // Màn hình chặn truy cập (Access Denied)
  if (error || !cv) return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
          <FaLock className="text-gray-400 text-6xl mb-4"/>
          <h2 className="text-2xl font-bold text-gray-800">Không thể truy cập</h2>
          <p className="text-gray-600 mb-6">{error || "Bạn không có quyền xem CV này."}</p>
          <Link to="/" className="text-blue-600 hover:underline">Về trang chủ</Link>
      </div>
  );

  // Kiểm tra quyền chủ sở hữu (hỗ trợ cả user.uid và user.id tùy context)
  const isOwner = user && (user.uid || user.id) === cv.user_id;

  return (
    <div className="min-h-screen bg-gray-200 py-8 flex flex-col items-center font-sans">
      
      {/* Header Toolbar */}
      <div className="w-[210mm] flex justify-between items-center mb-6 px-4 md:px-0 print:hidden">
        <Link to="/dashboard" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition">
          <FaArrowLeft /> {isOwner ? "Quay lại Dashboard" : "Tạo CV miễn phí"}
        </Link>
        
        <div className="flex gap-3">
           {isOwner && (
               <Link to={`/editor/${id}`} className="bg-yellow-500 text-white px-4 py-2 rounded shadow hover:bg-yellow-600 flex items-center gap-2 transition">
                   <FaPen size={14} /> Chỉnh sửa
               </Link>
           )}
           <button onClick={handlePrint} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 flex items-center gap-2 transition">
               <FaPrint /> Tải PDF
           </button>
        </div>
      </div>

      {/* CV Render Area */}
      <div className="bg-white shadow-2xl rounded overflow-hidden print:shadow-none">
          <div ref={componentRef} className="w-[210mm] min-h-[297mm]">
               {cv.template === 'modern' 
                  ? <ModernTemplate data={cv.data} themeColor={cv.color} font={cv.font} /> 
                  : <MinimalistTemplate data={cv.data} themeColor={cv.color} font={cv.font} />
               }
          </div>
      </div>
      
      {!isOwner && (
          <div className="mt-8 text-gray-500 text-sm print:hidden">
              Được tạo bởi <Link to="/" className="text-blue-600 font-bold hover:underline">Resume Builder</Link>
          </div>
      )}
    </div>
  );
}