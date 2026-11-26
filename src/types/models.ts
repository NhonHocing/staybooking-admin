export interface HotelRecord {
  id: string;
  name: string;
  city: string;
  address: string;
  description: string;
  amenities: string;
  active: boolean;
  phone: string;
  latitude: number;
  longitude: number;
  rating: number;
  reviewCount: number;
  checkInTime: string;
  checkOutTime: string;
  policy: string;
  images?: string;
  photos?: string[];
  created?: string;
  updated?: string;
}

export interface RoomRecord {
  id: string;
  hotel: string;
  name: string;
  amenities: string;
  capacity: number;
  price: number;
  sizeM2: number;
  bedType: string;
  active: boolean;
  images?: string;
  photos?: string[];
  expand?: {
    hotel?: HotelRecord;
  };
}

export type AmenityCategory = 'hotel' | 'room' | 'both';

export interface AmenityRecord {
  id: string;
  name: string;
  category: AmenityCategory;
  icon: string;
  description: string;
  active: boolean;
  created?: string;
}

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'completed'
  | 'cancelled';

export type PaymentStatus =
  | 'unpaid'
  | 'pending_verification'
  | 'paid'
  | 'refunded';

export interface BookingRecord {
  id: string;
  owner: string;
  room: string;
  bookingCode: string;
  requestId: string;
  hotelName: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  nightlyPrice: number;
  total: number;
  addOnsFee: number;
  discount: number;
  finalTotal: number;
  couponCode: string;
  paymentMethod: 'hotel' | 'vietqr' | string;
  paymentStatus: PaymentStatus | string;
  addOns: string;
  contactName: string;
  phone: string;
  note: string;
  status: BookingStatus;
  approvedAt: string;
  paidAt: string;
  adminNote: string;
  created: string;
  expand?: {
    owner?: UserRecord;
    room?: RoomRecord;
  };
}

export interface CouponRecord {
  id: string;
  code: string;
  discountPercent: number;
  discountAmount: number;
  minTotal: number;
  active: boolean;
}

export interface PaymentSettingsRecord {
  id: string;
  key: string;
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  template: string;
  updated?: string;
}

export interface UserRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  favorites: string;
  verified: boolean;
  created: string;
}

export interface ReviewRecord {
  id: string;
  hotel: string;
  room: string;
  booking: string;
  roomName: string;
  user: string;
  userName: string;
  rating: number;
  comment: string;
  tags: string;
  created: string;
  expand?: {
    hotel?: HotelRecord;
  };
}

export interface AdminStatsResponse {
  totals: {
    hotels: number;
    activeHotels: number;
    rooms: number;
    activeRooms: number;
    amenities: number;
    users: number;
    reviews: number;
    bookings: number;
  };
  bookingsByStatus: {
    pending: number;
    confirmed: number;
    checked_in: number;
    completed: number;
    cancelled: number;
  };
  finance: {
    paidRevenue: number;
    expectedRevenue: number;
    pendingPaymentCount: number;
  };
  revenueByHotel: Array<{
    hotelName: string;
    revenue: number;
  }>;
  recentBookings: BookingRecord[];
}

