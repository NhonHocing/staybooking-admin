export interface ProvinceOption {
  name: string;
  region: string;
  mergedNote: string;
  defaultLat: number;
  defaultLng: number;
}

/**
 * 34 tỉnh, thành phố trực thuộc Trung ương sau sáp nhập (Nghị quyết 202/2025/QH15),
 * đồng bộ với ứng dụng StayBooking Mobile.
 */
export const VIETNAM_PROVINCES_34: ProvinceOption[] = [
  { name: 'Tuyên Quang', region: 'Miền núi phía Bắc', mergedNote: 'Hà Giang & Tuyên Quang', defaultLat: 21.8236, defaultLng: 105.2142 },
  { name: 'Cao Bằng', region: 'Miền núi phía Bắc', mergedNote: 'Giữ nguyên', defaultLat: 22.6657, defaultLng: 106.2579 },
  { name: 'Lai Châu', region: 'Miền núi phía Bắc', mergedNote: 'Giữ nguyên', defaultLat: 22.3964, defaultLng: 103.4582 },
  { name: 'Lào Cai', region: 'Miền núi phía Bắc', mergedNote: 'Lào Cai & Yên Bái · Sa Pa', defaultLat: 22.3364, defaultLng: 103.8438 },
  { name: 'Thái Nguyên', region: 'Miền núi phía Bắc', mergedNote: 'Bắc Kạn & Thái Nguyên', defaultLat: 21.5942, defaultLng: 105.8482 },
  { name: 'Điện Biên', region: 'Miền núi phía Bắc', mergedNote: 'Giữ nguyên', defaultLat: 21.386, defaultLng: 103.023 },
  { name: 'Lạng Sơn', region: 'Miền núi phía Bắc', mergedNote: 'Giữ nguyên', defaultLat: 21.8537, defaultLng: 106.7615 },
  { name: 'Sơn La', region: 'Miền núi phía Bắc', mergedNote: 'Mộc Châu', defaultLat: 21.3256, defaultLng: 103.9188 },
  { name: 'Phú Thọ', region: 'Miền núi phía Bắc', mergedNote: 'Hòa Bình, Vĩnh Phúc & Phú Thọ', defaultLat: 21.3227, defaultLng: 105.402 },
  { name: 'Hà Nội', region: 'Đồng bằng sông Hồng', mergedNote: 'Thủ đô · TP trực thuộc TW', defaultLat: 21.0285, defaultLng: 105.8542 },
  { name: 'Hải Phòng', region: 'Đồng bằng sông Hồng', mergedNote: 'Hải Dương & Hải Phòng · Cát Bà', defaultLat: 20.8449, defaultLng: 106.6881 },
  { name: 'Quảng Ninh', region: 'Đồng bằng sông Hồng', mergedNote: 'Vịnh Hạ Long', defaultLat: 20.9517, defaultLng: 107.0748 },
  { name: 'Bắc Ninh', region: 'Đồng bằng sông Hồng', mergedNote: 'Bắc Giang & Bắc Ninh', defaultLat: 21.1861, defaultLng: 106.0763 },
  { name: 'Hưng Yên', region: 'Đồng bằng sông Hồng', mergedNote: 'Thái Bình & Hưng Yên', defaultLat: 20.6464, defaultLng: 106.0511 },
  { name: 'Ninh Bình', region: 'Đồng bằng sông Hồng', mergedNote: 'Hà Nam, Nam Định & Ninh Bình', defaultLat: 20.2506, defaultLng: 105.9745 },
  { name: 'Huế', region: 'Bắc Trung Bộ', mergedNote: 'TP trực thuộc TW · Cố đô Huế', defaultLat: 16.4637, defaultLng: 107.5909 },
  { name: 'Thanh Hóa', region: 'Bắc Trung Bộ', mergedNote: 'Sầm Sơn', defaultLat: 19.8067, defaultLng: 105.7852 },
  { name: 'Nghệ An', region: 'Bắc Trung Bộ', mergedNote: 'Vinh, Cửa Lò', defaultLat: 18.6796, defaultLng: 105.6813 },
  { name: 'Hà Tĩnh', region: 'Bắc Trung Bộ', mergedNote: 'Thiên Cầm', defaultLat: 18.3428, defaultLng: 105.9057 },
  { name: 'Quảng Trị', region: 'Bắc Trung Bộ', mergedNote: 'Quảng Bình & Quảng Trị · Phong Nha', defaultLat: 16.8163, defaultLng: 107.1003 },
  { name: 'Đà Nẵng', region: 'Nam Trung Bộ & Tây Nguyên', mergedNote: 'Quảng Nam & Đà Nẵng · Hội An', defaultLat: 16.0544, defaultLng: 108.2471 },
  { name: 'Quảng Ngãi', region: 'Nam Trung Bộ & Tây Nguyên', mergedNote: 'Kon Tum & Quảng Ngãi · Lý Sơn', defaultLat: 15.1214, defaultLng: 108.8044 },
  { name: 'Gia Lai', region: 'Nam Trung Bộ & Tây Nguyên', mergedNote: 'Bình Định & Gia Lai · Quy Nhơn', defaultLat: 13.7829, defaultLng: 109.2196 },
  { name: 'Đắk Lắk', region: 'Nam Trung Bộ & Tây Nguyên', mergedNote: 'Phú Yên & Đắk Lắk · Tuy Hòa', defaultLat: 12.6667, defaultLng: 108.05 },
  { name: 'Khánh Hòa', region: 'Nam Trung Bộ & Tây Nguyên', mergedNote: 'Ninh Thuận & Khánh Hòa · Nha Trang', defaultLat: 12.2388, defaultLng: 109.1967 },
  { name: 'Lâm Đồng', region: 'Nam Trung Bộ & Tây Nguyên', mergedNote: 'Đắk Nông, Bình Thuận & Lâm Đồng · Đà Lạt', defaultLat: 11.9404, defaultLng: 108.4583 },
  { name: 'TP. Hồ Chí Minh', region: 'Đông Nam Bộ', mergedNote: 'Bình Dương, BR-VT & TP.HCM', defaultLat: 10.7769, defaultLng: 106.7009 },
  { name: 'Tây Ninh', region: 'Đông Nam Bộ', mergedNote: 'Long An & Tây Ninh', defaultLat: 11.3352, defaultLng: 106.1099 },
  { name: 'Đồng Nai', region: 'Đông Nam Bộ', mergedNote: 'Bình Phước & Đồng Nai', defaultLat: 10.9574, defaultLng: 106.8427 },
  { name: 'Cần Thơ', region: 'Đồng bằng sông Cửu Long', mergedNote: 'Sóc Trăng, Hậu Giang & Cần Thơ', defaultLat: 10.0329, defaultLng: 105.7875 },
  { name: 'Đồng Tháp', region: 'Đồng bằng sông Cửu Long', mergedNote: 'Tiền Giang & Đồng Tháp', defaultLat: 10.4596, defaultLng: 105.6329 },
  { name: 'Vĩnh Long', region: 'Đồng bằng sông Cửu Long', mergedNote: 'Bến Tre, Trà Vinh & Vĩnh Long', defaultLat: 10.2537, defaultLng: 105.9722 },
  { name: 'An Giang', region: 'Đồng bằng sông Cửu Long', mergedNote: 'Kiên Giang & An Giang · Phú Quốc', defaultLat: 10.1715, defaultLng: 103.9722 },
  { name: 'Cà Mau', region: 'Đồng bằng sông Cửu Long', mergedNote: 'Bạc Liêu & Cà Mau', defaultLat: 9.1768, defaultLng: 105.1524 },
];

