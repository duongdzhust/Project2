# TÀI LIỆU PHÂN TÍCH YÊU CẦU DỰ ÁN (PRD)
**Tên dự án:** VNStock SmartView (Hệ thống Phân tích & Khuyến nghị Cổ phiếu VN)
**Phiên bản:** 1.0.0
**Ngày lập:** 16/06/2026
**Tác giả:** BA Phân tích

---

## I. TỔNG QUAN DỰ ÁN (PROJECT OVERVIEW)
### 1. Mục tiêu
Xây dựng một nền tảng web cung cấp thông tin, biểu đồ kỹ thuật và đưa ra khuyến nghị mua/bán cổ phiếu trên thị trường chứng khoán Việt Nam (VNIndex). 
Hệ thống hướng tới sự **Đơn giản - Trực quan - Khoa học**, giúp nhà đầu tư F0 hoặc người bận rộn có thể nhanh chóng nắm bắt tình hình mã cổ phiếu mà không cần kiến thức phân tích kỹ thuật sâu.

### 2. Đối tượng người dùng (Target Audience)
- Nhà đầu tư cá nhân cần công cụ tham khảo nhanh.
- Người dùng không muốn các thao tác phức tạp (đăng ký, đăng nhập, nạp tiền).

### 3. Phạm vi hệ thống (In-Scope)
- Không yêu cầu tài khoản/Đăng nhập (Anonymous Login).
- Không lưu trữ dữ liệu cá nhân hay danh mục đầu tư của người dùng.
- Dữ liệu tập trung vào thị trường cơ sở (VNIndex, HNX, UPCOM).

---

## II. YÊU CẦU CHỨC NĂNG (FUNCTIONAL REQUIREMENTS)

### Epic 1: Tổng quan thị trường (Market Dashboard)
- **FR1.1. Chỉ số thị trường:** Hiển thị điểm số, mức thay đổi (+/-), % thay đổi, và thanh khoản của 3 sàn chính (VN-INDEX, HNX-INDEX, UPCOM-INDEX). Dữ liệu real-time hoặc delay 15p.
- **FR1.2. Top biến động (Market Movers):** Hiển thị Top 5 cổ phiếu tăng giá mạnh nhất, giảm mạnh nhất và có khối lượng giao dịch đột biến nhất trong ngày.

### Epic 2: Phân tích mã cổ phiếu chi tiết (Stock Analysis)
- **FR2.1. Tìm kiếm mã:** Thanh tìm kiếm tự động gợi ý (Autocomplete) 3 chữ cái mã cổ phiếu hoặc tên công ty.
- **FR2.2. Biểu đồ trực quan (Interactive Chart):** - Tích hợp biểu đồ nến Nhật (Candlestick).
  - Tích hợp sẵn thanh khối lượng (Volume).
  - Tích hợp tối thiểu 2 đường trung bình động cơ bản (VD: MA20, MA50).
- **FR2.3. Thống kê cơ bản:** Giá hiện tại, Giá trần/sàn/tham chiếu, Khối lượng khớp lệnh, P/E, Vốn hóa.

### Epic 3: Hệ thống thuật toán Khuyến nghị (Robo Advisor)
- **FR3.1. Đánh giá trạng thái (Rating):** Cung cấp kết luận rõ ràng cho mã đang xem: **[ MUA MẠNH ] | [ MUA ] | [ NẮM GIỮ ] | [ BÁN ] | [ BÁN MẠNH ]**.
- **FR3.2. Điểm mua/bán cụ thể:** Hiển thị mốc giá Cắt lỗ (Stoploss) và Chốt lời (Target Price) tham khảo nếu hệ thống báo MUA.
- **FR3.3. Giải thích thuật toán (Khoa học nhưng dễ hiểu):** Hiển thị các tiêu chí checklist để ra quyết định (VD: "Xu hướng ngắn hạn: Tốt (Giá > MA20)", "Đà tăng: Mạnh (RSI > 50)").

### Epic 4: Danh mục quan tâm hàng ngày (Daily Watchlist)
- **FR4.1. Lọc cổ phiếu tự động (Daily Screener):** Cuối mỗi ngày (hoặc realtime), hệ thống tự động chạy thuật toán quét toàn bộ thị trường để đưa ra danh sách 5-10 mã cổ phiếu có dòng tiền vào hoặc tín hiệu kỹ thuật đẹp nhất.
- **FR4.2. Lý do khuyến nghị:** Kèm theo 1 dòng lý do ngắn gọn cho mỗi mã (VD: "SSI - Break nền giá với Vol gấp đôi trung bình").

---

## III. YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS)

