import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  ArrowLeft, 
  Search, 
  Download, 
  FileText, 
  ExternalLink, 
  CheckCircle, 
  DollarSign, 
  Scale, 
  Calendar, 
  Activity,
  ChevronRight,
  ShieldAlert,
  Info
} from 'lucide-react';

interface MarketRatesProps {
  initialTab?: 'livestock' | 'feed';
  onBack: () => void;
}

export default function MarketRates({ initialTab = 'livestock', onBack }: MarketRatesProps) {
  const [activeTab, setActiveTab] = useState<'livestock' | 'feed'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync state with localstorage to reflect admin changes in real time
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
    // Poll to catch internal changes in same-tab navigation
    const interval = setInterval(syncWithStorage, 2000);

    return () => {
      window.removeEventListener('storage', syncWithStorage);
      clearInterval(interval);
    };
  }, []);

  // Filter based on search query
  const filteredLivestock = livestockRates.filter((rate: any) =>
    rate.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFeed = feedRates.filter((rate: any) =>
    rate.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sample official documents for users
  const relevantDocuments = [
    {
      title: 'CowPlugNG Livestock Transaction & Sponsorship Agreement',
      description: 'Standard terms governing livestock acquisition, veterinary insurance, and payout schedules.',
      type: 'PDF',
      size: '2.4 MB',
      updated: 'June 2026'
    },
    {
      title: 'Biometric Feed Intake & Tracking Guideline',
      description: 'Specifications on computerized precision feeding formulas and daily gain monitoring.',
      type: 'DOCX',
      size: '1.8 MB',
      updated: 'May 2026'
    },
    {
      title: 'RFID IoT Ear Tag Allocation Standard',
      description: 'Official procedure document for tracking cattle & ram lineages on the blockchain ledger.',
      type: 'PDF',
      size: '1.2 MB',
      updated: 'April 2026'
    },
    {
      title: 'National Agricultural Insurance Corporation Policy Cover',
      description: 'Comprehensive general risk, disease prevention, and mortality compensation terms.',
      type: 'PDF',
      size: '3.1 MB',
      updated: 'January 2026'
    }
  ];

  const handleDownloadDoc = (title: string) => {
    alert(`Downloading ${title}...\nThis document is generated and secured by CowPlugNG.`);
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Back navigation & Page title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <button 
            onClick={onBack}
            className="inline-flex items-center text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            Back to Home Page
          </button>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-zinc-950 dark:text-white leading-none">
            Live Market <span className="text-emerald-600 dark:text-emerald-400">Rates Board</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Real-time visual trading statistics, certified retail market indexes, and active contract documentation.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-emerald-550/10 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3.5 py-2 rounded-2xl text-xs font-mono font-bold animate-pulse">
          <span className="h-2 w-2 rounded-full bg-emerald-500 mr-2"></span>
          REAL-TIME INTERNEXUS TICKER SYNCHRONIZATION
        </div>
      </div>

      {/* Tabs and Search Bar control panel */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-zinc-50 dark:bg-zinc-900/60 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800">
        <div className="flex bg-zinc-200/60 dark:bg-zinc-950/80 p-1 rounded-2xl max-w-sm">
          <button
            onClick={() => {
              setActiveTab('livestock');
              setSearchQuery('');
            }}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'livestock' 
                ? 'bg-emerald-600 text-white shadow' 
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            🐂 Livestock Rates
          </button>
          <button
            onClick={() => {
              setActiveTab('feed');
              setSearchQuery('');
            }}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'feed' 
                ? 'bg-emerald-600 text-white shadow' 
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            🌾 Feed Rates
          </button>
        </div>

        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input 
            type="text"
            placeholder={activeTab === 'livestock' ? "Search livestock breeds (e.g., Red Sokoto)..." : "Search feed categories (e.g., Silage)..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Tables layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Rates Tables */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-zinc-150 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-900/50 flex justify-between items-center">
              <div>
                <h3 className="font-display font-black text-sm text-zinc-900 dark:text-white">
                  {activeTab === 'livestock' ? '🐂 Livestock Spot Prices & Indexes' : '🌾 Raw Feed Concentrates & Baler Rates'}
                </h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">Spot pricing indexed across major Nigerian agricultural exchange hubs.</p>
              </div>
              <span className="text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-2.5 py-1 rounded-full border border-zinc-200 dark:border-zinc-700">
                NIGERIAN NAIRA (₦)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-100/50 dark:bg-zinc-950/40 border-b border-zinc-150 dark:border-zinc-850 text-[10px] uppercase tracking-wider font-mono font-extrabold text-zinc-400">
                    <th className="py-3 px-6">Asset Class</th>
                    <th className="py-3 px-6 text-right">Spot Price</th>
                    <th className="py-3 px-6 text-right">24h Volatility</th>
                    <th className="py-3 px-6 text-center">Liquidity Index</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-150 dark:divide-zinc-850 text-xs">
                  {activeTab === 'livestock' ? (
                    filteredLivestock.length > 0 ? (
                      filteredLivestock.map((rate: any, i: number) => {
                        const numericPrice = parseInt(rate.price.replace(/[^\d]/g, '')) || 100000;
                        const lowPrice = Math.round(numericPrice * 0.97).toLocaleString();
                        const highPrice = Math.round(numericPrice * 1.04).toLocaleString();
                        return (
                          <tr key={rate.id || i} className="hover:bg-zinc-50 dark:hover:bg-zinc-950/50 transition-colors">
                            <td className="py-4 px-6">
                              <div className="flex items-center space-x-3">
                                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                                  {rate.name[0]}
                                </div>
                                <div>
                                  <span className="font-bold text-zinc-900 dark:text-white block">{rate.name}</span>
                                  <span className="text-[10px] text-zinc-400 font-mono">ID: {rate.id || `L-00${i}`} • Daily Low: ₦{lowPrice} • Daily High: ₦{highPrice}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <span className="font-mono font-extrabold text-zinc-900 dark:text-white">{rate.price}</span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <span className={`font-mono font-bold px-2 py-0.5 rounded-md ${
                                rate.change.startsWith('+') 
                                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                                  : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                              }`}>
                                {rate.change}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-center">
                              <span className="text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-2 py-1 rounded-full">
                                HIGH LIQUIDITY
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-zinc-400">
                          <ShieldAlert className="h-8 w-8 mx-auto mb-2 text-zinc-500" />
                          No matching livestock spot rates found.
                        </td>
                      </tr>
                    )
                  ) : (
                    filteredFeed.length > 0 ? (
                      filteredFeed.map((rate: any, i: number) => {
                        const numericPrice = parseInt(rate.price.replace(/[^\d]/g, '')) || 10000;
                        const lowPrice = Math.round(numericPrice * 0.98).toLocaleString();
                        const highPrice = Math.round(numericPrice * 1.02).toLocaleString();
                        return (
                          <tr key={rate.id || i} className="hover:bg-zinc-50 dark:hover:bg-zinc-950/50 transition-colors">
                            <td className="py-4 px-6">
                              <div className="flex items-center space-x-3">
                                <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                                  {rate.name[0]}
                                </div>
                                <div>
                                  <span className="font-bold text-zinc-900 dark:text-white block">{rate.name}</span>
                                  <span className="text-[10px] text-zinc-400 font-mono">ID: {rate.id || `F-00${i}`} • Daily Low: ₦{lowPrice} • Daily High: ₦{highPrice}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <span className="font-mono font-extrabold text-zinc-900 dark:text-white">{rate.price}</span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <span className={`font-mono font-bold px-2 py-0.5 rounded-md ${
                                rate.change.startsWith('+') 
                                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                                  : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                              }`}>
                                {rate.change}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-center">
                              <span className="text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-2 py-1 rounded-full">
                                FEED GRADE A
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-zinc-400">
                          <ShieldAlert className="h-8 w-8 mx-auto mb-2 text-zinc-500" />
                          No matching feed spot rates found.
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-zinc-150 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-900/50 text-[11px] text-zinc-400 flex items-center gap-2">
              <Info className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
              <span>Prices listed are spot rates and can shift slightly due to supply, seasonal harvest trends, or custom shipping locations.</span>
            </div>
          </div>

          {/* Quick FAQ / Info block for visitors */}
          <div className="bg-emerald-600/5 dark:bg-emerald-500/5 p-6 rounded-3xl border border-emerald-500/10 space-y-4">
            <h4 className="font-display font-bold text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-mono">📊 Analytical Summary</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-zinc-800 dark:text-zinc-200 block">How are these rates calculated?</span>
                <p className="text-zinc-500 leading-relaxed text-[11px]">We aggregate real daily sales reports from our network of northern livestock breeders, regional feed mills, and digital transactions to generate a weighted retail spot pricing index.</p>
              </div>
              <div className="space-y-1">
                <span className="font-bold text-zinc-800 dark:text-zinc-200 block">Can I lock in these prices?</span>
                <p className="text-zinc-500 leading-relaxed text-[11px]">Yes! Adding animals or feed items to your cart locks the current price index for 45 minutes, ensuring immunity from intraday market price swings.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Documents & Easy Access */}
        <div className="space-y-6">
          <div className="bg-zinc-950 dark:bg-black text-white p-6 rounded-3xl border border-zinc-800 shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full filter blur-2xl pointer-events-none"></div>
            
            <div>
              <span className="text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase">
                Contractual Resources
              </span>
              <h3 className="font-display font-black text-lg text-white mt-3">Legal & Standardized Documents</h3>
              <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                Download verified legal templates, biosafety procedures, and investment compliance documents.
              </p>
            </div>

            <div className="space-y-3">
              {relevantDocuments.map((doc, i) => (
                <div key={i} className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-2 hover:border-zinc-700 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span className="font-bold text-xs text-zinc-200 line-clamp-1">{doc.title}</span>
                    </div>
                    <span className="text-[9px] font-mono font-bold bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400 uppercase">
                      {doc.type}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-relaxed">{doc.description}</p>
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono border-t border-zinc-800/60 pt-2 mt-1">
                    <span>Size: {doc.size} • {doc.updated}</span>
                    <button 
                      onClick={() => handleDownloadDoc(doc.title)}
                      className="inline-flex items-center text-[10px] font-bold text-emerald-400 hover:text-emerald-300 cursor-pointer"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Get Doc
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/10 rounded-2xl text-[10px] text-emerald-400 leading-relaxed flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>All downloadable forms comply fully with the National Agricultural Development Authority (NADA) codes of 2026.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
