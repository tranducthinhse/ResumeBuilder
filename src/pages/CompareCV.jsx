import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../services/supabase";
import { ModernTemplate, MinimalistTemplate } from "../components/CVTemplates";
import { FaArrowLeft } from "react-icons/fa";

export default function CompareCV() {
  const { id1, id2 } = useParams();
  const [cv1, setCv1] = useState(null);
  const [cv2, setCv2] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Hàm lấy 1 CV (Hỗ trợ cả Guest và Supabase)
      const fetchOne = async (id) => {
          if (id.startsWith("guest_")) {
              const local = JSON.parse(localStorage.getItem("guest_cvs") || "[]");
              return local.find(c => c.id === id);
          }
          const { data } = await supabase.from("resumes").select("*").eq("id", id).single();
          return data;
      };

      try {
          // Tải song song cả 2 CV để tiết kiệm thời gian
          const [data1, data2] = await Promise.all([fetchOne(id1), fetchOne(id2)]);
          setCv1(data1);
          setCv2(data2);
      } catch (err) {
          console.error("Lỗi so sánh:", err);
      } finally {
          setLoading(false);
      }
    };
    fetchData();
  }, [id1, id2]);

  // Component con để hiển thị CV (chỉ xem, không sửa)
  const RenderCV = ({ data, label }) => {
      if (!data) return <div className="text-red-500 font-bold p-4">Không tìm thấy dữ liệu CV</div>;
      
      // Chọn mẫu hiển thị đúng với lúc lưu
      const Template = data.template === 'minimalist' ? MinimalistTemplate : ModernTemplate;
      
      return (
          <div className="flex flex-col items-center w-full h-full">
              {/* Header nhỏ hiển thị tên phiên bản */}
              <div className="mb-4 text-center bg-white px-6 py-2 rounded-full shadow-sm border border-gray-200 z-10">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">{label}</span>
                  <h2 className="font-bold text-gray-800 text-lg">{data.title}</h2>
                  <p className="text-xs text-gray-500">
                      Cập nhật: {new Date(data.updated_at).toLocaleString('vi-VN')}
                  </p>
              </div>

              {/* Khung hiển thị CV - Scale nhỏ lại để vừa màn hình split */}
              <div className="border shadow-lg rounded overflow-hidden bg-white origin-top transform scale-[0.65] xl:scale-[0.75] transition-transform">
                  <div className="w-[210mm] min-h-[297mm] pointer-events-none select-none"> 
                      <Template data={data.data} themeColor={data.color} font={data.font} />
                  </div>
              </div>
          </div>
      );
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-gray-500">Đang tải dữ liệu so sánh...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4 flex items-center gap-4 sticky top-0 z-50">
          <Link to="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-bold transition">
              <FaArrowLeft /> Thoát chế độ so sánh
          </Link>
          <div className="h-6 w-px bg-gray-300 mx-2"></div>
          <h1 className="text-lg font-bold text-gray-800">So sánh phiên bản</h1>
      </div>

      {/* Main Content - Split View (Chia đôi màn hình) */}
      <div className="flex-1 grid grid-cols-2 gap-0 divide-x divide-gray-300 overflow-hidden">
          
          {/* Cột Trái (CV 1) */}
          <div className="bg-gray-50 overflow-y-auto p-8 custom-scrollbar">
              <RenderCV data={cv1} label="Phiên bản 1" />
          </div>

          {/* Cột Phải (CV 2) */}
          <div className="bg-gray-100 overflow-y-auto p-8 custom-scrollbar">
              <RenderCV data={cv2} label="Phiên bản 2" />
          </div>

      </div>
    </div>
  );
}