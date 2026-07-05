import { useState, useEffect } from 'react';
import { Search, ShoppingCart, SlidersHorizontal, Info, Heart, Eye, ArrowRight, ShieldCheck, X, Trash2, Home, Wheat, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MarketplaceAnimal, User as UserType } from '../types';
import { MARKETPLACE_ANIMALS } from '../data';
import PricingPackages from './PricingPackages';

interface MarketplaceProps {
  currentUser: UserType | null;
  onOpenAuth: (role?: 'investor' | 'farmer') => void;
  cartItems: { animal: MarketplaceAnimal; quantity: number }[];
  onAddToCart: (animal: MarketplaceAnimal) => void;
  onRemoveFromCart: (id: string) => void;
  onClearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  userBalance: number;
  onDeductBalance: (amount: number) => void;
  onPurchaseLivestock: (animals: MarketplaceAnimal[], option: 'deliver' | 'farm', feedingPlan?: string, animalPackages?: Record<string, string>) => void;
}

export default function Marketplace({
  currentUser,
  onOpenAuth,
  cartItems,
  onAddToCart,
  onRemoveFromCart,
  onClearCart,
  isCartOpen,
  setIsCartOpen,
  userBalance,
  onDeductBalance,
  onPurchaseLivestock
}: MarketplaceProps) {
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Cow' | 'Goat' | 'Ram'>('All');
  const [selectedGender, setSelectedGender] = useState<'All' | 'Male' | 'Female'>('All');
  const [sortBy, setSortBy] = useState<'none' | 'priceAsc' | 'priceDesc' | 'weightDesc'>('none');

  // Checkout states
  const [checkoutStep, setCheckoutStep] = useState<'idle' | 'checking_out' | 'processing' | 'success'>('idle');
  const [deliveryOption, setDeliveryOption] = useState<'deliver' | 'farm'>('farm');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [preferredFeedingPlan, setPreferredFeedingPlan] = useState<'Pasture Only' | 'Pasture + Supplement Feed' | 'Premium Fattening Feed'>('Pasture + Supplement Feed');
  const [animalPackages, setAnimalPackages] = useState<Record<string, string>>({});

  // Helper to fetch active packages for a category
  const getActivePackagesForCategory = (category: string): string[] => {
    const storedPkgs = localStorage.getItem('cp_pricing_packages');
    if (storedPkgs) {
      try {
        const pkgs = JSON.parse(storedPkgs);
        if (Array.isArray(pkgs)) {
          const activePkgs = pkgs.filter(p => p.status === 'Active' && (p.animalType || '').toLowerCase() === category.toLowerCase());
          if (activePkgs.length > 0) {
            return activePkgs.map(p => p.name);
          }
        }
      } catch (e) {}
    }
    const staticFallbackMap: Record<string, string[]> = {
      cow: ['Pasture Only', 'Pasture + Supplement Feed', 'Premium Fattening Feed'],
      ram: ['Pasture Only', 'Pasture + Supplement Feed', 'Premium Fattening Feed'],
      goat: ['Pasture Only', 'Pasture + Supplement Feed', 'Premium Fattening Feed']
    };
    return staticFallbackMap[category.toLowerCase()] || [];
  };

  // Initialize package selection for each animal
  useEffect(() => {
    if (checkoutStep === 'checking_out') {
      const initial: Record<string, string> = { ...animalPackages };
      cartItems.forEach((item) => {
        if (!initial[item.animal.id]) {
          const active = getActivePackagesForCategory(item.animal.category);
          if (active.length > 0) {
            const hasSupplement = active.find(p => p.toLowerCase().includes('supplement'));
            initial[item.animal.id] = hasSupplement || active[0];
          }
        }
      });
      setAnimalPackages(initial);
    }
  }, [checkoutStep, cartItems]);

  const filteredAnimals = MARKETPLACE_ANIMALS.filter((an) => {
    const matchesSearch = an.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          an.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || an.category === selectedCategory;
    const matchesGender = selectedGender === 'All' || an.gender === selectedGender;
    return matchesSearch && matchesCat && matchesGender;
  }).sort((a, b) => {
    if (sortBy === 'priceAsc') return a.price - b.price;
    if (sortBy === 'priceDesc') return b.price - a.price;
    if (sortBy === 'weightDesc') return b.weightKg - a.weightKg;
    return 0;
  });

  const cartTotal = cartItems.reduce((acc, item) => acc + (item.animal.price * item.quantity), 0);

  const handleBuyNow = (animal: MarketplaceAnimal) => {
    onAddToCart(animal);
    setIsCartOpen(true);
  };

  const handleCheckoutClick = () => {
    if (!currentUser) {
      setIsCartOpen(false);
      onOpenAuth('investor');
      return;
    }
    setDeliveryAddress('');
    setContactPhone(currentUser.phone || '');
    setCheckoutStep('checking_out');
  };

  const handleConfirmPurchase = () => {
    if (deliveryOption === 'deliver' && (!deliveryAddress || !contactPhone)) {
      alert('Please fill in your delivery address and contact phone number.');
      return;
    }
    if (deliveryOption === 'farm' && !contactPhone) {
      alert('Please fill in your contact phone number.');
      return;
    }

    if (deliveryOption === 'farm') {
      const missingPackage = cartItems.find(item => !animalPackages[item.animal.id]);
      if (missingPackage) {
        alert(`Please select a valid boarding package for your ${missingPackage.animal.breed}. If there are no active boarding packages available, please contact support or choose home delivery.`);
        return;
      }
    }

    if (userBalance < cartTotal) {
      alert('Insufficient wallet balance. Please add funds in your Escrow Wallet first.');
      return;
    }

    setCheckoutStep('processing');

    setTimeout(() => {
      // Trigger state updates in App.tsx
      onPurchaseLivestock(
        cartItems.map(item => item.animal),
        deliveryOption,
        deliveryOption === 'farm' ? preferredFeedingPlan : undefined,
        deliveryOption === 'farm' ? animalPackages : undefined
      );
      setCheckoutStep('success');
    }, 2000);
  };

  return (
    <section className="py-20 bg-slate-50 dark:bg-zinc-900/40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16">
          <div>
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/50 border border-slate-200/80 dark:border-emerald-500/10 px-3.5 py-1.5 rounded-full">
              LIVESTOCK MARKETPLACE
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white mt-4 tracking-tight animate-fade-in">
              Buy Premium Live Livestock Directly from the Farm
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mt-2 max-w-2xl text-sm sm:text-base">
              Traceable, healthy, and certified livestock available for retail purchases, festive celebrations, or bulk food supply. We deliver in specialized vans.
            </p>
          </div>
          
          <button
            onClick={() => setIsCartOpen(true)}
            className="mt-6 md:mt-0 flex items-center justify-center bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-800 px-5 py-3 rounded-xl text-xs font-bold sleek-shadow hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all space-x-2"
          >
            <ShoppingCart className="h-4.5 w-4.5 text-emerald-700 dark:text-emerald-400" />
            <span>My Cart ({cartItems.length})</span>
            {cartItems.length > 0 && (
              <span className="bg-emerald-700 text-white h-5 px-1.5 text-[10px] rounded-full flex items-center justify-center font-bold">
                ₦{cartTotal.toLocaleString()}
              </span>
            )}
          </button>
        </div>

        {/* Filters and Search controls */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800/80 sleek-shadow mb-10 space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            
            {/* Search */}
            <div className="md:col-span-5 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search breed (e.g. Fulani, Sokoto, Balami)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:outline-none focus:border-emerald-700 text-zinc-800 dark:text-white"
              />
            </div>

            {/* Category selection */}
            <div className="md:col-span-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl text-xs bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:outline-none focus:border-emerald-700 font-medium text-zinc-700 dark:text-zinc-300"
              >
                <option value="All">All Animal Categories</option>
                <option value="Cow">Cows 🐄</option>
                <option value="Goat">Goats 🐐</option>
                <option value="Ram">Rams 🐏</option>
              </select>
            </div>

            {/* Gender selection */}
            <div className="md:col-span-2">
              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl text-xs bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:outline-none focus:border-emerald-700 font-medium text-zinc-700 dark:text-zinc-300"
              >
                <option value="All">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            {/* Sorting */}
            <div className="md:col-span-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl text-xs bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:outline-none focus:border-emerald-700 font-medium text-zinc-700 dark:text-zinc-300"
              >
                <option value="none">Sort Options</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
                <option value="weightDesc">Weight: Heavy to Light</option>
              </select>
            </div>

          </div>

        </div>

        {/* Animals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <AnimatePresence>
            {filteredAnimals.length === 0 ? (
              <div className="col-span-full text-center py-20 bg-white dark:bg-zinc-950 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 shadow-sm">
                <p className="text-zinc-500 text-sm">No animals found matching your search parameters.</p>
              </div>
            ) : (
              filteredAnimals.map((an) => (
                <motion.div
                  key={an.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800/80 rounded-3xl overflow-hidden sleek-shadow flex flex-col justify-between"
                >
                  <div>
                    {/* Visual Photo */}
                    <div className="h-52 relative overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                      <img src={an.image} alt={an.breed} className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500" />
                      
                      <span className={`absolute top-4 left-4 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full shadow-md ${
                        an.healthStatus === 'Fully Vaccinated' ? 'bg-emerald-700 text-white' :
                        an.healthStatus === 'Excellent' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-black'
                      }`}>
                        🛡️ {an.healthStatus}
                      </span>

                      <span className="absolute bottom-4 left-4 bg-zinc-950/80 backdrop-blur-md text-zinc-100 text-[10px] font-mono px-3 py-1 rounded-lg">
                        📍 {an.location}
                      </span>
                    </div>

                    {/* Animal specifications */}
                    <div className="p-6 space-y-4">
                      <div>
                        <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider font-bold">
                          {an.category} • {an.gender}
                        </span>
                        <h4 className="font-display font-extrabold text-lg text-slate-900 dark:text-white mt-0.5">
                          {an.breed}
                        </h4>
                      </div>

                      {/* Weight, Age dashboard grids */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50/80 dark:bg-zinc-900/40 p-3 rounded-xl border border-slate-100/80 dark:border-zinc-800/60 text-center">
                          <span className="text-[9px] text-zinc-400 uppercase font-mono">LIVE WEIGHT</span>
                          <p className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200 mt-0.5">
                            {an.weightKg} kg
                          </p>
                        </div>
                        <div className="bg-slate-50/80 dark:bg-zinc-900/40 p-3 rounded-xl border border-slate-100/80 dark:border-zinc-800/60 text-center">
                          <span className="text-[9px] text-zinc-400 uppercase font-mono">AGE REGISTERED</span>
                          <p className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200 mt-0.5">
                            {an.ageMonths} months
                          </p>
                        </div>
                      </div>

                      <div className="h-px bg-zinc-100 dark:bg-zinc-800/80 my-2"></div>

                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-[10px] text-zinc-400 uppercase font-mono">OUTRIGHT PRICE</span>
                          <p className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400">
                            ₦{an.price.toLocaleString()}
                          </p>
                        </div>
                        <span className="text-2xl">{an.category === 'Cow' ? '🐄' : an.category === 'Goat' ? '🐐' : '🐏'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => onAddToCart(an)}
                      className="py-3 px-3 rounded-xl text-xs font-bold border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all text-center"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() => handleBuyNow(an)}
                      className="py-3 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/10 transition-all text-center"
                    >
                      Buy Now
                    </button>
                  </div>

                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* Slide-out Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-zinc-950/70 backdrop-blur-sm"
              onClick={() => {
                if (checkoutStep === 'idle') setIsCartOpen(false);
              }}
            />

            <div className="absolute inset-y-0 right-0 max-w-full flex font-sans">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.3 }}
                className="w-screen max-w-md bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col justify-between"
              >
                
                {/* Header */}
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/40">
                  <div className="flex items-center space-x-3">
                    <ShoppingCart className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="font-display font-bold text-lg text-zinc-900 dark:text-white">Shopping Cart</h3>
                  </div>
                  {checkoutStep === 'idle' && (
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-zinc-800 dark:text-zinc-200">
                  {checkoutStep === 'idle' && (
                    <>
                      {cartItems.length === 0 ? (
                        <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
                          <span className="text-4xl">🛒</span>
                          <p className="text-zinc-500 text-sm">Your livestock cart is currently empty.</p>
                          <button
                            onClick={() => setIsCartOpen(false)}
                            className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                          >
                            Browse Marketplace
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {cartItems.map((item) => (
                            <div key={item.animal.id} className="flex items-center space-x-4 p-3 border border-zinc-100 dark:border-zinc-800 rounded-2xl bg-zinc-50/60 dark:bg-zinc-900/30">
                              <img src={item.animal.image} alt={item.animal.breed} className="h-16 w-16 rounded-xl object-cover" />
                              <div className="flex-1">
                                <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{item.animal.breed}</h5>
                                <p className="text-[11px] text-zinc-400 mt-0.5">Weight: {item.animal.weightKg} kg</p>
                                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-1">₦{item.animal.price.toLocaleString()}</p>
                              </div>
                              <button
                                onClick={() => onRemoveFromCart(item.animal.id)}
                                className="p-2 text-zinc-400 hover:text-red-500 rounded-lg"
                                title="Remove item"
                              >
                                <Trash2 className="h-4.5 w-4.5" />
                              </button>
                            </div>
                          ))}

                          <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 mt-6 space-y-2.5">
                            <div className="flex justify-between text-xs text-zinc-500">
                              <span>Total Items:</span>
                              <span className="font-bold">{cartItems.length}</span>
                            </div>
                            <div className="flex justify-between text-xs text-zinc-500">
                              <span>Setup & RFID Tagging Fee:</span>
                              <span className="text-emerald-600 font-bold font-mono">Free Promo</span>
                            </div>
                            <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1"></div>
                            <div className="flex justify-between text-sm">
                              <span className="font-bold text-zinc-900 dark:text-white">Subtotal Amount:</span>
                              <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400">₦{cartTotal.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {checkoutStep === 'checking_out' && (
                    <div className="space-y-5">
                      <h4 className="text-sm font-bold text-zinc-800 dark:text-white border-b pb-2">Complete Your Purchase Flow</h4>
                      
                      {/* Delivery option selection: Direct Delivery vs Managed Farm */}
                      <div className="space-y-3">
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">How should we handle your livestock?</label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setDeliveryOption('farm')}
                            className={`p-4 rounded-2xl border text-left transition-all space-y-1 ${
                              deliveryOption === 'farm'
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-zinc-950 dark:text-white'
                                : 'bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-500'
                            }`}
                          >
                            <Wheat className="h-5 w-5 text-emerald-600" />
                            <h5 className="font-bold text-xs mt-1">Board at CowPlug Farm</h5>
                            <p className="text-[10px] opacity-80">We manage, feed, vaccinate, and provide digital tracking.</p>
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeliveryOption('deliver')}
                            className={`p-4 rounded-2xl border text-left transition-all space-y-1 ${
                              deliveryOption === 'deliver'
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-zinc-950 dark:text-white'
                                : 'bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-500'
                            }`}
                          >
                            <Truck className="h-5 w-5 text-emerald-600" />
                            <h5 className="font-bold text-xs mt-1">Deliver immediately</h5>
                            <p className="text-[10px] opacity-80">Deliver physically to your home address via specialized vans.</p>
                          </button>
                        </div>
                      </div>

                      {/* Dynamic form inputs based on delivery options */}
                      <div className="space-y-4 pt-2">
                        {deliveryOption === 'deliver' ? (
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                              Full Shipping Address
                            </label>
                            <textarea
                              placeholder="e.g. Plot 15, Admiralty Way, Lekki Phase 1, Lagos"
                              rows={3}
                              value={deliveryAddress}
                              onChange={(e) => setDeliveryAddress(e.target.value)}
                              className="w-full p-3 text-xs rounded-xl border dark:bg-zinc-900 dark:border-zinc-800 focus:outline-none focus:border-emerald-500 text-zinc-800 dark:text-white bg-zinc-50 dark:bg-zinc-950"
                            />
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                              Preferred Feeding & Boarding Plan (Select for each animal)
                            </label>
                            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                              {cartItems.map((item) => {
                                const anim = item.animal;
                                const currentPkg = animalPackages[anim.id] || '';
                                return (
                                  <div key={anim.id} className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40 space-y-3">
                                    <div className="flex items-center gap-2.5">
                                      <div className="text-xl bg-emerald-500/10 p-1.5 rounded-lg">{anim.category === 'Cow' ? '🐄' : anim.category === 'Goat' ? '🐐' : anim.category === 'Ram' ? '🐏' : '🐾'}</div>
                                      <div>
                                        <h6 className="font-bold text-xs text-zinc-900 dark:text-white">{anim.breed} ({anim.category})</h6>
                                        <p className="text-[10px] text-zinc-500 font-semibold">Tag ID: CPG-{anim.id} • {anim.weightKg}kg • {anim.gender}</p>
                                      </div>
                                    </div>
                                    <div className="border-t border-zinc-150 dark:border-zinc-800/80 pt-3">
                                      <PricingPackages 
                                        isCompact={true}
                                        animalType={anim.category.toLowerCase() as any}
                                        selectedPackage={currentPkg}
                                        onChoosePackage={(name) => {
                                          setAnimalPackages(prev => ({
                                            ...prev,
                                            [anim.id]: name
                                          }));
                                        }}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                            Contact Phone for Logistics/Ranch updates
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. +234 803 123 4567"
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                            className="w-full p-3 text-xs rounded-xl border dark:bg-zinc-900 dark:border-zinc-800 focus:outline-none focus:border-emerald-500 text-zinc-800 dark:text-white font-mono bg-zinc-50 dark:bg-zinc-950"
                          />
                        </div>

                        <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10 space-y-1 text-xs">
                          <p className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center">
                            <ShieldCheck className="h-4 w-4 mr-1 text-emerald-600" /> Complete Trust & Title Document
                          </p>
                          <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed text-[10px]">
                            {deliveryOption === 'farm' 
                              ? 'Your physical animals will be assigned unique RFID chips and placed under professional veterinary logs and strict biosecurity protocols.'
                              : 'Your animals are cleared by vet officers and packaged securely in refrigerated or specialized live-transport vans for rapid shipment.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {checkoutStep === 'processing' && (
                    <div className="py-16 flex flex-col items-center justify-center space-y-4 text-center">
                      <div className="relative h-14 w-14">
                        <div className="absolute inset-0 rounded-full border-4 border-zinc-100 dark:border-zinc-800"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin"></div>
                      </div>
                      <h4 className="font-display font-bold text-base text-zinc-800 dark:text-white">Authorizing Escrow Wallet Settlement...</h4>
                      <p className="text-xs text-zinc-400 max-w-xs">
                        Assigning permanent tagging IDs and creating veterinary record profiles.
                      </p>
                    </div>
                  )}

                  {checkoutStep === 'success' && (
                    <div className="py-10 flex flex-col items-center justify-center space-y-5 text-center animate-scale-up">
                      <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-950 border border-emerald-500/20 text-emerald-600 rounded-full flex items-center justify-center text-2xl">
                        🎉
                      </div>
                      <div>
                        <h4 className="font-display font-extrabold text-2xl text-zinc-900 dark:text-white">Payment Authorized!</h4>
                        <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
                          {deliveryOption === 'farm'
                            ? 'Your healthy livestock is successfully boarded! Head to your digital dashboard to view their active weight progress, vaccine history, and custom feed plans.'
                            : 'Our logistics dispatch team has processed your shipment and will contact you within 2 hours.'}
                        </p>
                      </div>

                      <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 w-full text-xs space-y-2 text-left font-mono">
                        <div className="flex justify-between"><span className="text-zinc-400">Escrow ID:</span> <strong className="text-zinc-800 dark:text-zinc-200">ES-CP-{Math.floor(Math.random() * 90000) + 10000}</strong></div>
                        <div className="flex justify-between"><span className="text-zinc-400">Handling Option:</span> <strong className="text-emerald-600">{deliveryOption === 'farm' ? 'Board at CowPlug Ranch' : 'Instant Shipping'}</strong></div>
                        {deliveryOption === 'farm' && (
                          <div className="space-y-1 border-t border-b border-zinc-200 dark:border-zinc-800/80 py-1.5 my-1 text-[11px]">
                            <span className="text-[10px] font-bold uppercase text-zinc-400">Assigned Packages:</span>
                            {cartItems.map((item) => (
                              <div key={item.animal.id} className="flex justify-between">
                                <span className="text-zinc-500">{item.animal.breed} ({item.animal.category}):</span>
                                <strong className="text-emerald-600 dark:text-emerald-400">{animalPackages[item.animal.id] || 'None Selected'}</strong>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex justify-between"><span className="text-zinc-400">Escrow Outlay:</span> <strong className="text-emerald-600">₦{cartTotal.toLocaleString()}</strong></div>
                      </div>

                      <button
                        onClick={() => {
                          setCheckoutStep('idle');
                          setIsCartOpen(false);
                        }}
                        className="w-full py-3 bg-zinc-900 text-white rounded-xl font-bold text-xs hover:bg-zinc-800"
                      >
                        Great, Back to Marketplace
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer bar */}
                {cartItems.length > 0 && checkoutStep === 'idle' && (
                  <div className="p-6 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                      onClick={handleCheckoutClick}
                      className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-lg transition-all"
                    >
                      Checkout Securely (₦{cartTotal.toLocaleString()})
                    </button>
                  </div>
                )}

                {checkoutStep === 'checking_out' && (
                  <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-2 gap-3 bg-zinc-50 dark:bg-zinc-900/20">
                    <button
                      onClick={() => setCheckoutStep('idle')}
                      className="py-3 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-bold"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleConfirmPurchase}
                      className="py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-lg"
                    >
                      Pay from Escrow Wallet
                    </button>
                  </div>
                )}

              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
