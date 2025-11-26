import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useReactToPrint } from "react-to-print";
import { supabase } from "../services/supabase";
import { useAuth } from "../context/AuthContext";
import { generateContentAI, polishTextAI, scoreCVAI } from "../services/ai"; 
import { ModernTemplate, MinimalistTemplate } from "../components/CVTemplates"; 
// 🔥 Import thêm icon cho FR-6 (Lightbulb, Bell, InfoCircle)
import { FaSave, FaArrowLeft, FaPrint, FaTrash, FaPlus, FaPalette, FaFont, FaShareAlt, FaTimes, FaCopy, FaCheck, FaGlobe, FaLock, FaMagic, FaRobot, FaStar, FaLightbulb, FaBell, FaInfoCircle } from "react-icons/fa";

export default function Editor() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const componentRef = useRef();

  // --- STATE DỮ LIỆU ---
  const [cvData, setCvData] = useState([]); 
  const [meta, setMeta] = useState({ title: "", template: "modern", color: "#2563eb", font: "Inter, sans-serif" });
  const [isPublic, setIsPublic] = useState(false);

  // State UI & AI
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("content"); 
  const [activeSectionId, setActiveSectionId] = useState("personal");
  const [showShareModal, setShowShareModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false); 
  const [aiScoreData, setAiScoreData] = useState(null);        
  const [isAnalyzing, setIsAnalyzing] = useState(false);       
  const [copySuccess, setCopySuccess] = useState(false);

  // 🔥 STATE CHO FR-6 (Hướng dẫn & Thông báo)
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState("IT"); // Ngành nghề đang xem hướng dẫn

  const handlePrint = useReactToPrint({
    contentRef: componentRef, 
    documentTitle: `CV_${meta.title}`,
  });

  // --- LOAD DATA ---
  useEffect(() => {
    const loadCV = async () => {
        if (id.startsWith("guest_")) {
             const localData = JSON.parse(localStorage.getItem("guest_cvs") || "[]");
             const found = localData.find(c => c.id === id);
             if (found) {
                 setCvData(found.data || []);
                 setMeta({ title: found.title, template: found.template || "modern", color: found.color || "#2563eb", font: found.font || "Inter, sans-serif" });
                 setIsPublic(false);
             }
             setLoading(false);
             return;
        }
        const { data } = await supabase.from("resumes").select("*").eq("id", id).single();
        if (data) {
            setCvData(data.data || []);
            setMeta({ title: data.title, template: data.template || "modern", color: data.color || "#2563eb", font: data.font || "Inter, sans-serif" });
            setIsPublic(data.is_public || false);
        }
        setLoading(false);
    };
    loadCV();
  }, [id]);

  // --- ACTIONS ---
  const updateSection = (secId, newContent) => {
    setCvData(prev => prev.map(s => s.id === secId ? { ...s, content: newContent } : s));
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(cvData);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    setCvData(items);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = { ...meta, data: cvData, updated_at: new Date(), is_public: isPublic };
    
    if (id.startsWith("guest_")) {
        const local = JSON.parse(localStorage.getItem("guest_cvs") || "[]");
        const newData = local.map(c => c.id === id ? { ...c, ...payload } : c);
        localStorage.setItem("guest_cvs", JSON.stringify(newData));
        setTimeout(() => setSaving(false), 500);
        return;
    }
    await supabase.from("resumes").update(payload).eq("id", id);
    setSaving(false);
  };

  // --- AI ACTIONS ---
  const handleAIGenerate = async () => {
    const section = cvData.find(s => s.id === activeSectionId);
    const jobTitle = cvData.find(s => s.id === 'personal')?.content?.jobTitle || "Nhân viên";
    
    if (["experience", "projects"].includes(section.id)) {
        const items = [...section.content];
        if(items.length === 0) { alert("Hãy thêm một mục trống trước!"); return; }
        
        const lastIdx = items.length - 1;
        items[lastIdx].description = "🤖 Đang viết...";
        updateSection(section.id, items);

        const text = await generateContentAI(jobTitle, section.title);
        items[lastIdx].description = text;
        updateSection(section.id, items);
    } else {
        alert("AI chỉ hỗ trợ viết Kinh nghiệm & Dự án lúc này.");
    }
  };

  const handleAIPolish = async (fieldValue, callback) => {
      if(!fieldValue) return;
      const newText = await polishTextAI(fieldValue);
      callback(newText);
  };

  const handleScoreCV = async () => {
      setShowScoreModal(true);
      setIsAnalyzing(true);
      const result = await scoreCVAI(cvData);
      setAiScoreData(result);
      setIsAnalyzing(false);
  };

  // --- DATA CHO HƯỚNG DẪN & THÔNG BÁO (FR-6) ---
  const industryGuides = {
      "IT": [
          "Liệt kê rõ các ngôn ngữ lập trình, Framework, Database.",
          "Dẫn link GitHub hoặc Portfolio dự án thực tế.",
          "Mô tả dự án theo mô hình STAR (Tình huống - Nhiệm vụ - Hành động - Kết quả).",
          "Tránh liệt kê kỹ năng không còn dùng hoặc quá cơ bản (như 'Biết dùng Word')."
      ],
      "Marketing": [
          "Nhấn mạnh vào các con số: Tăng trưởng, KPI, Ngân sách quản lý.",
          "Đính kèm link các chiến dịch đã thực hiện.",
          "Sử dụng từ ngữ năng động, sáng tạo.",
          "Kỹ năng công cụ: Google Ads, Facebook Ads, SEO tools."
      ],
      "Sales": [
          "Doanh số là quan trọng nhất: Đưa con số cụ thể vào.",
          "Khả năng đàm phán, mở rộng mạng lưới khách hàng.",
          "Chứng minh khả năng chịu áp lực doanh số.",
          "Giải thưởng 'Best Seller' nếu có."
      ],
      "Sinh viên": [
          "Tập trung vào GPA, Học bổng, Hoạt động ngoại khóa.",
          "Các dự án môn học lớn, đồ án tốt nghiệp.",
          "Kỹ năng mềm: Làm việc nhóm, Thuyết trình.",
          "Mục tiêu nghề nghiệp rõ ràng, ham học hỏi."
      ]
  };

  const notifications = [
      { id: 1, title: "Tính năng mới: AI Writer", msg: "AI giờ đây có thể tự viết kinh nghiệm làm việc cho bạn!", date: "Mới" },
      { id: 2, title: "Mẫu CV Minimalist", msg: "Đã cập nhật thêm mẫu Minimalist tối giản, sang trọng.", date: "20/11" },
      { id: 3, title: "Chế độ Khách", msg: "Bạn có thể tạo CV mà không cần đăng nhập ngay.", date: "15/11" }
  ];

  // --- RENDER FORM ---
  const renderForm = () => {
      const section = cvData.find(s => s.id === activeSectionId);
      if (!section) return <p className="text-gray-400 p-4">Chọn mục để sửa</p>;

      if (section.id === "personal") {
          return (
              <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-2 gap-3">
                    <input className="input-field" placeholder="Họ tên" value={section.content.name || ""} onChange={e => updateSection("personal", {...section.content, name: e.target.value})} />
                    <input className="input-field" placeholder="Chức danh" value={section.content.jobTitle || ""} onChange={e => updateSection("personal", {...section.content, jobTitle: e.target.value})} />
                  </div>
                  <input className="input-field w-full" placeholder="Email" value={section.content.email || ""} onChange={e => updateSection("personal", {...section.content, email: e.target.value})} />
                  <input className="input-field w-full" placeholder="Số điện thoại" value={section.content.phone || ""} onChange={e => updateSection("personal", {...section.content, phone: e.target.value})} />
                  <input className="input-field w-full" placeholder="Địa chỉ" value={section.content.address || ""} onChange={e => updateSection("personal", {...section.content, address: e.target.value})} />
                  
                  <div className="relative">
                      <textarea className="input-field w-full" rows={4} placeholder="Tóm tắt bản thân..." value={section.content.summary || ""} onChange={e => updateSection("personal", {...section.content, summary: e.target.value})} />
                      <button onClick={() => handleAIPolish(section.content.summary, (txt) => updateSection("personal", {...section.content, summary: txt}))} 
                          className="absolute bottom-2 right-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200 flex items-center gap-1" title="AI Viết lại cho hay hơn">
                          <FaMagic/> Cải thiện
                      </button>
                  </div>
              </div>
          );
      }

      if (["experience", "projects", "certificates"].includes(section.id)) {
          const items = section.content || [];
          const updateItem = (idx, field, val) => {
              const newItems = [...items];
              newItems[idx][field] = val;
              updateSection(section.id, newItems);
          };
          return (
              <div className="space-y-6">
                  {items.map((item, idx) => (
                      <div key={idx} className="p-4 bg-white border rounded shadow-sm relative group">
                          <button onClick={() => updateSection(section.id, items.filter((_, i) => i !== idx))} className="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"><FaTrash/></button>
                          
                          <input className="input-field w-full mb-2 font-bold" placeholder="Tiêu đề / Vị trí" value={item.position || item.name || item.title} onChange={e => updateItem(idx, section.id === 'experience' ? 'position' : (section.id==='projects'?'name':'title'), e.target.value)} />
                          <div className="flex gap-2 mb-2">
                             <input className="input-field w-1/2" placeholder="Công ty / Tổ chức" value={item.company || item.issuer} onChange={e => updateItem(idx, section.id === 'experience' ? 'company' : 'issuer', e.target.value)} />
                             <input className="input-field w-1/2" placeholder="Thời gian" value={item.duration || item.time} onChange={e => updateItem(idx, section.id === 'experience' ? 'duration' : 'time', e.target.value)} />
                          </div>
                          
                          <div className="relative">
                              <textarea className="input-field w-full text-sm pr-20" rows={3} placeholder="Mô tả..." value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)} />
                              <button onClick={() => handleAIPolish(item.description, (txt) => updateItem(idx, 'description', txt))} 
                                  className="absolute bottom-2 right-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200 flex items-center gap-1">
                                  <FaMagic/> Cải thiện
                              </button>
                          </div>
                      </div>
                  ))}
                  <button onClick={() => updateSection(section.id, [...items, {}])} className="w-full py-2 border-2 border-dashed border-blue-300 text-blue-600 rounded hover:bg-blue-50 flex justify-center items-center gap-2"><FaPlus/> Thêm mục mới</button>
                  
                  <div className="mt-3 text-center">
                     <button onClick={handleAIGenerate} className="text-xs text-purple-600 flex items-center justify-center gap-1 mx-auto hover:underline font-bold">
                         <FaRobot/> AI Gợi ý nội dung (Beta)
                     </button>
                  </div>
              </div>
          );
      }

      if (section.id === "skills") {
        const skills = section.content || [];
        return (
            <div>
                <div className="flex flex-wrap gap-2 mb-4">
                    {skills.map((skill, idx) => (
                        <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                            {skill} <button onClick={() => updateSection("skills", skills.filter((_, i) => i !== idx))} className="hover:text-red-500">×</button>
                        </span>
                    ))}
                </div>
                <input className="input-field w-full" placeholder="Nhập kỹ năng & Enter..." 
                    onKeyDown={(e) => { if (e.key === 'Enter' && e.target.value) { updateSection("skills", [...skills, e.target.value]); e.target.value = ""; } }}
                />
            </div>
        )
      }
      return <div className="p-4 text-center text-gray-400">Chọn mục để chỉnh sửa</div>;
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Đang tải...</div>;

  return (
    <div className="flex h-screen flex-col md:flex-row bg-gray-100 overflow-hidden font-sans relative">
      
      {/* 🔥 FR-6.1: MODAL HƯỚNG DẪN */}
      {showGuideModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
             <div className="bg-yellow-500 p-4 flex justify-between items-center text-white">
                <h3 className="font-bold flex items-center gap-2"><FaLightbulb/> Hướng dẫn viết CV</h3>
                <button onClick={() => setShowGuideModal(false)}><FaTimes/></button>
             </div>
             <div className="p-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Chọn ngành nghề của bạn:</label>
                <select 
                    value={selectedIndustry} 
                    onChange={(e) => setSelectedIndustry(e.target.value)}
                    className="w-full p-2 border rounded mb-4 focus:ring-2 focus:ring-yellow-400 outline-none"
                >
                    {Object.keys(industryGuides).map(ind => <option key={ind} value={ind}>{ind}</option>)}
                </select>

                <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                    <h4 className="font-bold text-yellow-800 mb-3 flex items-center gap-2">
                        <FaInfoCircle/> Lưu ý cho {selectedIndustry}:
                    </h4>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                        {industryGuides[selectedIndustry].map((tip, idx) => (
                            <li key={idx}>{tip}</li>
                        ))}
                    </ul>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* 🔥 FR-6.2: MODAL THÔNG BÁO */}
      {showNotifModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
             <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
                <h3 className="font-bold flex items-center gap-2"><FaBell/> Thông báo & Cập nhật</h3>
                <button onClick={() => setShowNotifModal(false)}><FaTimes/></button>
             </div>
             <div className="p-4 max-h-96 overflow-y-auto">
                {notifications.map(notif => (
                    <div key={notif.id} className="mb-3 pb-3 border-b last:border-0 last:pb-0">
                        <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-gray-800">{notif.title}</h4>
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{notif.date}</span>
                        </div>
                        <p className="text-sm text-gray-600">{notif.msg}</p>
                    </div>
                ))}
             </div>
          </div>
        </div>
      )}

      {/* --- MODAL CHẤM ĐIỂM AI --- */}
      {showScoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in max-h-[90vh] overflow-y-auto">
             <div className="bg-purple-600 p-4 flex justify-between items-center text-white">
                <h3 className="font-bold flex items-center gap-2"><FaRobot/> AI Reviewer</h3>
                <button onClick={() => setShowScoreModal(false)}><FaTimes/></button>
             </div>
             <div className="p-6">
                {isAnalyzing ? (
                    <div className="text-center py-10">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                        <p className="text-gray-600 animate-pulse">AI đang chấm điểm CV...</p>
                    </div>
                ) : aiScoreData ? (
                    <div>
                        <div className="text-center mb-6">
                            <div className="text-5xl font-bold text-purple-600 mb-2">{aiScoreData.score}/100</div>
                            <p className="text-gray-500 italic">{aiScoreData.summary}</p>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-green-50 p-3 rounded border border-green-200">
                                <h4 className="font-bold text-green-700 mb-2 flex items-center gap-2"><FaCheck/> Điểm mạnh</h4>
                                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                                    {aiScoreData.pros?.map((p, i) => <li key={i}>{p}</li>)}
                                </ul>
                            </div>
                            <div className="bg-red-50 p-3 rounded border border-red-200">
                                <h4 className="font-bold text-red-700 mb-2 flex items-center gap-2"><FaTimes/> Cần cải thiện</h4>
                                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                                    {aiScoreData.cons?.map((p, i) => <li key={i}>{p}</li>)}
                                </ul>
                            </div>
                            <div className="bg-blue-50 p-3 rounded border border-blue-200">
                                <h4 className="font-bold text-blue-700 mb-2">💡 Lời khuyên</h4>
                                <p className="text-sm text-gray-700">{aiScoreData.suggestion}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-red-500">Không thể phân tích. Vui lòng kiểm tra API Key.</div>
                )}
             </div>
          </div>
        </div>
      )}

      {/* --- MODAL CHIA SẺ --- */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800"><FaShareAlt className="text-blue-600"/> Chia sẻ</h3>
              <button onClick={() => setShowShareModal(false)}><FaTimes/></button>
            </div>
            <div className="p-6 space-y-4">
               <div className="flex justify-between items-center">
                   <span>Công khai:</span>
                   <button onClick={() => {
                       const newState = !isPublic;
                       setIsPublic(newState); 
                       if(!id.startsWith("guest_")) supabase.from("resumes").update({is_public: newState}).eq("id", id);
                   }} 
                       className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${isPublic?'bg-green-500':'bg-gray-300'}`}>
                       <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform duration-300 ${isPublic?'translate-x-7':'translate-x-1'}`}></div>
                   </button>
               </div>
               {isPublic && (
                   <div className="flex gap-2">
                       <input readOnly value={`${window.location.origin}/view/${id}`} className="flex-1 border p-2 rounded text-xs bg-gray-50"/>
                       <button onClick={() => {navigator.clipboard.writeText(`${window.location.origin}/view/${id}`); setCopySuccess(true); setTimeout(()=>setCopySuccess(false),2000);}} 
                           className={`text-white p-2 rounded transition ${copySuccess ? 'bg-green-600' : 'bg-blue-600'}`}>
                           {copySuccess ? <FaCheck/> : <FaCopy/>}
                       </button>
                   </div>
               )}
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <div className="w-full md:w-[400px] bg-white border-r flex flex-col h-full shadow-xl z-20 flex-shrink-0">
        <div className="p-4 border-b bg-white flex justify-between items-center shadow-sm z-10">
             <button onClick={() => navigate("/dashboard")} className="text-gray-500 hover:text-black"><FaArrowLeft/></button>
             <input value={meta.title} onChange={e => setMeta({...meta, title: e.target.value})} className="font-bold text-center w-32 outline-none border-b" />
             <button onClick={handleSave} className="text-blue-600 font-bold text-sm"><FaSave/> Lưu</button>
        </div>
        <div className="flex border-b text-sm font-semibold bg-gray-50">
             <button onClick={() => setActiveTab("content")} className={`flex-1 p-3 ${activeTab === "content" ? "text-blue-600 border-b-2 border-blue-600 bg-white" : "text-gray-500"}`}>Nội dung</button>
             <button onClick={() => setActiveTab("design")} className={`flex-1 p-3 flex gap-2 justify-center ${activeTab === "design" ? "text-purple-600 border-b-2 border-purple-600 bg-white" : "text-gray-500"}`}><FaPalette/> Thiết kế</button>
        </div>
        
        <div className="flex-1 overflow-y-auto bg-gray-50 custom-scrollbar">
            {activeTab === "content" && (
                <div className="flex h-full flex-col">
                    <div className="p-2 bg-white border-b">
                        <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId="sections-list" direction="horizontal">
                                {(provided) => (
                                    <div {...provided.droppableProps} ref={provided.innerRef} className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                        {cvData.map((sec, index) => (
                                            <Draggable key={sec.id} draggableId={sec.id} index={index}>
                                                {(provided) => (
                                                    <div ref={provided.innerRef} {...provided.draggableProps} onClick={() => setActiveSectionId(sec.id)}
                                                         className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border cursor-pointer whitespace-nowrap ${activeSectionId === sec.id ? 'bg-blue-600 text-white' : 'bg-white'}`}
                                                         style={{ ...provided.draggableProps.style }}>
                                                        <span {...provided.dragHandleProps} className="mr-1 opacity-50 cursor-grab">::</span>{sec.title}
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
                    <div className="p-4 flex-1">
                        <h3 className="uppercase text-xs font-bold text-gray-400 mb-4 tracking-wider">Đang sửa: {cvData.find(s => s.id === activeSectionId)?.title}</h3>
                        {renderForm()}
                    </div>
                </div>
            )}

            {activeTab === "design" && (
                <div className="p-6 space-y-8 animate-fade-in">
                    {/* 1. Chọn Template */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">Mẫu CV (Templates)</label>
                        <div className="grid grid-cols-2 gap-4">
                            <div onClick={() => setMeta({...meta, template: 'modern'})} 
                                 className={`cursor-pointer border-2 rounded-lg p-2 hover:shadow-md transition ${meta.template === 'modern' ? 'border-blue-600 ring-2 ring-blue-100' : 'border-transparent bg-white'}`}>
                                <div className="h-20 bg-gray-200 mb-2 rounded flex overflow-hidden">
                                    <div className="w-1/3 bg-blue-500 h-full"></div>
                                    <div className="w-2/3 h-full bg-white"></div>
                                </div>
                                <p className="text-center text-xs font-bold text-gray-700">Modern</p>
                            </div>

                            <div onClick={() => setMeta({...meta, template: 'minimalist'})} 
                                 className={`cursor-pointer border-2 rounded-lg p-2 hover:shadow-md transition ${meta.template === 'minimalist' ? 'border-purple-600 ring-2 ring-purple-100' : 'border-transparent bg-white'}`}>
                                <div className="h-20 bg-white border border-gray-200 mb-2 rounded p-1">
                                    <div className="h-2 w-full bg-gray-300 mb-1 mx-auto rounded"></div>
                                    <div className="h-1 w-1/2 bg-gray-200 mx-auto rounded"></div>
                                </div>
                                <p className="text-center text-xs font-bold text-gray-700">Minimalist</p>
                            </div>
                        </div>
                    </div>

                    {/* 2. Chọn Màu Sắc */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2"><FaPalette/> Màu chủ đạo</label>
                        <div className="flex flex-wrap gap-3">
                            {["#2563eb", "#dc2626", "#16a34a", "#d97706", "#7c3aed", "#1f2937"].map(c => (
                                <button key={c} onClick={() => setMeta({...meta, color: c})}
                                    className={`w-8 h-8 rounded-full shadow-sm border-2 transition transform hover:scale-110 ${meta.color === c ? 'border-gray-600 scale-110' : 'border-transparent'}`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                            <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200 hover:border-gray-400">
                                <input type="color" value={meta.color} onChange={(e) => setMeta({...meta, color: e.target.value})} className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer p-0 border-0" />
                            </div>
                        </div>
                    </div>

                    {/* 3. Chọn Font Chữ */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2"><FaFont/> Phông chữ</label>
                        <select value={meta.font} onChange={(e) => setMeta({...meta, font: e.target.value})} className="input-field w-full cursor-pointer hover:border-blue-400">
                            <option value="Inter, sans-serif">Inter (Hiện đại, Mặc định)</option>
                            <option value="'Times New Roman', serif">Times New Roman (Cổ điển)</option>
                            <option value="'Courier New', monospace">Courier New (Kỹ thuật)</option>
                            <option value="Arial, sans-serif">Arial (Cơ bản)</option>
                            <option value="'Georgia', serif">Georgia (Trang trọng)</option>
                        </select>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* PREVIEW */}
      <div className="flex-1 bg-gray-600 overflow-y-auto p-4 md:p-8 flex justify-center items-start relative">
         <div className="fixed top-4 right-4 flex gap-3 z-50">
             {/* 🔥 FR-6.2: NÚT THÔNG BÁO */}
             <button onClick={() => setShowNotifModal(true)} className="bg-white text-gray-800 px-3 py-2 rounded-full shadow-lg hover:bg-blue-50 font-bold flex items-center gap-2 transition hover:scale-105" title="Thông báo">
                 <FaBell className="text-blue-600" />
                 <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">3</span>
             </button>

             {/* 🔥 FR-6.1: NÚT HƯỚNG DẪN */}
             <button onClick={() => setShowGuideModal(true)} className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-full shadow-lg hover:bg-yellow-500 font-bold flex items-center gap-2 transition hover:scale-105" title="Hướng dẫn viết CV">
                 <FaLightbulb /> <span className="hidden md:inline">Hướng dẫn</span>
             </button>

             <button onClick={handleScoreCV} className="bg-purple-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-purple-700 font-bold flex items-center gap-2 transition hover:scale-105 animate-bounce">
                 <FaStar className="text-yellow-300"/> Chấm điểm
             </button>

             <button onClick={() => setShowShareModal(true)} className="bg-white text-gray-800 px-4 py-2 rounded-full shadow-lg hover:bg-gray-100 font-bold flex items-center gap-2">
                 <FaShareAlt className={isPublic ? "text-green-600" : "text-gray-400"}/> 
             </button>
             <button onClick={handlePrint} className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 font-bold flex gap-2 items-center">
                 <FaPrint /> PDF
             </button>
         </div>

         {/* A4 Paper (Có ref để in) */}
         <div ref={componentRef} className="bg-white shadow-2xl w-[210mm] min-h-[297mm] transform scale-[0.6] sm:scale-[0.7] md:scale-[0.85] lg:scale-100 origin-top">
             {meta.template === 'modern' 
                ? <ModernTemplate data={cvData} themeColor={meta.color} font={meta.font} /> 
                : <MinimalistTemplate data={cvData} themeColor={meta.color} font={meta.font} />
             }
         </div>
      </div>
    </div>
  );
}