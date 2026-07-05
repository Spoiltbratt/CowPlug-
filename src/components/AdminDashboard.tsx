import React, { useState, useMemo, useEffect } from 'react';
import { 
  Activity, Users, HeartPulse, Wallet, Wheat, Settings, BarChart3, 
  FileText, ShieldCheck, Search, Filter, Plus, Edit3, Trash2, 
  UserMinus, UserPlus, AlertTriangle, ShieldAlert, Sparkles, CheckCircle2, 
  TrendingUp, Download, Eye, Calendar, MapPin, Tag, RefreshCw, AlertCircle, 
  PlusCircle, Info, ChevronRight, Check, X, Shield, Lock, FileSpreadsheet, FileDown, EyeOff,
  LogOut, Scale, Store, ShoppingBag, Truck, Receipt, Cpu, Syringe, Image as ImageIcon, Bell, LifeBuoy, UserCheck, Globe, History, MessageSquare, Sliders, Menu,
  Copy, Archive
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { FarmerLivestock, User as UserType, AppNotification } from '../types';
import { Invoice } from '../types_payments';
import { PricePackageFormOverlay } from './PricePackageFormOverlay';

interface AdminDashboardProps {
  currentUser: UserType;
  setCurrentUser: (user: UserType | null) => void;
  farmerLivestock: FarmerLivestock[];
  onAddFarmerLivestock: (newLivestock: FarmerLivestock) => void;
  setFarmerLivestock: React.Dispatch<React.SetStateAction<FarmerLivestock[]>>;
  onDispatchNotification: (n: AppNotification) => void;
  setActiveSection: (sec: string) => void;
  usersList: UserType[];
  setUsersList: React.Dispatch<React.SetStateAction<UserType[]>>;
  adminTab?: string;
  setAdminTab?: (tab: string) => void;
  invoices: Invoice[];
  onUpdateInvoice: (id: string, updates: Partial<Invoice>) => void;
  onUpdateUserBalance: (email: string, amt: number) => void;
  onUpdateUser: (id: string, updates: Partial<UserType>) => void;
  onOpenAdminOrders?: () => void;
  onOpenAdminNotifs?: () => void;
  orders?: any[];
  onUpdateOrder?: (id: string, updates: any) => void;
}

// Sub-types for Admin Dashboard features
interface FeedStock {
  id: string;
  name: string;
  currentStock: number; // in bags
  monthlyUsage: number; // in bags
  reorderLevel: number; // in bags
  pricePerBag: number; // NGN
}

interface PackageVersion {
  id: string;
  editedBy: string;
  action: string;
  timestamp: string;
  state: any;
}

interface PricePackage {
  id: string;
  name: string;
  description?: string;
  color?: string;
  badge?: string;
  
  // Pricing & Costs
  feedPrice: number;
  dailyFeedCost?: number;
  managementFee: number;
  boardingFee?: number;
  herdsmanFee?: number;
  veterinaryFee?: number;
  vaccinationCost?: number;
  insuranceFee?: number;
  rfidFee?: number;
  transportationFee?: number;
  profitMarginPercent?: number;
  taxPercent?: number;

  // Features
  features: string[];
  disabledFeatures?: string[];
  
  // Animal Eligibility
  eligibility?: string[];
  
  // Billing Rules
  billingCycle?: 'monthly' | 'weekly' | 'daily' | 'one-time';
  latePaymentFee?: number;
  gracePeriodDays?: number;
  autoRenewal?: boolean;
  autoSuspension?: boolean;

  // Availability
  availability?: 'public' | 'investors' | 'buyers' | 'premium' | 'invite';

  // Assets
  coverImage?: string;
  thumbnailImage?: string;
  icon?: string;

  // Documents
  documents?: {
    terms?: string;
    agreement?: string;
    brochure?: string;
  };

  // Discounts
  discounts?: {
    promoCode?: string;
    percentDiscount?: number;
    fixedDiscount?: number;
    seasonalOffer?: string;
    bulkDiscountPercent?: number;
    bulkThreshold?: number;
  };

  // Audits & Versioning
  versions?: PackageVersion[];
  lastEdited?: string;
  status?: 'Active' | 'Deactivated' | 'Archived' | 'Inactive' | 'Draft';
  subscribedCount?: number;

  cowFeedPrice?: number;
  cowManagementFee?: number;
  goatFeedPrice?: number;
  goatManagementFee?: number;
  ramFeedPrice?: number;
  ramManagementFee?: number;

  animalType?: string;
  vaccinationSchedule?: string;
  rfidRequired?: boolean;
  growthTimeline?: string;
  deliveryFee?: number;
}

interface AdminAuditLog {
  id: string;
  timestamp: string;
  adminName: string;
  role: string;
  action: string;
  details: string;
  status: 'success' | 'warning' | 'danger';
}

interface SimulatedPayment {
  id: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  date: string;
  status: 'Successful' | 'Pending' | 'Failed' | 'Overdue';
  service: string;
  invoiceNumber: string;
}

export interface StaffPermissionSet {
  viewMetrics: boolean;
  manageLivestock: boolean;
  manageCustomers: boolean;
  manageFinance: boolean;
  manageStaff: boolean;
  editCMS: boolean;
}

export interface StaffRoleConfig {
  name: string;
  description: string;
  permissions: StaffPermissionSet;
}

export default function AdminDashboard({
  currentUser,
  setCurrentUser,
  farmerLivestock,
  onAddFarmerLivestock,
  setFarmerLivestock,
  onDispatchNotification,
  setActiveSection,
  usersList,
  setUsersList,
  adminTab: propAdminTab,
  setAdminTab: propSetAdminTab,
  invoices,
  onUpdateInvoice,
  onUpdateUserBalance,
  onUpdateUser,
  onOpenAdminOrders,
  onOpenAdminNotifs,
  orders = [],
  onUpdateOrder
}: AdminDashboardProps) {

  // Role-Based Access controls Configuration & Permission matrix
  const [rolesConfig, setRolesConfig] = useState<StaffRoleConfig[]>([
    {
      name: 'Super Admin',
      description: 'Unrestricted master cryptographic keys to all enterprise subsystems and ledger records.',
      permissions: {
        viewMetrics: true,
        manageLivestock: true,
        manageCustomers: true,
        manageFinance: true,
        manageStaff: true,
        editCMS: true
      }
    },
    {
      name: 'Farm Manager',
      description: 'Supervises herdsman patrols, stock movements, and range operations.',
      permissions: {
        viewMetrics: true,
        manageLivestock: true,
        manageCustomers: true,
        manageFinance: false,
        manageStaff: false,
        editCMS: true
      }
    },
    {
      name: 'Veterinarian',
      description: 'Responsible for animal clinical dockets, vaccination ledgers, and quarantine node clearances.',
      permissions: {
        viewMetrics: false,
        manageLivestock: true,
        manageCustomers: false,
        manageFinance: false,
        manageStaff: false,
        editCMS: false
      }
    },
    {
      name: 'Finance Officer',
      description: 'Maintains subscription margins, processes meat supply orders, and tracks revenue audits.',
      permissions: {
        viewMetrics: true,
        manageLivestock: false,
        manageCustomers: true,
        manageFinance: true,
        manageStaff: false,
        editCMS: false
      }
    },
    {
      name: 'Inventory Officer',
      description: 'Tracks feed storage bags, monitors silage counts, and logs feed consumption.',
      permissions: {
        viewMetrics: false,
        manageLivestock: true,
        manageCustomers: false,
        manageFinance: false,
        manageStaff: false,
        editCMS: false
      }
    },
    {
      name: 'Customer Support',
      description: 'Replies to helpdesk tickets, handles KYC reviews, and logs notes on customer files.',
      permissions: {
        viewMetrics: false,
        manageLivestock: false,
        manageCustomers: true,
        manageFinance: false,
        manageStaff: false,
        editCMS: false
      }
    },
    {
      name: 'Operations Manager',
      description: 'Orchestrates logistics partnerships, meat deliveries, and seller verifications.',
      permissions: {
        viewMetrics: true,
        manageLivestock: true,
        manageCustomers: true,
        manageFinance: false,
        manageStaff: false,
        editCMS: false
      }
    }
  ]);

  const [adminRole, setAdminRole] = useState<string>('Super Admin');

  // Dynamic helper checking permission set for active simulated role
  const hasPermission = (permission: keyof StaffPermissionSet): boolean => {
    const activeRole = rolesConfig.find(r => r.name === adminRole);
    if (!activeRole) return false;
    return activeRole.permissions[permission];
  };
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);

  // Active navigation section inside Admin Dashboard
  const [internalAdminTab, setInternalAdminTab] = useState<string>('overview');
  const adminTab = propAdminTab !== undefined ? propAdminTab : internalAdminTab;
  const setAdminTab = propSetAdminTab !== undefined ? propSetAdminTab : setInternalAdminTab;
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // New Sellers State
  const [sellersList, setSellersList] = useState<any[]>([]);

  // New Marketplace listings State
  const [marketplaceListings, setMarketplaceListings] = useState<any[]>([]);

  // New Meat Supply Orders State
  const [meatOrders, setMeatOrders] = useState<any[]>([]);

  // New RFID Tags State
  const [rfidTags, setRfidTags] = useState<any[]>([]);

  // New Health Records State
  const [healthRecords, setHealthRecords] = useState<any[]>([]);

  // New Vaccination Schedule State
  const [vaccinationSchedule, setVaccinationSchedule] = useState<any[]>([]);

  // New Support Tickets State
  const [supportTickets, setSupportTickets] = useState<any[]>([]);

  // New Staff Accounts State
  const [staffList, setStaffList] = useState([
    { id: 'stf-1', fullName: 'Dr. Amina Bello', email: 'amina.b@cowplug.ng', role: 'Super Admin', status: 'Active' },
    { id: 'stf-2', fullName: 'Mallam Musa Ibrahim', email: 'musa.i@cowplug.ng', role: 'Farm Manager', status: 'Active' },
    { id: 'stf-3', fullName: 'Dr. Kenneth Okafor', email: 'kenneth.v@cowplug.ng', role: 'Veterinarian', status: 'Active' },
    { id: 'stf-4', fullName: 'Sani Adamu', email: 'sani.f@cowplug.ng', role: 'Finance Officer', status: 'Active' },
    { id: 'stf-5', fullName: 'John Herder', email: 'john.h@cowplug.ng', role: 'Inventory Officer', status: 'Active' }
  ]);

  // New Website CMS Content State (allows live edits without modifying source code)
  const [cmsContent, setCmsContent] = useState({
    heroTitle: 'Sponsor a Livestock, Share the Harvest Profitably',
    heroSubtitle: 'CowPlug NG leverages telemetry and micro-boarding packages to connect investors with local cattle and sheep rearing cooperatives.',
    vision: 'To build a robust, transparent digital pasture bridging sustainable beef production with urban demand.',
    mission: 'To maximize livestock weight gain, protect herds through biometric tech, and guarantee stable revenue for herders and investors.',
    contactPhone: '+234 803 000 0000',
    contactEmail: 'hello@cowplug.ng',
    seoMetaDescription: 'Sponsor cattle & rams in Nigeria. Insured agricultural tech platform with RFID tracking and biometric feeds.'
  });

  // Dynamic Livestock and Feed Ticker Rates
  const [livestockRates, setLivestockRates] = useState(() => {
    const saved = localStorage.getItem('cp_market_livestock_rates');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Red Sokoto Goat', price: '₦85,000', change: '+4.2%' },
      { id: '2', name: 'White Fulani Bull', price: '₦450,000', change: '+2.8%' },
      { id: '3', name: 'Balami Premium Ram', price: '₦175,000', change: '+6.1%' },
      { id: '4', name: 'Sokoto Gudali Cow', price: '₦520,000', change: '+1.5%' },
      { id: '5', name: 'West African Dwarf Goat', price: '₦68,000', change: '+3.9%' },
    ];
  });

  const [feedRates, setFeedRates] = useState(() => {
    const saved = localStorage.getItem('cp_market_feed_rates');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Premium Grass Silage (per kg)', price: '₦1,200', change: '+1.8%' },
      { id: '2', name: 'High-Protein Fattening Concentrate (per bag)', price: '₦24,500', change: '-0.5%' },
      { id: '3', name: 'Organic Feed Hay Bale', price: '₦8,500', change: '+2.3%' },
      { id: '4', name: 'Mineral Salt Lick Block (per block)', price: '₦4,800', change: '+0.0%' },
      { id: '5', name: 'Vitamin-Fortified Wheat Bran (per bag)', price: '₦18,200', change: '+1.2%' },
    ];
  });

  useEffect(() => {
    localStorage.setItem('cp_market_livestock_rates', JSON.stringify(livestockRates));
  }, [livestockRates]);

  useEffect(() => {
    localStorage.setItem('cp_market_feed_rates', JSON.stringify(feedRates));
  }, [feedRates]);

  // Form states for Market Rates CMS
  const [newLiveRate, setNewLiveRate] = useState({ name: '', price: '', change: '+0.0%' });
  const [editingLiveRateId, setEditingLiveRateId] = useState<string | null>(null);
  const [editingLiveRate, setEditingLiveRate] = useState({ name: '', price: '', change: '+0.0%' });
  const [announcementText, setAnnouncementText] = useState('');
  const [targetSegment, setTargetSegment] = useState('all');

  const [newFeedRate, setNewFeedRate] = useState({ name: '', price: '', change: '+0.0%' });
  const [editingFeedRateId, setEditingFeedRateId] = useState<string | null>(null);
  const [editingFeedRate, setEditingFeedRate] = useState({ name: '', price: '', change: '+0.0%' });

  // Customer Documents State
  const [customerDocs, setCustomerDocs] = useState<{ [email: string]: { [docType: string]: { status: string; fileName: string; fileUrl: string } } }>({
    'bashir@yusuf-holdings.com': {
      'National ID': { status: 'Approved', fileName: 'bashir_national_id.pdf', fileUrl: '#' },
      'Driver\'s Licence': { status: 'Approved', fileName: 'bashir_license.pdf', fileUrl: '#' },
      'Utility Bill': { status: 'Approved', fileName: 'bashir_utility_june.pdf', fileUrl: '#' },
      'Selfie Verification': { status: 'Approved', fileName: 'bashir_selfie.jpg', fileUrl: '#' },
      'Signed Agreements': { status: 'Approved', fileName: 'bashir_purchase_agreement.pdf', fileUrl: '#' },
      'Purchase Receipts': { status: 'Approved', fileName: 'bashir_receipt_9921.pdf', fileUrl: '#' },
      'Ownership Certificates': { status: 'Approved', fileName: 'bashir_certificate_cow.pdf', fileUrl: '#' },
      'RFID Certificates': { status: 'Approved', fileName: 'bashir_rfid_certificate.pdf', fileUrl: '#' }
    },
    'chioma.obi@yahoo.com': {
      'National ID': { status: 'Approved', fileName: 'chioma_national_id.pdf', fileUrl: '#' },
      'Driver\'s Licence': { status: 'Pending', fileName: 'chioma_license_temp.pdf', fileUrl: '#' },
      'Utility Bill': { status: 'Approved', fileName: 'chioma_utility.pdf', fileUrl: '#' },
      'Selfie Verification': { status: 'Approved', fileName: 'chioma_face_scan.png', fileUrl: '#' },
      'Signed Agreements': { status: 'Approved', fileName: 'chioma_agreement.pdf', fileUrl: '#' },
      'Purchase Receipts': { status: 'Approved', fileName: 'chioma_receipt_8821.pdf', fileUrl: '#' },
      'Ownership Certificates': { status: 'Approved', fileName: 'chioma_ownership_goat.pdf', fileUrl: '#' },
      'RFID Certificates': { status: 'Pending', fileName: 'chioma_rfid_pending.pdf', fileUrl: '#' }
    }
  });

  // Customer Account Managers State
  const [customerManagers, setCustomerManagers] = useState<{ [email: string]: string }>({
    'bashir@yusuf-holdings.com': 'Mallam Musa Ibrahim',
    'chioma.obi@yahoo.com': 'Dr. Kenneth Okafor'
  });

  // Customer Internal Notes State
  const [customerNotes, setCustomerNotes] = useState<{ [email: string]: string[] }>({
    'bashir@yusuf-holdings.com': [
      'Verified high-net-worth status. Preferred species: Bunaji and Gudali bulls.',
      'Completed physical range visit on 2026-06-10. Satisfied with feeding conditions.'
    ],
    'chioma.obi@yahoo.com': [
      'Inquired about organic feeding schedules. Enrolled in high-protein supplement program.',
      'Requested extra photo feed updates for Red Sokoto goat.'
    ]
  });

  // Customer KYC Verification Status State
  const [customerKycStatus, setCustomerKycStatus] = useState<{ [email: string]: 'Unverified' | 'Pending' | 'Verified' | 'Rejected' }>({
    'bashir@yusuf-holdings.com': 'Verified',
    'chioma.obi@yahoo.com': 'Pending',
    'adebayo.j@gmail.com': 'Verified',
    'musa.farm@cowplug.ng': 'Verified',
    'babajide@cole-estates.ng': 'Rejected',
    'kelechi@amadi-livestock.com': 'Unverified'
  });

  // New Device Login History State
  const [deviceHistory, setDeviceHistory] = useState([
    { id: 'dev-1', ip: '102.89.23.44', browser: 'Chrome 126 (macOS Catalina)', date: '2026-07-02 06:12', location: 'Lagos, Nigeria' },
    { id: 'dev-2', ip: '197.210.64.12', browser: 'Safari iOS 17.5 (iPhone)', date: '2026-07-01 19:40', location: 'Abuja, Nigeria' }
  ]);

  // Search/Filter helper states for support tickets, marketplace, meat supply
  const [ticketFilter, setTicketFilter] = useState('all');
  const [marketFilter, setMarketFilter] = useState('all');
  const [meatFilter, setMeatFilter] = useState('all');
  const [supportSearch, setSupportSearch] = useState('');
  const [marketSearch, setMarketSearch] = useState('');

  // Search & Filtering States
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerPackageFilter, setCustomerPackageFilter] = useState('all');
  const [customerStatusFilter, setCustomerStatusFilter] = useState('all');

  const [livestockSearch, setLivestockSearch] = useState('');
  const [livestockTypeFilter, setLivestockTypeFilter] = useState('all');
  const [livestockStatusFilter, setLivestockStatusFilter] = useState('all');

  // Interactive Selected / Editing Modal States
  const [selectedCustomer, setSelectedCustomer] = useState<UserType | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<UserType | null>(null);
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<FarmerLivestock | null>(null);
  const [editingAnimal, setEditingAnimal] = useState<FarmerLivestock | null>(null);
  const [isAddingAnimal, setIsAddingAnimal] = useState(false);

  // Payment Verification & Animal Tag Assignment Workflow state
  const [assigningInvoice, setAssigningInvoice] = useState<any | null>(null);
  const [assignedTag, setAssignedTag] = useState('');
  const [assignedBreed, setAssignedBreed] = useState('');
  const [assignedCategory, setAssignedCategory] = useState<'Cow' | 'Goat' | 'Ram'>('Cow');
  const [assignedWeight, setAssignedWeight] = useState('250');
  const [assignedGender, setAssignedGender] = useState<'Male' | 'Female'>('Male');
  const [assignedAge, setAssignedAge] = useState('18');
  const [assignedFeedingPlan, setAssignedFeedingPlan] = useState('Pasture Only');
  const [assignedHealth, setAssignedHealth] = useState('Excellent (Green Register)');
  const [assignedVaccines, setAssignedVaccines] = useState('FMD Vaccine, PPR booster, Dewormed');
  const [assignedPhoto, setAssignedPhoto] = useState('');

  // Global Activity feed search states
  const [activitySearch, setActivitySearch] = useState('');
  const [activityTypeFilter, setActivityTypeFilter] = useState('all');

  // Dynamic Custom Packages (Persisted in state, editable without code changes)
  const [pricingPackages, setPricingPackages] = useState<PricePackage[]>(() => {
    const saved = localStorage.getItem('cp_pricing_packages');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse cp_pricing_packages", e);
      }
    }
    return [
      // Cow Packages
      {
        id: 'cow-pasture',
        name: 'Pasture Only',
        description: 'Basic low-cost range pasture package focusing on natural grazing in high-quality rotational fields.',
        color: 'emerald',
        badge: 'Natural Grazing',
        feedPrice: 0,
        dailyFeedCost: 0,
        managementFee: 15000,
        boardingFee: 12000,
        herdsmanFee: 1500,
        veterinaryFee: 1000,
        vaccinationCost: 500,
        insuranceFee: 1000,
        rfidFee: 500,
        transportationFee: 5000,
        profitMarginPercent: 5,
        taxPercent: 7.5,
        features: ['Natural Rotational Grazing', 'Standard Herdsman Patrol', 'Scheduled Mineral Licks', 'Basic Vet Intake Screening'],
        disabledFeatures: [],
        eligibility: ['Cow'],
        billingCycle: 'monthly',
        latePaymentFee: 2500,
        gracePeriodDays: 5,
        autoRenewal: true,
        autoSuspension: true,
        availability: 'public',
        coverImage: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=800&q=80',
        thumbnailImage: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=200&q=80',
        icon: 'Wheat',
        status: 'Active',
        subscribedCount: 12,
        lastEdited: '2026-06-28 14:30',
        animalType: 'Cow',
        vaccinationSchedule: 'Quarterly',
        rfidRequired: true,
        growthTimeline: '12 months',
        deliveryFee: 5000,
        versions: [
          { id: 'v1', editedBy: 'Super Admin', action: 'Initial package design', timestamp: '2026-06-28 14:30', state: null }
        ]
      },
      {
        id: 'cow-premium',
        name: 'Premium Fattening',
        description: 'Ultra high-protein grain finishing package optimized for rapid weight gains & body mass indexes.',
        color: 'indigo',
        badge: 'Fattening Focus',
        feedPrice: 20750,
        dailyFeedCost: 690,
        managementFee: 15000,
        boardingFee: 9000,
        herdsmanFee: 2500,
        veterinaryFee: 3000,
        vaccinationCost: 1500,
        insuranceFee: 1500,
        rfidFee: 1000,
        transportationFee: 7500,
        profitMarginPercent: 20,
        taxPercent: 7.5,
        features: ['High-Protein Feed Concentrate Ration', 'Optimized Corn Silage Finishing', '24/7 Priority Range Health surveillance', 'Pre-Market Weight Tracking & Certification'],
        disabledFeatures: [],
        eligibility: ['Cow'],
        billingCycle: 'monthly',
        latePaymentFee: 5000,
        gracePeriodDays: 3,
        autoRenewal: true,
        autoSuspension: true,
        availability: 'investors',
        coverImage: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
        thumbnailImage: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=200&q=80',
        icon: 'Sparkles',
        status: 'Active',
        subscribedCount: 15,
        lastEdited: '2026-07-01 16:45',
        animalType: 'Cow',
        vaccinationSchedule: 'Monthly',
        rfidRequired: true,
        growthTimeline: '6 months',
        deliveryFee: 7500,
        versions: [
          { id: 'v1', editedBy: 'Super Admin', action: 'Initial package design', timestamp: '2026-07-01 16:45', state: null }
        ]
      },
      {
        id: 'cow-breeding',
        name: 'Breeding',
        description: 'Comprehensive livestock reproduction program focusing on optimal nutrition and maternal care.',
        color: 'purple',
        badge: 'Reproduction Program',
        feedPrice: 18500,
        dailyFeedCost: 600,
        managementFee: 20000,
        boardingFee: 10000,
        herdsmanFee: 3000,
        veterinaryFee: 5000,
        vaccinationCost: 2000,
        insuranceFee: 3000,
        rfidFee: 1000,
        transportationFee: 8000,
        profitMarginPercent: 15,
        taxPercent: 7.5,
        features: ['Artificial Insemination Support', 'Gestation Nutritional Management', 'Dedicated Calving Stall Access', 'Pedigree Registry & DNA Tracking'],
        disabledFeatures: [],
        eligibility: ['Cow'],
        billingCycle: 'monthly',
        latePaymentFee: 4000,
        gracePeriodDays: 5,
        autoRenewal: true,
        autoSuspension: true,
        availability: 'public',
        coverImage: 'https://images.unsplash.com/photo-1545468130-14502eb1e5ae?auto=format&fit=crop&w=800&q=80',
        thumbnailImage: 'https://images.unsplash.com/photo-1545468130-14502eb1e5ae?auto=format&fit=crop&w=200&q=80',
        icon: 'Heart',
        status: 'Active',
        subscribedCount: 5,
        lastEdited: '2026-07-02 10:00',
        animalType: 'Cow',
        vaccinationSchedule: 'Bi-annual',
        rfidRequired: true,
        growthTimeline: '18 months',
        deliveryFee: 8000,
        versions: [
          { id: 'v1', editedBy: 'Super Admin', action: 'Initial package design', timestamp: '2026-07-02 10:00', state: null }
        ]
      },
      // Goat Packages
      {
        id: 'goat-standard',
        name: 'Standard Rearing',
        description: 'Structured browse forage program supplemented with standard minerals for optimal growth.',
        color: 'emerald',
        badge: 'Standard Forage',
        feedPrice: 5000,
        dailyFeedCost: 160,
        managementFee: 8000,
        boardingFee: 6000,
        herdsmanFee: 1000,
        veterinaryFee: 1000,
        vaccinationCost: 500,
        insuranceFee: 500,
        rfidFee: 500,
        transportationFee: 2500,
        profitMarginPercent: 8,
        taxPercent: 7.5,
        features: ['Rotational Browse Forage', 'Evening Legume Chaff Supplement', 'Standard Veterinary Audits', 'Manual Ear Tag Monitoring'],
        disabledFeatures: [],
        eligibility: ['Goat'],
        billingCycle: 'monthly',
        latePaymentFee: 1500,
        gracePeriodDays: 5,
        autoRenewal: true,
        autoSuspension: true,
        availability: 'public',
        coverImage: 'https://images.unsplash.com/photo-1524024412335-247dd14af9a1?auto=format&fit=crop&w=800&q=80',
        thumbnailImage: 'https://images.unsplash.com/photo-1524024412335-247dd14af9a1?auto=format&fit=crop&w=200&q=80',
        icon: 'Leaf',
        status: 'Active',
        subscribedCount: 8,
        lastEdited: '2026-07-02 11:30',
        animalType: 'Goat',
        vaccinationSchedule: 'Quarterly',
        rfidRequired: false,
        growthTimeline: '9 months',
        deliveryFee: 2500,
        versions: [
          { id: 'v1', editedBy: 'Super Admin', action: 'Initial package design', timestamp: '2026-07-02 11:30', state: null }
        ]
      },
      {
        id: 'goat-premium',
        name: 'Premium Care',
        description: 'All-inclusive premium healthcare and high-energy feeding program for elite dairy or meat goats.',
        color: 'amber',
        badge: 'Max Care',
        feedPrice: 9500,
        dailyFeedCost: 310,
        managementFee: 10000,
        boardingFee: 8000,
        herdsmanFee: 1500,
        veterinaryFee: 2500,
        vaccinationCost: 1000,
        insuranceFee: 1200,
        rfidFee: 1000,
        transportationFee: 3500,
        profitMarginPercent: 12,
        taxPercent: 7.5,
        features: ['Premium Pelleted Concentrates', 'Continuous Milk/Body Scoring', 'Priority On-Call Vet Cover', 'Advanced Automated RFID Tracking'],
        disabledFeatures: [],
        eligibility: ['Goat'],
        billingCycle: 'monthly',
        latePaymentFee: 2500,
        gracePeriodDays: 5,
        autoRenewal: true,
        autoSuspension: true,
        availability: 'public',
        coverImage: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=800&q=80',
        thumbnailImage: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=200&q=80',
        icon: 'Activity',
        status: 'Active',
        subscribedCount: 14,
        lastEdited: '2026-07-03 08:15',
        animalType: 'Goat',
        vaccinationSchedule: 'Monthly',
        rfidRequired: true,
        growthTimeline: '6 months',
        deliveryFee: 3500,
        versions: [
          { id: 'v1', editedBy: 'Super Admin', action: 'Initial package design', timestamp: '2026-07-03 08:15', state: null }
        ]
      },
      // Ram Packages
      {
        id: 'ram-eid',
        name: 'Eid Fattening',
        description: 'Targeted pre-Eid grain-finishing program to achieve premium body mass and shiny coat for holiday markets.',
        color: 'amber',
        badge: 'Festive Prep',
        feedPrice: 11000,
        dailyFeedCost: 360,
        managementFee: 10000,
        boardingFee: 8000,
        herdsmanFee: 1500,
        veterinaryFee: 2000,
        vaccinationCost: 1000,
        insuranceFee: 1000,
        rfidFee: 500,
        transportationFee: 4000,
        profitMarginPercent: 12,
        taxPercent: 7.5,
        features: ['High-Energy Barley & Corn Finishing', 'Shiny Coat Nutritional Boosters', 'Weight Benchmarking for Holiday Windows', 'Festive Pre-Sale Grooming'],
        disabledFeatures: [],
        eligibility: ['Ram'],
        billingCycle: 'monthly',
        latePaymentFee: 3000,
        gracePeriodDays: 5,
        autoRenewal: true,
        autoSuspension: true,
        availability: 'public',
        coverImage: 'https://images.unsplash.com/photo-1484557985045-def2550a4763?auto=format&fit=crop&w=800&q=80',
        thumbnailImage: 'https://images.unsplash.com/photo-1484557985045-def2550a4763?auto=format&fit=crop&w=200&q=80',
        icon: 'Star',
        status: 'Active',
        subscribedCount: 22,
        lastEdited: '2026-07-03 09:00',
        animalType: 'Ram',
        vaccinationSchedule: 'Monthly',
        rfidRequired: true,
        growthTimeline: '4 months',
        deliveryFee: 4000,
        versions: [
          { id: 'v1', editedBy: 'Super Admin', action: 'Initial package design', timestamp: '2026-07-03 09:00', state: null }
        ]
      },
      {
        id: 'ram-breeding',
        name: 'Breeding Package',
        description: 'Specialized breeding herd program optimizing sire genetics, premium feed, and pedigree records.',
        color: 'purple',
        badge: 'Genetic Focus',
        feedPrice: 13000,
        dailyFeedCost: 430,
        managementFee: 12000,
        boardingFee: 9000,
        herdsmanFee: 2000,
        veterinaryFee: 3000,
        vaccinationCost: 1500,
        insuranceFee: 2000,
        rfidFee: 1000,
        transportationFee: 5000,
        profitMarginPercent: 15,
        taxPercent: 7.5,
        features: ['Genetics & Sire Evaluation', 'High-Protein Bulking Rations', 'Advanced Reproductive Healthcare', 'Full Pedigree Verification'],
        disabledFeatures: [],
        eligibility: ['Ram'],
        billingCycle: 'monthly',
        latePaymentFee: 3500,
        gracePeriodDays: 5,
        autoRenewal: true,
        autoSuspension: true,
        availability: 'public',
        coverImage: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=800&q=80',
        thumbnailImage: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=200&q=80',
        icon: 'Heart',
        status: 'Active',
        subscribedCount: 9,
        lastEdited: '2026-07-03 10:30',
        animalType: 'Ram',
        vaccinationSchedule: 'Bi-annual',
        rfidRequired: true,
        growthTimeline: '12 months',
        deliveryFee: 5000,
        versions: [
          { id: 'v1', editedBy: 'Super Admin', action: 'Initial package design', timestamp: '2026-07-03 10:30', state: null }
        ]
      }
    ];
  });

  // State hooks for animal types and dynamic tab navigation
  const [animalTypes, setAnimalTypes] = useState<string[]>(() => {
    const saved = localStorage.getItem('cp_animal_types');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return ['Cow', 'Goat', 'Ram'];
  });
  const [selectedAnimalTab, setSelectedAnimalTab] = useState<string>('Cow');

  // Helper to resolve emoji icons for animal species
  const getSpeciesIcon = (species: string) => {
    const sp = species.toLowerCase();
    if (sp.includes('cow')) return '🐄';
    if (sp.includes('goat')) return '🐐';
    if (sp.includes('ram')) return '🐏';
    if (sp.includes('sheep')) return '🐏';
    if (sp.includes('poultry') || sp.includes('chicken')) return '🐔';
    if (sp.includes('camel')) return '🐪';
    if (sp.includes('pig')) return '🐖';
    return '🐾';
  };

  // Handler to dynamically add a new animal category
  const handleAddAnimalType = () => {
    const newType = prompt("Enter the name of the new animal category (e.g. Poultry, Sheep, Camel, Rabbit):");
    if (newType && newType.trim()) {
      const sanitized = newType.trim();
      const capitalized = sanitized.charAt(0).toUpperCase() + sanitized.slice(1);
      if (animalTypes.includes(capitalized)) {
        alert(`${capitalized} category already exists!`);
        return;
      }
      const updated = [...animalTypes, capitalized];
      setAnimalTypes(updated);
      localStorage.setItem('cp_animal_types', JSON.stringify(updated));
      setSelectedAnimalTab(capitalized);
    }
  };

  // Sync custom pricing packages state to localStorage
  useEffect(() => {
    localStorage.setItem('cp_pricing_packages', JSON.stringify(pricingPackages));
  }, [pricingPackages]);

  // Packages tab UI state
  const [isAddingPackage, setIsAddingPackage] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PricePackage | null>(null);
  const [assigningPackage, setAssigningPackage] = useState<PricePackage | null>(null);
  const [assignTargetSpecie, setAssignTargetSpecie] = useState<'Cow' | 'Goat' | 'Ram' | 'All'>('All');
  const [packageSearch, setPackageSearch] = useState('');
  const [packageStatusFilter, setPackageStatusFilter] = useState<string>('all');
  const [packageSortBy, setPackageSortBy] = useState<'name' | 'price' | 'popularity'>('popularity');
  const [selectedDetailedPackage, setSelectedDetailedPackage] = useState<PricePackage | null>(null);
  const [isGlobalSettingsOpen, setIsGlobalSettingsOpen] = useState(false);

  // Global Package Settings State
  const [globalPackageSettings, setGlobalPackageSettings] = useState({
    defaultVAT: 7.5,
    defaultManagementFee: 15000,
    defaultFeedCost: 12000,
    defaultRFIDFee: 2500,
    defaultInsuranceFee: 5000,
    currency: '₦',
    priceRounding: true,
    autoPriceUpdates: false
  });

  // Staff Management tab UI state
  const [staffSubTab, setStaffSubTab] = useState<'directory' | 'roles'>('directory');
  const [staffSearch, setStaffSearch] = useState('');
  const [staffRoleFilter, setStaffRoleFilter] = useState('all');
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [selectedRoleForEdit, setSelectedRoleForEdit] = useState<string>('Super Admin');
  const [isCreatingRole, setIsCreatingRole] = useState(false);

  // Feed Inventory State
  const [feedStock, setFeedStock] = useState<FeedStock[]>([
    { id: 'feed-pkc', name: 'PKC (Palm Kernel Cake)', currentStock: 120, monthlyUsage: 45, reorderLevel: 50, pricePerBag: 8500 },
    { id: 'feed-dusa', name: 'Dusa (Wheat Bran)', currentStock: 85, monthlyUsage: 30, reorderLevel: 40, pricePerBag: 6000 },
    { id: 'feed-soy', name: 'Soybean Chaff', currentStock: 42, monthlyUsage: 25, reorderLevel: 50, pricePerBag: 12000 },
    { id: 'feed-beans', name: 'Beans Chaff', currentStock: 98, monthlyUsage: 35, reorderLevel: 45, pricePerBag: 7500 }
  ]);

  // Simulated Historical Payments List (including successful, pending, failed, overdue)
  const [paymentsList, setPaymentsList] = useState<SimulatedPayment[]>([
    { id: 'pay-001', customerName: 'Alhaji Bashir Yusuf', customerEmail: 'bashir@yusuf-holdings.com', amount: 700000, date: '2026-06-15', status: 'Successful', service: 'Acquisition Price (Bunaji Cows)', invoiceNumber: 'INV-2026-CW001A' },
    { id: 'pay-002', customerName: 'Alhaji Bashir Yusuf', customerEmail: 'bashir@yusuf-holdings.com', amount: 30750, date: '2026-06-20', status: 'Successful', service: 'Boarding & Diet Supplement Fee', invoiceNumber: 'INV-2026-CW001B' },
    { id: 'pay-003', customerName: 'Adebayo Johnson', customerEmail: 'adebayo.j@gmail.com', amount: 410000, date: '2026-06-22', status: 'Successful', service: 'Acquisition Price (Sokoto Gudali)', invoiceNumber: 'INV-2026-CW002A' },
    { id: 'pay-004', customerName: 'Chioma Obi', customerEmail: 'chioma.obi@yahoo.com', amount: 85000, date: '2026-06-25', status: 'Successful', service: 'Acquisition Price (Red Sokoto)', invoiceNumber: 'INV-2026-GT2104A' },
    { id: 'pay-005', customerName: 'Mallam Musa Ibrahim', customerEmail: 'musa.farm@cowplug.ng', amount: 15000, date: '2026-06-28', status: 'Pending', service: 'Quarantine Range Boarding', invoiceNumber: 'INV-2026-FARM01' },
    { id: 'pay-006', customerName: 'Babajide Cole', customerEmail: 'babajide@cole-estates.ng', amount: 350000, date: '2026-06-30', status: 'Failed', service: 'Premium White Fulani Acquisition', invoiceNumber: 'INV-2026-CW010F' },
    { id: 'pay-007', customerName: 'Kelechi Amadi', customerEmail: 'kelechi@amadi-livestock.com', amount: 45750, date: '2026-06-01', status: 'Overdue', service: 'Overdue Boarding & Treatment Fee', invoiceNumber: 'INV-2026-MGT404' }
  ]);

  // New Invoice Generator Form States
  const [newInvoiceCustomer, setNewInvoiceCustomer] = useState('');
  const [newInvoiceAmount, setNewInvoiceAmount] = useState('');
  const [newInvoiceService, setNewInvoiceService] = useState('Boarding & Diet Management');
  const [newInvoiceSuccess, setNewInvoiceSuccess] = useState(false);

  // Admin Audit logs
  const [adminLogs, setAdminLogs] = useState<AdminAuditLog[]>([
    { id: 'log-1', timestamp: '2026-07-02 05:10:12', adminName: 'Dr. Amina Bello', role: 'Super Admin', action: 'System Setup', details: 'Configured Oyo Range C multi-node gateway endpoints', status: 'success' },
    { id: 'log-2', timestamp: '2026-07-02 04:30:25', adminName: 'Mallam Yusuf (Farm Head)', role: 'Farm Manager', action: 'Feed Intake Log', details: 'Added 50 bags of Soybean Chaff into Central Warehouse B', status: 'success' },
    { id: 'log-3', timestamp: '2026-07-02 02:15:44', adminName: 'Dr. Amina Bello', role: 'Super Admin', action: 'Package Pricing Update', details: 'Modified Premium Fattening Package price to ₦20,750', status: 'warning' },
    { id: 'log-4', timestamp: '2026-07-01 18:40:00', adminName: 'John herder (Staff)', role: 'Staff', action: 'Vaccination Entry', details: 'Registered FMD Vaccine booster for animal tag CPG-CW-002', status: 'success' },
    { id: 'log-5', timestamp: '2026-06-30 11:22:05', adminName: 'Dr. Amina Bello', role: 'Super Admin', action: 'Customer Suspended', details: 'Suspended account babajide@cole-estates.ng due to failed escrow payments', status: 'danger' }
  ]);

  // New livestock registration inputs (RFID tracking support)
  const [newAnimalRFID, setNewAnimalRFID] = useState(() => `RFID-NG-900${Math.floor(100 + Math.random() * 900)}`);
  const [newAnimalTag, setNewAnimalTag] = useState(() => `CPG-CW-00${farmerLivestock.length + 1}`);
  const [newAnimalName, setNewAnimalName] = useState('');
  const [newAnimalType, setNewAnimalType] = useState<'Cow' | 'Goat' | 'Ram'>('Cow');
  const [newAnimalBreed, setNewAnimalBreed] = useState('White Fulani (Bunaji)');
  const [newAnimalAge, setNewAnimalAge] = useState('20');
  const [newAnimalWeight, setNewAnimalWeight] = useState('290');
  const [newAnimalPrice, setNewAnimalPrice] = useState('250000');
  const [newAnimalOwner, setNewAnimalOwner] = useState('Alhaji Bashir Yusuf');
  const [newAnimalLocation, setNewAnimalLocation] = useState('Oyo Range C');
  const [newAnimalPlan, setNewAnimalPlan] = useState('Pasture + Supplement Feed');

  // Trigger Action Helper
  const logAdminAction = (action: string, details: string, status: 'success' | 'warning' | 'danger' = 'success') => {
    const newLog: AdminAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      adminName: currentUser.fullName,
      role: adminRole,
      action,
      details,
      status
    };
    setAdminLogs(prev => [newLog, ...prev]);
  };

  // 1. Dashboard calculations
  const totalCustomers = useMemo(() => {
    return usersList.filter(u => u.role === 'investor' || u.role === 'farmer').length;
  }, [usersList]);

  const totalLivestock = farmerLivestock.length;
  const totalCows = farmerLivestock.filter(an => an.category?.toLowerCase() === 'cow').length;
  const totalRams = farmerLivestock.filter(an => an.category?.toLowerCase() === 'ram').length;
  const totalGoats = farmerLivestock.filter(an => an.category?.toLowerCase() === 'goat').length;

  const totalRevenue = useMemo(() => {
    return paymentsList.filter(p => p.status === 'Successful').reduce((sum, p) => sum + p.amount, 0);
  }, [paymentsList]);

  const pendingPaymentsSum = useMemo(() => {
    return paymentsList.filter(p => p.status === 'Pending').reduce((sum, p) => sum + p.amount, 0);
  }, [paymentsList]);

  const healthAlertsCount = useMemo(() => {
    return farmerLivestock.filter(an => an.healthStatus.toLowerCase().includes('observation') || an.healthStatus.toLowerCase().includes('sick')).length;
  }, [farmerLivestock]);

  const readyForSaleCount = useMemo(() => {
    // Treat Red Sokoto and Soko Gudali as ready-for-market
    return farmerLivestock.filter(an => (an.estimatedValue && an.estimatedValue >= 400000) || an.weightKg > 330).length;
  }, [farmerLivestock]);

  // Admin Alerts Feed
  const adminAlerts = useMemo(() => {
    const alerts: { id: string; type: 'danger' | 'warning' | 'info' | 'success'; title: string; desc: string; date: string }[] = [];
    
    // Low feed inventory alert
    feedStock.forEach(feed => {
      if (feed.currentStock < feed.reorderLevel) {
        alerts.push({
          id: `alert-feed-${feed.id}`,
          type: 'danger',
          title: `Low Stock: ${feed.name}`,
          desc: `Current stock (${feed.currentStock} bags) is below reorder level (${feed.reorderLevel} bags).`,
          date: 'Just Now'
        });
      }
    });

    // Overdue accounts alert
    const overduePayCount = paymentsList.filter(p => p.status === 'Overdue').length;
    if (overduePayCount > 0) {
      alerts.push({
        id: 'alert-overdue-pay',
        type: 'warning',
        title: 'Overdue Invoices Detected',
        desc: `${overduePayCount} customer accounts have outstanding grazing or treatment balances unpaid.`,
        date: '1 hour ago'
      });
    }

    // New customer registration alerts
    alerts.push({
      id: 'alert-new-reg',
      type: 'info',
      title: 'New Customer Verification Required',
      desc: 'Alhaji Bashir Yusuf completed biometric identity registration for Range access.',
      date: '3 hours ago'
    });

    // Animal Ready for Market
    if (readyForSaleCount > 0) {
      alerts.push({
        id: 'alert-market-ready',
        type: 'success',
        title: `${readyForSaleCount} Animals Market Ready`,
        desc: 'Weight benchmarks achieved for Sokoto Gudali cattle tags.',
        date: 'Today'
      });
    }

    return alerts;
  }, [feedStock, paymentsList, readyForSaleCount]);

  // 2. Customer Directory Filter
  const filteredCustomers = useMemo(() => {
    return usersList.filter(user => {
      const matchesSearch = user.fullName.toLowerCase().includes(customerSearch.toLowerCase()) || 
                            user.email.toLowerCase().includes(customerSearch.toLowerCase()) || 
                            user.phone.includes(customerSearch);
      
      const userCategory = user.role === 'farmer' ? 'Seller' : 'Customer';
      const matchesPackage = customerPackageFilter === 'all' || 
                             (customerPackageFilter === 'investor' && user.role === 'investor') ||
                             (customerPackageFilter === 'farmer' && user.role === 'farmer');
      
      const matchesStatus = customerStatusFilter === 'all' || 
                            (customerStatusFilter === 'suspended' && (user.email.includes('babajide') || user.email.includes('suspend'))) ||
                            (customerStatusFilter === 'active' && !user.email.includes('babajide')) ||
                            (customerStatusFilter === 'verified' && customerKycStatus[user.email] === 'Verified') ||
                            (customerStatusFilter === 'unverified' && customerKycStatus[user.email] !== 'Verified');

      return matchesSearch && matchesPackage && matchesStatus;
    });
  }, [usersList, customerSearch, customerPackageFilter, customerStatusFilter, customerKycStatus]);

  // 3. Livestock Directory Filter
  const filteredLivestock = useMemo(() => {
    return farmerLivestock.filter(animal => {
      const matchesSearch = animal.tagNumber.toLowerCase().includes(livestockSearch.toLowerCase()) ||
                            animal.breed.toLowerCase().includes(livestockSearch.toLowerCase()) ||
                            (animal.ownersName && animal.ownersName.toLowerCase().includes(livestockSearch.toLowerCase()));
      
      const matchesType = livestockTypeFilter === 'all' || animal.category?.toLowerCase() === livestockTypeFilter.toLowerCase();
      
      const matchesStatus = livestockStatusFilter === 'all' || 
                            (livestockStatusFilter === 'Healthy' && animal.healthStatus.toLowerCase().includes('excellent')) ||
                            (livestockStatusFilter === 'Observation' && animal.healthStatus.toLowerCase().includes('observation')) ||
                            (livestockStatusFilter === 'Sold' && animal.healthStatus.toLowerCase().includes('sold'));

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [farmerLivestock, livestockSearch, livestockTypeFilter, livestockStatusFilter]);

  // Computed All-Inclusive Global Activity Feed
  const allPlatformActivities = useMemo(() => {
    const list: (AdminAuditLog & { type: 'admin' | 'payment' | 'livestock' | 'support' })[] = [];

    // Add Admin Logs
    adminLogs.forEach(log => {
      list.push({
        ...log,
        type: 'admin'
      });
    });

    // Add Payments
    paymentsList.forEach(pay => {
      list.push({
        id: pay.id,
        timestamp: `${pay.date} 12:00:00`,
        adminName: pay.customerName,
        role: pay.customerEmail.includes('cowplug') ? 'Staff' : 'Customer',
        action: pay.status === 'Successful' ? 'Payment Succeeded' : pay.status === 'Pending' ? 'Payment Pending' : pay.status === 'Failed' ? 'Payment Failed' : 'Payment Overdue',
        details: `Processed payment of ₦${pay.amount.toLocaleString()} for ${pay.service}. (Invoice: ${pay.invoiceNumber})`,
        status: pay.status === 'Successful' ? 'success' : pay.status === 'Pending' ? 'warning' : 'danger',
        type: 'payment'
      });
    });

    // Add Livestock onboarding
    farmerLivestock.forEach(live => {
      list.push({
        id: `live-act-${live.id}`,
        timestamp: `${live.datePurchased || '2026-06-15'} 09:15:00`,
        adminName: live.ownersName || 'Oyo Range Ops',
        role: 'Owner/Seller',
        action: 'Livestock Registered',
        details: `Boarded ${live.breed} (${live.category}) with tag ID ${live.tagNumber}. Target Weight: ${live.weightKg}kg. Feeding Plan: ${live.feedingPlan || 'Pasture'}`,
        status: 'success',
        type: 'livestock'
      });
    });

    // Add Support tickets
    supportTickets.forEach(tkt => {
      list.push({
        id: `tkt-act-${tkt.id}`,
        timestamp: `${tkt.date} 10:15:00`,
        adminName: tkt.customerName,
        role: 'Customer',
        action: `Ticket ${tkt.status}`,
        details: `Inquiry "${tkt.title}" was filed: "${tkt.issue}". Priority Level: ${tkt.priority}`,
        status: tkt.status === 'Closed' ? 'success' : tkt.priority === 'Critical' ? 'danger' : 'warning',
        type: 'support'
      });
    });

    // Sort by timestamp descending
    return list.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [adminLogs, paymentsList, farmerLivestock, supportTickets]);

  const filteredActivities = useMemo(() => {
    return allPlatformActivities.filter(act => {
      const matchesSearch = act.adminName.toLowerCase().includes(activitySearch.toLowerCase()) || 
                            act.action.toLowerCase().includes(activitySearch.toLowerCase()) ||
                            act.details.toLowerCase().includes(activitySearch.toLowerCase());
      const matchesType = activityTypeFilter === 'all' || act.type === activityTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [allPlatformActivities, activitySearch, activityTypeFilter]);

  // Add Custom Generated Animal Form
  const handleAddNewAnimalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const weightVal = parseFloat(newAnimalWeight) || 280;
    const priceVal = parseFloat(newAnimalPrice) || 220000;
    const ageVal = parseInt(newAnimalAge) || 18;

    const newAnimalItem: FarmerLivestock = {
      id: `live-admin-${Date.now()}`,
      tagNumber: newAnimalTag,
      breed: newAnimalBreed,
      category: newAnimalType,
      weightKg: weightVal,
      ageMonths: ageVal,
      healthStatus: 'Excellent (Green Register)',
      photo: newAnimalType === 'Cow' 
        ? 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&q=80&w=600'
        : 'https://images.unsplash.com/photo-1608539733291-a1dfc76b9789?auto=format&fit=crop&q=80&w=600',
      vaccinations: ['PPR Vaccine', 'Foot-and-Mouth (FMD) Booster'],
      lastVetCheck: new Date().toISOString().split('T')[0],
      datePurchased: new Date().toISOString().split('T')[0],
      purchasePrice: priceVal,
      feedingPlan: newAnimalPlan,
      ownersName: newAnimalOwner,
      estimatedValue: priceVal * 1.15,
      weightHistory: [
        { date: 'Initial Registration', weightKg: weightVal }
      ]
    };

    setFarmerLivestock(prev => [newAnimalItem, ...prev]);
    logAdminAction('Livestock Intake Registered', `RFID tag allocated ${newAnimalRFID} for ${newAnimalBreed} (Tag: ${newAnimalTag})`);
    
    // Dispatch system-wide alert
    onDispatchNotification({
      id: `admin-notif-add-${Date.now()}`,
      type: 'system',
      title: '🐄 New Livestock Enrolled',
      message: `Admin registered White Fulani cow Tag: ${newAnimalTag} under ${newAnimalOwner}`,
      date: new Date().toISOString(),
      read: false
    });

    setIsAddingAnimal(false);
    alert('Success: New livestock enrolled onto secure Range ledger!');
    // Recalculate next defaults
    setNewAnimalTag(`CPG-${newAnimalType === 'Cow' ? 'CW' : newAnimalType === 'Goat' ? 'GT' : 'RM'}-0${farmerLivestock.length + 2}`);
  };

  // Suspend Customer Action
  const handleToggleSuspend = (email: string) => {
    const updated = usersList.map(u => {
      if (u.email === email) {
        const isCurrentlySuspended = email.includes('suspend') || u.id.startsWith('suspended-');
        return { ...u, id: isCurrentlySuspended ? `user-${u.email}` : `suspended-${u.email}` };
      }
      return u;
    });
    setUsersList(updated);
    logAdminAction('Customer Status Changed', `Toggled suspension / account limits on ${email}`, 'warning');
    alert(`Success: Account constraints updated for ${email}`);
  };

  // Delete Customer Action
  const handleDeleteCustomer = (id: string, name: string) => {
    if (confirm(`Are you absolutely sure you want to delete customer ${name} from CowPlug? All custody contracts will be closed.`)) {
      setUsersList(prev => prev.filter(u => u.id !== id));
      logAdminAction('Customer Account Deleted', `Removed customer ${name} (ID: ${id}) permanently`, 'danger');
      alert(`Customer ${name} has been removed.`);
    }
  };

  // Add Member Action
  const handleAddCustomerSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const fullName = formData.get('fullName') as string;
    const email = (formData.get('email') as string).trim().toLowerCase();
    const phone = formData.get('phone') as string;
    const role = formData.get('role') as 'investor' | 'farmer' | 'admin';
    const balanceStr = formData.get('balance') as string;
    const balance = parseFloat(balanceStr) || 0;

    if (!fullName || !email) {
      alert('Full Name and Email are required.');
      return;
    }

    if (usersList.some(u => u.email.toLowerCase() === email)) {
      alert('A member with this email already exists.');
      return;
    }

    const newCust: UserType = {
      id: `user-admin-${Date.now()}`,
      fullName,
      email,
      phone: phone || '+234 803 000 0000',
      role,
      balance,
      investmentsCount: 0,
      avatar: role === 'farmer'
        ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
    };

    setUsersList(prev => [...prev, newCust]);
    logAdminAction('Member Added Manually', `Created ${role} account for ${fullName} (${email}) with balance ₦${balance.toLocaleString()}`, 'success');
    alert(`Member ${fullName} added successfully!`);
    setIsAddingCustomer(false);
  };

  // Edit Member Action
  const handleEditCustomerSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingCustomer) return;

    const formData = new FormData(e.currentTarget);
    const fullName = formData.get('fullName') as string;
    const email = (formData.get('email') as string).trim().toLowerCase();
    const phone = formData.get('phone') as string;
    const role = formData.get('role') as 'investor' | 'farmer' | 'admin';
    const balanceStr = formData.get('balance') as string;
    const balance = parseFloat(balanceStr) || 0;

    if (!fullName || !email) {
      alert('Full Name and Email are required.');
      return;
    }

    if (usersList.some(u => u.email.toLowerCase() === email && u.id !== editingCustomer.id)) {
      alert('Another member with this email already exists.');
      return;
    }

    setUsersList(prev => prev.map(u => {
      if (u.id === editingCustomer.id) {
        return {
          ...u,
          fullName,
          email,
          phone,
          role,
          balance
        };
      }
      return u;
    }));

    logAdminAction('Member Updated', `Modified account details for ${fullName} (${email})`, 'success');
    alert(`Member ${fullName} updated successfully!`);
    setEditingCustomer(null);
  };

  // Generate Custom Invoice
  const handleGenerateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(newInvoiceAmount);
    if (!newInvoiceCustomer || !amt) return;

    const newInv: SimulatedPayment = {
      id: `pay-${Date.now()}`,
      customerName: newInvoiceCustomer,
      customerEmail: `${newInvoiceCustomer.toLowerCase().replace(/\s+/g, '')}@cowplug-user.ng`,
      amount: amt,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      service: newInvoiceService,
      invoiceNumber: `INV-2026-ADM${Math.floor(100 + Math.random() * 900)}`
    };

    setPaymentsList(prev => [newInv, ...prev]);
    setNewInvoiceSuccess(true);
    logAdminAction('Invoice Generated', `Created pending invoice ${newInv.invoiceNumber} of ₦${amt.toLocaleString()} for ${newInvoiceCustomer}`);
    setTimeout(() => {
      setNewInvoiceSuccess(false);
      setNewInvoiceCustomer('');
      setNewInvoiceAmount('');
    }, 2500);
  };

  // Excel / PDF Export Simulation
  const handleSimulateExport = (format: 'PDF' | 'Excel', reportName: string) => {
    alert(`Generating CowPlug Agricultural ${format} Statement for: "${reportName}". Compilation successful! Download will start in the background.`);
    logAdminAction('Report Exported', `Downloaded ${reportName} in ${format} format.`);
  };

  // Increase Feed Stock Bags
  const handleAddFeedBags = (id: string, bags: number) => {
    setFeedStock(prev => prev.map(feed => {
      if (feed.id === id) {
        const updated = feed.currentStock + bags;
        logAdminAction('Feed Stock Replenished', `Added ${bags} bags of ${feed.name}. New total: ${updated} bags`);
        return { ...feed, currentStock: updated };
      }
      return feed;
    }));
    alert('Feed stock levels updated!');
  };

  // Feed Consumption Simulation
  const handleSimulateFeedConsumption = (id: string, bags: number) => {
    setFeedStock(prev => prev.map(feed => {
      if (feed.id === id) {
        const updated = Math.max(0, feed.currentStock - bags);
        logAdminAction('Feed Stock Dispatched', `Logged range consumption of ${bags} bags of ${feed.name}. Remaining: ${updated} bags`, 'warning');
        return { ...feed, currentStock: updated };
      }
      return feed;
    }));
    alert('Range consumption logged!');
  };

  // Edit Dynamic pricing package prices
  const handleUpdatePackagePricing = (id: string, feedPrice: number, mgtFee: number) => {
    setPricingPackages(prev => prev.map(p => {
      if (p.id === id) {
        logAdminAction('Package Rules Updated', `Modified pricing constants for "${p.name}". Feed: ₦${feedPrice.toLocaleString()}, Mgt: ₦${mgtFee.toLocaleString()}`, 'warning');
        return { ...p, feedPrice, managementFee: mgtFee };
      }
      return p;
    }));
    alert(`Success: Standard pricing rules updated for package!`);
  };

  // Chart data compiled dynamically
  const customerGrowthData = [
    { name: 'Jan', Customers: 12, Sellers: 3 },
    { name: 'Feb', Customers: 18, Sellers: 5 },
    { name: 'Mar', Customers: 24, Sellers: 8 },
    { name: 'Apr', Customers: 35, Sellers: 11 },
    { name: 'May', Customers: 52, Sellers: 14 },
    { name: 'Jun', Customers: totalCustomers, Sellers: 18 }
  ];

  const packagePerformanceData = [
    { name: 'Pasture Only', users: 15, value: 450000 },
    { name: 'Supplement Diet', users: 28, value: 1250000 },
    { name: 'Premium Fattening', users: 34, value: 2450000 }
  ];

  const colors = ['#059669', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  // Open manual verification workflow modal
  const handleOpenVerificationWorkflow = (inv: any) => {
    const associatedOrder = orders.find((o: any) => o.invoiceId === inv.invoiceNumber);
    if (associatedOrder) {
      const typeCode = associatedOrder.animalType === 'Cow' ? 'CW' : associatedOrder.animalType === 'Ram' ? 'RM' : 'GT';
      const randNum = Math.floor(100 + Math.random() * 900); // 3 digit unique number
      const proposedTag = `CPG-${typeCode}-${randNum}`;
      
      setAssigningInvoice(inv);
      setAssignedTag(proposedTag);
      setAssignedBreed(associatedOrder.breed || 'White Fulani');
      setAssignedCategory(associatedOrder.animalType || 'Cow');
      setAssignedWeight(associatedOrder.animalType === 'Cow' ? '280' : associatedOrder.animalType === 'Ram' ? '75' : '35');
      setAssignedGender('Male');
      setAssignedAge(associatedOrder.animalType === 'Cow' ? '18' : '12');
      setAssignedFeedingPlan(associatedOrder.packageType || 'Pasture Only');
      setAssignedHealth('Excellent (Green Register)');
      setAssignedVaccines('FMD Vaccine, PPR booster, Broad-spectrum Dewormer');
      setAssignedPhoto(
        associatedOrder.animalType === 'Cow' ? 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&q=80&w=600' :
        associatedOrder.animalType === 'Ram' ? 'https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?auto=format&fit=crop&q=80&w=600' :
        'https://images.unsplash.com/photo-1608539733291-a1dfc76b9789?auto=format&fit=crop&q=80&w=600'
      );
    } else {
      if (confirm(`Approve payment of ₦${inv.amount.toLocaleString()} and fund user's wallet?`)) {
        onUpdateInvoice(inv.id, { 
          status: 'Paid', 
          paymentDate: new Date().toISOString(), 
          internalNotes: 'Wallet credit verified and approved by admin' 
        });
        onUpdateUserBalance(inv.customerEmail, inv.amount);
        onDispatchNotification({
          id: `notif-payment-approve-${Date.now()}`,
          type: 'system',
          title: '💸 Escrow Funding Verified',
          message: `Your payment of ₦${inv.amount.toLocaleString()} has been verified. Wallet credited successfully.`,
          date: new Date().toISOString(),
          read: false
        });
        alert(`Escrow payment approved! Customer's wallet has been credited with ₦${inv.amount.toLocaleString()}`);
        logAdminAction("Escrow Payment Verified", `Approved payment ₦${inv.amount} for ${inv.customerFullName}`, "success");
      }
    }
  };

  const handleSubmitVerificationWorkflow = () => {
    if (!assigningInvoice) return;
    const inv = assigningInvoice;
    const associatedOrder = orders.find((o: any) => o.invoiceId === inv.invoiceNumber);
    if (!associatedOrder) return;

    // 1. Create FarmerLivestock item to link directly to the customer's dashboard
    const newAnimalItem: FarmerLivestock = {
      id: `live-verified-${Date.now()}`,
      tagNumber: assignedTag || `CPG-${Date.now()}`,
      breed: assignedBreed,
      category: assignedCategory as any,
      weightKg: parseFloat(assignedWeight) || 280,
      ageMonths: parseInt(assignedAge) || 18,
      healthStatus: assignedHealth,
      photo: assignedPhoto || (assignedCategory === 'Cow' 
        ? 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&q=80&w=600'
        : 'https://images.unsplash.com/photo-1608539733291-a1dfc76b9789?auto=format&fit=crop&q=80&w=600'),
      vaccinations: assignedVaccines.split(',').map(v => v.trim()),
      lastVetCheck: new Date().toISOString().split('T')[0],
      datePurchased: new Date().toISOString().split('T')[0],
      purchasePrice: inv.amount,
      feedingPlan: assignedFeedingPlan,
      ownersName: inv.customerFullName,
      estimatedValue: inv.amount * 1.12,
      weightHistory: [
        { date: 'Purchase Intake', weightKg: parseFloat(assignedWeight) || 280 }
      ]
    };

    // Add to standard list
    onAddFarmerLivestock(newAnimalItem);

    // 2. Update Invoice to Paid
    onUpdateInvoice(inv.id, {
      status: 'Paid',
      paymentDate: new Date().toISOString(),
      internalNotes: `Payment verified. Assigned CowPlugNG Tag: ${assignedTag}`
    });

    // 3. Update Order to Fulfillment / Paid / Tag Assigned
    if (onUpdateOrder) {
      onUpdateOrder(associatedOrder.id, {
        status: 'Fulfillment',
        fulfillmentStep: 'Preparing Animal',
        tagNumber: assignedTag
      });
    }

    // 4. Log Action
    logAdminAction(
      'Payment & Tag Verified', 
      `Verified payment ₦${inv.amount.toLocaleString()} for ${inv.customerFullName}. Assigned Tag ${assignedTag} (${assignedBreed})`, 
      'success'
    );

    // 5. Dispatch User In-App Notification & Email simulation
    onDispatchNotification({
      id: `notif-tag-assign-${Date.now()}`,
      type: 'system',
      title: '🐄 Livestock Tag Allocated!',
      message: `Your payment for the ${assignedBreed} ${assignedCategory} has been approved. Animal allocated with official Tag ID: ${assignedTag}. View details in My Animals dashboard!`,
      date: new Date().toISOString(),
      read: false
    });

    alert(`Successfully verified payment! Created Animal Profile & allocated Tag ID: ${assignedTag} to customer ${inv.customerFullName}.`);
    setAssigningInvoice(null);
  };

  return (
    <div className="flex h-[calc(100vh-120px)] md:h-[calc(100vh-96px)] w-full overflow-hidden bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 font-sans rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-lg">
      
      {/* MOBILE DRAWER SIDEBAR NAVIGATION */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-fade-in" id="admin-mobile-sidebar-container">
          {/* Backdrop overlay */}
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
          />
          
          {/* Drawer content */}
          <div className="relative flex flex-col w-full max-w-[300px] bg-zinc-900 text-white shadow-xl h-full z-10">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-4 py-5 border-b border-zinc-800 bg-zinc-950">
              <div className="flex items-center">
                <div className="h-9 w-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white mr-3 shadow-md shadow-emerald-500/20">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-display font-black text-lg tracking-tight text-white flex items-center">
                    Cow<span className="text-emerald-400">Plug</span>
                    <span className="text-amber-400 font-black text-xs ml-0.5">ADMIN</span>
                  </span>
                  <p className="text-[9px] text-zinc-400 font-mono uppercase tracking-widest font-extrabold">Range Custody OS</p>
                </div>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors"
                title="Close Sidebar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Active User info */}
            <div className="p-4 mx-4 my-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
              <div className="flex items-center space-x-3">
                <img src={currentUser.avatar} alt="Admin Avatar" className="h-10 w-10 rounded-full border border-emerald-500 object-cover" />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-black text-white truncate">{currentUser.fullName}</h4>
                  <span className="text-[9px] font-mono font-bold uppercase text-emerald-400 tracking-wider">
                    {adminRole}
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t border-zinc-900/60">
                <label className="block text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-1">Simulate Role Scope</label>
                <select
                  value={adminRole}
                  onChange={(e) => {
                    setAdminRole(e.target.value);
                    logAdminAction('Simulated Role Switched', `Active operational scope set to ${e.target.value}`, 'warning');
                  }}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-[10px] font-bold text-zinc-300 focus:outline-none focus:border-emerald-500"
                >
                  {rolesConfig.map(r => (
                    <option key={r.name} value={r.name}>{r.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
              {/* Group 1: CORE TELEMETRY */}
              <div>
                <span className="px-3 text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">
                  Core Telemetry
                </span>
                <div className="space-y-1">
                  <button
                    onClick={() => { setAdminTab('overview'); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center px-3 py-2 rounded-xl font-bold text-xs transition-all ${
                      adminTab === 'overview' ? 'bg-emerald-600 text-white shadow shadow-emerald-600/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                    }`}
                  >
                    <Activity className="h-4 w-4 shrink-0" />
                    <span className="ml-3 truncate">Dashboard</span>
                  </button>
                  <button
                    onClick={() => { setAdminTab('customers'); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center px-3 py-2 rounded-xl font-bold text-xs transition-all ${
                      adminTab === 'customers' ? 'bg-emerald-600 text-white shadow shadow-emerald-600/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                    }`}
                  >
                    <Users className="h-4 w-4 shrink-0" />
                    <span className="ml-3 truncate">Customers</span>
                  </button>
                  <button
                    onClick={() => { setAdminTab('sellers'); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center px-3 py-2 rounded-xl font-bold text-xs transition-all ${
                      adminTab === 'sellers' ? 'bg-emerald-600 text-white shadow shadow-emerald-600/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                    }`}
                  >
                    <Store className="h-4 w-4 shrink-0" />
                    <span className="ml-3 truncate">Sellers</span>
                  </button>
                  <button
                    onClick={() => { setAdminTab('livestock'); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center px-3 py-2 rounded-xl font-bold text-xs transition-all ${
                      adminTab === 'livestock' ? 'bg-emerald-600 text-white shadow shadow-emerald-600/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                    }`}
                  >
                    <HeartPulse className="h-4 w-4 shrink-0" />
                    <span className="ml-3 truncate">Livestock</span>
                  </button>
                </div>
              </div>

              {/* Group 2: HERD & RANCH PATROLS */}
              <div>
                <span className="px-3 text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">
                  Health & Telemetry
                </span>
                <div className="space-y-1">
                  <button
                    onClick={() => { setAdminTab('rfid'); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center px-3 py-2 rounded-xl font-bold text-xs transition-all ${
                      adminTab === 'rfid' ? 'bg-emerald-600 text-white shadow shadow-emerald-600/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                    }`}
                  >
                    <Cpu className="h-4 w-4 shrink-0" />
                    <span className="ml-3 truncate">RFID Management</span>
                  </button>
                  <button
                    onClick={() => { setAdminTab('health'); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center px-3 py-2 rounded-xl font-bold text-xs transition-all ${
                      adminTab === 'health' ? 'bg-emerald-600 text-white shadow shadow-emerald-600/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                    }`}
                  >
                    <HeartPulse className="h-4 w-4 shrink-0" />
                    <span className="ml-3 truncate">Health Records</span>
                  </button>
                  <button
                    onClick={() => { setAdminTab('vaccinations'); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center px-3 py-2 rounded-xl font-bold text-xs transition-all ${
                      adminTab === 'vaccinations' ? 'bg-emerald-600 text-white shadow shadow-emerald-600/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                    }`}
                  >
                    <Syringe className="h-4 w-4 shrink-0" />
                    <span className="ml-3 truncate">Vaccinations</span>
                  </button>
                  <button
                    onClick={() => { setAdminTab('weight'); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center px-3 py-2 rounded-xl font-bold text-xs transition-all ${
                      adminTab === 'weight' ? 'bg-emerald-600 text-white shadow shadow-emerald-600/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                    }`}
                  >
                    <Scale className="h-4 w-4 shrink-0" />
                    <span className="ml-3 truncate">Weight Analytics</span>
                  </button>
                  <button
                    onClick={() => { setAdminTab('media'); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center px-3 py-2 rounded-xl font-bold text-xs transition-all ${
                      adminTab === 'media' ? 'bg-emerald-600 text-white shadow shadow-emerald-600/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                    }`}
                  >
                    <ImageIcon className="h-4 w-4 shrink-0" />
                    <span className="ml-3 truncate">Media Gallery</span>
                  </button>
                </div>
              </div>

              {/* Group 3: MARKETPLACE & WAREHOUSE */}
              <div>
                <span className="px-3 text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">
                  Market & Diet
                </span>
                <div className="space-y-1">
                  <button
                    onClick={() => { setAdminTab('marketplace'); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center px-3 py-2 rounded-xl font-bold text-xs transition-all ${
                      adminTab === 'marketplace' ? 'bg-emerald-600 text-white shadow shadow-emerald-600/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                    }`}
                  >
                    <ShoppingBag className="h-4 w-4 shrink-0" />
                    <span className="ml-3 truncate">Marketplace</span>
                  </button>
                  <button
                    onClick={() => { setAdminTab('meat-orders'); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center px-3 py-2 rounded-xl font-bold text-xs transition-all ${
                      adminTab === 'meat-orders' ? 'bg-emerald-600 text-white shadow shadow-emerald-600/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                    }`}
                  >
                    <Truck className="h-4 w-4 shrink-0" />
                    <span className="ml-3 truncate">Meat Supply</span>
                  </button>
                  <button
                    onClick={() => { setAdminTab('packages'); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center px-3 py-2 rounded-xl font-bold text-xs transition-all ${
                      adminTab === 'packages' ? 'bg-emerald-600 text-white shadow shadow-emerald-600/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                    }`}
                  >
                    <Settings className="h-4 w-4 shrink-0" />
                    <span className="ml-3 truncate">Packages Config</span>
                  </button>
                  <button
                    onClick={() => { setAdminTab('feed'); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center px-3 py-2 rounded-xl font-bold text-xs transition-all ${
                      adminTab === 'feed' ? 'bg-emerald-600 text-white shadow shadow-emerald-600/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                    }`}
                  >
                    <Wheat className="h-4 w-4 shrink-0" />
                    <span className="ml-3 truncate">Feed Inventory</span>
                  </button>
                </div>
              </div>

              {/* Group 4: REVENUE & CHANNELS */}
              <div>
                <span className="px-3 text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">
                  Billing & Support
                </span>
                <div className="space-y-1">
                  <button
                    onClick={() => { setAdminTab('payments'); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center px-3 py-2 rounded-xl font-bold text-xs transition-all ${
                      adminTab === 'payments' ? 'bg-emerald-600 text-white shadow shadow-emerald-600/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                    }`}
                  >
                    <Wallet className="h-4 w-4 shrink-0" />
                    <span className="ml-3 truncate">Payments Ledger</span>
                  </button>
                  <button
                    onClick={() => { setAdminTab('invoices'); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center px-3 py-2 rounded-xl font-bold text-xs transition-all ${
                      adminTab === 'invoices' ? 'bg-emerald-600 text-white shadow shadow-emerald-600/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                    }`}
                  >
                    <Receipt className="h-4 w-4 shrink-0" />
                    <span className="ml-3 truncate">Invoice Tracker</span>
                  </button>
                  <button
                    onClick={() => { setAdminTab('notifications'); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center px-3 py-2 rounded-xl font-bold text-xs transition-all ${
                      adminTab === 'notifications' ? 'bg-emerald-600 text-white shadow shadow-emerald-600/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                    }`}
                  >
                    <Bell className="h-4 w-4 shrink-0" />
                    <span className="ml-3 truncate">Notifications</span>
                  </button>
                  <button
                    onClick={() => { setAdminTab('support'); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center px-3 py-2 rounded-xl font-bold text-xs transition-all ${
                      adminTab === 'support' ? 'bg-emerald-600 text-white shadow shadow-emerald-600/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                    }`}
                  >
                    <LifeBuoy className="h-4 w-4 shrink-0" />
                    <span className="ml-3 truncate">Customer Support</span>
                  </button>
                </div>
              </div>

              {/* Group 5: CONTROLS & SECURITY */}
              <div>
                <span className="px-3 text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">
                  Controls & Logs
                </span>
                <div className="space-y-1">
                  <button
                    onClick={() => { setAdminTab('reports'); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center px-3 py-2 rounded-xl font-bold text-xs transition-all ${
                      adminTab === 'reports' ? 'bg-emerald-600 text-white shadow shadow-emerald-600/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                    }`}
                  >
                    <BarChart3 className="h-4 w-4 shrink-0" />
                    <span className="ml-3 truncate">Reports & Analytics</span>
                  </button>
                  <button
                    onClick={() => { setAdminTab('staff'); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center px-3 py-2 rounded-xl font-bold text-xs transition-all ${
                      adminTab === 'staff' ? 'bg-emerald-600 text-white shadow shadow-emerald-600/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                    }`}
                  >
                    <UserCheck className="h-4 w-4 shrink-0" />
                    <span className="ml-3 truncate">Staff Management</span>
                  </button>
                  <button
                    onClick={() => { setAdminTab('cms'); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center px-3 py-2 rounded-xl font-bold text-xs transition-all ${
                      adminTab === 'cms' ? 'bg-emerald-600 text-white shadow shadow-emerald-600/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                    }`}
                  >
                    <Globe className="h-4 w-4 shrink-0" />
                    <span className="ml-3 truncate">Website CMS</span>
                  </button>
                  <button
                    onClick={() => { setAdminTab('settings'); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center px-3 py-2 rounded-xl font-bold text-xs transition-all ${
                      adminTab === 'settings' ? 'bg-emerald-600 text-white shadow shadow-emerald-600/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                    }`}
                  >
                    <Sliders className="h-4 w-4 shrink-0" />
                    <span className="ml-3 truncate">Platform Settings</span>
                  </button>
                  <button
                    onClick={() => { setAdminTab('audit'); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center px-3 py-2 rounded-xl font-bold text-xs transition-all ${
                      adminTab === 'audit' ? 'bg-emerald-600 text-white shadow shadow-emerald-600/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                    }`}
                  >
                    <ShieldCheck className="h-4 w-4 shrink-0" />
                    <span className="ml-3 truncate">Audit Logs</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Close footer */}
            <div className="p-4 border-t border-zinc-800 space-y-2 mt-auto">
              <button
                onClick={() => {
                  setActiveSection('home-public');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center px-4 py-2 rounded-xl text-xs font-bold text-emerald-400 hover:bg-emerald-950/20 transition-all"
              >
                <Eye className="h-4 w-4 mr-3" /> View Public Website
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 1. SECURE ADMIN SIDEBAR NAVIGATION */}
      <div className="hidden md:flex md:flex-shrink-0 transition-all duration-300">
        <div className={`flex flex-col ${sidebarCollapsed ? 'w-20' : 'w-64'} transition-all duration-300 bg-zinc-900 border-r border-zinc-850 text-white overflow-hidden`}>
          
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-5 border-b border-zinc-800 bg-zinc-950">
            <div className="flex items-center overflow-hidden">
              <div className="h-9 w-9 shrink-0 rounded-xl bg-emerald-600 flex items-center justify-center text-white mr-3 shadow-md shadow-emerald-500/20">
                <Shield className="h-5 w-5" />
              </div>
              {!sidebarCollapsed && (
                <div className="truncate">
                  <span className="font-display font-black text-lg tracking-tight text-white flex items-center">
                    Cow<span className="text-emerald-400">Plug</span>
                    <span className="text-amber-400 font-black text-xs ml-0.5">ADMIN</span>
                  </span>
                  <p className="text-[9px] text-zinc-400 font-mono uppercase tracking-widest font-extrabold">Range Custody OS</p>
                </div>
              )}
            </div>
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors"
              title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <ChevronRight className={`h-4 w-4 transform transition-transform duration-300 ${sidebarCollapsed ? '' : 'rotate-180'}`} />
            </button>
          </div>

          {/* Connected Administrator Information Card */}
          {!sidebarCollapsed && (
            <div className="p-4 mx-4 my-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
              <div className="flex items-center space-x-3">
                <img src={currentUser.avatar} alt="Admin Avatar" className="h-10 w-10 rounded-full border border-emerald-500 object-cover" />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-black text-white truncate">{currentUser.fullName}</h4>
                  <span className="text-[9px] font-mono font-bold uppercase text-emerald-400 tracking-wider">
                    {adminRole}
                  </span>
                </div>
              </div>

              {/* Quick Role switcher */}
              <div className="pt-2 border-t border-zinc-800 space-y-1">
                <label className="block text-[8px] font-mono text-zinc-500 uppercase font-black">
                  Simulate System Role
                </label>
                <select
                  value={adminRole}
                  onChange={(e) => {
                    setAdminRole(e.target.value);
                    logAdminAction('Simulated Role Switched', `Active operational scope set to ${e.target.value}`, 'warning');
                  }}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-[10px] font-bold text-zinc-300 focus:outline-none focus:border-emerald-500"
                >
                  {rolesConfig.map(r => (
                    <option key={r.name} value={r.name}>{r.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Navigation Links - Categorized for Enterprise Experience */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 text-xs">
            
            {/* Group 1: CORE OPERATIONS */}
            <div>
              {!sidebarCollapsed && (
                <span className="px-3 text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">
                  Core Operations
                </span>
              )}
              <div className="space-y-1">
                <button
                  onClick={() => setAdminTab('overview')}
                  className={`w-full flex items-center px-3 py-2 rounded-xl font-bold transition-all ${
                    adminTab === 'overview' ? 'bg-emerald-600 text-white shadow shadow-emerald-600/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                  }`}
                  title="Dashboard Overview"
                >
                  <Activity className="h-4 w-4 shrink-0" />
                  {!sidebarCollapsed && <span className="ml-3 truncate">Dashboard</span>}
                </button>
                <button
                  onClick={() => setAdminTab('customers')}
                  className={`w-full flex items-center px-3 py-2 rounded-xl font-bold transition-all ${
                    adminTab === 'customers' ? 'bg-emerald-600 text-white shadow shadow-emerald-600/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                  }`}
                  title="Customers Directory"
                >
                  <Users className="h-4 w-4 shrink-0" />
                  {!sidebarCollapsed && <span className="ml-3 truncate">Customers</span>}
                </button>
                <button
                  onClick={() => setAdminTab('sellers')}
                  className={`w-full flex items-center px-3 py-2 rounded-xl font-bold transition-all ${
                    adminTab === 'sellers' ? 'bg-emerald-600 text-white shadow shadow-emerald-600/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                  }`}
                  title="Sellers Verification"
                >
                  <Store className="h-4 w-4 shrink-0" />
                  {!sidebarCollapsed && <span className="ml-3 truncate">Sellers</span>}
                </button>
                <button
                  onClick={() => setAdminTab('livestock')}
                  className={`w-full flex items-center px-3 py-2 rounded-xl font-bold transition-all ${
                    adminTab === 'livestock' ? 'bg-emerald-600 text-white shadow shadow-emerald-600/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                  }`}
                  title="Livestock & RFID Tag Registry"
                >
                  <HeartPulse className="h-4 w-4 shrink-0" />
                  {!sidebarCollapsed && <span className="ml-3 truncate">Livestock</span>}
                </button>
              </div>
            </div>

            {/* Group 2: HEALTH & BIOMETRICS */}
            <div>
              {!sidebarCollapsed && (
                <span className="px-3 text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">
                  Health & Telemetry
                </span>
              )}
              <div className="space-y-1">
                <button
                  onClick={() => setAdminTab('rfid')}
                  className={`w-full flex items-center px-3 py-2 rounded-xl font-bold transition-all ${
                    adminTab === 'rfid' ? 'bg-emerald-600 text-white shadow shadow-emerald-600/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                  }`}
                  title="RFID Sensors"
                >
                  <Cpu className="h-4 w-4 shrink-0" />
                  {!sidebarCollapsed && <span className="ml-3 truncate">RFID Management</span>}
                </button>
                <button
                  onClick={() => setAdminTab('health')}
                  className={`w-full flex items-center px-3 py-2 rounded-xl font-bold transition-all ${
                    adminTab === 'health' ? 'bg-emerald-600 text-white shadow shadow-emerald-600/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                  }`}
                  title="Health Records"
                >
                  <HeartPulse className="h-4 w-4 shrink-0" />
                  {!sidebarCollapsed && <span className="ml-3 truncate">Health Records</span>}
                </button>
                <button
                  onClick={() => setAdminTab('vaccinations')}
                  className={`w-full flex items-center px-3 py-2 rounded-xl font-bold transition-all ${
                    adminTab === 'vaccinations' ? 'bg-emerald-600 text-white shadow shadow-emerald-600/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                  }`}
                  title="Vaccination Schedule"
                >
                  <Syringe className="h-4 w-4 shrink-0" />
                  {!sidebarCollapsed && <span className="ml-3 truncate">Vaccinations</span>}
                </button>
                <button
                  onClick={() => setAdminTab('weight')}
                  className={`w-full flex items-center px-3 py-2 rounded-xl font-bold transition-all ${
                    adminTab === 'weight' ? 'bg-emerald-600 text-white shadow shadow-emerald-600/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                  }`}
                  title="Weight Monitoring"
                >
                  <Scale className="h-4 w-4 shrink-0" />
                  {!sidebarCollapsed && <span className="ml-3 truncate">Weight Analytics</span>}
                </button>
                <button
                  onClick={() => setAdminTab('media')}
                  className={`w-full flex items-center px-3 py-2 rounded-xl font-bold transition-all ${
                    adminTab === 'media' ? 'bg-emerald-600 text-white shadow shadow-emerald-600/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                  }`}
                  title="Media Feed & Gallery"
                >
                  <ImageIcon className="h-4 w-4 shrink-0" />
                  {!sidebarCollapsed && <span className="ml-3 truncate">Media Gallery</span>}
                </button>
              </div>
            </div>

            {/* Group 3: MARKETPLACE & WAREHOUSE */}
            <div>
              {!sidebarCollapsed && (
                <span className="px-3 text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">
                  Market & Diet
                </span>
              )}
              <div className="space-y-1">
                <button
                  onClick={() => setAdminTab('marketplace')}
                  className={`w-full flex items-center px-3 py-2 rounded-xl font-bold transition-all ${
                    adminTab === 'marketplace' ? 'bg-emerald-600 text-white shadow shadow-emerald-600/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                  }`}
                  title="Marketplace Listings"
                >
                  <ShoppingBag className="h-4 w-4 shrink-0" />
                  {!sidebarCollapsed && <span className="ml-3 truncate">Marketplace</span>}
                </button>
                <button
                  onClick={() => setAdminTab('meat-orders')}
                  className={`w-full flex items-center px-3 py-2 rounded-xl font-bold transition-all ${
                    adminTab === 'meat-orders' ? 'bg-emerald-600 text-white shadow shadow-emerald-600/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                  }`}
                  title="Meat Supply Orders"
                >
                  <Truck className="h-4 w-4 shrink-0" />
                  {!sidebarCollapsed && <span className="ml-3 truncate">Meat Supply</span>}
                </button>
                <button
                  onClick={() => setAdminTab('packages')}
                  className={`w-full flex items-center px-3 py-2 rounded-xl font-bold transition-all ${
                    adminTab === 'packages' ? 'bg-emerald-600 text-white shadow shadow-emerald-600/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                  }`}
                  title="Diet pricing packages"
                >
                  <Settings className="h-4 w-4 shrink-0" />
                  {!sidebarCollapsed && <span className="ml-3 truncate">Packages Config</span>}
                </button>
                <button
                  onClick={() => setAdminTab('feed')}
                  className={`w-full flex items-center px-3 py-2 rounded-xl font-bold transition-all ${
                    adminTab === 'feed' ? 'bg-emerald-600 text-white shadow shadow-emerald-600/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                  }`}
                  title="Feed Inventory"
                >
                  <Wheat className="h-4 w-4 shrink-0" />
                  {!sidebarCollapsed && <span className="ml-3 truncate">Feed Inventory</span>}
                </button>
              </div>
            </div>

            {/* Group 4: REVENUE & CHANNELS */}
            <div>
              {!sidebarCollapsed && (
                <span className="px-3 text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">
                  Billing & Support
                </span>
              )}
              <div className="space-y-1">
                <button
                  onClick={() => setAdminTab('payments')}
                  className={`w-full flex items-center px-3 py-2 rounded-xl font-bold transition-all ${
                    adminTab === 'payments' ? 'bg-emerald-600 text-white shadow shadow-emerald-600/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                  }`}
                  title="Payments & Wallets"
                >
                  <Wallet className="h-4 w-4 shrink-0" />
                  {!sidebarCollapsed && <span className="ml-3 truncate">Payments Ledger</span>}
                </button>
                <button
                  onClick={() => setAdminTab('invoices')}
                  className={`w-full flex items-center px-3 py-2 rounded-xl font-bold transition-all ${
                    adminTab === 'invoices' ? 'bg-emerald-600 text-white shadow shadow-emerald-600/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                  }`}
                  title="Invoice Manager"
                >
                  <Receipt className="h-4 w-4 shrink-0" />
                  {!sidebarCollapsed && <span className="ml-3 truncate">Invoice Tracker</span>}
                </button>
                <button
                  onClick={() => setAdminTab('notifications')}
                  className={`w-full flex items-center px-3 py-2 rounded-xl font-bold transition-all ${
                    adminTab === 'notifications' ? 'bg-emerald-600 text-white shadow shadow-emerald-600/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                  }`}
                  title="Send Broadcast"
                >
                  <Bell className="h-4 w-4 shrink-0" />
                  {!sidebarCollapsed && <span className="ml-3 truncate">Notifications</span>}
                </button>
                <button
                  onClick={() => setAdminTab('support')}
                  className={`w-full flex items-center px-3 py-2 rounded-xl font-bold transition-all ${
                    adminTab === 'support' ? 'bg-emerald-600 text-white shadow shadow-emerald-600/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                  }`}
                  title="Support Tickets"
                >
                  <LifeBuoy className="h-4 w-4 shrink-0" />
                  {!sidebarCollapsed && <span className="ml-3 truncate">Customer Support</span>}
                </button>
              </div>
            </div>

            {/* Group 5: CONTROLS & SECURITY */}
            <div>
              {!sidebarCollapsed && (
                <span className="px-3 text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">
                  Controls & Logs
                </span>
              )}
              <div className="space-y-1">
                <button
                  onClick={() => setAdminTab('reports')}
                  className={`w-full flex items-center px-3 py-2 rounded-xl font-bold transition-all ${
                    adminTab === 'reports' ? 'bg-emerald-600 text-white shadow shadow-emerald-600/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                  }`}
                  title="Analytics & Export Reports"
                >
                  <BarChart3 className="h-4 w-4 shrink-0" />
                  {!sidebarCollapsed && <span className="ml-3 truncate">Reports & Analytics</span>}
                </button>
                <button
                  onClick={() => setAdminTab('staff')}
                  className={`w-full flex items-center px-3 py-2 rounded-xl font-bold transition-all ${
                    adminTab === 'staff' ? 'bg-emerald-600 text-white shadow shadow-emerald-600/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                  }`}
                  title="Staff Management"
                >
                  <UserCheck className="h-4 w-4 shrink-0" />
                  {!sidebarCollapsed && <span className="ml-3 truncate">Staff Management</span>}
                </button>
                <button
                  onClick={() => setAdminTab('cms')}
                  className={`w-full flex items-center px-3 py-2 rounded-xl font-bold transition-all ${
                    adminTab === 'cms' ? 'bg-emerald-600 text-white shadow shadow-emerald-600/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                  }`}
                  title="Website CMS Content Editor"
                >
                  <Globe className="h-4 w-4 shrink-0" />
                  {!sidebarCollapsed && <span className="ml-3 truncate">Website CMS</span>}
                </button>
                <button
                  onClick={() => setAdminTab('settings')}
                  className={`w-full flex items-center px-3 py-2 rounded-xl font-bold transition-all ${
                    adminTab === 'settings' ? 'bg-emerald-600 text-white shadow shadow-emerald-600/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                  }`}
                  title="System Security Settings"
                >
                  <Sliders className="h-4 w-4 shrink-0" />
                  {!sidebarCollapsed && <span className="ml-3 truncate">Platform Settings</span>}
                </button>
                <button
                  onClick={() => setAdminTab('packages')}
                  className={`w-full flex items-center px-3 py-2 rounded-xl font-bold transition-all ${
                    adminTab === 'packages' ? 'bg-emerald-600 text-white shadow shadow-emerald-600/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                  }`}
                  title="Manage Subscription & Feeding Packages"
                >
                  <Tag className="h-4 w-4 shrink-0" />
                  {!sidebarCollapsed && <span className="ml-3 truncate">Packages Manager</span>}
                </button>
                <button
                  onClick={() => setAdminTab('audit')}
                  className={`w-full flex items-center px-3 py-2 rounded-xl font-bold transition-all ${
                    adminTab === 'audit' ? 'bg-emerald-600 text-white shadow shadow-emerald-600/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                  }`}
                  title="Immutable Security Logs"
                >
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  {!sidebarCollapsed && <span className="ml-3 truncate">Audit Logs</span>}
                </button>
              </div>
            </div>

          </div>

          {/* Secure Settings and Signout */}
          <div className="p-4 border-t border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-[10px] text-zinc-500 px-2 font-mono">
              <span>Secure 2FA Mode</span>
              <button 
                onClick={() => {
                  setIs2FAEnabled(!is2FAEnabled);
                  logAdminAction('Security Settings Modified', `Biometric 2FA set to ${!is2FAEnabled}`, 'warning');
                }}
                className={`w-7 h-4 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${is2FAEnabled ? 'bg-emerald-500' : 'bg-zinc-700'}`}
              >
                <div className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform duration-200 ${is2FAEnabled ? 'translate-x-3' : 'translate-x-0'}`} />
              </button>
            </div>
            
            <button
              onClick={() => {
                setActiveSection('home-public');
              }}
              className="w-full flex items-center px-4 py-2 rounded-xl text-xs font-bold text-emerald-400 hover:bg-emerald-950/20 transition-all"
            >
              <Eye className="h-4 w-4 mr-3" /> View Public Website
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN WORKING CANVAS AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Upper Dashboard Header Bar */}
        <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 h-16 flex items-center justify-between px-6 z-10 shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white rounded-xl md:hidden flex items-center justify-center border border-zinc-200 dark:border-zinc-800"
              id="admin-mobile-menu-toggle"
              title="Open Administration Navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-[10px] bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 px-2.5 py-1 rounded-full font-extrabold uppercase tracking-widest flex items-center gap-1">
              <ShieldAlert className="h-3 w-3" /> INTERNAL ADMINISTRATION ENVIRONMENT
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <span className="text-xs font-black block text-zinc-900 dark:text-white">Central Oyo Pasture Node</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">● System Status: Synchronized</span>
            </div>
            
            <button 
              onClick={() => alert(`Synchronizing ledger updates for ${farmerLivestock.length} animals & ${usersList.length} user nodes...`)}
              className="p-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-850 rounded-xl"
              title="Force Database Sync"
            >
              <RefreshCw className="h-4 w-4 text-zinc-500" />
            </button>
          </div>
        </header>

        {/* Dynamic content scroll frame */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Active Banner for Roles with constraints */}
          {adminRole !== 'Super Admin' && (
            <div className="bg-amber-50 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-4 flex gap-3 text-xs text-amber-800 dark:text-amber-400 animate-fade-in">
              <ShieldAlert className="h-5 w-5 shrink-0 text-amber-500" />
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <strong className="font-bold">Active Simulated Role: {adminRole} Mode</strong>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase">Granted:</span>
                    {Object.entries(rolesConfig.find(r => r.name === adminRole)?.permissions || {}).map(([key, value]) => (
                      <span key={key} className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-black uppercase ${
                        value 
                          ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30' 
                          : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800/40 dark:text-zinc-600 border border-transparent'
                      }`}>
                        {key.replace('manage', '').replace('edit', '').replace('view', '')}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="mt-1 leading-relaxed text-[11px] text-zinc-600 dark:text-zinc-400">
                  As a {adminRole}, your operational scope is governed by active cryptographic key signatures. Subsystem operations will prompt or disable depending on your assigned permission sets.
                </p>
              </div>
            </div>
          )}

          {/* ==================================== */}
          {/* TAB 1: OVERVIEW METRICS DASHBOARD */}
          {/* ==================================== */}
          {adminTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Stat Cards Grid - Featuring all 11 required system summary cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                
                {/* Card 1: Total Customers */}
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                  <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Total Customers</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-black text-zinc-950 dark:text-white font-display">{totalCustomers}</span>
                    <span className="text-[9px] text-emerald-600 font-mono font-bold">Verified</span>
                  </div>
                  <Users className="absolute top-3 right-3 h-4 w-4 text-zinc-300 dark:text-zinc-700 transition-opacity group-hover:opacity-0 md:group-hover:opacity-0" />
                  <button 
                    onClick={() => {
                      if (setAdminTab) {
                        setAdminTab('customers');
                        setCustomerStatusFilter('all');
                      }
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 cursor-pointer z-10"
                    title="View Customers Registry"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>

                {/* Card 2: Total Livestock */}
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                  <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Total Livestock</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-black text-zinc-950 dark:text-white font-display">{totalLivestock}</span>
                    <span className="text-[9px] text-zinc-500 font-mono">Head</span>
                  </div>
                  <Activity className="absolute top-3 right-3 h-4 w-4 text-emerald-500/40 transition-opacity group-hover:opacity-0 md:group-hover:opacity-0" />
                  <button 
                    onClick={() => {
                      if (setAdminTab) {
                        setAdminTab('livestock');
                        setLivestockTypeFilter('all');
                      }
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 cursor-pointer z-10"
                    title="View Livestock Registry"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>

                {/* Card 3: Total Cows */}
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                  <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Total Cows 🐄</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-black text-zinc-950 dark:text-white font-display">{totalCows}</span>
                    <span className="text-[9px] text-zinc-500 font-mono">Registered</span>
                  </div>
                  <HeartPulse className="absolute top-3 right-3 h-4 w-4 text-amber-500/40 transition-opacity group-hover:opacity-0 md:group-hover:opacity-0" />
                  <button 
                    onClick={() => {
                      if (setAdminTab) {
                        setAdminTab('livestock');
                        setLivestockTypeFilter('Cow');
                      }
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 cursor-pointer z-10"
                    title="View Cow Species"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>

                {/* Card 4: Total Goats */}
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                  <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Total Goats 🐐</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-black text-zinc-950 dark:text-white font-display">{totalGoats}</span>
                    <span className="text-[9px] text-zinc-500 font-mono">Registered</span>
                  </div>
                  <HeartPulse className="absolute top-3 right-3 h-4 w-4 text-blue-500/40 transition-opacity group-hover:opacity-0 md:group-hover:opacity-0" />
                  <button 
                    onClick={() => {
                      if (setAdminTab) {
                        setAdminTab('livestock');
                        setLivestockTypeFilter('Goat');
                      }
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 cursor-pointer z-10"
                    title="View Goat Species"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>

                {/* Card 5: Total Rams */}
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                  <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Total Rams 🐏</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-black text-zinc-950 dark:text-white font-display">{totalRams}</span>
                    <span className="text-[9px] text-zinc-500 font-mono">Registered</span>
                  </div>
                  <HeartPulse className="absolute top-3 right-3 h-4 w-4 text-purple-500/40 transition-opacity group-hover:opacity-0 md:group-hover:opacity-0" />
                  <button 
                    onClick={() => {
                      if (setAdminTab) {
                        setAdminTab('livestock');
                        setLivestockTypeFilter('Ram');
                      }
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 cursor-pointer z-10"
                    title="View Ram Species"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>

                {/* Card 6: Active Packages */}
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                  <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Active Packages</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">3 Types</span>
                    <span className="text-[8px] text-zinc-400">({totalLivestock} Active)</span>
                  </div>
                  <Settings className="absolute top-3 right-3 h-4 w-4 text-zinc-300 dark:text-zinc-700 transition-opacity group-hover:opacity-0 md:group-hover:opacity-0" />
                  <button 
                    onClick={() => {
                      if (setAdminTab) {
                        setAdminTab('packages');
                      }
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 cursor-pointer z-10"
                    title="View Packages"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>

                {/* Card 7: Monthly Revenue */}
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                  <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Monthly Revenue</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-md font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">₦{(totalLivestock * 35000 + 45000).toLocaleString()}</span>
                  </div>
                  <TrendingUp className="absolute top-3 right-3 h-4 w-4 text-emerald-500 transition-opacity group-hover:opacity-0 md:group-hover:opacity-0" />
                  <button 
                    onClick={() => {
                      if (setAdminTab) {
                        setAdminTab('reports');
                      }
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 cursor-pointer z-10"
                    title="View Revenue Report"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>

                {/* Card 8: Pending Payments */}
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                  <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Pending Payments</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-md font-extrabold text-amber-500 font-mono">₦{pendingPaymentsSum.toLocaleString()}</span>
                  </div>
                  <Wallet className="absolute top-3 right-3 h-4 w-4 text-amber-500/40 transition-opacity group-hover:opacity-0 md:group-hover:opacity-0" />
                  <button 
                    onClick={() => {
                      if (setAdminTab) {
                        setAdminTab('invoices');
                      }
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 cursor-pointer z-10"
                    title="Open Invoices Tracker (Verify Payments)"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>

                {/* Card 9: New Registrations */}
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                  <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">New Registrations</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-black text-zinc-950 dark:text-white font-display">4</span>
                    <span className="text-[9px] text-emerald-600 font-mono font-bold">This Month</span>
                  </div>
                  <UserPlus className="absolute top-3 right-3 h-4 w-4 text-emerald-500/40 transition-opacity group-hover:opacity-0 md:group-hover:opacity-0" />
                  <button 
                    onClick={() => {
                      if (setAdminTab) {
                        setAdminTab('customers');
                        setCustomerStatusFilter('unverified');
                      }
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 cursor-pointer z-10"
                    title="View New Registrations & Verification Status"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>

                {/* Card 10: Livestock Ready for Sale */}
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                  <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Ready for Sale</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-black text-zinc-950 dark:text-white font-display">{readyForSaleCount}</span>
                    <span className="text-[9px] text-emerald-600 font-mono font-bold">Market ready</span>
                  </div>
                  <CheckCircle2 className="absolute top-3 right-3 h-4 w-4 text-emerald-500/40 transition-opacity group-hover:opacity-0 md:group-hover:opacity-0" />
                  <button 
                    onClick={() => {
                      if (setAdminTab) {
                        setAdminTab('marketplace');
                      }
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 cursor-pointer z-10"
                    title="View Marketplace Listings"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>

                {/* Card 11: Health Alerts */}
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                  <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Health Alerts</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className={`text-xl font-black font-display ${healthAlertsCount > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {healthAlertsCount}
                    </span>
                    <span className="text-[9px] text-zinc-500 font-mono">{healthAlertsCount > 0 ? 'Observation' : 'Healthy'}</span>
                  </div>
                  <AlertCircle className="absolute top-3 right-3 h-4 w-4 text-rose-500/40 transition-opacity group-hover:opacity-0 md:group-hover:opacity-0" />
                  <button 
                    onClick={() => {
                      if (setAdminTab) {
                        setAdminTab('health');
                      }
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 cursor-pointer z-10"
                    title="View Health Monitoring & Reminders"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>

                {/* Card 12: Feed Stock Levels */}
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                  <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Feed Stock Levels</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-black text-zinc-950 dark:text-white font-display">1,240 kg</span>
                    <span className="text-[9px] text-emerald-600 font-mono font-bold">85% Capacity</span>
                  </div>
                  <Wheat className="absolute top-3 right-3 h-4 w-4 text-zinc-300 dark:text-zinc-700 transition-opacity group-hover:opacity-0 md:group-hover:opacity-0" />
                  <button 
                    onClick={() => {
                      if (setAdminTab) {
                        setAdminTab('feed');
                      }
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 cursor-pointer z-10"
                    title="View Feed Stock Inventory"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>

              </div>

              {/* Alert Notifications & Live Feed */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Herdsman System Notifications Feed */}
                <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm">
                  <div className="flex justify-between items-center">
                    <h3 className="font-display font-extrabold text-md text-zinc-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="h-4.5 w-4.5 text-emerald-500" /> Live Range Activity Alerts
                    </h3>
                    <span className="text-[9px] bg-zinc-100 dark:bg-zinc-950 px-2 py-1 rounded font-mono font-bold uppercase">
                      Real-time Feed
                    </span>
                  </div>

                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
                    {adminAlerts.map(alert => (
                      <div key={alert.id} className="py-3 flex gap-3 items-start justify-between">
                        <div className="flex gap-2.5">
                          <span className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${
                            alert.type === 'danger' ? 'bg-red-500' : 
                            alert.type === 'warning' ? 'bg-amber-500' :
                            alert.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
                          }`} />
                          <div>
                            <strong className="font-bold text-zinc-900 dark:text-white block">{alert.title}</strong>
                            <p className="text-zinc-500 dark:text-zinc-400 text-[11px] mt-0.5">{alert.desc}</p>
                          </div>
                        </div>
                        <span className="text-[10px] text-zinc-400 font-mono whitespace-nowrap">{alert.date}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sourcing Escrow quick panel */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm">
                  <h3 className="font-display font-extrabold text-md text-zinc-900 dark:text-white">
                    Range Custody Summary
                  </h3>
                  
                  <div className="space-y-3.5 text-xs text-zinc-600 dark:text-zinc-400">
                    <div className="flex justify-between p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-900 rounded-xl">
                      <span>Pending Settlements:</span>
                      <strong className="font-mono text-zinc-900 dark:text-white font-bold">₦{pendingPaymentsSum.toLocaleString()}</strong>
                    </div>
                    
                    <div className="flex justify-between p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-900 rounded-xl">
                      <span>Active Packages Enrolled:</span>
                      <strong className="text-zinc-900 dark:text-white font-bold">{totalLivestock} animals</strong>
                    </div>

                    <div className="flex justify-between p-2.5 bg-emerald-500/5 dark:bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-emerald-800 dark:text-emerald-400">
                      <span>Estimated Feed Usage:</span>
                      <strong className="font-mono font-black">135 bags / month</strong>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setAdminTab('reports');
                      alert('Analytics loaded below. Generate visual custody logs!');
                    }}
                    className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-850 dark:bg-white dark:bg-opacity-10 dark:text-white text-white rounded-xl text-xs font-bold text-center"
                  >
                    View System Reports
                  </button>
                </div>

                {/* System Notifications Widget */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm">
                  <h3 className="font-display font-extrabold text-md text-zinc-900 dark:text-white flex items-center gap-2">
                    <Bell className="h-4 w-4 text-amber-500" /> Broadcast Announcement
                  </h3>
                  
                  <textarea
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                    placeholder="Enter announcement message..."
                    className="w-full p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs"
                    rows={3}
                  />

                  <select
                    value={targetSegment}
                    onChange={(e) => setTargetSegment(e.target.value)}
                    className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs"
                  >
                    <option value="all">All Users</option>
                    <option value="farmers">Farmers</option>
                    <option value="dealers">Dealers</option>
                    <option value="customers">Customers</option>
                  </select>

                  <button 
                    onClick={() => {
                      if (!announcementText.trim()) return alert('Please enter a message');
                      onDispatchNotification({
                        id: Date.now().toString(),
                        type: 'system',
                        title: 'System Announcement',
                        message: announcementText,
                        date: new Date().toLocaleDateString(),
                        read: false
                      });
                      setAnnouncementText('');
                      alert(`Announcement broadcasted to ${targetSegment}!`);
                    }}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold text-center"
                  >
                    Broadcast Announcement
                  </button>
                </div>

              </div>

              {/* Dynamic Analytics charts panel */}
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <h3 className="font-display font-extrabold text-md text-zinc-900 dark:text-white">
                    Cooperative Growth Logs (Bi-Annual Matrix)
                  </h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleSimulateExport('PDF', 'Overview Growth Report')}
                      className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 text-[11px] font-bold rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-850 flex items-center gap-1"
                    >
                      <Download className="h-3.5 w-3.5" /> PDF
                    </button>
                    <button 
                      onClick={() => handleSimulateExport('Excel', 'Overview Growth Excel Data')}
                      className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 text-[11px] font-bold rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-850 flex items-center gap-1"
                    >
                      <FileSpreadsheet className="h-3.5 w-3.5" /> Excel
                    </button>
                  </div>
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={customerGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                      <XAxis dataKey="name" stroke="#a1a1aa" fontSize={11} />
                      <YAxis stroke="#a1a1aa" fontSize={11} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="Customers" stroke="#059669" strokeWidth={3} activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="Sellers" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          )}

          {/* ==================================== */}
          {/* TAB 2: CUSTOMERS DIRECTORY */}
          {/* ==================================== */}
          {adminTab === 'customers' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-150 dark:border-zinc-800 pb-4">
                <div>
                  <h3 className="font-display font-extrabold text-lg text-zinc-900 dark:text-white">Members & Customers Directory</h3>
                  <p className="text-xs text-zinc-400 mt-1">Manage, update details, and audit digital ledger wallets for all registered CowPlug accounts.</p>
                </div>
                <button 
                  onClick={() => setIsAddingCustomer(true)}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all whitespace-nowrap"
                >
                  <Plus className="h-4 w-4 stroke-[2.5]" />
                  Add New Member
                </button>
              </div>

              {/* Dynamic Filtering Panel */}
              <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
                
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search customers name, email..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border dark:bg-zinc-950 dark:border-zinc-800"
                  />
                </div>

                <div className="flex flex-wrap gap-3 w-full md:w-auto text-xs font-semibold">
                  <select
                    value={customerPackageFilter}
                    onChange={(e) => setCustomerPackageFilter(e.target.value)}
                    className="px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800"
                  >
                    <option value="all">All User Roles</option>
                    <option value="investor">Customers (Buyers)</option>
                    <option value="farmer">Sellers (Farmers)</option>
                  </select>

                  <select
                    value={customerStatusFilter}
                    onChange={(e) => setCustomerStatusFilter(e.target.value)}
                    className="px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800"
                  >
                    <option value="all">All Account Status</option>
                    <option value="active">Active Nodes</option>
                    <option value="suspended">Suspended / Limited</option>
                    <option value="verified">KYC Verified Only</option>
                    <option value="unverified">KYC Unverified / Pending</option>
                  </select>
                </div>

              </div>

              {/* Customers Grid Directory */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-zinc-50 dark:bg-zinc-900/60 text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest border-b border-zinc-200 dark:border-zinc-800">
                        <th className="p-4 pl-6">Customer / Email</th>
                        <th className="p-4">Phone / Location</th>
                        <th className="p-4">Account Role</th>
                        <th className="p-4">Registered Date</th>
                        <th className="p-4">Est Balance</th>
                        <th className="p-4 text-right pr-6">Administrative Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-150 dark:divide-zinc-800">
                      {filteredCustomers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-12 text-center text-zinc-400">
                            No matching custody nodes found.
                          </td>
                        </tr>
                      ) : (
                        filteredCustomers.map((user, index) => {
                          const isSuspended = user.email.includes('babajide') || user.id.startsWith('suspended-');
                          return (
                            <tr key={`${user.id}-${index}`} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20">
                              <td className="p-4 pl-6 font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
                                <img src={user.avatar} alt="Avatar" className="h-8 w-8 rounded-full object-cover border border-emerald-500/30" />
                                <div>
                                  <span className="block">{user.fullName}</span>
                                  <span className="text-[10px] text-zinc-400 font-mono font-medium">{user.email}</span>
                                </div>
                              </td>
                              <td className="p-4 text-zinc-600 dark:text-zinc-400 font-medium">
                                <span className="block">{user.phone || '+234 803 000 0000'}</span>
                                <span className="text-[10px] text-zinc-400">Oyo Range Custody Area</span>
                              </td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                                  user.role === 'farmer' ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400'
                                }`}>
                                  {user.role === 'farmer' ? 'Seller' : 'Buyer'}
                                </span>
                              </td>
                              <td className="p-4 font-mono text-zinc-500">
                                2026-03-12
                              </td>
                              <td className="p-4 font-mono font-bold text-zinc-900 dark:text-white">
                                ₦{user.balance?.toLocaleString() || '0'}
                              </td>
                              <td className="p-4 text-right pr-6 space-x-1 whitespace-nowrap">
                                <button 
                                  onClick={() => setSelectedCustomer(user)}
                                  className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-emerald-600 transition-colors"
                                  title="View Profile Contracts"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={() => setEditingCustomer(user)}
                                  className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-blue-600 transition-colors"
                                  title="Edit Member Details"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={() => handleToggleSuspend(user.email)}
                                  className={`p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors ${
                                    isSuspended ? 'text-emerald-600 hover:text-emerald-700' : 'text-amber-600 hover:text-amber-700'
                                  }`}
                                  title={isSuspended ? "Re-activate" : "Suspend Account"}
                                >
                                  <Lock className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteCustomer(user.id, user.fullName)}
                                  className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-red-500 transition-colors"
                                  title="Delete Permanent Node"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* Selected Customer Detailed Profile Overlay Drawer Modal */}
              <AnimatePresence>
                {selectedCustomer && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-zinc-950/70 backdrop-blur-sm" onClick={() => setSelectedCustomer(null)} />
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-4xl w-full p-6 relative z-10 shadow-2xl overflow-y-auto max-h-[90vh] flex flex-col space-y-6">
                      
                      {/* Header bar of modal */}
                      <div className="flex justify-between items-start border-b pb-4">
                        <div className="flex items-center gap-4">
                          <img src={selectedCustomer.avatar} alt={selectedCustomer.fullName} className="h-16 w-16 rounded-full border-2 border-emerald-500 object-cover" />
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-display font-extrabold text-lg text-zinc-900 dark:text-white">{selectedCustomer.fullName}</h3>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-black uppercase ${
                                (customerKycStatus[selectedCustomer.email] || 'Unverified') === 'Verified' ? 'bg-emerald-100 text-emerald-800' :
                                (customerKycStatus[selectedCustomer.email] || 'Unverified') === 'Pending' ? 'bg-amber-100 text-amber-800' :
                                (customerKycStatus[selectedCustomer.email] || 'Unverified') === 'Rejected' ? 'bg-red-100 text-red-800' :
                                'bg-zinc-100 text-zinc-800'
                              }`}>
                                KYC: {customerKycStatus[selectedCustomer.email] || 'Unverified'}
                              </span>
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">{selectedCustomer.email} • {selectedCustomer.phone || '+234 803 000 0000'}</p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-[10px] text-zinc-400 font-semibold">Account Manager:</span>
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold font-mono">{customerManagers[selectedCustomer.email] || 'None Assigned'}</span>
                            </div>
                          </div>
                        </div>
                        
                        <button onClick={() => setSelectedCustomer(null)} className="p-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 rounded-xl text-zinc-500">
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Tab Selection Row within Drawer */}
                      <div className="flex border-b border-zinc-150 dark:border-zinc-800 gap-1 pb-px text-xs font-bold">
                        {['Portfolio & Finance', 'KYC & Verification Docs', 'Internal Logs & Operations'].map((tabLabel) => {
                          const tabId = tabLabel === 'Portfolio & Finance' ? 'finance' : tabLabel === 'KYC & Verification Docs' ? 'kyc' : 'ops';
                          const isCurrent = (selectedCustomer.id === 'chioma-obi' && tabId === 'kyc') || (!selectedCustomer.id.includes('chioma') && tabId === 'finance'); // local highlight simulation state helper
                          return (
                            <button
                              key={tabId}
                              onClick={() => {
                                // Simulate tab toggling by updating a temporary metadata state or local action
                                alert(`Opening ${tabLabel} dashboard module for ${selectedCustomer.fullName}`);
                              }}
                              className="px-4 py-2 border-b-2 border-emerald-600 text-emerald-600 dark:text-emerald-400 font-extrabold"
                            >
                              {tabLabel}
                            </button>
                          );
                        })}
                      </div>

                      <div className="space-y-6 flex-1">
                        
                        {/* SECTION 1: FINANCE & PORTFOLIO */}
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-900 rounded-2xl">
                              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Wallet Balance</span>
                              <strong className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-lg">₦{selectedCustomer.balance?.toLocaleString() || '0'}</strong>
                              <span className="text-[9px] text-zinc-400 block mt-1">Available for Marketplace & Bids</span>
                            </div>
                            
                            <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-900 rounded-2xl">
                              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Escrow Balance</span>
                              <strong className="font-mono text-amber-600 dark:text-amber-400 font-bold text-lg">₦{(selectedCustomer.balance ? selectedCustomer.balance * 0.4 : 200000).toLocaleString(undefined, {maximumFractionDigits: 0})}</strong>
                              <span className="text-[9px] text-zinc-400 block mt-1">Secured pending weight validation</span>
                            </div>

                            <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-900 rounded-2xl">
                              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Managed Livestock Nodes</span>
                              <strong className="text-zinc-900 dark:text-white font-bold text-lg">
                                {farmerLivestock.filter(an => an.ownersName && an.ownersName.toLowerCase().includes(selectedCustomer.fullName.toLowerCase())).length} Animals
                              </strong>
                              <span className="text-[9px] text-zinc-400 block mt-1">Active Pasture Boarding program</span>
                            </div>
                          </div>

                          {/* Direct Ledger Balance Adjustment Tool */}
                          <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-2xl space-y-3">
                            <div className="flex items-center gap-2">
                              <Wallet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                              <h4 className="font-bold text-xs text-zinc-900 dark:text-white uppercase tracking-wider">Direct Ledger Balance Adjustment</h4>
                            </div>
                            <p className="text-[10px] text-zinc-400">Instantly credit or debit this member's secure wallet. This action bypasses external payment gateways and modifies the central ledger node directly.</p>
                            <form 
                              onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                const amt = parseFloat(formData.get('adjustAmount') as string) || 0;
                                const action = formData.get('adjustAction') as 'credit' | 'debit';
                                if (amt <= 0) {
                                  alert('Please enter a valid positive amount.');
                                  return;
                                }
                                const change = action === 'credit' ? amt : -amt;
                                
                                setUsersList(prev => prev.map(u => {
                                  if (u.id === selectedCustomer.id) {
                                    return { ...u, balance: Math.max(0, u.balance + change) };
                                  }
                                  return u;
                                }));
                                setSelectedCustomer(prev => {
                                  if (!prev) return null;
                                  return { ...prev, balance: Math.max(0, prev.balance + change) };
                                });

                                logAdminAction('Ledger Adjusted', `${action === 'credit' ? 'Credited' : 'Debited'} ₦${amt.toLocaleString()} to ${selectedCustomer.fullName}'s wallet`, 'warning');
                                alert(`Ledger Adjusted! Wallet updated by ₦${change.toLocaleString()}`);
                                e.currentTarget.reset();
                              }}
                              className="flex gap-2 text-xs"
                            >
                              <select name="adjustAction" className="px-2 py-1.5 border rounded-xl dark:bg-zinc-900 dark:border-zinc-700 font-bold bg-white dark:bg-zinc-950">
                                <option value="credit">Credit (+)</option>
                                <option value="debit">Debit (-)</option>
                              </select>
                              <input type="number" name="adjustAmount" placeholder="Amount (₦)" className="flex-1 px-3 py-1.5 border rounded-xl dark:bg-zinc-900 dark:border-zinc-700 bg-white dark:bg-zinc-950" required />
                              <button type="submit" className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 rounded-xl font-bold transition-all shadow-sm">
                                Adjust Ledger
                              </button>
                            </form>
                          </div>

                          {/* Livestock Assets Owned Sub-Table */}
                          <div className="space-y-2">
                            <h4 className="font-bold text-xs text-zinc-900 dark:text-white uppercase tracking-wider text-zinc-400">Livestock Portfolio</h4>
                            <div className="border border-zinc-150 dark:border-zinc-800 rounded-xl overflow-hidden divide-y divide-zinc-150 dark:divide-zinc-800 text-[11px]">
                              {farmerLivestock.filter(an => an.ownersName && an.ownersName.toLowerCase().includes(selectedCustomer.fullName.toLowerCase())).length === 0 ? (
                                <div className="p-4 text-center text-zinc-400">No livestock assets currently owned.</div>
                              ) : (
                                farmerLivestock.filter(an => an.ownersName && an.ownersName.toLowerCase().includes(selectedCustomer.fullName.toLowerCase())).map(animal => (
                                  <div key={animal.id} className="p-3 flex justify-between items-center hover:bg-zinc-50 dark:hover:bg-zinc-950/40">
                                    <div className="flex items-center gap-3">
                                      <span className="text-base">{animal.category === 'Cow' ? '🐄' : animal.category === 'Ram' ? '🐏' : '🐐'}</span>
                                      <div>
                                        <span className="font-bold text-zinc-800 dark:text-zinc-200 block">{animal.breed}</span>
                                        <span className="text-[9px] text-zinc-400 font-mono">Tag: {animal.tagNumber} • RFID: RFID-{animal.tagNumber}</span>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <span className="font-mono font-bold block text-zinc-900 dark:text-white">₦{(animal.purchasePrice || 0).toLocaleString()}</span>
                                      <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold font-sans">{animal.feedingPlan || 'Pasture Only'}</span>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>

                        {/* SECTION 2: KYC & IDENTITY DOCUMENTS MANAGER */}
                        <div className="border-t pt-6 space-y-4">
                          <div className="flex justify-between items-center flex-wrap gap-2">
                            <div>
                              <h4 className="font-bold text-xs text-zinc-900 dark:text-white uppercase tracking-wider text-zinc-400">KYC & Identity Documents Manager</h4>
                              <p className="text-[11px] text-zinc-400 mt-0.5">Approve, reject, download, replace, or request re-uploads of legal files.</p>
                            </div>
                            
                            {/* General KYC Status Selector */}
                            <div className="flex gap-2 items-center">
                              <span className="text-[11px] text-zinc-500 font-bold">Verification:</span>
                              <select 
                                value={customerKycStatus[selectedCustomer.email] || 'Unverified'} 
                                onChange={(e) => {
                                  const nextVal = e.target.value as 'Unverified' | 'Pending' | 'Verified' | 'Rejected';
                                  setCustomerKycStatus({ ...customerKycStatus, [selectedCustomer.email]: nextVal });
                                  logAdminAction('KYC Global Status Updated', `Set KYC status of ${selectedCustomer.fullName} to "${nextVal}"`, 'warning');
                                  alert(`Customer verification set to ${nextVal}`);
                                }}
                                className="px-2.5 py-1 text-xs border rounded-lg bg-zinc-50 dark:bg-zinc-950 dark:border-zinc-800 font-bold"
                              >
                                <option value="Unverified">Unverified</option>
                                <option value="Pending">Pending Audit</option>
                                <option value="Verified">Verified Approved</option>
                                <option value="Rejected">Rejected</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                              { label: 'National ID', file: 'national_id_card_front.pdf' },
                              { label: 'Driver\'s Licence', file: 'drivers_license_rear.pdf' },
                              { label: 'International Passport', file: 'passport_bio_page.pdf' },
                              { label: 'Utility Bill', file: 'nepa_electric_bill_june.pdf' },
                              { label: 'Selfie Verification', file: 'biometric_selfie_scan.png' },
                              { label: 'Signed Agreements', file: 'pasture_boarding_deed_signed.pdf' },
                              { label: 'Purchase Receipts', file: 'cowplug_receipt_2948.pdf' },
                              { label: 'Ownership Certificates', file: 'cattle_cooperative_ownership.pdf' },
                              { label: 'RFID Certificates', file: 'rfid_telemetry_pairing_cert.pdf' }
                            ].map(doc => {
                              const docKey = doc.label;
                              const userDocStore = customerDocs[selectedCustomer.email] || {};
                              const currentDoc = userDocStore[docKey] || { status: 'Approved', fileName: doc.file, fileUrl: '#' };
                              return (
                                <div key={docKey} className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-900 rounded-2xl flex flex-col justify-between space-y-3">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <span className="font-bold text-xs text-zinc-900 dark:text-white block">{docKey}</span>
                                      <span className="text-[10px] text-zinc-400 font-mono mt-0.5 truncate block max-w-[200px]">{currentDoc.fileName}</span>
                                    </div>
                                    <span className={`px-2 py-0.5 text-[8px] font-mono font-black uppercase rounded ${
                                      currentDoc.status === 'Approved' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' :
                                      currentDoc.status === 'Pending' ? 'bg-amber-50 text-amber-800 border border-amber-100' :
                                      'bg-red-50 text-red-800 border border-red-100'
                                    }`}>
                                      {currentDoc.status}
                                    </span>
                                  </div>

                                  <div className="flex gap-1.5 pt-1.5 border-t border-dashed border-zinc-200 dark:border-zinc-800 justify-end flex-wrap">
                                    <button 
                                      onClick={() => {
                                        alert(`Simulating document viewing: Opened CPG-STORAGE://vault/${currentDoc.fileName}`);
                                        logAdminAction('Document Viewed', `Viewed ${docKey} for ${selectedCustomer.fullName}`, 'success');
                                      }}
                                      className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-white rounded text-[10px] font-bold"
                                    >
                                      View File
                                    </button>
                                    <button 
                                      onClick={() => {
                                        alert(`Spooling cloud secure pipeline... Saved locally: ${currentDoc.fileName}`);
                                        logAdminAction('Document Downloaded', `Downloaded ${docKey} for ${selectedCustomer.fullName}`, 'success');
                                      }}
                                      className="px-2 py-1 border hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 rounded text-[10px] font-bold flex items-center gap-0.5"
                                    >
                                      <FileDown className="h-3 w-3" /> Download
                                    </button>
                                    <button 
                                      onClick={() => {
                                        const newName = prompt(`Enter replacement file name for ${docKey}:`, `replaced_${currentDoc.fileName}`);
                                        if (!newName) return;
                                        setCustomerDocs(prev => {
                                          const userStore = prev[selectedCustomer.email] || {};
                                          return {
                                            ...prev,
                                            [selectedCustomer.email]: {
                                              ...userStore,
                                              [docKey]: { ...currentDoc, fileName: newName, status: 'Pending' }
                                            }
                                          };
                                        });
                                        logAdminAction('Document Replaced', `Replaced ${docKey} file with "${newName}"`, 'warning');
                                        alert(`File replaced! Set status to Pending.`);
                                      }}
                                      className="px-2 py-1 border hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 rounded text-[10px] font-bold"
                                    >
                                      Replace
                                    </button>
                                    <button 
                                      onClick={() => {
                                        setCustomerDocs(prev => {
                                          const userStore = prev[selectedCustomer.email] || {};
                                          return {
                                            ...prev,
                                            [selectedCustomer.email]: {
                                              ...userStore,
                                              [docKey]: { ...currentDoc, status: 'Approved' }
                                            }
                                          };
                                        });
                                        logAdminAction('Document Approved', `Approved ${docKey} for ${selectedCustomer.fullName}`, 'success');
                                        alert(`${docKey} Approved!`);
                                      }}
                                      className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold"
                                    >
                                      Approve
                                    </button>
                                    <button 
                                      onClick={() => {
                                        const reason = prompt('Enter rejection reason:') || 'Illegible photo scan';
                                        setCustomerDocs(prev => {
                                          const userStore = prev[selectedCustomer.email] || {};
                                          return {
                                            ...prev,
                                            [selectedCustomer.email]: {
                                              ...userStore,
                                              [docKey]: { ...currentDoc, status: 'Rejected' }
                                            }
                                          };
                                        });
                                        logAdminAction('Document Rejected', `Rejected ${docKey} for ${selectedCustomer.fullName}. Reason: ${reason}`, 'danger');
                                        alert(`${docKey} Rejected!`);
                                      }}
                                      className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-bold"
                                    >
                                      Reject
                                    </button>
                                    <button 
                                      onClick={() => {
                                        setCustomerDocs(prev => {
                                          const userStore = prev[selectedCustomer.email] || {};
                                          return {
                                            ...prev,
                                            [selectedCustomer.email]: {
                                              ...userStore,
                                              [docKey]: { ...currentDoc, status: 'Re-upload Requested' }
                                            }
                                          };
                                        });
                                        logAdminAction('Re-upload Requested', `Requested re-upload for ${docKey} from ${selectedCustomer.fullName}`, 'warning');
                                        alert(`Re-upload requested! SMS notification sent to user.`);
                                      }}
                                      className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px] font-bold"
                                    >
                                      Request Re-upload
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* SECTION 3: INTERNAL LOGS & ADMINISTRATIVE CONSTRAINTS */}
                        <div className="border-t pt-6 space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Assigned Account Manager & Password Management */}
                            <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-900 rounded-2xl space-y-4">
                              <h4 className="font-bold text-xs text-zinc-900 dark:text-white uppercase tracking-wider">Staff Controls & Verification</h4>
                              
                              <div>
                                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Assign Portfolio Manager</label>
                                <select 
                                  value={customerManagers[selectedCustomer.email] || 'None Assigned'} 
                                  onChange={(e) => {
                                    const nextMgr = e.target.value;
                                    setCustomerManagers({ ...customerManagers, [selectedCustomer.email]: nextMgr });
                                    logAdminAction('Portfolio Manager Assigned', `Assigned ${selectedCustomer.fullName} to Account Manager "${nextMgr}"`, 'success');
                                    alert(`Account assigned to ${nextMgr}`);
                                  }}
                                  className="w-full px-3.5 py-2 rounded-xl border dark:bg-zinc-900 dark:border-zinc-700 text-zinc-800 dark:text-white font-medium bg-white dark:bg-zinc-950 text-xs"
                                >
                                  <option value="None Assigned">None Assigned (Unmanaged)</option>
                                  <option value="Dr. Amina Bello">Dr. Amina Bello (Super Admin)</option>
                                  <option value="Mallam Musa Ibrahim">Mallam Musa Ibrahim (Farm Manager)</option>
                                  <option value="Dr. Kenneth Okafor">Dr. Kenneth Okafor (Veterinarian)</option>
                                  <option value="Sani Adamu">Sani Adamu (Finance Officer)</option>
                                </select>
                              </div>

                              <div className="border-t border-dashed border-zinc-200 dark:border-zinc-800 pt-3">
                                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Reset Account Credentials</label>
                                <p className="text-[10px] text-zinc-400 mb-2">Instantly generate a temporary randomized high-entropy password for this user's recovery.</p>
                                <button 
                                  type="button"
                                  onClick={() => {
                                    const recoveryPass = `CPG-RECOVER-${Math.floor(1000 + Math.random() * 9000)}-X${Math.floor(10 + Math.random() * 90)}`;
                                    logAdminAction('Credential Key Reset', `Initiated emergency password bypass for ${selectedCustomer.fullName}`, 'danger');
                                    alert(`PASSWORD RESET SUCCESSFUL!\n\nTemporary credential generated:\n👉 ${recoveryPass}\n\nPlease copy and email this directly to ${selectedCustomer.fullName}.`);
                                  }}
                                  className="px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-xl text-[10px] font-black uppercase transition-colors"
                                >
                                  Force Password Reset
                                </button>
                              </div>
                            </div>

                            {/* Internal notes log timeline */}
                            <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-900 rounded-2xl flex flex-col justify-between space-y-4">
                              <div className="space-y-3">
                                <h4 className="font-bold text-xs text-zinc-900 dark:text-white uppercase tracking-wider">Internal Administrative Notes</h4>
                                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                  {(customerNotes[selectedCustomer.email] || []).length === 0 ? (
                                    <p className="text-[10px] text-zinc-400 italic">No internal logs written yet for this node.</p>
                                  ) : (
                                    (customerNotes[selectedCustomer.email] || []).map((noteStr, idx) => (
                                      <div key={idx} className="p-2.5 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-lg text-[10px] text-zinc-500 relative">
                                        <span className="absolute top-1.5 right-1.5 text-[8px] font-mono text-zinc-400 font-bold"># {idx + 1}</span>
                                        <p className="font-semibold text-zinc-700 dark:text-zinc-300 leading-normal pr-4">{noteStr}</p>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>

                              <form 
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  const formData = new FormData(e.currentTarget);
                                  const rawNote = formData.get('internalNoteText') as string;
                                  if (!rawNote || !rawNote.trim()) return;
                                  const userNotesList = customerNotes[selectedCustomer.email] || [];
                                  setCustomerNotes({
                                    ...customerNotes,
                                    [selectedCustomer.email]: [...userNotesList, rawNote.trim()]
                                  });
                                  logAdminAction('Internal Note Registered', `Added operator note to ${selectedCustomer.fullName}'s folder.`, 'success');
                                  e.currentTarget.reset();
                                  alert('Note saved to history timeline!');
                                }}
                                className="space-y-2 pt-2 border-t border-dashed border-zinc-200 dark:border-zinc-800 text-xs"
                              >
                                <textarea name="internalNoteText" rows={2} placeholder="Write persistent notes (e.g. Visited Gombe sector, verified NIN scan)..." className="w-full px-3 py-1.5 border rounded-xl dark:bg-zinc-900 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-[11px]" required />
                                <button type="submit" className="w-full py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 rounded-xl font-bold transition-all shadow-sm">
                                  Add Administrative Note
                                </button>
                              </form>
                            </div>

                          </div>
                        </div>

                      </div>

                      {/* Footer actions of modal */}
                      <div className="border-t pt-4 flex gap-2">
                        <button onClick={() => {
                          alert(`Compiling complete immutable PDF portfolio summary of KYC docs & boarding certificates for ${selectedCustomer.fullName}...`);
                          logAdminAction('Report Downloaded', `Exported custody dossier for ${selectedCustomer.fullName}`, 'success');
                        }} className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold w-full">
                          Compile Complete Dossier Portfolio
                        </button>
                        <button onClick={() => setSelectedCustomer(null)} className="px-4 py-2 border rounded-xl text-xs font-bold w-full">
                          Close Profile
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* Add Member Modal */}
              <AnimatePresence>
                {isAddingCustomer && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-zinc-950/70 backdrop-blur-sm" onClick={() => setIsAddingCustomer(false)} />
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 relative z-10 shadow-2xl space-y-4">
                      <div className="flex items-center justify-between border-b pb-3">
                        <div className="flex items-center gap-2">
                          <UserPlus className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                          <h3 className="font-display font-extrabold text-lg text-zinc-900 dark:text-white">Add New Member</h3>
                        </div>
                        <button onClick={() => setIsAddingCustomer(false)} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400">
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <form onSubmit={handleAddCustomerSubmit} className="space-y-4 text-xs font-semibold">
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Full Name</label>
                          <input name="fullName" type="text" required placeholder="e.g. Segun Ogunleye" className="w-full px-3.5 py-2 rounded-xl border dark:bg-zinc-950 dark:border-zinc-800 text-zinc-800 dark:text-white font-medium focus:outline-none focus:border-emerald-500 bg-white dark:bg-zinc-950" />
                        </div>
                        
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Email Address</label>
                          <input name="email" type="email" required placeholder="e.g. segun@gmail.com" className="w-full px-3.5 py-2 rounded-xl border dark:bg-zinc-950 dark:border-zinc-800 text-zinc-800 dark:text-white font-medium focus:outline-none focus:border-emerald-500 bg-white dark:bg-zinc-950" />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Phone Number</label>
                          <input name="phone" type="text" placeholder="e.g. +234 803 555 9999" defaultValue="+234 803 " className="w-full px-3.5 py-2 rounded-xl border dark:bg-zinc-950 dark:border-zinc-800 text-zinc-800 dark:text-white font-medium focus:outline-none focus:border-emerald-500 bg-white dark:bg-zinc-950" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Account Role</label>
                            <select name="role" className="w-full px-3.5 py-2 rounded-xl border dark:bg-zinc-950 dark:border-zinc-800 text-zinc-800 dark:text-white font-medium focus:outline-none focus:border-emerald-500 bg-white dark:bg-zinc-950">
                              <option value="investor">Buyer (Investor)</option>
                              <option value="farmer">Seller (Farmer)</option>
                              <option value="admin">Administrator</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Initial Balance (₦)</label>
                            <input name="balance" type="number" defaultValue="0" min="0" className="w-full px-3.5 py-2 rounded-xl border dark:bg-zinc-950 dark:border-zinc-800 text-zinc-800 dark:text-white font-medium focus:outline-none focus:border-emerald-500 bg-white dark:bg-zinc-950" />
                          </div>
                        </div>

                        <div className="pt-2 flex gap-2">
                          <button type="button" onClick={() => setIsAddingCustomer(false)} className="w-full py-2.5 border rounded-xl font-bold">
                            Cancel
                          </button>
                          <button type="submit" className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-md">
                            Add Member
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* Edit Member Modal */}
              <AnimatePresence>
                {editingCustomer && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-zinc-950/70 backdrop-blur-sm" onClick={() => setEditingCustomer(null)} />
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 relative z-10 shadow-2xl space-y-4">
                      <div className="flex items-center justify-between border-b pb-3">
                        <div className="flex items-center gap-2">
                          <Edit3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          <h3 className="font-display font-extrabold text-lg text-zinc-900 dark:text-white">Edit Member Details</h3>
                        </div>
                        <button onClick={() => setEditingCustomer(null)} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400">
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <form onSubmit={handleEditCustomerSubmit} className="space-y-4 text-xs font-semibold">
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Full Name</label>
                          <input name="fullName" type="text" required defaultValue={editingCustomer.fullName} className="w-full px-3.5 py-2 rounded-xl border dark:bg-zinc-950 dark:border-zinc-800 text-zinc-800 dark:text-white font-medium focus:outline-none focus:border-emerald-500 bg-white dark:bg-zinc-950" />
                        </div>
                        
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Email Address</label>
                          <input name="email" type="email" required defaultValue={editingCustomer.email} className="w-full px-3.5 py-2 rounded-xl border dark:bg-zinc-950 dark:border-zinc-800 text-zinc-800 dark:text-white font-medium focus:outline-none focus:border-emerald-500 bg-white dark:bg-zinc-950" />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Phone Number</label>
                          <input name="phone" type="text" defaultValue={editingCustomer.phone} className="w-full px-3.5 py-2 rounded-xl border dark:bg-zinc-950 dark:border-zinc-800 text-zinc-800 dark:text-white font-medium focus:outline-none focus:border-emerald-500 bg-white dark:bg-zinc-950" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Account Role</label>
                            <select name="role" defaultValue={editingCustomer.role} className="w-full px-3.5 py-2 rounded-xl border dark:bg-zinc-950 dark:border-zinc-800 text-zinc-800 dark:text-white font-medium focus:outline-none focus:border-emerald-500 bg-white dark:bg-zinc-950">
                              <option value="investor">Buyer (Investor)</option>
                              <option value="farmer">Seller (Farmer)</option>
                              <option value="admin">Administrator</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Current Balance (₦)</label>
                            <input name="balance" type="number" defaultValue={editingCustomer.balance} min="0" className="w-full px-3.5 py-2 rounded-xl border dark:bg-zinc-950 dark:border-zinc-800 text-zinc-800 dark:text-white font-medium focus:outline-none focus:border-emerald-500 bg-white dark:bg-zinc-950" />
                          </div>
                        </div>

                        <div className="pt-2 flex gap-2">
                          <button type="button" onClick={() => setEditingCustomer(null)} className="w-full py-2.5 border rounded-xl font-bold">
                            Cancel
                          </button>
                          <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md">
                            Save Changes
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

            </div>
          )}

          {/* ==================================== */}
          {/* TAB 3: LIVESTOCK & RFID MANAGER */}
          {/* ==================================== */}
          {adminTab === 'livestock' && (
            <div className="space-y-6">
              
              {/* Dynamic Filtering panel with Intake enrollment button */}
              <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
                
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search Tag, Breed, Owner..."
                    value={livestockSearch}
                    onChange={(e) => setLivestockSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border dark:bg-zinc-950 dark:border-zinc-800"
                  />
                </div>

                <div className="flex flex-wrap gap-3 w-full md:w-auto text-xs font-semibold">
                  <select
                    value={livestockTypeFilter}
                    onChange={(e) => setLivestockTypeFilter(e.target.value)}
                    className="px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800"
                  >
                    <option value="all">All Livestock Species</option>
                    <option value="Cow">Cows (🐄)</option>
                    <option value="Ram">Rams (🐏)</option>
                    <option value="Goat">Goats (🐐)</option>
                  </select>

                  <select
                    value={livestockStatusFilter}
                    onChange={(e) => setLivestockStatusFilter(e.target.value)}
                    className="px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800"
                  >
                    <option value="all">All Health status</option>
                    <option value="Healthy">Healthy (Green Status)</option>
                    <option value="Observation">Under Observation</option>
                    <option value="Sold">Sold</option>
                  </select>

                  <button 
                    onClick={() => {
                      setIsAddingAnimal(true);
                      setNewAnimalRFID(`RFID-NG-900${Math.floor(100 + Math.random() * 900)}`);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="h-4 w-4" /> Enroll New Livestock
                  </button>
                </div>

              </div>

              {/* Livestock Table Directory */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-zinc-50 dark:bg-zinc-900/60 text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest border-b border-zinc-200 dark:border-zinc-800">
                        <th className="p-4 pl-6">Species / Breed</th>
                        <th className="p-4">Tag Number</th>
                        <th className="p-4">RFID Sensor Tag</th>
                        <th className="p-4">Owner Name</th>
                        <th className="p-4">Weight / Age</th>
                        <th className="p-4">Est Value</th>
                        <th className="p-4">Custody Status</th>
                        <th className="p-4 text-right pr-6">Administrative Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-150 dark:divide-zinc-800">
                      {filteredLivestock.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-12 text-center text-zinc-400">
                            No livestock matching filters enrolled.
                          </td>
                        </tr>
                      ) : (
                        filteredLivestock.map(animal => (
                          <tr key={animal.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20">
                            <td className="p-4 pl-6 font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
                              <span className="text-xl">
                                {animal.category === 'Cow' ? '🐄' : animal.category === 'Ram' ? '🐏' : '🐐'}
                              </span>
                              <div>
                                <span className="block">{animal.breed}</span>
                                <span className="text-[10px] text-zinc-400 font-mono font-medium">{animal.category}</span>
                              </div>
                            </td>
                            <td className="p-4 font-mono font-bold text-zinc-700 dark:text-zinc-300">
                              {animal.tagNumber}
                            </td>
                            <td className="p-4">
                              <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-mono font-bold px-2 py-1 rounded-lg text-[10px] border border-emerald-100 dark:border-emerald-900/30">
                                RFID-{animal.tagNumber}
                              </span>
                            </td>
                            <td className="p-4 font-semibold text-zinc-600 dark:text-zinc-400">
                              {animal.ownersName || 'Oyo Range Stock'}
                            </td>
                            <td className="p-4 text-zinc-600 dark:text-zinc-400 font-mono">
                              {animal.weightKg} Kg • {animal.ageMonths} Mos
                            </td>
                            <td className="p-4 font-mono font-black text-emerald-600">
                              ₦{animal.estimatedValue?.toLocaleString() || '250,000'}
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                                animal.healthStatus.toLowerCase().includes('excellent') ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400'
                              }`}>
                                {animal.healthStatus}
                              </span>
                            </td>
                            <td className="p-4 text-right pr-6 space-x-1 whitespace-nowrap">
                              <button 
                                onClick={() => setSelectedAnimal(animal)}
                                className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-emerald-600 transition-colors"
                                title="View Animal Biometrics"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => {
                                  if (confirm('Simulate vaccination trigger for this animal?')) {
                                    alert('FMD and PPR booster vaccine record updated on range ledger!');
                                    animal.vaccinations.push('FMD Booster ' + new Date().toISOString().split('T')[0]);
                                    logAdminAction('Vaccination Recorded', `Injected FMD booster vaccine to animal ${animal.tagNumber}`);
                                  }
                                }}
                                className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-emerald-600 transition-colors"
                                title="Add Vaccination Record"
                              >
                                <PlusCircle className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Dynamic Overlay Modal: Add New Livestock Intake */}
              <AnimatePresence>
                {isAddingAnimal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-zinc-950/70 backdrop-blur-sm" onClick={() => setIsAddingAnimal(false)} />
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-xl w-full p-6 relative z-10 shadow-2xl overflow-y-auto max-h-[90vh]">
                      <button onClick={() => setIsAddingAnimal(false)} className="absolute top-4 right-4 p-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 rounded-xl text-zinc-500">
                        <X className="h-4 w-4" />
                      </button>

                      <div className="flex items-center gap-2 mb-4 border-b pb-3">
                        <HeartPulse className="h-6 w-6 text-emerald-600" />
                        <div>
                          <h3 className="font-display font-extrabold text-lg text-zinc-900 dark:text-white">Enroll New Livestock Biometric</h3>
                          <p className="text-xs text-zinc-400">Add an audited animal into CowPlug NG Central Registry</p>
                        </div>
                      </div>

                      <form onSubmit={handleAddNewAnimalSubmit} className="space-y-4 text-xs">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Generated RFID Tag</label>
                            <input type="text" readOnly value={newAnimalRFID} className="w-full px-3 py-2 border dark:bg-zinc-950 dark:border-zinc-800 rounded-xl font-mono text-zinc-500" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Animal Tag Number</label>
                            <input type="text" value={newAnimalTag} onChange={(e) => setNewAnimalTag(e.target.value)} className="w-full px-3 py-2 border dark:bg-zinc-950 dark:border-zinc-800 rounded-xl font-mono" />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Livestock Species</label>
                            <select value={newAnimalType} onChange={(e) => {
                              setNewAnimalType(e.target.value as any);
                              setNewAnimalTag(`CPG-${e.target.value === 'Cow' ? 'CW' : e.target.value === 'Goat' ? 'GT' : 'RM'}-0${farmerLivestock.length + 2}`);
                            }} className="w-full px-3 py-2 border dark:bg-zinc-950 dark:border-zinc-800 rounded-xl font-semibold">
                              <option value="Cow">Cow (🐄)</option>
                              <option value="Ram">Ram (🐏)</option>
                              <option value="Goat">Goat (🐐)</option>
                            </select>
                          </div>
                          <div className="col-span-2">
                            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Breed Description</label>
                            <input type="text" value={newAnimalBreed} onChange={(e) => setNewAnimalBreed(e.target.value)} className="w-full px-3 py-2 border dark:bg-zinc-950 dark:border-zinc-800 rounded-xl font-semibold" />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Weight (Kg)</label>
                            <input type="number" value={newAnimalWeight} onChange={(e) => setNewAnimalWeight(e.target.value)} className="w-full px-3 py-2 border dark:bg-zinc-950 dark:border-zinc-800 rounded-xl font-mono" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Age (Months)</label>
                            <input type="number" value={newAnimalAge} onChange={(e) => setNewAnimalAge(e.target.value)} className="w-full px-3 py-2 border dark:bg-zinc-950 dark:border-zinc-800 rounded-xl font-mono" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Acquisition Price (₦)</label>
                            <input type="number" value={newAnimalPrice} onChange={(e) => setNewAnimalPrice(e.target.value)} className="w-full px-3 py-2 border dark:bg-zinc-950 dark:border-zinc-800 rounded-xl font-mono" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Custody Owner Name</label>
                            <select value={newAnimalOwner} onChange={(e) => setNewAnimalOwner(e.target.value)} className="w-full px-3 py-2 border dark:bg-zinc-950 dark:border-zinc-800 rounded-xl font-semibold">
                              {usersList.map(u => (
                                <option key={u.id} value={u.fullName}>{u.fullName}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Active Boarding Package</label>
                            <select value={newAnimalPlan} onChange={(e) => setNewAnimalPlan(e.target.value)} className="w-full px-3 py-2 border dark:bg-zinc-950 dark:border-zinc-800 rounded-xl font-semibold">
                              <option value="Pasture Only">Pasture Only</option>
                              <option value="Pasture + Supplement Feed">Pasture + Supplement Feed</option>
                              <option value="Premium Fattening Feed">Premium Fattening Feed</option>
                            </select>
                          </div>
                        </div>

                        <div className="pt-2 flex gap-2">
                          <button type="submit" className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors">
                            Complete Biometric Intake
                          </button>
                          <button type="button" onClick={() => setIsAddingAnimal(false)} className="w-full py-2.5 border rounded-xl font-bold transition-colors">
                            Cancel
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* Selected Animal Detailed Auditing Timeline Modal Overlay */}
              <AnimatePresence>
                {selectedAnimal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-zinc-950/70 backdrop-blur-sm" onClick={() => setSelectedAnimal(null)} />
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-4xl w-full p-6 relative z-10 shadow-2xl overflow-y-auto max-h-[90vh] flex flex-col space-y-6 text-xs">
                      
                      {/* Close button */}
                      <button onClick={() => setSelectedAnimal(null)} className="absolute top-4 right-4 p-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 rounded-xl text-zinc-500 z-10">
                        <X className="h-4 w-4" />
                      </button>

                      {/* Header profile info */}
                      <div className="flex gap-4 border-b pb-4">
                        <span className="text-4xl p-3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl h-16 w-16 flex items-center justify-center">
                          {selectedAnimal.category === 'Cow' ? '🐄' : selectedAnimal.category === 'Ram' ? '🐏' : '🐐'}
                        </span>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-display font-extrabold text-lg text-zinc-900 dark:text-white">Active Bio-Node: {selectedAnimal.tagNumber}</h3>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-black uppercase ${
                              selectedAnimal.healthStatus.toLowerCase().includes('excellent') || selectedAnimal.healthStatus.toLowerCase().includes('healthy') ? 'bg-emerald-100 text-emerald-800' :
                              selectedAnimal.healthStatus.toLowerCase().includes('observation') ? 'bg-amber-100 text-amber-800' :
                              selectedAnimal.healthStatus.toLowerCase().includes('quarantine') ? 'bg-rose-100 text-rose-800' :
                              'bg-zinc-100 text-zinc-800'
                            }`}>
                              Status: {selectedAnimal.healthStatus}
                            </span>
                          </div>
                          <p className="text-zinc-500 dark:text-zinc-400 mt-0.5 font-semibold">Breed: {selectedAnimal.breed} • Assigned RFID: <span className="font-mono text-emerald-600 font-extrabold">RFID-{selectedAnimal.tagNumber}</span></p>
                          <p className="text-[10px] text-zinc-400 font-medium">Station Custody: Oyo Grass Range Pastures (Yard C-2 Node)</p>
                        </div>
                      </div>

                      {/* Main multi-column operations dashboard */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto flex-1 pr-1">
                        
                        {/* LEFT COLUMN: CRITICAL METRIC INPUTS & BIO-OVERLAY FORM */}
                        <div className="space-y-4">
                          <h4 className="font-bold text-[10px] text-zinc-400 uppercase tracking-widest border-b pb-1">Biometric & Custody Settings</h4>
                          
                          <form 
                            onSubmit={(e) => {
                              e.preventDefault();
                              const formData = new FormData(e.currentTarget);
                              const w = parseFloat(formData.get('weightKg') as string) || selectedAnimal.weightKg;
                              const val = parseFloat(formData.get('estimatedValue') as string) || (selectedAnimal.estimatedValue || 250000);
                              const fPlan = formData.get('feedingPlan') as string;
                              const hStat = formData.get('healthStatus') as string;
                              const own = formData.get('ownersName') as string;
                              const rfidOver = formData.get('rfidOverride') as string;

                              // Update parent list
                              setFarmerLivestock(prev => prev.map(an => {
                                if (an.id === selectedAnimal.id) {
                                  return {
                                    ...an,
                                    weightKg: w,
                                    estimatedValue: val,
                                    feedingPlan: fPlan,
                                    healthStatus: hStat,
                                    ownersName: own,
                                    tagNumber: rfidOver || an.tagNumber
                                  };
                                }
                                return an;
                              }));

                              // Update local selected state
                              setSelectedAnimal(prev => {
                                if (!prev) return null;
                                return {
                                  ...prev,
                                  weightKg: w,
                                  estimatedValue: val,
                                  feedingPlan: fPlan,
                                  healthStatus: hStat,
                                  ownersName: own,
                                  tagNumber: rfidOver || prev.tagNumber
                                };
                              });

                              logAdminAction('Livestock Biometrics Updated', `Modified credentials for livestock tag ${selectedAnimal.tagNumber}. Owner: ${own}, Weight: ${w}Kg, Value: ₦${val.toLocaleString()}`, 'warning');
                              alert('Livestock biometrics updated successfully! Node synchronization active.');
                            }}
                            className="space-y-4 text-xs font-semibold"
                          >
                            {/* Row 1: Weight & Valuation */}
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] text-zinc-400 uppercase mb-1">Weight Audited (Kg)</label>
                                <input name="weightKg" type="number" defaultValue={selectedAnimal.weightKg} className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800 bg-white" required />
                              </div>
                              <div>
                                <label className="block text-[10px] text-zinc-400 uppercase mb-1">Estimated Valuation (₦)</label>
                                <input name="estimatedValue" type="number" defaultValue={selectedAnimal.estimatedValue || 250000} className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800 bg-white" required />
                              </div>
                            </div>

                            {/* Row 2: RFID Sync Override & Active Boarding Program */}
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] text-zinc-400 uppercase mb-1">RFID Sync Serial</label>
                                <input name="rfidOverride" type="text" defaultValue={selectedAnimal.tagNumber} className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800 bg-white font-mono font-bold text-zinc-600" />
                              </div>
                              <div>
                                <label className="block text-[10px] text-zinc-400 uppercase mb-1">Active Boarding Package</label>
                                <select name="feedingPlan" defaultValue={selectedAnimal.feedingPlan || 'Pasture + Supplement Feed'} className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800 bg-white">
                                  {pricingPackages.map(p => (
                                    <option key={p.id} value={p.name}>{p.name}</option>
                                  ))}
                                  <option value="Pasture Only">Pasture Only</option>
                                  <option value="Pasture + Supplement Feed">Pasture + Supplement Feed</option>
                                  <option value="Premium Fattening Feed">Premium Fattening Feed</option>
                                </select>
                              </div>
                            </div>

                            {/* Row 3: Ownership Transfer Registry & Health Node */}
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] text-zinc-400 uppercase mb-1">Legal Custody Owner</label>
                                <select name="ownersName" defaultValue={selectedAnimal.ownersName || 'Oyo Range Stock'} className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800 bg-white">
                                  <option value="Oyo Range Stock">Oyo Cooperative Reserve</option>
                                  {usersList.map(u => (
                                    <option key={u.id} value={u.fullName}>{u.fullName}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-[10px] text-zinc-400 uppercase mb-1">Platform Health Status</label>
                                <select name="healthStatus" defaultValue={selectedAnimal.healthStatus} className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800 bg-white">
                                  <option value="Excellent Healthy">Excellent Healthy</option>
                                  <option value="Healthy">Healthy (Green Status)</option>
                                  <option value="Under Observation">Under Observation</option>
                                  <option value="Quarantined Isolation">Quarantined Isolation</option>
                                  <option value="Sold & Dispatched">Sold & Dispatched</option>
                                  <option value="Deceased / Lost">Deceased / Lost</option>
                                </select>
                              </div>
                            </div>

                            {/* Fast Action Quick-Mark buttons */}
                            <div className="grid grid-cols-3 gap-2 pt-1">
                              <button 
                                type="button" 
                                onClick={() => {
                                  setFarmerLivestock(prev => prev.map(an => an.id === selectedAnimal.id ? { ...an, healthStatus: 'Quarantined Isolation' } : an));
                                  setSelectedAnimal(prev => prev ? { ...prev, healthStatus: 'Quarantined Isolation' } : null);
                                  logAdminAction('Livestock Quarantined', `Quarantined animal ${selectedAnimal.tagNumber} due to medical screening`, 'danger');
                                  alert('Animal status set to Quarantined. Field staff notification dispatched!');
                                }}
                                className="px-2.5 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl font-bold uppercase text-[9px] text-center border border-rose-200"
                              >
                                Mark Quarantine
                              </button>
                              <button 
                                type="button" 
                                onClick={() => {
                                  if (confirm('Are you sure this animal should be registered as Deceased? This will trigger insurance filings and permanently limit custody trading.')) {
                                    setFarmerLivestock(prev => prev.map(an => an.id === selectedAnimal.id ? { ...an, healthStatus: 'Deceased / Lost' } : an));
                                    setSelectedAnimal(prev => prev ? { ...prev, healthStatus: 'Deceased / Lost' } : null);
                                    logAdminAction('Livestock Deceased', `Registered animal ${selectedAnimal.tagNumber} as Deceased`, 'danger');
                                    alert('Deceased status committed. Lead veterinarian filed insurance claim!');
                                  }
                                }}
                                className="px-2.5 py-2 bg-zinc-100 text-zinc-700 hover:bg-zinc-200 rounded-xl font-bold uppercase text-[9px] text-center border border-zinc-200"
                              >
                                Mark Deceased
                              </button>
                              <button 
                                type="button" 
                                onClick={() => {
                                  setFarmerLivestock(prev => prev.map(an => an.id === selectedAnimal.id ? { ...an, healthStatus: 'Sold & Dispatched' } : an));
                                  setSelectedAnimal(prev => prev ? { ...prev, healthStatus: 'Sold & Dispatched' } : null);
                                  logAdminAction('Livestock Sold', `Marked animal ${selectedAnimal.tagNumber} as Sold and Cleared for logistics dispatch`, 'success');
                                  alert('Animal marked as Sold & Dispatched. Meat supply clearance completed!');
                                }}
                                className="px-2.5 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl font-bold uppercase text-[9px] text-center border border-emerald-200"
                              >
                                Mark Sold
                              </button>
                            </div>

                            <button type="submit" className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-sm text-center">
                              Save Biometric & Ownership Changes
                            </button>
                          </form>
                        </div>

                        {/* RIGHT COLUMN: CLINICAL VET RECORDS & MEDIA UPLOADS */}
                        <div className="space-y-4">
                          
                          {/* Vet Procedure logging */}
                          <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-2xl space-y-3">
                            <h4 className="font-bold text-[10px] text-zinc-400 uppercase tracking-widest border-b pb-1">Veterinary Ledger & Procedure Log</h4>
                            
                            <form 
                              onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                const procedure = formData.get('procedureText') as string;
                                if (!procedure || !procedure.trim()) return;

                                const updatedVacs = [...(selectedAnimal.vaccinations || []), `${procedure.trim()} (${new Date().toISOString().split('T')[0]})`];
                                
                                setFarmerLivestock(prev => prev.map(an => {
                                  if (an.id === selectedAnimal.id) {
                                    return {
                                      ...an,
                                      vaccinations: updatedVacs,
                                      lastVetCheck: new Date().toISOString().split('T')[0]
                                    };
                                  }
                                  return an;
                                }));

                                setSelectedAnimal(prev => {
                                  if (!prev) return null;
                                  return {
                                    ...prev,
                                    vaccinations: updatedVacs,
                                    lastVetCheck: new Date().toISOString().split('T')[0]
                                  };
                                });

                                logAdminAction('Clinical Procedure Added', `Registered procedure: "${procedure}" on animal ${selectedAnimal.tagNumber}`, 'success');
                                alert('Procedure logged to clinical ledger! Last Vet Check date updated.');
                                e.currentTarget.reset();
                              }}
                              className="space-y-2"
                            >
                              <textarea name="procedureText" rows={2} placeholder="Type clinical procedure (e.g., Injected 5ml CBPP Vaccine booster, acaricide wash)..." className="w-full p-2.5 rounded-xl border dark:bg-zinc-900 bg-white" required />
                              <button type="submit" className="w-full py-2 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 rounded-xl font-bold">
                                Log Clinical Procedure
                              </button>
                            </form>

                            <div className="space-y-1.5 pt-1 max-h-28 overflow-y-auto pr-1">
                              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Completed Vet Procedures</span>
                              {(!selectedAnimal.vaccinations || selectedAnimal.vaccinations.length === 0) ? (
                                <p className="text-[10px] text-zinc-400 italic">No historical procedures found.</p>
                              ) : (
                                selectedAnimal.vaccinations.map((vac, vIdx) => (
                                  <div key={vIdx} className="p-2 bg-white dark:bg-zinc-900 border rounded-lg text-[10px] font-medium flex justify-between items-center text-zinc-600 dark:text-zinc-400">
                                    <span className="font-semibold">{vac}</span>
                                    <span className="text-[9px] bg-blue-50 text-blue-800 font-bold px-1.5 py-0.5 rounded">Verified</span>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>

                          {/* Media Gallery Herder Inspections */}
                          <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-2xl space-y-3">
                            <h4 className="font-bold text-[10px] text-zinc-400 uppercase tracking-widest border-b pb-1">Media Files & Herder Inspection Reports</h4>
                            
                            {/* Drag Drop simulated file upload zone */}
                            <div 
                              onClick={() => {
                                const filesMock = [
                                  'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=400&q=80',
                                  'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?auto=format&fit=crop&w=400&q=80'
                                ];
                                const mockImg = filesMock[Math.floor(Math.random() * filesMock.length)];
                                
                                setFarmerLivestock(prev => prev.map(an => {
                                  if (an.id === selectedAnimal.id) {
                                    return {
                                      ...an,
                                      photo: mockImg,
                                      videos: [...(an.videos || []), 'inspection_stream_july.mp4']
                                    };
                                  }
                                  return an;
                                }));

                                setSelectedAnimal(prev => {
                                  if (!prev) return null;
                                  return {
                                    ...prev,
                                    photo: mockImg,
                                    videos: [...(prev.videos || []), 'inspection_stream_july.mp4']
                                  };
                                });

                                logAdminAction('Inspection Media Uploaded', `Uploaded range inspection video stream to animal ${selectedAnimal.tagNumber}`, 'success');
                                alert('Inspection media file successfully synchronized with range server!');
                              }}
                              className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-emerald-500 rounded-2xl p-4 text-center cursor-pointer hover:bg-zinc-100/30 transition-all space-y-1"
                            >
                              <ImageIcon className="h-6 w-6 mx-auto text-zinc-400" />
                              <p className="font-bold text-zinc-700 dark:text-zinc-300">Upload Range Inspection File</p>
                              <p className="text-[10px] text-zinc-400">Drag-and-drop or click to browse field photo / herder telemetry stream</p>
                            </div>

                            <div className="flex gap-2 items-center">
                              <img src={selectedAnimal.photo || "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=400&q=80"} alt="Animal telemetry image" className="h-12 w-16 object-cover border rounded-lg shadow-inner bg-white" />
                              <div>
                                <span className="font-bold text-zinc-700 dark:text-zinc-300 block">Active Telemetry Feed</span>
                                <span className="text-[9px] text-zinc-400 block font-mono">CPG-FS-NODE://live_telemetry_inspection.jpg</span>
                              </div>
                            </div>
                          </div>

                        </div>

                      </div>

                      {/* Footer actions of modal */}
                      <div className="border-t pt-4 flex gap-2">
                        <button 
                          onClick={() => {
                            if (confirm('Generate full operational telemetry PDF docket for this animal?')) {
                              alert(`Spooling RFID telemetry timeline and clinical records... Saved: CPG_RFID_DOSSIER_${selectedAnimal.tagNumber}.pdf`);
                              logAdminAction('Telemetry Docket Exported', `Downloaded RFID dossiers for ${selectedAnimal.tagNumber}`, 'success');
                            }
                          }}
                          className="px-4 py-2 border hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-bold w-full text-center flex items-center justify-center gap-1"
                        >
                          <FileText className="h-4 w-4" /> Export Complete Telemetry Docket
                        </button>
                        <button onClick={() => setSelectedAnimal(null)} className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold w-full text-center">
                          Close Profile Cockpit
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

            </div>
          )}

          {/* ==================================== */}
          {/* TAB 4: REVENUE & BILLING (PAYMENTS) */}
          {/* ==================================== */}
          {adminTab === 'payments' && (
            <div className="space-y-6">
              
              {/* Stat grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-zinc-900 p-4 border rounded-2xl">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Successful Invoices</span>
                  <strong className="font-mono text-xl font-black text-emerald-600 block mt-1">
                    ₦{paymentsList.filter(p => p.status === 'Successful').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                  </strong>
                  <span className="text-[9px] text-zinc-400">{paymentsList.filter(p => p.status === 'Successful').length} settled statements</span>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-4 border rounded-2xl">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Pending Sourcing Escrow</span>
                  <strong className="font-mono text-xl font-black text-amber-500 block mt-1">
                    ₦{paymentsList.filter(p => p.status === 'Pending').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                  </strong>
                  <span className="text-[9px] text-zinc-400">{paymentsList.filter(p => p.status === 'Pending').length} pending approval</span>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-4 border rounded-2xl">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Failed Bank Handshakes</span>
                  <strong className="font-mono text-xl font-black text-rose-500 block mt-1">
                    ₦{paymentsList.filter(p => p.status === 'Failed').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                  </strong>
                  <span className="text-[9px] text-rose-400">Requires retry triggers</span>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-4 border rounded-2xl">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Overdue Accounts Balance</span>
                  <strong className="font-mono text-xl font-black text-purple-600 block mt-1">
                    ₦{paymentsList.filter(p => p.status === 'Overdue').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                  </strong>
                  <span className="text-[9px] text-purple-500">Auto-penalties active</span>
                </div>
              </div>

              {/* Invoice generator & reports panel */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Custom invoice generator form */}
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm h-fit">
                  <h3 className="font-display font-extrabold text-md text-zinc-900 dark:text-white">Generate Custom Invoice</h3>
                  <p className="text-xs text-zinc-500">Bill dynamic range management, extra feeds or custom vet procedures to active customer accounts</p>
                  
                  <form onSubmit={handleGenerateInvoice} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Customer / Owner</label>
                      <select value={newInvoiceCustomer} onChange={(e) => setNewInvoiceCustomer(e.target.value)} required className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800">
                        <option value="">Choose Custody Owner</option>
                        {usersList.map(u => (
                          <option key={u.id} value={u.fullName}>{u.fullName} ({u.email})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Invoice Amount (₦)</label>
                      <input type="number" required value={newInvoiceAmount} onChange={(e) => setNewInvoiceAmount(e.target.value)} placeholder="e.g. 15000" className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800 font-mono" />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Operational Sourced Service</label>
                      <select value={newInvoiceService} onChange={(e) => setNewInvoiceService(e.target.value)} className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800">
                        <option value="Boarding & Diet Management">Boarding & Diet Management</option>
                        <option value="Emergency Vet Treatment">Emergency Vet Treatment</option>
                        <option value="Live Sourced Transit Van Delivery">Live Sourced Transit Van Delivery</option>
                        <option value="Custom Salt-Lick Blocks Replenishment">Custom Salt-Lick Blocks Replenishment</option>
                      </select>
                    </div>

                    <button type="submit" className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors">
                      Dispatch Pending Invoice
                    </button>
                  </form>

                  {newInvoiceSuccess && (
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 text-xs p-3 rounded-xl text-center border font-bold">
                      ✓ Pending Invoice Generated & Emailed successfully!
                    </div>
                  )}
                </div>

                {/* Table list of simulated payments */}
                <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-display font-extrabold text-md text-zinc-900 dark:text-white">Operational Payments Log</h3>
                    <button 
                      onClick={() => handleSimulateExport('Excel', 'CowPlug Financial Balance Ledger')}
                      className="px-3 py-1 text-xs border rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 font-bold flex items-center gap-1"
                    >
                      <FileDown className="h-3.5 w-3.5" /> Export Logs
                    </button>
                  </div>

                  <div className="overflow-x-auto text-xs">
                    <table className="w-full text-left divide-y divide-zinc-100 dark:divide-zinc-800">
                      <thead>
                        <tr className="text-[9px] font-bold uppercase text-zinc-400 dark:text-zinc-500 pb-2">
                          <th className="pb-2">Reference</th>
                          <th className="pb-2">Client Name</th>
                          <th className="pb-2">Description</th>
                          <th className="pb-2">Value</th>
                          <th className="pb-2 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {paymentsList.map(pay => (
                          <tr key={pay.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/10">
                            <td className="py-2.5 font-mono text-[10px] text-zinc-400">{pay.invoiceNumber}</td>
                            <td className="py-2.5 font-bold text-zinc-800 dark:text-zinc-200">{pay.customerName}</td>
                            <td className="py-2.5 text-zinc-500">{pay.service}</td>
                            <td className="py-2.5 font-mono font-bold text-zinc-950 dark:text-white">₦{pay.amount.toLocaleString()}</td>
                            <td className="py-2.5 text-right">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                                pay.status === 'Successful' ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400' :
                                pay.status === 'Pending' ? 'bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-400' :
                                pay.status === 'Failed' ? 'bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-400' :
                                'bg-purple-50 dark:bg-purple-950 text-purple-800 dark:text-purple-400'
                              }`}>
                                {pay.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ==================================== */}
          {/* TAB 5: FEED INVENTORY MANAGEMENT */}
          {/* ==================================== */}
          {adminTab === 'feed' && (
            <div className="space-y-6">
              
              {/* Warehouse summary cards */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {feedStock.map(feed => {
                  const isLow = feed.currentStock < feed.reorderLevel;
                  return (
                    <div key={feed.id} className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 relative overflow-hidden shadow-sm">
                      <span className="text-[9px] font-mono font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">STOCK CATEGORY</span>
                      <strong className="text-sm font-black text-zinc-950 dark:text-white block mt-1">{feed.name}</strong>
                      
                      <div className="flex justify-between items-baseline mt-3">
                        <span className="text-2xl font-black font-mono text-zinc-900 dark:text-white">{feed.currentStock} bags</span>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                          isLow ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
                        }`}>
                          {isLow ? '⚠️ REORDER NOW' : '✓ Stock Healthy'}
                        </span>
                      </div>

                      {/* Details usage row */}
                      <div className="mt-3 pt-3 border-t text-[11px] text-zinc-500 flex justify-between">
                        <span>Monthly Intake: ~{feed.monthlyUsage} bags</span>
                        <span>Level Trigger: {feed.reorderLevel} bags</span>
                      </div>

                      {/* In-tab action buttons */}
                      <div className="grid grid-cols-2 gap-2 mt-4 pt-1">
                        <button 
                          onClick={() => handleAddFeedBags(feed.id, 20)}
                          className="py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg transition-colors text-center"
                        >
                          + 20 Bags Stock
                        </button>
                        <button 
                          onClick={() => handleSimulateFeedConsumption(feed.id, 10)}
                          className="py-1.5 border hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold text-[10px] rounded-lg transition-colors text-center"
                        >
                          Log Use (10 bags)
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Comprehensive warehouse details panel */}
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                <h3 className="font-display font-extrabold text-md text-zinc-900 dark:text-white">Warehouse feed management guidelines</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  CowPlug NG tracks bulk agricultural procurement directly from local milling cooperatives in Oyo and Kwara states. PKC (Palm Kernel Cake) and Wheat Bran (Dusa) are stored in weather-proofed Silo B. Maintain stock above minimum critical levels to prevent feeding interruptions. 
                </p>

                <div className="pt-2 flex flex-wrap gap-4 text-[10px] font-mono text-zinc-400">
                  <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Temperature audited storage</div>
                  <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Anti-pest quarantine verified</div>
                  <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Scheduled reorder alerts direct-link</div>
                </div>
              </div>

            </div>
          )}



          {/* ==================================== */}
          {/* TAB 7: REPORTS & ANALYTICS CHANNELS */}
          {/* ==================================== */}
          {adminTab === 'reports' && (
            <div className="space-y-6">
              
              {/* Filter controls with CSV/PDF exports */}
              <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-wrap gap-4 items-center justify-between shadow-sm">
                <div>
                  <h3 className="font-display font-extrabold text-md text-zinc-900 dark:text-white">Cooperative Performance Statement Generator</h3>
                  <p className="text-xs text-zinc-400">Audited operational metrics for livestock performance, food usage, and profit yields.</p>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleSimulateExport('PDF', 'Central Range Performance Audit Report')}
                    className="px-4 py-2 bg-zinc-950 hover:bg-zinc-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
                  >
                    <FileDown className="h-4 w-4" /> Download Complete PDF Audit
                  </button>
                  <button 
                    onClick={() => handleSimulateExport('Excel', 'CowPlug Comprehensive Ledger Sheets')}
                    className="px-4 py-2 border text-zinc-700 dark:text-zinc-300 font-bold text-xs rounded-xl flex items-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-850"
                  >
                    <FileSpreadsheet className="h-4 w-4" /> Export Excel Raw Ledger
                  </button>
                </div>
              </div>

              {/* Recharts reports panel grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 1. Package Popularity & Revenue Matrix */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                  <h4 className="font-display font-bold text-sm text-zinc-900 dark:text-white">Active Diet Package Subscriptions (₦ Value)</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={packagePerformanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" stroke="#a1a1aa" fontSize={11} />
                        <YAxis stroke="#a1a1aa" fontSize={11} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#059669" radius={[4, 4, 0, 0]}>
                          {packagePerformanceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 2. Warehouse Feed Consumption stats chart */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                  <h4 className="font-display font-bold text-sm text-zinc-900 dark:text-white">Active Warehouse Stock Level Bags Matrix</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={feedStock}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" stroke="#a1a1aa" fontSize={11} />
                        <YAxis stroke="#a1a1aa" fontSize={11} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="currentStock" fill="#3b82f6" name="Current Stock bags" />
                        <Bar dataKey="reorderLevel" fill="#ef4444" name="Reorder Alert Trigger" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ==================================== */}
          {/* TAB 8: SYSTEM AUDIT LOGS */}
          {/* ==================================== */}
          {adminTab === 'audit' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-150 dark:border-zinc-800 pb-4">
                <div>
                  <h3 className="font-display font-extrabold text-lg text-zinc-900 dark:text-white">Global Platform Activity Feed & Cryptographic Audit Ledger</h3>
                  <p className="text-xs text-zinc-400 mt-1">Real-time immutable log of administrative actions, customer payments, livestock onboarding events, and support tickets.</p>
                </div>
                
                <button 
                  onClick={() => {
                    const action = prompt("Enter Event Action Name (e.g., 'Manual Audit Check', 'Security Inspection', 'Custom Event Log'):");
                    if (!action) return;
                    const details = prompt("Enter Detailed Description Log Scope:");
                    if (!details) return;
                    const statusVal = prompt("Enter Severity Level ('success', 'warning', 'danger'):", "success");
                    const status = (statusVal === 'warning' || statusVal === 'danger') ? statusVal : 'success';
                    
                    logAdminAction(action, details, status);
                    alert("Event written to Cryptographic Platform Ledger successfully!");
                  }}
                  className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all whitespace-nowrap"
                >
                  <PlusCircle className="h-4 w-4" />
                  Log Manual System Event
                </button>
              </div>

              {/* Filtering Controls */}
              <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
                
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search logs by initiator, action, or details..."
                    value={activitySearch}
                    onChange={(e) => setActivitySearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border dark:bg-zinc-950 dark:border-zinc-800"
                  />
                </div>

                <div className="flex flex-wrap gap-3 w-full md:w-auto text-xs font-semibold">
                  <select
                    value={activityTypeFilter}
                    onChange={(e) => setActivityTypeFilter(e.target.value)}
                    className="px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                  >
                    <option value="all">All Activities & Event Groups</option>
                    <option value="admin">Staff & Admin Actions Only</option>
                    <option value="payment">Financial Ledger Transactions</option>
                    <option value="livestock">Livestock Registrations & Intake</option>
                    <option value="support">Customer Support Logs</option>
                  </select>
                </div>
              </div>

              {/* Table ledger view */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-zinc-50 dark:bg-zinc-900/60 text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest border-b border-zinc-200 dark:border-zinc-800">
                        <th className="p-4 pl-6">Timestamp Log</th>
                        <th className="p-4">Group</th>
                        <th className="p-4">Initiator / Role</th>
                        <th className="p-4">Action Event</th>
                        <th className="p-4">Details Log Scope</th>
                        <th className="p-4 text-right pr-6">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-150 dark:divide-zinc-800 text-[11px] font-medium">
                      {filteredActivities.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-zinc-400 font-sans">
                            No events matched your search / filters inside the dynamic ledger.
                          </td>
                        </tr>
                      ) : (
                        filteredActivities.map(log => (
                          <tr key={log.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20">
                            <td className="p-4 pl-6 text-zinc-400 font-mono whitespace-nowrap">{log.timestamp}</td>
                            <td className="p-4 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-sans uppercase tracking-wider ${
                                log.type === 'admin' ? 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200' :
                                log.type === 'payment' ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400' :
                                log.type === 'livestock' ? 'bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400' :
                                'bg-purple-50 text-purple-800 dark:bg-purple-950/60 dark:text-purple-400'
                              }`}>
                                {log.type}
                              </span>
                            </td>
                            <td className="p-4 text-zinc-800 dark:text-zinc-200 whitespace-nowrap">
                              <span className="font-bold block">{log.adminName}</span>
                              <span className="text-[9px] text-zinc-400 block mt-0.5 font-sans font-semibold uppercase">{log.role}</span>
                            </td>
                            <td className="p-4 font-bold text-zinc-900 dark:text-white whitespace-nowrap">{log.action}</td>
                            <td className="p-4 text-zinc-500 dark:text-zinc-400 leading-relaxed font-sans">{log.details}</td>
                            <td className="p-4 text-right pr-6">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase ${
                                log.status === 'success' ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400' :
                                log.status === 'warning' ? 'bg-amber-50 dark:bg-amber-950 text-amber-800' :
                                'bg-red-50 dark:bg-red-950 text-red-800'
                              }`}>
                                {log.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ==================================== */}
          {/* TAB 9: SELLERS VERIFICATION */}
          {/* ==================================== */}
          {adminTab === 'sellers' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b pb-4 flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h3 className="font-display font-extrabold text-lg text-zinc-900 dark:text-white">Sellers Verification & Management</h3>
                  <p className="text-xs text-zinc-400 mt-1">Verify third-party pastoral cooperatives, set commissions, and approve listing credentials.</p>
                </div>
                <button 
                  onClick={() => {
                    const name = prompt('Enter Seller Cooperative Name:');
                    if (!name) return;
                    const email = prompt('Enter Contact Email:');
                    const phone = prompt('Enter Contact Phone Number:');
                    const region = prompt('Enter Nigeria Region/State (e.g. Oyo West):');
                    if (!email || !phone || !region) return;
                    const newSel = {
                      id: `sel-${Date.now()}`,
                      name,
                      email,
                      phone,
                      region,
                      verified: false,
                      activeListings: 0,
                      rating: 5.0
                    };
                    setSellersList([...sellersList, newSel]);
                    logAdminAction('Seller Enrolled', `Created profile for seller "${name}" under verification review.`, 'success');
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="h-4 w-4" /> Add Pastoral Seller
                </button>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-zinc-50 dark:bg-zinc-900/60 text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest border-b border-zinc-200 dark:border-zinc-800">
                        <th className="p-4 pl-6">Seller Details</th>
                        <th className="p-4">Geographic Scope</th>
                        <th className="p-4">Active Listings</th>
                        <th className="p-4">Satisfaction Rating</th>
                        <th className="p-4">Verification Status</th>
                        <th className="p-4 text-right pr-6">Administrative Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-150 dark:divide-zinc-800">
                      {sellersList.map(seller => (
                        <tr key={seller.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20">
                          <td className="p-4 pl-6">
                            <strong className="text-sm font-black text-zinc-950 dark:text-white block">{seller.name}</strong>
                            <span className="text-zinc-400 block font-mono text-[10px]">{seller.email} • {seller.phone}</span>
                          </td>
                          <td className="p-4 font-mono text-zinc-500 dark:text-zinc-400">{seller.region}</td>
                          <td className="p-4 font-mono font-bold text-zinc-700 dark:text-zinc-300">{seller.activeListings} items</td>
                          <td className="p-4 text-zinc-600 dark:text-zinc-400 font-mono">⭐ {seller.rating} / 5.0</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase ${
                              seller.verified ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-950 text-amber-800'
                            }`}>
                              {seller.verified ? '✓ VERIFIED SELLER' : '⚠️ PENDING REVIEW'}
                            </span>
                          </td>
                          <td className="p-4 text-right pr-6 space-x-2">
                            {!seller.verified ? (
                              <button 
                                onClick={() => {
                                  setSellersList(sellersList.map(s => s.id === seller.id ? { ...s, verified: true } : s));
                                  logAdminAction('Seller Verified', `Approved and verified pastoral credentials for ${seller.name}`, 'success');
                                }}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition-colors"
                              >
                                Approve Verify
                              </button>
                            ) : (
                              <button 
                                onClick={() => {
                                  setSellersList(sellersList.map(s => s.id === seller.id ? { ...s, verified: false } : s));
                                  logAdminAction('Seller Suspended', `Revoked verification credentials for ${seller.name}`, 'warning');
                                }}
                                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-bold transition-colors"
                              >
                                Revoke Status
                              </button>
                            )}
                            <button 
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete seller ${seller.name}?`)) {
                                  setSellersList(sellersList.filter(s => s.id !== seller.id));
                                  logAdminAction('Seller Deleted', `Purged seller profile for ${seller.name}`, 'danger');
                                }
                              }}
                              className="px-2 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-[10px] font-bold transition-colors"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================================== */}
          {/* TAB 10: RFID SENSORS */}
          {/* ==================================== */}
          {adminTab === 'rfid' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b pb-4 flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h3 className="font-display font-extrabold text-lg text-zinc-900 dark:text-white">RFID Sensor telemetry hub</h3>
                  <p className="text-xs text-zinc-400 mt-1">Track ear-tag battery states, signal strengths, past scans, and physical custody logs.</p>
                </div>
                <button 
                  onClick={() => {
                    const tagNumber = prompt('Enter New RFID Tag ID Code (e.g. RFID-NG-900222):');
                    const animalTag = prompt('Assign to Animal Tag (optional - leave blank if unassigned):');
                    if (!tagNumber) return;
                    setRfidTags([...rfidTags, {
                      id: `rfid-${Date.now()}`,
                      tagNumber,
                      animalTag: animalTag || 'Unassigned',
                      status: 'Active',
                      battery: '100%',
                      scanHistory: [ { time: '2026-07-02 06:00', location: 'Oyo Base Yard A' } ],
                      movementHistory: 'Stock Yard -> Unassigned Range'
                    }]);
                    logAdminAction('RFID Tag Activated', `Provisioned new telemetry sensor ${tagNumber}`, 'success');
                  }}
                  className="px-4 py-2 bg-zinc-950 hover:bg-zinc-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <Cpu className="h-4 w-4" /> Register New Ear-Tag
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-900/60 text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest border-b border-zinc-200 dark:border-zinc-800">
                          <th className="p-4 pl-6">Ear-Tag Serial</th>
                          <th className="p-4">Assigned Animal ID</th>
                          <th className="p-4">Battery Health</th>
                          <th className="p-4">Last Telemetry Sweep</th>
                          <th className="p-4">Movement Trail</th>
                          <th className="p-4">Sensor State</th>
                          <th className="p-4 text-right pr-6">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-150 dark:divide-zinc-800">
                        {rfidTags.map(tag => (
                          <tr key={tag.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 font-mono">
                            <td className="p-4 pl-6 text-zinc-900 dark:text-white font-bold">{tag.tagNumber}</td>
                            <td className="p-4 text-zinc-500">{tag.animalTag}</td>
                            <td className="p-4">
                              <div className="flex items-center gap-1.5">
                                <span className="h-2 w-7 bg-zinc-200 dark:bg-zinc-800 rounded-sm relative inline-block border overflow-hidden shrink-0">
                                  <span className="absolute left-0 top-0 bottom-0 bg-emerald-600" style={{ width: tag.battery }} />
                                </span>
                                <span>{tag.battery}</span>
                              </div>
                            </td>
                            <td className="p-4 text-zinc-400 text-[11px]">
                              {tag.scanHistory[0]?.time} @ <span className="text-zinc-700 dark:text-zinc-300 font-bold">{tag.scanHistory[0]?.location}</span>
                            </td>
                            <td className="p-4 text-zinc-500 text-[11px] font-sans">{tag.movementHistory}</td>
                            <td className="p-4 font-sans">
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 rounded text-[9px] font-bold">
                                {tag.status}
                              </span>
                            </td>
                            <td className="p-4 text-right pr-6 font-sans">
                              <button 
                                onClick={() => {
                                  const zone = prompt('Simulate scan at new pasture coordinate / yard:');
                                  if (!zone) return;
                                  setRfidTags(rfidTags.map(t => t.id === tag.id ? {
                                    ...t,
                                    scanHistory: [{ time: new Date().toISOString().replace('T', ' ').substring(0, 16), location: zone }, ...t.scanHistory]
                                  } : t));
                                  logAdminAction('RFID Sweep Logged', `Sensor ${tag.tagNumber} scanned at coordinate ${zone}`, 'success');
                                }}
                                className="px-2 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg text-[10px] font-bold transition-colors"
                              >
                                Trigger Scan
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================================== */}
          {/* TAB 11: HEALTH RECORDS */}
          {/* ==================================== */}
          {adminTab === 'health' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b pb-4 flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h3 className="font-display font-extrabold text-lg text-zinc-900 dark:text-white">Central range veterinary clinical hub</h3>
                  <p className="text-xs text-zinc-400 mt-1">Audit active treatment lists, veterinary diagnostic charts, and isolation logs.</p>
                </div>
                <button 
                  onClick={() => {
                    const tagNumber = prompt('Enter Livestock ID (e.g., CPG-CW-001):');
                    const diagnosis = prompt('Clinical Diagnosis:');
                    const treatment = prompt('Prescribed Treatment regime:');
                    if (!tagNumber || !diagnosis || !treatment) return;
                    setHealthRecords([...healthRecords, {
                      id: `hlth-${Date.now()}`,
                      tagNumber,
                      diagnosis,
                      treatment,
                      vetVisitDate: new Date().toISOString().split('T')[0],
                      status: 'Under Observation',
                      certificates: `CPG-HLTH-${Math.floor(Math.random() * 9000 + 1000)}`
                    }]);
                    logAdminAction('Vet Case Logged', `Registered illness case & isolation directive for "${tagNumber}".`, 'warning');
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="h-4 w-4" /> Log Vet Case
                </button>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-zinc-50 dark:bg-zinc-900/60 text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest border-b border-zinc-200 dark:border-zinc-800">
                        <th className="p-4 pl-6">Livestock ID</th>
                        <th className="p-4">Clinical Diagnosis</th>
                        <th className="p-4">Medication & Treatment</th>
                        <th className="p-4 font-mono">Vet Visit Date</th>
                        <th className="p-4 font-mono">Health Certificate ID</th>
                        <th className="p-4">Isolation Status</th>
                        <th className="p-4 text-right pr-6">Update Case</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-150 dark:divide-zinc-800">
                      {healthRecords.map(rec => (
                        <tr key={rec.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20">
                          <td className="p-4 pl-6 font-mono font-bold text-zinc-900 dark:text-white">{rec.tagNumber}</td>
                          <td className="p-4 text-zinc-800 dark:text-zinc-200 font-bold">{rec.diagnosis}</td>
                          <td className="p-4 text-zinc-500 leading-relaxed">{rec.treatment}</td>
                          <td className="p-4 font-mono text-zinc-400">{rec.vetVisitDate}</td>
                          <td className="p-4 font-mono text-zinc-500">{rec.certificates}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              rec.status === 'Healthy' ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-400'
                            }`}>
                              {rec.status}
                            </span>
                          </td>
                          <td className="p-4 text-right pr-6">
                            <select
                              value={rec.status}
                              onChange={(e) => {
                                setHealthRecords(healthRecords.map(r => r.id === rec.id ? { ...r, status: e.target.value } : r));
                                logAdminAction('Vet Case Cleared', `Livestock ${rec.tagNumber} status set to "${e.target.value}".`, 'success');
                              }}
                              className="px-2 py-1 text-[11px] bg-zinc-50 border rounded-lg focus:outline-none dark:bg-zinc-950 dark:border-zinc-800 font-bold"
                            >
                              <option value="Under Observation">Under Observation</option>
                              <option value="Healthy">Cleared (Healthy)</option>
                              <option value="In Isolation">Critical (In Isolation)</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================================== */}
          {/* TAB 12: VACCINATIONS */}
          {/* ==================================== */}
          {adminTab === 'vaccinations' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b pb-4 flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h3 className="font-display font-extrabold text-lg text-zinc-900 dark:text-white">Active Vaccination Schedule Calendar</h3>
                  <p className="text-xs text-zinc-400 mt-1">Preventative medicine schedule tracking outbreaks vaccinations (CBPP, PPR, Foot-and-Mouth disease).</p>
                </div>
                <button 
                  onClick={() => {
                    const tag = prompt('Enter Livestock ID (e.g., CPG-CW-001):');
                    const vType = prompt('Vaccine Type (e.g., Brucellosis S19):');
                    const sDate = prompt('Scheduled Date (YYYY-MM-DD):');
                    if (!tag || !vType || !sDate) return;
                    setVaccinationSchedule([...vaccinationSchedule, {
                      id: `vac-${Date.now()}`,
                      animalTag: tag,
                      vaccineType: vType,
                      scheduledDate: sDate,
                      status: 'Upcoming'
                    }]);
                    logAdminAction('Vaccine Scheduled', `Booked ${vType} dose scheduled for livestock ${tag}`, 'success');
                  }}
                  className="px-4 py-2 bg-zinc-950 hover:bg-zinc-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="h-4 w-4" /> Schedule Immunization Dose
                </button>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-zinc-50 dark:bg-zinc-900/60 text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest border-b border-zinc-200 dark:border-zinc-800">
                        <th className="p-4 pl-6">Animal ID</th>
                        <th className="p-4">Medication & Vaccine Compound</th>
                        <th className="p-4 font-mono">Scheduled Date</th>
                        <th className="p-4">Schedule Status</th>
                        <th className="p-4 text-right pr-6">Operational Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-150 dark:divide-zinc-800 font-mono">
                      {vaccinationSchedule.map(vac => (
                        <tr key={vac.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20">
                          <td className="p-4 pl-6 font-bold text-zinc-900 dark:text-white">{vac.animalTag}</td>
                          <td className="p-4 text-zinc-800 dark:text-zinc-200 font-sans font-bold">{vac.vaccineType}</td>
                          <td className="p-4 text-zinc-500">{vac.scheduledDate}</td>
                          <td className="p-4 font-sans">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              vac.status === 'Completed' ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-blue-50 text-blue-800'
                            }`}>
                              {vac.status}
                            </span>
                          </td>
                          <td className="p-4 text-right pr-6 font-sans">
                            {vac.status === 'Upcoming' && (
                              <button 
                                onClick={() => {
                                  setVaccinationSchedule(vaccinationSchedule.map(v => v.id === vac.id ? { ...v, status: 'Completed' } : v));
                                  logAdminAction('Vaccination Completed', `Administered vaccine ${vac.vaccineType} dose to ${vac.animalTag}`, 'success');
                                }}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition-colors font-sans"
                              >
                                Mark Administered
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================================== */}
          {/* TAB 13: WEIGHT ANALYTICS */}
          {/* ==================================== */}
          {adminTab === 'weight' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b pb-4 flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h3 className="font-display font-extrabold text-lg text-zinc-900 dark:text-white">Pasture Weight Gain Analytics</h3>
                  <p className="text-xs text-zinc-400 mt-1">Audit average monthly weight metrics and predicted market-ready slaughter dates.</p>
                </div>
              </div>

              {/* Dynamic Recharts Chart for Weight Gain */}
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                <h4 className="font-display font-bold text-sm text-zinc-900 dark:text-white">Herd Average Fattening Curve (kg gain over time)</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                      { month: 'Jan', Cattle: 210, Sheep: 55, Goats: 32 },
                      { month: 'Feb', Cattle: 235, Sheep: 58, Goats: 34 },
                      { month: 'Mar', Cattle: 260, Sheep: 62, Goats: 37 },
                      { month: 'Apr', Cattle: 295, Sheep: 69, Goats: 40 },
                      { month: 'May', Cattle: 330, Sheep: 74, Goats: 41 },
                      { month: 'Jun', Cattle: 365, Sheep: 78, Goats: 42 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" stroke="#a1a1aa" fontSize={11} />
                      <YAxis stroke="#a1a1aa" fontSize={11} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="Cattle" stroke="#059669" strokeWidth={2.5} />
                      <Line type="monotone" dataKey="Sheep" stroke="#3b82f6" strokeWidth={2} />
                      <Line type="monotone" dataKey="Goats" stroke="#f59e0b" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Interactive scale logger */}
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <h4 className="font-display font-black text-sm text-zinc-900 dark:text-white mb-4">Submit Biometric Electronic Scale Log</h4>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const target = e.target as HTMLFormElement;
                    const tag = (target.elements.namedItem('weightTag') as HTMLInputElement).value;
                    const val = parseFloat((target.elements.namedItem('weightVal') as HTMLInputElement).value);
                    if (!tag || isNaN(val)) return;
                    logAdminAction('Biometric Weight Logged', `Weighed ${tag} at ${val}kg on Range Yard scale.`, 'success');
                    alert(`Weight registered successfully! Recorded at ${val}kg.`);
                    target.reset();
                  }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs"
                >
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Livestock Animal ID</label>
                    <input name="weightTag" type="text" placeholder="e.g. CPG-CW-001" className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800" required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Measured Scale Weight (kg)</label>
                    <input name="weightVal" type="number" placeholder="e.g. 350" className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800 font-mono" required />
                  </div>
                  <div className="flex items-end">
                    <button type="submit" className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-900 text-white font-bold rounded-xl transition-colors">
                      Record Weigh-In
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ==================================== */}
          {/* TAB 14: MEDIA GALLERY */}
          {/* ==================================== */}
          {adminTab === 'media' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b pb-4 flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h3 className="font-display font-extrabold text-lg text-zinc-900 dark:text-white">Pasture Telemetry Media Feed</h3>
                  <p className="text-xs text-zinc-400 mt-1">Review live photo and video updates sent by field herders for customer assurance.</p>
                </div>
                <button 
                  onClick={() => {
                    alert('Simulating camera upload... Herder camera connection verified. Placed placeholder card in pasture gallery queue.');
                    logAdminAction('Pasture Photo Uploaded', 'Uploaded herder surveillance clip from Oyo range sector D.', 'success');
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <ImageIcon className="h-4 w-4" /> Simulate Herder Upload
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-zinc-900 border rounded-3xl overflow-hidden shadow-sm flex flex-col">
                  <img src="https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=400&q=80" alt="Pasture cattle" className="h-48 w-full object-cover" />
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <span className="text-[9px] font-mono text-zinc-400">Sector Pasture C • Oyo State</span>
                      <h4 className="font-bold text-xs text-zinc-900 dark:text-white mt-1">Morning Range Feeding Loop - Bunaji Herd</h4>
                    </div>
                    <span className="text-[9px] font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded self-start">Verified At: 2026-07-02 05:30</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 border rounded-3xl overflow-hidden shadow-sm flex flex-col">
                  <img src="https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?auto=format&fit=crop&w=400&q=80" alt="Sokoto Goat" className="h-48 w-full object-cover" />
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <span className="text-[9px] font-mono text-zinc-400">Quarantine Isolator A • Oyo State</span>
                      <h4 className="font-bold text-xs text-zinc-900 dark:text-white mt-1">Veterinary Supervision Checkup (Tick Bite wash)</h4>
                    </div>
                    <span className="text-[9px] font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded self-start">Verified At: 2026-07-01 16:15</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 border rounded-3xl overflow-hidden shadow-sm flex flex-col">
                  <img src="https://images.unsplash.com/photo-1484557985045-edf25e08da73?auto=format&fit=crop&w=400&q=80" alt="Rams herd" className="h-48 w-full object-cover" />
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <span className="text-[9px] font-mono text-zinc-400">Feed Pen 2 • Oyo State</span>
                      <h4 className="font-bold text-xs text-zinc-900 dark:text-white mt-1">Red Sokoto breeding rams mineral salt licking block</h4>
                    </div>
                    <span className="text-[9px] font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded self-start">Verified At: 2026-06-30 11:24</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================================== */}
          {/* TAB 15: MARKETPLACE */}
          {/* ==================================== */}
          {adminTab === 'marketplace' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b pb-4">
                <h3 className="font-display font-extrabold text-lg text-zinc-900 dark:text-white">Marketplace Listing Moderation</h3>
                <p className="text-xs text-zinc-400 mt-1">Approve, reject, feature, or mark sold individual livestock listings submitted by vetted pastoralists.</p>
              </div>

              {/* Listings Moderation Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {marketplaceListings.map(lst => (
                  <div key={lst.id} className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between space-y-4 shadow-sm relative overflow-hidden">
                    {lst.featured && (
                      <span className="absolute top-3 right-3 bg-amber-400 text-zinc-950 font-black text-[8px] uppercase px-2 py-0.5 rounded">Featured</span>
                    )}
                    <div>
                      <img src={lst.image} alt="listing" className="h-32 w-full object-cover rounded-xl" referrerPolicy="no-referrer" />
                      <div className="mt-3">
                        <span className="text-[9px] font-mono font-bold uppercase text-zinc-400">{lst.category} • {lst.ageMonths} mos • {lst.weightKg} kg</span>
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-white mt-1">{lst.title}</h4>
                        <p className="text-[11px] text-zinc-400 font-mono mt-1">Seller: {lst.sellerName}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t flex justify-between items-center">
                      <span className="font-mono font-extrabold text-md text-emerald-600 dark:text-emerald-400">₦{lst.price.toLocaleString()}</span>
                      <span className={`px-2 py-0.5 text-[9px] font-mono font-black uppercase rounded ${
                        lst.status === 'Approved' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                      }`}>
                        {lst.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {lst.status === 'Pending' ? (
                        <button 
                          onClick={() => {
                            setMarketplaceListings(marketplaceListings.map(m => m.id === lst.id ? { ...m, status: 'Approved' } : m));
                            logAdminAction('Listing Approved', `Approved livestock marketplace listing "${lst.title}".`, 'success');
                          }}
                          className="py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg text-center"
                        >
                          Approve
                        </button>
                      ) : (
                        <button 
                          onClick={() => {
                            setMarketplaceListings(marketplaceListings.map(m => m.id === lst.id ? { ...m, status: 'Pending' } : m));
                            logAdminAction('Listing Suspended', `Unapproved marketplace listing "${lst.title}".`, 'warning');
                          }}
                          className="py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] rounded-lg text-center"
                        >
                          Deactivate
                        </button>
                      )}
                      <button 
                        onClick={() => {
                          setMarketplaceListings(marketplaceListings.map(m => m.id === lst.id ? { ...m, featured: !m.featured } : m));
                          logAdminAction('Listing Featured Toggled', `Toggled featured status for "${lst.title}".`, 'success');
                        }}
                        className="py-1.5 border hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-[10px] rounded-lg text-center"
                      >
                        {lst.featured ? 'Unfeature' : 'Feature'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================================== */}
          {/* TAB 16: MEAT SUPPLY */}
          {/* ==================================== */}
          {adminTab === 'meat-orders' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b pb-4 flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h3 className="font-display font-extrabold text-lg text-zinc-900 dark:text-white">Meat Supply Logistics & Orders</h3>
                  <p className="text-xs text-zinc-400 mt-1">Manage bulk supply demands from major supermarkets, luxury hotels, and city butchers.</p>
                </div>
                <button 
                  onClick={() => {
                    const buyer = prompt('Enter Supermarket or Hotel Buyer Name:');
                    const product = prompt('Meat Cut/Product:');
                    const weight = parseFloat(prompt('Weight (kg):') || '0');
                    const price = parseFloat(prompt('Total Price (₦):') || '0');
                    if (!buyer || !product || weight === 0) return;
                    setMeatOrders([...meatOrders, {
                      id: `ord-${Date.now()}`,
                      customerName: buyer,
                      type: 'B2B Client',
                      product,
                      weightKg: weight,
                      price,
                      date: new Date().toISOString().split('T')[0],
                      status: 'Processing',
                      logisticsPartner: 'TBD',
                      invoiceId: `INV-M${Math.floor(Math.random() * 900 + 100)}`
                    }]);
                    logAdminAction('Meat Order Invoiced', `Created B2B meat supply order for ${buyer}`, 'success');
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="h-4 w-4" /> Book Bulk Supply Order
                </button>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-zinc-50 dark:bg-zinc-900/60 text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest border-b border-zinc-200 dark:border-zinc-800">
                        <th className="p-4 pl-6">B2B Institutional Buyer</th>
                        <th className="p-4">Dressed Product & Weight</th>
                        <th className="p-4 font-mono">Total Revenue</th>
                        <th className="p-4 font-mono">Invoice Number</th>
                        <th className="p-4">Logistics Partner</th>
                        <th className="p-4">Shipping Status</th>
                        <th className="p-4 text-right pr-6">Administrative Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-150 dark:divide-zinc-800">
                      {meatOrders.map(ord => (
                        <tr key={ord.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20">
                          <td className="p-4 pl-6">
                            <strong className="text-sm font-black text-zinc-950 dark:text-white block">{ord.customerName}</strong>
                            <span className="text-zinc-400 block font-mono text-[9px] uppercase tracking-wider">{ord.type}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-zinc-900 dark:text-zinc-200 font-bold block">{ord.product}</span>
                            <span className="text-zinc-400 block font-mono text-[10px]">{ord.weightKg} kg net weight</span>
                          </td>
                          <td className="p-4 font-mono font-extrabold text-emerald-600 dark:text-emerald-400">₦{ord.price.toLocaleString()}</td>
                          <td className="p-4 font-mono text-zinc-400">{ord.invoiceId}</td>
                          <td className="p-4 font-medium text-zinc-600 dark:text-zinc-400">{ord.logisticsPartner}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase font-mono ${
                              ord.status === 'Delivered' ? 'bg-emerald-50 text-emerald-800' :
                              ord.status === 'Shipped' ? 'bg-blue-50 text-blue-800' :
                              'bg-amber-50 text-amber-800'
                            }`}>
                              {ord.status}
                            </span>
                          </td>
                          <td className="p-4 text-right pr-6 space-x-1">
                            {ord.status === 'Processing' && (
                              <button 
                                onClick={() => {
                                  setMeatOrders(meatOrders.map(o => o.id === ord.id ? { ...o, status: 'Shipped', logisticsPartner: 'GIG Cold Logistics' } : o));
                                  logAdminAction('Meat Order Dispatched', `Meat supply ${ord.invoiceId} handed to GIG Cold Logistics.`, 'success');
                                }}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold"
                              >
                                Dispatch Order
                              </button>
                            )}
                            {ord.status === 'Shipped' && (
                              <button 
                                onClick={() => {
                                  setMeatOrders(meatOrders.map(o => o.id === ord.id ? { ...o, status: 'Delivered' } : o));
                                  logAdminAction('Meat Order Delivered', `Delivery confirmed for bulk order ${ord.invoiceId}`, 'success');
                                }}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold"
                              >
                                Confirm Delivery
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================================== */}
          {/* TAB 17: INVOICE LIST & PAYMENT VERIFICATION */}
          {/* ==================================== */}
          {adminTab === 'invoices' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="font-display font-extrabold text-lg text-zinc-900 dark:text-white">Enterprise Billing & Escrow Audit Desk</h3>
                  <p className="text-xs text-zinc-400 mt-1">Audit, verify uploaded receipts, approve wallet funding, and track billing invoices.</p>
                </div>
                <div className="flex gap-2">
                  <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-xl text-xs font-mono font-black uppercase">
                    AWAITING VERIFICATION: {invoices.filter(i => i.status === 'Awaiting Verification').length}
                  </span>
                </div>
              </div>

              {/* Sub-tabs: 1. Customer Escrow Invoices, 2. Simulated Operational Logs */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-6">
                
                {/* 1. CUSTOMER INVOICES (DYNAMIC PORTAL INTEGRATION) */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-emerald-600" /> Active Customer Escrow Invoices
                      </h4>
                      <p className="text-[11px] text-zinc-400">Real-time ledger requests and uploaded manual payment receipts needing physical verification.</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-zinc-150 dark:border-zinc-800">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-900/60 text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest border-b border-zinc-200 dark:border-zinc-800">
                          <th className="p-4 pl-6">Invoice ID</th>
                          <th className="p-4">Customer</th>
                          <th className="p-4 font-mono">Amount (₦)</th>
                          <th className="p-4">Date</th>
                          <th className="p-4">Verification State</th>
                          <th className="p-4 text-right pr-6">Escrow Operations</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-150 dark:divide-zinc-800 font-mono text-[11px]">
                        {invoices.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-12 text-center text-zinc-400 font-sans">
                              <Receipt className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
                              <p className="font-bold">No customer invoices found</p>
                              <p className="text-[11px] text-zinc-500 mt-1">Generated invoices will appear here dynamically in real-time.</p>
                            </td>
                          </tr>
                        ) : (
                          invoices.map(inv => (
                            <tr key={inv.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 font-sans">
                              <td className="p-4 pl-6 text-zinc-400 font-bold font-mono">INV-{inv.id.replace('inv-', '').substring(0, 8).toUpperCase()}</td>
                              <td className="p-4">
                                <div className="font-bold text-zinc-800 dark:text-zinc-200">{inv.customerFullName}</div>
                                <div className="text-[10px] text-zinc-400">{inv.customerEmail}</div>
                              </td>
                              <td className="p-4 font-bold font-mono text-emerald-600 dark:text-emerald-400">
                                ₦{inv.amount.toLocaleString()}
                              </td>
                              <td className="p-4 text-zinc-500 text-[10px] whitespace-nowrap">
                                {new Date(inv.date).toLocaleDateString()} {new Date(inv.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase font-mono ${
                                  inv.status === 'Paid' || inv.status === 'Verified' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 
                                  inv.status === 'Awaiting Verification' ? 'bg-amber-50 text-amber-800 border border-amber-200 animate-pulse' :
                                  inv.status === 'Rejected' ? 'bg-red-50 text-red-800 border border-red-200' :
                                  'bg-zinc-100 text-zinc-600 border border-zinc-200'
                                }`}>
                                  {inv.status}
                                </span>
                              </td>
                              <td className="p-4 text-right pr-6 space-y-2">
                                <div className="flex justify-end gap-1.5 flex-wrap">
                                  {/* Expand / View Details */}
                                  <button
                                    onClick={() => {
                                      const notes = prompt("Enter internal review note or status details:", inv.internalNotes || "");
                                      if (notes !== null) {
                                        onUpdateInvoice(inv.id, { internalNotes: notes });
                                        alert("Internal invoice notes updated successfully.");
                                        logAdminAction("Invoice Modified", `Updated review notes for customer invoice ${inv.id}`, "warning");
                                      }
                                    }}
                                    className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-800 dark:text-white text-[10px] font-bold rounded-lg transition-colors"
                                  >
                                    Add Notes
                                  </button>

                                  {(inv.status === 'Awaiting Verification' || inv.status === 'Pending Payment') && (
                                    <>
                                      <button
                                        onClick={() => handleOpenVerificationWorkflow(inv)}
                                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg transition-colors"
                                      >
                                        Verify & Fund
                                      </button>

                                      <button
                                        onClick={() => {
                                          if (confirm(`Reject payment of ₦${inv.amount.toLocaleString()}?`)) {
                                            onUpdateInvoice(inv.id, { 
                                              status: 'Rejected', 
                                              internalNotes: 'Payment receipt rejected due to signature or reference mismatch' 
                                            });
                                            onDispatchNotification({
                                              id: `notif-payment-reject-${Date.now()}`,
                                              type: 'system',
                                              title: '❌ Receipt Verification Failed',
                                              message: `Your manual payment receipt for ₦${inv.amount.toLocaleString()} was rejected. Please review and re-upload.`,
                                              date: new Date().toISOString(),
                                              read: false
                                            });
                                            alert(`Escrow payment rejected.`);
                                            logAdminAction("Payment Rejected", `Rejected payment for ${inv.customerFullName}`, "danger");
                                          }
                                        }}
                                        className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded-lg transition-colors"
                                      >
                                        Reject
                                      </button>
                                    </>
                                  )}
                                </div>

                                {/* Render uploaded reference details if any */}
                                {(inv.paymentReference || inv.receiptUrl || inv.bankUsed) && (
                                  <div className="bg-zinc-50 dark:bg-zinc-950 p-2.5 rounded-xl border border-zinc-150 dark:border-zinc-800 text-left text-[10px] font-mono space-y-1 mt-2">
                                    <div className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Submitted Proof of Payment:</div>
                                    {inv.bankUsed && <div className="text-zinc-700 dark:text-zinc-300"><strong>Bank:</strong> {inv.bankUsed}</div>}
                                    {inv.paymentReference && <div className="text-zinc-700 dark:text-zinc-300"><strong>Reference:</strong> {inv.paymentReference}</div>}
                                    {inv.paymentDate && <div className="text-zinc-700 dark:text-zinc-300"><strong>Payment Date:</strong> {inv.paymentDate}</div>}
                                    {inv.receiptUrl && <div className="text-zinc-700 dark:text-zinc-300"><strong>Receipt Filename:</strong> <span className="text-emerald-600 font-bold underline">{inv.receiptUrl}</span></div>}
                                    {inv.internalNotes && <div className="text-amber-600 dark:text-amber-400"><strong>Internal Note:</strong> {inv.internalNotes}</div>}
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 2. SIMULATED SYSTEM LEDGERS */}
                <div className="space-y-4 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                  <div>
                    <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-emerald-600" /> System Historical Ledger
                    </h4>
                    <p className="text-[11px] text-zinc-400 font-sans">Simulated historical boardings, range management expenses, and direct breeder acquisitions.</p>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-zinc-150 dark:border-zinc-800">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-900/60 text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest border-b border-zinc-200 dark:border-zinc-800">
                          <th className="p-4 pl-6">Invoice ID</th>
                          <th className="p-4">Customer/Institution Name</th>
                          <th className="p-4">Billing Purpose</th>
                          <th className="p-4 font-mono">Amount (₦)</th>
                          <th className="p-4">Payment Status</th>
                          <th className="p-4 text-right pr-6">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-150 dark:divide-zinc-800 font-mono text-[11px]">
                        {paymentsList.map(inv => (
                          <tr key={inv.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20">
                            <td className="p-4 pl-6 text-zinc-400 font-bold">INV-{inv.id.toUpperCase()}</td>
                            <td className="p-4 text-zinc-800 dark:text-zinc-200 font-sans font-bold">{inv.customerName}</td>
                            <td className="p-4 text-zinc-500 font-sans">{inv.service}</td>
                            <td className="p-4 font-extrabold text-emerald-600 dark:text-emerald-400 font-mono font-bold">₦{inv.amount.toLocaleString()}</td>
                            <td className="p-4 font-sans">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase font-mono ${
                                inv.status === 'Successful' ? 'bg-emerald-50 text-emerald-800' : 
                                inv.status === 'Pending' ? 'bg-amber-50 text-amber-800' :
                                'bg-red-50 text-red-800'
                              }`}>
                                {inv.status}
                              </span>
                            </td>
                            <td className="p-4 text-right pr-6 space-x-2 font-sans">
                              <button 
                                onClick={() => {
                                  alert(`Simulating PDF generation for invoice CPG-INV-${inv.id.toUpperCase()}... Print spooler success!`);
                                  logAdminAction('Invoice Downloaded', `Exported printable PDF receipt for ${inv.customerName}`, 'success');
                                }}
                                className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-white text-[10px] font-bold rounded-lg transition-colors"
                              >
                                Get PDF
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ==================================== */}
          {/* TAB 18: BROADCAST NOTIFICATIONS */}
          {/* ==================================== */}
          {adminTab === 'notifications' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b pb-4">
                <h3 className="font-display font-extrabold text-lg text-zinc-900 dark:text-white">Multi-Channel Broadcast Engine</h3>
                <p className="text-xs text-zinc-400 mt-1">Broadcast real-time SMS, Email, and in-app updates to cattle investors or pastoral sellers across Nigeria.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Send Broadcast form card */}
                <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                  <h4 className="font-display font-black text-sm text-zinc-900 dark:text-white">Create Broadcast Announcement</h4>
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const target = e.target as HTMLFormElement;
                      const msg = (target.elements.namedItem('broadcastMsg') as HTMLTextAreaElement).value;
                      const channel = (target.elements.namedItem('broadcastChan') as HTMLSelectElement).value;
                      if (!msg) return;
                      logAdminAction('Global Broadcast Dispatched', `Sent direct announcement message via "${channel}": ${msg.substring(0,30)}...`, 'success');
                      alert(`Cooperative Broadcast successfully queued and sent via ${channel} to 240 active users!`);
                      target.reset();
                    }}
                    className="space-y-4 text-xs"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Target Recipient Segment</label>
                        <select className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800 font-bold">
                          <option>All Platform Users</option>
                          <option>Livestock Investors Only</option>
                          <option>Pastoral Sellers/Co-ops Only</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Primary Routing Channel</label>
                        <select name="broadcastChan" className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800 font-bold">
                          <option value="In-App Push + SMS">In-App Push + SMS Gateway</option>
                          <option value="Direct Email">SMTP Corporate Email</option>
                          <option value="SMS Gateway Only">Bulk SMS Only (Oyo/Kwara)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Message Content (Max 160 characters for SMS compliance)</label>
                      <textarea name="broadcastMsg" rows={3} placeholder="e.g., Dear Partner, Oyo Yard sector B weight-gain reports are now ready for review inside your customer console. Thank you for your sponsorship." className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800" required />
                    </div>

                    <button type="submit" className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-colors">
                      Dispatch Mass Announcement
                    </button>
                  </form>
                </div>

                {/* Delivery logs card */}
                <div className="bg-zinc-950 text-white p-6 rounded-3xl border border-zinc-800 shadow-sm flex flex-col justify-between">
                  <div className="space-y-4">
                    <h4 className="font-display font-black text-xs uppercase tracking-wider text-emerald-400">Pasture Telemetry Gateway</h4>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">CowPlug OS links directly with Nigeria MTN and Airtel bulk SMS gateways for automated offline communication with grazing sector managers.</p>
                    
                    <div className="space-y-2 text-xs font-mono pt-2">
                      <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                        <span className="text-zinc-500">GSM Gateway Link:</span>
                        <span className="text-emerald-400">● Operational</span>
                      </div>
                      <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                        <span className="text-zinc-500">Email SMTP Mailer:</span>
                        <span className="text-emerald-400">● Operational</span>
                      </div>
                      <div className="flex justify-between pb-1.5">
                        <span className="text-zinc-500">Monthly SMS Quota:</span>
                        <span>12,402 / 50,000</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-900">
                    <span className="text-[10px] text-amber-400 block font-mono font-bold">⚠️ SYSTEM HEALTH NOTICE</span>
                    <p className="text-[10px] text-zinc-500 leading-normal mt-1">Ensure compliance with NCC bulk messaging directives when broadcasting marketing promotions to unsubscribed contacts.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================================== */}
          {/* TAB 19: CUSTOMER SUPPORT */}
          {/* ==================================== */}
          {adminTab === 'support' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b pb-4">
                <h3 className="font-display font-extrabold text-lg text-zinc-900 dark:text-white">Customer Support Helpdesk Console</h3>
                <p className="text-xs text-zinc-400 mt-1">Manage active support tickets, respond to dispute resolutions, and record customer query threads.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Tickets list */}
                <div className="bg-white dark:bg-zinc-900 border rounded-3xl overflow-hidden shadow-sm lg:col-span-1 flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-900/60 font-bold text-xs text-zinc-400 uppercase tracking-widest">
                    Active Helpdesk Tickets
                  </div>
                  {supportTickets.map(tkt => (
                    <button 
                      key={tkt.id}
                      onClick={() => {
                        alert(`Opening ticket ${tkt.id} details thread in main support panel.`);
                      }}
                      className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-850 text-left space-y-2 transition-all block w-full"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-[9px] text-zinc-400">{tkt.id} • {tkt.date}</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase font-mono ${
                          tkt.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                          tkt.priority === 'High' ? 'bg-amber-100 text-amber-800' :
                          'bg-zinc-100 text-zinc-800'
                        }`}>
                          {tkt.priority}
                        </span>
                      </div>
                      <h4 className="font-black text-xs text-zinc-900 dark:text-white line-clamp-1">{tkt.title}</h4>
                      <p className="text-[11px] text-zinc-400 line-clamp-2">{tkt.issue}</p>
                      <div className="flex items-center justify-between text-[10px] pt-1 border-t border-dashed border-zinc-100 dark:border-zinc-800">
                        <span className="font-bold text-zinc-600 dark:text-zinc-400 truncate max-w-[120px] font-sans">{tkt.customerName}</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase font-sans">{tkt.status}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Ticket thread preview */}
                <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between space-y-4">
                  <div>
                    <div className="border-b pb-3 flex justify-between items-center">
                      <div>
                        <span className="text-[9px] font-mono text-zinc-400">ACTIVE SESSION: TKT-102</span>
                        <h4 className="font-display font-black text-md text-zinc-900 dark:text-white">Illness Alert: Red Sokoto Sluggishness</h4>
                      </div>
                      <select className="px-2.5 py-1 text-[11px] border rounded-lg focus:outline-none bg-zinc-50 dark:bg-zinc-950 dark:border-zinc-800 font-bold">
                        <option>Assigned (Vet Dept)</option>
                        <option>Open Ticket</option>
                        <option>Resolved / Closed</option>
                      </select>
                    </div>

                    {/* Messages scroll */}
                    <div className="space-y-3 max-h-72 overflow-y-auto pt-4 text-xs">
                      <div className="p-3.5 bg-zinc-50 dark:bg-zinc-950 rounded-2xl max-w-[85%] self-start space-y-1">
                        <strong className="block text-zinc-900 dark:text-white">Chioma Obi (Customer)</strong>
                        <p className="text-zinc-500 leading-normal">My goat CPG-GT-2104 seems slightly sluggish today during range walk. Please advise what medicine or feed change you would advise.</p>
                      </div>

                      <div className="p-3.5 bg-emerald-50 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-100 rounded-2xl max-w-[85%] ml-auto space-y-1">
                        <strong className="block text-emerald-800 dark:text-emerald-400">Dr. Kenneth Okafor (Vet Dept)</strong>
                        <p className="leading-normal">Veterinarian Kenneth has been assigned. A skin/temperature swab will be taken at 8:00 AM tomorrow. We will isolate if temperature exceeds 39.5°C.</p>
                      </div>
                    </div>
                  </div>

                  {/* Reply input */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const target = e.target as HTMLFormElement;
                      const reply = (target.elements.namedItem('replyTxt') as HTMLInputElement).value;
                      if (!reply) return;
                      logAdminAction('Support Ticket Replied', 'Submitted veterinarian query resolution update.', 'success');
                      alert('Support reply appended and dispatched via SMS/Email to user!');
                      target.reset();
                    }}
                    className="flex gap-2 text-xs"
                  >
                    <input name="replyTxt" type="text" placeholder="Type diagnostic response, directive, or resolution details..." className="flex-1 px-4 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800 focus:outline-none" required />
                    <button type="submit" className="px-5 py-2 bg-zinc-950 hover:bg-zinc-900 text-white font-bold rounded-xl shadow-sm transition-colors">
                      Send Reply
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* ==================================== */}
          {/* TAB 20: STAFF MANAGEMENT (REWRITTEN) */}
          {/* ==================================== */}
          {adminTab === 'staff' && (
            <div className="space-y-6 animate-fade-in">
              {/* Main Header */}
              <div className="border-b border-zinc-150 dark:border-zinc-800 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="font-display font-extrabold text-lg text-zinc-900 dark:text-white">Staff Subsystems & Role Permissions</h3>
                  <p className="text-xs text-zinc-400 mt-1">Provision personnel access tokens, configure dynamic role privileges, and inspect live operational matrices.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingStaff(null);
                      setIsAddingStaff(true);
                    }}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-colors whitespace-nowrap"
                  >
                    <UserPlus className="h-4 w-4" />
                    Provision Staff
                  </button>
                  <button
                    onClick={() => {
                      setIsCreatingRole(true);
                    }}
                    className="px-3.5 py-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-850 text-zinc-800 dark:text-zinc-200 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors whitespace-nowrap"
                  >
                    <PlusCircle className="h-4 w-4 text-emerald-500" />
                    Create Custom Role
                  </button>
                </div>
              </div>

              {/* Sub-navigation Controls */}
              <div className="flex border-b border-zinc-200 dark:border-zinc-800">
                <button
                  onClick={() => setStaffSubTab('directory')}
                  className={`px-5 py-2.5 font-bold text-xs flex items-center gap-2 border-b-2 transition-all ${
                    staffSubTab === 'directory'
                      ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-black'
                      : 'border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  Staff Accounts Directory ({staffList.length})
                </button>
                <button
                  onClick={() => setStaffSubTab('roles')}
                  className={`px-5 py-2.5 font-bold text-xs flex items-center gap-2 border-b-2 transition-all ${
                    staffSubTab === 'roles'
                      ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-black'
                      : 'border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                >
                  <ShieldCheck className="h-4 w-4" />
                  Roles & Permission Matrices ({rolesConfig.length})
                </button>
              </div>

              {/* VIEW 1: STAFF DIRECTORY */}
              {staffSubTab === 'directory' && (
                <div className="space-y-4">
                  {/* Search and Filters */}
                  <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
                    <div className="relative w-full md:w-80">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="Search operators by name, email..."
                        value={staffSearch}
                        onChange={(e) => setStaffSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border dark:bg-zinc-950 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                      />
                    </div>

                    <div className="flex flex-wrap gap-3 w-full md:w-auto text-xs font-semibold">
                      <select
                        value={staffRoleFilter}
                        onChange={(e) => setStaffRoleFilter(e.target.value)}
                        className="px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                      >
                        <option value="all">All Roles</option>
                        {rolesConfig.map(r => (
                          <option key={r.name} value={r.name}>{r.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Staff Table Card */}
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-zinc-50/50 dark:bg-zinc-900/60 text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest border-b border-zinc-200 dark:border-zinc-800">
                            <th className="p-4 pl-6">Operator Identity</th>
                            <th className="p-4">Staff Email ID</th>
                            <th className="p-4">Assigned Cryptographic Role</th>
                            <th className="p-4">System Status</th>
                            <th className="p-4 text-right pr-6">Access Control</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-150 dark:divide-zinc-800">
                          {staffList
                            .filter(staff => {
                              const matchesSearch = staff.fullName.toLowerCase().includes(staffSearch.toLowerCase()) ||
                                staff.email.toLowerCase().includes(staffSearch.toLowerCase());
                              const matchesRole = staffRoleFilter === 'all' || staff.role === staffRoleFilter;
                              return matchesSearch && matchesRole;
                            })
                            .map(staff => {
                              const staffStatus = staff.status || 'Active';
                              return (
                                <tr key={staff.id} className="hover:bg-zinc-50/30 dark:hover:bg-zinc-950/20">
                                  <td className="p-4 pl-6">
                                    <div className="flex items-center gap-3">
                                      <div className="h-9 w-9 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-xs shadow-xs border border-emerald-200 dark:border-emerald-900/40">
                                        {staff.fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                                      </div>
                                      <div>
                                        <strong className="text-sm font-black text-zinc-950 dark:text-white block">{staff.fullName}</strong>
                                        <span className="text-zinc-400 block font-mono text-[9px]">ID: {staff.id}</span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-4 font-mono text-zinc-600 dark:text-zinc-400">{staff.email}</td>
                                  <td className="p-4 font-sans">
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase font-mono border ${
                                      staff.role === 'Super Admin' ? 'bg-red-50 text-red-800 border-red-150 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30' :
                                      staff.role === 'Farm Manager' ? 'bg-amber-50 text-amber-800 border-amber-150 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30' :
                                      staff.role === 'Veterinarian' ? 'bg-indigo-50 text-indigo-800 border-indigo-150 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30' :
                                      staff.role === 'Finance Officer' ? 'bg-emerald-50 text-emerald-800 border-emerald-150 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30' :
                                      'bg-zinc-50 text-zinc-800 border-zinc-150 dark:bg-zinc-850 dark:text-zinc-400 dark:border-zinc-800'
                                    }`}>
                                      {staff.role}
                                    </span>
                                  </td>
                                  <td className="p-4 font-sans">
                                    <div className="flex items-center gap-1.5">
                                      <span className={`h-2 w-2 rounded-full inline-block ${
                                        staffStatus === 'Active' ? 'bg-emerald-500' :
                                        staffStatus === 'Suspended' ? 'bg-red-500' : 'bg-zinc-400'
                                      }`} />
                                      <span className="font-mono text-zinc-500 font-bold">{staffStatus}</span>
                                    </div>
                                  </td>
                                  <td className="p-4 text-right pr-6 space-x-2 font-sans whitespace-nowrap">
                                    <button
                                      onClick={() => {
                                        setEditingStaff(staff);
                                        setIsAddingStaff(true);
                                      }}
                                      className="px-2.5 py-1 border hover:bg-zinc-50 dark:hover:bg-zinc-850 text-zinc-700 dark:text-zinc-300 rounded-lg text-[10px] font-bold transition-colors"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (confirm(`Deactivate access keys for ${staff.fullName}? This will immediately terminate all active sessions.`)) {
                                          setStaffList(staffList.filter(s => s.id !== staff.id));
                                          logAdminAction('Operator De-provisioned', `Revoked system API keys and credential profiles for ${staff.fullName}`, 'danger');
                                        }
                                      }}
                                      className="px-2 py-1 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400 rounded-lg text-[10px] font-bold transition-colors"
                                    >
                                      Revoke Access
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW 2: ROLES & PERMISSION MATRICES */}
              {staffSubTab === 'roles' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Roles Cards */}
                  <div className="space-y-4">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Available System Roles</span>
                    <div className="space-y-3">
                      {rolesConfig.map(role => {
                        const isSelected = selectedRoleForEdit === role.name;
                        return (
                          <div
                            key={role.name}
                            onClick={() => setSelectedRoleForEdit(role.name)}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                              isSelected
                                ? 'bg-zinc-950 text-white border-zinc-950 shadow-md dark:bg-zinc-800 dark:border-zinc-750'
                                : 'bg-white text-zinc-600 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <h4 className="font-display font-black text-xs">{role.name}</h4>
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-black ${
                                isSelected 
                                  ? 'bg-emerald-500 text-white' 
                                  : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800'
                              }`}>
                                {Object.values(role.permissions).filter(Boolean).length} / 6 Privileges
                              </span>
                            </div>
                            <p className={`text-[10px] mt-1 line-clamp-2 leading-relaxed ${isSelected ? 'text-zinc-300' : 'text-zinc-400'}`}>
                              {role.description}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Permission Matrix Matrix Editor */}
                  <div className="lg:col-span-2 space-y-4">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Configure Subsystem Privileges</span>
                    
                    {(() => {
                      const activeRoleObj = rolesConfig.find(r => r.name === selectedRoleForEdit);
                      if (!activeRoleObj) return null;
                      const isSuperAdmin = activeRoleObj.name === 'Super Admin';

                      return (
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-6">
                          <div className="flex justify-between items-start border-b border-zinc-100 dark:border-zinc-800 pb-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-emerald-500 shrink-0" />
                                <h4 className="font-display font-black text-md text-zinc-950 dark:text-white">{activeRoleObj.name} Privilege Keys</h4>
                              </div>
                              <p className="text-xs text-zinc-400 mt-1">{activeRoleObj.description}</p>
                            </div>
                          </div>

                          {isSuperAdmin && (
                            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-4 rounded-2xl flex gap-3 text-[11px] text-red-800 dark:text-red-400">
                              <Lock className="h-5 w-5 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                              <div>
                                <strong className="font-bold">Irrevocable Safe Mode</strong>
                                <p className="mt-0.5 leading-normal">
                                  Super Admin credentials hold hardcoded cryptographic access keys. These permissions cannot be disabled to prevent administrator self-lockout or total platform paralysis.
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Permissions Checkbox Stack */}
                          <div className="space-y-4">
                            {Object.entries(activeRoleObj.permissions).map(([permName, isGranted]) => {
                              const pKey = permName as keyof StaffPermissionSet;
                              let label = '';
                              let desc = '';
                              if (pKey === 'viewMetrics') {
                                label = 'View Core Dashboard & Metrics';
                                desc = 'Grants view-only clearance to financial charts, performance metrics, and livestock status counts.';
                              } else if (pKey === 'manageLivestock') {
                                label = 'Manage Herd & Clinical Procedures';
                                desc = 'Grants clearance to register livestock, update weight biometrics, log feed bags consumed, and authorize vaccines.';
                              } else if (pKey === 'manageCustomers') {
                                label = 'Manage Customers & Verify KYC';
                                desc = 'Grants clearance to view customer profiles, write internal file notes, and audit uploaded KYC identity documents.';
                              } else if (pKey === 'manageFinance') {
                                label = 'Manage Feed Packages & Financials';
                                desc = 'Grants clearance to adjust package pricing tiers, bulk-assign feeding tiers to herds, and process meat supply order invoices.';
                              } else if (pKey === 'manageStaff') {
                                label = 'Manage Staff Credentials & Security';
                                desc = 'Grants clearance to provision operators, edit active staff profiles, revoke keys, and alter permission matrices.';
                              } else if (pKey === 'editCMS') {
                                label = 'Edit Public Website CMS';
                                desc = 'Grants clearance to adjust landing page hero text headers, SEO descriptions, and phone/email contact information.';
                              }

                              return (
                                <div
                                  key={permName}
                                  className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${
                                    isGranted 
                                      ? 'bg-emerald-50/20 border-emerald-200/50 dark:bg-emerald-950/5 dark:border-emerald-900/20' 
                                      : 'bg-zinc-50/50 border-zinc-150 dark:bg-zinc-950/20 dark:border-zinc-850'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isGranted}
                                    disabled={isSuperAdmin}
                                    onChange={(e) => {
                                      const updatedRoles = rolesConfig.map(r => {
                                        if (r.name === activeRoleObj.name) {
                                          return {
                                            ...r,
                                            permissions: {
                                              ...r.permissions,
                                              [pKey]: e.target.checked
                                            }
                                          };
                                        }
                                        return r;
                                      });
                                      setRolesConfig(updatedRoles);
                                      logAdminAction(
                                        'Privilege Adjusted',
                                        `Set "${label}" to ${e.target.checked ? 'ENABLED' : 'DISABLED'} for role "${activeRoleObj.name}".`,
                                        e.target.checked ? 'success' : 'warning'
                                      );
                                    }}
                                    className="mt-1 h-4.5 w-4.5 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 disabled:opacity-50 cursor-pointer"
                                  />
                                  <div>
                                    <span className="font-bold text-zinc-900 dark:text-white block text-xs">{label}</span>
                                    <p className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed">{desc}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* MODAL: ADD / EDIT STAFF */}
              {isAddingStaff && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-scale-up">
                    <div className="p-6 border-b border-zinc-150 dark:border-zinc-800 flex justify-between items-center">
                      <h3 className="font-display font-black text-md text-zinc-950 dark:text-white flex items-center gap-2">
                        <UserCheck className="h-5 w-5 text-emerald-500" />
                        {editingStaff ? `Modify Operator: ${editingStaff.fullName}` : 'Provision Operator Credentials'}
                      </h3>
                      <button
                        onClick={() => {
                          setIsAddingStaff(false);
                          setEditingStaff(null);
                        }}
                        className="h-7 w-7 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 flex items-center justify-center transition-colors"
                      >
                        <X className="h-4 w-4 text-zinc-500" />
                      </button>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const fullName = formData.get('fullName') as string;
                        const email = formData.get('email') as string;
                        const role = formData.get('role') as string;
                        const status = formData.get('status') as string;

                        if (editingStaff) {
                          setStaffList(staffList.map(s => s.id === editingStaff.id ? {
                            ...s,
                            fullName,
                            email,
                            role,
                            status
                          } : s));
                          logAdminAction('Operator Profile Updated', `Modified credentials for ${fullName} as "${role}" (${status}).`, 'success');
                        } else {
                          const newStaff = {
                            id: `stf-${Date.now()}`,
                            fullName,
                            email,
                            role,
                            status
                          };
                          setStaffList([...staffList, newStaff]);
                          logAdminAction('Operator Provisioned', `Authorized access keys for ${fullName} in "${role}" department.`, 'success');
                        }

                        setIsAddingStaff(false);
                        setEditingStaff(null);
                        alert('Personnel configuration credentials applied!');
                      }}
                      className="p-6 space-y-4 text-xs"
                    >
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Operator Full Name</label>
                        <input
                          name="fullName"
                          type="text"
                          required
                          placeholder="e.g. Dr. Yusuf Alabi"
                          defaultValue={editingStaff?.fullName || ''}
                          className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800 font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Staff Corporate Email Address</label>
                        <input
                          name="email"
                          type="email"
                          required
                          placeholder="e.g. yusuf.a@cowplug.ng"
                          defaultValue={editingStaff?.email || ''}
                          className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800 font-mono text-zinc-800 dark:text-zinc-200"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Assigned Cryptographic Role</label>
                        <select
                          name="role"
                          defaultValue={editingStaff?.role || rolesConfig[2]?.name || 'Veterinarian'}
                          className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800 font-bold"
                        >
                          {rolesConfig.map(r => (
                            <option key={r.name} value={r.name}>{r.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Personnel Token Status</label>
                        <select
                          name="status"
                          defaultValue={editingStaff?.status || 'Active'}
                          className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800 font-bold"
                        >
                          <option value="Active">Active (Clearance Valid)</option>
                          <option value="Suspended">Suspended (Access Revoked)</option>
                          <option value="On Leave">On Leave (Temporary Lock)</option>
                        </select>
                      </div>

                      <div className="flex justify-end gap-3 pt-3 border-t dark:border-zinc-800">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingStaff(false);
                            setEditingStaff(null);
                          }}
                          className="px-4 py-2 border hover:bg-zinc-50 dark:hover:bg-zinc-850 rounded-xl font-bold transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md transition-colors"
                        >
                          Authorize Operator
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* MODAL: CREATE CUSTOM ROLE */}
              {isCreatingRole && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-scale-up">
                    <div className="p-6 border-b border-zinc-150 dark:border-zinc-800 flex justify-between items-center">
                      <h3 className="font-display font-black text-md text-zinc-950 dark:text-white flex items-center gap-2">
                        <Shield className="h-5 w-5 text-emerald-500" />
                        Create Custom Subsystem Role
                      </h3>
                      <button
                        onClick={() => setIsCreatingRole(false)}
                        className="h-7 w-7 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 flex items-center justify-center transition-colors"
                      >
                        <X className="h-4 w-4 text-zinc-500" />
                      </button>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const name = formData.get('roleName') as string;
                        const description = formData.get('roleDescription') as string;

                        // Check uniqueness
                        if (rolesConfig.some(r => r.name.toLowerCase() === name.toLowerCase())) {
                          alert(`A role named "${name}" already exists.`);
                          return;
                        }

                        const newRole: StaffRoleConfig = {
                          name,
                          description,
                          permissions: {
                            viewMetrics: false,
                            manageLivestock: false,
                            manageCustomers: false,
                            manageFinance: false,
                            manageStaff: false,
                            editCMS: false
                          }
                        };

                        setRolesConfig([...rolesConfig, newRole]);
                        setSelectedRoleForEdit(name);
                        setStaffSubTab('roles');
                        logAdminAction('Custom Role Built', `Created customized security blueprint for "${name}" with zero initial privileges.`, 'success');
                        setIsCreatingRole(false);
                        alert(`Custom role "${name}" established. Please configure its permissions inside the configuration matrix.`);
                      }}
                      className="p-6 space-y-4 text-xs"
                    >
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Role Identifier Name</label>
                        <input
                          name="roleName"
                          type="text"
                          required
                          placeholder="e.g. Field Inspector"
                          className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800 font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Subsystem Operational Description</label>
                        <textarea
                          name="roleDescription"
                          required
                          rows={3}
                          placeholder="e.g. Reviews body condition scores, photographs herds, and logs quarantine intake checklists."
                          className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800"
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-3 border-t dark:border-zinc-800">
                        <button
                          type="button"
                          onClick={() => setIsCreatingRole(false)}
                          className="px-4 py-2 border hover:bg-zinc-50 dark:hover:bg-zinc-850 rounded-xl font-bold transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md transition-colors"
                        >
                          Build Role
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================================== */}
          {/* TAB 21: WEBSITE CMS */}
          {/* ==================================== */}
          {adminTab === 'cms' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b pb-4">
                <h3 className="font-display font-extrabold text-lg text-zinc-900 dark:text-white">Website CMS (Content Management System)</h3>
                <p className="text-xs text-zinc-400 mt-1">Modify landing page hero copies, corporate missions, contact numbers, and SEO metadata instantly.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* CMS Form */}
                <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                  <h4 className="font-display font-black text-sm text-zinc-900 dark:text-white">Landing Page Copy Controls</h4>
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      logAdminAction('CMS Published Live', 'Pushed live landing page text copy adjustments to edge nodes.', 'success');
                      alert('Website CMS updates published successfully! Changes will reflect on public portal immediately.');
                    }}
                    className="space-y-4 text-xs"
                  >
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Landing Page Hero Title</label>
                      <input 
                        type="text" 
                        value={cmsContent.heroTitle}
                        onChange={(e) => setCmsContent({ ...cmsContent, heroTitle: e.target.value })}
                        className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800 font-bold" 
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Landing Page Hero Subtitle Paragraph</label>
                      <textarea 
                        rows={3}
                        value={cmsContent.heroSubtitle}
                        onChange={(e) => setCmsContent({ ...cmsContent, heroSubtitle: e.target.value })}
                        className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800" 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Cooperative Vision Statement</label>
                        <input 
                          type="text" 
                          value={cmsContent.vision}
                          onChange={(e) => setCmsContent({ ...cmsContent, vision: e.target.value })}
                          className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800" 
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Cooperative Mission Statement</label>
                        <input 
                          type="text" 
                          value={cmsContent.mission}
                          onChange={(e) => setCmsContent({ ...cmsContent, mission: e.target.value })}
                          className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Support Contact Hotline</label>
                        <input 
                          type="text" 
                          value={cmsContent.contactPhone}
                          onChange={(e) => setCmsContent({ ...cmsContent, contactPhone: e.target.value })}
                          className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800 font-mono" 
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">SEO Search Meta Description</label>
                        <input 
                          type="text" 
                          value={cmsContent.seoMetaDescription}
                          onChange={(e) => setCmsContent({ ...cmsContent, seoMetaDescription: e.target.value })}
                          className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800" 
                        />
                      </div>
                    </div>

                    <button type="submit" className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-colors">
                      Publish Website Live CMS Changes
                    </button>
                  </form>
                </div>

                {/* Preview Box */}
                <div className="bg-zinc-100 dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                  <div className="space-y-4">
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 font-mono font-black uppercase px-2 py-0.5 rounded">Live Frontend Rendering Preview</span>
                    <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border space-y-3">
                      <h1 className="font-display font-black text-xs text-zinc-950 dark:text-white leading-normal">{cmsContent.heroTitle}</h1>
                      <p className="text-[10px] text-zinc-400 leading-relaxed">{cmsContent.heroSubtitle}</p>
                      <div className="border-t border-dashed pt-2 space-y-1">
                        <span className="text-[9px] block text-zinc-500 font-mono">VISION: {cmsContent.vision}</span>
                        <span className="text-[9px] block text-zinc-500 font-mono">PHONE: {cmsContent.contactPhone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 text-[10px] text-zinc-400 leading-normal">
                    This live preview container renders real-time changes immediately so administrators can audit layout text wrapping before compiling edge client builds.
                  </div>
                </div>
              </div>

              {/* MARKET RATES & FEED RATES MANAGEMENT SECTION */}
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6 mt-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4 border-zinc-150 dark:border-zinc-850">
                  <div>
                    <h4 className="font-display font-black text-sm text-zinc-900 dark:text-white">Live Market Ticker Content Manager</h4>
                    <p className="text-xs text-zinc-500 mt-1">Configure real-time livestock prices and feed product costs displayed on the landing page ticker bar.</p>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2.5 py-1 rounded-full animate-pulse">
                    🟢 Live Synchronization Active
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* LIVESTOCK RATES CONTROLS */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h5 className="font-display font-bold text-xs text-zinc-800 dark:text-zinc-200 uppercase tracking-wide">🐂 Livestock Market Rates</h5>
                      <span className="text-[10px] font-bold text-zinc-400 font-mono">{livestockRates.length} active rates</span>
                    </div>

                    {/* Rates Table / List */}
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {livestockRates.map((rate: any) => (
                        <div key={rate.id} className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-150 dark:border-zinc-850 flex items-center justify-between text-xs">
                          {editingLiveRateId === rate.id ? (
                            <div className="flex-1 grid grid-cols-3 gap-2 mr-2">
                              <input 
                                type="text"
                                value={editingLiveRate.name}
                                onChange={(e) => setEditingLiveRate({ ...editingLiveRate, name: e.target.value })}
                                className="px-2 py-1 border rounded dark:bg-zinc-900 dark:border-zinc-800 font-bold text-[11px]"
                                placeholder="Breed name"
                              />
                              <input 
                                type="text"
                                value={editingLiveRate.price}
                                onChange={(e) => setEditingLiveRate({ ...editingLiveRate, price: e.target.value })}
                                className="px-2 py-1 border rounded dark:bg-zinc-900 dark:border-zinc-800 font-mono font-bold text-[11px]"
                                placeholder="Price"
                              />
                              <input 
                                type="text"
                                value={editingLiveRate.change}
                                onChange={(e) => setEditingLiveRate({ ...editingLiveRate, change: e.target.value })}
                                className="px-2 py-1 border rounded dark:bg-zinc-900 dark:border-zinc-800 font-mono text-[11px]"
                                placeholder="Change %"
                              />
                            </div>
                          ) : (
                            <div className="flex-1 flex justify-between mr-4">
                              <span className="font-bold text-zinc-800 dark:text-zinc-200">{rate.name}</span>
                              <div className="space-x-2">
                                <span className="font-mono font-bold text-zinc-900 dark:text-white">{rate.price}</span>
                                <span className={`font-mono font-bold ${rate.change.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>{rate.change}</span>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center space-x-1.5 shrink-0">
                            {editingLiveRateId === rate.id ? (
                              <>
                                <button 
                                  onClick={() => {
                                    setLivestockRates(livestockRates.map((r: any) => r.id === rate.id ? { ...r, ...editingLiveRate } : r));
                                    setEditingLiveRateId(null);
                                    logAdminAction('Livestock Rate Edited', `Modified price details for ${editingLiveRate.name}.`, 'success');
                                  }}
                                  className="p-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                                  title="Save"
                                >
                                  <Check className="h-3 w-3" />
                                </button>
                                <button 
                                  onClick={() => setEditingLiveRateId(null)}
                                  className="p-1.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded hover:bg-zinc-300"
                                  title="Cancel"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button 
                                  onClick={() => {
                                    setEditingLiveRateId(rate.id);
                                    setEditingLiveRate({ name: rate.name, price: rate.price, change: rate.change });
                                  }}
                                  className="p-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded"
                                  title="Edit"
                                >
                                  <Edit3 className="h-3 w-3" />
                                </button>
                                <button 
                                  onClick={() => {
                                    if(confirm(`Are you sure you want to delete ${rate.name} rate?`)) {
                                      setLivestockRates(livestockRates.filter((r: any) => r.id !== rate.id));
                                      logAdminAction('Livestock Rate Deleted', `Removed rate for ${rate.name}.`, 'warning');
                                    }
                                  }}
                                  className="p-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/40 text-rose-600 rounded"
                                  title="Delete"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add New Rate Form */}
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 space-y-2 text-xs">
                      <span className="font-bold text-[10px] text-zinc-400 uppercase tracking-wide">Add New Livestock Rate</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input 
                          type="text"
                          placeholder="Breed e.g. Ouda Sheep"
                          value={newLiveRate.name}
                          onChange={(e) => setNewLiveRate({ ...newLiveRate, name: e.target.value })}
                          className="px-2.5 py-1.5 border rounded-lg dark:bg-zinc-900 dark:border-zinc-800 text-[11px]"
                        />
                        <input 
                          type="text"
                          placeholder="Price e.g. ₦120,000"
                          value={newLiveRate.price}
                          onChange={(e) => setNewLiveRate({ ...newLiveRate, price: e.target.value })}
                          className="px-2.5 py-1.5 border rounded-lg dark:bg-zinc-900 dark:border-zinc-800 font-mono text-[11px]"
                        />
                        <input 
                          type="text"
                          placeholder="Change e.g. +3.5%"
                          value={newLiveRate.change}
                          onChange={(e) => setNewLiveRate({ ...newLiveRate, change: e.target.value })}
                          className="px-2.5 py-1.5 border rounded-lg dark:bg-zinc-900 dark:border-zinc-800 font-mono text-[11px]"
                        />
                      </div>
                      <button 
                        onClick={() => {
                          if (!newLiveRate.name || !newLiveRate.price) {
                            alert('Please fill in breed name and price!');
                            return;
                          }
                          const newRateObj = {
                            id: Date.now().toString(),
                            name: newLiveRate.name,
                            price: newLiveRate.price,
                            change: newLiveRate.change || '+0.0%'
                          };
                          setLivestockRates([...livestockRates, newRateObj]);
                          setNewLiveRate({ name: '', price: '', change: '+0.0%' });
                          logAdminAction('Livestock Rate Added', `Added rate for ${newRateObj.name}.`, 'success');
                        }}
                        className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors text-[11px]"
                      >
                        + Add Livestock Rate to Ticker
                      </button>
                    </div>
                  </div>

                  {/* FEED RATES CONTROLS */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h5 className="font-display font-bold text-xs text-zinc-800 dark:text-zinc-200 uppercase tracking-wide">🌾 Feed Market Rates</h5>
                      <span className="text-[10px] font-bold text-zinc-400 font-mono">{feedRates.length} active rates</span>
                    </div>

                    {/* Feed Rates List */}
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {feedRates.map((rate: any) => (
                        <div key={rate.id} className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-150 dark:border-zinc-850 flex items-center justify-between text-xs">
                          {editingFeedRateId === rate.id ? (
                            <div className="flex-1 grid grid-cols-3 gap-2 mr-2">
                              <input 
                                type="text"
                                value={editingFeedRate.name}
                                onChange={(e) => setEditingFeedRate({ ...editingFeedRate, name: e.target.value })}
                                className="px-2 py-1 border rounded dark:bg-zinc-900 dark:border-zinc-800 font-bold text-[11px]"
                                placeholder="Feed product name"
                              />
                              <input 
                                type="text"
                                value={editingFeedRate.price}
                                onChange={(e) => setEditingFeedRate({ ...editingFeedRate, price: e.target.value })}
                                className="px-2 py-1 border rounded dark:bg-zinc-900 dark:border-zinc-800 font-mono font-bold text-[11px]"
                                placeholder="Price"
                              />
                              <input 
                                type="text"
                                value={editingFeedRate.change}
                                onChange={(e) => setEditingFeedRate({ ...editingFeedRate, change: e.target.value })}
                                className="px-2 py-1 border rounded dark:bg-zinc-900 dark:border-zinc-800 font-mono text-[11px]"
                                placeholder="Change %"
                              />
                            </div>
                          ) : (
                            <div className="flex-1 flex justify-between mr-4">
                              <span className="font-bold text-zinc-800 dark:text-zinc-200">{rate.name}</span>
                              <div className="space-x-2">
                                <span className="font-mono font-bold text-zinc-900 dark:text-white">{rate.price}</span>
                                <span className={`font-mono font-bold ${rate.change.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>{rate.change}</span>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center space-x-1.5 shrink-0">
                            {editingFeedRateId === rate.id ? (
                              <>
                                <button 
                                  onClick={() => {
                                    setFeedRates(feedRates.map((r: any) => r.id === rate.id ? { ...r, ...editingFeedRate } : r));
                                    setEditingFeedRateId(null);
                                    logAdminAction('Feed Rate Edited', `Modified price details for ${editingFeedRate.name}.`, 'success');
                                  }}
                                  className="p-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                                  title="Save"
                                >
                                  <Check className="h-3 w-3" />
                                </button>
                                <button 
                                  onClick={() => setEditingFeedRateId(null)}
                                  className="p-1.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded hover:bg-zinc-300"
                                  title="Cancel"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button 
                                  onClick={() => {
                                    setEditingFeedRateId(rate.id);
                                    setEditingFeedRate({ name: rate.name, price: rate.price, change: rate.change });
                                  }}
                                  className="p-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded"
                                  title="Edit"
                                >
                                  <Edit3 className="h-3 w-3" />
                                </button>
                                <button 
                                  onClick={() => {
                                    if(confirm(`Are you sure you want to delete ${rate.name} rate?`)) {
                                      setFeedRates(feedRates.filter((r: any) => r.id !== rate.id));
                                      logAdminAction('Feed Rate Deleted', `Removed rate for ${rate.name}.`, 'warning');
                                    }
                                  }}
                                  className="p-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/40 text-rose-600 rounded"
                                  title="Delete"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add New Feed Rate Form */}
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 space-y-2 text-xs">
                      <span className="font-bold text-[10px] text-zinc-400 uppercase tracking-wide">Add New Feed Rate</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input 
                          type="text"
                          placeholder="Feed e.g. Wheat Bran"
                          value={newFeedRate.name}
                          onChange={(e) => setNewFeedRate({ ...newFeedRate, name: e.target.value })}
                          className="px-2.5 py-1.5 border rounded-lg dark:bg-zinc-900 dark:border-zinc-800 text-[11px]"
                        />
                        <input 
                          type="text"
                          placeholder="Price e.g. ₦18,200"
                          value={newFeedRate.price}
                          onChange={(e) => setNewFeedRate({ ...newFeedRate, price: e.target.value })}
                          className="px-2.5 py-1.5 border rounded-lg dark:bg-zinc-900 dark:border-zinc-800 font-mono text-[11px]"
                        />
                        <input 
                          type="text"
                          placeholder="Change e.g. +1.2%"
                          value={newFeedRate.change}
                          onChange={(e) => setNewFeedRate({ ...newFeedRate, change: e.target.value })}
                          className="px-2.5 py-1.5 border rounded-lg dark:bg-zinc-900 dark:border-zinc-800 font-mono text-[11px]"
                        />
                      </div>
                      <button 
                        onClick={() => {
                          if (!newFeedRate.name || !newFeedRate.price) {
                            alert('Please fill in feed name and price!');
                            return;
                          }
                          const newRateObj = {
                            id: Date.now().toString(),
                            name: newFeedRate.name,
                            price: newFeedRate.price,
                            change: newFeedRate.change || '+0.0%'
                          };
                          setFeedRates([...feedRates, newRateObj]);
                          setNewFeedRate({ name: '', price: '', change: '+0.0%' });
                          logAdminAction('Feed Rate Added', `Added rate for ${newRateObj.name}.`, 'success');
                        }}
                        className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors text-[11px]"
                      >
                        + Add Feed Rate to Ticker
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================================== */}
          {/* TAB 22: PLATFORM GOVERNANCE */}
          {/* ==================================== */}
          {adminTab === 'settings' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b pb-4">
                <h3 className="font-display font-extrabold text-lg text-zinc-900 dark:text-white">Platform Governance & Security Settings</h3>
                <p className="text-xs text-zinc-400 mt-1">Configure telemetry frequencies, API access tokens, multi-sig limits, and audit login events.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Security Parameters Form */}
                  <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                    <h4 className="font-display font-black text-sm text-zinc-900 dark:text-white">Enterprise Cryptographic Configurations</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">RFID Heartbeat Frequency</label>
                        <select className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800 font-bold">
                          <option>Every 5 Minutes (Optimal Battery)</option>
                          <option>Every 1 Hour (Extended Battery)</option>
                          <option>Real-time (Active Tracking)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Admin Session Absolute Timeout</label>
                        <select className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800 font-bold">
                          <option>15 Minutes (High Security)</option>
                          <option>1 Hour (Standard)</option>
                          <option>8 Hours (Developer Sandbox)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Automated Cold Database Backup</label>
                        <select className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800 font-bold">
                          <option>Every 24 Hours (Daily Snapshot)</option>
                          <option>Every 7 Days (Weekly)</option>
                          <option>Continuous Streaming Replication</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Payment Escrow Settlement Limit</label>
                        <select className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800 font-bold">
                          <option>T+2 Days (Standard Bank Auditing)</option>
                          <option>T+0 Instant (High Liquidity)</option>
                        </select>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        logAdminAction('Security Settings Hardened', 'Saved hardened system parameters and rotated API keys.', 'success');
                        alert('Platform security parameters updated successfully! Key rotation complete.');
                      }}
                      className="px-6 py-2.5 bg-zinc-950 hover:bg-zinc-900 text-white font-bold rounded-xl shadow-md transition-colors text-xs"
                    >
                      Apply Global Governance Rules
                    </button>
                  </div>

                  {/* Device History Table */}
                  <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                    <div>
                      <h4 className="font-display font-black text-sm text-zinc-900 dark:text-white">Authorized Device Login Sessions</h4>
                      <p className="text-[11px] text-zinc-400">Review IP addresses, browser agents, and recent login timestamps to confirm authorized access.</p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs font-mono">
                        <thead>
                          <tr className="bg-zinc-50 dark:bg-zinc-900/60 text-[9px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest border-b border-zinc-200 dark:border-zinc-800">
                            <th className="p-3">IP Address</th>
                            <th className="p-3">Browser/Platform Agent</th>
                            <th className="p-3">Date Timestamp</th>
                            <th className="p-3 text-right">Geographic Zone</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-150 dark:divide-zinc-800 text-[10px]">
                          {deviceHistory.map(dev => (
                            <tr key={dev.id}>
                              <td className="p-3 text-zinc-900 dark:text-white font-bold">{dev.ip}</td>
                              <td className="p-3 text-zinc-500 font-sans">{dev.browser}</td>
                              <td className="p-3 text-zinc-400">{dev.date}</td>
                              <td className="p-3 text-right text-zinc-700 dark:text-zinc-300 font-bold font-sans">{dev.location}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Right hand quick backup manual card */}
                <div className="bg-emerald-950 text-white p-6 rounded-3xl shadow-sm flex flex-col justify-between h-fit space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-display font-black text-xs uppercase tracking-wider text-emerald-400">Manual Disaster Backup</h4>
                    <p className="text-[11px] text-emerald-200/80 leading-relaxed">Instantly force a cryptographic cold snapshot of all user accounts, active livestock RFID positions, and institutional invoices to Oyo Silo redundant offline backups.</p>
                    
                    <button 
                      onClick={() => {
                        alert('Initializing manual full backup snapshot... Cryptographic validation: SUCCESS. Snapshot block 98213 written to backup Oyo storage.');
                        logAdminAction('Manual Snapshot Generated', 'Forced manual cold backup snapshot of user states.', 'success');
                      }}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
                    >
                      Force Cold Backup Snapshot
                    </button>
                  </div>

                  <div className="text-[10px] text-emerald-300 leading-normal font-sans">
                    This offline copy is encrypted using AES-256 for maximum security and compliance with CowPlug tech safety guarantees.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================================== */}
          {/* TAB: PACKAGES MANAGEMENT (NEW) */}
          {/* ==================================== */}
          {adminTab === 'packages' && (
            <div className="space-y-6 animate-fade-in" id="package-management-control-center">
              
              {/* Control Center Header */}
              <div className="border-b border-zinc-150 dark:border-zinc-800 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="font-display font-black text-xl text-zinc-950 dark:text-white flex items-center gap-2">
                    <Sliders className="h-5 w-5 text-emerald-600" />
                    Package Management Control Center
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Complete administrative system to configure pricing, feature rules, cohort eligibility, billing, discounts, and real-time simulations.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2.5">
                  <button 
                    onClick={() => setIsGlobalSettingsOpen(!isGlobalSettingsOpen)}
                    className="px-3 py-2 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-850 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
                  >
                    <Settings className="h-4 w-4" />
                    Global Settings {isGlobalSettingsOpen ? '▲' : '▼'}
                  </button>
                  <button 
                    onClick={() => {
                      setEditingPackage(null);
                      setIsAddingPackage(true);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all whitespace-nowrap"
                  >
                    <Plus className="h-4 w-4" />
                    Create Custom Package
                  </button>
                </div>
              </div>

              {/* Customer Visibility Rules Visual Notice */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-zinc-950 dark:to-orange-950/20 p-4 rounded-2xl border border-amber-200/60 dark:border-orange-900/30 flex items-start gap-3 shadow-xs">
                <span className="text-xl leading-none shrink-0 mt-0.5">⚠️</span>
                <div className="text-xs">
                  <h4 className="font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider mb-0.5">Package Visibility & Marketplace Rules</h4>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    Only pricing packages with an <span className="font-bold text-emerald-600 dark:text-emerald-400">"Active"</span> status are visible and available for customers to purchase in the marketplace. Packages with <span className="font-semibold text-zinc-500">"Inactive"</span>, <span className="font-semibold text-zinc-500">"Draft"</span>, or <span className="font-semibold text-zinc-500">"Archived"</span> statuses are fully hidden from the public client interface; however, existing subscribers remain safely enrolled on them until manually migrated.
                  </p>
                </div>
              </div>

              {/* Animal Category Tabs Switcher */}
              <div className="border-b border-zinc-150 dark:border-zinc-800 pb-px flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1.5" role="tablist">
                  {animalTypes.map((type) => {
                    const isActive = selectedAnimalTab === type;
                    const count = pricingPackages.filter(p => (p.animalType || '').toLowerCase() === type.toLowerCase()).length;
                    return (
                      <button
                        key={type}
                        onClick={() => setSelectedAnimalTab(type)}
                        role="tab"
                        aria-selected={isActive}
                        className={`px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 border transition-all ${
                          isActive
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                            : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-850'
                        }`}
                      >
                        <span className="text-sm leading-none">{getSpeciesIcon(type)}</span>
                        <span>{type} Packages</span>
                        <span className={`px-1.5 py-0.5 text-[9px] rounded-full font-mono ${isActive ? 'bg-emerald-750 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={handleAddAnimalType}
                    className="px-3.5 py-2.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-dashed border-emerald-300 dark:border-emerald-800 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/20 flex items-center gap-1.5 transition-all"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Animal Type
                  </button>
                </div>

                <div className="text-[10px] text-zinc-400 font-medium">
                  Currently Managing: <span className="font-bold text-zinc-850 dark:text-zinc-200">{selectedAnimalTab}</span> configs
                </div>
              </div>

              {/* Performance Breakdown Dashboard Summary for selected animal category */}
              {(() => {
                const selectedTypeLower = selectedAnimalTab.toLowerCase();
                const animalCategoryPackages = pricingPackages.filter(p => (p.animalType || '').toLowerCase() === selectedTypeLower);
                
                const activePackagesCount = animalCategoryPackages.filter(p => p.status === 'Active').length;
                const inactivePackagesCount = animalCategoryPackages.filter(p => p.status && p.status !== 'Active').length;
                
                const enrolledAnimals = farmerLivestock.filter(animal => (animal.category || '').toLowerCase() === selectedTypeLower);
                const enrolledAnimalsCount = enrolledAnimals.length;
                
                const uniqueOwners = Array.from(new Set(enrolledAnimals.map(a => a.ownersName).filter(Boolean)));
                const activeCustomersCount = uniqueOwners.length;
                
                const tabRevenue = animalCategoryPackages.reduce((acc, p) => {
                  const count = enrolledAnimals.filter(a => a.feedingPlan === p.name).length;
                  return acc + (count * ((p.feedPrice || 0) + (p.managementFee || 15000)));
                }, 0);

                return (
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-800 shadow-xs">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Active Packages</span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <strong className="text-xl font-display font-black text-zinc-950 dark:text-white">
                          {activePackagesCount}
                        </strong>
                        <span className="text-[10px] text-zinc-400">/ {animalCategoryPackages.length} total</span>
                      </div>
                      <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold block mt-1">● Visible to public</span>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-800 shadow-xs">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Inactive & Drafts</span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <strong className="text-xl font-display font-black text-zinc-950 dark:text-white">
                          {inactivePackagesCount}
                        </strong>
                        <span className="text-[10px] text-zinc-400">packages</span>
                      </div>
                      <span className="text-[9px] text-zinc-400 block mt-1">Hidden from public shop</span>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-800 shadow-xs">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Enrolled Animals</span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <strong className="text-xl font-display font-black text-zinc-950 dark:text-white">
                          {enrolledAnimalsCount}
                        </strong>
                        <span className="text-[10px] text-zinc-400">heads</span>
                      </div>
                      <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold block mt-1">100% Tracking Active</span>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-800 shadow-xs">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Active Customers</span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <strong className="text-xl font-display font-black text-zinc-950 dark:text-white">
                          {activeCustomersCount}
                        </strong>
                        <span className="text-[10px] text-zinc-400">investors</span>
                      </div>
                      <span className="text-[9px] text-zinc-400 block mt-1">Unique owners</span>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-800 shadow-xs col-span-2 lg:col-span-1">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Est. Monthly Rev.</span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <strong className="text-xl font-display font-black text-zinc-950 dark:text-white">
                          ₦{tabRevenue.toLocaleString()}
                        </strong>
                      </div>
                      <span className="text-[9px] text-zinc-400 block mt-1">{selectedAnimalTab} base earnings</span>
                    </div>
                  </div>
                );
              })()}

              {/* Global Package Settings Panel (Collapsible) */}
              {isGlobalSettingsOpen && (
                <div className="bg-zinc-50 dark:bg-zinc-950 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 animate-scale-up">
                  <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-2">
                    <h4 className="font-display font-black text-xs text-zinc-900 dark:text-white uppercase tracking-widest flex items-center gap-1.5">
                      <Settings className="h-3.5 w-3.5 text-zinc-500" />
                      Global Subscription Rules & Fallbacks
                    </h4>
                    <span className="text-[9px] bg-amber-500/10 text-amber-600 border border-amber-500/10 px-2 py-0.5 rounded-full font-bold uppercase">System Config</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-zinc-600 dark:text-zinc-400">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Default VAT/Tax Rate (%)</label>
                      <input 
                        type="number" 
                        value={globalPackageSettings.defaultVAT} 
                        onChange={(e) => setGlobalPackageSettings({...globalPackageSettings, defaultVAT: parseFloat(e.target.value) || 0})}
                        className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-mono" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Default Management Fee (₦)</label>
                      <input 
                        type="number" 
                        value={globalPackageSettings.defaultManagementFee} 
                        onChange={(e) => setGlobalPackageSettings({...globalPackageSettings, defaultManagementFee: parseFloat(e.target.value) || 0})}
                        className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-mono" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Default Feed Cost (₦)</label>
                      <input 
                        type="number" 
                        value={globalPackageSettings.defaultFeedCost} 
                        onChange={(e) => setGlobalPackageSettings({...globalPackageSettings, defaultFeedCost: parseFloat(e.target.value) || 0})}
                        className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-mono" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Default RFID Tracking Fee (₦)</label>
                      <input 
                        type="number" 
                        value={globalPackageSettings.defaultRFIDFee} 
                        onChange={(e) => setGlobalPackageSettings({...globalPackageSettings, defaultRFIDFee: parseFloat(e.target.value) || 0})}
                        className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-mono" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                    <div className="flex items-center justify-between p-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl">
                      <div>
                        <span className="block text-[11px] font-bold text-zinc-900 dark:text-zinc-200">Price Rounding Mode</span>
                        <span className="text-[10px] text-zinc-400">Round calculated subscription values</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={globalPackageSettings.priceRounding} 
                        onChange={(e) => setGlobalPackageSettings({...globalPackageSettings, priceRounding: e.target.checked})}
                        className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500" 
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl">
                      <div>
                        <span className="block text-[11px] font-bold text-zinc-900 dark:text-zinc-200">Automatic Price Updates</span>
                        <span className="text-[10px] text-zinc-400">Link values to raw feedstock price matrix</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={globalPackageSettings.autoPriceUpdates} 
                        onChange={(e) => setGlobalPackageSettings({...globalPackageSettings, autoPriceUpdates: e.target.checked})}
                        className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500" 
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl">
                      <div>
                        <span className="block text-[11px] font-bold text-zinc-900 dark:text-zinc-200">Global Ledger Currency</span>
                        <span className="text-[10px] text-zinc-400">Default symbol for financial invoices</span>
                      </div>
                      <select 
                        value={globalPackageSettings.currency} 
                        onChange={(e) => setGlobalPackageSettings({...globalPackageSettings, currency: e.target.value})}
                        className="px-2 py-1 text-xs border rounded bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white font-black"
                      >
                        <option value="₦">Naira (₦)</option>
                        <option value="$">US Dollar ($)</option>
                        <option value="£">Pound (£)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Filtering, Search & Sorting Controls */}
              <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search packages by name, features..."
                    value={packageSearch}
                    onChange={(e) => setPackageSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border dark:bg-zinc-950 dark:border-zinc-800"
                  />
                </div>

                <div className="flex flex-wrap gap-3 w-full md:w-auto text-xs font-semibold">
                  <select
                    value={packageStatusFilter}
                    onChange={(e) => setPackageStatusFilter(e.target.value)}
                    className="px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  >
                    <option value="all">All Status Tiers</option>
                    <option value="Active">Active Tiers</option>
                    <option value="Inactive">Inactive Tiers</option>
                    <option value="Draft">Draft Tiers</option>
                    <option value="Archived">Archived Tiers</option>
                  </select>

                  <select
                    value={packageSortBy}
                    onChange={(e) => setPackageSortBy(e.target.value as 'name' | 'price' | 'popularity')}
                    className="px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  >
                    <option value="popularity">Sort by Subscriptions (Popularity)</option>
                    <option value="name">Sort by Package Name</option>
                    <option value="price">Sort by Monthly Feed Price</option>
                  </select>
                </div>
              </div>

              {/* Package Cards Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {pricingPackages
                  .filter(pkg => {
                    const matchesAnimalType = (pkg.animalType || '').toLowerCase() === selectedAnimalTab.toLowerCase();
                    const matchesSearch = pkg.name.toLowerCase().includes(packageSearch.toLowerCase()) || 
                      (pkg.description || '').toLowerCase().includes(packageSearch.toLowerCase()) ||
                      pkg.features.some(f => f.toLowerCase().includes(packageSearch.toLowerCase()));
                    
                    let matchesStatus = true;
                    const statusKey = pkg.status || 'Active';
                    if (packageStatusFilter === 'Active') {
                      matchesStatus = statusKey === 'Active';
                    } else if (packageStatusFilter === 'Inactive') {
                      matchesStatus = statusKey === 'Inactive' || statusKey === 'Deactivated';
                    } else if (packageStatusFilter === 'Draft') {
                      matchesStatus = statusKey === 'Draft';
                    } else if (packageStatusFilter === 'Archived') {
                      matchesStatus = statusKey === 'Archived';
                    }
                    return matchesAnimalType && matchesSearch && matchesStatus;
                  })
                  .sort((a, b) => {
                    if (packageSortBy === 'name') return a.name.localeCompare(b.name);
                    if (packageSortBy === 'price') return (a.feedPrice || 0) - (b.feedPrice || 0);
                    // popularity sorting
                    const aCount = farmerLivestock.filter(animal => animal.feedingPlan === a.name).length;
                    const bCount = farmerLivestock.filter(animal => animal.feedingPlan === b.name).length;
                    return bCount - aCount;
                  })
                  .map(pkg => {
                    const pkgStatus = pkg.status || 'Active';
                    const activeSubs = farmerLivestock.filter(animal => animal.feedingPlan === pkg.name).length;
                    const pkgColor = pkg.color || 'emerald';
                    
                    // Theme color definitions
                    const colorThemes: Record<string, { border: string, bg: string, text: string, accent: string }> = {
                      emerald: { border: 'border-emerald-200 dark:border-emerald-800', bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-800 dark:text-emerald-400', accent: 'bg-emerald-600' },
                      amber: { border: 'border-amber-200 dark:border-amber-800', bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-800 dark:text-amber-400', accent: 'bg-amber-600' },
                      indigo: { border: 'border-indigo-200 dark:border-indigo-800', bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-800 dark:text-indigo-400', accent: 'bg-emerald-600' },
                      rose: { border: 'border-rose-200 dark:border-rose-800', bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-800 dark:text-rose-400', accent: 'bg-rose-600' },
                      purple: { border: 'border-purple-200 dark:border-purple-800', bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-800 dark:text-purple-400', accent: 'bg-emerald-600' },
                      cyan: { border: 'border-cyan-200 dark:border-cyan-800', bg: 'bg-cyan-50 dark:bg-cyan-950/40', text: 'text-cyan-800 dark:text-cyan-400', accent: 'bg-emerald-600' }
                    };
                    const theme = colorThemes[pkgColor] || colorThemes.emerald;

                    return (
                      <div 
                        key={pkg.id} 
                        className={`bg-white dark:bg-zinc-900 rounded-3xl border ${
                          pkgStatus === 'Active' 
                            ? 'border-zinc-200 dark:border-zinc-800 shadow-sm' 
                            : 'border-zinc-200 dark:border-zinc-800 opacity-60 grayscale-[20%]'
                        } flex flex-col justify-between space-y-5 relative overflow-hidden`}
                        id={`package-card-${pkg.id}`}
                      >
                        {/* Decorative Top Accent */}
                        <div className={`h-2.5 w-full ${theme.accent}`} />

                        <div className="px-6 space-y-4">
                          {/* Header Section */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-start">
                              <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-widest ${theme.bg} ${theme.text}`}>
                                {pkg.badge || 'Premium Tier'}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-black uppercase ${
                                pkgStatus === 'Active' 
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400' 
                                  : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                              }`}>
                                {pkgStatus}
                              </span>
                            </div>
                            
                            <div>
                              <h4 className="font-display font-black text-lg text-zinc-950 dark:text-white line-clamp-1">{pkg.name}</h4>
                              <p className="text-[11px] text-zinc-400 line-clamp-2 mt-0.5 font-medium leading-relaxed">
                                {pkg.description || 'Custom tailored livestock feeding and management program.'}
                              </p>
                            </div>
                          </div>

                          {/* Subscriptions Metric */}
                          <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-bold border-t border-b border-zinc-100 dark:border-zinc-800 py-2">
                            <Users className="h-4 w-4 text-emerald-600 shrink-0" />
                            <span>👥 <strong className="text-zinc-900 dark:text-white">{activeSubs}</strong> animals enrolled</span>
                          </div>

                          {/* Base Prices Display */}
                          <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-150 dark:border-zinc-900 flex justify-between text-xs font-mono shadow-xs">
                            <div>
                              <span className="text-[8px] text-zinc-400 block uppercase font-black tracking-wider">Feed Price</span>
                              <strong className="text-zinc-900 dark:text-white font-extrabold text-[13px]">
                                {globalPackageSettings.currency}{(pkg.feedPrice || 0).toLocaleString()} 
                                <span className="text-[9px] text-zinc-500 font-normal">/mo</span>
                              </strong>
                            </div>
                            <div className="text-right">
                              <span className="text-[8px] text-zinc-400 block uppercase font-black tracking-wider">Mgt & Boarding</span>
                              <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold text-[13px]">
                                {globalPackageSettings.currency}{(pkg.managementFee || 0).toLocaleString()} 
                                <span className="text-[9px] text-zinc-500 font-normal">/mo</span>
                              </strong>
                            </div>
                          </div>

                          {/* Species Specific Parameters */}
                          <div className="space-y-1.5 border-t border-dashed border-zinc-150 dark:border-zinc-800 pt-2.5">
                            <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest block">⭐ Service parameters ({selectedAnimalTab})</span>
                            <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-600 dark:text-zinc-400 font-semibold">
                              <div className="bg-zinc-50 dark:bg-zinc-950 p-1.5 rounded-lg border dark:border-zinc-850">
                                <span className="text-[7px] font-bold text-zinc-400 block uppercase">Growth Timeline</span>
                                <span className="text-zinc-900 dark:text-zinc-200">{pkg.growthTimeline || 'N/A'}</span>
                              </div>
                              <div className="bg-zinc-50 dark:bg-zinc-950 p-1.5 rounded-lg border dark:border-zinc-850">
                                <span className="text-[7px] font-bold text-zinc-400 block uppercase">Vaccination</span>
                                <span className="text-zinc-900 dark:text-zinc-200">{pkg.vaccinationSchedule || 'None'}</span>
                              </div>
                              <div className="bg-zinc-50 dark:bg-zinc-950 p-1.5 rounded-lg border dark:border-zinc-850">
                                <span className="text-[7px] font-bold text-zinc-400 block uppercase">RFID Tag Required</span>
                                <span className="text-zinc-900 dark:text-zinc-200">{pkg.rfidRequired ? 'Yes (Mandatory)' : 'No (Optional)'}</span>
                              </div>
                              <div className="bg-zinc-50 dark:bg-zinc-950 p-1.5 rounded-lg border dark:border-zinc-850">
                                <span className="text-[7px] font-bold text-zinc-400 block uppercase">Transit / Delivery</span>
                                <span className="text-zinc-900 dark:text-zinc-200 font-mono">₦{(pkg.deliveryFee || 0).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>

                          {/* Animal Eligibility Tags */}
                          <div className="space-y-1">
                            <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest block">Eligible Species</span>
                            <div className="flex flex-wrap gap-1">
                              {(pkg.eligibility && pkg.eligibility.length > 0 ? pkg.eligibility : ['Cow', 'Goat', 'Ram']).map((specie, sIdx) => {
                                const icons: Record<string, string> = { Cow: '🐄', Goat: '🐐', Ram: '🐏', Sheep: '🐏', Camel: '🐪', Poultry: '🐔' };
                                return (
                                  <span key={sIdx} className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-2 py-0.5 rounded-lg text-[9px] font-bold">
                                    {icons[specie] || '🐾'} {specie}
                                  </span>
                                );
                              })}
                            </div>
                          </div>

                          {/* Compact Features list (top 3) */}
                          <div className="space-y-1">
                            <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest block">Key Program Highlights</span>
                            <div className="space-y-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                              {pkg.features.slice(0, 3).map((feat, i) => (
                                <div key={i} className="flex gap-1.5 items-center">
                                  <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                                  <span className="truncate">{feat}</span>
                                </div>
                              ))}
                              {pkg.features.length > 3 && (
                                <span className="text-[10px] text-emerald-600 font-black tracking-wide block pt-0.5">+{pkg.features.length - 3} more features list</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions Footer */}
                        <div className="px-6 pb-6 pt-3 border-t border-zinc-100 dark:border-zinc-850 space-y-3">
                          <div className="grid grid-cols-3 gap-2 text-[10px] font-black uppercase tracking-wider">
                            <button 
                              onClick={() => setSelectedDetailedPackage(pkg)}
                              title="View complete contract rules, billing, version histories"
                              className="py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-white rounded-lg transition-colors text-center font-bold"
                            >
                              Details
                            </button>
                            <button 
                              onClick={() => {
                                setEditingPackage(pkg);
                                setIsAddingPackage(true);
                              }}
                              className="py-1.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 rounded-lg transition-colors text-center font-bold"
                            >
                              Edit Rules
                            </button>
                            <button 
                              onClick={() => {
                                const dupPkg: PricePackage = {
                                  ...pkg,
                                  id: `${pkg.id}-dup-${Date.now()}`,
                                  name: `${pkg.name} (Copy)`,
                                  status: 'Deactivated',
                                  subscribedCount: 0,
                                  lastEdited: new Date().toISOString().slice(0, 16).replace('T', ' '),
                                  versions: [
                                    { id: 'v1', editedBy: currentUser.fullName || 'Admin', action: `Duplicated from ${pkg.name}`, timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '), state: pkg }
                                  ]
                                };
                                setPricingPackages([...pricingPackages, dupPkg]);
                                logAdminAction('Package Duplicated', `Duplicated feeding tier "${pkg.name}" as inactive copy "${dupPkg.name}".`, 'success');
                                alert(`Successfully duplicated "${pkg.name}"! Created a draft copy: "${dupPkg.name}".`);
                              }}
                              className="py-1.5 border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-850 text-zinc-700 dark:text-zinc-300 rounded-lg transition-colors text-center font-bold"
                            >
                              Duplicate
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[10px] font-black uppercase tracking-wider">
                            <button 
                              onClick={() => {
                                const nextStatus = pkgStatus === 'Active' ? 'Inactive' : 'Active';
                                setPricingPackages(pricingPackages.map(p => p.id === pkg.id ? { ...p, status: nextStatus, lastEdited: new Date().toISOString().slice(0, 16).replace('T', ' ') } : p));
                                logAdminAction('Package Status Updated', `Set feeding tier "${pkg.name}" status to "${nextStatus}".`, nextStatus === 'Active' ? 'success' : 'warning');
                              }}
                              className={`py-1.5 rounded-lg transition-colors text-center font-bold ${
                                pkgStatus === 'Active' 
                                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400' 
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400'
                              }`}
                            >
                              {pkgStatus === 'Active' ? 'Deactivate' : 'Activate'}
                            </button>
                            
                            <button 
                              onClick={() => {
                                if (confirm(`Are you sure you want to permanently delete package "${pkg.name}"? This will erase all pricing rules and logs.`)) {
                                  setPricingPackages(pricingPackages.filter(p => p.id !== pkg.id));
                                  logAdminAction('Package Deleted', `Permanently removed feeding package "${pkg.name}".`, 'danger');
                                }
                              }}
                              className="py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/10 dark:text-rose-400 rounded-lg transition-colors text-center font-bold"
                            >
                              Delete
                            </button>
                          </div>

                          <button
                            onClick={() => {
                              setAssigningPackage(pkg);
                              setAssignTargetSpecie('All');
                            }}
                            className="w-full py-2 bg-zinc-950 hover:bg-zinc-900 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                          >
                            <Wheat className="h-3.5 w-3.5 text-emerald-500" />
                            Assign Herd to nutrition plan...
                          </button>

                          <div className="text-[9px] font-mono text-zinc-400 flex justify-between pt-1">
                            <span>Last Edited: {pkg.lastEdited || '2026-06-01'}</span>
                            <span>ID: {pkg.id}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Advanced Dossier: Detailed Package Viewer Modal */}
              {selectedDetailedPackage && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-scale-up text-xs">
                    <div className="relative h-40 bg-zinc-100 dark:bg-zinc-950 overflow-hidden">
                      <img 
                        src={selectedDetailedPackage.coverImage || 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=800&q=80'} 
                        alt={selectedDetailedPackage.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6">
                        <span className="text-[9px] bg-emerald-600 text-white px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider self-start mb-1">
                          {selectedDetailedPackage.badge || 'Premium Program'}
                        </span>
                        <h3 className="font-display font-black text-xl text-white">
                          {selectedDetailedPackage.name}
                        </h3>
                        <p className="text-[11px] text-zinc-300 mt-0.5 line-clamp-1">{selectedDetailedPackage.description}</p>
                      </div>
                      <button 
                        onClick={() => setSelectedDetailedPackage(null)}
                        className="absolute top-4 right-4 h-8 w-8 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto text-zinc-600 dark:text-zinc-400">
                      
                      {/* Left Side: Financial Costs Dossier */}
                      <div className="space-y-4">
                        <h4 className="font-display font-bold text-sm text-zinc-900 dark:text-white border-b pb-1">
                          💰 Cost Breakdown & Margins
                        </h4>
                        
                        <div className="space-y-2 font-medium">
                          <div className="flex justify-between items-center py-1">
                            <span>Monthly Base Feed cost:</span>
                            <strong className="font-mono text-zinc-900 dark:text-white">
                              {globalPackageSettings.currency}{(selectedDetailedPackage.feedPrice || 0).toLocaleString()}
                            </strong>
                          </div>
                          <div className="flex justify-between items-center py-1">
                            <span>Daily Sourced Feed Cost:</span>
                            <strong className="font-mono text-zinc-900 dark:text-white">
                              {globalPackageSettings.currency}{(selectedDetailedPackage.dailyFeedCost || 0).toLocaleString()}
                            </strong>
                          </div>
                          <div className="flex justify-between items-center py-1">
                            <span>Central Boarding fee:</span>
                            <strong className="font-mono text-zinc-900 dark:text-white">
                              {globalPackageSettings.currency}{(selectedDetailedPackage.boardingFee || 10000).toLocaleString()}
                            </strong>
                          </div>
                          <div className="flex justify-between items-center py-1">
                            <span>Herdsman custody fee:</span>
                            <strong className="font-mono text-zinc-900 dark:text-white">
                              {globalPackageSettings.currency}{(selectedDetailedPackage.herdsmanFee || 2000).toLocaleString()}
                            </strong>
                          </div>
                          <div className="flex justify-between items-center py-1">
                            <span>Veterinary Diagnostics fee:</span>
                            <strong className="font-mono text-zinc-900 dark:text-white">
                              {globalPackageSettings.currency}{(selectedDetailedPackage.veterinaryFee || 1500).toLocaleString()}
                            </strong>
                          </div>
                          <div className="flex justify-between items-center py-1">
                            <span>Scheduled Vaccinations cost:</span>
                            <strong className="font-mono text-zinc-900 dark:text-white">
                              {globalPackageSettings.currency}{(selectedDetailedPackage.vaccinationCost || 1000).toLocaleString()}
                            </strong>
                          </div>
                          <div className="flex justify-between items-center py-1">
                            <span>Livestock Insurance fee:</span>
                            <strong className="font-mono text-zinc-900 dark:text-white">
                              {globalPackageSettings.currency}{(selectedDetailedPackage.insuranceFee || 500).toLocaleString()}
                            </strong>
                          </div>
                          <div className="flex justify-between items-center py-1 border-t pt-1.5 font-bold text-zinc-900 dark:text-white">
                            <span>Total Package Cost (₦/mo):</span>
                            <strong className="font-mono text-emerald-600 dark:text-emerald-400">
                              {globalPackageSettings.currency}{(
                                (selectedDetailedPackage.feedPrice || 0) + 
                                (selectedDetailedPackage.managementFee || 15000)
                              ).toLocaleString()}
                            </strong>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-zinc-400 bg-zinc-50 dark:bg-zinc-950 p-2 rounded-lg font-mono">
                            <span>Expected Profit Margin:</span>
                            <span>{selectedDetailedPackage.profitMarginPercent || 10}%</span>
                          </div>
                        </div>

                        {/* Documents Section */}
                        <div className="space-y-2 pt-2">
                          <h5 className="font-bold text-[10px] text-zinc-400 uppercase tracking-widest">Linked Legal Documents</h5>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between p-2 bg-zinc-50 dark:bg-zinc-950 rounded-lg">
                              <span className="truncate">📄 Terms of Use Policy</span>
                              <span className="text-[10px] font-mono text-emerald-600 font-bold cursor-pointer hover:underline">Download</span>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-zinc-50 dark:bg-zinc-950 rounded-lg">
                              <span className="truncate">📄 Boarding Agreement PDF</span>
                              <span className="text-[10px] font-mono text-emerald-600 font-bold cursor-pointer hover:underline">Download</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Features, Discounts & Versions */}
                      <div className="space-y-4">
                        {/* Features */}
                        <div className="space-y-2">
                          <h4 className="font-display font-bold text-sm text-zinc-900 dark:text-white border-b pb-1">
                            ✓ Program Features
                          </h4>
                          <div className="space-y-1.5 max-h-32 overflow-y-auto">
                            {selectedDetailedPackage.features.map((feat, i) => (
                              <div key={i} className="flex gap-2 items-start text-[11px]">
                                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                                <span>{feat}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Billing Rules */}
                        <div className="space-y-2 bg-zinc-50 dark:bg-zinc-950 p-3.5 rounded-2xl border">
                          <h5 className="font-bold text-[10px] text-zinc-400 uppercase tracking-widest">Billing & Compliance Rules</h5>
                          <div className="grid grid-cols-2 gap-2 text-[10px] font-medium leading-relaxed">
                            <div>Cycle: <span className="font-bold text-zinc-900 dark:text-white capitalize">{selectedDetailedPackage.billingCycle || 'monthly'}</span></div>
                            <div>Grace Period: <span className="font-bold text-zinc-900 dark:text-white">{selectedDetailedPackage.gracePeriodDays || 5} days</span></div>
                            <div>Late Fee: <span className="font-bold text-zinc-900 dark:text-white">₦{(selectedDetailedPackage.latePaymentFee || 2500).toLocaleString()}</span></div>
                            <div>Auto-Renew: <span className="font-bold text-zinc-900 dark:text-white">{selectedDetailedPackage.autoRenewal ? 'Yes' : 'No'}</span></div>
                          </div>
                        </div>

                        {/* Version History Log */}
                        <div className="space-y-2">
                          <h4 className="font-display font-bold text-xs text-zinc-900 dark:text-white">
                            📅 System Version Logs ({selectedDetailedPackage.versions?.length || 1})
                          </h4>
                          <div className="space-y-1.5 max-h-24 overflow-y-auto text-[10px] font-mono bg-zinc-50 dark:bg-zinc-950 p-2.5 rounded-xl">
                            {(selectedDetailedPackage.versions || []).map((ver, vIdx) => (
                              <div key={vIdx} className="border-b dark:border-zinc-800 pb-1.5 last:border-0 last:pb-0">
                                <div className="flex justify-between font-bold text-zinc-800 dark:text-zinc-200">
                                  <span>{ver.editedBy} ({ver.id})</span>
                                  <span>{ver.timestamp}</span>
                                </div>
                                <p className="text-zinc-400 mt-0.5">{ver.action}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                    </div>

                    <div className="p-6 border-t dark:border-zinc-800 flex justify-end gap-2.5 bg-zinc-50 dark:bg-zinc-900/50">
                      <button 
                        onClick={() => setSelectedDetailedPackage(null)}
                        className="px-5 py-2 border bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 rounded-xl font-bold transition-all shadow-xs"
                      >
                        Close Dossier
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Package Add / Edit Modal Overlay (Advanced) */}
              {(isAddingPackage || editingPackage) && (
                <PricePackageFormOverlay 
                  currentUser={currentUser}
                  editingPackage={editingPackage}
                  pricingPackages={pricingPackages}
                  setPricingPackages={setPricingPackages}
                  farmerLivestock={farmerLivestock}
                  globalPackageSettings={globalPackageSettings}
                  onClose={() => {
                    setIsAddingPackage(false);
                    setEditingPackage(null);
                  }}
                  logAdminAction={logAdminAction}
                />
              )}

              {assigningInvoice && (
                <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-scale-up">
                    <div className="p-6 border-b border-zinc-150 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
                      <div>
                        <h3 className="font-display font-black text-md text-zinc-950 dark:text-white">
                          Verify Payment & Assign Tag
                        </h3>
                        <p className="text-[11px] text-zinc-400 mt-0.5">Physical intake audit, ID tag allocation and animal profile setup</p>
                      </div>
                      <button 
                        onClick={() => setAssigningInvoice(null)}
                        className="h-7 w-7 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 flex items-center justify-center transition-colors"
                      >
                        <X className="h-4 w-4 text-zinc-500" />
                      </button>
                    </div>

                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs text-zinc-600 dark:text-zinc-400">
                      
                      {/* Customer / Payment Summary */}
                      <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/60 grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-[10px] font-bold text-zinc-400 uppercase">Customer</span>
                          <p className="font-bold text-zinc-900 dark:text-white text-sm">{assigningInvoice.customerFullName}</p>
                          <p className="text-[10px] text-zinc-500">{assigningInvoice.customerEmail}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-zinc-400 uppercase">Amount Verified</span>
                          <p className="font-black text-emerald-700 dark:text-emerald-400 text-sm">₦{assigningInvoice.amount?.toLocaleString()}</p>
                          <p className="text-[10px] text-zinc-500">Invoice: {assigningInvoice.invoiceNumber}</p>
                        </div>
                        {assigningInvoice.bankUsed && (
                          <div className="col-span-2 pt-2 border-t dark:border-zinc-800 flex justify-between text-[11px]">
                            <span>Bank Transfer: <strong>{assigningInvoice.bankUsed}</strong></span>
                            <span>Ref: <strong>{assigningInvoice.paymentReference || 'N/A'}</strong></span>
                          </div>
                        )}
                      </div>

                      {/* Manual Assignment Inputs */}
                      <div className="space-y-3 pt-2">
                        <h4 className="font-bold text-[11px] text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">Allocated Animal Profile</h4>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">CowPlugNG Livestock Tag</label>
                            <input 
                              type="text"
                              value={assignedTag}
                              onChange={(e) => setAssignedTag(e.target.value)}
                              className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800 font-bold font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
                              placeholder="e.g. CPG-CW-0194"
                            />
                            <p className="text-[9px] text-zinc-400 mt-1">Unique RFID-linked registration code</p>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Sourced Breed</label>
                            <input 
                              type="text"
                              value={assignedBreed}
                              onChange={(e) => setAssignedBreed(e.target.value)}
                              className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800 font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
                              placeholder="e.g. White Fulani (Bunaji)"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Animal Category</label>
                            <select
                              value={assignedCategory}
                              onChange={(e) => setAssignedCategory(e.target.value as any)}
                              className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800 font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
                            >
                              <option value="Cow">Cow (🐄)</option>
                              <option value="Goat">Goat (🐐)</option>
                              <option value="Ram">Ram (🐏)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Weight (kg)</label>
                            <input 
                              type="number"
                              value={assignedWeight}
                              onChange={(e) => setAssignedWeight(e.target.value)}
                              className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800 font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Gender</label>
                            <select
                              value={assignedGender}
                              onChange={(e) => setAssignedGender(e.target.value as any)}
                              className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800 font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
                            >
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Age (months)</label>
                            <input 
                              type="number"
                              value={assignedAge}
                              onChange={(e) => setAssignedAge(e.target.value)}
                              className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800 font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Active Range Feeding Plan</label>
                          <input 
                            type="text"
                            value={assignedFeedingPlan}
                            onChange={(e) => setAssignedFeedingPlan(e.target.value)}
                            className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Intake Health Register</label>
                          <select
                            value={assignedHealth}
                            onChange={(e) => setAssignedHealth(e.target.value)}
                            className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800 font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
                          >
                            <option value="Excellent (Green Register)">Excellent (Green Register)</option>
                            <option value="Stable (Routine Supervision)">Stable (Routine Supervision)</option>
                            <option value="Quarantine Field (Intake Watch)">Quarantine Field (Intake Watch)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Vaccinations & Clinical Boosters Administered</label>
                          <textarea 
                            value={assignedVaccines}
                            onChange={(e) => setAssignedVaccines(e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
                            placeholder="e.g. FMD Vaccine, PPR booster, Dewormed"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Visual Dossier Image URL</label>
                          <input 
                            type="text"
                            value={assignedPhoto}
                            onChange={(e) => setAssignedPhoto(e.target.value)}
                            className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                          />
                        </div>

                      </div>

                      <div className="flex justify-end gap-3 pt-3 border-t dark:border-zinc-800">
                        <button 
                          type="button"
                          onClick={() => setAssigningInvoice(null)}
                          className="px-4 py-2 border hover:bg-zinc-50 dark:hover:bg-zinc-850 rounded-xl font-bold transition-all text-xs"
                        >
                          Cancel Verification
                        </button>
                        <button 
                          onClick={handleSubmitVerificationWorkflow}
                          className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition-colors flex items-center gap-1 text-xs"
                        >
                          Approve Payment & Create Profile
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Package Bulk Assignment Dialog */}
              {assigningPackage && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-scale-up">
                    <div className="p-6 border-b border-zinc-150 dark:border-zinc-800 flex justify-between items-center">
                      <h3 className="font-display font-black text-md text-zinc-950 dark:text-white">
                        Bulk Assign: {assigningPackage.name}
                      </h3>
                      <button 
                        onClick={() => setAssigningPackage(null)}
                        className="h-7 w-7 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 flex items-center justify-center transition-colors"
                      >
                        <X className="h-4 w-4 text-zinc-500" />
                      </button>
                    </div>

                    <div className="p-6 space-y-4 text-xs text-zinc-600 dark:text-zinc-400">
                      <p className="leading-normal">
                        Select the livestock cohort currently grazing in the range fields to transition to the <strong className="text-zinc-900 dark:text-white">"{assigningPackage.name}"</strong> nutrition and boarding plan.
                      </p>

                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Target Animal Category</label>
                        <select 
                          value={assignTargetSpecie}
                          onChange={(e) => setAssignTargetSpecie(e.target.value as 'Cow' | 'Goat' | 'Ram' | 'All')}
                          className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800 font-bold text-zinc-950 dark:text-white"
                        >
                          <option value="All">All Live Assets (Mixed Herd)</option>
                          <option value="Cow">Cows Only (🐄)</option>
                          <option value="Goat">Goats Only (🐐)</option>
                          <option value="Ram">Rams Only (🐏)</option>
                        </select>
                      </div>

                      <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-900 text-[10px] font-mono leading-relaxed">
                        <span className="text-amber-500 font-bold block">⚠️ REGULATORY LOGIC CHECK</span>
                        Continuing will force-update the active subscription plans and recalculate future feed invoice ledger entries on the selected animals immediately.
                      </div>

                      <div className="flex justify-end gap-3 pt-3 border-t dark:border-zinc-800">
                        <button 
                          type="button"
                          onClick={() => setAssigningPackage(null)}
                          className="px-4 py-2 border hover:bg-zinc-50 dark:hover:bg-zinc-850 rounded-xl font-bold transition-all"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={() => {
                            let affectedCount = 0;
                            const updatedLivestock = farmerLivestock.map(animal => {
                              const matchesSpecie = assignTargetSpecie === 'All' || animal.category.toLowerCase() === assignTargetSpecie.toLowerCase();
                              if (matchesSpecie) {
                                affectedCount++;
                                return {
                                  ...animal,
                                  feedingPlan: assigningPackage.name
                                };
                              }
                              return animal;
                            });

                            setFarmerLivestock(updatedLivestock);
                            setAssigningPackage(null);
                            logAdminAction('Herd Package Assignment', `Assigned package "${assigningPackage.name}" to all ${affectedCount} ${assignTargetSpecie} livestock nodes in Oyo/Kwara ranges.`, 'success');
                            alert(`Successfully assigned the "${assigningPackage.name}" package to all ${affectedCount} registered ${assignTargetSpecie} assets!`);
                          }}
                          className="px-5 py-2 bg-zinc-950 hover:bg-zinc-900 text-white font-bold rounded-xl shadow-md transition-colors flex items-center gap-1"
                        >
                          Confirm Herd Transition
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </div>

    </div>
  );
}
