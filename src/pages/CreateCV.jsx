import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; 
import { supabase } from "../services/supabase";
import { FaSave, FaArrowLeft, FaGripVertical } from "react-icons/fa";

export default function CreateCV() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [title, setTitle] = useState("CV Chưa đặt tên");

  const [sections, setSections] = useState([
    { id: "personal", title: "Thông tin cá nhân", content: {} },
    { id: "education", title: "Học vấn", content: [] },
    { id: "experience", title: "Kinh nghiệm làm việc", content: [] },
    { id: "skills", title: "Kỹ năng", content: [] },
  ]);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setSections(items);
  };

  const handleSave = async () => {
    if (!user) {
      alert("Vui lòng đăng nhập để lưu CV!");
      return;
    }

    setLoading(true);

    // ============================
    // 1. XỬ LÝ CHO GUEST (Lưu LocalStorage)
    // ============================
    if (user.isGuest) {
        try {
            // Tạo ID giả cho CV
            const guestCvId = `guest_cv_${Date.now()}`;
            
            const newResume = {
                id: guestCvId,
                user_id: user.uid,
                title: title,
                data: sections,
                updated_at: new Date().toISOString(),
                thumbnail: "" // Guest chưa hỗ trợ upload ảnh bìa phức tạp
            };

            // Lấy danh sách cũ từ LocalStorage
            const existingData = localStorage.getItem("guest_cvs");
            const cvList = existingData ? JSON.parse(existingData) : [];

            // Thêm mới và lưu lại
            cvList.unshift(newResume); // Đưa lên đầu
            localStorage.setItem("guest_cvs", JSON.stringify(cvList));

            alert("Đã lưu CV (Chế độ Khách)!");
            navigate(`/editor/${guestCvId}`); // Chuyển sang trang Editor với ID ảo
        } catch (err) {
            console.error(err);
            alert("Lỗi lưu guest CV");
        } finally {
            setLoading(false);
        }
        return; // Dừng hàm, không chạy code Supabase phía dưới
    }

    // ============================
    // 2. XỬ LÝ CHO USER THẬT (Lưu Supabase)
    // ============================
    try {
      const newResume = {
        user_id: user.id || user.uid,
        title: title,
        data: sections,
        updated_at: new Date(),
      };

      const { data, error } = await supabase
        .from("resumes")
        .insert([newResume])
        .select();

      if (error) throw error;

      alert("Lưu CV thành công!");
      
      if (data && data[0]) {
        navigate(`/editor/${data[0].id}`); 
      } else {
        navigate("/dashboard");
      }

    } catch (error) {
      console.error("Lỗi khi lưu:", error);
      alert("Lưu thất bại: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded shadow mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/dashboard")} className="text-gray-600 hover:text-blue-600">
            <FaArrowLeft size={20} />
          </button>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl font-bold border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none px-2"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          <FaSave /> {loading ? "Đang lưu..." : "Lưu CV"}
        </button>
      </div>

      {/* Drag & Drop Area */}
      <div className="max-w-3xl mx-auto">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="cv-sections">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                {sections.map((section, index) => (
                  <Draggable key={section.id} draggableId={section.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="bg-white p-4 rounded shadow border border-gray-200 flex items-center justify-between"
                      >
                        <span className="font-semibold text-gray-700">{section.title}</span>
                        <div {...provided.dragHandleProps} className="cursor-grab text-gray-400 hover:text-gray-600">
                          <FaGripVertical />
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}