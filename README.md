# StayBooking Admin Portal (Web)

Trang quản trị Web độc lập (tách biệt hoàn toàn khỏi dự án Flutter Mobile `d:\Project\mobile`) dùng để điều hành toàn bộ hệ thống đặt phòng khách sạn **StayBooking** kết nối trực tiếp PocketBase Backend (`http://127.0.0.1:8090`).

## Cấu trúc thư mục
- `src/lib/`: Cấu hình PocketBase SDK, định dạng tiền/ngày VN, danh sách 34 tỉnh thành sau sáp nhập.
- `src/types/`: Kiểu dữ liệu TypeScript đầy đủ cho 7 bảng (`hotels`, `rooms`, `amenities`, `bookings`, `coupons`, `users`, `reviews`).
- `src/services/`: Tầng gọi API tách biệt theo từng nghiệp vụ.
- `src/components/`: Layout quản trị (`AdminLayout`, `ProtectedRoute`) và bộ UI dùng chung (`StatCard`, `StatusBadge`, `ModalDrawer`, `ConfirmDialog`, `ToastProvider`).
- `src/features/`: Từng phân hệ màn hình độc lập:
  - `auth/` — Đăng nhập Superuser PocketBase
  - `dashboard/` — Tổng quan doanh thu, trạng thái đơn, thống kê khách sạn
  - `bookings/` — Duyệt đơn đặt phòng & Đối soát xác nhận thanh toán cho User
  - `hotels/` — Kiểm tra, thêm/sửa/ẩn/xóa Khách sạn, tọa độ GPS & tiện ích
  - `rooms/` — Kiểm tra, thêm/sửa/ẩn/xóa Phòng nghỉ theo từng khách sạn
  - `amenities/` — Quản lý danh mục Tiện ích chuẩn hóa
  - `coupons/` — Quản lý mã giảm giá (Voucher)
  - `customers/` — Theo dõi tài khoản khách hàng & kiểm duyệt nhận xét

## Cách chạy
1. Chạy PocketBase từ repo Mobile (ackend/) tại `http://127.0.0.1:8090`.
2. Chạy trang Admin:
```powershell
npm install
npm run dev
```
Truy cập: `http://localhost:5173`. Địa chỉ PocketBase đặt trong `.env` (`VITE_POCKETBASE_URL`).

Hướng dẫn đầy đủ (PocketBase, Admin, Android): [docs/HuongDan_ChayDuAn_StayBooking.docx](docs/HuongDan_ChayDuAn_StayBooking.docx)

## Tài khoản quản trị mặc định (PocketBase Superuser)
- **Email**: `admin@staybooking.vn`
- **Mật khẩu**: `AdminStayBooking2026!`


