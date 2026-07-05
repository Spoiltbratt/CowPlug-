import { useState, useEffect, Dispatch, SetStateAction, FormEvent } from 'react';
import { 
  Home, 
  ShoppingBag, 
  Heart, 
  HelpCircle, 
  Plus, 
  DollarSign, 
  Truck, 
  User as UserIcon, 
  ArrowRight, 
  Check, 
  ShieldCheck, 
  Sparkles, 
  LogOut, 
  Phone, 
  CheckCircle, 
  MapPin, 
  Calendar,
  Layers,
  Activity,
  UserCheck,
  TrendingUp,
  AlertCircle,
  Leaf,
  Zap,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MarketplaceAnimal, User as UserType, FarmerLivestock, AppNotification } from '../types';
import { Invoice } from '../types_payments';
import { MARKETPLACE_ANIMALS } from '../data';
import AnimalOutlineIcon from './AnimalOutlineIcon';
import { dbAddFarmerLivestock } from '../db/sync';

interface LiteModeAppProps {
  currentUser: UserType | null;
  setCurrentUser: (user: UserType | null) => void;
  userBalance: number;
  onFundBalance: (amt: number) => void;
  onWithdrawBalance: (amt: number) => void;
  onDeductBalance: (amt: number) => void;
  farmerLivestock: FarmerLivestock[];
  setFarmerLivestock: Dispatch<SetStateAction<FarmerLivestock[]>>;
  notifications: AppNotification[];
  onMarkNotificationsRead: () => void;
  onOpenAuth: (role?: 'investor' | 'farmer') => void;
  activeTab: 'home' | 'buy' | 'my-animals' | 'find-animal' | 'payments' | 'receive' | 'profile' | 'rates';
  setActiveTab: (tab: 'home' | 'buy' | 'my-animals' | 'find-animal' | 'payments' | 'receive' | 'profile' | 'rates') => void;
  experienceMode?: 'lite' | 'pro';
  setExperienceMode?: (mode: 'lite' | 'pro') => void;
  invoices: Invoice[];
  onAddInvoice: (inv: Invoice) => void;
  onUpdateInvoice: (id: string, updates: Partial<Invoice>) => void;
}

