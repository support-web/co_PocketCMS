// 業種タイプ
export type BusinessType = 'beauty' | 'nail' | 'eyelash' | 'bodywork' | 'gym' | 'other';

// 店舗情報
export interface Shop {
  id: string;
  name: string;
  businessType: BusinessType;
  phone: string;
  address: string;
  latitude?: number;
  longitude?: number;
  businessHours: BusinessHour[];
  regularHolidays: string[];
  coverImage?: string;
  logo?: string;
  brandColor: string;
  subdomain: string;
  customDomain?: string;
  reservationUrl?: string;
  lineUrl?: string;
  googleMapUrl?: string;
  todayAvailable: boolean;
  ctaSettings?: CTASettings;
  createdAt: string;
  updatedAt: string;
}

// 営業時間
export interface BusinessHour {
  dayOfWeek: number; // 0-6 (日-土)
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
}

// 施術例投稿
export interface Post {
  id: string;
  shopId: string;
  type: 'case' | 'news'; // 施術例 or お知らせ
  title: string;
  content: string;
  images: string[];
  tags: string[];
  duration?: number; // 施術時間（分）
  priceRange?: 1 | 2 | 3; // ¥ / ¥¥ / ¥¥¥
  staffId?: string;
  status: 'draft' | 'published';
  newsType?: 'campaign' | 'holiday' | 'availability' | 'other'; // お知らせの種類
  displayStart?: string;
  displayEnd?: string;
  createdAt: string;
  updatedAt: string;
}

// メニュー
export interface Menu {
  id: string;
  shopId: string;
  categoryId: string;
  name: string;
  price: number;
  duration?: number;
  description?: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

// メニューカテゴリ
export interface MenuCategory {
  id: string;
  shopId: string;
  name: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

// スタッフ
export interface Staff {
  id: string;
  shopId: string;
  name: string;
  role?: string;
  image?: string;
  description?: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

// FAQ
export interface FAQ {
  id: string;
  shopId: string;
  question: string;
  answer: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

// 分析データ
export interface Analytics {
  id: string;
  shopId: string;
  date: string;
  reservationTaps: number;
  lineTaps: number;
  phoneTaps: number;
  pageViews: number;
  source?: string;
  createdAt: string;
}

// CTA設定
export interface CTASettings {
  showReservation: boolean;
  showLine: boolean;
  showPhone: boolean;
  order: ('reservation' | 'line' | 'phone')[];
}

// オンボーディング状態
export interface OnboardingState {
  step: number;
  businessType?: BusinessType;
  basicInfo?: {
    name: string;
    phone: string;
    address: string;
    businessHours: BusinessHour[];
    regularHolidays: string[];
  };
  reservationSettings?: {
    method: 'url' | 'line' | 'phone' | 'all';
    reservationUrl?: string;
    lineUrl?: string;
  };
  designSettings?: {
    template: string;
    logo?: string;
    brandColor: string;
    coverImage?: string;
  };
}

// APIレスポンス
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
