import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ShieldAlert, LogIn, X, Users, Briefcase, TrendingUp, Leaf, Zap, Home, ShoppingBag, Heart, DollarSign, User as UserIcon } from 'lucide-react';

import { User, UserInvestment, FarmerLivestock, AppNotification, MarketplaceAnimal } from './types';
import { Invoice } from './types_payments';
import { INITIAL_NOTIFICATIONS } from './data';

import { AdminOrderManagementCenterModal, Order } from './components/AdminOrderManagementCenterModal';
import { AdminNotificationCenterModal, AdminNotification } from './components/AdminNotificationCenterModal';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Marketplace from './components/Marketplace';
import MeatSupply from './components/MeatSupply';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import BlogFAQ from './components/BlogFAQ';
import Contact from './components/Contact';
import Footer from './components/Footer';
import MarketRates from './components/MarketRates';
import LiteModeApp from './components/LiteModeApp';

// Quick Preset Users for reviewers to instantly preview CowPlugNG's custom dashboards
const PRESET_USERS: Record<'investor' | 'farmer' | 'admin', User> = {
  investor: {
    id: '101',
    fullName: 'Alhaji Bashir Yusuf',
    email: 'bashir@yusuf-holdings.com',
    role: 'investor',
    phone: '+234 803 555 1234',
    balance: 1450000, // ₦1,450,000 NGN
    investmentsCount: 2,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
  },
  farmer: {
    id: '102',
    fullName: 'Mallam Musa Ibrahim',
    email: 'musa.farm@cowplug.ng',
    role: 'farmer',
    phone: '+234 809 777 4321',
    balance: 85000,
    investmentsCount: 0,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
  },
  admin: {
    id: '103',
    fullName: 'Dr. Amina Bello (COO)',
    email: 'amina.bello@cowplug.ng',
    role: 'admin',
    phone: '+234 812 345 6789',
    balance: 0,
    investmentsCount: 0,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
  }
};

const INITIAL_USER_INVESTMENTS: UserInvestment[] = [
  {
    id: 'user-inv-init',
    investmentId: 'inv-1',
    investmentTitle: 'Ankole Cattle Herd Batch-E',
    type: 'Cow',
    slotsBought: 2,
    amountInvested: 700000,
    expectedProfit: 196000, // 28% ROI
    startDate: '2026-06-15',
    endDate: '2027-03-15',
    status: 'Active',
    progress: 35
  }
];

