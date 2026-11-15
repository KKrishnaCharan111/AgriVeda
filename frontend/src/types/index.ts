export type UserRole = 'farmer' | 'labour' | 'buyer' | 'shop' | 'admin';
export type Language = 'te' | 'en';

export interface User {
  id: number;
  phone: string;
  email?: string;
  full_name: string;
  role: UserRole;
  preferred_language: Language;
  state: string;
  district: string;
  village: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  farmer_profile?: FarmerProfile;
  labour_profile?: LabourProfile;
  buyer_profile?: BuyerProfile;
  shop_profile?: ShopProfile;
}

export interface FarmerProfile {
  id: number;
  farm_size_acres: number;
  primary_crops: string;
  irrigation_type: string;
  experience_years: number;
}

export interface LabourProfile {
  id: number;
  skills: string;
  daily_wage_expected: number;
  availability_status: string;
  work_radius_km: number;
  experience_years: number;
}

export interface BuyerProfile {
  id: number;
  company_name: string;
  business_type: string;
  gst_number?: string;
  is_pro: boolean;
  pro_expiry?: string;
}

export interface ShopProfile {
  id: number;
  shop_name: string;
  owner_name: string;
  license_number?: string;
  address: string;
  is_verified: boolean;
  is_featured: boolean;
  delivery_available: boolean;
}

export interface CropListing {
  id: number;
  farmer_id: number;
  crop_name: string;
  crop_name_te?: string;
  variety: string;
  category: string;
  quantity: number;
  unit: string;
  expected_price_per_unit: number;
  quality_grade: string;
  organic_certified: boolean;
  description: string;
  harvest_date: string;
  village: string;
  district: string;
  state: string;
  pin_code: string;
  status: string;
  created_at: string;
  farmer_name?: string;
  farmer_phone?: string;
}

export interface BuyerOffer {
  id: number;
  listing_id: number;
  buyer_id: number;
  offered_price_per_unit: number;
  quantity: number;
  total_amount: number;
  counter_price?: number;
  message: string;
  status: string;
  created_at: string;
  buyer_name?: string;
  buyer_phone?: string;
  crop_name?: string;
}

export interface CropDeal {
  id: number;
  listing_id: number;
  offer_id?: number;
  farmer_id: number;
  buyer_id: number;
  agreed_price_per_unit: number;
  agreed_quantity: number;
  total_deal_value: number;
  platform_commission_percent: number;
  platform_commission_amount: number;
  deal_status: string;
  dispute_reason?: string;
  completion_date?: string;
  created_at: string;
  farmer_name?: string;
  buyer_name?: string;
  crop_name?: string;
}

export interface JobListing {
  id: number;
  farmer_id: number;
  title: string;
  title_te?: string;
  crop_type: string;
  work_type: string;
  workers_needed: number;
  daily_wage: number;
  start_date: string;
  duration_days: number;
  village: string;
  district: string;
  state: string;
  description: string;
  contact_phone?: string;
  status: string;
  created_at: string;
  farmer_name?: string;
  applications_count?: number;
}

export interface JobApplication {
  id: number;
  job_id: number;
  worker_id: number;
  proposed_wage?: number;
  message: string;
  status: string;
  created_at: string;
  worker_name?: string;
  worker_phone?: string;
  worker_skills?: string;
  job_title?: string;
  daily_wage?: number;
  district?: string;
}

export interface ShopProduct {
  id: number;
  shop_id: number;
  name: string;
  name_te?: string;
  category: string;
  brand: string;
  price: number;
  unit: string;
  stock_quantity: number;
  is_available: boolean;
  description: string;
  image_url?: string;
  created_at: string;
  shop_name?: string;
  shop_phone?: string;
  shop_district?: string;
  is_shop_verified?: boolean;
}

export interface EquipmentRental {
  id: number;
  shop_id: number;
  equipment_name: string;
  equipment_name_te?: string;
  category: string;
  daily_rate: number;
  hourly_rate?: number;
  deposit_amount: number;
  driver_included: boolean;
  condition: string;
  is_available: boolean;
  description: string;
  image_url?: string;
  created_at: string;
  shop_name?: string;
  shop_phone?: string;
  shop_district?: string;
  is_shop_verified?: boolean;
}

export interface WeatherData {
  district: string;
  state: string;
  temperature: number;
  temperature_min?: number;
  temperature_max?: number;
  humidity: number;
  wind_speed: number;
  rainfall_mm: number;
  weather_condition: string;
  weather_condition_te: string;
  forecast_summary: string;
  forecast_summary_te: string;
  weather_warning?: string;
  weather_warning_te?: string;
  warning_level: string;
  source: string;
  last_updated: string;
}

export interface MarketPrice {
  id: number;
  state: string;
  district: string;
  market_name: string;
  crop_name: string;
  crop_name_te?: string;
  variety: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  unit: string;
  arrival_date: string;
  data_source: string;
  is_verified: boolean;
}

export interface GovernmentScheme {
  id: number;
  name_en: string;
  name_te: string;
  category: string;
  target_states: string;
  description_en: string;
  description_te: string;
  benefits_en: string;
  benefits_te: string;
  eligibility_conditions_en: string;
  eligibility_conditions_te: string;
  required_documents_en: string;
  required_documents_te: string;
  application_procedure_en: string;
  application_procedure_te: string;
  official_portal_url: string;
  last_verified_date: string;
  is_active: boolean;
}

export interface FarmingReminder {
  id: number;
  user_id: number;
  crop_name: string;
  crop_name_te?: string;
  stage: string;
  title_en: string;
  title_te: string;
  description_en: string;
  description_te: string;
  due_date: string;
  is_completed: boolean;
}

export interface CropDoctorResult {
  id: number;
  crop_type: string;
  image_url?: string;
  detected_disease: string;
  detected_disease_te: string;
  confidence_score: number;
  severity: string;
  possible_causes: string;
  possible_causes_te: string;
  treatment_recommendations: string;
  treatment_recommendations_te: string;
  prevention_guide: string;
  prevention_guide_te: string;
  safety_warnings: string;
  safety_warnings_te: string;
  is_expert_consult_recommended: boolean;
  created_at: string;
}

export interface PaymentOrder {
  id: number;
  order_number: string;
  purpose: string;
  amount: number;
  currency: string;
  status: string;
  gateway_name: string;
  description: string;
  created_at: string;
}

export interface PaymentTransaction {
  id: number;
  order_id: number;
  transaction_reference: string;
  payment_method: string;
  amount: number;
  currency: string;
  status: string;
  is_mock: boolean;
  created_at: string;
}

export interface RefundRequest {
  id: number;
  refund_number: string;
  transaction_id: number;
  amount_requested: number;
  amount_refunded: number;
  reason: string;
  explanation: string;
  status: string;
  admin_notes?: string;
  created_at: string;
  transaction_reference?: string;
}

export interface Complaint {
  id: number;
  category: string;
  subject: string;
  description: string;
  status: string;
  admin_response?: string;
  created_at: string;
  user_name?: string;
}

export interface AdminStats {
  total_users: number;
  total_farmers: number;
  total_labourers: number;
  total_buyers: number;
  total_shops: number;
  total_verified_shops: number;
  total_crop_listings: number;
  total_active_listings: number;
  total_deals: number;
  total_deals_value: number;
  total_commission_earned: number;
  total_revenue: number;
  total_job_listings: number;
  pending_refund_requests: number;
  open_complaints: number;
}
