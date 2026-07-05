import React, { useState, useEffect } from 'react';
import { 
  X, Check, Plus, Trash2, ArrowUp, ArrowDown, HelpCircle, 
  Settings, Sparkles, Wheat, Activity, Shield, Coins, Percent, Clock, FileText, Image as ImageIcon, RotateCcw, Sliders
} from 'lucide-react';
import { FarmerLivestock } from '../types';

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

  features: string[];
  disabledFeatures?: string[];
  eligibility?: string[];
  
  billingCycle?: 'monthly' | 'weekly' | 'daily' | 'one-time';
  latePaymentFee?: number;
  gracePeriodDays?: number;
  autoRenewal?: boolean;
  autoSuspension?: boolean;

  availability?: 'public' | 'investors' | 'buyers' | 'premium' | 'invite';

  coverImage?: string;
  thumbnailImage?: string;
  icon?: string;

  documents?: {
    terms?: string;
    agreement?: string;
    brochure?: string;
  };

  discounts?: {
    promoCode?: string;
    percentDiscount?: number;
    fixedDiscount?: number;
    seasonalOffer?: string;
    bulkDiscountPercent?: number;
    bulkThreshold?: number;
  };

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

interface PricePackageFormOverlayProps {
  currentUser: any;
  editingPackage: PricePackage | null;
  pricingPackages: PricePackage[];
  setPricingPackages: React.Dispatch<React.SetStateAction<PricePackage[]>>;
  farmerLivestock: FarmerLivestock[];
  globalPackageSettings: any;
  onClose: () => void;
  logAdminAction: (actionName: string, details: string, status: 'success' | 'warning' | 'danger' | 'info') => void;
  selectedAnimalTab?: string;
  animalTypes?: string[];
}

