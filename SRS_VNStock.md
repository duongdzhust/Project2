# TÀI LIỆU ĐẶC TẢ KỸ THUẬT (SYSTEM REQUIREMENTS SPECIFICATION - SRS)
**Dự án:** VNStock SmartView
**Mô hình:** Client-Side Rendering (CSR) / Serverless
**Phiên bản:** 1.0

---

## 1. KIẾN TRÚC HỆ THỐNG (SYSTEM ARCHITECTURE)
Hệ thống được thiết kế theo mô hình **Single Page Application (SPA) hoàn toàn không có Backend (Backend-less)**. Mọi xử lý từ gọi dữ liệu, tính toán chỉ báo kỹ thuật (MA, RSI) đến chấm điểm thuật toán đều diễn ra tại trình duyệt của người dùng (Client-side).

**Lợi ích:**
- Chi phí vận hành bằng 0đ (Có thể host miễn phí trên Github Pages, Vercel).
- Tốc độ phản hồi cực nhanh do không phải chờ Backend xử lý.
- Bảo mật tuyệt đối vì không có cơ sở dữ liệu (Database) nào để bị tấn công.

## 2. NGĂN XẾP CÔNG NGHỆ (TECH STACK)
| Thành phần | Công nghệ / Thư viện lựa chọn | Lý do chọn |
| :--- | :--- | :--- |
| **Core Framework** | ReactJS (phiên bản 18+) | Phổ biến, dễ chia component, quản lý state tốt. |
| **Build Tool** | Vite | Tốc độ khởi tạo và build cực nhanh so với Webpack (Create React App cũ). |
| **CSS Framework** | Tailwind CSS | Viết CSS trực tiếp trong class, gọn nhẹ, build ra file CSS siêu nhỏ. |
| **Thư viện Biểu đồ** | Lightweight Charts (TradingView) | Chuyên dụng cho chứng khoán, hỗ trợ nến Nhật, siêu nhẹ (< 50KB), mượt mà. |
| **Data Fetching** | Fetch API (Native) hoặc Axios | Gọi API lấy dữ liệu chứng khoán. |
| **Tính toán kỹ thuật** | Viết hàm JS thuần (hoặc dùng thư viện `technicalindicators`) | Xử lý các công thức SMA, RSI từ mảng dữ liệu giá. |

## 3. LUỒNG DỮ LIỆU (DATA FLOW)
Hệ thống hoạt động theo luồng 3 bước (Fetch -> Calculate -> Render):

1. **Fetch (Thu thập dữ liệu):** - Khi user mở web hoặc gõ tìm mã "SSI". React sẽ gửi một HTTP GET Request tới **Public API của công ty chứng khoán** (Ví dụ: `https://apipubaws.tcbs.com.vn/stock-insight/v1/stock/bars-long-term?ticker=SSI...`).
   - Dữ liệu trả về là chuỗi JSON chứa mảng thông tin các ngày: `[Ngày, Giá Mở, Giá Đóng, Cao nhất, Thấp nhất, Khối lượng]`.
2. **Calculate (Tính toán Thuật toán):**
   - Dữ liệu thô được đưa qua một Service File (`analyzer.js`).
   - Tại đây, hệ thống tính ra các đường MA20, MA50, RSI.
   - Hàm `Scoring` sẽ chạy qua các điều kiện (Trend, Momentum, Volume) để ra tổng điểm (Ví dụ: 8/10 điểm).
3. **Render (Hiển thị UI):**
   - Điểm số được map thành Text (`[MUA MẠNH]`).
   - Dữ liệu nến được đẩy vào `Lightweight Charts` để vẽ biểu đồ.
   - Giao diện cập nhật hiển thị kết quả cho user.

## 4. CHIẾN LƯỢC TRIỂN KHAI (DEPLOYMENT STRATEGY)
- Mã nguồn (Source code) được quản lý trên **GitHub**.
- CI/CD tự động bằng **Vercel** hoặc **Netlify**. Chỉ cần push code lên nhánh `main` là web tự động cập nhật version mới nhất trong 10 giây.