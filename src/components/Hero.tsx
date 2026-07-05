import { useState, useEffect } from 'react';
import { TrendingUp, ShieldCheck, Users, TreePine, ArrowRight, Sparkles, HeartPulse, Activity, MapPin, CheckCircle, ShoppingBag, Eye, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';
import AnimalOutlineIcon from './AnimalOutlineIcon';

interface HeroProps {
  onBuyLivestock: () => void;
  onBrowseMarketplace: () => void;
  onRequestSourcing: () => void;
  onViewMarketRates?: (tab: 'livestock' | 'feed') => void;
  experienceMode?: 'lite' | 'pro';
  setExperienceMode?: (mode: 'lite' | 'pro') => void;
}

export default function Hero({ 
  onBuyLivestock, 
  onBrowseMarketplace, 
  onRequestSourcing, 
  onViewMarketRates,
  experienceMode,
  setExperienceMode
}: HeroProps) {
  const [activeProfileTab, setActiveProfileTab] = useState<'cow' | 'ram'>('cow');
  
  const stats = [
    { value: 'Our Journey Begins', label: 'Transparency First', icon: <TreePine className="h-5 w-5 text-emerald-500" /> },
    { value: 'Launching Soon', label: 'Nigeria\'s Trusted Ownership', icon: <Users className="h-5 w-5 text-emerald-500" /> },
    { value: '24/7 Vet Care', label: 'Professional Livestock Care', icon: <ShieldCheck className="h-5 w-5 text-amber-500" /> },
    { value: '₦0 Setup Fee', label: 'Transparent Pricing', icon: <TrendingUp className="h-5 w-5 text-emerald-500" /> },
  ];

  const [marketTicker, setMarketTicker] = useState(() => {
    const saved = localStorage.getItem('cp_market_livestock_rates');
    return saved ? JSON.parse(saved) : [
      { name: 'Red Sokoto Goat', price: '₦85,000', change: '+4.2%' },
      { name: 'White Fulani Bull', price: '₦450,000', change: '+2.8%' },
      { name: 'Balami Premium Ram', price: '₦175,000', change: '+6.1%' },
      { name: 'Sokoto Gudali Cow', price: '₦520,000', change: '+1.5%' },
      { name: 'West African Dwarf Goat', price: '₦68,000', change: '+3.9%' },
    ];
  });

  const [feedTicker, setFeedTicker] = useState(() => {
    const saved = localStorage.getItem('cp_market_feed_rates');
    return saved ? JSON.parse(saved) : [
      { name: 'Premium Grass Silage (per kg)', price: '₦1,200', change: '+1.8%' },
      { name: 'High-Protein Fattening Concentrate (per bag)', price: '₦24,500', change: '-0.5%' },
      { name: 'Organic Feed Hay Bale', price: '₦8,500', change: '+2.3%' },
      { name: 'Mineral Salt Lick Block (per block)', price: '₦4,800', change: '+0.0%' },
      { name: 'Vitamin-Fortified Wheat Bran (per bag)', price: '₦18,200', change: '+1.2%' },
    ];
  });

  useEffect(() => {
    const syncTicker = () => {
      const savedLive = localStorage.getItem('cp_market_livestock_rates');
      if (savedLive) setMarketTicker(JSON.parse(savedLive));
      const savedFeed = localStorage.getItem('cp_market_feed_rates');
      if (savedFeed) setFeedTicker(JSON.parse(savedFeed));
    };
    syncTicker();
    
    window.addEventListener('storage', syncTicker);
    const interval = setInterval(syncTicker, 2000);
    return () => {
      window.removeEventListener('storage', syncTicker);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="relative bg-zinc-950 dark:bg-black text-white overflow-hidden">
      
      {/* Experience Toggle (Binance-style) placed on the Homepage Background directly below the main navigation bar */}
      <div className="pt-24 pb-2 px-4 flex justify-center relative z-20">
        <div className="bg-zinc-900/80 backdrop-blur-md p-1 rounded-2xl flex items-center border border-zinc-800 shadow-xl w-full max-w-xs sm:max-w-sm">
          <button
            id="toggle-lite-mode"
            onClick={() => setExperienceMode?.('lite')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
              experienceMode === 'lite'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>Lite Mode</span>
          </button>
          <button
            id="toggle-pro-mode"
            onClick={() => setExperienceMode?.('pro')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
              experienceMode === 'pro'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>Pro Mode</span>
          </button>
        </div>
      </div>

      {/* Real-time Ticker Bar on top of the homepage */}
      <div className="bg-zinc-900/90 border-b border-zinc-800 py-4 overflow-hidden relative z-20 backdrop-blur-sm mt-4">
        <div className="max-w-7xl mx-auto px-4 space-y-4">
          
          {/* Livestock Rates Ticker row */}
          <div 
            onClick={() => onViewMarketRates?.('livestock')}
            className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 cursor-pointer hover:bg-zinc-800/50 p-2 rounded-2xl transition-all group"
            title="Click to view detailed Livestock Rates table & download contract documents"
          >
            <div className="flex items-center space-x-2 flex-shrink-0 z-10 bg-zinc-900/90 pr-4">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-extrabold uppercase text-zinc-400 group-hover:text-emerald-400 tracking-wider font-mono transition-colors">Live Livestock Rates:</span>
            </div>
            <div className="relative flex-1 overflow-hidden h-6 flex items-center">
              <motion.div
                animate={{ x: [0, -1200] }}
                transition={{
                  ease: "linear",
                  duration: 28,
                  repeat: Infinity,
                }}
                className="flex space-x-12 whitespace-nowrap absolute left-0"
              >
                {[...marketTicker, ...marketTicker, ...marketTicker, ...marketTicker].map((tick, idx) => (
                  <div key={idx} className="inline-flex items-center space-x-2 text-xs font-mono flex-shrink-0">
                    <span className="text-zinc-400">{tick.name}</span>
                    <span className="font-bold text-white">{tick.price}</span>
                    <span className={`font-bold ${tick.change.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {tick.change}
                    </span>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Feed Market Rates Ticker row */}
          <div 
            onClick={() => onViewMarketRates?.('feed')}
            className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 border-t border-zinc-800/30 pt-3 cursor-pointer hover:bg-zinc-800/50 p-2 rounded-2xl transition-all group"
            title="Click to view detailed Feed Rates table & download contract documents"
          >
            <div className="flex items-center space-x-2 flex-shrink-0 z-10 bg-zinc-900/90 pr-4">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span className="text-[10px] font-extrabold uppercase text-zinc-400 group-hover:text-amber-400 tracking-wider font-mono transition-colors">Live Feed Rates:</span>
            </div>
            <div className="relative flex-1 overflow-hidden h-6 flex items-center">
              <motion.div
                animate={{ x: [-1200, 0] }}
                transition={{
                  ease: "linear",
                  duration: 28,
                  repeat: Infinity,
                }}
                className="flex space-x-12 whitespace-nowrap absolute left-0"
              >
                {[...feedTicker, ...feedTicker, ...feedTicker, ...feedTicker].map((tick, idx) => (
                  <div key={idx} className="inline-flex items-center space-x-2 text-xs font-mono flex-shrink-0">
                    <span className="text-zinc-400">{tick.name}</span>
                    <span className="font-bold text-white">{tick.price}</span>
                    <span className={`font-bold ${tick.change.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {tick.change}
                    </span>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>

        </div>
      </div>

      {/* Visual Background Pasture Image with Dark Emerald Shading Overlay */}
      <div className="absolute inset-0 z-0 opacity-45">
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

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 lg:pt-14 lg:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Content Column */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-1.5 text-xs font-semibold text-emerald-400 backdrop-blur-md"
            >
              <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
              <span className="tracking-wide uppercase">Your Livestock. Our Management. Complete Transparency.</span>
            </motion.div>

            {/* Main Premium Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-tight"
            >
              Own Your Livestock Today.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-amber-300">We'll Raise It Until You Need It.</span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-zinc-300 text-base sm:text-lg lg:text-xl max-w-xl leading-relaxed font-sans"
            >
              Purchase a healthy cow, goat, or ram today. CowPlugNG professionally manages your livestock, provides regular health updates, transparent records, and delivers your animal whenever you're ready.
            </motion.p>

            {/* Call To Actions */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row flex-wrap gap-4 sm:items-center"
            >
              <button
                onClick={onBuyLivestock}
                className="group flex items-center justify-center px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-700/10 hover:shadow-emerald-700/20 transition-all text-base"
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Buy Livestock
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onBrowseMarketplace}
                className="flex items-center justify-center px-6 py-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 font-bold rounded-xl border border-zinc-800 transition-all text-base shadow-sm"
              >
                <Eye className="mr-2 h-5 w-5 text-emerald-400" />
                Browse Marketplace
              </button>

              <button
                onClick={onRequestSourcing}
                className="flex items-center justify-center px-6 py-4 bg-transparent hover:bg-zinc-900 text-zinc-300 hover:text-white font-semibold rounded-xl border border-dashed border-zinc-700 hover:border-zinc-500 transition-all text-base"
              >
                <HelpCircle className="mr-2 h-5 w-5 text-amber-400" />
                Request Livestock Sourcing
              </button>
            </motion.div>

          </div>

          {/* Authentic Clean Livestock Profile Card */}
          <div className="lg:col-span-5 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="bg-white/95 dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md relative sleek-shadow text-zinc-900 dark:text-white"
            >
              {/* Healthy Badge */}
              <div className="absolute top-4 right-4 flex items-center space-x-1.5 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                <span className="text-[10px] font-extrabold uppercase text-emerald-700 dark:text-emerald-400 font-mono tracking-widest">Status: Healthy</span>
              </div>

              {/* Tab Selector Inside Card */}
              <div className="flex bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl mb-5 max-w-[160px] border border-zinc-200/40 dark:border-zinc-800/60">
                <button 
                  onClick={() => setActiveProfileTab('cow')}
                  className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all ${
                    activeProfileTab === 'cow' 
                      ? 'bg-emerald-600 text-white shadow-sm' 
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  Cow
                </button>
                <button 
                  onClick={() => setActiveProfileTab('ram')}
                  className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all ${
                    activeProfileTab === 'ram' 
                      ? 'bg-emerald-600 text-white shadow-sm' 
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  Ram
                </button>
              </div>

              {/* Profile Header */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-10 w-10 bg-emerald-50 dark:bg-emerald-950 border border-emerald-100 dark:border-emerald-500/30 rounded-xl flex items-center justify-center">
                  <AnimalOutlineIcon category={activeProfileTab} className="h-6 w-6 text-emerald-700 dark:text-emerald-400" />
                </div>
                <div>
                  <span className="text-[9px] text-zinc-400 font-mono uppercase tracking-wider font-extrabold">
                    {activeProfileTab === 'cow' ? 'Animal ID: CPG-CW-001' : 'Animal ID: CPG-RM-002'}
                  </span>
                  <h3 className="font-display font-bold text-base text-zinc-900 dark:text-white">
                    {activeProfileTab === 'cow' ? 'White Fulani Cow Profile' : 'Premium Balami Ram Profile'}
                  </h3>
                </div>
              </div>

              {/* High Quality Real-Life Animal Image */}
              <div className="h-40 w-full rounded-2xl overflow-hidden mb-5 relative border border-zinc-200 dark:border-zinc-800">
                <img
                  src={
                    activeProfileTab === 'cow' 
                      ? "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&q=80&w=600" 
                      : "https://images.unsplash.com/photo-1484557985045-edf25e08da73?auto=format&fit=crop&q=80&w=600"
                  }
                  alt={activeProfileTab === 'cow' ? "White Fulani Cow" : "Premium Balami Ram"}
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
              </div>

              {/* Profile Details */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 dark:bg-zinc-950/60 border border-slate-100 dark:border-zinc-800/80 rounded-xl">
                    <p className="text-[9px] text-zinc-400 uppercase tracking-wide">Species / Breed</p>
                    <p className="text-xs font-bold text-zinc-800 dark:text-white mt-1">
                      {activeProfileTab === 'cow' ? 'Cow / White Fulani' : 'Ram / Balami Premium'}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-zinc-950/60 border border-slate-100 dark:border-zinc-800/80 rounded-xl">
                    <p className="text-[9px] text-zinc-400 uppercase tracking-wide">Age & Weight</p>
                    <p className="text-xs font-bold text-zinc-800 dark:text-white mt-1">
                      {activeProfileTab === 'cow' ? '8 Months / 310 kg' : '9 Months / 78 kg'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 dark:bg-zinc-950/60 border border-slate-100 dark:border-zinc-800/80 rounded-xl">
                    <p className="text-[9px] text-zinc-400 uppercase tracking-wide">Farm Location</p>
                    <p className="text-xs font-bold text-zinc-800 dark:text-white mt-1">
                      {activeProfileTab === 'cow' ? 'CowPlugNG Oyo Farm' : 'CowPlugNG Oyo Ranch'}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-zinc-950/60 border border-slate-100 dark:border-zinc-800/80 rounded-xl">
                    <p className="text-[9px] text-zinc-400 uppercase tracking-wide">Feeding Plan</p>
                    <p className="text-xs font-bold text-zinc-800 dark:text-white mt-1">
                      {activeProfileTab === 'cow' ? 'Premium Feed' : 'High-Protein Grain Mix'}
                    </p>
                  </div>
                </div>

                {/* Health & Vaccination Subcard */}
                <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-500/10 rounded-xl p-3.5 space-y-1.5 text-left">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-zinc-500">Last Vaccination:</span>
                    <span className="font-bold text-emerald-800 dark:text-emerald-400">
                      {activeProfileTab === 'cow' ? '28 June 2026' : '1 July 2026'}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-zinc-500">Next Scheduled Checkup:</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">
                      {activeProfileTab === 'cow' ? '28 July 2026' : '1 August 2026'}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-zinc-500">Current Owner:</span>
                    <span className="text-zinc-400 italic">Visible inside owner's dashboard</span>
                  </div>
                </div>

                {/* Realistic Management Tools Header */}
                <div className="pt-2 text-left">
                  <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block mb-2">Available Records & Operations</span>
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-600 dark:text-zinc-300">
                    <span className="flex items-center">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-500 mr-1 flex-shrink-0" /> Latest Photos & Videos
                    </span>
                    <span className="flex items-center">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-500 mr-1 flex-shrink-0" /> Full Weight History
                    </span>
                    <span className="flex items-center">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-500 mr-1 flex-shrink-0" /> Vaccination & Med Logs
                    </span>
                    <span className="flex items-center">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-500 mr-1 flex-shrink-0" /> Invoices & Delivery
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500">
                <span className="flex items-center"><ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-500 mr-1" /> Trust & Professional Care</span>
                <span>Verified manually by vet team</span>
              </div>
            </motion.div>
          </div>

        </div>

        {/* Live Premium Stats Section */}
        <div className="mt-16 lg:mt-24 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + idx * 0.1 }}
              className="bg-zinc-900/50 border border-zinc-800/60 rounded-2xl p-4 sm:p-5 flex items-center space-x-4 backdrop-blur-sm"
            >
              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-center">
                {stat.icon}
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-extrabold font-display text-white">{stat.value}</p>
                <p className="text-xs text-zinc-400 font-medium">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

    </div>
  );
}
