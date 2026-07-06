import { useState, useEffect } from 'react';
import { TrendingUp, ShieldCheck, Users, TreePine, ArrowRight, Sparkles, ShoppingBag, Eye, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';
import homeWallpaper from '../assets/images/home_wallpaper_1783330422318.jpg';

interface HeroProps {
  onBuyLivestock: () => void;
  onBrowseCatalog: () => void;
  onRequestSourcing: () => void;
  onViewMarketRates?: (tab: 'livestock' | 'feed') => void;
  experienceMode?: 'lite' | 'pro';
  setExperienceMode?: (mode: 'lite' | 'pro') => void;
}

export default function Hero({ 
  onBuyLivestock, 
  onBrowseCatalog, 
  onRequestSourcing, 
  onViewMarketRates,
  experienceMode,
  setExperienceMode
}: HeroProps) {
  


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
      
      {/* Visual Background Pasture Image with Dark Emerald Shading Overlay */}
      <div className="absolute inset-0 z-0 opacity-45">
        <img
          src={homeWallpaper}
          alt="Healthy livestock grazing in premium pastures"
          className="w-full h-full object-cover object-center scale-105 filter saturate-125"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/90 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent"></div>
      </div>

      {/* Decorative Golden Ambient Gradients */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full filter blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-emerald-500/15 rounded-full filter blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 lg:pt-36 lg:pb-28">
        <div className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto space-y-8">
          
          {/* Hero Content Column */}
          <div className="space-y-8 flex flex-col items-center justify-center">
            
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
              className="text-zinc-300 text-base sm:text-lg lg:text-xl max-w-2xl leading-relaxed font-sans text-center"
            >
              Purchase a healthy cow, goat, or ram today. CowPlugNG professionally manages your livestock, provides regular health updates, transparent records, and delivers your animal whenever you're ready.
            </motion.p>

            {/* Call To Actions */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row flex-wrap gap-4 items-center justify-center"
            >
              <button
                onClick={onBuyLivestock}
                className="group flex items-center justify-center px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-700/10 hover:shadow-emerald-700/20 transition-all text-base cursor-pointer"
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Buy Livestock
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onBrowseCatalog}
                className="flex items-center justify-center px-6 py-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 font-bold rounded-xl border border-zinc-800 transition-all text-base shadow-sm cursor-pointer"
              >
                <Eye className="mr-2 h-5 w-5 text-emerald-400" />
                Browse Catalog
              </button>

              <button
                onClick={onRequestSourcing}
                className="flex items-center justify-center px-6 py-4 bg-transparent hover:bg-zinc-900 text-zinc-300 hover:text-white font-semibold rounded-xl border border-dashed border-zinc-700 hover:border-zinc-500 transition-all text-base cursor-pointer"
              >
                <HelpCircle className="mr-2 h-5 w-5 text-amber-400" />
                Request Livestock Sourcing
              </button>
            </motion.div>

          </div>

        </div>


      </div>

    </div>
  );
}
