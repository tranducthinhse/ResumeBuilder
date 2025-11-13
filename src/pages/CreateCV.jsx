// src/pages/CreateCV.jsx
import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function CreateCV() {
  const [activeSection, setActiveSection] = useState("personal");

  const sections = [
    { id: "personal", label: "Thông tin cá nhân" },
    { id: "experience", label: "Kinh nghiệm làm việc" },
    { id: "education", label: "Học vấn" },
    { id: "skills", label: "Kỹ năng" },
    { id: "projects", label: "Dự án" },
    { id: "certificates", label: "Chứng chỉ" },
    { id: "activities", label: "Hoạt động" },
  ];

  // State cho các section dạng list
  const [experienceList, setExperienceList] = useState([
    { id: "exp-1", company: "", position: "", duration: "", description: "" },
  ]);
  const [educationList, setEducationList] = useState([
    { id: "edu-1", school: "", major: "", duration: "" },
  ]);
  const [skillsList, setSkillsList] = useState([{ id: "skill-1", name: "" }]);
  const [projectsList, setProjectsList] = useState([
    { id: "proj-1", name: "", description: "" },
  ]);
  const [certificatesList, setCertificatesList] = useState([
    { id: "cert-1", name: "", year: "" },
  ]);
  const [activitiesList, setActivitiesList] = useState([
    { id: "act-1", name: "", description: "" },
  ]);

  // Hàm kéo thả
  const handleDragEnd = (list, setList) => (result) => {
    if (!result.destination) return;
    const items = Array.from(list);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    setList(items);
  };

  // Render form theo section
  const renderForm = () => {
    switch (activeSection) {
      case "personal":
        return (
          <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200 space-y-8">
            {/* Avatar Upload */}
            <div className="flex items-center gap-6">
              <label className="cursor-pointer group">
                <div className="w-28 h-28 rounded-full bg-gray-100 border flex items-center justify-center overflow-hidden relative group-hover:ring-2 group-hover:ring-blue-400 transition-all">
                  <span className="text-gray-400 text-sm group-hover:hidden">Ảnh</span>
                  <span className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs">
                    Đổi ảnh
                  </span>
                </div>
                <input type="file" className="hidden" />
              </label>

              <div>
                <h3 className="font-semibold text-gray-800 text-lg">Ảnh đại diện</h3>
                <p className="text-sm text-gray-500">Dung lượng tối đa 2MB. PNG hoặc JPG.</p>
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-gray-700 font-medium">Họ và tên</label>
              <input className="inp" placeholder="VD: Nguyễn Văn A" />
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-gray-700 font-medium">Email</label>
                <input className="inp" placeholder="example@gmail.com" />
              </div>
              <div className="space-y-1">
                <label className="text-gray-700 font-medium">Số điện thoại</label>
                <input className="inp" placeholder="0123 456 789" />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1">
              <label className="text-gray-700 font-medium">Địa chỉ</label>
              <input className="inp" placeholder="VD: Quận 1, TP.HCM" />
            </div>

            {/* Summary */}
            <div className="space-y-1">
              <label className="text-gray-700 font-medium">Giới thiệu bản thân</label>
              <textarea
                className="inp"
                placeholder="Tóm tắt kinh nghiệm, mục tiêu nghề nghiệp…"
                rows={4}
              />
            </div>
          </div>
        );

      case "experience":
        return (
          <DragDropContext onDragEnd={handleDragEnd(experienceList, setExperienceList)}>
            <Droppable droppableId="experience">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                  {experienceList.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-white p-4 rounded border space-y-2"
                        >
                          <input
                            className="inp"
                            placeholder="Tên công ty"
                            value={item.company}
                            onChange={(e) => {
                              const newList = [...experienceList];
                              newList[index].company = e.target.value;
                              setExperienceList(newList);
                            }}
                          />
                          <input
                            className="inp"
                            placeholder="Vị trí"
                            value={item.position}
                            onChange={(e) => {
                              const newList = [...experienceList];
                              newList[index].position = e.target.value;
                              setExperienceList(newList);
                            }}
                          />
                          <input
                            className="inp"
                            placeholder="Thời gian làm việc"
                            value={item.duration}
                            onChange={(e) => {
                              const newList = [...experienceList];
                              newList[index].duration = e.target.value;
                              setExperienceList(newList);
                            }}
                          />
                          <textarea
                            className="inp"
                            placeholder="Mô tả công việc"
                            rows={4}
                            value={item.description}
                            onChange={(e) => {
                              const newList = [...experienceList];
                              newList[index].description = e.target.value;
                              setExperienceList(newList);
                            }}
                          />
                          <button
                            className="px-2 py-1 bg-red-500 text-white rounded"
                            onClick={() => {
                              const newList = experienceList.filter((_, i) => i !== index);
                              setExperienceList(newList);
                            }}
                          >
                            Xóa
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  <button
                    className="px-3 py-1 bg-blue-500 text-white rounded"
                    onClick={() =>
                      setExperienceList([
                        ...experienceList,
                        { id: `exp-${Date.now()}`, company: "", position: "", duration: "", description: "" },
                      ])
                    }
                  >
                    Thêm kinh nghiệm
                  </button>
                </div>
              )}
            </Droppable>
          </DragDropContext>
        );

      // Tương tự bạn có thể làm cho education, skills, projects, certificates, activities
      // Mình giữ y nguyên giao diện và spacing
      case "education":
        return (
          <DragDropContext onDragEnd={handleDragEnd(educationList, setEducationList)}>
            <Droppable droppableId="education">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                  {educationList.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-white p-4 rounded border space-y-2"
                        >
                          <input
                            className="inp"
                            placeholder="Trường học"
                            value={item.school}
                            onChange={(e) => {
                              const newList = [...educationList];
                              newList[index].school = e.target.value;
                              setEducationList(newList);
                            }}
                          />
                          <input
                            className="inp"
                            placeholder="Chuyên ngành"
                            value={item.major}
                            onChange={(e) => {
                              const newList = [...educationList];
                              newList[index].major = e.target.value;
                              setEducationList(newList);
                            }}
                          />
                          <input
                            className="inp"
                            placeholder="Thời gian"
                            value={item.duration}
                            onChange={(e) => {
                              const newList = [...educationList];
                              newList[index].duration = e.target.value;
                              setEducationList(newList);
                            }}
                          />
                          <button
                            className="px-2 py-1 bg-red-500 text-white rounded"
                            onClick={() => {
                              const newList = educationList.filter((_, i) => i !== index);
                              setEducationList(newList);
                            }}
                          >
                            Xóa
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  <button
                    className="px-3 py-1 bg-blue-500 text-white rounded"
                    onClick={() =>
                      setEducationList([
                        ...educationList,
                        { id: `edu-${Date.now()}`, school: "", major: "", duration: "" },
                      ])
                    }
                  >
                    Thêm học vấn
                  </button>
                </div>
              )}
            </Droppable>
          </DragDropContext>
        );

      // Skills
      case "skills":
        return (
          <DragDropContext onDragEnd={handleDragEnd(skillsList, setSkillsList)}>
            <Droppable droppableId="skills">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                  {skillsList.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-white p-4 rounded border space-y-2"
                        >
                          <input
                            className="inp"
                            placeholder="Nhập kỹ năng"
                            value={item.name}
                            onChange={(e) => {
                              const newList = [...skillsList];
                              newList[index].name = e.target.value;
                              setSkillsList(newList);
                            }}
                          />
                          <button
                            className="px-2 py-1 bg-red-500 text-white rounded"
                            onClick={() => {
                              const newList = skillsList.filter((_, i) => i !== index);
                              setSkillsList(newList);
                            }}
                          >
                            Xóa
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  <button
                    className="px-3 py-1 bg-blue-500 text-white rounded"
                    onClick={() =>
                      setSkillsList([...skillsList, { id: `skill-${Date.now()}`, name: "" }])
                    }
                  >
                    Thêm kỹ năng
                  </button>
                </div>
              )}
            </Droppable>
          </DragDropContext>
        );

      // Projects
      case "projects":
        return (
          <DragDropContext onDragEnd={handleDragEnd(projectsList, setProjectsList)}>
            <Droppable droppableId="projects">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                  {projectsList.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-white p-4 rounded border space-y-2"
                        >
                          <input
                            className="inp"
                            placeholder="Tên dự án"
                            value={item.name}
                            onChange={(e) => {
                              const newList = [...projectsList];
                              newList[index].name = e.target.value;
                              setProjectsList(newList);
                            }}
                          />
                          <textarea
                            className="inp"
                            placeholder="Mô tả dự án"
                            rows={4}
                            value={item.description}
                            onChange={(e) => {
                              const newList = [...projectsList];
                              newList[index].description = e.target.value;
                              setProjectsList(newList);
                            }}
                          />
                          <button
                            className="px-2 py-1 bg-red-500 text-white rounded"
                            onClick={() => {
                              const newList = projectsList.filter((_, i) => i !== index);
                              setProjectsList(newList);
                            }}
                          >
                            Xóa
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  <button
                    className="px-3 py-1 bg-blue-500 text-white rounded"
                    onClick={() =>
                      setProjectsList([...projectsList, { id: `proj-${Date.now()}`, name: "", description: "" }])
                    }
                  >
                    Thêm dự án
                  </button>
                </div>
              )}
            </Droppable>
          </DragDropContext>
        );

      // Certificates
      case "certificates":
        return (
          <DragDropContext onDragEnd={handleDragEnd(certificatesList, setCertificatesList)}>
            <Droppable droppableId="certificates">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                  {certificatesList.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-white p-4 rounded border space-y-2"
                        >
                          <input
                            className="inp"
                            placeholder="Tên chứng chỉ"
                            value={item.name}
                            onChange={(e) => {
                              const newList = [...certificatesList];
                              newList[index].name = e.target.value;
                              setCertificatesList(newList);
                            }}
                          />
                          <input
                            className="inp"
                            placeholder="Năm cấp"
                            value={item.year}
                            onChange={(e) => {
                              const newList = [...certificatesList];
                              newList[index].year = e.target.value;
                              setCertificatesList(newList);
                            }}
                          />
                          <button
                            className="px-2 py-1 bg-red-500 text-white rounded"
                            onClick={() => {
                              const newList = certificatesList.filter((_, i) => i !== index);
                              setCertificatesList(newList);
                            }}
                          >
                            Xóa
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  <button
                    className="px-3 py-1 bg-blue-500 text-white rounded"
                    onClick={() =>
                      setCertificatesList([...certificatesList, { id: `cert-${Date.now()}`, name: "", year: "" }])
                    }
                  >
                    Thêm chứng chỉ
                  </button>
                </div>
              )}
            </Droppable>
          </DragDropContext>
        );

      // Activities
      case "activities":
        return (
          <DragDropContext onDragEnd={handleDragEnd(activitiesList, setActivitiesList)}>
            <Droppable droppableId="activities">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                  {activitiesList.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-white p-4 rounded border space-y-2"
                        >
                          <input
                            className="inp"
                            placeholder="Tên hoạt động"
                            value={item.name}
                            onChange={(e) => {
                              const newList = [...activitiesList];
                              newList[index].name = e.target.value;
                              setActivitiesList(newList);
                            }}
                          />
                          <textarea
                            className="inp"
                            placeholder="Mô tả"
                            rows={4}
                            value={item.description}
                            onChange={(e) => {
                              const newList = [...activitiesList];
                              newList[index].description = e.target.value;
                              setActivitiesList(newList);
                            }}
                          />
                          <button
                            className="px-2 py-1 bg-red-500 text-white rounded"
                            onClick={() => {
                              const newList = activitiesList.filter((_, i) => i !== index);
                              setActivitiesList(newList);
                            }}
                          >
                            Xóa
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  <button
                    className="px-3 py-1 bg-blue-500 text-white rounded"
                    onClick={() =>
                      setActivitiesList([...activitiesList, { id: `act-${Date.now()}`, name: "", description: "" }])
                    }
                  >
                    Thêm hoạt động
                  </button>
                </div>
              )}
            </Droppable>
          </DragDropContext>
        );
    }
  };

  return (
    <div className="grid grid-cols-12 min-h-screen">
      {/* SIDEBAR - LEFT */}
      <div className="col-span-2 bg-gray-100 border-r p-4">
        <h2 className="text-lg font-bold mb-3">Sections</h2>
        <div className="space-y-2">
          {sections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`w-full text-left p-2 rounded ${
                activeSection === sec.id ? "bg-blue-500 text-white" : "hover:bg-gray-200"
              }`}
            >
              {sec.label}
            </button>
          ))}
        </div>
      </div>

      {/* FORM CONTENT - MIDDLE */}
      <div className="col-span-7 p-6">
        <h2 className="text-2xl font-bold mb-4">
          {sections.find((s) => s.id === activeSection)?.label}
        </h2>
        {renderForm()}
      </div>

      {/* STYLE EDITOR - RIGHT */}
      <div className="col-span-3 bg-gray-50 border-l p-4">
        <h2 className="text-lg font-bold mb-3">Thiết kế CV</h2>
        <div className="space-y-4">
          <label className="block font-medium">Font chữ</label>
          <select className="inp">
            <option>Inter</option>
            <option>Roboto</option>
            <option>Montserrat</option>
          </select>

          <label className="block font-medium">Màu chủ đạo</label>
          <input type="color" className="w-12 h-12 border rounded" />

          <label className="block font-medium">Kiểu layout</label>
          <select className="inp">
            <option>Modern</option>
            <option>Classic</option>
            <option>Minimalist</option>
          </select>
        </div>
      </div>
    </div>
  );
}