export default function LiteModeApp({
  currentUser,
  setCurrentUser,
  userBalance,
  onFundBalance,
  onWithdrawBalance,
  onDeductBalance,
  farmerLivestock,
  setFarmerLivestock,
  notifications,
  onMarkNotificationsRead,
  onOpenAuth,
  activeTab,
  setActiveTab,
  experienceMode,
  setExperienceMode,
  invoices,
  onAddInvoice,
  onUpdateInvoice,
}: LiteModeAppProps) {
  // Form states
  const [fundingAmount, setFundingAmount] = useState('50000');
  
  const [withdrawingAmount, setWithdrawingAmount] = useState('25000');
  const [bankName, setBankName] = useState('GTBank');
  const [accountNumber, setAccountNumber] = useState('0124589341');
  const [withdrawingSuccess, setWithdrawingSuccess] = useState(false);

  // Custom Sourcing states ("Find an Animal")
  const [sourcingRequests, setSourcingRequests] = useState<any[]>(() => {
    const saved = localStorage.getItem('cp_sourcing_requests');
    return saved ? JSON.parse(saved) : [
      { id: 'src-201', category: 'Cow', breed: 'Bunaji (White Fulani)', quantity: 2, purpose: 'Wedding Sourcing', status: 'Processing', date: '2026-07-02' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('cp_sourcing_requests', JSON.stringify(sourcingRequests));
  }, [sourcingRequests]);

  const [srcCategory, setSrcCategory] = useState<'Cow' | 'Goat' | 'Ram'>('Cow');
  const [srcBreed, setSrcBreed] = useState('White Fulani');
  const [srcQty, setSrcQty] = useState(1);
  const [srcPurpose, setSrcPurpose] = useState('Wedding Sourcing');
  const [srcSuccess, setSrcSuccess] = useState(false);

  // Delivery states ("Receive My Animal")
  const [deliveryRequests, setDeliveryRequests] = useState<any[]>(() => {
    const saved = localStorage.getItem('cp_delivery_requests');
    return saved ? JSON.parse(saved) : [
      { id: 'del-101', animalTag: 'CPG-CW-001', breed: 'White Fulani', purpose: 'Festival Sourcing', date: '2026-09-10', address: '12 Awolowo Road, Ikoyi, Lagos', status: 'Approved & Scheduled' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('cp_delivery_requests', JSON.stringify(deliveryRequests));
  }, [deliveryRequests]);

  const [delAnimalId, setDelAnimalId] = useState('');
  const [delAddress, setDelAddress] = useState('14 Alhaji Kanike Close, Ikoyi, Lagos');
  const [delDate, setDelDate] = useState('2026-07-28');
  const [delPurpose, setDelPurpose] = useState('Personal consumption');
  const [delSuccess, setDelSuccess] = useState(false);

  // Buying actions
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [purchasedAnimal, setPurchasedAnimal] = useState<MarketplaceAnimal | null>(null);

  // Livestock and Feed Rates states for Lite/Android version
  const [ratesTab, setRatesTab] = useState<'livestock' | 'feed'>('livestock');
  const [ratesSearchQuery, setRatesSearchQuery] = useState('');
  
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
    const syncWithStorage = () => {
      const savedLive = localStorage.getItem('cp_market_livestock_rates');
      if (savedLive) setLivestockRates(JSON.parse(savedLive));
      const savedFeed = localStorage.getItem('cp_market_feed_rates');
      if (savedFeed) setFeedRates(JSON.parse(savedFeed));
    };

    window.addEventListener('storage', syncWithStorage);
    const interval = setInterval(syncWithStorage, 2000);

    return () => {
      window.removeEventListener('storage', syncWithStorage);
      clearInterval(interval);
    };
  }, []);

  // Quick Preset login helper
  const handleQuickPresetLogin = (role: 'investor' | 'farmer' | 'admin') => {
    const PRESETS = {
      investor: {
        id: 'usr-101',
        email: 'investor@cowplug.ng',
        fullName: 'Dare Tugbobo',
        role: 'investor' as const,
        phone: '+234 812 345 6789',
        balance: 750000,
        investmentsCount: 3,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'
      },
      farmer: {
        id: 'usr-102',
        email: 'farmer@cowplug.ng',
        fullName: 'Alhaji Audu Maikano',
        role: 'farmer' as const,
        phone: '+234 803 987 6543',
        balance: 145000,
        investmentsCount: 5,
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150'
      },
      admin: {
        id: 'usr-103',
        email: 'amina.bello@cowplug.ng',
        fullName: 'Amina Bello',
        role: 'admin' as const,
        phone: '+234 901 234 5678',
        balance: 2300000,
        investmentsCount: 0,
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150'
      }
    };
    const preset = PRESETS[role];
    setCurrentUser(preset);
    onFundBalance(preset.balance - userBalance); // Align global balance state
  };

  const handleBuyLivestockDirect = (animal: MarketplaceAnimal) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (userBalance < animal.price) {
      alert('Your wallet balance is too low to buy this animal. Please add money in the Payments tab first.');
      setActiveTab('payments');
      return;
    }

    // Deduct and purchase
    onDeductBalance(animal.price);
    
    // Board it as My Animals
    const newAnimal: FarmerLivestock = {
      id: `live-lite-${Date.now()}`,
      tagNumber: `CPG-${animal.category === 'Cow' ? 'CW' : animal.category === 'Goat' ? 'GT' : 'RM'}-0${Math.floor(Math.random() * 800) + 100}`,
      breed: animal.breed,
      category: animal.category,
      weightKg: animal.weightKg,
      ageMonths: animal.ageMonths,
      healthStatus: 'Excellent (Fully Vaccinated)',
      photo: animal.image,
      vaccinations: ['PPR Booster', 'Deworming Booster', 'Foot-and-Mouth (FMD)'],
      lastVetCheck: new Date().toLocaleDateString(),
      datePurchased: new Date().toISOString().split('T')[0],
      purchasePrice: animal.price,
      feedingPlan: 'Standard Pasture & Premium Grass-Fed Feedstocks',
      ownersName: currentUser.fullName,
      estimatedValue: animal.price * 1.12,
      videos: [],
      weightHistory: [{ date: 'Start', weightKg: animal.weightKg }]
    };

    setFarmerLivestock(prev => [newAnimal, ...prev]);
    dbAddFarmerLivestock(newAnimal, currentUser.id);
    setPurchasedAnimal(animal);
    setPurchaseSuccess(true);
  };

  const handleSourcingSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    const newReq = {
      id: `src-lite-${Date.now()}`,
      category: srcCategory,
      breed: srcBreed,
      quantity: srcQty,
      purpose: srcPurpose,
      status: 'Processing',
      date: new Date().toISOString().split('T')[0]
    };

    setSourcingRequests(prev => [newReq, ...prev]);
    setSrcSuccess(true);
    setTimeout(() => {
      setSrcSuccess(false);
    }, 4000);
  };

  const handleDeliverySubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!delAnimalId) {
      alert('Please select an animal to receive.');
      return;
    }

    const matchedAnimal = farmerLivestock.find(a => a.id === delAnimalId);
    const breedName = matchedAnimal ? matchedAnimal.breed : 'Livestock';
    const tagNum = matchedAnimal ? matchedAnimal.tagNumber : 'Selected Animal';

    const newDel = {
      id: `del-lite-${Date.now()}`,
      animalTag: tagNum,
      breed: breedName,
      purpose: delPurpose,
      date: delDate,
      address: delAddress,
      status: 'Processing'
    };

    setDeliveryRequests(prev => [newDel, ...prev]);
    setDelSuccess(true);
    setTimeout(() => {
      setDelSuccess(false);
    }, 4000);
  };

  return (
    <div className="relative bg-zinc-950 text-white min-h-screen overflow-hidden">
      {/* Visual Background Pasture Image with Dark Emerald Shading Overlay */}
      <div className="absolute inset-0 z-0 opacity-40">
        <img
          src="https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&q=80&w=1600"
          alt="Healthy livestock grazing in premium pastures"
          className="w-full h-full object-cover object-center scale-105 filter saturate-125"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/90 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent"></div>
      </div>

      {/* Decorative Golden Ambient Gradients */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full filter blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-emerald-500/15 rounded-full filter blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-8 pb-8 space-y-6">
        


        {/* Navigation Tabs - LARGE & VERY CLEAR (Sleek dark backdrop for premium look, hidden on mobile in favor of premium bottom nav) */}
        <div className="hidden md:grid md:grid-cols-8 gap-2 bg-zinc-900/70 border border-zinc-850/80 p-2 rounded-2xl backdrop-blur-md relative z-10">
          {[
            { id: 'home', label: 'Home', icon: Home },
            { id: 'buy', label: 'Buy Livestock', icon: ShoppingBag },
            { id: 'my-animals', label: 'My Animals', icon: Heart },
            { id: 'find-animal', label: 'Find an Animal', icon: Plus },
            { id: 'payments', label: 'Payments', icon: DollarSign },
            { id: 'receive', label: 'Receive My Animal', icon: Truck },
            { id: 'rates', label: 'Market Rates', icon: TrendingUp },
            { id: 'profile', label: 'Profile', icon: UserIcon },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setPurchaseSuccess(false);
                }}
                className={`flex flex-col items-center justify-center py-3 px-1 rounded-xl transition-all gap-1 cursor-pointer ${
                  isActive 
                    ? 'bg-emerald-600 text-white shadow-md font-extrabold' 
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'scale-110' : ''}`} />
                <span className="text-[10px] text-center tracking-tight leading-tight select-none">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* MAIN RENDER AREA (Now matches Pro Mode premium cards exactly) */}
        <div className="bg-white/95 dark:bg-zinc-900/90 rounded-3xl border border-slate-200/80 dark:border-zinc-800 p-6 sm:p-8 shadow-xl backdrop-blur-md relative z-10 text-zinc-900 dark:text-white">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: HOME */}
          {activeTab === 'home' && (
            <motion.div
              key="home-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">
                  {currentUser ? `Hello, ${currentUser.fullName}!` : 'Welcome to CowPlugNG!'}
                </h1>
                <p className="text-sm text-zinc-500 max-w-lg mx-auto">
                  What would you like to do on the farm today? Click one of the big friendly buttons below.
                </p>
              </div>

              {/* Active Farm Livestock Spotlight (Featuring Cow and Ram) */}
              <div className="bg-zinc-50 dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-black text-zinc-900 dark:text-white">Featured Farm Animal Spotlight</h3>
                    <p className="text-xs text-zinc-500">Real photographs of our healthy, professionally managed stock</p>
                  </div>
                  <span className="text-[10px] bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 font-extrabold uppercase px-2.5 py-1 rounded-full border border-emerald-500/20 self-start sm:self-center">
                    Live Oyo Ranch Stock
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Cow spotlight */}
                  <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200/60 dark:border-zinc-800 space-y-3">
                    <div className="h-32 w-full rounded-lg overflow-hidden relative">
                      <img
                        src="https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&q=80&w=400"
                        alt="White Fulani Cow"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md">
                        CPG-CW-001
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-zinc-900 dark:text-white">White Fulani Cow</h4>
                        <p className="text-[10px] text-zinc-400">Breed: Bunaji | Weight: 310kg</p>
                      </div>
                      <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
                        <AnimalOutlineIcon category="cow" className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    </div>
                  </div>

                  {/* Ram spotlight */}
                  <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200/60 dark:border-zinc-800 space-y-3">
                    <div className="h-32 w-full rounded-xl overflow-hidden relative">
                      <img
                        src="https://images.unsplash.com/photo-1484557985045-edf25e08da73?auto=format&fit=crop&q=80&w=400"
                        alt="Premium Balami Ram"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md">
                        CPG-RM-002
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-zinc-900 dark:text-white">Balami Premium Ram</h4>
                        <p className="text-[10px] text-zinc-400">Breed: Balami | Weight: 78kg</p>
                      </div>
                      <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
                        <AnimalOutlineIcon category="ram" className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* High Level Quick Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-zinc-50 dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-150 dark:border-zinc-800 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wide">My Available Money</p>
                    <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      ₦{userBalance.toLocaleString()}
                    </h3>
                  </div>
                  <button 
                    onClick={() => setActiveTab('payments')}
                    className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold text-xs hover:bg-emerald-500/20 cursor-pointer"
                  >
                    + Add Money
                  </button>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-150 dark:border-zinc-800 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wide">My Livestock Count</p>
                    <h3 className="text-2xl font-black text-zinc-800 dark:text-white">
                      {currentUser ? farmerLivestock.length : 0} Animals Owned
                    </h3>
                  </div>
                  <button 
                    onClick={() => setActiveTab('my-animals')}
                    className="p-3 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl font-bold text-xs hover:bg-zinc-300 dark:hover:bg-zinc-700 cursor-pointer"
                  >
                    View List
                  </button>
                </div>
              </div>

              {/* Action Tiles - Plain English "What does the user want to do right now?" */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-zinc-800 dark:text-white">Quick Help Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <button
                    onClick={() => setActiveTab('buy')}
                    className="flex items-start text-left p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-emerald-50/50 hover:bg-emerald-50 dark:bg-emerald-950/10 dark:hover:bg-emerald-950/20 transition-all group cursor-pointer"
                  >
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-xl mr-4 group-hover:scale-110 transition-transform">
                      <ShoppingBag className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-base text-zinc-900 dark:text-white">Buy Livestock</h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        Look at available healthy cows, goats, and rams ready for buy and professional care.
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('find-animal')}
                    className="flex items-start text-left p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-amber-50/50 hover:bg-amber-50 dark:bg-amber-950/10 dark:hover:bg-amber-950/20 transition-all group cursor-pointer"
                  >
                    <div className="p-3 bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 rounded-xl mr-4 group-hover:scale-110 transition-transform">
                      <Plus className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-base text-zinc-900 dark:text-white">Find an Animal</h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        Have a custom requirement? Fill out our simple form to request customized stock sourcing.
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('receive')}
                    className="flex items-start text-left p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-sky-50/50 hover:bg-sky-50 dark:bg-sky-950/10 dark:hover:bg-sky-950/20 transition-all group cursor-pointer"
                  >
                    <div className="p-3 bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 rounded-xl mr-4 group-hover:scale-110 transition-transform">
                      <Truck className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-base text-zinc-900 dark:text-white">Receive My Animal</h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        Ready to ship your animal home or to a festive celebration? Choose delivery details here.
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('my-animals')}
                    className="flex items-start text-left p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-rose-50/50 hover:bg-rose-50 dark:bg-rose-950/10 dark:hover:bg-rose-950/20 transition-all group cursor-pointer"
                  >
                    <div className="p-3 bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300 rounded-xl mr-4 group-hover:scale-110 transition-transform">
                      <Heart className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-base text-zinc-900 dark:text-white">Animal Health & Progress</h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        Track daily feeding records, vaccinations, and veterinary safety status of your animals.
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('rates')}
                    className="flex items-start text-left p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-emerald-50/50 hover:bg-emerald-50 dark:bg-emerald-950/10 dark:hover:bg-emerald-950/20 transition-all group cursor-pointer col-span-1 md:col-span-2"
                  >
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-xl mr-4 group-hover:scale-110 transition-transform">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-base text-zinc-900 dark:text-white">Live Market & Feed Rates</h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        View real-time trading statistics, live livestock valuations, and distributor feed mill price indexes.
                      </p>
                    </div>
                  </button>

                </div>
              </div>

              {/* Latest Updates section instead of complex reports */}
              <div className="bg-zinc-50 dark:bg-zinc-900/60 p-6 rounded-2xl border border-zinc-150 dark:border-zinc-800 space-y-4">
                <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-400">
                  <Sparkles className="h-5 w-5 animate-pulse" />
                  <span className="text-sm font-bold uppercase tracking-wider">Latest Updates</span>
                </div>
                {notifications.length === 0 ? (
                  <p className="text-xs text-zinc-500">Your farm has no new notifications at this time.</p>
                ) : (
                  <div className="space-y-3">
                    {notifications.slice(0, 2).map((notif) => (
                      <div key={notif.id} className="p-4 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-850 text-xs flex items-start space-x-3 shadow-xs">
                        <span className="text-emerald-600 dark:text-emerald-400">
                          <Bell className="h-4 w-4" />
                        </span>
                        <div className="space-y-0.5">
                          <p className="font-bold text-zinc-800 dark:text-white">{notif.title}</p>
                          <p className="text-zinc-500 leading-relaxed">{notif.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 2: BUY LIVESTOCK */}
          {activeTab === 'buy' && (
            <motion.div
              key="buy-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Buy Livestock</h2>
                <p className="text-sm text-zinc-500">
                  Choose from our top-quality, vet-approved cows, goats, and rams.
                </p>
              </div>

              {purchaseSuccess && purchasedAnimal && (
                <div className="p-6 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/20 rounded-2xl text-center space-y-4">
                  <div className="h-12 w-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto text-xl font-bold">
                    ✓
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg text-emerald-800 dark:text-emerald-400">Successfully Purchased!</h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      You are now the proud owner of this premium <strong>{purchasedAnimal.breed}</strong> ({purchasedAnimal.category}). It is now boarding at CowPlugNG pastures!
                    </p>
                  </div>
                  <div className="flex justify-center space-x-3 pt-2">
                    <button 
                      onClick={() => { setPurchaseSuccess(false); setActiveTab('my-animals'); }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                    >
                      View My Animals
                    </button>
                    <button 
                      onClick={() => setPurchaseSuccess(false)}
                      className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Buy Another
                    </button>
                  </div>
                </div>
              )}

              {/* Simplified animal grids */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {MARKETPLACE_ANIMALS.map((animal) => (
                  <div 
                    key={animal.id} 
                    className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between"
                  >
                    <div className="h-44 relative">
                      <img 
                        src={animal.image} 
                        alt={animal.breed} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2 right-2 bg-white/95 dark:bg-zinc-900/95 px-2 py-1 rounded-lg text-[9px] font-bold text-emerald-800 dark:text-emerald-400 shadow-sm uppercase tracking-wide">
                        {animal.category}
                      </div>
                    </div>
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-white leading-snug">{animal.breed}</h4>
                        <div className="grid grid-cols-2 gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                          <div>Weight: <strong>{animal.weightKg} kg</strong></div>
                          <div>Age: <strong>{animal.ageMonths} Months</strong></div>
                          <div className="col-span-2">Health: <strong>{animal.healthStatus}</strong></div>
                        </div>
                      </div>

                      <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-3 flex flex-col gap-2">
                        <div className="flex items-baseline justify-between">
                          <span className="text-[10px] text-zinc-400 uppercase font-medium">Price</span>
                          <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                            ₦{animal.price.toLocaleString()}
                          </span>
                        </div>
                        <button
                          onClick={() => handleBuyLivestockDirect(animal)}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs hover:shadow-sm transition-all text-center cursor-pointer"
                        >
                          Buy Instantly
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 3: MY ANIMALS */}
          {activeTab === 'my-animals' && (
            <motion.div
              key="my-animals-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-zinc-900 dark:text-white">My Animals</h2>
                <p className="text-sm text-zinc-500">
                  Track the growth, vaccination dates, and care history of your registered livestock.
                </p>
              </div>

              {!currentUser ? (
                <div className="py-12 text-center bg-zinc-50 dark:bg-zinc-950 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-4">
                  <p className="text-xs text-zinc-500">Please sign in to view your animals and active investments.</p>
                  <button 
                    onClick={() => onOpenAuth()}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                  >
                    Log In Now
                  </button>
                </div>
              ) : farmerLivestock.length === 0 ? (
                <div className="py-16 text-center bg-zinc-50 dark:bg-zinc-950 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-4">
                  <p className="text-xs text-zinc-500">You don't own any livestock yet! Browse our catalogue and purchase your first animal.</p>
                  <button 
                    onClick={() => setActiveTab('buy')}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                  >
                    Browse Livestock Catalogue
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {farmerLivestock.map((animal) => (
                    <div 
                      key={animal.id} 
                      className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 flex flex-col md:flex-row items-center md:items-start gap-6 shadow-xs"
                    >
                      <div className="h-32 w-32 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex-shrink-0">
                        <img 
                          src={animal.photo} 
                          alt={animal.breed} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="space-y-3 flex-1 w-full">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                          <div>
                            <h3 className="font-bold text-base text-zinc-950 dark:text-white">{animal.breed}</h3>
                            <p className="text-xs text-zinc-400 font-mono mt-0.5">Tag Number: {animal.tagNumber}</p>
                          </div>
                          <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-bold uppercase tracking-wider self-start sm:self-center">
                            {animal.category}
                          </span>
                        </div>

                        {/* High-visibility simple details */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white dark:bg-zinc-900/60 p-3 rounded-xl border border-zinc-150 dark:border-zinc-800 text-xs">
                          <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase">Weight</p>
                            <p className="font-bold text-zinc-800 dark:text-zinc-200">{animal.weightKg} kg</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase">Age</p>
                            <p className="font-bold text-zinc-800 dark:text-zinc-200">{animal.ageMonths} Months</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase">Animal Health</p>
                            <p className="font-bold text-emerald-600 dark:text-emerald-400">Healthy</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase">Last Vet Check</p>
                            <p className="font-bold text-zinc-800 dark:text-zinc-200">{animal.lastVetCheck || 'June 2026'}</p>
                          </div>
                        </div>

                        {/* Plain Language Care Details */}
                        <div className="text-xs space-y-1 text-zinc-500 dark:text-zinc-400 leading-relaxed bg-amber-50/20 dark:bg-amber-950/5 p-3 rounded-xl border border-amber-500/10">
                          <p><strong>Feeding Plan:</strong> {animal.feedingPlan || 'Managed pasture with organic protein supplement'}</p>
                          <p><strong>Vaccinations Completed:</strong> {animal.vaccinations ? animal.vaccinations.join(', ') : 'Fully Vaccinated'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 4: FIND AN ANIMAL */}
          {activeTab === 'find-animal' && (
            <motion.div
              key="find-animal-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Find an Animal</h2>
                <p className="text-sm text-zinc-500">
                  Can't find what you need in the store? Submit a custom sourcing request and we will find it.
                </p>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-950/40 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <form onSubmit={handleSourcingSubmit} className="space-y-4">
                  {srcSuccess && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-xl text-center text-xs font-bold">
                      Sourcing Request Logged successfully! We will coordinate.
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">What category?</label>
                      <select 
                        value={srcCategory} 
                        onChange={(e) => setSrcCategory(e.target.value as any)}
                        className="w-full px-4 py-3 rounded-xl border dark:bg-zinc-900 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300"
                      >
                        <option value="Cow">Cow</option>
                        <option value="Goat">Goat</option>
                        <option value="Ram">Ram</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Preferred breed</label>
                      <input 
                        type="text" 
                        value={srcBreed} 
                        onChange={(e) => setSrcBreed(e.target.value)}
                        placeholder="e.g. White Fulani, Red Sokoto, Balami"
                        className="w-full px-4 py-3 rounded-xl border dark:bg-zinc-900 dark:border-zinc-800 text-xs text-zinc-800 dark:text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">How many do you want?</label>
                      <input 
                        type="number" 
                        min="1" 
                        value={srcQty} 
                        onChange={(e) => setSrcQty(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-xl border dark:bg-zinc-900 dark:border-zinc-800 text-xs text-zinc-800 dark:text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Sourcing Purpose</label>
                      <select 
                        value={srcPurpose} 
                        onChange={(e) => setSrcPurpose(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border dark:bg-zinc-900 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300"
                      >
                        <option value="Wedding Sourcing">Wedding Sourcing</option>
                        <option value="Festival Sourcing">Festival / Sallah Sourcing</option>
                        <option value="Commercial Farming">Commercial Breeding / Sourcing</option>
                        <option value="Personal Consumption">Personal consumption</option>
                      </select>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Submit Sourcing Request
                  </button>
                </form>
              </div>

              {/* Sourcing request lists */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Your Active Sourcing Requests</h4>
                <div className="space-y-3">
                  {sourcingRequests.map((req) => (
                    <div key={req.id} className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl flex items-center justify-between text-xs">
                      <div className="space-y-1">
                        <p className="font-bold text-zinc-900 dark:text-white">
                          Request for {req.quantity} {req.breed || req.category}s
                        </p>
                        <p className="text-[10px] text-zinc-400">Created on {req.date} • Purpose: {req.purpose}</p>
                      </div>
                      <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded text-[9px] font-bold tracking-wider uppercase">
                        {req.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 5: PAYMENTS */}
          {activeTab === 'payments' && (
            <motion.div
              key="payments-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Payments & Wallet</h2>
                <p className="text-sm text-zinc-500">
                  Easily fund your secure livestock wallet or withdraw earned money instantly.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Add Funds form */}
                <div className="bg-zinc-50 dark:bg-zinc-950/40 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-1">
                    <span>Fund Wallet via Transfer</span>
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Enter Amount (₦)</label>
                      <input 
                        type="number" 
                        value={fundingAmount}
                        onChange={(e) => setFundingAmount(e.target.value)}
                        className="w-full p-3 rounded-xl border dark:bg-zinc-900 dark:border-zinc-800 text-xs text-zinc-800 dark:text-white font-mono"
                      />
                    </div>
                    <button 
                      onClick={() => {
                        const amt = Number(fundingAmount);
                        if (amt > 0 && currentUser) {
                          const newInvoice: Invoice = {
                            id: `inv-${Date.now()}`,
                            invoiceNumber: `INV-${Date.now()}`,
                            customerEmail: currentUser.email,
                            customerFullName: currentUser.fullName,
                            customerId: currentUser.id || currentUser.email,
                            amount: amt,
                            date: new Date().toISOString(),
                            status: 'Pending Payment',
                            auditLog: [
                              {
                                date: new Date().toISOString(),
                                status: 'Pending Payment',
                                actionBy: currentUser.fullName,
                                notes: 'Invoice generated by customer'
                              }
                            ]
                          };
                          onAddInvoice(newInvoice);
                          alert(`Invoice generated: ${newInvoice.invoiceNumber}`);
                        }
                      }}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Generate Invoice
                    </button>
                  </div>
                </div>

                {/* Withdraw Funds form */}
                <div className="bg-zinc-50 dark:bg-zinc-950/40 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-1">
                    <span>Cash Out (Withdraw)</span>
                  </h3>
                  {withdrawingSuccess && (
                    <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-bold text-center">
                      Withdrawal request dispatched to bank!
                    </div>
                  )}
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Amount (₦)</label>
                        <input 
                          type="number" 
                          value={withdrawingAmount}
                          onChange={(e) => setWithdrawingAmount(e.target.value)}
                          className="w-full p-2.5 rounded-xl border dark:bg-zinc-900 dark:border-zinc-800 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Bank Name</label>
                        <input 
                          type="text" 
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          className="w-full p-2.5 rounded-xl border dark:bg-zinc-900 dark:border-zinc-800 text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Bank Account Number</label>
                      <input 
                        type="text" 
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        className="w-full p-2.5 rounded-xl border dark:bg-zinc-900 dark:border-zinc-800 text-xs font-mono"
                      />
                    </div>
                    <button 
                      onClick={() => {
                        const amt = Number(withdrawingAmount);
                        if (amt > userBalance) {
                          alert('Insufficient wallet funds for this withdrawal.');
                          return;
                        }
                        if (amt > 0) {
                          onWithdrawBalance(amt);
                          setWithdrawingSuccess(true);
                          setTimeout(() => setWithdrawingSuccess(false), 3000);
                        }
                      }}
                      className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Withdraw to Bank Account
                    </button>
                  </div>
                </div>

              </div>

              {/* User Invoices & Proof of Payment Upload */}
              <div className="bg-zinc-50 dark:bg-zinc-950/40 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 mt-6">
                <div className="border-b dark:border-zinc-850 pb-3">
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Generated Invoices & Proof of Payments</h3>
                  <p className="text-xs text-zinc-505 dark:text-zinc-400 text-zinc-500">Track and upload bank transfer receipts to fund your live-wallet escrow.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-zinc-100 dark:bg-zinc-900 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider border-b dark:border-zinc-800">
                        <th className="p-3">Invoice Number</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Proof of Payment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-zinc-850 text-xs">
                      {invoices.filter(i => i.customerEmail.toLowerCase() === currentUser?.email.toLowerCase()).length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-zinc-400">
                            No billing statements generated yet. Enter an amount above to generate a manual bank transfer statement.
                          </td>
                        </tr>
                      ) : (
                        invoices.filter(i => i.customerEmail.toLowerCase() === currentUser?.email.toLowerCase()).map(inv => (
                          <tr key={inv.id} className="hover:bg-zinc-100/30 dark:hover:bg-zinc-900/30">
                            <td className="p-3 font-mono font-bold text-zinc-600 dark:text-zinc-400">INV-{inv.id.replace('inv-', '').substring(0, 8).toUpperCase()}</td>
                            <td className="p-3 font-bold text-zinc-800 dark:text-white">₦{inv.amount.toLocaleString()}</td>
                            <td className="p-3 text-zinc-500">{new Date(inv.date).toLocaleDateString()}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' :
                                inv.status === 'Awaiting Verification' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 animate-pulse' :
                                inv.status === 'Rejected' ? 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400' :
                                'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                              }`}>
                                {inv.status}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              {inv.status === 'Pending Payment' || inv.status === 'Rejected' ? (
                                <button
                                  onClick={() => {
                                    const bank = prompt("Which Bank did you transfer to? (e.g. Sterling Bank, GTBank, UBA)", "Sterling Bank");
                                    if (!bank) return;
                                    const refNum = prompt("Enter the Bank Transfer reference number or transaction ID:", "TXN-" + Date.now().toString().substring(5));
                                    if (!refNum) return;
                                    const fileName = prompt("Simulate receipt upload (Enter the receipt file name):", `transfer_receipt_${Date.now().toString().substring(8)}.pdf`);
                                    if (!fileName) return;

                                    onUpdateInvoice(inv.id, {
                                      status: 'Awaiting Verification',
                                      bankUsed: bank,
                                      paymentReference: refNum,
                                      receiptUrl: fileName,
                                      paymentDate: new Date().toISOString()
                                    });
                                    alert("Proof of payment submitted successfully! Our escrow administrative team will verify and fund your wallet.");
                                  }}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg transition-colors cursor-pointer"
                                >
                                  Upload Receipt
                                </button>
                              ) : inv.status === 'Awaiting Verification' ? (
                                <span className="text-[10px] text-zinc-400">Verifying reference: {inv.paymentReference}</span>
                              ) : (
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">✓ Wallet Funded</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </motion.div>
          )}

          {/* TAB 6: RECEIVE MY ANIMAL */}
          {activeTab === 'receive' && (
            <motion.div
              key="receive-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Receive My Animal</h2>
                <p className="text-sm text-zinc-500">
                  Ready to take physical delivery of your cow, goat, or ram? Ship it directly to your doorstep.
                </p>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-950/40 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <form onSubmit={handleDeliverySubmit} className="space-y-4">
                  {delSuccess && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-xl text-center text-xs font-bold">
                      🚚 Delivery Scheduled! Specialized livestock carriers have been reserved.
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Select Animal to Receive</label>
                    <select 
                      value={delAnimalId} 
                      onChange={(e) => setDelAnimalId(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border dark:bg-zinc-900 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300"
                      required
                    >
                      <option value="">-- Choose one of your animals --</option>
                      {farmerLivestock.map(an => (
                        <option key={an.id} value={an.id}>
                          {an.breed} ({an.category}) - Tag: {an.tagNumber}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Delivery Date</label>
                      <input 
                        type="date" 
                        value={delDate}
                        onChange={(e) => setDelDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border dark:bg-zinc-900 dark:border-zinc-800 text-xs text-zinc-850 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Purpose of Delivery</label>
                      <select 
                        value={delPurpose}
                        onChange={(e) => setDelPurpose(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border dark:bg-zinc-900 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300"
                      >
                        <option value="Personal Consumption">Personal consumption</option>
                        <option value="Festive Sourcing">Festive / Celebration Sourcing</option>
                        <option value="Transfer to Personal Pen">Transfer to home ranch</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Delivery Address</label>
                    <textarea 
                      rows={3}
                      value={delAddress}
                      onChange={(e) => setDelAddress(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border dark:bg-zinc-900 dark:border-zinc-800 text-xs text-zinc-850 dark:text-white"
                      required
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Schedule My Animal Delivery
                  </button>
                </form>
              </div>

              {/* Delivery lists */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Active Deliveries Scheduled</h4>
                <div className="space-y-3">
                  {deliveryRequests.map((req) => (
                    <div key={req.id} className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl flex items-center justify-between text-xs">
                      <div className="space-y-1">
                        <p className="font-bold text-zinc-900 dark:text-white">
                          Delivery of Tag: {req.animalTag} ({req.breed})
                        </p>
                        <p className="text-[10px] text-zinc-400">Scheduled on {req.date} • Address: {req.address}</p>
                      </div>
                      <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded text-[9px] font-bold tracking-wider uppercase">
                        {req.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 8: MARKET RATES */}
          {activeTab === 'rates' && (
            <motion.div
              key="rates-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-zinc-900 dark:text-white flex items-center justify-center gap-2">
                  <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  Live Market Rates
                </h2>
                <p className="text-sm text-zinc-500">
                  Real-time direct livestock trading statistics and feed rates index.
                </p>
              </div>

              {/* Ticker synchronization indicator */}
              <div className="flex justify-center">
                <div className="inline-flex items-center space-x-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-full text-[10px] font-mono font-bold animate-pulse">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  <span>LIVE COOPERATIVE DATA STREAM</span>
                </div>
              </div>

              {/* Controls and Search Bar */}
              <div className="space-y-4">
                <div className="flex bg-zinc-100 dark:bg-zinc-950 p-1 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <button
                    onClick={() => {
                      setRatesTab('livestock');
                      setRatesSearchQuery('');
                    }}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      ratesTab === 'livestock'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                    }`}
                  >
                    Livestock Rates
                  </button>
                  <button
                    onClick={() => {
                      setRatesTab('feed');
                      setRatesSearchQuery('');
                    }}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      ratesTab === 'feed'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                    }`}
                  >
                    Feed Rates
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={ratesSearchQuery}
                    onChange={(e) => setRatesSearchQuery(e.target.value)}
                    placeholder={ratesTab === 'livestock' ? 'Search livestock breeds (e.g. goat, cow)...' : 'Search feed types (e.g. silage, concentrate)...'}
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs text-zinc-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Rates list */}
              <div className="space-y-3">
                {ratesTab === 'livestock' ? (
                  livestockRates
                    .filter((rate: any) => rate.name.toLowerCase().includes(ratesSearchQuery.toLowerCase()))
                    .map((rate: any) => {
                      const isPositive = !rate.change.startsWith('-');
                      return (
                        <div 
                          key={rate.id}
                          className="p-4 bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-850 rounded-2xl flex items-center justify-between"
                        >
                          <div className="space-y-1 text-left">
                            <p className="font-bold text-xs text-zinc-900 dark:text-white">{rate.name}</p>
                            <p className="text-[10px] text-zinc-400">Cooperative Trade Sourced</p>
                          </div>
                          <div className="text-right space-y-1">
                            <p className="font-mono font-bold text-sm text-zinc-900 dark:text-white">{rate.price}</p>
                            <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                              isPositive 
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            }`}>
                              {rate.change}
                            </span>
                          </div>
                        </div>
                      );
                    })
                ) : (
                  feedRates
                    .filter((rate: any) => rate.name.toLowerCase().includes(ratesSearchQuery.toLowerCase()))
                    .map((rate: any) => {
                      const isPositive = !rate.change.startsWith('-');
                      return (
                        <div 
                          key={rate.id}
                          className="p-4 bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-850 rounded-2xl flex items-center justify-between"
                        >
                          <div className="space-y-1 text-left">
                            <p className="font-bold text-xs text-zinc-900 dark:text-white">{rate.name}</p>
                            <p className="text-[10px] text-zinc-400">Distributor Feed Mill Index</p>
                          </div>
                          <div className="text-right space-y-1">
                            <p className="font-mono font-bold text-sm text-zinc-900 dark:text-white">{rate.price}</p>
                            <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                              isPositive 
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            }`}>
                              {rate.change}
                            </span>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 7: PROFILE */}
          {activeTab === 'profile' && (
            <motion.div
              key="profile-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-zinc-900 dark:text-white">My Profile</h2>
                <p className="text-sm text-zinc-500">
                  Manage your personal account, review options, or change your platform experience mode.
                </p>
              </div>

              {!currentUser ? (
                <div className="p-8 bg-zinc-50 dark:bg-zinc-950/40 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-center space-y-6">
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-base text-zinc-800 dark:text-white">Guest Account</h3>
                    <p className="text-xs text-zinc-500">You are currently viewing the platform as a guest. Please sign in to unlock custom livestock tracking.</p>
                  </div>
                  
                  {/* Preset review selectors */}
                  <div className="space-y-3 max-w-sm mx-auto">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Fast-Sign In to Evaluate</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => handleQuickPresetLogin('investor')}
                        className="py-2 px-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 cursor-pointer"
                      >
                        Investor Portal
                      </button>
                      <button 
                        onClick={() => handleQuickPresetLogin('farmer')}
                        className="py-2 px-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 cursor-pointer"
                      >
                        Farmer Portal
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-zinc-50 dark:bg-zinc-950/40 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center gap-6">
                    <img 
                      src={currentUser.avatar} 
                      alt={currentUser.fullName} 
                      className="h-16 w-16 rounded-full border-2 border-emerald-500 object-cover" 
                    />
                    <div className="text-center sm:text-left space-y-1 flex-1">
                      <h3 className="font-bold text-lg text-zinc-900 dark:text-white">{currentUser.fullName}</h3>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wide">{currentUser.role} Account</p>
                      <p className="text-xs text-zinc-400 mt-1">Email: {currentUser.email} | Phone: {currentUser.phone}</p>
                    </div>
                    <button 
                      onClick={() => { setCurrentUser(null); setActiveTab('home'); }}
                      className="px-4 py-2 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" /> Log Out
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      </div>
    </div>
  );
}
