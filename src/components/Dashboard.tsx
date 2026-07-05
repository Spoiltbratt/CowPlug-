import React, { useState, useEffect } from 'react';
import { 
  Wallet, TrendingUp, Sparkles, Plus, AlertCircle, ArrowUpRight, ArrowDownLeft, 
  CheckCircle2, FileText, Activity, ShieldCheck, HeartPulse, Calendar, 
  Syringe, Scale, Video, UserCheck, Play, Wheat, Truck, FileCheck, ShoppingBag, 
  Lock, ArrowRight, User, Award, Eye, Trash2, Mail, Phone, Info, Menu, X, LogOut
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserType, AppNotification, FarmerLivestock } from '../types';
import { Invoice } from '../types_payments';
import { Order } from './AdminOrderManagementCenterModal';
import WeatherWidget from './WeatherWidget';
import PricingPackages from './PricingPackages';
import InvoiceViewer from './InvoiceViewer';
import PaymentsInvoiceHistory from './PaymentsInvoiceHistory';

interface DashboardProps {
  currentUser: UserType;
  setCurrentUser: (user: UserType | null) => void;
  farmerLivestock: FarmerLivestock[];
  onAddFarmerLivestock: (newLivestock: FarmerLivestock) => void;
  onDispatchNotification: (n: AppNotification) => void;
  userBalance: number;
  onFundBalance: (amount: number) => void;
  onWithdrawBalance: (amount: number) => void;
  setActiveSection: (sec: string) => void;
  usersList: UserType[];
  activeMenuTab?: string;
  setActiveMenuTab?: (tab: string) => void;
  notifications?: AppNotification[];
  onMarkNotificationsRead?: () => void;
  invoices?: Invoice[];
  onUpdateInvoice?: (id: string, updates: Partial<Invoice>) => void;
  orders?: Order[];
  onUpdateOrder?: (id: string, updates: Partial<Order>) => void;
}