1. **Giao diện (UI/UX):**
   - Hỗ trợ Chế độ tối (Dark Mode) làm mặc định (phù hợp với dân tài chính/crypto).
   - Thiết kế Responsive (Ưu tiên trải nghiệm Mobile vì người dùng hay xem lướt trên điện thoại).
   - Clean UI: Loại bỏ hoàn toàn các nút/menu thừa, chỉ tập trung vào ô tìm kiếm và biểu đồ.
2. **Hiệu năng:** - Tốc độ phản hồi tìm kiếm < 500ms.
   - Load biểu đồ < 2 giây.
3. **Bảo mật:** Không có thông tin người dùng nên rủi ro thấp. Cần bảo mật các API key lấy dữ liệu của hệ thống.

---

## IV. ĐỀ XUẤT THUẬT TOÁN ĐÁNH GIÁ (LOGIC FLOW CHO CHỨC NĂNG FR3 & FR4)
*Để hệ thống mang tính "khoa học" như yêu cầu, thuật toán có thể xây dựng dựa trên Phân tích kỹ thuật (Technical Analysis - TA) cơ bản nhưng độ chính xác cao.*

**Đầu vào:** Lịch sử giá & Khối lượng (OHLCV) của 60-90 phiên gần nhất.
**Công thức tính Điểm số (Scoring):**
1. **Trend (Xu hướng - Trọng số 40%):** - Giá hiện tại > SMA 20 & SMA 20 > SMA 50 => +4 điểm.
2. **Momentum (Động lượng - Trọng số 30%):**
   - RSI(14) nằm trong vùng 45 - 65 và đang hướng lên => +3 điểm. (Tránh mua khi RSI > 70 vì đã quá mua).
3. **Volume (Dòng tiền - Trọng số 30%):**
   - Khối lượng phiên hiện tại > 1.5 lần Trung bình khối lượng 20 phiên => +3 điểm.

**Output Khuyến nghị:**
- Từ 8 - 10 điểm: **MUA MẠNH**
- Từ 6 - 7 điểm: **MUA**
- Từ 4 - 5 điểm: **NẮM GIỮ / THEO DÕI**
- Dưới 4 điểm (Đặc biệt gãy MA20): **BÁN**

---

## V. QUY TRÌNH TRẢI NGHIỆM NGƯỜI DÙNG (USER JOURNEY)

1. **Bước 1 (Vào trang):** Người dùng truy cập website. Thấy ngay Bảng tổng quan VN-Index và "Danh sách 5 mã đáng chú ý hôm nay".
2. **Bước 2 (Kiểm tra mã cá nhân):** Người dùng nhập mã đang cầm (VD: HPG) vào ô tìm kiếm to ở giữa màn hình.
3. **Bước 3 (Xem đánh giá):** Trang chi tiết hiện ra.
   - Cạnh trái: Biểu đồ giá trực quan.
   - Cạnh phải: Khối đánh giá "TÍN HIỆU: NẮM GIỮ" màu Vàng. Các checklist chỉ báo tích xanh/đỏ rành mạch.
4. **Bước 4 (Hành động):** Người dùng nhận được thông tin (giữ hay bán HPG, chốt lời giá nào) và thoát trang. Thỏa mãn nhu cầu nhanh - gọn - lẹ.

---

## VI. GIẢI PHÁP KỸ THUẬT DỰ KIẾN (SUGGESTED TECH STACK & DATA API)

Để dự án gọn nhẹ, chi phí vận hành gần như 0 đồng:

1. **Frontend:** ReactJS / Next.js / Angular (SPA để chuyển trang mượt). Sử dụng TailwindCSS cho UI.
2. **Thư viện Biểu đồ:** **TradingView Lightweight Charts** (Mã nguồn mở, rất nhẹ, chuyên dùng cho chứng khoán, hỗ trợ nến Nhật tốt). Hoặc *Chart.js / ApexCharts*.
3. **Nguồn Dữ liệu (Data Source):** *Đây là yếu tố quan trọng nhất của dự án.*
   - **Giải pháp:** Sử dụng các API (không chính thức nhưng public) của các công ty chứng khoán để lấy data EOD (End of Day) hoặc intraday. 
   - *Gợi ý:* API của TCBS (Techcombank Securities), SSI, hoặc VNDirect (hiện cộng đồng dev VN thường dùng các endpoint RESTful lấy JSON từ các nguồn này miễn phí để làm project cá nhân).
   - API của FireAnt (có thể cần gói trả phí nếu gọi nhiều).
4. **Backend/Thuật toán:**
   - Hoàn toàn có thể xử lý thuật toán ngay trên **Client-side (Trình duyệt)** bằng Javascript sau khi fetch được mảng dữ liệu lịch sử giá. Giúp bỏ qua hoàn toàn việc phải xây dựng server Backend phức tạp.