export function PricePackageFormOverlay({
  currentUser,
  editingPackage,
  pricingPackages,
  setPricingPackages,
  farmerLivestock,
  globalPackageSettings,
  onClose,
  logAdminAction,
  selectedAnimalTab,
  animalTypes
}: PricePackageFormOverlayProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'costs' | 'features' | 'billing' | 'assets' | 'discounts'>('general');

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('emerald');
  const [badge, setBadge] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive' | 'Draft' | 'Archived'>('Active');
  const [animalType, setAnimalType] = useState<string>('Cow');
  const [vaccinationSchedule, setVaccinationSchedule] = useState<string>('Monthly');
  const [rfidRequired, setRfidRequired] = useState<boolean>(true);
  const [growthTimeline, setGrowthTimeline] = useState<string>('12 months');
  const [deliveryFee, setDeliveryFee] = useState<number>(5000);
  const [availability, setAvailability] = useState<'public' | 'investors' | 'buyers' | 'premium' | 'invite'>('public');

  // Costs & Fees
  const [feedPrice, setFeedPrice] = useState(0);
  const [dailyFeedCost, setDailyFeedCost] = useState(0);
  const [managementFee, setManagementFee] = useState(15000);
  const [boardingFee, setBoardingFee] = useState(10000);
  const [herdsmanFee, setHerdsmanFee] = useState(2000);
  const [veterinaryFee, setVeterinaryFee] = useState(1500);
  const [vaccinationCost, setVaccinationCost] = useState(1000);
  const [insuranceFee, setInsuranceFee] = useState(500);
  const [rfidFee, setRfidFee] = useState(500);
  const [transportationFee, setTransportationFee] = useState(0);
  const [profitMarginPercent, setProfitMarginPercent] = useState(12);
  const [taxPercent, setTaxPercent] = useState(7.5);

  // Species Overrides
  const [cowFeedPrice, setCowFeedPrice] = useState<number | undefined>(undefined);
  const [cowManagementFee, setCowManagementFee] = useState<number | undefined>(undefined);
  const [goatFeedPrice, setGoatFeedPrice] = useState<number | undefined>(undefined);
  const [goatManagementFee, setGoatManagementFee] = useState<number | undefined>(undefined);
  const [ramFeedPrice, setRamFeedPrice] = useState<number | undefined>(undefined);
  const [ramManagementFee, setRamManagementFee] = useState<number | undefined>(undefined);

  // Features List Manager
  const [featuresList, setFeaturesList] = useState<string[]>([]);
  const [disabledFeatures, setDisabledFeatures] = useState<string[]>([]);
  const [newFeatureText, setNewFeatureText] = useState('');

  // Eligibility
  const [eligibility, setEligibility] = useState<string[]>(['Cow', 'Goat', 'Ram']);

  // Billing Rules
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'weekly' | 'daily' | 'one-time'>('monthly');
  const [latePaymentFee, setLatePaymentFee] = useState(2500);
  const [gracePeriodDays, setGracePeriodDays] = useState(5);
  const [autoRenewal, setAutoRenewal] = useState(true);
  const [autoSuspension, setAutoSuspension] = useState(true);

  // Assets
  const [coverImage, setCoverImage] = useState('');
  const [thumbnailImage, setThumbnailImage] = useState('');
  const [iconName, setIconName] = useState('Wheat');
  const [termsDoc, setTermsDoc] = useState('');
  const [agreementDoc, setAgreementDoc] = useState('');
  const [brochureDoc, setBrochureDoc] = useState('');

  // Discounts
  const [promoCode, setPromoCode] = useState('');
  const [percentDiscount, setPercentDiscount] = useState(0);
  const [fixedDiscount, setFixedDiscount] = useState(0);
  const [seasonalOffer, setSeasonalOffer] = useState('');
  const [bulkDiscountPercent, setBulkDiscountPercent] = useState(5);
  const [bulkThreshold, setBulkThreshold] = useState(10);

  // Simulated Pricing inputs
  const [simCowCount, setSimCowCount] = useState(3);
  const [simGoatCount, setSimGoatCount] = useState(5);
  const [simRamCount, setSimRamCount] = useState(2);

  // Save State notification
  const [isDraftSaving, setIsDraftSaving] = useState(false);

  // Initialize form with existing package data if editing
  useEffect(() => {
    if (editingPackage) {
      setName(editingPackage.name);
      setDescription(editingPackage.description || '');
      setColor(editingPackage.color || 'emerald');
      setBadge(editingPackage.badge || '');
      setStatus(editingPackage.status || 'Active');
      setAnimalType(editingPackage.animalType || selectedAnimalTab || 'Cow');
      setVaccinationSchedule(editingPackage.vaccinationSchedule || 'Monthly');
      setRfidRequired(editingPackage.rfidRequired ?? true);
      setGrowthTimeline(editingPackage.growthTimeline || '12 months');
      setDeliveryFee(editingPackage.deliveryFee ?? editingPackage.transportationFee ?? 5000);
      setAvailability(editingPackage.availability || 'public');

      setFeedPrice(editingPackage.feedPrice);
      setDailyFeedCost(editingPackage.dailyFeedCost || 0);
      setManagementFee(editingPackage.managementFee);
      setBoardingFee(editingPackage.boardingFee || 10000);
      setHerdsmanFee(editingPackage.herdsmanFee || 2000);
      setVeterinaryFee(editingPackage.veterinaryFee || 1500);
      setVaccinationCost(editingPackage.vaccinationCost || 1000);
      setInsuranceFee(editingPackage.insuranceFee || 500);
      setRfidFee(editingPackage.rfidFee || 500);
      setTransportationFee(editingPackage.transportationFee || 0);
      setProfitMarginPercent(editingPackage.profitMarginPercent ?? 12);
      setTaxPercent(editingPackage.taxPercent ?? 7.5);

      setCowFeedPrice(editingPackage.cowFeedPrice);
      setCowManagementFee(editingPackage.cowManagementFee);
      setGoatFeedPrice(editingPackage.goatFeedPrice);
      setGoatManagementFee(editingPackage.goatManagementFee);
      setRamFeedPrice(editingPackage.ramFeedPrice);
      setRamManagementFee(editingPackage.ramManagementFee);

      setFeaturesList(editingPackage.features);
      setDisabledFeatures(editingPackage.disabledFeatures || []);
      setEligibility(editingPackage.eligibility || [editingPackage.animalType || selectedAnimalTab || 'Cow']);

      setBillingCycle(editingPackage.billingCycle || 'monthly');
      setLatePaymentFee(editingPackage.latePaymentFee || 2500);
      setGracePeriodDays(editingPackage.gracePeriodDays || 5);
      setAutoRenewal(editingPackage.autoRenewal ?? true);
      setAutoSuspension(editingPackage.autoSuspension ?? true);

      setCoverImage(editingPackage.coverImage || '');
      setThumbnailImage(editingPackage.thumbnailImage || '');
      setIconName(editingPackage.icon || 'Wheat');
      setTermsDoc(editingPackage.documents?.terms || '');
      setAgreementDoc(editingPackage.documents?.agreement || '');
      setBrochureDoc(editingPackage.documents?.brochure || '');

      setPromoCode(editingPackage.discounts?.promoCode || '');
      setPercentDiscount(editingPackage.discounts?.percentDiscount || 0);
      setFixedDiscount(editingPackage.discounts?.fixedDiscount || 0);
      setSeasonalOffer(editingPackage.discounts?.seasonalOffer || '');
      setBulkDiscountPercent(editingPackage.discounts?.bulkDiscountPercent ?? 5);
      setBulkThreshold(editingPackage.discounts?.bulkThreshold ?? 10);
    } else {
      setName('');
      setDescription('');
      setColor('emerald');
      setBadge('');
      setStatus('Active');
      setAnimalType(selectedAnimalTab || 'Cow');
      setVaccinationSchedule('Monthly');
      setRfidRequired(true);
      setGrowthTimeline('12 months');
      setDeliveryFee(5000);
      setAvailability('public');
      setFeedPrice(12000);
      setDailyFeedCost(400);
      setManagementFee(15000);
      setBoardingFee(10000);
      setHerdsmanFee(2000);
      setVeterinaryFee(1500);
      setVaccinationCost(1000);
      setInsuranceFee(500);
      setRfidFee(500);
      setTransportationFee(5000);
      setEligibility([selectedAnimalTab || 'Cow']);
      
      // Default features
      setFeaturesList([
        'Scheduled mineral block supplementation',
        'Digital veterinary history logging & reporting',
        'Structured rotational grazing pasture rotation',
        'Basic intake wellness quarantine screening'
      ]);
    }
  }, [editingPackage, selectedAnimalTab]);

  // Simulate draft auto-save
  useEffect(() => {
    if (!name) return;
    setIsDraftSaving(true);
    const timer = setTimeout(() => {
      setIsDraftSaving(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [
    name, description, color, badge, status, availability, feedPrice, dailyFeedCost, managementFee,
    boardingFee, herdsmanFee, veterinaryFee, vaccinationCost, insuranceFee, rfidFee, transportationFee,
    profitMarginPercent, taxPercent, cowFeedPrice, cowManagementFee, goatFeedPrice, goatManagementFee,
    ramFeedPrice, ramManagementFee, featuresList, disabledFeatures, eligibility, billingCycle,
    latePaymentFee, gracePeriodDays, autoRenewal, autoSuspension, coverImage, thumbnailImage,
    iconName, termsDoc, agreementDoc, brochureDoc, promoCode, percentDiscount, fixedDiscount,
    seasonalOffer, bulkDiscountPercent, bulkThreshold
  ]);

  // Restore historical state helper
  const handleRestoreVersion = (version: PackageVersion) => {
    if (!version || !version.state) return;
    const s = version.state;
    setName(s.name || '');
    setDescription(s.description || '');
    setColor(s.color || 'emerald');
    setBadge(s.badge || '');
    setStatus(s.status === 'Archived' ? 'Deactivated' : (s.status || 'Active'));
    setAvailability(s.availability || 'public');
    setFeedPrice(s.feedPrice ?? 0);
    setDailyFeedCost(s.dailyFeedCost ?? 0);
    setManagementFee(s.managementFee ?? 15000);
    setFeaturesList(s.features || []);
    alert(`Restored fields back to snapshot version (${version.id}) state successfully!`);
  };

  // Features Manager handlers
  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return;
    if (featuresList.includes(newFeatureText.trim())) return;
    setFeaturesList([...featuresList, newFeatureText.trim()]);
    setNewFeatureText('');
  };

  const handleRemoveFeature = (feat: string) => {
    setFeaturesList(featuresList.filter(f => f !== feat));
    setDisabledFeatures(disabledFeatures.filter(f => f !== feat));
  };

  const toggleFeatureActive = (feat: string) => {
    if (disabledFeatures.includes(feat)) {
      setDisabledFeatures(disabledFeatures.filter(f => f !== feat));
    } else {
      setDisabledFeatures([...disabledFeatures, feat]);
    }
  };

  const moveFeature = (index: number, direction: 'up' | 'down') => {
    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= featuresList.length) return;
    const updated = [...featuresList];
    const temp = updated[index];
    updated[index] = updated[nextIndex];
    updated[nextIndex] = temp;
    setFeaturesList(updated);
  };

  // Target Animal selection toggle
  const toggleEligibility = (specie: string) => {
    if (eligibility.includes(specie)) {
      setEligibility(eligibility.filter(s => s !== specie));
    } else {
      setEligibility([...eligibility, specie]);
    }
  };

  // Pricing simulator calculations
  const simTotalAnimals = simCowCount + simGoatCount + simRamCount;
  
  // Sourced prices with overrides
  const effectiveCowFeed = cowFeedPrice !== undefined ? cowFeedPrice : feedPrice;
  const effectiveCowMgmt = cowManagementFee !== undefined ? cowManagementFee : managementFee;
  const effectiveGoatFeed = goatFeedPrice !== undefined ? goatFeedPrice : feedPrice;
  const effectiveGoatMgmt = goatManagementFee !== undefined ? goatManagementFee : managementFee;
  const effectiveRamFeed = ramFeedPrice !== undefined ? ramFeedPrice : feedPrice;
  const effectiveRamMgmt = ramManagementFee !== undefined ? ramManagementFee : managementFee;

  // Monthly totals
  const simCowFeedTotal = simCowCount * effectiveCowFeed;
  const simCowMgmtTotal = simCowCount * effectiveCowMgmt;
  const simGoatFeedTotal = simGoatCount * effectiveGoatFeed;
  const simGoatMgmtTotal = simGoatCount * effectiveGoatMgmt;
  const simRamFeedTotal = simRamCount * effectiveRamFeed;
  const simRamMgmtTotal = simRamCount * effectiveRamMgmt;

  const simFeedsMonthly = simCowFeedTotal + simGoatFeedTotal + simRamFeedTotal;
  const simMgmtMonthly = simCowMgmtTotal + simGoatMgmtTotal + simRamMgmtTotal;

  // Additional system costs
  const baseAddOnCost = herdsmanFee + veterinaryFee + vaccinationCost + insuranceFee + rfidFee + transportationFee;
  const simAddOnsMonthly = simTotalAnimals * baseAddOnCost;

  const simSubtotalMonthly = simFeedsMonthly + simMgmtMonthly + simAddOnsMonthly;

  // Discounts
  let simDiscountsTotal = 0;
  if (simTotalAnimals >= bulkThreshold) {
    simDiscountsTotal += (simSubtotalMonthly * (bulkDiscountPercent / 100));
  }
  if (promoCode && (percentDiscount > 0 || fixedDiscount > 0)) {
    simDiscountsTotal += fixedDiscount + (simSubtotalMonthly * (percentDiscount / 100));
  }

  const simPreTaxTotal = Math.max(0, simSubtotalMonthly - simDiscountsTotal);
  const simTaxTotal = simPreTaxTotal * (taxPercent / 100);
  const simFinalTotal = simPreTaxTotal + simTaxTotal;

  // Projected Margin
  const simProjectedProfit = simFinalTotal * (profitMarginPercent / 100);

  // Submit Handler
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Package Name is required.');
      return;
    }

    const id = editingPackage ? editingPackage.id : `pkg-${Date.now()}`;
    const cleanCowFeed = cowFeedPrice === undefined || isNaN(cowFeedPrice) ? undefined : cowFeedPrice;
    const cleanCowMgmt = cowManagementFee === undefined || isNaN(cowManagementFee) ? undefined : cowManagementFee;
    const cleanGoatFeed = goatFeedPrice === undefined || isNaN(goatFeedPrice) ? undefined : goatFeedPrice;
    const cleanGoatMgmt = goatManagementFee === undefined || isNaN(goatManagementFee) ? undefined : goatManagementFee;
    const cleanRamFeed = ramFeedPrice === undefined || isNaN(ramFeedPrice) ? undefined : ramFeedPrice;
    const cleanRamMgmt = ramManagementFee === undefined || isNaN(ramManagementFee) ? undefined : ramManagementFee;

    const currentTimestamp = new Date().toISOString().slice(0, 16).replace('T', ' ');

    const newPackage: PricePackage = {
      id,
      name: name.trim(),
      description: description.trim(),
      color,
      badge: badge.trim(),
      status,
      availability,

      feedPrice: parseFloat(feedPrice as any) || 0,
      dailyFeedCost: parseFloat(dailyFeedCost as any) || 0,
      managementFee: parseFloat(managementFee as any) || 0,
      boardingFee: parseFloat(boardingFee as any) || 0,
      herdsmanFee: parseFloat(herdsmanFee as any) || 0,
      veterinaryFee: parseFloat(veterinaryFee as any) || 0,
      vaccinationCost: parseFloat(vaccinationCost as any) || 0,
      insuranceFee: parseFloat(insuranceFee as any) || 0,
      rfidFee: parseFloat(rfidFee as any) || 0,
      transportationFee: parseFloat(transportationFee as any) || 0,
      profitMarginPercent: parseFloat(profitMarginPercent as any) || 0,
      taxPercent: parseFloat(taxPercent as any) || 0,

      cowFeedPrice: cleanCowFeed,
      cowManagementFee: cleanCowMgmt,
      goatFeedPrice: cleanGoatFeed,
      goatManagementFee: cleanGoatMgmt,
      ramFeedPrice: cleanRamFeed,
      ramManagementFee: cleanRamMgmt,

      animalType,
      vaccinationSchedule,
      rfidRequired,
      growthTimeline,
      deliveryFee: parseFloat(deliveryFee as any) || 0,

      features: featuresList,
      disabledFeatures,
      eligibility: [animalType],

      billingCycle,
      latePaymentFee: parseFloat(latePaymentFee as any) || 0,
      gracePeriodDays: parseInt(gracePeriodDays as any) || 0,
      autoRenewal,
      autoSuspension,

      coverImage: coverImage.trim() || 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=800&q=80',
      thumbnailImage: thumbnailImage.trim() || 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=200&q=80',
      icon: iconName,

      documents: {
        terms: termsDoc.trim() || 'standard_terms.pdf',
        agreement: agreementDoc.trim() || 'boarding_agreement.pdf',
        brochure: brochureDoc.trim() || 'brochure.pdf'
      },

      discounts: {
        promoCode: promoCode.trim() || undefined,
        percentDiscount: parseFloat(percentDiscount as any) || 0,
        fixedDiscount: parseFloat(fixedDiscount as any) || 0,
        seasonalOffer: seasonalOffer.trim() || undefined,
        bulkDiscountPercent: parseFloat(bulkDiscountPercent as any) || 0,
        bulkThreshold: parseInt(bulkThreshold as any) || 0
      },

      lastEdited: currentTimestamp,
      subscribedCount: editingPackage ? editingPackage.subscribedCount : 0
    };

    // Maintain versions list
    const currentVersions = editingPackage?.versions || [];
    const newVersion: PackageVersion = {
      id: `v${currentVersions.length + 1}`,
      editedBy: currentUser.fullName || 'Super Admin',
      action: editingPackage ? 'Updated rule params & pricing matrix' : 'Initial package tier design',
      timestamp: currentTimestamp,
      state: editingPackage ? { ...editingPackage, versions: undefined } : null
    };
    newPackage.versions = [...currentVersions, newVersion];

    if (editingPackage) {
      setPricingPackages(pricingPackages.map(p => p.id === id ? newPackage : p));
      logAdminAction('Package Rules Modified', `Updated advanced rule parameters & cost matrix for "${name}".`, 'success');
    } else {
      setPricingPackages([...pricingPackages, newPackage]);
      logAdminAction('Package Tier Created', `Designed and provisioned custom subscription tier "${name}".`, 'success');
    }

    alert(`Package parameters applied successfully!`);
    onClose();
  };

  // Visual highlights based on color theme
  const themeColors: Record<string, string> = {
    emerald: 'emerald',
    amber: 'amber',
    indigo: 'indigo',
    rose: 'rose',
    purple: 'purple',
    cyan: 'cyan'
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 w-full max-w-6xl h-[90vh] rounded-3xl overflow-hidden shadow-2xl animate-scale-up text-xs flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b bg-white dark:bg-zinc-900 border-zinc-150 dark:border-zinc-800 flex justify-between items-center shrink-0">
          <div>
            <h3 className="font-display font-black text-md text-zinc-950 dark:text-white flex items-center gap-2">
              <Sliders className="h-5 w-5 text-emerald-600" />
              {editingPackage ? `Rules Configurator: ${editingPackage.name}` : 'Create Custom Subscription Tier'}
            </h3>
            <p className="text-[11px] text-zinc-400 mt-0.5">Configure advanced feed costs, eligibility, and custom promo logic with real-time customer preview.</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Pulsing Save status */}
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-zinc-400">
              <span className={`h-2 w-2 rounded-full ${isDraftSaving ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
              <span>{isDraftSaving ? 'Saving draft...' : 'Draft saved in workspace'}</span>
            </div>

            <button 
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors"
            >
              <X className="h-4 w-4 text-zinc-500" />
            </button>
          </div>
        </div>

        {/* Main Body (Split Left Form, Right Preview) */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          
          {/* Left Panel: Form Rules Container */}
          <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-zinc-900 border-r dark:border-zinc-800 flex flex-col">
            
            {/* Custom Tab Bar */}
            <div className="flex border-b pb-2 mb-4 overflow-x-auto gap-2 shrink-0 font-bold whitespace-nowrap">
              <button 
                type="button"
                onClick={() => setActiveTab('general')}
                className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'general' ? 'bg-emerald-600 text-white shadow-xs' : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
              >
                1. General Info
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab('costs')}
                className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'costs' ? 'bg-emerald-600 text-white shadow-xs' : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
              >
                2. Costs & Cohorts
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab('features')}
                className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'features' ? 'bg-emerald-600 text-white shadow-xs' : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
              >
                3. Interactive Features
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab('billing')}
                className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'billing' ? 'bg-emerald-600 text-white shadow-xs' : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
              >
                4. Billing & Compliance
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab('assets')}
                className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'assets' ? 'bg-emerald-600 text-white shadow-xs' : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
              >
                5. Assets & Docs
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab('discounts')}
                className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'discounts' ? 'bg-emerald-600 text-white shadow-xs' : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
              >
                6. Promos & Discounts
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="flex-1 space-y-5">
              
              {/* Tab 1: General Info */}
              {activeTab === 'general' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Package Name</label>
                      <input 
                        type="text" 
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. VIP Fattening Plus"
                        className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800 font-bold text-zinc-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Badge Text (Overlay banner)</label>
                      <input 
                        type="text" 
                        value={badge}
                        onChange={(e) => setBadge(e.target.value)}
                        placeholder="e.g. Best Selling, Recommended"
                        className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800 text-zinc-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Short Description</label>
                    <textarea 
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Write an inviting, brief summary of who this program is suitable for..."
                      className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800 text-zinc-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Primary Animal Category</label>
                      <select 
                        value={animalType}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAnimalType(val);
                          setEligibility([val]);
                        }}
                        className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800 text-zinc-900 dark:text-white font-bold"
                      >
                        {(animalTypes || ['Cow', 'Goat', 'Ram']).map((t) => (
                          <option key={t} value={t}>{t} Packages</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Color Theme accent</label>
                      <select 
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800 text-zinc-900 dark:text-white font-bold"
                      >
                        <option value="emerald">Emerald Green (Rotational grazing)</option>
                        <option value="amber">Amber Gold (Supplement/Grain feed)</option>
                        <option value="indigo">Indigo Blue (Premium finishing)</option>
                        <option value="rose">Rose Red (Quarantine/Treatment)</option>
                        <option value="purple">Royal Purple (VIP / Investor special)</option>
                        <option value="cyan">Cyan Aqua (Hydration / Range pasture)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Publish Status</label>
                      <select 
                        value={status}
                        onChange={(e) => setStatus(e.target.value as any)}
                        className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800 text-zinc-900 dark:text-white font-bold"
                      >
                        <option value="Active">🟢 Active (Visible to Customers)</option>
                        <option value="Inactive">🔴 Inactive (Hidden)</option>
                        <option value="Draft">🟡 Draft (Hidden)</option>
                        <option value="Archived">⚫ Archived (Hidden)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Availability tier</label>
                      <select 
                        value={availability}
                        onChange={(e) => setAvailability(e.target.value as any)}
                        className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800 text-zinc-900 dark:text-white font-bold"
                      >
                        <option value="public">Public (Open to everyone)</option>
                        <option value="investors">Investors Only (Min 5 cows)</option>
                        <option value="buyers">Marketplace Buyers Only</option>
                        <option value="premium">Premium Boarding Members</option>
                        <option value="invite">Invite Only (Requires admin token)</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-900 space-y-2">
                    <span className="block text-[10px] font-black text-zinc-400 uppercase">Target Eligible Livestock Species</span>
                    <div className="flex gap-4">
                      {['Cow', 'Goat', 'Ram', 'Sheep', 'Camel', 'Poultry'].map(specie => {
                        const isChecked = eligibility.includes(specie);
                        return (
                          <label key={specie} className="flex items-center gap-1.5 cursor-pointer font-bold">
                            <input 
                              type="checkbox" 
                              checked={isChecked}
                              onChange={() => toggleEligibility(specie)}
                              className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                            />
                            <span>{specie}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Costs & Cohorts */}
              {activeTab === 'costs' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="bg-emerald-50/50 dark:bg-emerald-950/10 p-3 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 text-[11px] text-emerald-800 dark:text-emerald-400">
                    💡 Base default prices apply to any livestock node that doesn't have an explicit cohort override configured below.
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Base monthly feed Cost (₦)</label>
                      <input 
                        type="number" 
                        value={feedPrice}
                        onChange={(e) => setFeedPrice(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800 font-mono text-zinc-900 dark:text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Base Monthly Management (₦)</label>
                      <input 
                        type="number" 
                        value={managementFee}
                        onChange={(e) => setManagementFee(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800 font-mono text-zinc-900 dark:text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Sourced daily Feed Cost (₦)</label>
                      <input 
                        type="number" 
                        value={dailyFeedCost}
                        onChange={(e) => setDailyFeedCost(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800 font-mono text-zinc-900 dark:text-white font-bold"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-3">
                    <h4 className="font-bold text-[10px] text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                      🐄 Cohort-Specific Overrides
                      <span className="text-[8px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded font-normal">Leave empty to use base fallback values</span>
                    </h4>

                    <div className="space-y-3.5">
                      {/* Cow */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-3 border border-zinc-150 dark:border-zinc-800 rounded-xl">
                        <span className="font-bold text-zinc-800 dark:text-zinc-200">🐄 Cow Overrides</span>
                        <div>
                          <label className="block text-[8px] font-bold text-zinc-400 uppercase mb-0.5">Feed override (₦/mo)</label>
                          <input 
                            type="number" 
                            value={cowFeedPrice ?? ''}
                            placeholder={`Base: ₦${feedPrice}`}
                            onChange={(e) => setCowFeedPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
                            className="w-full px-2 py-1.5 border rounded-lg dark:bg-zinc-950 dark:border-zinc-850 font-mono text-zinc-950 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[8px] font-bold text-zinc-400 uppercase mb-0.5">Mgmt override (₦/mo)</label>
                          <input 
                            type="number" 
                            value={cowManagementFee ?? ''}
                            placeholder={`Base: ₦${managementFee}`}
                            onChange={(e) => setCowManagementFee(e.target.value ? parseFloat(e.target.value) : undefined)}
                            className="w-full px-2 py-1.5 border rounded-lg dark:bg-zinc-950 dark:border-zinc-850 font-mono text-zinc-950 dark:text-white"
                          />
                        </div>
                      </div>

                      {/* Goat */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-3 border border-zinc-150 dark:border-zinc-800 rounded-xl">
                        <span className="font-bold text-zinc-800 dark:text-zinc-200">🐐 Goat Overrides</span>
                        <div>
                          <label className="block text-[8px] font-bold text-zinc-400 uppercase mb-0.5">Feed override (₦/mo)</label>
                          <input 
                            type="number" 
                            value={goatFeedPrice ?? ''}
                            placeholder={`Base: ₦${feedPrice}`}
                            onChange={(e) => setGoatFeedPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
                            className="w-full px-2 py-1.5 border rounded-lg dark:bg-zinc-950 dark:border-zinc-850 font-mono text-zinc-950 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[8px] font-bold text-zinc-400 uppercase mb-0.5">Mgmt override (₦/mo)</label>
                          <input 
                            type="number" 
                            value={goatManagementFee ?? ''}
                            placeholder={`Base: ₦${managementFee}`}
                            onChange={(e) => setGoatManagementFee(e.target.value ? parseFloat(e.target.value) : undefined)}
                            className="w-full px-2 py-1.5 border rounded-lg dark:bg-zinc-950 dark:border-zinc-850 font-mono text-zinc-950 dark:text-white"
                          />
                        </div>
                      </div>

                      {/* Ram */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-3 border border-zinc-150 dark:border-zinc-800 rounded-xl">
                        <span className="font-bold text-zinc-800 dark:text-zinc-200">🐏 Ram Overrides</span>
                        <div>
                          <label className="block text-[8px] font-bold text-zinc-400 uppercase mb-0.5">Feed override (₦/mo)</label>
                          <input 
                            type="number" 
                            value={ramFeedPrice ?? ''}
                            placeholder={`Base: ₦${feedPrice}`}
                            onChange={(e) => setRamFeedPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
                            className="w-full px-2 py-1.5 border rounded-lg dark:bg-zinc-950 dark:border-zinc-850 font-mono text-zinc-950 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[8px] font-bold text-zinc-400 uppercase mb-0.5">Mgmt override (₦/mo)</label>
                          <input 
                            type="number" 
                            value={ramManagementFee ?? ''}
                            placeholder={`Base: ₦${managementFee}`}
                            onChange={(e) => setRamManagementFee(e.target.value ? parseFloat(e.target.value) : undefined)}
                            className="w-full px-2 py-1.5 border rounded-lg dark:bg-zinc-950 dark:border-zinc-850 font-mono text-zinc-950 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-3">
                    <h4 className="font-bold text-[10px] text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                      ⭐ Animal-Specific Service Parameters
                      <span className="text-[8px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded font-normal font-sans">Independent settings for this package</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-900">
                      <div>
                        <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">Growth Timeline</label>
                        <input 
                          type="text" 
                          value={growthTimeline} 
                          onChange={(e) => setGrowthTimeline(e.target.value)} 
                          placeholder="e.g. 12 months, 6 months" 
                          className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 text-zinc-900 dark:text-white text-xs font-semibold" 
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">Vaccination Schedule</label>
                        <select 
                          value={vaccinationSchedule} 
                          onChange={(e) => setVaccinationSchedule(e.target.value)} 
                          className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 text-zinc-900 dark:text-white text-xs font-semibold"
                        >
                          <option value="Weekly">Weekly</option>
                          <option value="Monthly">Monthly</option>
                          <option value="Quarterly">Quarterly</option>
                          <option value="Bi-annually">Bi-annually</option>
                          <option value="Annually">Annually</option>
                          <option value="Custom">Custom / Scheduled</option>
                          <option value="None">None</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">RFID Chip Requirement</label>
                        <select 
                          value={rfidRequired ? 'true' : 'false'} 
                          onChange={(e) => setRfidRequired(e.target.value === 'true')} 
                          className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 text-zinc-900 dark:text-white text-xs font-semibold"
                        >
                          <option value="true">Required (Enabled)</option>
                          <option value="false">Optional (Disabled)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">Delivery / Transit Fee (₦)</label>
                        <input 
                          type="number" 
                          value={deliveryFee} 
                          onChange={(e) => setDeliveryFee(parseFloat(e.target.value) || 0)} 
                          className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 text-zinc-900 dark:text-white text-xs font-semibold font-mono" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-3">
                    <h4 className="font-bold text-[10px] text-zinc-400 uppercase tracking-widest">⚙ Additional System Sourced Add-Ons</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-0.5">Herdsman Patrol (₦)</label>
                        <input type="number" value={herdsmanFee} onChange={(e) => setHerdsmanFee(parseFloat(e.target.value) || 0)} className="w-full px-2 py-1.5 border rounded-lg font-mono dark:bg-zinc-950" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-0.5">Veterinary diagnostics (₦)</label>
                        <input type="number" value={veterinaryFee} onChange={(e) => setVeterinaryFee(parseFloat(e.target.value) || 0)} className="w-full px-2 py-1.5 border rounded-lg font-mono dark:bg-zinc-950" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-0.5">Scheduled Vaccines (₦)</label>
                        <input type="number" value={vaccinationCost} onChange={(e) => setVaccinationCost(parseFloat(e.target.value) || 0)} className="w-full px-2 py-1.5 border rounded-lg font-mono dark:bg-zinc-950" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-0.5">Redundant Insurance (₦)</label>
                        <input type="number" value={insuranceFee} onChange={(e) => setInsuranceFee(parseFloat(e.target.value) || 0)} className="w-full px-2 py-1.5 border rounded-lg font-mono dark:bg-zinc-950" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-0.5">Livestock RFID Chip (₦)</label>
                        <input type="number" value={rfidFee} onChange={(e) => setRfidFee(parseFloat(e.target.value) || 0)} className="w-full px-2 py-1.5 border rounded-lg font-mono dark:bg-zinc-950" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-0.5">Range Transit/Delivery (₦)</label>
                        <input type="number" value={transportationFee} onChange={(e) => setTransportationFee(parseFloat(e.target.value) || 0)} className="w-full px-2 py-1.5 border rounded-lg font-mono dark:bg-zinc-950" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-0.5">Target Profit Margin (%)</label>
                        <input type="number" value={profitMarginPercent} onChange={(e) => setProfitMarginPercent(parseFloat(e.target.value) || 0)} className="w-full px-2 py-1.5 border rounded-lg font-mono dark:bg-zinc-950" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-0.5">Platform VAT Rate (%)</label>
                        <input type="number" value={taxPercent} onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)} className="w-full px-2 py-1.5 border rounded-lg font-mono dark:bg-zinc-950" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Interactive Features */}
              {activeTab === 'features' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border">
                    <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Build Active Nutrition Checklist Rules</span>
                    
                    <div className="flex gap-2 mb-3">
                      <input 
                        type="text"
                        value={newFeatureText}
                        onChange={(e) => setNewFeatureText(e.target.value)}
                        placeholder="Add a custom feature, e.g. Pre-Market Body Mass indexing logs"
                        className="flex-1 px-3 py-2 border rounded-xl dark:bg-zinc-950 text-zinc-900 dark:text-white"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddFeature();
                          }
                        }}
                      />
                      <button 
                        type="button"
                        onClick={handleAddFeature}
                        className="px-4 py-2 bg-zinc-950 hover:bg-zinc-900 text-white font-bold rounded-xl flex items-center gap-1 transition-colors"
                      >
                        <Plus className="h-4 w-4" /> Add Item
                      </button>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {featuresList.map((feat, index) => {
                        const isDisabled = disabledFeatures.includes(feat);
                        return (
                          <div 
                            key={index} 
                            className={`flex items-center justify-between p-2.5 rounded-xl border ${
                              isDisabled 
                                ? 'bg-zinc-100/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 opacity-50' 
                                : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
                            } transition-all`}
                          >
                            <div className="flex items-center gap-2.5">
                              <input 
                                type="checkbox"
                                checked={!isDisabled}
                                onChange={() => toggleFeatureActive(feat)}
                                className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4 cursor-pointer"
                              />
                              <span className={`font-medium ${isDisabled ? 'line-through text-zinc-400' : 'text-zinc-800 dark:text-zinc-200'}`}>
                                {feat}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button 
                                type="button" 
                                disabled={index === 0} 
                                onClick={() => moveFeature(index, 'up')}
                                className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-400 disabled:opacity-30"
                              >
                                <ArrowUp className="h-3.5 w-3.5" />
                              </button>
                              <button 
                                type="button" 
                                disabled={index === featuresList.length - 1} 
                                onClick={() => moveFeature(index, 'down')}
                                className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-400 disabled:opacity-30"
                              >
                                <ArrowDown className="h-3.5 w-3.5" />
                              </button>
                              <button 
                                type="button" 
                                onClick={() => handleRemoveFeature(feat)}
                                className="p-1 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 rounded text-zinc-400"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Billing & Compliance */}
              {activeTab === 'billing' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Billing frequency cycle</label>
                      <select 
                        value={billingCycle}
                        onChange={(e) => setBillingCycle(e.target.value as any)}
                        className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 font-bold text-zinc-900 dark:text-white"
                      >
                        <option value="monthly">Monthly invoicing (Standard)</option>
                        <option value="weekly">Weekly grazing cycles</option>
                        <option value="daily">Daily pay-as-you-go feedlot</option>
                        <option value="one-time">One-time quarantine entry</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Late payment penalty Fee (₦)</label>
                      <input 
                        type="number"
                        value={latePaymentFee}
                        onChange={(e) => setLatePaymentFee(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 font-mono text-zinc-900 dark:text-white font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Grace Period (Days before late penalty)</label>
                      <input 
                        type="number"
                        value={gracePeriodDays}
                        onChange={(e) => setGracePeriodDays(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 font-mono text-zinc-900 dark:text-white font-bold"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-xl bg-zinc-50 dark:bg-zinc-950">
                      <div>
                        <span className="block font-bold text-zinc-900 dark:text-zinc-200">Automatic Renewal</span>
                        <span className="text-[9px] text-zinc-400">Bill automatically at next cycle</span>
                      </div>
                      <input 
                        type="checkbox"
                        checked={autoRenewal}
                        onChange={(e) => setAutoRenewal(e.target.checked)}
                        className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-xl bg-zinc-50 dark:bg-zinc-950">
                      <div>
                        <span className="block font-bold text-zinc-900 dark:text-zinc-200">Force Auto-Suspension</span>
                        <span className="text-[9px] text-zinc-400">Suspend range access if unpaid</span>
                      </div>
                      <input 
                        type="checkbox"
                        checked={autoSuspension}
                        onChange={(e) => setAutoSuspension(e.target.checked)}
                        className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 5: Assets & Docs */}
              {activeTab === 'assets' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Cover Cover Image URL</label>
                      <input 
                        type="url"
                        value={coverImage}
                        onChange={(e) => setCoverImage(e.target.value)}
                        placeholder="e.g. https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?..."
                        className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 text-zinc-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Package Custom Icon</label>
                      <select 
                        value={iconName}
                        onChange={(e) => setIconName(e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 text-zinc-900 dark:text-white font-bold"
                      >
                        <option value="Wheat">🌾 Wheat / Grazing</option>
                        <option value="Activity">📈 Activity / Monitor</option>
                        <option value="Sparkles">✨ Sparkles / VIP</option>
                        <option value="Shield">🛡 Shield / Security</option>
                        <option value="Coins">💰 Coins / Yield</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Simulated Terms PDF name</label>
                      <input type="text" value={termsDoc} onChange={(e) => setTermsDoc(e.target.value)} placeholder="pasture_terms_v1.pdf" className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 font-mono" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Simulated Boarding Agreement PDF</label>
                      <input type="text" value={agreementDoc} onChange={(e) => setAgreementDoc(e.target.value)} placeholder="boarding_agreement.pdf" className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 font-mono" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Simulated Brochure PDF</label>
                      <input type="text" value={brochureDoc} onChange={(e) => setBrochureDoc(e.target.value)} placeholder="brochure.pdf" className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 font-mono" />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 6: Promos & Discounts */}
              {activeTab === 'discounts' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Active Promo Code</label>
                      <input 
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        placeholder="e.g. FREEPASTURE, EID2026"
                        className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 font-mono font-bold text-zinc-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Promo Percentage Discount (%)</label>
                      <input 
                        type="number"
                        value={percentDiscount}
                        onChange={(e) => setPercentDiscount(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Promo Fixed Discount Value (₦)</label>
                      <input 
                        type="number"
                        value={fixedDiscount}
                        onChange={(e) => setFixedDiscount(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Active Seasonal Offer Description</label>
                      <input 
                        type="text"
                        value={seasonalOffer}
                        onChange={(e) => setSeasonalOffer(e.target.value)}
                        placeholder="e.g. Rainy Season free pasture supplement subsidy"
                        className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 text-zinc-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Bulk Discount Threshold count</label>
                      <div className="flex gap-2">
                        <input 
                          type="number"
                          value={bulkThreshold}
                          onChange={(e) => setBulkThreshold(parseInt(e.target.value) || 0)}
                          placeholder="Threshold count"
                          className="w-full px-2 py-1.5 border rounded-lg dark:bg-zinc-950 text-center font-mono"
                        />
                        <input 
                          type="number"
                          value={bulkDiscountPercent}
                          onChange={(e) => setBulkDiscountPercent(parseFloat(e.target.value) || 0)}
                          placeholder="Percent %"
                          className="w-full px-2 py-1.5 border rounded-lg dark:bg-zinc-950 text-center font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl">
                <div>
                  {activeTab !== 'general' ? (
                    <button 
                      type="button" 
                      onClick={() => {
                        const tabs: any[] = ['general', 'costs', 'features', 'billing', 'assets', 'discounts'];
                        const curIdx = tabs.indexOf(activeTab);
                        setActiveTab(tabs[curIdx - 1]);
                      }}
                      className="px-4 py-2 border rounded-xl font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      ◀ Back
                    </button>
                  ) : <div />}
                </div>

                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  
                  {activeTab !== 'discounts' ? (
                    <button 
                      type="button" 
                      onClick={() => {
                        const tabs: any[] = ['general', 'costs', 'features', 'billing', 'assets', 'discounts'];
                        const curIdx = tabs.indexOf(activeTab);
                        setActiveTab(tabs[curIdx + 1]);
                      }}
                      className="px-5 py-2 bg-zinc-950 hover:bg-zinc-900 text-white font-bold rounded-xl shadow-xs"
                    >
                      Next step ▶
                    </button>
                  ) : (
                    <button 
                      type="submit"
                      className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-colors flex items-center gap-1"
                    >
                      <Check className="h-4 w-4" /> Save Nutrition Plan
                    </button>
                  )}
                </div>
              </div>

            </form>

            {/* Historical Version Logs tab inside Form Panel */}
            {editingPackage?.versions && editingPackage.versions.length > 0 && (
              <div className="border-t pt-4 mt-6">
                <span className="block text-[10px] font-bold text-zinc-400 uppercase mb-2 flex items-center gap-1.5">
                  <RotateCcw className="h-3.5 w-3.5 text-zinc-500" />
                  Restore Previous State Version History ({editingPackage.versions.length})
                </span>
                <div className="space-y-1 max-h-24 overflow-y-auto text-[10px] font-mono bg-zinc-50 dark:bg-zinc-950 p-2.5 rounded-xl border">
                  {editingPackage.versions.map((ver) => (
                    <div key={ver.id} className="flex justify-between items-center py-1 border-b dark:border-zinc-850 last:border-0 pb-1 last:pb-0">
                      <div>
                        <strong>{ver.id}</strong> - <span className="text-zinc-500">{ver.action}</span> by {ver.editedBy} ({ver.timestamp})
                      </div>
                      {ver.state && (
                        <button 
                          type="button"
                          onClick={() => handleRestoreVersion(ver)}
                          className="px-2 py-0.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 rounded text-[9px] font-bold"
                        >
                          Restore State
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Live Preview & Pricing Simulator */}
          <div className="w-full lg:w-96 bg-zinc-50 dark:bg-zinc-950 p-6 overflow-y-auto space-y-6 flex flex-col justify-between border-t lg:border-t-0 border-zinc-200 dark:border-zinc-800">
            
            {/* Real-time Customer Live Preview Card */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                  <Activity className="h-3.5 w-3.5 text-emerald-500" />
                  Live Customer Preview
                </span>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono font-black uppercase animate-pulse">
                  Rendering
                </span>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl overflow-hidden shadow-md">
                <div className="h-2.5 bg-emerald-600" />
                <div className="p-4 space-y-3.5">
                  <div className="flex justify-between items-start">
                    <span className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-400 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider">
                      {badge || 'Nutrition Tier'}
                    </span>
                    <span className="text-[8px] bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 px-1.5 py-0.5 rounded uppercase font-black">
                      {billingCycle}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-display font-black text-sm text-zinc-900 dark:text-white line-clamp-1">
                      {name || 'Draft Nutrition Plan'}
                    </h4>
                    <p className="text-[10px] text-zinc-400 line-clamp-2 mt-0.5 font-medium leading-relaxed">
                      {description || 'Custom tailored range nutrition program for grazing herds.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center border-t border-b py-2.5 font-mono">
                    <div>
                      <span className="text-[8px] text-zinc-400 block uppercase font-bold">Monthly Feed</span>
                      <strong className="text-zinc-950 dark:text-white text-xs">
                        ₦{feedPrice.toLocaleString()}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[8px] text-zinc-400 block uppercase font-bold">Mgt & Board</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 text-xs">
                        ₦{managementFee.toLocaleString()}
                      </strong>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[8px] text-zinc-400 block uppercase font-black tracking-wider">Plan Highlights Included:</span>
                    <div className="space-y-1 text-[10px] text-zinc-500">
                      {featuresList.slice(0, 3).map((feat, i) => (
                        <div key={i} className="flex gap-1.5 items-center">
                          <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                      {featuresList.length > 3 && (
                        <span className="text-[9px] text-emerald-600 font-bold">+{featuresList.length - 3} more features list</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comprehensive Pricing Simulator */}
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-850 space-y-4 shadow-sm text-xs">
              <div className="flex justify-between items-center border-b pb-2">
                <h4 className="font-display font-black text-xs text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Coins className="h-4 w-4 text-emerald-600" />
                  Contract Pricing Simulator
                </h4>
                <span className="text-[8px] bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded font-black uppercase">Calculator</span>
              </div>

              {/* Herd size interactive inputs */}
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">Simulate Herd Sizes</span>
                <div className="grid grid-cols-3 gap-2 font-mono">
                  <div>
                    <label className="block text-[8px] text-zinc-400 mb-0.5 text-center">🐄 Cows</label>
                    <input 
                      type="number"
                      value={simCowCount}
                      onChange={(e) => setSimCowCount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full text-center py-1 border rounded-lg bg-zinc-50 dark:bg-zinc-950 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] text-zinc-400 mb-0.5 text-center">🐐 Goats</label>
                    <input 
                      type="number"
                      value={simGoatCount}
                      onChange={(e) => setSimGoatCount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full text-center py-1 border rounded-lg bg-zinc-50 dark:bg-zinc-950 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] text-zinc-400 mb-0.5 text-center">🐏 Rams</label>
                    <input 
                      type="number"
                      value={simRamCount}
                      onChange={(e) => setSimRamCount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full text-center py-1 border rounded-lg bg-zinc-50 dark:bg-zinc-950 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Live calculated outputs */}
              <div className="space-y-1.5 font-medium border-t pt-3 font-sans text-zinc-600 dark:text-zinc-400">
                <div className="flex justify-between items-center py-0.5">
                  <span>Feed cost ({simTotalAnimals} animals):</span>
                  <span className="font-mono text-zinc-900 dark:text-white">₦{simFeedsMonthly.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span>Boarding & Custody fee:</span>
                  <span className="font-mono text-zinc-900 dark:text-white">₦{simMgmtMonthly.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span>RFID + Vet + Insurance:</span>
                  <span className="font-mono text-zinc-900 dark:text-white">₦{simAddOnsMonthly.toLocaleString()}</span>
                </div>
                
                {simDiscountsTotal > 0 && (
                  <div className="flex justify-between items-center py-0.5 text-rose-600 dark:text-rose-400 font-bold">
                    <span>Applied Promos & Discounts:</span>
                    <span className="font-mono">-₦{simDiscountsTotal.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between items-center py-0.5">
                  <span>Calculated VAT ({taxPercent}%):</span>
                  <span className="font-mono text-zinc-900 dark:text-white">₦{simTaxTotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center border-t border-dashed pt-2 font-black text-zinc-900 dark:text-white text-xs">
                  <span>Total Payable:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 text-sm">₦{simFinalTotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center text-[9px] text-zinc-400 bg-zinc-50 dark:bg-zinc-950 p-2 rounded-lg font-mono">
                  <span>Projected Admin Profit ({profitMarginPercent}%):</span>
                  <span>₦{simProjectedProfit.toLocaleString()}</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
