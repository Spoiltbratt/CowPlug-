export interface Investment {
  id: string;
  title: string;
  type: 'Cow' | 'Goat' | 'Ram';
  image: string;
  price: number; // in NGN
  expectedReturn: number; // percentage (e.g., 25 for 25%)
  durationMonths: number;
  availableSlots: number;
  totalSlots: number;
  description: string;
  location: string;
  category: string;
  breed?: string;
  age?: string;
  currentWeight?: string;
  healthStatus?: string;
  expectedValueAtMaturity?: number;
}

export interface MarketplaceAnimal {
  id: string;
  breed: string;
  category: 'Cow' | 'Goat' | 'Ram';
  ageMonths: number;
  weightKg: number;
  healthStatus: 'Excellent' | 'Under Observation' | 'Fully Vaccinated';
  price: number; // in NGN
  image: string;
  location: string;
  gender: 'Male' | 'Female';
}

export interface BlogArticle {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  date: string;
  author: string;
  readTime: string;
  image: string;
  content: string;
}

export type UserRole = 'investor' | 'farmer' | 'admin';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone: string;
  balance: number; // in NGN
  investmentsCount: number;
  avatar: string;
}

export interface AppNotification {
  id: string;
  type: 'system' | 'vaccination' | 'feed' | 'drug' | 'payout' | 'sale';
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export interface QuoteRequest {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  meatType: 'Beef' | 'Goat Meat' | 'Ram Meat' | 'Mixed Bulk';
  quantityKg: number;
  deliveryLocation: string;
  additionalNotes: string;
  status: 'Pending' | 'Approved' | 'Dispatched';
}

export interface FarmerLivestock {
  id: string;
  tagNumber: string;
  breed: string;
  category: 'Cow' | 'Goat' | 'Ram';
  weightKg: number;
  ageMonths: number;
  healthStatus: string;
  photo: string;
  vaccinations: string[];
  lastVetCheck: string;
  datePurchased?: string;
  purchasePrice?: number;
  feedingPlan?: string;
  ownersName?: string;
  estimatedValue?: number;
  videos?: string[];
  weightHistory?: { date: string; weightKg: number }[];
}

export interface UserInvestment {
  id: string;
  investmentId: string;
  investmentTitle: string;
  type: 'Cow' | 'Goat' | 'Ram';
  slotsBought: number;
  amountInvested: number;
  expectedProfit: number;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Completed' | 'Pending';
  progress: number; // 0 to 100
}