const INITIAL_FARMER_LIVESTOCK: FarmerLivestock[] = [
  {
    id: 'live-1',
    tagNumber: 'CPG-CW-001',
    breed: 'White Fulani (Bunaji)',
    category: 'Cow',
    weightKg: 310,
    ageMonths: 22,
    healthStatus: 'Excellent (Green Register)',
    photo: 'https://images.unsplash.com/photo-1527153857715-3908f2bac5e8?auto=format&fit=crop&q=80&w=600',
    vaccinations: ['FMD Vaccine', 'PPR Booster', 'Deworming Q1', 'Deworming Q2'],
    lastVetCheck: '2026-06-25',
    datePurchased: '2026-01-10',
    purchasePrice: 180000,
    feedingPlan: 'High-Protein Feedstock, Corn Silage & Legume Forage (Alfalfa)',
    ownersName: 'Dare Tugbobo',
    estimatedValue: 350000,
    videos: ['https://assets.mixkit.co/videos/preview/mixkit-cows-in-a-green-meadow-40248-large.mp4'],
    weightHistory: [
      { date: 'Jan 2026', weightKg: 220 },
      { date: 'Feb 2026', weightKg: 235 },
      { date: 'Mar 2026', weightKg: 255 },
      { date: 'Apr 2026', weightKg: 275 },
      { date: 'May 2026', weightKg: 295 },
      { date: 'Jun 2026', weightKg: 310 }
    ]
  },
  {
    id: 'live-2',
    tagNumber: 'CPG-CW-002',
    breed: 'Sokoto Gudali',
    category: 'Cow',
    weightKg: 345,
    ageMonths: 24,
    healthStatus: 'Excellent (Green Register)',
    photo: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&q=80&w=600',
    vaccinations: ['FMD Booster', 'PPR Booster', 'Deworming Q2'],
    lastVetCheck: '2026-06-28',
    datePurchased: '2025-12-15',
    purchasePrice: 200000,
    feedingPlan: 'Grain-Finished, Mixed Grain Ration & High-Fiber Hay',
    ownersName: 'Adebayo Johnson',
    estimatedValue: 410000,
    videos: [],
    weightHistory: [
      { date: 'Jan 2026', weightKg: 260 },
      { date: 'Feb 2026', weightKg: 278 },
      { date: 'Mar 2026', weightKg: 295 },
      { date: 'Apr 2026', weightKg: 312 },
      { date: 'May 2026', weightKg: 330 },
      { date: 'Jun 2026', weightKg: 345 }
    ]
  },
  {
    id: 'live-3',
    tagNumber: 'CPN-2104',
    breed: 'Red Sokoto',
    category: 'Goat',
    weightKg: 32,
    ageMonths: 12,
    healthStatus: 'Under Observation (Minor Fat)',
    photo: 'https://images.unsplash.com/photo-1608539733291-a1dfc76b9789?auto=format&fit=crop&q=80&w=600',
    vaccinations: ['PPR Booster', 'Peste des Petits Ruminants Vaccine'],
    lastVetCheck: '2026-06-30',
    datePurchased: '2026-03-20',
    purchasePrice: 350000, // or 35,000, let's keep it realistic but nice
    feedingPlan: 'Foraging/Grass-fed & Concentrate Feed Mix',
    ownersName: 'Chioma Obi',
    estimatedValue: 850000,
    videos: [],
    weightHistory: [
      { date: 'Mar 2026', weightKg: 22 },
      { date: 'Apr 2026', weightKg: 25 },
      { date: 'May 2026', weightKg: 29 },
      { date: 'Jun 2026', weightKg: 32 }
    ]
  }
];

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('cp_user');
    return saved ? JSON.parse(saved) : null; // Default to null for guest mode
  });

  const [activeSection, setActiveSection] = useState<string>(() => {
    const savedUser = localStorage.getItem('cp_user');
    if (savedUser) {
      const savedSection = localStorage.getItem('cp_last_section');
      if (savedSection && savedSection !== 'home' && savedSection !== 'home-public' && savedSection !== 'admin-login') {
        return savedSection;
      }
      return 'dashboard';
    }
    return 'home';
  });

  const [dashboardTab, setDashboardTab] = useState<string>(() => {
    const savedUser = localStorage.getItem('cp_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      const savedTab = localStorage.getItem('cp_last_tab');
      if (savedTab) return savedTab;
      return user.role === 'admin' ? 'overview' : 'dashboard';
    }
    return 'dashboard';
  });

  const [darkMode, setDarkMode] = useState(false);
  
  const [experienceMode, setExperienceMode] = useState<'lite' | 'pro'>(() => {
    const saved = localStorage.getItem('cp_experience_mode');
    return (saved as 'lite' | 'pro') || 'lite';
  });

  const [liteActiveTab, setLiteActiveTab] = useState<'home' | 'buy' | 'my-animals' | 'find-animal' | 'payments' | 'receive' | 'profile'>(() => {
    const saved = localStorage.getItem('cp_lite_active_tab');
    return (saved as any) || 'home';
  });

  const [showFirstLaunchModal, setShowFirstLaunchModal] = useState(() => {
    return !localStorage.getItem('cp_experience_mode_chosen');
  });

  useEffect(() => {
    localStorage.setItem('cp_experience_mode', experienceMode);
  }, [experienceMode]);

  useEffect(() => {
    localStorage.setItem('cp_lite_active_tab', liteActiveTab);
  }, [liteActiveTab]);

  const [marketRatesTab, setMarketRatesTab] = useState<'livestock' | 'feed'>('livestock');

  // Persistent registered users list
  const [usersList, setUsersList] = useState<User[]>(() => {
    const saved = localStorage.getItem('cp_users_list');
    if (saved) return JSON.parse(saved);
    return [PRESET_USERS.investor, PRESET_USERS.farmer, PRESET_USERS.admin];
  });

  useEffect(() => {
    localStorage.setItem('cp_users_list', JSON.stringify(usersList));
  }, [usersList]);

  // Admin Control Overlays States
  const [isAdminOrdersOpen, setIsAdminOrdersOpen] = useState(false);
  const [isAdminNotifOpen, setIsAdminNotifOpen] = useState(false);

  const [adminOrders, setAdminOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('cp_admin_orders');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'ord-1',
        orderNumber: 'ORD-9201',
        customerName: 'Babajide Cole',
        customerEmail: 'babajide@cole-estates.ng',
        customerPhone: '+234 803 111 2222',
        animalType: 'Cow',
        breed: 'Sokoto Gudali',
        packageType: 'Premium Fattening',
        amount: 450000,
        date: '2026-07-04',
        invoiceId: 'inv-9201',
        status: 'Pending',
        fulfillmentStep: 'Awaiting Payment'
      },
      {
        id: 'ord-2',
        orderNumber: 'ORD-3810',
        customerName: 'Abiodun Kolawole',
        customerEmail: 'abiodun.k@kolawole.ng',
        customerPhone: '+234 809 333 4444',
        animalType: 'Goat',
        breed: 'Red Sokoto',
        packageType: 'Supplement Diet',
        amount: 95000,
        date: '2026-07-03',
        invoiceId: 'inv-3810',
        bankPaidInto: 'Access Bank',
        uploadedReceipt: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=600',
        transactionReference: 'TXN-839218392',
        status: 'Paid',
        fulfillmentStep: 'Awaiting Verification'
      },
      {
        id: 'ord-3',
        orderNumber: 'ORD-5722',
        customerName: 'Chioma Nze',
        customerEmail: 'chioma.nze@gmail.com',
        customerPhone: '+234 812 555 6666',
        animalType: 'Ram',
        breed: 'Balami Premium',
        packageType: 'Seasonal Festive Plan',
        amount: 150000,
        date: '2026-07-01',
        invoiceId: 'inv-5722',
        bankPaidInto: 'Zenith Bank',
        uploadedReceipt: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=600',
        transactionReference: 'TXN-572210382',
        status: 'Fulfillment',
        fulfillmentStep: 'Veterinary Inspection'
      },
      {
        id: 'ord-4',
        orderNumber: 'ORD-1049',
        customerName: 'Aremu Shittu',
        customerEmail: 'aremu.shittu@yahoo.com',
        customerPhone: '+234 705 777 8888',
        animalType: 'Cow',
        breed: 'White Fulani',
        packageType: 'Pasture Only',
        amount: 350000,
        date: '2026-06-28',
        invoiceId: 'inv-1049',
        bankPaidInto: 'Access Bank',
        uploadedReceipt: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=600',
        transactionReference: 'TXN-10499238',
        status: 'Fulfillment',
        fulfillmentStep: 'In Transit'
      }
    ];
  });

  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>(() => {
    const saved = localStorage.getItem('cp_admin_notifications');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'an-1',
        category: 'User Activity',
        title: 'New user registration',
        message: 'Abiodun Kolawole registered as a Livestock Investor from Lagos node.',
        date: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        read: false,
        severity: 'info',
        metadata: { Node: 'Lagos-East', Role: 'Investor', Device: 'iOS Mobile' }
      },
      {
        id: 'an-2',
        category: 'Payments',
        title: 'Payment receipt uploaded',
        message: 'Manual bank transfer receipt uploaded for INV-3810 by Abiodun Kolawole.',
        date: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        read: false,
        severity: 'warning',
        metadata: { Amount: '₦95,000', Bank: 'Access Bank', Invoice: 'INV-3810' }
      },
      {
        id: 'an-3',
        category: 'Marketplace',
        title: 'Listing awaiting approval',
        message: 'White Fulani Cow listed by Farmer Chioma Nze is awaiting supervisor review.',
        date: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        read: false,
        severity: 'info',
        metadata: { Breed: 'White Fulani', Weight: '350kg', Seller: 'Chioma Nze' }
      },
      {
        id: 'an-4',
        category: 'Livestock',
        title: 'Health alert',
        message: 'Animal tag #C-2938 (Bunaji Cow) has high temperature reading in Oyo Sector B.',
        date: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        read: false,
        severity: 'danger',
        metadata: { 'Tag Number': '#C-2938', Temp: '40.2°C', Sector: 'Oyo B' }
      },
      {
        id: 'an-5',
        category: 'Orders',
        title: 'New purchase request',
        message: 'Corporate purchase request of 500kg dressed beef submitted by Sterling Hotels Ltd.',
        date: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        read: true,
        severity: 'info',
        metadata: { Client: 'Sterling Hotels', Volume: '500kg', Value: '₦1,850,000' }
      },
      {
        id: 'an-6',
        category: 'Security',
        title: 'Suspicious activities',
        message: 'Multiple rapid login requests detected from unverified IP: 197.210.44.12 (Ibadan).',
        date: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
        read: false,
        severity: 'danger',
        metadata: { IP: '197.210.44.12', Attemps: '12', City: 'Ibadan' }
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('cp_admin_orders', JSON.stringify(adminOrders));
  }, [adminOrders]);

  useEffect(() => {
    localStorage.setItem('cp_admin_notifications', JSON.stringify(adminNotifications));
  }, [adminNotifications]);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register-choose' | 'register-form'>('login');
  const [selectedRegRole, setSelectedRegRole] = useState<'investor' | 'farmer'>('investor');

  // Secure admin hash listener & manual homepage routing with logged-in dashboard redirect
  useEffect(() => {
    const handleUrlRouting = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (hash === '#admin-login') {
        setActiveSection('admin-login');
      } else if (path === '/home' || hash === '#home' || hash === '#home-public' || path === '/') {
        if (currentUser) {
          setActiveSection('dashboard');
        } else {
          setActiveSection('home');
        }
      }
    };
    window.addEventListener('popstate', handleUrlRouting);
    window.addEventListener('hashchange', handleUrlRouting);
    handleUrlRouting();
    return () => {
      window.removeEventListener('popstate', handleUrlRouting);
      window.removeEventListener('hashchange', handleUrlRouting);
    };
  }, [currentUser]);

  // Immediate auto-redirect upon authentication
  useEffect(() => {
    if (currentUser) {
      if (activeSection === 'home' || activeSection === 'home-public') {
        setActiveSection('dashboard');
      }
    }
  }, [currentUser, activeSection]);

  // Ledger / Balance Storage
  const [userBalance, setUserBalance] = useState<number>(() => {
    const saved = localStorage.getItem('cp_balance');
    return saved ? Number(saved) : (currentUser ? currentUser.balance : 0);
  });

  // Investments Storage
  const [userInvestments, setUserInvestments] = useState<UserInvestment[]>(() => {
    const saved = localStorage.getItem('cp_investments');
    return saved ? JSON.parse(saved) : INITIAL_USER_INVESTMENTS;
  });

  // Farmer Livestock Storage
  const [farmerLivestock, setFarmerLivestock] = useState<FarmerLivestock[]>(() => {
    const saved = localStorage.getItem('cp_livestock');
    return saved ? JSON.parse(saved) : INITIAL_FARMER_LIVESTOCK;
  });

  // Notifications Storage
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('cp_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Marketplace Cart Storage
  const [cartItems, setCartItems] = useState<{ animal: MarketplaceAnimal; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Invoices Storage
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('cp_invoices');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cp_invoices', JSON.stringify(invoices));
  }, [invoices]);

  const handleAddInvoice = (inv: Invoice) => {
    setInvoices(prev => [inv, ...prev]);
  };

  const handleUpdateInvoice = (id: string, updates: Partial<Invoice>) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, ...updates } : inv));
  };

  // Persist States
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('cp_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('cp_user');
      localStorage.removeItem('cp_last_section');
      localStorage.removeItem('cp_last_tab');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('cp_last_section', activeSection);
  }, [activeSection]);

  useEffect(() => {
    localStorage.setItem('cp_last_tab', dashboardTab);
  }, [dashboardTab]);

  useEffect(() => {
    localStorage.setItem('cp_balance', userBalance.toString());
  }, [userBalance]);

  useEffect(() => {
    localStorage.setItem('cp_investments', JSON.stringify(userInvestments));
  }, [userInvestments]);

  useEffect(() => {
    localStorage.setItem('cp_livestock', JSON.stringify(farmerLivestock));
  }, [farmerLivestock]);

  useEffect(() => {
    localStorage.setItem('cp_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Quick Action handlers
  const handleFundBalance = (amt: number) => {
    setUserBalance((prev) => prev + amt);
  };

  const handleWithdrawBalance = (amt: number) => {
    setUserBalance((prev) => Math.max(0, prev - amt));
  };

  const handleDeductBalance = (amt: number) => {
    setUserBalance((prev) => Math.max(0, prev - amt));
  };

  const handleAddUserInvestment = (newInv: UserInvestment) => {
    setUserInvestments((prev) => [newInv, ...prev]);
  };

  const handleAddFarmerLivestock = (newLive: FarmerLivestock) => {
    setFarmerLivestock((prev) => [newLive, ...prev]);
  };

  const handleDispatchNotification = (newNotif: AppNotification) => {
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleMarkNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleUpdateUserBalance = (email: string, amt: number) => {
    setUsersList(prev => prev.map(u => {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        const newBal = u.balance + amt;
        return { ...u, balance: newBal };
      }
      return u;
    }));
    if (currentUser && currentUser.email.toLowerCase() === email.toLowerCase()) {
      setUserBalance(prev => prev + amt);
      setCurrentUser(prev => prev ? { ...prev, balance: prev.balance + amt } : null);
    }
  };

  const handleUpdateUser = (id: string, updates: Partial<User>) => {
    setUsersList(prev => prev.map(u => {
      if (u.id === id) {
        const updated = { ...u, ...updates };
        if (currentUser && currentUser.id === id) {
          setCurrentUser(updated);
          if (updates.balance !== undefined) {
            setUserBalance(updates.balance);
          }
        }
        return updated;
      }
      return u;
    }));
  };

  const handleAddToCart = (animal: MarketplaceAnimal) => {
    setCartItems((prev) => {
      const exists = prev.find((item) => item.animal.id === animal.id);
      if (exists) return prev;
      return [...prev, { animal, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.animal.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleQuickLogin = (role: 'investor' | 'farmer' | 'admin') => {
    const preset = PRESET_USERS[role];
    setCurrentUser(preset);
    setUserBalance(preset.balance);
    setAuthModalOpen(false);
    setActiveSection('dashboard');
    setDashboardTab(role === 'admin' ? 'overview' : 'dashboard');
  };

  const handleCustomLogin = (email: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    const foundUser = usersList.find((u) => u.email.toLowerCase() === trimmedEmail);
    if (foundUser) {
      setCurrentUser(foundUser);
      setUserBalance(foundUser.balance);
      setAuthModalOpen(false);
      setActiveSection('dashboard');
      setDashboardTab(foundUser.role === 'admin' ? 'overview' : 'dashboard');
      return true;
    }
    return false;
  };

  const handleCustomRegister = (fullName: string, email: string, phone: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    const existing = usersList.find((u) => u.email.toLowerCase() === trimmedEmail);
    if (existing) {
      return false; // Email already registered
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      email: trimmedEmail,
      fullName: fullName,
      role: selectedRegRole, // 'investor' or 'farmer'
      phone: phone || '+234 803 000 0000',
      balance: selectedRegRole === 'investor' ? 500000 : 0, // Give custom test balance to new customers
      investmentsCount: 0,
      avatar: selectedRegRole === 'investor'
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
    };

    setUsersList((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    setUserBalance(newUser.balance);
    setAuthModalOpen(false);
    setActiveSection('dashboard');
    setDashboardTab(newUser.role === 'admin' ? 'overview' : 'dashboard');
    return true;
  };

  const handlePurchaseLivestock = (
    animals: MarketplaceAnimal[],
    option: 'deliver' | 'farm',
    feedingPlan?: string,
    animalPackages?: Record<string, string>
  ) => {
    const total = animals.reduce((sum, an) => sum + an.price, 0);
    handleClearCart();
    
    // Generate invoice and order numbers
    const orderNumber = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const invoiceNumber = `INV-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    
    // Create pending Order object in the "Awaiting Payment" stage
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNumber,
      customerName: currentUser?.fullName || 'Alhaji Bashir Yusuf',
      customerEmail: currentUser?.email || 'bashir@yusuf-holdings.com',
      customerPhone: currentUser?.phone || '+234 803 111 2222',
      animalType: animals[0]?.category || 'Cow',
      breed: animals[0]?.breed || 'White Fulani',
      packageType: (animalPackages && animals[0] && animalPackages[animals[0].id]) || feedingPlan || 'Pasture Only',
      amount: total,
      date: new Date().toISOString().split('T')[0],
      invoiceId: invoiceNumber,
      status: 'Pending',
      fulfillmentStep: 'Awaiting Payment',
      internalNotes: `Manual bank transfer payment requested. Handling option: ${option === 'farm' ? 'Board at Ranch' : 'Immediate Shipping'}`
    };

    // Create pending Invoice object
    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invoiceNumber,
      customerId: currentUser?.id || '101',
      customerFullName: currentUser?.fullName || 'Alhaji Bashir Yusuf',
      customerEmail: currentUser?.email || 'bashir@yusuf-holdings.com',
      amount: total,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending Payment',
      auditLog: [
        {
          date: new Date().toISOString(),
          status: 'Pending Payment',
          actionBy: currentUser?.fullName || 'Customer',
          notes: `Pending invoice generated for ${animals.length} animals. Bank transfer details sent.`
        }
      ]
    };

    setAdminOrders(prev => [newOrder, ...prev]);
    setInvoices(prev => [newInvoice, ...prev]);

    handleDispatchNotification({
      id: `notif-purchase-pending-${Date.now()}`,
      type: 'system',
      title: '📑 Invoice & Bank Transfer Details Generated',
      message: `Invoice ${invoiceNumber} (${orderNumber}) generated for ${animals.length} animals. Please complete the bank transfer and upload your receipt in your dashboard.`,
      date: new Date().toISOString(),
      read: false
    });
  };

  return (
    <div className={(darkMode ? 'dark bg-zinc-950 text-zinc-100' : 'bg-white text-zinc-800') + ' min-h-screen theme-transition'}>
      


      {/* Main Navigation */}
      <Navbar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        onOpenAuth={() => {
          setAuthMode('login');
          setAuthModalOpen(true);
        }}
        notifications={notifications}
        onMarkNotificationsRead={handleMarkNotificationsRead}
        cartCount={cartItems.length}
        onOpenCart={() => setIsCartOpen(true)}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        dashboardTab={dashboardTab}
        onSelectDashboardTab={setDashboardTab}
        experienceMode={experienceMode}
        setExperienceMode={setExperienceMode}
        liteActiveTab={liteActiveTab}
        setLiteActiveTab={setLiteActiveTab}
        onOpenAdminNotifs={() => setIsAdminNotifOpen(true)}
        onOpenAdminOrders={() => setIsAdminOrdersOpen(true)}
      />

      {/* Dynamic Content Sections */}
      <main className="transition-all duration-300 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          {experienceMode === 'lite' ? (
            <motion.div
              className="w-full"
              key="lite-mode-container"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <LiteModeApp
                experienceMode={experienceMode}
                setExperienceMode={setExperienceMode}
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
                userBalance={userBalance}
                onFundBalance={handleFundBalance}
                onWithdrawBalance={handleWithdrawBalance}
                onDeductBalance={handleDeductBalance}
                farmerLivestock={farmerLivestock}
                setFarmerLivestock={setFarmerLivestock}
                notifications={notifications}
                onMarkNotificationsRead={handleMarkNotificationsRead}
                activeTab={liteActiveTab}
                setActiveTab={setLiteActiveTab}
                invoices={invoices}
                onAddInvoice={handleAddInvoice}
                onUpdateInvoice={handleUpdateInvoice}
                onOpenAuth={() => {
                  setAuthMode('login');
                  setAuthModalOpen(true);
                }}
              />
            </motion.div>
          ) : (
            <>
              {(activeSection === 'home' || activeSection === 'home-public') && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Hero
                experienceMode={experienceMode}
                setExperienceMode={setExperienceMode}
                onBuyLivestock={() => setActiveSection('marketplace')}
                onBrowseMarketplace={() => setActiveSection('marketplace')}
                onRequestSourcing={() => {
                  setAuthMode('login');
                  setAuthModalOpen(true);
                }}
                onViewMarketRates={(tab) => {
                  setMarketRatesTab(tab);
                  setActiveSection('market-rates');
                  localStorage.setItem('cp_last_section', 'market-rates');
                }}
              />
              <About
                onRegisterFarmer={() => {
                  setAuthMode('register-choose');
                  setAuthModalOpen(true);
                }}
                onLearnMoreMarketplace={() => setActiveSection('marketplace')}
              />
              <Contact />
            </motion.div>
          )}

          {activeSection === 'about' && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <About
                onRegisterFarmer={() => {
                  setAuthMode('register-choose');
                  setAuthModalOpen(true);
                }}
                onLearnMoreMarketplace={() => setActiveSection('marketplace')}
              />
            </motion.div>
          )}

          {activeSection === 'marketplace' && (
            <motion.div
              key="marketplace"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <Marketplace
                currentUser={currentUser}
                onOpenAuth={() => {
                  setAuthMode('login');
                  setAuthModalOpen(true);
                }}
                cartItems={cartItems}
                onAddToCart={handleAddToCart}
                onRemoveFromCart={handleRemoveFromCart}
                onClearCart={handleClearCart}
                isCartOpen={isCartOpen}
                setIsCartOpen={setIsCartOpen}
                userBalance={userBalance}
                onDeductBalance={handleDeductBalance}
                onPurchaseLivestock={handlePurchaseLivestock}
              />
            </motion.div>
          )}

          {activeSection === 'meatsupply' && (
            <motion.div
              key="meatsupply"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <MeatSupply />
            </motion.div>
          )}

          {activeSection === 'blog-faq' && (
            <motion.div
              key="blog-faq"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <BlogFAQ />
            </motion.div>
          )}

          {activeSection === 'contact' && (
            <motion.div
              key="contact"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <Contact />
            </motion.div>
          )}

          {activeSection === 'market-rates' && (
            <motion.div
              key="market-rates"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <MarketRates 
                initialTab={marketRatesTab} 
                onBack={() => {
                  setActiveSection('home');
                  localStorage.setItem('cp_last_section', 'home');
                }} 
              />
            </motion.div>
          )}

          {activeSection === 'admin-login' && (
            <motion.div
              key="admin-login"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="py-16 px-4 max-w-md mx-auto"
            >
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
                <div className="text-center">
                  <div className="h-12 w-12 rounded-xl bg-zinc-900 dark:bg-zinc-800 flex items-center justify-center text-white mx-auto mb-3">
                    <TrendingUp className="h-6 w-6 stroke-[2.5]" />
                  </div>
                  <h3 className="font-display font-extrabold text-2xl text-zinc-950 dark:text-white">Admin Console</h3>
                  <p className="text-xs text-zinc-500 mt-1">Authorized CowPlugNG Administrators Only</p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const target = e.target as HTMLFormElement;
                    const email = (target.elements.namedItem('email') as HTMLInputElement).value;
                    const password = (target.elements.namedItem('password') as HTMLInputElement).value;
                    if (email.trim().toLowerCase() === 'amina.bello@cowplug.ng' && password === 'admin123') {
                      handleQuickLogin('admin');
                    } else {
                      alert('Invalid administrator credentials.');
                    }
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Admin Email</label>
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="e.g. amina.bello@cowplug.ng"
                      defaultValue="amina.bello@cowplug.ng"
                      className="w-full px-4 py-2.5 rounded-xl border dark:bg-zinc-950 dark:border-zinc-800 text-xs text-zinc-800 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Security Password</label>
                    <input
                      name="password"
                      type="password"
                      required
                      placeholder="••••••••"
                      defaultValue="admin123"
                      className="w-full px-4 py-2.5 rounded-xl border dark:bg-zinc-950 dark:border-zinc-800 text-xs text-zinc-800 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-zinc-950 hover:bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 rounded-xl text-xs font-bold transition-all shadow-md"
                  >
                    Access Admin Dashboard
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {activeSection === 'dashboard' && currentUser && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              {currentUser.role === 'admin' ? (
                <AdminDashboard
                  currentUser={currentUser}
                  setCurrentUser={setCurrentUser}
                  farmerLivestock={farmerLivestock}
                  onAddFarmerLivestock={handleAddFarmerLivestock}
                  setFarmerLivestock={setFarmerLivestock}
                  onDispatchNotification={handleDispatchNotification}
                  setActiveSection={setActiveSection}
                  usersList={usersList}
                  setUsersList={setUsersList}
                  adminTab={dashboardTab}
                  setAdminTab={setDashboardTab}
                  invoices={invoices}
                  onUpdateInvoice={handleUpdateInvoice}
                  onUpdateUserBalance={handleUpdateUserBalance}
                  onUpdateUser={handleUpdateUser}
                  onOpenAdminOrders={() => setIsAdminOrdersOpen(true)}
                  onOpenAdminNotifs={() => setIsAdminNotifOpen(true)}
                  orders={adminOrders}
                  onUpdateOrder={(id, updates) => {
                    setAdminOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
                  }}
                />
              ) : (
                <Dashboard
                  currentUser={currentUser}
                  setCurrentUser={setCurrentUser}
                  farmerLivestock={farmerLivestock}
                  onAddFarmerLivestock={handleAddFarmerLivestock}
                  onDispatchNotification={handleDispatchNotification}
                  userBalance={userBalance}
                  onFundBalance={handleFundBalance}
                  onWithdrawBalance={handleWithdrawBalance}
                  setActiveSection={setActiveSection}
                  usersList={usersList}
                  activeMenuTab={dashboardTab}
                  setActiveMenuTab={setDashboardTab}
                  notifications={notifications}
                  onMarkNotificationsRead={handleMarkNotificationsRead}
                  invoices={invoices}
                  onUpdateInvoice={handleUpdateInvoice}
                  orders={adminOrders}
                  onUpdateOrder={(id, updates) => {
                    setAdminOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
                  }}
                />
              )}
            </motion.div>
          )}

          </>
          )}

        </AnimatePresence>
      </main>



      {/* Main Corporate Footer */}
      {experienceMode !== 'lite' && <Footer setActiveSection={setActiveSection} />}

      {/* Standard Interactive Auth Modal */}
      <AnimatePresence>
        {authModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-zinc-950/70 backdrop-blur-sm"
              onClick={() => setAuthModalOpen(false)}
            />

            {/* Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 sm:p-8 relative z-10 sleek-shadow overflow-hidden"
            >
              <button
                onClick={() => setAuthModalOpen(false)}
                className="absolute top-4 right-4 p-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 rounded-lg text-zinc-500"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              {/* Logo */}
              <div className="flex flex-col items-center mb-6">
                <div className="h-11 w-11 rounded-xl bg-emerald-600 dark:bg-emerald-700 flex items-center justify-center text-white mb-2 shadow-md shadow-emerald-600/20">
                  <TrendingUp className="h-6 w-6 stroke-[2.5]" />
                </div>
                <span className="font-display font-bold text-xl tracking-tight text-zinc-900 dark:text-white">
                  Cow<span className="text-emerald-600 dark:text-emerald-400">Plug</span>
                  <span className="text-amber-500 font-extrabold text-sm ml-0.5">NG</span>
                </span>
                <p className="text-[9px] text-zinc-400 font-mono tracking-widest uppercase mt-0.5 font-bold">Livestock Management</p>
              </div>

              {/* View 1: Login */}
              {authMode === 'login' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h4 className="font-display font-extrabold text-lg text-zinc-950 dark:text-white">
                      Welcome back to CowPlugNG
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      Access your livestock ledger or herder manager
                    </p>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const target = e.target as HTMLFormElement;
                      const emailInput = target.elements.namedItem('email') as HTMLInputElement;
                      const passwordInput = target.elements.namedItem('password') as HTMLInputElement;
                      const email = emailInput.value.trim();
                      
                      // Check for hardcoded credentials to auto-login, or lookup
                      if (email.toLowerCase() === 'amina.bello@cowplug.ng') {
                        handleQuickLogin('admin');
                      } else if (email.toLowerCase() === 'musa.farm@cowplug.ng') {
                        handleQuickLogin('farmer');
                      } else if (email.toLowerCase() === 'bashir@yusuf-holdings.com') {
                        handleQuickLogin('investor');
                      } else {
                        handleCustomLogin(email);
                      }
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Email address</label>
                      <input
                        name="email"
                        type="email"
                        required
                        placeholder="e.g. bashir@yusuf-holdings.com"
                        defaultValue="bashir@yusuf-holdings.com"
                        className="w-full px-4 py-2.5 rounded-xl border dark:bg-zinc-950 dark:border-zinc-800 text-xs text-zinc-800 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Password</label>
                      <input
                        name="password"
                        type="password"
                        required
                        placeholder="••••••••"
                        defaultValue="password123"
                        className="w-full px-4 py-2.5 rounded-xl border dark:bg-zinc-950 dark:border-zinc-800 text-xs text-zinc-800 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="flex justify-between items-center pt-1">
                      <button
                        type="button"
                        onClick={() => alert('A password reset link has been simulated and sent to your registered email.')}
                        className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                      >
                        Forgot Password?
                      </button>
                      <button
                        type="button"
                        onClick={() => setAuthMode('register-choose')}
                        className="text-[11px] font-bold text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                      >
                        Create Account
                      </button>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                    >
                      Sign In
                    </button>
                  </form>
                </div>
              )}

              {/* View 2: Registration - Choose Intent */}
              {authMode === 'register-choose' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h4 className="font-display font-extrabold text-lg text-zinc-950 dark:text-white">
                      What would you like to do?
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      Choose an account type to access specialized tools
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    {/* Customer choice */}
                    <button
                      onClick={() => {
                        setSelectedRegRole('investor');
                        setAuthMode('register-form');
                      }}
                      className="w-full text-left p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-zinc-50/50 dark:hover:bg-zinc-950/50 transition-all group"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs text-zinc-900 dark:text-white">Buy & Manage Livestock</span>
                        <span className="text-emerald-600 font-extrabold text-xs">→</span>
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                        I want to purchase livestock and have CowPlugNG manage it until I need it.
                      </p>
                      <div className="mt-2 text-[10px] text-zinc-400 font-medium">
                        Examples: Weddings • Festivals • Business • Personal use
                      </div>
                      <div className="mt-3 text-xs text-emerald-700 dark:text-emerald-400 font-bold group-hover:underline">
                        Continue as Customer
                      </div>
                    </button>

                    {/* Seller choice */}
                    <button
                      onClick={() => {
                        setSelectedRegRole('farmer');
                        setAuthMode('register-form');
                      }}
                      className="w-full text-left p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-amber-500 dark:hover:border-amber-500 hover:bg-zinc-50/50 dark:hover:bg-zinc-950/50 transition-all group"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs text-zinc-900 dark:text-white">Sell Livestock</span>
                        <span className="text-amber-600 font-extrabold text-xs">→</span>
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                        I'm a verified farmer or livestock dealer and want to list livestock for sale on CowPlugNG.
                      </p>
                      <div className="mt-3 text-xs text-amber-700 dark:text-amber-500 font-bold group-hover:underline">
                        Continue as Seller
                      </div>
                    </button>
                  </div>

                  <div className="text-center pt-2">
                    <button
                      onClick={() => setAuthMode('login')}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                    >
                      Already have an account? Sign In
                    </button>
                  </div>
                </div>
              )}

              {/* View 3: Registration - Credentials Form */}
              {authMode === 'register-form' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h4 className="font-display font-extrabold text-lg text-zinc-950 dark:text-white">
                      Create Your {selectedRegRole === 'investor' ? 'Customer' : 'Seller'} Account
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      Provide details to finalize registration
                    </p>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const target = e.target as HTMLFormElement;
                      const name = (target.elements.namedItem('fullName') as HTMLInputElement).value;
                      const email = (target.elements.namedItem('email') as HTMLInputElement).value;
                      const phone = (target.elements.namedItem('phone') as HTMLInputElement).value;
                      
                      const success = handleCustomRegister(name, email, phone);
                      if (!success) {
                        alert('This email is already registered.');
                      }
                    }}
                    className="space-y-3.5"
                  >
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Full Name</label>
                      <input
                        name="fullName"
                        type="text"
                        required
                        placeholder="e.g. Alhaji Bashir Yusuf"
                        className="w-full px-4 py-2 rounded-xl border dark:bg-zinc-950 dark:border-zinc-800 text-xs text-zinc-800 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Email address</label>
                      <input
                        name="email"
                        type="email"
                        required
                        placeholder="e.g. bashir@yusuf-holdings.com"
                        className="w-full px-4 py-2 rounded-xl border dark:bg-zinc-950 dark:border-zinc-800 text-xs text-zinc-800 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Phone Number</label>
                      <input
                        name="phone"
                        type="tel"
                        required
                        placeholder="e.g. +234 803 123 4567"
                        className="w-full px-4 py-2 rounded-xl border dark:bg-zinc-950 dark:border-zinc-800 text-xs text-zinc-800 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Security Password</label>
                      <input
                        name="password"
                        type="password"
                        required
                        placeholder="••••••••"
                        className="w-full px-4 py-2 rounded-xl border dark:bg-zinc-950 dark:border-zinc-800 text-xs text-zinc-800 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="flex justify-between items-center pt-1 text-xs">
                      <button
                        type="button"
                        onClick={() => setAuthMode('register-choose')}
                        className="font-bold text-zinc-500 hover:text-zinc-700"
                      >
                        ← Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setAuthMode('login')}
                        className="font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                      >
                        Sign In instead
                      </button>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                    >
                      Complete Registration
                    </button>
                  </form>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Choose Your Experience - First Launch Modal Overlay */}
      <AnimatePresence>
        {showFirstLaunchModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop with strong blur to focus attention */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6 z-10"
            >
              <div className="space-y-2">
                <div className="h-14 w-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl mx-auto shadow-md">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h2 className="font-display font-black text-2xl text-zinc-900 dark:text-white mt-4">
                  Choose Your Experience
                </h2>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
                  We customize CowPlugNG to match how you want to manage your livestock and animals.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                
                {/* Lite Mode Option Card */}
                <button
                  onClick={() => {
                    setExperienceMode('lite');
                    localStorage.setItem('cp_experience_mode_chosen', 'true');
                    setShowFirstLaunchModal(false);
                  }}
                  className="p-5 rounded-2xl border-2 border-emerald-500/80 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all text-left flex flex-col justify-between h-44 cursor-pointer relative group"
                >
                  <div className="space-y-1">
                    <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
                      <Leaf className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-white mt-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                      Lite Mode
                    </h3>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal">
                      Simple and easy to use. Large buttons, plain language, and essential farming actions.
                    </p>
                  </div>
                  <span className="mt-4 inline-block text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400 tracking-wider">
                    Recommended Option
                  </span>
                </button>

                {/* Pro Mode Option Card */}
                <button
                  onClick={() => {
                    setExperienceMode('pro');
                    localStorage.setItem('cp_experience_mode_chosen', 'true');
                    setShowFirstLaunchModal(false);
                  }}
                  className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900/60 transition-all text-left flex flex-col justify-between h-44 cursor-pointer group"
                >
                  <div className="space-y-1">
                    <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-950 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-amber-500" />
                    </div>
                    <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200 mt-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                      Pro Mode
                    </h3>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal">
                      Advanced features, detailed veterinary charts, full portfolio stats, and investor reports.
                    </p>
                  </div>
                  <span className="mt-4 inline-block text-[10px] font-black uppercase text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 tracking-wider">
                    Complete Access
                  </span>
                </button>

              </div>

              <p className="text-[10px] text-zinc-400">
                You can change this choice at any time directly in your settings or navigation bar.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Order Center Modal */}
      <AdminOrderManagementCenterModal
        isOpen={isAdminOrdersOpen}
        onClose={() => setIsAdminOrdersOpen(false)}
        orders={adminOrders}
        onUpdateOrder={(id, updates) => {
          setAdminOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
        }}
        onAddAuditLog={(action, details, status) => {
          const newNotif: AdminNotification = {
            id: `an-${Date.now()}`,
            category: 'Orders',
            title: action,
            message: details,
            date: new Date().toISOString(),
            read: false,
            severity: status === 'danger' ? 'danger' : status === 'warning' ? 'warning' : 'info',
            metadata: {}
          };
          setAdminNotifications(prev => [newNotif, ...prev]);
        }}
      />

      {/* Admin Notification Center Modal */}
      <AdminNotificationCenterModal
        isOpen={isAdminNotifOpen}
        onClose={() => setIsAdminNotifOpen(false)}
        notifications={adminNotifications}
        onUpdateNotifications={setAdminNotifications}
      />

    </div>
  );
}