export default function Dashboard({
  currentUser,
  setCurrentUser,
  farmerLivestock,
  onAddFarmerLivestock,
  onDispatchNotification,
  userBalance,
  onFundBalance,
  onWithdrawBalance,
  setActiveSection,
  usersList,
  activeMenuTab: propActiveMenuTab,
  setActiveMenuTab: propSetActiveMenuTab,
  notifications,
  onMarkNotificationsRead,
  invoices = [],
  onUpdateInvoice = () => {},
  orders = [],
  onUpdateOrder = () => {},
}: DashboardProps) {
  
  // Navigation states
  const [internalActiveMenuTab, setInternalActiveMenuTab] = useState<string>('dashboard');
  const activeMenuTab = propActiveMenuTab !== undefined ? propActiveMenuTab : internalActiveMenuTab;
  const setActiveMenuTab = propSetActiveMenuTab !== undefined ? propSetActiveMenuTab : setInternalActiveMenuTab;
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);

  // Local storage trackers for custom requests
  const [deliveryRequests, setDeliveryRequests] = useState<any[]>(() => {
    const saved = localStorage.getItem('cp_delivery_requests');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'del-101', animalTag: 'CPG-CW-001', breed: 'White Fulani', purpose: 'Festival Sourcing', date: '2026-09-10', address: '12 Awolowo Road, Ikoyi, Lagos', status: 'Approved & Scheduled' }
    ];
  });

  const [sourcingRequests, setSourcingRequests] = useState<any[]>(() => {
    const saved = localStorage.getItem('cp_sourcing_requests');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'src-201', category: 'Cow', breed: 'Bunaji (White Fulani)', quantity: 2, purpose: 'Wedding Sourcing', status: 'Processing', date: '2026-07-02' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('cp_delivery_requests', JSON.stringify(deliveryRequests));
  }, [deliveryRequests]);

  useEffect(() => {
    localStorage.setItem('cp_sourcing_requests', JSON.stringify(sourcingRequests));
  }, [sourcingRequests]);

  // Wallet states
  const [fundAmount, setFundAmount] = useState<string>('50000');
  const [fundSuccess, setFundSuccess] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('25000');
  const [bankName, setBankName] = useState('GTBank');
  const [accountNumber, setAccountNumber] = useState('0124589341');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  // Sourcing form states
  const [srcCategory, setSrcCategory] = useState<'Cow' | 'Goat' | 'Ram'>('Cow');
  const [srcBreed, setSrcBreed] = useState('White Fulani');
  const [srcQty, setSrcQty] = useState(1);
  const [srcPurpose, setSrcPurpose] = useState('Wedding Sourcing');
  const [srcSuccess, setSrcSuccess] = useState(false);

  // Delivery form states
  const [delAnimalTag, setDelAnimalTag] = useState('');
  const [delPurpose, setDelPurpose] = useState('Personal consumption');
  const [delDate, setDelDate] = useState('2026-07-28');
  const [delAddress, setDelAddress] = useState('14 Alhaji Kanike Close, Ikoyi, Lagos');
  const [delSuccess, setDelSuccess] = useState(false);

  // Seller/Farmer Registration States
  const [regCategory, setRegCategory] = useState<'Cow' | 'Goat' | 'Ram'>('Cow');
  const [regBreed, setRegBreed] = useState('');
  const [regWeight, setRegWeight] = useState('');
  const [regAge, setRegAge] = useState('');
  const [regOwnersName, setRegOwnersName] = useState('');
  const [regPurchasePrice, setRegPurchasePrice] = useState('');
  const [farmerRegSuccess, setFarmerRegSuccess] = useState(false);

  // Admin Broadcast states
  const [notifType, setNotifType] = useState<'vaccination' | 'feed' | 'drug' | 'system'>('vaccination');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMsg, setNotifMsg] = useState('');
  const [adminDispatchSuccess, setAdminDispatchSuccess] = useState(false);

  // Find owned animals for current user
  const ownedAnimals = farmerLivestock.filter(an => {
    if (!an.ownersName) return false;
    return an.ownersName.toLowerCase().includes(currentUser.fullName.toLowerCase()) || 
           (currentUser.email === 'bashir@yusuf-holdings.com' && an.ownersName.includes('Bashir'));
  });

  const [selectedOwnerAnimalId, setSelectedOwnerAnimalId] = useState<string>(() => {
    return ownedAnimals.length > 0 ? ownedAnimals[0].id : '';
  });

  useEffect(() => {
    if (ownedAnimals.length > 0 && !selectedOwnerAnimalId) {
      setSelectedOwnerAnimalId(ownedAnimals[0].id);
    }
  }, [farmerLivestock, currentUser]);

  const currentSelectedAnimal = ownedAnimals.find(a => a.id === selectedOwnerAnimalId) || ownedAnimals[0];

  // Total Portfolio value
  const portfolioValue = ownedAnimals.reduce((sum, an) => sum + (an.purchasePrice || 350000), 0);

  // Menu Definition based on role
  const isCustomer = currentUser.role === 'investor';
  const isSeller = currentUser.role === 'farmer';
  const isAdmin = currentUser.role === 'admin';

  const menuItems = isCustomer ? [
    { id: 'dashboard', name: 'Dashboard', icon: Activity },
    { id: 'my-livestock', name: 'My Livestock', icon: HeartPulse },
    { id: 'marketplace', name: 'Marketplace', icon: ShoppingBag, action: () => setActiveSection('marketplace') },
    { id: 'request-livestock', name: 'Request Sourcing', icon: Plus },
    { id: 'payments', name: 'Payments & Wallet', icon: Wallet },
    { id: 'invoices', name: 'Transparent Invoices', icon: FileText },
    { id: 'health-records', name: 'Health Records', icon: Syringe },
    { id: 'feeding-plans', name: 'Feeding Plans', icon: Wheat },
    { id: 'delivery-requests', name: 'Delivery Requests', icon: Truck },
    { id: 'profile', name: 'My Profile', icon: User },
  ] : isSeller ? [
    { id: 'dashboard', name: 'Dashboard', icon: Activity },
    { id: 'my-listings', name: 'Manage Herd', icon: FileCheck },
    { id: 'orders', name: 'Customer Orders', icon: ShoppingBag },
    { id: 'sales', name: 'Sales & Revenue', icon: TrendingUp },
    { id: 'payments', name: 'Payments', icon: Wallet },
    { id: 'profile', name: 'Farm Profile', icon: User },
  ] : [
    { id: 'dashboard', name: 'Dashboard Overview', icon: Activity },
    { id: 'notifications', name: 'Dispatch Alerts', icon: Syringe },
    { id: 'registry', name: 'Global Registry', icon: FileCheck },
  ];

  // Handle wallet transactions
  const handleFund = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(fundAmount);
    if (amt > 0) {
      onFundBalance(amt);
      setFundSuccess(true);
      onDispatchNotification({
        id: `notif-fund-${Date.now()}`,
        type: 'system',
        title: '₦ Escrow Funded',
        message: `Deposited ₦${amt.toLocaleString()} successfully to your secure digital wallet.`,
        date: new Date().toISOString(),
        read: false
      });
      setTimeout(() => setFundSuccess(false), 3000);
    }
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (amt > 0 && amt <= userBalance) {
      onWithdrawBalance(amt);
      setWithdrawSuccess(true);
      onDispatchNotification({
        id: `notif-with-${Date.now()}`,
        type: 'system',
        title: '₦ Payout Settled',
        message: `Withdrew ₦${amt.toLocaleString()} to ${bankName} (${accountNumber})`,
        date: new Date().toISOString(),
        read: false
      });
      setTimeout(() => setWithdrawSuccess(false), 3000);
    } else {
      alert('Insufficient wallet funds.');
    }
  };

  // Handle custom sourcing request
  const handleSourcingRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const newReq = {
      id: `src-${Date.now()}`,
      category: srcCategory,
      breed: srcBreed,
      quantity: srcQty,
      purpose: srcPurpose,
      status: 'Processing',
      date: new Date().toISOString().split('T')[0]
    };
    setSourcingRequests(prev => [newReq, ...prev]);
    setSrcSuccess(true);
    onDispatchNotification({
      id: `notif-src-${Date.now()}`,
      type: 'system',
      title: '📋 Custom Sourcing Received',
      message: `CowPlugNG agents are sourcing ${srcQty} x healthy ${srcCategory} (${srcBreed}) for you.`,
      date: new Date().toISOString(),
      read: false
    });
    setTimeout(() => setSrcSuccess(false), 3000);
  };

  // Handle Delivery request
  const handleDeliverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tagToUse = delAnimalTag || (currentSelectedAnimal ? currentSelectedAnimal.tagNumber : 'CPG-CW-001');
    const breedToUse = currentSelectedAnimal ? currentSelectedAnimal.breed : 'White Fulani';
    const newDel = {
      id: `del-${Date.now()}`,
      animalTag: tagToUse,
      breed: breedToUse,
      purpose: delPurpose,
      date: delDate,
      address: delAddress,
      status: 'Pending Dispatch approval'
    };
    setDeliveryRequests(prev => [newDel, ...prev]);
    setDelSuccess(true);
    onDispatchNotification({
      id: `notif-del-${Date.now()}`,
      type: 'system',
      title: '🚚 Transport Requested',
      message: `Scheduled specialized delivery for animal ${tagToUse} on ${delDate}.`,
      date: new Date().toISOString(),
      read: false
    });
    setTimeout(() => setDelSuccess(false), 3000);
  };

  // Handle seller register livestock
  const handleRegisterLivestock = (e: React.FormEvent) => {
    e.preventDefault();
    const weightVal = parseFloat(regWeight);
    const ageVal = parseInt(regAge);
    const priceVal = parseFloat(regPurchasePrice);

    if (weightVal && ageVal && priceVal) {
      const formattedTag = `CPG-${regCategory === 'Cow' ? 'CW' : regCategory === 'Goat' ? 'GT' : 'RM'}-${Math.floor(100 + Math.random() * 900)}`;
      const newAnimal: FarmerLivestock = {
        id: `live-${Date.now()}`,
        tagNumber: formattedTag,
        category: regCategory,
        breed: regBreed,
        weightKg: weightVal,
        ageMonths: ageVal,
        healthStatus: 'Excellent (Green Register)',
        photo: regCategory === 'Cow' 
          ? 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&q=80&w=200'
          : 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=200',
        vaccinations: ['PPR Vaccine', 'Foot & Mouth Booster', 'Deworming Q2'],
        lastVetCheck: new Date().toLocaleDateString(),
        datePurchased: new Date().toISOString().split('T')[0],
        purchasePrice: priceVal,
        feedingPlan: 'Pasture Only',
        ownersName: regOwnersName || 'Alhaji Bashir Yusuf',
        estimatedValue: priceVal * 1.15,
        videos: [],
        weightHistory: [
          { date: 'Month -2', weightKg: weightVal - 15 },
          { date: 'Month -1', weightKg: weightVal - 5 },
          { date: 'Current', weightKg: weightVal }
        ]
      };

      onAddFarmerLivestock(newAnimal);
      setFarmerRegSuccess(true);
      setTimeout(() => setFarmerRegSuccess(false), 3000);

      // Clear inputs
      setRegBreed('');
      setRegWeight('');
      setRegAge('');
      setRegOwnersName('');
      setRegPurchasePrice('');
    }
  };

  // Handle Admin dispatch alert
  const handleAdminDispatchNotif = (e: React.FormEvent) => {
    e.preventDefault();
    if (notifTitle && notifMsg) {
      onDispatchNotification({
        id: `admin-notif-${Date.now()}`,
        type: notifType,
        title: notifTitle,
        message: notifMsg,
        date: new Date().toISOString(),
        read: false
      });
      setAdminDispatchSuccess(true);
      setNotifTitle('');
      setNotifMsg('');
      setTimeout(() => setAdminDispatchSuccess(false), 3000);
    }
  };

  // Handle simulated feeding plan changes
  const handleFeedingPlanChange = (planName: string) => {
    if (currentSelectedAnimal) {
      currentSelectedAnimal.feedingPlan = planName;
      onDispatchNotification({
        id: `notif-feed-${Date.now()}`,
        type: 'feed',
        title: '🌾 Feeding Diet Adjusted',
        message: `Diet for animal ${currentSelectedAnimal.tagNumber} changed to ${planName}.`,
        date: new Date().toISOString(),
        read: false
      });
      alert(`Success: Active nutrition program set to "${planName}"!`);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans overflow-hidden">
      
      {/* MOBILE TOP BAR (md:hidden) */}
      <div className="md:hidden bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 py-3.5 flex items-center justify-between sticky top-0 z-30 w-full shrink-0">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 -ml-2 rounded-xl text-zinc-600 dark:text-zinc-350 hover:bg-zinc-100 dark:hover:bg-zinc-850 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-600 dark:bg-emerald-700 flex items-center justify-center text-white font-bold">
              <TrendingUp className="h-4.5 w-4.5" />
            </div>
            <span className="font-display font-bold text-sm tracking-tight text-zinc-900 dark:text-white">
              Cow<span className="text-emerald-600 dark:text-emerald-400">Plug</span>
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-500/10">
              ₦{userBalance.toLocaleString()}
            </p>
          </div>
          <img src={currentUser.avatar} alt={currentUser.fullName} className="h-7 w-7 rounded-full border border-emerald-500 object-cover" />
        </div>
      </div>

      {/* MOBILE SIDEBAR DRAWER */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-zinc-950/60"
              onClick={() => setMobileSidebarOpen(false)}
            />

            {/* Sidebar Content */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-[85%] max-w-[300px] bg-white dark:bg-zinc-900 h-full flex flex-col z-10 border-r border-zinc-200 dark:border-zinc-800"
            >
              {/* Close Button */}
              <div className="flex justify-end p-4">
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-500"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* User Profile Info Card */}
              <div className="p-4 mx-4 my-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800/80 flex items-center space-x-3">
                <img src={currentUser.avatar} alt={currentUser.fullName} className="h-9 w-9 rounded-full border border-emerald-500 object-cover" />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-extrabold text-zinc-800 dark:text-white truncate">{currentUser.fullName}</h4>
                  <span className="text-[9px] font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400">
                    {isCustomer ? 'Custody Owner' : isSeller ? 'Partner Seller' : 'Platform Admin'}
                  </span>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="flex-1 overflow-y-auto px-4 space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeMenuTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setMobileSidebarOpen(false);
                        if (item.action) {
                          item.action();
                        } else {
                          setActiveMenuTab(item.id);
                        }
                      }}
                      className={`w-full flex items-center px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive 
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/10' 
                          : 'text-zinc-600 hover:text-emerald-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-emerald-400 dark:hover:bg-zinc-850'
                      }`}
                    >
                      <Icon className="h-4.5 w-4.5 mr-3" />
                      {item.name}
                    </button>
                  );
                })}
              </div>

              {/* View Public Website */}
              <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
                <button
                  onClick={() => {
                    setMobileSidebarOpen(false);
                    setActiveSection('home-public');
                  }}
                  className="w-full flex items-center px-4 py-2.5 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all"
                >
                  <Eye className="h-4.5 w-4.5 mr-3" />
                  View Public Website
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 1. DESKTOP SIDEBAR */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800">
          
          {/* Logo & Header */}
          <div className="flex items-center px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">
            <div className="h-10 w-10 rounded-xl bg-emerald-600 dark:bg-emerald-700 flex items-center justify-center text-white mr-3 shadow-md shadow-emerald-600/20">
              <TrendingUp className="h-5.5 w-5.5 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-display font-bold text-xl tracking-tight text-zinc-900 dark:text-white flex items-center">
                Cow<span className="text-emerald-600 dark:text-emerald-400">Plug</span>
                <span className="text-amber-500 font-extrabold text-sm ml-0.5">NG</span>
              </span>
              <p className="text-[9px] text-zinc-400 font-mono uppercase tracking-widest -mt-1 font-bold">Workspace</p>
            </div>
          </div>

          {/* Logged in User quick card */}
          <div className="p-4 mx-4 my-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800 flex items-center space-x-3">
            <img src={currentUser.avatar} alt={currentUser.fullName} className="h-10 w-10 rounded-full border border-emerald-500 object-cover" />
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-extrabold text-zinc-800 dark:text-white truncate">{currentUser.fullName}</h4>
              <span className="text-[9px] font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400">
                {isCustomer ? 'Custody Owner' : isSeller ? 'Partner Seller' : 'Platform Admin'}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto px-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenuTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.action) {
                      item.action();
                    } else {
                      setActiveMenuTab(item.id);
                    }
                  }}
                  className={`w-full flex items-center px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive 
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/10' 
                      : 'text-zinc-600 hover:text-emerald-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-emerald-400 dark:hover:bg-zinc-850'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5 mr-3" />
                  {item.name}
                </button>
              );
            })}
          </div>

          {/* View Public Website */}
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
            <button
              onClick={() => {
                setActiveSection('home-public');
              }}
              className="w-full flex items-center px-4 py-2.5 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all"
            >
              <Eye className="h-4.5 w-4.5 mr-3" />
              View Public Website
            </button>
          </div>
        </div>
      </div>

      {/* 2. CORE VIEWS - MAIN CONTAINER */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* 3. CORE VIEWS IN DASHBOARD */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          
          {/* ==================== CUSTOMER PORTAL ==================== */}
          {isCustomer && (
            <div className="max-w-6xl mx-auto space-y-6">
              
               {/* Tab 1: Customer Overview */}
               {activeMenuTab === 'dashboard' && (
                 <div className="space-y-6 animate-fade-in">
                   {/* 1. Welcome Card & Quick Stats */}
                   <div className="space-y-4">
                     <div className="p-6 bg-linear-to-r from-emerald-600 to-teal-700 dark:from-emerald-700 dark:to-emerald-950 rounded-3xl text-white relative overflow-hidden shadow-lg shadow-emerald-700/10">
                       <div className="relative z-10 space-y-2">
                         <span className="text-[10px] font-mono bg-emerald-500/20 border border-emerald-400/20 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                           Livestock Registry Workspace
                         </span>
                         <h2 className="font-display font-extrabold text-2xl">
                           Welcome, {currentUser.fullName}!
                         </h2>
                         <p className="text-xs text-emerald-100/90 max-w-xl">
                           Your managed livestock profiles are secure at Oyo Pasture Range C. Our professional veterinary team updates feedlogs and checkup schedules on a regular basis.
                         </p>
                       </div>
                     </div>

                     {/* Stats Grid */}
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                       <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                         <span className="text-[10px] text-zinc-400 font-bold uppercase">Digital Wallet Balance</span>
                         <strong className="text-lg text-emerald-600 dark:text-emerald-400 font-mono block mt-1">₦{userBalance.toLocaleString()}</strong>
                         <span className="text-[9px] text-zinc-400">Secure digital escrow</span>
                       </div>
                       <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                         <span className="text-[10px] text-zinc-400 font-bold uppercase">Managed Livestock</span>
                         <strong className="text-lg text-zinc-900 dark:text-white block mt-1">{ownedAnimals.length} Active Head</strong>
                         <span className="text-[9px] text-zinc-400">Boarded on premium pasture</span>
                       </div>
                       <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                         <span className="text-[10px] text-zinc-400 font-bold uppercase">Estimated Portfolio Value</span>
                         <strong className="text-lg text-amber-500 font-mono block mt-1">₦{portfolioValue.toLocaleString()}</strong>
                         <span className="text-[9px] text-zinc-400">Acquisition value registry</span>
                       </div>
                       <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                         <span className="text-[10px] text-zinc-400 font-bold uppercase">Ranch Verification</span>
                         <strong className="text-lg text-emerald-600 block mt-1">Level 2 Approved</strong>
                         <span className="text-[9px] text-zinc-400">KYC BVN verified profile</span>
                       </div>
                     </div>
                   </div>

                   {/* 2. My Livestock Summary */}
                   <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-4">
                     <div className="flex justify-between items-center">
                       <div>
                         <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">My Livestock Summary</h4>
                         <p className="text-[11px] text-zinc-500 mt-0.5">Summary of animals boarded in your account</p>
                       </div>
                       <span className="text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                         {ownedAnimals.length} Head
                       </span>
                     </div>

                     {ownedAnimals.length === 0 ? (
                       <div className="p-6 text-center border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-xl space-y-2">
                         <p className="text-xs text-zinc-500">You don't own any active livestock registers yet.</p>
                         <button onClick={() => setActiveSection('marketplace')} className="px-3 py-1.5 bg-emerald-600 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-700">
                           Browse Marketplace
                         </button>
                       </div>
                     ) : (
                       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                         {ownedAnimals.map((animal) => (
                           <div key={animal.id} className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-150 dark:border-zinc-850 flex items-center space-x-3">
                             <img src={animal.photo} alt={animal.breed} className="h-10 w-10 rounded-lg object-cover" />
                             <div className="flex-1 min-w-0">
                               <div className="flex justify-between items-center">
                                 <span className="text-[9px] font-mono text-zinc-400 font-bold">{animal.tagNumber}</span>
                                 <span className="text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded">
                                   {animal.healthStatus}
                                 </span>
                               </div>
                               <h5 className="text-xs font-bold text-zinc-800 dark:text-white truncate mt-0.5">{animal.breed}</h5>
                               <p className="text-[10px] text-zinc-500">{animal.weightKg} kg • {animal.ageMonths} mos</p>
                             </div>
                           </div>
                         ))}
                       </div>
                     )}
                   </div>

                   {/* 3. Active Packages */}
                   <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-4">
                     <div>
                       <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Active Packages</h4>
                       <p className="text-[11px] text-zinc-500 mt-0.5">Management, pasture feeding, and wellness packages active for your herd</p>
                     </div>

                     {ownedAnimals.length === 0 ? (
                       <p className="text-xs text-zinc-500">No active packages enrolled (No active livestock owned).</p>
                     ) : (
                       <div className="space-y-3">
                         {ownedAnimals.map((animal) => {
                           const plan = animal.feedingPlan || 'Pasture Only';
                           let packageDesc = 'Standard continuous grazing on public range pasture C.';
                           let cost = '₦15,000 / mo';
                           if (plan.includes('Supplement')) {
                             packageDesc = 'Pasture grazing with supplementary professional nutrient-dense silage feed rations.';
                             cost = '₦30,750 / mo';
                           } else if (plan.includes('Fattening')) {
                             packageDesc = 'Intense high-protein fattening concentrates for accelerated growth and rapid mass development.';
                             cost = '₦35,750 / mo';
                           }
                           return (
                             <div key={animal.id} className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-150 dark:border-zinc-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                               <div className="flex items-start space-x-3">
                                 <span className="text-xl mt-0.5">📦</span>
                                 <div>
                                   <div className="flex items-center space-x-2">
                                     <h5 className="text-xs font-bold text-zinc-800 dark:text-white">{plan}</h5>
                                     <span className="text-[9px] font-mono text-zinc-400">For {animal.tagNumber}</span>
                                   </div>
                                   <p className="text-[10px] text-zinc-500 mt-0.5">{packageDesc}</p>
                                 </div>
                               </div>
                               <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-0 pt-2 sm:pt-0 border-zinc-100 dark:border-zinc-800">
                                 <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">{cost}</span>
                                 <button onClick={() => { setActiveMenuTab('feeding-plans'); setSelectedOwnerAnimalId(animal.id); }} className="px-2.5 py-1 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-[10px] font-bold hover:bg-emerald-600 hover:text-white transition-colors">
                                   Manage
                                 </button>
                               </div>
                             </div>
                           );
                         })}
                       </div>
                     )}
                   </div>

                   {/* 4. Recent Animal Updates */}
                   <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-4">
                     <div>
                       <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Recent Animal Updates</h4>
                       <p className="text-[11px] text-zinc-500 mt-0.5">Real-time status updates from Oyo Range rangers</p>
                     </div>

                     <div className="space-y-3.5 text-xs">
                       {ownedAnimals.length === 0 ? (
                         <p className="text-xs text-zinc-500">No recent updates recorded.</p>
                       ) : (
                         ownedAnimals.slice(0, 3).map((animal, idx) => {
                           const updatesList = [
                             {
                               title: "Weekly Weight Tracking Logged",
                               desc: `Weight certified at ${animal.weightKg} kg. Primary health status remains ${animal.healthStatus}.`,
                               time: "Today, 10:14 AM",
                               emoji: "⚖️"
                             },
                             {
                               title: "Pasture Dietary Checkup completed",
                               desc: `Plan: ${animal.feedingPlan || 'Pasture Only'} is matching metabolic expectations.`,
                               time: "Yesterday, 08:30 AM",
                               emoji: "🌾"
                             },
                             {
                               title: "Veterinary Routine Checkup Completed",
                               desc: `Assessed by Dr. Jinadu. Clear of bovine parasites, clear chest sounds, active chewing.`,
                               time: "3 days ago",
                               emoji: "🩺"
                             }
                           ];
                           const update = updatesList[idx % updatesList.length];
                           return (
                             <div key={animal.id} className="flex items-start space-x-3 border-b pb-3 last:border-0 last:pb-0 border-zinc-100 dark:border-zinc-800/80">
                               <span className="text-base p-1 bg-zinc-50 dark:bg-zinc-950 rounded-lg">{update.emoji}</span>
                               <div className="flex-1">
                                 <div className="flex justify-between items-start">
                                   <h5 className="font-bold text-zinc-800 dark:text-zinc-200">{update.title}</h5>
                                   <span className="font-mono text-zinc-400 text-[9px] shrink-0 ml-2">{update.time}</span>
                                 </div>
                                 <p className="text-[10px] text-zinc-500 mt-0.5">{update.desc}</p>
                                 <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.5 rounded mt-1.5 inline-block">
                                   Tag: {animal.tagNumber}
                                 </span>
                               </div>
                             </div>
                           );
                         })
                       )}
                     </div>
                   </div>

                   {/* 5. Upcoming Vaccinations */}
                   <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-4">
                     <div>
                       <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Upcoming Vaccinations</h4>
                       <p className="text-[11px] text-zinc-500 mt-0.5">Scheduled preventive vaccination and booster rounds</p>
                     </div>

                     <div className="space-y-3">
                       {[
                         {
                           disease: "Contagious Bovine Pleuropneumonia (CBPP) Annual",
                           target: ownedAnimals[0]?.tagNumber || "Herd Wide",
                           date: "July 28, 2026",
                           status: "Scheduled",
                           officer: "Dr. Babatunde Jinadu"
                         },
                         {
                           disease: "Foot & Mouth Disease (FMD) Q3 Round",
                           target: ownedAnimals[1]?.tagNumber || "Herd Wide",
                           date: "August 15, 2026",
                           status: "Scheduled",
                           officer: "Dr. Babatunde Jinadu"
                         }
                       ].map((vacc, idx) => (
                         <div key={idx} className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-150 dark:border-zinc-850 flex items-center justify-between text-xs">
                           <div className="flex items-start space-x-3">
                             <span className="text-lg mt-0.5">💉</span>
                             <div>
                               <h5 className="font-bold text-zinc-800 dark:text-zinc-200">{vacc.disease}</h5>
                               <p className="text-[10px] text-zinc-400 mt-0.5">Ranch Vet: {vacc.officer} • Target: <strong className="text-zinc-500">{vacc.target}</strong></p>
                             </div>
                           </div>
                           <div className="text-right shrink-0">
                             <span className="text-[9px] font-mono font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full block text-center">
                               {vacc.status}
                             </span>
                             <span className="text-[10px] text-zinc-500 block font-mono mt-1">{vacc.date}</span>
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>

                   {/* 6. Pending Payments */}
                   <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-4">
                     <div className="flex justify-between items-center">
                       <div>
                         <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Pending Payments</h4>
                         <p className="text-[11px] text-zinc-500 mt-0.5">Invoices or recurring subscriptions requiring clearance</p>
                       </div>
                       <span className="text-xs bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 px-2 py-0.5 rounded-full font-bold">
                         0 Pending
                       </span>
                     </div>

                     <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 rounded-xl text-center">
                       <span className="text-emerald-600 text-base">✓</span>
                       <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mt-1">All accounts are in good standing! No pending invoices or overdue feed logs.</p>
                       <button onClick={() => setActiveMenuTab('payments')} className="mt-2 text-[10px] font-bold text-emerald-600 hover:underline">
                         Fund Secure Escrow Wallet →
                       </button>
                     </div>
                   </div>

                   {/* 7. Recent Transactions */}
                   <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-4">
                     <div className="flex justify-between items-center">
                       <div>
                         <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Recent Transactions</h4>
                         <p className="text-[11px] text-zinc-500 mt-0.5">Escrow audit trail logs</p>
                       </div>
                       <button onClick={() => setActiveMenuTab('payments')} className="text-[10px] font-bold text-emerald-600 hover:underline">
                         View All
                       </button>
                     </div>

                     <div className="space-y-3.5 text-xs">
                       {[
                         {
                           type: "Wallet Credit",
                           desc: "Direct escrow deposit approved",
                           amount: "+₦500,000",
                           time: "July 01, 2026",
                           status: "Completed",
                           isCredit: true
                         },
                         {
                           type: "Livestock Purchase",
                           desc: "White Fulani Cow acquisition",
                           amount: "-₦350,000",
                           time: "June 25, 2026",
                           status: "Completed",
                           isCredit: false
                         }
                       ].map((tx, idx) => (
                         <div key={idx} className="flex justify-between items-center pb-2.5 last:pb-0 border-b last:border-0 border-zinc-100 dark:border-zinc-800">
                           <div>
                             <p className="font-bold text-zinc-800 dark:text-zinc-200">{tx.type}</p>
                             <p className="text-[10px] text-zinc-400">{tx.desc} • {tx.time}</p>
                           </div>
                           <div className="text-right shrink-0">
                             <span className={`font-mono font-bold block ${tx.isCredit ? 'text-emerald-600' : 'text-zinc-700 dark:text-white'}`}>
                               {tx.amount}
                             </span>
                             <span className="text-[9px] text-zinc-400">{tx.status}</span>
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>

                   {/* 8. Notifications */}
                   <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-4">
                     <div>
                       <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Notifications & Alerts</h4>
                       <p className="text-[11px] text-zinc-500 mt-0.5">Important operational broadcast events</p>
                     </div>

                     <div className="space-y-2.5">
                       {[
                         {
                           title: "Oyo Range C Rain Fall Forecast",
                           message: "Wet season grazing schedule activated. All cattle shifted to dry ground shelters.",
                           date: "July 03, 2026",
                           badge: "INFO"
                         },
                         {
                           title: "Booster Round Registration",
                           message: "CBPP vaccination registration has been processed for your White Fulani cohort.",
                           date: "June 28, 2026",
                           badge: "VET"
                         }
                       ].map((notif, idx) => (
                         <div key={idx} className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-150 dark:border-zinc-850 flex items-start space-x-3 text-xs">
                           <span className="text-lg">📢</span>
                           <div className="flex-1">
                             <div className="flex justify-between items-center">
                               <h5 className="font-bold text-zinc-800 dark:text-zinc-200">{notif.title}</h5>
                               <span className="text-[9px] font-mono text-zinc-400">{notif.date}</span>
                             </div>
                             <p className="text-[10px] text-zinc-500 mt-1">{notif.message}</p>
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>

                   {/* 9. Marketplace Suggestions */}
                   <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-4">
                     <div className="flex justify-between items-center">
                       <div>
                         <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Marketplace Suggestions</h4>
                         <p className="text-[11px] text-zinc-500 mt-0.5">Top performing breeds recommended for Oyo region boarding</p>
                       </div>
                       <button onClick={() => setActiveSection('marketplace')} className="text-[10px] font-bold text-emerald-600 hover:underline">
                         Explore Shop
                       </button>
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       {[
                         {
                           name: "White Fulani Cow",
                           desc: "High heat tolerance, premium beef yielding, fully vaccinated",
                           price: "₦350,000",
                           yield: "Accruing weight logs daily"
                         },
                         {
                           name: "Kalahari Red Goat",
                           desc: "Excellent parasite resistance, high fecundity breeders",
                           price: "₦85,000",
                           yield: "High reproduction rates"
                         }
                       ].map((sug, idx) => (
                         <div key={idx} className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-150 dark:border-zinc-850 space-y-2 text-xs flex flex-col justify-between">
                           <div>
                             <h5 className="font-bold text-zinc-800 dark:text-white">{sug.name}</h5>
                             <p className="text-[10px] text-zinc-500 mt-0.5">{sug.desc}</p>
                             <span className="text-[9px] text-emerald-600 font-mono font-bold mt-1.5 block">✓ {sug.yield}</span>
                           </div>
                           <div className="flex justify-between items-center border-t border-zinc-100 dark:border-zinc-800 pt-2 mt-2">
                             <span className="font-mono font-bold text-zinc-900 dark:text-white">{sug.price}</span>
                             <button onClick={() => setActiveSection('marketplace')} className="px-2 py-1 bg-emerald-600 text-white text-[9px] font-bold rounded hover:bg-emerald-700">
                               Acquire
                             </button>
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>

                   {/* 10. Pasture Weather & Climate Widget */}
                   <div className="space-y-3">
                     <div className="px-1">
                       <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Pasture Weather & Climate Widget</h4>
                       <p className="text-[11px] text-zinc-500 mt-0.5">Live grazing environmental simulation metrics at Oyo Pasture Range C</p>
                     </div>
                     <WeatherWidget defaultLocation="Oyo, Nigeria" ranchName="Oyo Pasture Range C" />
                   </div>
                 </div>
               )}

              {/* Tab 2: My Livestock */}
              {activeMenuTab === 'my-livestock' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b pb-4 dark:border-zinc-800">
                    <div>
                      <h3 className="font-display font-extrabold text-xl text-zinc-900 dark:text-white">
                        My Managed Livestock Register
                      </h3>
                      <p className="text-xs text-zinc-500">Select any healthy animal profile listed in custody below.</p>
                    </div>
                  </div>

                  {ownedAnimals.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                      <span className="text-3xl">🐄</span>
                      <p className="text-xs font-bold text-zinc-400 mt-3">You do not own any active livestock registers.</p>
                      <button onClick={() => setActiveSection('marketplace')} className="mt-4 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl">
                        Purchase in Marketplace
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      
                      {/* Left: Animal select buttons */}
                      <div className="lg:col-span-4 space-y-2">
                        {ownedAnimals.map((an) => (
                          <button
                            key={an.id}
                            onClick={() => setSelectedOwnerAnimalId(an.id)}
                            className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center space-x-3 ${
                              selectedOwnerAnimalId === an.id 
                                ? 'bg-zinc-900 text-white border-zinc-800 dark:bg-white dark:text-zinc-950 dark:border-white' 
                                : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100'
                            }`}
                          >
                            <img src={an.photo} alt={an.breed} className="h-10 w-10 rounded-lg object-cover" />
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] font-mono opacity-80 font-bold">{an.tagNumber}</span>
                                <span className="text-xs">{an.category === 'Cow' ? '🐄' : '🐐'}</span>
                              </div>
                              <h4 className="text-xs font-bold truncate mt-0.5">{an.breed}</h4>
                              <p className="text-[9px] opacity-75">{an.weightKg} kg • {an.ageMonths} mos</p>
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* Right: Digital profile */}
                      {currentSelectedAnimal && (
                        <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-6">
                          <div className="flex justify-between items-center border-b pb-4 dark:border-zinc-800">
                            <div className="flex items-center space-x-3">
                              <img src={currentSelectedAnimal.photo} alt="Cow" className="h-12 w-12 rounded-xl object-cover" />
                              <div>
                                <h4 className="font-bold text-sm">{currentSelectedAnimal.breed}</h4>
                                <span className="text-[9px] font-mono bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                                  Tag Number: {currentSelectedAnimal.tagNumber}
                                </span>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button onClick={() => setActiveMenuTab('delivery-requests')} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold">
                                Delivery
                              </button>
                              <button onClick={() => setShowCertificate(true)} className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-850 text-zinc-800 dark:text-white rounded-lg text-xs font-bold flex items-center gap-1">
                                <Award className="h-3 w-3 text-amber-500" /> Certificate
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Specifications</h5>
                              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                                <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl">
                                  <span className="text-[9px] text-zinc-400 block">CURRENT WEIGHT</span>
                                  <span className="font-bold">{currentSelectedAnimal.weightKg} kg</span>
                                </div>
                                <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl">
                                  <span className="text-[9px] text-zinc-400 block">AGE REGISTER</span>
                                  <span className="font-bold">{currentSelectedAnimal.ageMonths} months</span>
                                </div>
                                <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl col-span-2">
                                  <span className="text-[9px] text-zinc-400 block">VETERINARY STATUS</span>
                                  <span className="font-bold text-emerald-600">{currentSelectedAnimal.healthStatus}</span>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Active feeding plan</h5>
                              <div className="space-y-2">
                                {[
                                  { name: 'Pasture Only', price: '₦15,000 / mo' },
                                  { name: 'Pasture + Supplement Feed', price: '₦30,750 / mo' },
                                  { name: 'Premium Fattening Feed', price: '₦35,750 / mo' }
                                ].map((p) => (
                                  <button
                                    key={p.name}
                                    onClick={() => handleFeedingPlanChange(p.name)}
                                    className={`w-full flex justify-between p-2.5 rounded-xl border text-xs font-bold ${
                                      (currentSelectedAnimal.feedingPlan || 'Pasture Only') === p.name
                                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-zinc-900 dark:text-white'
                                        : 'bg-transparent border-zinc-200 dark:border-zinc-800'
                                    }`}
                                  >
                                    <span>{p.name}</span>
                                    <strong className="text-emerald-600 font-mono">{p.price}</strong>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Request Sourcing */}
              {activeMenuTab === 'request-livestock' && (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 max-w-xl mx-auto space-y-6">
                  <div className="text-center">
                    <Plus className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                    <h3 className="font-display font-extrabold text-xl text-zinc-900 dark:text-white">Custom Sourcing Request</h3>
                    <p className="text-xs text-zinc-500">Need specific breeds, sizes, or quantities? Specify your targets and CowPlugNG agents will source and catalog them for you.</p>
                  </div>

                  <form onSubmit={handleSourcingRequest} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Livestock Category</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['Cow', 'Goat', 'Ram'] as const).map(cat => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setSrcCategory(cat)}
                            className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                              srcCategory === cat ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-transparent'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Breed preference</label>
                        <input
                          type="text"
                          required
                          value={srcBreed}
                          onChange={(e) => setSrcBreed(e.target.value)}
                          className="w-full px-4 py-2 rounded-xl border text-xs dark:bg-zinc-950 dark:border-zinc-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Required quantity</label>
                        <input
                          type="number"
                          required
                          min={1}
                          value={srcQty}
                          onChange={(e) => setSrcQty(parseInt(e.target.value) || 1)}
                          className="w-full px-4 py-2 rounded-xl border text-xs dark:bg-zinc-950 dark:border-zinc-800"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Intended Purpose</label>
                      <select
                        value={srcPurpose}
                        onChange={(e) => setSrcPurpose(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border text-xs dark:bg-zinc-950 dark:border-zinc-800"
                      >
                        <option value="Wedding Sourcing">Wedding Sourcing</option>
                        <option value="Festival Sourcing">Festival / Sallah Sourcing</option>
                        <option value="Business supply">Business / Meat Supply</option>
                        <option value="Personal Consumption">Personal consumption</option>
                      </select>
                    </div>

                    <button type="submit" className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold">
                      Submit Sourcing Request
                    </button>
                  </form>

                  {srcSuccess && (
                    <div className="p-3 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-xl text-center text-xs font-bold animate-pulse">
                      🎉 Sourcing Request Logged successfully! We will coordinate.
                    </div>
                  )}

                  {/* Sourcing request lists */}
                  <div className="pt-4 border-t dark:border-zinc-800">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase mb-3">Your Sourcing Log</h4>
                    <div className="space-y-2">
                      {sourcingRequests.map((r, i) => (
                        <div key={i} className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl text-xs flex justify-between">
                          <div>
                            <p className="font-bold">{r.quantity} x {r.breed} ({r.category})</p>
                            <p className="text-[10px] text-zinc-400">{r.purpose} • Requested {r.date}</p>
                          </div>
                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg self-center">{r.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Payments & Wallet */}
              {activeMenuTab === 'payments' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Fund form */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
                      <h3 className="font-bold text-md text-zinc-900 dark:text-white">Fund Escrow Wallet</h3>
                      <form onSubmit={handleFund} className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Deposit Amount (₦)</label>
                          <input
                            type="number"
                            required
                            value={fundAmount}
                            onChange={(e) => setFundAmount(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl border text-xs dark:bg-zinc-950 dark:border-zinc-800 font-mono"
                          />
                        </div>
                        <button type="submit" className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold">
                          Fund secure Escrow
                        </button>
                      </form>
                      {fundSuccess && (
                        <p className="text-xs text-emerald-600 text-center font-bold">₦ Wallet updated successfully!</p>
                      )}
                    </div>

                    {/* Withdraw form */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
                      <h3 className="font-bold text-md text-zinc-900 dark:text-white">Withdraw to Local Bank</h3>
                      <form onSubmit={handleWithdraw} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Amount (₦)</label>
                            <input
                              type="number"
                              required
                              value={withdrawAmount}
                              onChange={(e) => setWithdrawAmount(e.target.value)}
                              className="w-full px-4 py-2 rounded-xl border text-xs dark:bg-zinc-950 dark:border-zinc-800 font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Select Bank</label>
                            <input
                              type="text"
                              required
                              value={bankName}
                              onChange={(e) => setBankName(e.target.value)}
                              className="w-full px-4 py-2 rounded-xl border text-xs dark:bg-zinc-950 dark:border-zinc-800"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Account Number</label>
                          <input
                            type="text"
                            required
                            maxLength={10}
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl border text-xs dark:bg-zinc-950 dark:border-zinc-800 font-mono"
                          />
                        </div>
                        <button type="submit" className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold">
                          Request Payout Withdrawal
                        </button>
                      </form>
                      {withdrawSuccess && (
                        <p className="text-xs text-emerald-600 text-center font-bold">Payout settled successfully!</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Detailed Interactive Sourcing Invoices List with sorting & filtering */}
                  <PaymentsInvoiceHistory ownedAnimals={ownedAnimals} />
                </div>
              )}

              {/* Tab 4.5: Transparent Invoices */}
              {activeMenuTab === 'invoices' && (
                <InvoiceViewer 
                  ownedAnimals={ownedAnimals} 
                  userBalance={userBalance} 
                  invoices={invoices}
                  onUpdateInvoice={onUpdateInvoice}
                  orders={orders}
                  onUpdateOrder={onUpdateOrder}
                  currentUser={currentUser}
                />
              )}

              {/* Tab 5: Health Records */}
              {activeMenuTab === 'health-records' && (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 max-w-2xl mx-auto space-y-6">
                  <h3 className="font-display font-extrabold text-xl text-zinc-900 dark:text-white flex items-center">
                    <Syringe className="h-6 w-6 text-emerald-600 mr-2" /> Complete Vaccination & Veterinary logs
                  </h3>
                  {currentSelectedAnimal ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border text-xs space-y-2">
                        <p className="font-bold text-sm">Animal profile: {currentSelectedAnimal.breed} ({currentSelectedAnimal.tagNumber})</p>
                        <p className="text-zinc-500">Last routine health screening: <strong className="text-zinc-700 dark:text-zinc-300">{currentSelectedAnimal.lastVetCheck}</strong></p>
                        <p className="text-zinc-500">Scheduled Checkup: <strong className="text-zinc-700 dark:text-zinc-300">28 July 2026</strong></p>
                      </div>

                      <div className="space-y-3 pt-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Administered Vaccines Timeline</p>
                        <div className="relative border-l border-emerald-500/30 ml-3.5 pl-6 space-y-4 text-xs">
                          <div className="relative">
                            <span className="absolute -left-9 top-0.5 bg-emerald-500 h-6 w-6 rounded-full flex items-center justify-center text-white text-[10px]">✓</span>
                            <p className="font-bold text-zinc-800 dark:text-white">PPR Booster dose vaccine</p>
                            <p className="text-[10px] text-zinc-400">Administered on 20 June 2026 • Verified batch_v4012</p>
                          </div>
                          <div className="relative">
                            <span className="absolute -left-9 top-0.5 bg-emerald-500 h-6 w-6 rounded-full flex items-center justify-center text-white text-[10px]">✓</span>
                            <p className="font-bold text-zinc-800 dark:text-white">Foot & Mouth Disease (FMD) booster</p>
                            <p className="text-[10px] text-zinc-400">Administered on 01 May 2026 • Verified batch_v3911</p>
                          </div>
                          <div className="relative">
                            <span className="absolute -left-9 top-0.5 bg-emerald-500 h-6 w-6 rounded-full flex items-center justify-center text-white text-[10px]">✓</span>
                            <p className="font-bold text-zinc-800 dark:text-white">Deworming booster Q2</p>
                            <p className="text-[10px] text-zinc-400">Routine physical deworming checkup verified</p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t dark:border-zinc-800 text-center text-xs font-bold text-zinc-400">
                        🛡️ Secured under CowPlugNG Chief Veterinarian Dr. Babatunde Jinadu
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500">No active animal selected.</p>
                  )}
                </div>
              )}

              {/* Tab 6: Feeding Plans */}
              {activeMenuTab === 'feeding-plans' && (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 max-w-2xl mx-auto space-y-6">
                  <h3 className="font-display font-extrabold text-xl text-zinc-900 dark:text-white flex items-center">
                    <Wheat className="h-6 w-6 text-emerald-600 mr-2" /> Supplemental Diet program
                  </h3>
                  {currentSelectedAnimal ? (
                    <div className="space-y-4">
                      <p className="text-xs text-zinc-500">
                        Your current selected plan for <strong>{currentSelectedAnimal.tagNumber}</strong> is{' '}
                        <strong>{currentSelectedAnimal.feedingPlan || 'Pasture Only'}</strong>. You can adjust the diet program instantly below:
                      </p>
                      
                      <PricingPackages
                        isCompact={true}
                        animalType={currentSelectedAnimal.category.toLowerCase() as any}
                        selectedPackage={currentSelectedAnimal.feedingPlan || 'Pasture Only'}
                        onChoosePackage={(name) => {
                          let planName = 'Pasture Only';
                          if (name === 'Supplement Package') {
                            planName = 'Pasture + Supplement Feed';
                          } else if (name === 'Premium Fattening Package') {
                            planName = 'Premium Fattening Feed';
                          }
                          handleFeedingPlanChange(planName);
                        }}
                      />
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500">Please select an animal in the Livestock section first.</p>
                  )}
                </div>
              )}

              {/* Tab 7: Delivery Requests */}
              {activeMenuTab === 'delivery-requests' && (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 max-w-xl mx-auto space-y-6">
                  <div className="text-center">
                    <Truck className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                    <h3 className="font-display font-extrabold text-xl text-zinc-900 dark:text-white">Request transport Delivery</h3>
                    <p className="text-xs text-zinc-500">Schedule dispatch delivery for any owned livestock. We provide secure live-transport ventilation vehicles directly to your destination.</p>
                  </div>

                  <form onSubmit={handleDeliverySubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Select animal tag</label>
                        <select
                          value={delAnimalTag}
                          onChange={(e) => setDelAnimalTag(e.target.value)}
                          className="w-full px-4 py-2 rounded-xl border text-xs dark:bg-zinc-950 dark:border-zinc-800"
                        >
                          {ownedAnimals.map(a => (
                            <option key={a.id} value={a.tagNumber}>{a.tagNumber} ({a.breed})</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Preferred delivery date</label>
                        <input
                          type="date"
                          required
                          value={delDate}
                          onChange={(e) => setDelDate(e.target.value)}
                          className="w-full px-4 py-2 rounded-xl border text-xs dark:bg-zinc-950 dark:border-zinc-800 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Dispatch Purpose</label>
                        <select
                          value={delPurpose}
                          onChange={(e) => setDelPurpose(e.target.value)}
                          className="w-full px-4 py-2 rounded-xl border text-xs dark:bg-zinc-950 dark:border-zinc-800"
                        >
                          <option value="Sallah festival Sourcing">Sallah Sourcing</option>
                          <option value="Wedding reception">Wedding Sourcing</option>
                          <option value="Personal consumption">Personal consumption</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Transport Vehicle</label>
                        <input
                          type="text"
                          disabled
                          value="Ventilated live-transport van"
                          className="w-full px-4 py-2 rounded-xl border text-xs dark:bg-zinc-950 dark:border-zinc-800 bg-zinc-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Delivery Destination Address</label>
                      <textarea
                        required
                        rows={2}
                        value={delAddress}
                        onChange={(e) => setDelAddress(e.target.value)}
                        className="w-full p-4 rounded-xl border text-xs dark:bg-zinc-950 dark:border-zinc-800"
                      />
                    </div>

                    <button type="submit" className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold">
                      Confirm Specialized Transport Delivery
                    </button>
                  </form>

                  {delSuccess && (
                    <div className="p-3 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-xl text-center text-xs font-bold">
                      🎉 Transport Request Logged! CowPlugNG specialized transport will contact you.
                    </div>
                  )}

                  {/* Delivery History */}
                  <div className="pt-4 border-t dark:border-zinc-800">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase mb-3">Delivery History Logs</h4>
                    <div className="space-y-2">
                      {deliveryRequests.map((d, i) => (
                        <div key={i} className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl text-xs flex justify-between">
                          <div>
                            <p className="font-bold">Animal Tag: {d.animalTag} ({d.breed})</p>
                            <p className="text-[10px] text-zinc-400">Address: {d.address} • Date: {d.date}</p>
                          </div>
                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg self-center">{d.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 8: My Profile */}
              {activeMenuTab === 'profile' && (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 max-w-xl mx-auto space-y-6">
                  <div className="flex items-center space-x-4 border-b pb-4 dark:border-zinc-800">
                    <img src={currentUser.avatar} alt="User avatar" className="h-16 w-16 rounded-full border border-emerald-500 object-cover" />
                    <div>
                      <h3 className="font-display font-extrabold text-xl text-zinc-900 dark:text-white">{currentUser.fullName}</h3>
                      <p className="text-xs text-zinc-400">KYC Status: <span className="text-emerald-600 font-bold">Level 2 BVN Verified</span></p>
                    </div>
                  </div>

                  <div className="space-y-4 text-xs font-mono">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl">
                        <span className="text-zinc-400 block text-[9px]">Registered Email</span>
                        <strong className="text-zinc-800 dark:text-zinc-200 block mt-1">{currentUser.email}</strong>
                      </div>
                      <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl">
                        <span className="text-zinc-400 block text-[9px]">Phone Number</span>
                        <strong className="text-zinc-800 dark:text-zinc-200 block mt-1">{currentUser.phone || '+234 803 000 0000'}</strong>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl">
                        <span className="text-zinc-400 block text-[9px]">Security PIN Status</span>
                        <strong className="text-emerald-600 block mt-1">✓ Active Set</strong>
                      </div>
                      <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl">
                        <span className="text-zinc-400 block text-[9px]">Wallet Custody Pool</span>
                        <strong className="text-zinc-800 dark:text-zinc-200 block mt-1">Naira Escrow Account</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ==================== SELLER PORTAL ==================== */}
          {isSeller && (
            <div className="max-w-6xl mx-auto space-y-6">
              
              {/* Tab 1: Seller Overview */}
              {activeMenuTab === 'dashboard' && (
                <div className="space-y-6">
                  <div className="p-6 bg-linear-to-r from-amber-600 to-amber-700 dark:from-amber-700 dark:to-zinc-950 rounded-3xl text-white relative overflow-hidden shadow-lg">
                    <span className="text-[10px] font-mono bg-amber-500/20 border border-amber-400/20 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                      Partner Herder Workspace
                    </span>
                    <h2 className="font-display font-extrabold text-2xl mt-2">
                      As-salamu alaykum, {currentUser.fullName}!
                    </h2>
                    <p className="text-xs text-amber-100/90 mt-1 max-w-xl">
                      Manage your registered herder stock, log weights, and map healthy animals to customers. Your status is Level 3 Gold Partner Herder at Kaduna Livestock Zone B.
                    </p>
                  </div>

                  {/* Grounded Local Weather Widget */}
                  <WeatherWidget defaultLocation="Kaduna, Nigeria" ranchName="Kaduna Livestock Zone B" />

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase">Ranch Active Listings</span>
                      <strong className="text-lg text-zinc-900 dark:text-white block mt-1">{farmerLivestock.length} Animals</strong>
                      <span className="text-[9px] text-zinc-400">Total registered herd</span>
                    </div>
                    <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase">Herder verification</span>
                      <strong className="text-lg text-amber-500 block mt-1">Level 3 Partner</strong>
                      <span className="text-[9px] text-zinc-400">Veterinary approved</span>
                    </div>
                    <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase">Pending Wallet Proceeds</span>
                      <strong className="text-lg text-emerald-600 dark:text-emerald-400 font-mono block mt-1">₦{userBalance.toLocaleString()}</strong>
                      <span className="text-[9px] text-zinc-400">Ready for withdrawal</span>
                    </div>
                    <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase">Completed Dispatches</span>
                      <strong className="text-lg text-zinc-900 dark:text-white block mt-1">14 Animals</strong>
                      <span className="text-[9px] text-zinc-400">Van transport verified</span>
                    </div>
                  </div>

                  {/* Fast support form */}
                  <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Contact Chief Admin Desk</h4>
                    <p className="text-xs text-zinc-500">Need veterinary salt-licks, PPR vaccines, or transport approvals? Submit a secure ticket directly to CowPlugNG admins.</p>
                    <form onSubmit={(e) => { e.preventDefault(); alert('Your ticket has been cataloged. CowPlugNG admins will review your request.'); }} className="space-y-3">
                      <textarea
                        required
                        rows={2}
                        placeholder="Type ticket details (e.g., Requesting Q3 PPR booster dosage batch)..."
                        className="w-full p-3 border dark:border-zinc-800 rounded-xl text-xs"
                      />
                      <button type="submit" className="px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-xl">
                        Dispatch support ticket
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* Tab 2: Manage Herd */}
              {activeMenuTab === 'my-listings' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Register Form */}
                  <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl space-y-4">
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Register Partner Livestock Tag</h3>
                    
                    <form onSubmit={handleRegisterLivestock} className="space-y-3.5">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Livestock Category</label>
                        <div className="grid grid-cols-3 gap-2">
                          {(['Cow', 'Goat', 'Ram'] as const).map(cat => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setRegCategory(cat)}
                              className={`p-2 rounded-xl border text-xs font-bold ${
                                regCategory === cat ? 'bg-amber-600 text-white' : 'bg-transparent border-zinc-200 dark:border-zinc-800'
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Breed Specification</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Bunaji (White Fulani)"
                          value={regBreed}
                          onChange={(e) => setRegBreed(e.target.value)}
                          className="w-full px-4 py-2 rounded-xl border text-xs dark:bg-zinc-950 dark:border-zinc-800"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Weight (KG)</label>
                          <input
                            type="number"
                            required
                            placeholder="e.g. 310"
                            value={regWeight}
                            onChange={(e) => setRegWeight(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl border text-xs dark:bg-zinc-950 dark:border-zinc-800 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Age (Months)</label>
                          <input
                            type="number"
                            required
                            placeholder="e.g. 12"
                            value={regAge}
                            onChange={(e) => setRegAge(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl border text-xs dark:bg-zinc-950 dark:border-zinc-800 font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Assigned Custody Owner</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Alhaji Bashir Yusuf"
                          value={regOwnersName}
                          onChange={(e) => setRegOwnersName(e.target.value)}
                          className="w-full px-4 py-2 rounded-xl border text-xs dark:bg-zinc-950 dark:border-zinc-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Acquisition Price (₦)</label>
                        <input
                          type="number"
                          required
                          placeholder="e.g. 350000"
                          value={regPurchasePrice}
                          onChange={(e) => setRegPurchasePrice(e.target.value)}
                          className="w-full px-4 py-2 rounded-xl border text-xs dark:bg-zinc-950 dark:border-zinc-800 font-mono"
                        />
                      </div>

                      <button type="submit" className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold">
                        Register Livestock Tag
                      </button>
                    </form>
                    {farmerRegSuccess && (
                      <p className="text-xs text-amber-600 text-center font-bold">🎉 Registered successfully!</p>
                    )}
                  </div>

                  {/* Listings Grid */}
                  <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl space-y-4">
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Active Herder Registry Herd</h3>
                    <div className="space-y-3 max-h-[500px] overflow-y-auto">
                      {farmerLivestock.map((an) => (
                        <div key={an.id} className="p-3 border dark:border-zinc-800 rounded-xl text-xs flex justify-between">
                          <div className="flex items-center space-x-3">
                            <img src={an.photo} alt="animal" className="h-9 w-9 rounded-lg object-cover" />
                            <div>
                              <p className="font-bold">{an.breed}</p>
                              <p className="text-[10px] text-zinc-400">Tag: {an.tagNumber} • Owner: {an.ownersName}</p>
                            </div>
                          </div>
                          <span className="font-mono text-zinc-500 self-center">{an.weightKg} kg</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* Tab 3: Customer Orders */}
              {activeMenuTab === 'orders' && (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl space-y-4">
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Customer Sourcing & Purchase Orders</h3>
                  <p className="text-xs text-zinc-500">List of customer orders boarded at your ranch cooperative section.</p>
                  <div className="space-y-2">
                    {farmerLivestock.slice(0, 3).map((an, i) => (
                      <div key={i} className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl text-xs flex justify-between">
                        <div>
                          <p className="font-bold">Order CPG-{1000 + i}</p>
                          <p className="text-[10px] text-zinc-400">Purchased by: {an.ownersName || 'Alhaji Bashir Yusuf'} • Date: {an.datePurchased}</p>
                        </div>
                        <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg self-center">Paid & Boarded</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 4: Sales & Revenue */}
              {activeMenuTab === 'sales' && (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl space-y-4">
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Ranch Sales ledger</h3>
                  <p className="text-xs text-zinc-500">Complete summary of proceeds cataloged from marketplace listings.</p>
                  <div className="space-y-2">
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl text-xs flex justify-between">
                      <div>
                        <p className="font-bold">Bunaji (White Fulani) Tag: CPG-CW-001</p>
                        <p className="text-[10px] text-zinc-400">Sold to Alhaji Bashir Yusuf on 2026-06-28</p>
                      </div>
                      <strong className="text-emerald-650 dark:text-emerald-400 font-mono self-center">₦350,000</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 5: Payments */}
              {activeMenuTab === 'payments' && (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl max-w-xl mx-auto space-y-4">
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Seller Wallet & Bank Payouts</h3>
                  <p className="text-xs text-zinc-500">Secure withdrawal coordinates for verified herders.</p>
                  <form onSubmit={handleWithdraw} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 mb-1">Payout Amount (₦)</label>
                        <input
                          type="number"
                          required
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          className="w-full px-4 py-2 rounded-xl border text-xs dark:bg-zinc-950 dark:border-zinc-800 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 mb-1">Bank Name</label>
                        <input
                          type="text"
                          required
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          className="w-full px-4 py-2 rounded-xl border text-xs dark:bg-zinc-950 dark:border-zinc-800"
                        />
                      </div>
                    </div>
                    <button type="submit" className="w-full py-2.5 bg-amber-600 text-white rounded-xl text-xs font-bold">
                      Withdraw Proceeds
                    </button>
                  </form>
                  {withdrawSuccess && (
                    <p className="text-xs text-emerald-600 text-center font-bold">Payout request filed successfully!</p>
                  )}
                </div>
              )}

              {/* Tab 6: Profile */}
              {activeMenuTab === 'profile' && (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 max-w-xl mx-auto space-y-4">
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Herder partner credentials</h3>
                  <div className="flex items-center space-x-3">
                    <img src={currentUser.avatar} alt="Farm profile" className="h-12 w-12 rounded-full border border-amber-500 object-cover" />
                    <div>
                      <h4 className="font-bold text-sm">{currentUser.fullName}</h4>
                      <p className="text-[10px] text-zinc-400">Cooperative ID: #COOP-KAD-941</p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ==================== PLATFORM ADMIN PORTAL ==================== */}
          {isAdmin && (
            <div className="max-w-6xl mx-auto space-y-6">
              
              {/* Tab 1: Admin Overview */}
              {activeMenuTab === 'dashboard' && (
                <div className="space-y-6">
                  <div className="p-6 bg-zinc-900 text-white rounded-3xl relative overflow-hidden shadow-lg">
                    <span className="text-[10px] font-mono bg-zinc-800 border border-zinc-700 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                      Internal Admin Console
                    </span>
                    <h2 className="font-display font-extrabold text-2xl mt-2">
                      Amina Bello • Chief Coordinator
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1">
                      CowPlugNG platform operations core. Dispatched alerts are logged on the public ledger.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase">System Users pool</span>
                      <strong className="text-lg block mt-1">{usersList.length} Active Accounts</strong>
                    </div>
                    <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase">Ranch Active listings</span>
                      <strong className="text-lg block mt-1">{farmerLivestock.length} Animals</strong>
                    </div>
                    <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase">Pending dispatches</span>
                      <strong className="text-lg text-amber-500 block mt-1">{deliveryRequests.length} Scheduled</strong>
                    </div>
                    <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase">Escrow deposits pool</span>
                      <strong className="text-lg text-emerald-600 font-mono block mt-1">₦{usersList.reduce((sum, u) => sum + u.balance, 0).toLocaleString()}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Dispatch Alerts */}
              {activeMenuTab === 'notifications' && (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 max-w-xl mx-auto space-y-4">
                  <h3 className="font-bold text-sm flex items-center"><Syringe className="h-5 w-5 text-emerald-600 mr-2" /> Admin Alerts Broadcast Dispatch</h3>
                  
                  <form onSubmit={handleAdminDispatchNotif} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Alert Category</label>
                        <select
                          value={notifType}
                          onChange={(e) => setNotifType(e.target.value as any)}
                          className="w-full px-4 py-2 rounded-xl border text-xs dark:bg-zinc-950 dark:border-zinc-800"
                        >
                          <option value="vaccination">💉 Vaccination Schedule</option>
                          <option value="feed">🥗 Feeding Rations</option>
                          <option value="drug">💊 Medication booster</option>
                          <option value="system">🔔 Platform alert</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Alert Title</label>
                        <input
                          type="text"
                          required
                          value={notifTitle}
                          onChange={(e) => setNotifTitle(e.target.value)}
                          className="w-full px-4 py-2 rounded-xl border text-xs dark:bg-zinc-950 dark:border-zinc-800"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Broadcast Message</label>
                      <textarea
                        required
                        rows={3}
                        value={notifMsg}
                        onChange={(e) => setNotifMsg(e.target.value)}
                        className="w-full p-4 border dark:border-zinc-800 rounded-xl text-xs focus:border-emerald-500"
                      />
                    </div>

                    <button type="submit" className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold">
                      Broadcast alert ledger alert
                    </button>
                  </form>
                  {adminDispatchSuccess && (
                    <p className="text-xs text-emerald-600 font-bold text-center animate-pulse">Alert ledger dispatched successfully to platform clients!</p>
                  )}
                </div>
              )}

              {/* Tab 3: Global Registry */}
              {activeMenuTab === 'registry' && (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl space-y-4">
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Platform Global Registry Logs</h3>
                  <div className="overflow-x-auto text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b dark:border-zinc-800 text-zinc-400 uppercase">
                          <th className="py-2 font-bold">Tag ID</th>
                          <th className="py-2 font-bold">Breed</th>
                          <th className="py-2 font-bold">Category</th>
                          <th className="py-2 font-bold">Custody Owner</th>
                          <th className="py-2 font-bold">Weight (KG)</th>
                          <th className="py-2 font-bold">Health</th>
                        </tr>
                      </thead>
                      <tbody>
                        {farmerLivestock.map((an, idx) => (
                          <tr key={idx} className="border-b dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-950">
                            <td className="py-2.5 font-mono font-bold text-emerald-600">{an.tagNumber}</td>
                            <td className="py-2.5">{an.breed}</td>
                            <td className="py-2.5">{an.category}</td>
                            <td className="py-2.5">{an.ownersName || 'Mallam Musa'}</td>
                            <td className="py-2.5 font-mono">{an.weightKg} kg</td>
                            <td className="py-2.5 text-emerald-600 font-bold">{an.healthStatus}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ==================== COMMON PORTAL VIEWS ==================== */}
          {activeMenuTab === 'notifications' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display font-extrabold text-2xl text-zinc-900 dark:text-white">Workspace Notifications</h2>
                  <p className="text-xs text-zinc-500">Stay updated with transaction logs, veterinary updates, and delivery status alerts.</p>
                </div>
                {onMarkNotificationsRead && (
                  <button
                    onClick={onMarkNotificationsRead}
                    className="px-4 py-2 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 dark:text-emerald-400 rounded-xl transition-all"
                  >
                    Mark All Read
                  </button>
                )}
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
                {notifications && notifications.length > 0 ? (
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {notifications.map((notif) => (
                      <div key={notif.id} className={`p-5 flex items-start gap-4 transition-colors ${notif.read ? 'opacity-70' : 'bg-emerald-50/20 dark:bg-emerald-950/5'}`}>
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                          notif.type === 'system' ? 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300' :
                          (notif.type === 'payout' || notif.type === 'sale') ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' :
                          'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                        }`}>
                          <AlertCircle className="h-5 w-5" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <strong className="text-sm text-zinc-900 dark:text-white font-bold">{notif.title}</strong>
                            <span className="text-[10px] text-zinc-400 font-mono">{new Date(notif.date).toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{notif.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center space-y-3">
                    <div className="h-12 w-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
                      <AlertCircle className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">No Notifications Yet</p>
                    <p className="text-xs text-zinc-500 max-w-xs mx-auto">We'll alert you here when there are updates on your livestock or orders.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeMenuTab === 'settings' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div>
                <h2 className="font-display font-extrabold text-2xl text-zinc-900 dark:text-white">Account Settings</h2>
                <p className="text-xs text-zinc-500">Configure notifications, security layers, and check verification details.</p>
              </div>

              {/* KYC Status Card */}
              <div className="p-6 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-200/50 dark:border-emerald-900/30 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 rounded-2xl flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <strong className="text-sm text-zinc-900 dark:text-white block font-bold">Oyo State KYC Verification Status</strong>
                    <p className="text-xs text-zinc-500 mt-0.5">Level 2 verified for high-volume transactions and live pasture streaming.</p>
                  </div>
                </div>
                <span className="self-start sm:self-center px-3 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded-full">
                  ✓ FULLY VERIFIED
                </span>
              </div>

              {/* Settings Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Security Settings */}
                <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-4">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Lock className="h-4.5 w-4.5 text-emerald-600" /> Workspace Security
                  </h3>
                  <div className="space-y-4 divide-y divide-zinc-100 dark:divide-zinc-850">
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <strong className="text-xs text-zinc-800 dark:text-zinc-200 block font-bold">Two-Factor Authentication (MFA)</strong>
                        <span className="text-[10px] text-zinc-400 block">Require secure TOTP verification for wallet fund withdrawals.</span>
                      </div>
                      <button className="w-9 h-5 bg-emerald-600 rounded-full p-0.5 transition-colors duration-200">
                        <div className="bg-white w-4 h-4 rounded-full shadow-md transform translate-x-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-3">
                      <div>
                        <strong className="text-xs text-zinc-800 dark:text-zinc-200 block font-bold">Biometric Authentication Setup</strong>
                        <span className="text-[10px] text-zinc-400 block">Use FaceID or Fingerprint scanning for express mobile authorization.</span>
                      </div>
                      <button className="w-9 h-5 bg-zinc-300 dark:bg-zinc-800 rounded-full p-0.5 transition-colors duration-200">
                        <div className="bg-white w-4 h-4 rounded-full shadow-md transform translate-x-0" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notification Settings */}
                <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-4">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <AlertCircle className="h-4.5 w-4.5 text-emerald-600" /> Notifications & Alerts
                  </h3>
                  <div className="space-y-4 divide-y divide-zinc-100 dark:divide-zinc-850">
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <strong className="text-xs text-zinc-800 dark:text-zinc-200 block font-bold">WhatsApp Vet Status Reports</strong>
                        <span className="text-[10px] text-zinc-400 block">Get daily weigh-ins and medical reports directly to your WhatsApp.</span>
                      </div>
                      <button className="w-9 h-5 bg-emerald-600 rounded-full p-0.5 transition-colors duration-200">
                        <div className="bg-white w-4 h-4 rounded-full shadow-md transform translate-x-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-3">
                      <div>
                        <strong className="text-xs text-zinc-800 dark:text-zinc-200 block font-bold">SMS Feed Log Alerts</strong>
                        <span className="text-[10px] text-zinc-400 block">Urgent text alerts when custom dietary feed limits are reached.</span>
                      </div>
                      <button className="w-9 h-5 bg-emerald-600 rounded-full p-0.5 transition-colors duration-200">
                        <div className="bg-white w-4 h-4 rounded-full shadow-md transform translate-x-4" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </main>
      </div>

      {/* Ownership Certificate Modal Overlay */}
      <AnimatePresence>
        {showCertificate && currentSelectedAnimal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-white text-zinc-900 rounded-3xl p-8 border-[12px] border-emerald-900 shadow-2xl space-y-6"
            >
              {/* Elegant double border ornament */}
              <div className="absolute inset-2 border-2 border-amber-500/30 rounded-xl pointer-events-none" />

              {/* Header */}
              <div className="text-center space-y-1 relative z-10">
                <span className="text-3xl">🇳🇬</span>
                <h2 className="font-display font-black text-xs uppercase tracking-widest text-emerald-800">
                  CowPlug Platform Services Ltd
                </h2>
                <div className="text-[10px] text-zinc-400 font-mono tracking-wider">
                  REGISTRY NUMBER: CPG-REG-{currentSelectedAnimal.id.substring(0, 8).toUpperCase()}
                </div>
              </div>

              {/* Title Section */}
              <div className="text-center py-4 relative z-10">
                <h1 className="font-display font-black text-2xl text-emerald-950 tracking-tight leading-none uppercase">
                  Certificate of Ownership
                </h1>
                <div className="h-[2px] w-24 bg-amber-500 mx-auto mt-2" />
                <p className="text-xs italic text-zinc-500 mt-3">
                  This certifies that the under-signed individual is the legally registered owner of
                </p>
              </div>

              {/* Owner details */}
              <div className="text-center space-y-1 relative z-10">
                <div className="font-display font-black text-lg text-zinc-900 tracking-tight">
                  {currentUser.fullName}
                </div>
                <p className="text-[11px] text-zinc-500 max-w-md mx-auto leading-relaxed">
                  and holds the title to the following fully inspected, microchipped and vaccinated livestock asset managed at CowPlugNG Authorized Agro-Escrow Hubs.
                </p>
              </div>

              {/* Animal spec card */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 grid grid-cols-2 gap-4 text-xs font-mono relative z-10 shadow-inner">
                <div>
                  <span className="text-[9px] text-zinc-400 block uppercase font-bold">Livestock Breed</span>
                  <strong className="text-zinc-800 text-sm font-sans">{currentSelectedAnimal.breed}</strong>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-400 block uppercase font-bold">Official Tag Number</span>
                  <strong className="text-emerald-700 text-sm">{currentSelectedAnimal.tagNumber}</strong>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-400 block uppercase font-bold">Weight & Spec</span>
                  <span className="text-zinc-700">{currentSelectedAnimal.weightKg} kg • {currentSelectedAnimal.ageMonths} Months</span>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-400 block uppercase font-bold">Assigned Location</span>
                  <span className="text-zinc-700">{currentSelectedAnimal.feedingPlan ? 'Oyo Pasture Range C' : 'Kano Feedlot B'}</span>
                </div>
                <div className="col-span-2 border-t pt-2 mt-1">
                  <span className="text-[9px] text-zinc-400 block uppercase font-bold">Vaccinations Profile</span>
                  <span className="text-zinc-700 text-[10px] leading-tight block">
                    {currentSelectedAnimal.vaccinations ? currentSelectedAnimal.vaccinations.join(', ') : 'PPR Vaccine, FMD Booster, Deworming'}
                  </span>
                </div>
              </div>

              {/* Signatures & Seal */}
              <div className="grid grid-cols-3 items-center pt-4 relative z-10">
                {/* Left Signature */}
                <div className="text-center space-y-1">
                  <div className="font-serif italic text-xs text-zinc-700 border-b pb-1">
                    Alhaji Isa Bello
                  </div>
                  <div className="text-[9px] text-zinc-400 uppercase tracking-wider">
                    Oyo Ranch Lead
                  </div>
                </div>

                {/* Center Gold Seal */}
                <div className="flex justify-center">
                  <div className="h-16 w-16 bg-amber-500 rounded-full border-4 border-amber-600 flex flex-col items-center justify-center text-white shadow-lg relative">
                    {/* Seal Star Ring */}
                    <div className="absolute inset-0.5 border border-dashed border-white rounded-full animate-spin-slow" />
                    <Award className="h-8 w-8 text-white relative z-10" />
                    <span className="text-[6px] font-bold tracking-widest uppercase">COWPLUG</span>
                  </div>
                </div>

                {/* Right Signature */}
                <div className="text-center space-y-1">
                  <div className="font-serif italic text-xs text-zinc-700 border-b pb-1">
                    Dr. S. Ogunleye
                  </div>
                  <div className="text-[9px] text-zinc-400 uppercase tracking-wider">
                    Registry Officer
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 justify-end relative z-10">
                <button
                  onClick={() => {
                    alert("Official cryptographic title document PDF downloaded successfully to local storage!");
                  }}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-950 text-white rounded-xl text-xs font-bold shadow transition-colors cursor-pointer"
                >
                  Download Title PDF
                </button>
                <button
                  onClick={() => setShowCertificate(false)}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Close Registry
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
