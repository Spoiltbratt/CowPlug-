import React, { useState, useEffect } from 'react';
import { 
  Sprout, Wheat, Droplets, TrendingUp, ShieldCheck, ChevronDown, ChevronUp, Star, Circle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Global Farm Management Fee (can be globally customized)
const GLOBAL_FARM_MGMT_FEE = 15000;

interface PackageConfig {
  name: string;
  shortDesc: string;
  feedCost: number;
  popular?: boolean;
  includes: { text: string; iconType: 'grazing' | 'feed' | 'water' | 'weight' | 'mgmt' | 'star' }[];
}

interface AnimalPricingConfig {
  displayName: string;
  icon: string;
  packages: PackageConfig[];
}

// Configurable pricing system - new animals or feed costs can be updated independently here
const PRICING_CONFIGS: Record<string, AnimalPricingConfig> = {
  cow: {
    displayName: 'Cow',
    icon: '🐄',
    packages: [
      {
        name: 'Pasture Only',
        shortDesc: 'Daily grazing, clean water, and professional farm management.',
        feedCost: 0,
        includes: [
          { text: 'Daily grazing', iconType: 'grazing' },
          { text: 'Clean water', iconType: 'water' },
          { text: 'Farm management', iconType: 'mgmt' },
          { text: 'Basic health monitoring', iconType: 'weight' }
        ]
      },
      {
        name: 'Supplement Package',
        shortDesc: 'Balanced nutrition with daily grazing and evening supplementary feeding.',
        feedCost: 15750,
        popular: true,
        includes: [
          { text: 'Daily grazing', iconType: 'grazing' },
          { text: 'Clean water', iconType: 'water' },
          { text: 'Evening supplement feed (Soybean Chaff, Beans Chaff, Dusa & PKC)', iconType: 'feed' },
          { text: 'Mineral supplementation', iconType: 'feed' },
          { text: 'Farm management', iconType: 'mgmt' },
          { text: 'Basic health monitoring', iconType: 'weight' }
        ]
      },
      {
        name: 'Premium Fattening Package',
        shortDesc: 'Accelerated growth with premium feeding and close weight monitoring.',
        feedCost: 20750,
        includes: [
          { text: 'Everything in the Supplement Package', iconType: 'star' },
          { text: 'Premium fattening ration', iconType: 'feed' },
          { text: 'Enhanced mineral supplementation', iconType: 'feed' },
          { text: 'Close weight monitoring', iconType: 'weight' },
          { text: 'Farm management', iconType: 'mgmt' }
        ]
      }
    ]
  },
  ram: {
    displayName: 'Ram',
    icon: '🐏',
    packages: [
      {
        name: 'Pasture Only',
        shortDesc: 'Daily grazing, clean water, and professional farm management.',
        feedCost: 0,
        includes: [
          { text: 'Daily grazing', iconType: 'grazing' },
          { text: 'Clean water', iconType: 'water' },
          { text: 'Farm management', iconType: 'mgmt' },
          { text: 'Basic health monitoring', iconType: 'weight' }
        ]
      },
      {
        name: 'Supplement Package',
        shortDesc: 'Balanced nutrition with daily grazing and nutritious supplementary silage/fodder.',
        feedCost: 9500,
        popular: true,
        includes: [
          { text: 'Daily grazing', iconType: 'grazing' },
          { text: 'Clean water', iconType: 'water' },
          { text: 'Nutritious supplementary silage & dry hay', iconType: 'feed' },
          { text: 'Essential sheep minerals', iconType: 'feed' },
          { text: 'Farm management', iconType: 'mgmt' },
          { text: 'Basic health monitoring', iconType: 'weight' }
        ]
      },
      {
        name: 'Premium Fattening Package',
        shortDesc: 'High-protein grain finish to achieve accelerated target weight for market windows.',
        feedCost: 14500,
        includes: [
          { text: 'Everything in the Supplement Package', iconType: 'star' },
          { text: 'Premium high-energy barley & corn finishing feed', iconType: 'feed' },
          { text: 'Enhanced mineral supplement', iconType: 'feed' },
          { text: 'Close weight tracking and growth reports', iconType: 'weight' },
          { text: 'Farm management', iconType: 'mgmt' }
        ]
      }
    ]
  },
  goat: {
    displayName: 'Goat',
    icon: '🐐',
    packages: [
      {
        name: 'Pasture Only',
        shortDesc: 'Daily grazing, clean browse forage, and professional farm management.',
        feedCost: 0,
        includes: [
          { text: 'Daily grazing & browse access', iconType: 'grazing' },
          { text: 'Clean drinking water', iconType: 'water' },
          { text: 'Farm management', iconType: 'mgmt' },
          { text: 'Basic health monitoring', iconType: 'weight' }
        ]
      },
      {
        name: 'Supplement Package',
        shortDesc: 'Rotational browse forage supplemented with high-protein evening legume chaff.',
        feedCost: 7250,
        popular: true,
        includes: [
          { text: 'Daily grazing & browse access', iconType: 'grazing' },
          { text: 'Clean drinking water', iconType: 'water' },
          { text: 'Evening legume chaff & dusa concentrates', iconType: 'feed' },
          { text: 'Standard mineral lick block', iconType: 'feed' },
          { text: 'Farm management', iconType: 'mgmt' },
          { text: 'Basic health monitoring', iconType: 'weight' }
        ]
      },
      {
        name: 'Premium Fattening Package',
        shortDesc: 'Accelerated muscle gain with optimized concentrate feeds and close health watch.',
        feedCost: 11250,
        includes: [
          { text: 'Everything in the Supplement Package', iconType: 'star' },
          { text: 'Premium high-protein goat developer pellets', iconType: 'feed' },
          { text: 'Enhanced trace mineral blocks', iconType: 'feed' },
          { text: 'Close weight monitoring & body condition scoring', iconType: 'weight' },
          { text: 'Farm management', iconType: 'mgmt' }
        ]
      }
    ]
  }
};

interface PricingPackagesProps {
  onChoosePackage?: (packageName: string) => void;
  selectedPackage?: string;
  isCompact?: boolean;
  animalType?: string;
}

export default function PricingPackages({ 
  onChoosePackage, 
  selectedPackage,
  isCompact = false,
  animalType
}: PricingPackagesProps) {
  // Load dynamic types and packages from localStorage
  const [animalTypes, setAnimalTypes] = useState<string[]>(['Cow', 'Goat', 'Ram']);
  const [dynamicPackages, setDynamicPackages] = useState<any[]>([]);
  const [allDynamicPackages, setAllDynamicPackages] = useState<any[]>([]);

  useEffect(() => {
    // Read animal types
    const storedTypes = localStorage.getItem('cp_animal_types');
    if (storedTypes) {
      try {
        setAnimalTypes(JSON.parse(storedTypes));
      } catch (e) {}
    }

    // Read pricing packages
    const storedPkgs = localStorage.getItem('cp_pricing_packages');
    if (storedPkgs) {
      try {
        const pkgs = JSON.parse(storedPkgs);
        if (Array.isArray(pkgs)) {
          setAllDynamicPackages(pkgs);
          // Filter to only Active status packages for the customer facing shop
          setDynamicPackages(pkgs.filter(p => p.status === 'Active'));
        }
      } catch (e) {}
    }
  }, []);

  // Extract initial animal type
  const getInitialAnimalType = (): string => {
    if (!animalType) return 'Cow';
    const cleanType = animalType.toLowerCase();
    const found = ['Cow', 'Goat', 'Ram'].concat(animalTypes).find(t => t.toLowerCase() === cleanType);
    return found || 'Cow';
  };

  const [selectedAnimal, setSelectedAnimal] = useState<string>(getInitialAnimalType());
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Synchronize component state with prop updates
  useEffect(() => {
    if (animalType) {
      const cleanType = animalType.toLowerCase();
      const found = animalTypes.find(t => t.toLowerCase() === cleanType);
      if (found) {
        setSelectedAnimal(found);
      } else {
        setSelectedAnimal(animalType.charAt(0).toUpperCase() + animalType.slice(1).toLowerCase());
      }
    }
  }, [animalType, animalTypes]);

  const handleCardToggle = (id: string) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  // Get species icon helper
  const getSpeciesIcon = (specie: string) => {
    const sp = specie.toLowerCase();
    if (sp.includes('cow') || sp.includes('bull')) return '🐄';
    if (sp.includes('goat')) return '🐐';
    if (sp.includes('ram')) return '🐏';
    if (sp.includes('sheep')) return '🐏';
    if (sp.includes('poultry') || sp.includes('chicken')) return '🐔';
    if (sp.includes('camel')) return '🐪';
    if (sp.includes('pig')) return '🐖';
    return '🐾';
  };

  // Render proper icon beside key features
  const getFeatureIcon = (iconType: string) => {
    switch (iconType) {
      case 'grazing':
        return <Sprout className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400 shrink-0" />;
      case 'feed':
        return <Wheat className="h-4.5 w-4.5 text-amber-600 dark:text-amber-500 shrink-0" />;
      case 'water':
        return <Droplets className="h-4.5 w-4.5 text-blue-500 dark:text-blue-400 shrink-0" />;
      case 'weight':
        return <TrendingUp className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-500 shrink-0" />;
      case 'mgmt':
        return <ShieldCheck className="h-4.5 w-4.5 text-amber-500 dark:text-amber-400 shrink-0" />;
      case 'star':
      default:
        return <Star className="h-4.5 w-4.5 text-yellow-500 dark:text-yellow-400 shrink-0" />;
    }
  };

  const selectedTypeLower = selectedAnimal.toLowerCase();
  
  // Try to find packages from the active dynamic list first
  const activeAnimalPackages = dynamicPackages.filter(p => (p.animalType || '').toLowerCase() === selectedTypeLower);
  const totalAnimalPackagesCount = allDynamicPackages.filter(p => (p.animalType || '').toLowerCase() === selectedTypeLower).length;

  let displayPackages: any[] = [];
  let hasNoPackages = false;

  if (totalAnimalPackagesCount > 0) {
    if (activeAnimalPackages.length === 0) {
      hasNoPackages = true;
    } else {
      displayPackages = activeAnimalPackages.map(pkg => ({
        name: pkg.name,
        shortDesc: pkg.description || 'Custom nutrition plan.',
        feedCost: pkg.feedPrice || 0,
        managementFee: pkg.managementFee || 15000,
        popular: pkg.badge?.toLowerCase().includes('popular') || pkg.badge?.toLowerCase().includes('best') || false,
        badge: pkg.badge || 'Premium Program',
        includes: (pkg.features || []).map((f: string) => {
          let iconType: 'grazing' | 'feed' | 'water' | 'weight' | 'mgmt' | 'star' = 'feed';
          const fl = f.toLowerCase();
          if (fl.includes('grazing') || fl.includes('pasture')) iconType = 'grazing';
          else if (fl.includes('water')) iconType = 'water';
          else if (fl.includes('weight') || fl.includes('growth')) iconType = 'weight';
          else if (fl.includes('management') || fl.includes('veterinary')) iconType = 'mgmt';
          return { text: f, iconType };
        }),
        growthTimeline: pkg.growthTimeline,
        vaccinationSchedule: pkg.vaccinationSchedule,
        rfidRequired: pkg.rfidRequired,
        deliveryFee: pkg.deliveryFee
      }));
    }
  } else {
    // Fallback to static configs
    const staticConfig = PRICING_CONFIGS[selectedTypeLower];
    if (staticConfig && staticConfig.packages && staticConfig.packages.length > 0) {
      displayPackages = staticConfig.packages.map(pkg => ({
        name: pkg.name,
        shortDesc: pkg.shortDesc,
        feedCost: pkg.feedCost,
        managementFee: GLOBAL_FARM_MGMT_FEE,
        popular: pkg.popular || false,
        badge: pkg.popular ? 'Best For Growth' : 'Standard Tier',
        includes: pkg.includes,
        growthTimeline: selectedTypeLower === 'cow' ? '12-18 Months' : '6-9 Months',
        vaccinationSchedule: 'Regular quarterly deworming',
        rfidRequired: true,
        deliveryFee: selectedTypeLower === 'cow' ? 12000 : 5000
      }));
    } else {
      hasNoPackages = true;
    }
  }

  return (
    <div id="pricing-packages-section" className="space-y-8">
      {/* Upper header section when not compact */}
      {!isCompact && (
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/50 border border-slate-200/80 dark:border-emerald-500/10 px-3.5 py-1.5 rounded-full">
            TRANSPARENT FEEDING & BOARDING PLANS
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
            CowPlug Boarding Pricing
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base">
            Choose a diet plan tailored to your livestock's growth targets. No setup fees, complete veterinary cover, and transparent expense breakdowns.
          </p>
        </div>
      )}

      {/* STEP 1: Livestock Selection Cards/Tabs */}
      {!animalType && (
        <div className="max-w-xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/60 shadow-inner">
            {animalTypes.map((type) => {
              const isCurrent = selectedAnimal.toLowerCase() === type.toLowerCase();
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setSelectedAnimal(type);
                    setExpandedCard(null); // Close any expanded breakdown during transitions
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all duration-200 ${
                    isCurrent
                      ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 shadow-sm border border-zinc-200/30 dark:border-zinc-700/40'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <span className="text-sm leading-none">{getSpeciesIcon(type)}</span>
                  <span>{type}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {hasNoPackages ? (
        <div className="bg-amber-500/5 border border-amber-500/20 p-6 rounded-2xl text-center space-y-2 max-w-lg mx-auto">
          <span className="text-2xl block animate-bounce">⚠️</span>
          <p className="text-xs font-bold text-amber-700 dark:text-amber-400 leading-relaxed">
            There are currently no active boarding packages available for this animal. Please contact support or choose home delivery.
          </p>
        </div>
      ) : (
        /* STEP 2: Animal-Specific Packages Display with smooth key transitions */
        <motion.div 
          key={selectedAnimal}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className={`grid grid-cols-1 ${isCompact ? 'md:grid-cols-1 gap-4' : 'lg:grid-cols-3 gap-8'} items-start`}
        >
          {displayPackages.map((pkg, idx) => {
            const totalMonthlyCost = pkg.feedCost + pkg.managementFee;
            
            // Match selected state mapping gracefully
            const isSelected = selectedPackage === pkg.name || 
              (pkg.name === 'Pasture Only' && selectedPackage === 'Pasture Only') ||
              (pkg.name === 'Supplement Package' && selectedPackage === 'Pasture + Supplement Feed') ||
              (pkg.name === 'Premium Fattening Package' && selectedPackage === 'Premium Fattening Feed');


          const cardUniqueId = `${selectedAnimal}-${idx}`;
          const isExpanded = expandedCard === cardUniqueId;

          return (
            <div
              key={cardUniqueId}
              className={`relative bg-white dark:bg-zinc-950 rounded-3xl border transition-all duration-300 overflow-hidden ${
                isSelected 
                  ? 'border-emerald-500 dark:border-emerald-400 ring-2 ring-emerald-500/20 dark:ring-emerald-400/10 shadow-xl'
                  : pkg.popular && !isCompact
                    ? 'border-amber-500/50 dark:border-amber-500/30 shadow-md ring-1 ring-amber-500/10'
                    : 'border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md'
              }`}
            >
              {/* Ribbons / Popular Indicators */}
              {pkg.popular && !isCompact && (
                <div className="absolute top-0 right-0 bg-amber-500 text-white text-[9px] font-black uppercase px-4 py-1.5 rounded-bl-2xl tracking-widest">
                  {pkg.badge || 'Best For Growth'}
                </div>
              )}
              {isSelected && (
                <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-black uppercase px-4 py-1.5 rounded-bl-2xl tracking-widest">
                  Selected
                </div>
              )}

              <div className="p-6 sm:p-8 space-y-6">
                {/* Header */}
                <div className="space-y-1">
                  <span className="text-[9px] font-mono font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">
                    {selectedAnimal} Plan • Package 0{idx + 1}
                  </span>
                  <h3 className="font-display font-extrabold text-xl text-zinc-900 dark:text-white">
                    {pkg.name}
                  </h3>
                </div>

                {/* Pricing Block - Prominent Monthly Price */}
                <div className="flex items-baseline text-zinc-900 dark:text-white">
                  <span className="text-3xl sm:text-4xl font-display font-black tracking-tight">
                    ₦{totalMonthlyCost.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 ml-1">
                    /month
                  </span>
                </div>

                {/* One-Line Description */}
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium min-h-[40px]">
                  {pkg.shortDesc}
                </p>

                {/* View Details Toggle */}
                <button
                  type="button"
                  onClick={() => handleCardToggle(cardUniqueId)}
                  className="w-full flex items-center justify-between text-xs font-extrabold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 py-2.5 border-y border-zinc-100 dark:border-zinc-900 transition-colors"
                >
                  <span>{isExpanded ? 'Hide Details' : 'View Details & Cost Breakdown'}</span>
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                {/* Expandable Content Panel */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden space-y-5 pt-2"
                    >
                      {/* Cost Breakdown */}
                      <div className="bg-zinc-50 dark:bg-zinc-900/40 p-4.5 rounded-2xl border border-zinc-150 dark:border-zinc-900 space-y-3">
                        <strong className="text-[10px] font-mono font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block border-b border-zinc-150 dark:border-zinc-900 pb-2">
                          Pricing Breakdown
                        </strong>
                        <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                          <div className="flex justify-between">
                            <span>Feed Cost:</span>
                            <span className="font-mono font-bold text-zinc-900 dark:text-white">₦{pkg.feedCost.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Farm Management Fee:</span>
                            <span className="font-mono font-bold text-zinc-900 dark:text-white">₦{pkg.managementFee.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-black">
                            <span>Total Monthly Cost:</span>
                            <span className="font-mono text-emerald-600 dark:text-emerald-400">₦{totalMonthlyCost.toLocaleString()}/month</span>
                          </div>
                        </div>
                      </div>

                      {/* Species Specific Parameters */}
                      <div className="bg-emerald-50/50 dark:bg-emerald-950/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 space-y-3">
                        <strong className="text-[10px] font-mono font-extrabold text-emerald-800 dark:text-emerald-400 uppercase tracking-widest block border-b border-emerald-100 dark:border-emerald-900/30 pb-2">
                          📋 {selectedAnimal} Parameters
                        </strong>
                        <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                          <div>
                            <span className="text-[8px] font-bold text-zinc-400 uppercase block">Growth Timeline</span>
                            <span className="text-zinc-900 dark:text-zinc-200">{pkg.growthTimeline || '6-12 Months'}</span>
                          </div>
                          <div>
                            <span className="text-[8px] font-bold text-zinc-400 uppercase block">Vaccination</span>
                            <span className="text-zinc-900 dark:text-zinc-200">{pkg.vaccinationSchedule || 'Standard quarterly'}</span>
                          </div>
                          <div>
                            <span className="text-[8px] font-bold text-zinc-400 uppercase block">RFID Tag Required</span>
                            <span className="text-zinc-900 dark:text-zinc-200">{pkg.rfidRequired ? 'Yes (Mandatory)' : 'No (Optional)'}</span>
                          </div>
                          <div>
                            <span className="text-[8px] font-bold text-zinc-400 uppercase block">Transit / Delivery Fee</span>
                            <span className="text-zinc-900 dark:text-zinc-200 font-mono">₦{(pkg.deliveryFee || 0).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Package Features List */}
                      <div className="space-y-3">
                        <strong className="text-[10px] font-mono font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">
                          Package Includes
                        </strong>
                        <ul className="space-y-3">
                          {pkg.includes.map((inc: any, i: number) => (
                            <li key={i} className="flex items-start text-xs text-zinc-700 dark:text-zinc-300">
                              <span className="mt-0.5 mr-2.5 shrink-0">{getFeatureIcon(inc.iconType)}</span>
                              <span className="leading-normal font-medium">{inc.text}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Choose Package Call to Action Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (onChoosePackage) {
                      // Normalize choice to match upstream registration or checkout states
                      let chosenName = pkg.name;
                      if (pkg.name === 'Supplement Package') {
                        chosenName = 'Pasture + Supplement Feed';
                      } else if (pkg.name === 'Premium Fattening Package') {
                        chosenName = 'Premium Fattening Feed';
                      }
                      onChoosePackage(chosenName);
                    }
                  }}
                  className={`w-full py-3.5 px-4 text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center ${
                    isSelected
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/10'
                      : 'bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700'
                  }`}
                >
                  {isSelected ? 'Currently Selected' : 'Choose Package'}
                </button>

              </div>
            </div>
          );
        })}
      </motion.div>
      )}
    </div>
  );
}
