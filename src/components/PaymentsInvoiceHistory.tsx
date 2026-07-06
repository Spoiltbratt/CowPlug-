import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, ArrowUpDown, Calendar, Tag, ShieldCheck, 
  Download, FileText, ChevronDown, ChevronUp, Check, DollarSign, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FarmerLivestock } from '../types';

interface PaymentsInvoiceHistoryProps {
  ownedAnimals: FarmerLivestock[];
}

export interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  animalId: string;
  tagNumber: string;
  breed: string;
  category: 'Cow' | 'Ram' | 'Goat';
  date: string;
  expenseCategory: 'purchase' | 'transport' | 'vet' | 'medication' | 'management';
  expenseName: string;
  description: string;
  amount: number;
  ledgerHash: string;
}

export default function PaymentsInvoiceHistory({ ownedAnimals }: PaymentsInvoiceHistoryProps) {
  // Filters & Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [animalFilter, setAnimalFilter] = useState<string>('all');
  const [sortOption, setSortOption] = useState<string>('date-desc');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Generate individual historical invoices/expenses dynamically for each owned animal
  const allInvoiceItems = useMemo(() => {
    const items: InvoiceItem[] = [];
    
    ownedAnimals.forEach((animal, index) => {
      const isCow = animal.category?.toLowerCase() === 'cow';
      const isRam = animal.category?.toLowerCase() === 'ram';
      
      const basePrice = animal.purchasePrice || (isCow ? 350000 : isRam ? 120000 : 85000);
      const transportFee = isCow ? 25000 : isRam ? 15000 : 12000;
      const vetInspectionFee = isCow ? 15000 : isRam ? 10000 : 8000;
      const medicationFee = isCow ? 12500 : isRam ? 7500 : 6000;
      
      let monthlyMgmtFee = 15000;
      if (animal.feedingPlan === 'Pasture + Supplement Feed') {
        monthlyMgmtFee = 30750;
      } else if (animal.feedingPlan === 'Premium Fattening Feed') {
        monthlyMgmtFee = 35750;
      }

      const cleanDate = animal.datePurchased || '2026-07-01';
      // Shift dates slightly to make them look like a sequence of operational transactions
      const getDateOffset = (days: number) => {
        const d = new Date(cleanDate);
        d.setDate(d.getDate() + days);
        return d.toISOString().split('T')[0];
      };

      // 1. Purchase Acquisition Invoice Line
      items.push({
        id: `inv-${animal.id}-purchase`,
        invoiceNumber: `INV-2026-${animal.tagNumber.replace('-', '')}-A`,
        animalId: animal.id,
        tagNumber: animal.tagNumber,
        breed: animal.breed,
        category: animal.category as any,
        date: cleanDate,
        expenseCategory: 'purchase',
        expenseName: `${animal.category} Acquisition`,
        description: `Full purchase cost of ${animal.breed} (Tag: ${animal.tagNumber}) transferred directly to verified breeder.`,
        amount: basePrice,
        ledgerHash: `CPG-TX-${animal.tagNumber}-ACQ-${(basePrice).toString(16).toUpperCase()}`
      });

      // 2. Transport & Delivery Invoice Line
      items.push({
        id: `inv-${animal.id}-transport`,
        invoiceNumber: `INV-2026-${animal.tagNumber.replace('-', '')}-B`,
        animalId: animal.id,
        tagNumber: animal.tagNumber,
        breed: animal.breed,
        category: animal.category as any,
        date: getDateOffset(1),
        expenseCategory: 'transport',
        expenseName: 'Transit & Bio-Security',
        description: `Live-ventilated multi-herd delivery from source ranch to CowPlug pasture Range C. Includes bio-secure loading and transit insurance.`,
        amount: transportFee,
        ledgerHash: `CPG-TX-${animal.tagNumber}-TRA-${(transportFee).toString(16).toUpperCase()}`
      });

      // 3. Veterinary Intake Invoice Line
      items.push({
        id: `inv-${animal.id}-vet`,
        invoiceNumber: `INV-2026-${animal.tagNumber.replace('-', '')}-C`,
        animalId: animal.id,
        tagNumber: animal.tagNumber,
        breed: animal.breed,
        category: animal.category as any,
        date: getDateOffset(1),
        expenseCategory: 'vet',
        expenseName: 'Intake Veterinary Screening',
        description: `Comprehensive diagnostic status check, weight logging, biometric tag allocation, and general checkup by Dr. Babatunde Jinadu.`,
        amount: vetInspectionFee,
        ledgerHash: `CPG-TX-${animal.tagNumber}-VET-${(vetInspectionFee).toString(16).toUpperCase()}`
      });

      // 4. Medication & Treatment Invoice Line
      items.push({
        id: `inv-${animal.id}-medication`,
        invoiceNumber: `INV-2026-${animal.tagNumber.replace('-', '')}-D`,
        animalId: animal.id,
        tagNumber: animal.tagNumber,
        breed: animal.breed,
        category: animal.category as any,
        date: getDateOffset(2),
        expenseCategory: 'medication',
        expenseName: 'Preventive Vaccines & Deworming',
        description: `Prophylactic treatment program including Foot-and-Mouth (FMD) vaccine, PPR booster doses, and mineral fortification.`,
        amount: medicationFee,
        ledgerHash: `CPG-TX-${animal.tagNumber}-MED-${(medicationFee).toString(16).toUpperCase()}`
      });

      // 5. Boarding Feed & Management Invoice Line
      items.push({
        id: `inv-${animal.id}-management`,
        invoiceNumber: `INV-2026-${animal.tagNumber.replace('-', '')}-E`,
        animalId: animal.id,
        tagNumber: animal.tagNumber,
        breed: animal.breed,
        category: animal.category as any,
        date: getDateOffset(3),
        expenseCategory: 'management',
        expenseName: `Range Management & Feed (${animal.feedingPlan || 'Pasture Only'})`,
        description: `Cooperative boarding plan expenses including grazing access, routine herdsman patrol, and premium feed supplements.`,
        amount: monthlyMgmtFee,
        ledgerHash: `CPG-TX-${animal.tagNumber}-MGT-${(monthlyMgmtFee).toString(16).toUpperCase()}`
      });
    });

    return items;
  }, [ownedAnimals]);

  // Unique list of animal tags for select filter dropdown
  const uniqueAnimalTags = useMemo(() => {
    const tags = new Map<string, string>();
    ownedAnimals.forEach(an => {
      tags.set(an.id, `${an.tagNumber} (${an.breed})`);
    });
    return Array.from(tags.entries());
  }, [ownedAnimals]);

  // Filters + Search Query Filter Logic
  const filteredInvoiceItems = useMemo(() => {
    return allInvoiceItems.filter(item => {
      // 1. Search Query
      const cleanQuery = searchQuery.toLowerCase();
      const matchesSearch = 
        item.tagNumber.toLowerCase().includes(cleanQuery) ||
        item.breed.toLowerCase().includes(cleanQuery) ||
        item.invoiceNumber.toLowerCase().includes(cleanQuery) ||
        item.expenseName.toLowerCase().includes(cleanQuery) ||
        item.description.toLowerCase().includes(cleanQuery);

      // 2. Category Filter
      const matchesCategory = categoryFilter === 'all' || item.expenseCategory === categoryFilter;

      // 3. Animal Tag Filter
      const matchesAnimal = animalFilter === 'all' || item.animalId === animalFilter;

      return matchesSearch && matchesCategory && matchesAnimal;
    });
  }, [allInvoiceItems, searchQuery, categoryFilter, animalFilter]);

  // Sorting Logic
  const sortedInvoiceItems = useMemo(() => {
    const items = [...filteredInvoiceItems];
    switch (sortOption) {
      case 'date-desc':
        return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      case 'date-asc':
        return items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      case 'amount-desc':
        return items.sort((a, b) => b.amount - a.amount);
      case 'amount-asc':
        return items.sort((a, b) => a.amount - b.amount);
      case 'tag-asc':
        return items.sort((a, b) => a.tagNumber.localeCompare(b.tagNumber));
      default:
        return items;
    }
  }, [filteredInvoiceItems, sortOption]);

  const handleRowToggle = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'purchase':
        return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-500/10';
      case 'transport':
        return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-500/10';
      case 'vet':
        return 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-500/10';
      case 'medication':
        return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-500/10';
      case 'management':
        return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-500/10';
      default:
        return 'bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300';
    }
  };

  const getAnimalIcon = (category: 'Cow' | 'Ram' | 'Goat') => {
    switch (category?.toLowerCase()) {
      case 'cow': return '🐄';
      case 'ram': return '🐏';
      case 'goat': return '🐐';
      default: return '🐾';
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-6 mt-6">
      
      {/* Title & Introduction */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-5">
        <div className="space-y-1">
          <h3 className="font-display font-extrabold text-lg text-zinc-900 dark:text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-600" /> Complete Invoice Sourcing History
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Real-time tracking of acquisition costs, transit logs, professional vet care bills, and feeding plans.
          </p>
        </div>
        <div className="text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-500/10 px-3 py-1.5 rounded-full font-bold flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5" /> Ledger Audited
        </div>
      </div>

      {/* SEARCH & FILTERS GRID PANEL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        
        {/* 1. Search Bar */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Search Invoices
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search ID, tag, item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border dark:bg-zinc-950 dark:border-zinc-850 bg-zinc-50/50"
            />
          </div>
        </div>

        {/* 2. Expense Category Filter */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Expense Category
          </label>
          <div className="relative">
            <Filter className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border dark:bg-zinc-950 dark:border-zinc-850 bg-zinc-50/50 text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              <option value="all">All Expense Types</option>
              <option value="purchase">Acquisition Costs</option>
              <option value="transport">Transit & Delivery</option>
              <option value="vet">Veterinary Care</option>
              <option value="medication">Medication & Vaccine</option>
              <option value="management">Feeding & Boarding</option>
            </select>
          </div>
        </div>

        {/* 3. Animal ID / Tag Filter */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Filter by Animal ID
          </label>
          <div className="relative">
            <Tag className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <select
              value={animalFilter}
              onChange={(e) => setAnimalFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border dark:bg-zinc-950 dark:border-zinc-850 bg-zinc-50/50 text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              <option value="all">All Managed Animals</option>
              {uniqueAnimalTags.map(([id, label]) => (
                <option key={id} value={id}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 4. Sorting Selector */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Sort Invoices
          </label>
          <div className="relative">
            <ArrowUpDown className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border dark:bg-zinc-950 dark:border-zinc-850 bg-zinc-50/50 text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              <option value="date-desc">Date: Newest First</option>
              <option value="date-asc">Date: Oldest First</option>
              <option value="amount-desc">Amount: Highest First</option>
              <option value="amount-asc">Amount: Lowest First</option>
              <option value="tag-asc">Animal Tag: A-Z</option>
            </select>
          </div>
        </div>

      </div>

      {/* INVOICE ITEMS COUNT BAR */}
      <div className="flex justify-between items-center text-xs text-zinc-500 bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-150 dark:border-zinc-900">
        <div>
          Showing <strong className="text-zinc-800 dark:text-zinc-200">{sortedInvoiceItems.length}</strong> audited line items
        </div>
        {(categoryFilter !== 'all' || animalFilter !== 'all' || searchQuery) && (
          <button 
            onClick={() => {
              setSearchQuery('');
              setCategoryFilter('all');
              setAnimalFilter('all');
            }}
            type="button" 
            className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* INVOICE LIST TABLE */}
      <div className="overflow-hidden border border-zinc-150 dark:border-zinc-850 rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/70 dark:bg-zinc-900/40 text-[9px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest border-b border-zinc-150 dark:border-zinc-850">
                <th className="p-4 pl-5">Date</th>
                <th className="p-4">Livestock Info</th>
                <th className="p-4">Expense Details</th>
                <th className="p-4">Category</th>
                <th className="p-4 text-right pr-5">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-150 dark:divide-zinc-850 text-xs">
              {sortedInvoiceItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-zinc-400">
                    <FileText className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
                    <p className="font-bold">No historical invoices found</p>
                    <p className="text-[11px] text-zinc-500 mt-1">Try adjusting your category or tag filter.</p>
                  </td>
                </tr>
              ) : (
                sortedInvoiceItems.map((item) => {
                  const isExpanded = expandedId === item.id;
                  return (
                    <React.Fragment key={item.id}>
                      {/* Clickable Header Row */}
                      <tr 
                        onClick={() => handleRowToggle(item.id)}
                        className={`cursor-pointer transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 ${
                          isExpanded ? 'bg-zinc-50/30 dark:bg-zinc-900/10' : ''
                        }`}
                      >
                        {/* 1. Date */}
                        <td className="p-4 pl-5 font-mono text-zinc-500 dark:text-zinc-400 font-semibold whitespace-nowrap">
                          {item.date}
                        </td>
                        
                        {/* 2. Livestock Info */}
                        <td className="p-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-sm shrink-0">{getAnimalIcon(item.category)}</span>
                            <div>
                              <strong className="text-zinc-800 dark:text-zinc-200 block font-bold">
                                {item.tagNumber}
                              </strong>
                              <span className="text-[10px] text-zinc-400 font-medium">
                                {item.breed}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 3. Expense Name */}
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-zinc-900 dark:text-zinc-100">{item.expenseName}</span>
                            {isExpanded ? <ChevronUp className="h-3 w-3 text-zinc-400" /> : <ChevronDown className="h-3 w-3 text-zinc-400" />}
                          </div>
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block truncate max-w-[200px] md:max-w-xs font-normal">
                            {item.description}
                          </span>
                        </td>

                        {/* 4. Expense Category Badge */}
                        <td className="p-4 whitespace-nowrap">
                          <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-md tracking-wider ${getCategoryBadgeColor(item.expenseCategory)}`}>
                            {item.expenseCategory}
                          </span>
                        </td>

                        {/* 5. Amount */}
                        <td className="p-4 text-right pr-5 font-mono font-black text-zinc-950 dark:text-white whitespace-nowrap">
                          ₦{item.amount.toLocaleString()}
                        </td>
                      </tr>

                      {/* Expanded Detailed Breakdown Drawer Row */}
                      <AnimatePresence>
                        {isExpanded && (
                          <tr>
                            <td colSpan={5} className="bg-zinc-50 dark:bg-zinc-900/30 p-5 pl-8 pr-8 border-b border-zinc-200 dark:border-zinc-800">
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-3.5 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed"
                              >
                                {/* Upper Badge and Invoice Code */}
                                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">
                                      INVOICE REFERENCE: {item.invoiceNumber}
                                    </span>
                                    <span className="text-[8px] font-mono font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-zinc-900 px-1.5 py-0.5 rounded border border-emerald-500/10 uppercase">
                                      ✓ Sourced via Account Balance
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
                                    Audited on Date: {item.date}
                                  </span>
                                </div>

                                {/* Content Details */}
                                <div className="space-y-1 bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-150 dark:border-zinc-900">
                                  <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-extrabold text-[10px] uppercase tracking-wider mb-1">
                                    <Sparkles className="h-3.5 w-3.5" /> Operational Audit Logs & Verification
                                  </div>
                                  <p className="text-xs text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">
                                    {item.description}
                                  </p>
                                  <p className="text-[11px] text-zinc-400 leading-relaxed pt-1.5">
                                    As per our <strong>"Trust is our technology"</strong> philosophy, there are zero administrative margins on this item. All operational line items are charged exactly at range cooperative cost index.
                                  </p>
                                </div>

                                {/* Ledger Signature Bar */}
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-1">
                                  <div className="space-y-1">
                                    <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block font-extrabold">
                                      CRYPTOGRAPHIC LEDGER REFERENCE (SHA-256)
                                    </span>
                                    <span className="font-mono text-[9.5px] text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-950 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-900 block select-all truncate">
                                      {item.ledgerHash}
                                    </span>
                                  </div>

                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() => alert(`Sourcing PDF receipt compiled for invoice ${item.invoiceNumber}`)}
                                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
                                    >
                                      <Download className="h-3.5 w-3.5" /> Download Verified Receipt
                                    </button>
                                  </div>
                                </div>

                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
