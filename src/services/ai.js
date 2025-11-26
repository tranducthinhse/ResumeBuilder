import { GoogleGenerativeAI } from "@google/generative-ai";

// 👇 Dán API Key của bạn vào đây
const API_KEY = "AIzaSyA0kasVXWORy3j3z-QcUIB6JAE-cpmQw7M"; 

const genAI = new GoogleGenerativeAI(API_KEY);

// ✅ SỬA LỖI: Dùng model 'gemini-1.5-flash' thay cho 'gemini-pro'
// gemini-1.5-flash nhanh hơn, rẻ hơn và thông minh hơn cho các tác vụ ngắn.
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.0-flash" 
});

// 1. FR-5.1: Gợi ý nội dung
export const generateContentAI = async (jobTitle, section) => {
  try {
    const prompt = `Viết 1 đoạn mô tả ngắn gọn (dưới 30 từ), chuyên nghiệp cho CV ở mục "${section}" với vị trí công việc là "${jobTitle}". Chỉ trả về nội dung text, không có lời dẫn, không có dấu ngoặc kép.`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("AI Generate Error:", error);
    return "Không thể kết nối với AI lúc này.";
  }
};

// 2. FR-5.2: Sửa lỗi & Cải thiện câu văn
export const polishTextAI = async (text) => {
  try {
    const prompt = `Hãy viết lại đoạn văn sau cho chuyên nghiệp hơn, dùng từ ngữ trang trọng phù hợp với CV xin việc: "${text}". Chỉ trả về kết quả đã sửa, không giải thích thêm.`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("AI Polish Error:", error);
    return text; // Trả về text cũ nếu lỗi
  }
};

// 3. FR-5.3: Chấm điểm CV (Dùng JSON Mode xịn sò của Gemini 1.5)
export const scoreCVAI = async (cvData) => {
  try {
    // Định nghĩa model riêng cho task này để bật JSON Mode
    const jsonModel = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash",
        generationConfig: { responseMimeType: "application/json" } 
    });

    const cvString = JSON.stringify(cvData);
    
    const prompt = `
      Bạn là chuyên gia tuyển dụng (HR). Hãy phân tích dữ liệu CV dưới đây:
      ${cvString}
      
      Hãy trả về một JSON object (không markdown) với cấu trúc chính xác như sau:
      {
        "score": number (0-100),
        "summary": "string (Nhận xét tổng quan ngắn gọn)",
        "pros": ["string", "string"],
        "cons": ["string", "string"],
        "suggestion": "string (Lời khuyên cụ thể)"
      }
    `;

    const result = await jsonModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Vì đã bật JSON Mode, ta có thể parse trực tiếp an toàn hơn
    return JSON.parse(text);

  } catch (error) {
    console.error("AI Score Error:", error);
    return {
        score: 0,
        summary: "Lỗi khi phân tích. Vui lòng kiểm tra API Key hoặc kết nối mạng.",
        pros: [],
        cons: [],
        suggestion: "Thử lại sau."
    };
  }
};