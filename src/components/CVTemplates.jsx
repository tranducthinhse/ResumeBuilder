import React from "react";
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaLink } from "react-icons/fa";

// --- MẪU 1: MODERN (Cột trái màu, phải trắng) ---
export const ModernTemplate = ({ data, themeColor, font }) => {
  // Helper lấy dữ liệu từ mảng sections
  const getSec = (id) => data.find((s) => s.id === id)?.content;

  const personal = getSec("personal") || {};
  const experiences = getSec("experience") || [];
  const education = getSec("education") || [];
  const skills = getSec("skills") || [];

  return (
    <div className="flex h-full min-h-[297mm] bg-white shadow-2xl" style={{ fontFamily: font }}>
      {/* CỘT TRÁI (Màu nền) */}
      <div className="w-1/3 text-white p-6 space-y-6" style={{ backgroundColor: themeColor }}>
        <div className="text-center">
          {personal.avatar && (
            <img 
              src={personal.avatar} 
              alt="Avatar" 
              className="w-32 h-32 rounded-full mx-auto border-4 border-white object-cover mb-4"
            />
          )}
          <h1 className="text-2xl font-bold uppercase leading-tight">{personal.name || "Tên của bạn"}</h1>
          <p className="text-sm opacity-90 mt-2 font-medium">{personal.jobTitle || "Chức danh"}</p>
        </div>

        <div className="space-y-3 text-sm mt-6">
            {personal.email && <div className="flex items-center gap-2"><FaEnvelope /> <span className="break-all">{personal.email}</span></div>}
            {personal.phone && <div className="flex items-center gap-2"><FaPhone /> {personal.phone}</div>}
            {personal.address && <div className="flex items-center gap-2"><FaMapMarkerAlt /> {personal.address}</div>}
        </div>

        {/* Kỹ năng */}
        {skills.length > 0 && (
          <div>
            <h3 className="font-bold border-b border-white/40 pb-1 mb-3 uppercase tracking-wider">Kỹ năng</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, idx) => (
                <span key={idx} className="bg-white/20 px-2 py-1 rounded text-sm">{skill}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CỘT PHẢI (Nội dung chính) */}
      <div className="w-2/3 p-8 text-gray-800">
        {/* Giới thiệu */}
        {personal.summary && (
          <div className="mb-6">
            <h3 className="text-xl font-bold uppercase border-b-2 pb-2 mb-3" style={{ borderColor: themeColor, color: themeColor }}>Giới thiệu</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{personal.summary}</p>
          </div>
        )}

        {/* Kinh nghiệm */}
        {experiences.length > 0 && (
          <div className="mb-6">
             <h3 className="text-xl font-bold uppercase border-b-2 pb-2 mb-4" style={{ borderColor: themeColor, color: themeColor }}>
               Kinh nghiệm làm việc
             </h3>
             {experiences.map((exp, idx) => (
               <div key={idx} className="mb-5 relative pl-4 border-l-2 border-gray-200">
                 <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full" style={{ backgroundColor: themeColor }}></div>
                 <div className="flex justify-between font-bold text-gray-800">
                   <span>{exp.position}</span>
                   <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">{exp.duration}</span>
                 </div>
                 <p className="font-semibold text-sm text-gray-600 mb-1">{exp.company}</p>
                 <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{exp.description}</p>
               </div>
             ))}
          </div>
        )}

        {/* Học vấn */}
        {education.length > 0 && (
          <div>
             <h3 className="text-xl font-bold uppercase border-b-2 pb-2 mb-4" style={{ borderColor: themeColor, color: themeColor }}>
               Học vấn
             </h3>
             {education.map((edu, idx) => (
               <div key={idx} className="mb-3">
                  <div className="flex justify-between font-bold">
                   <span>{edu.school}</span>
                   <span className="text-sm text-gray-500">{edu.year}</span>
                 </div>
                 <p className="text-sm text-gray-600">{edu.major}</p>
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
};

// --- MẪU 2: MINIMALIST (Đơn giản, sang trọng) ---
export const MinimalistTemplate = ({ data, themeColor, font }) => {
    const getSec = (id) => data.find((s) => s.id === id)?.content;
    const personal = getSec("personal") || {};
    const experiences = getSec("experience") || [];
    const education = getSec("education") || [];
    const skills = getSec("skills") || [];

    return (
        <div className="bg-white h-full min-h-[297mm] p-12 text-gray-800" style={{ fontFamily: font }}>
            {/* Header căn giữa */}
            <div className="text-center mb-10">
                <h1 className="text-4xl font-light uppercase tracking-widest mb-2" style={{ color: themeColor }}>{personal.name}</h1>
                <p className="text-md uppercase tracking-wide text-gray-500 mb-4">{personal.jobTitle}</p>
                <div className="flex justify-center gap-6 text-xs text-gray-500 border-t border-b border-gray-100 py-3">
                    <span>{personal.phone}</span>
                    <span>{personal.email}</span>
                    <span>{personal.address}</span>
                </div>
            </div>

            {/* Content: 2 cột layout */}
            <div className="grid grid-cols-12 gap-8">
                {/* Cột trái nhỏ: Edu & Skills */}
                <div className="col-span-4 space-y-8 text-right border-r border-gray-100 pr-8">
                     <div>
                        <h3 className="font-bold uppercase tracking-wider text-sm mb-4" style={{ color: themeColor }}>Học vấn</h3>
                        {education.map((edu, idx) => (
                            <div key={idx} className="mb-4">
                                <div className="font-bold text-sm">{edu.school}</div>
                                <div className="text-xs text-gray-500 mb-1">{edu.year}</div>
                                <div className="text-xs italic">{edu.major}</div>
                            </div>
                        ))}
                     </div>
                     <div>
                        <h3 className="font-bold uppercase tracking-wider text-sm mb-4" style={{ color: themeColor }}>Kỹ năng</h3>
                        <div className="flex flex-col gap-2 items-end">
                            {skills.map((skill, idx) => (
                                <span key={idx} className="text-sm border-b border-gray-100 pb-1">{skill}</span>
                            ))}
                        </div>
                     </div>
                </div>

                {/* Cột phải lớn: Experience */}
                <div className="col-span-8 space-y-8">
                    <div>
                         <h3 className="font-bold uppercase tracking-wider text-sm mb-6 flex items-center gap-2" style={{ color: themeColor }}>
                            Kinh nghiệm làm việc
                         </h3>
                         {experiences.map((exp, idx) => (
                             <div key={idx} className="mb-6">
                                 <h4 className="font-bold text-lg">{exp.position}</h4>
                                 <div className="flex justify-between text-sm text-gray-500 mb-2 italic">
                                     <span>{exp.company}</span>
                                     <span>{exp.duration}</span>
                                 </div>
                                 <p className="text-sm text-gray-600 leading-relaxed text-justify">{exp.description}</p>
                             </div>
                         ))}
                    </div>
                </div>
            </div>
        </div>
    )
}