import React, { useState } from 'react';
import { 
  FileText, ShieldCheck, Download, Printer, Search, ArrowUpRight, 
  Layers, CheckCircle2, ChevronRight, Info, HelpCircle, FileSpreadsheet, Sparkles, Globe,
  Upload, FileUp, Building, Calendar as CalendarIcon, CheckSquare, RefreshCw, X, Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FarmerLivestock, User as UserType } from '../types';
import { Invoice } from '../types_payments';
import { Order } from './AdminOrderManagementCenterModal';

interface InvoiceViewerProps {
  ownedAnimals: FarmerLivestock[];
  userBalance: number;
  invoices?: Invoice[];
  onUpdateInvoice?: (id: string, updates: Partial<Invoice>) => void;
  orders?: Order[];
  onUpdateOrder?: (id: string, updates: Partial<Order>) => void;
  currentUser?: UserType;
}

interface InvoiceLineItem {
  id: string;
  name: string;
  description: string;
  category: 'purchase' | 'transport' | 'vet' | 'medication' | 'management';
  amount: number;
}

export default function InvoiceViewer({ 
  ownedAnimals, 
  userBalance,
  invoices = [],
  onUpdateInvoice = () => {},
  orders = [],
  onUpdateOrder = () => {},
  currentUser
}: InvoiceViewerProps) {
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>(
    ownedAnimals.length > 0 ? ownedAnimals[0].id : 'all'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  
  // Custom navigation between pending invoices and historic ledger
  const [activeTab, setActiveTab] = useState<'pending' | 'ledger'>('pending');

  // Receipt uploader state
  const [uploaderInvoiceId, setUploaderInvoiceId] = useState<string | null>(null);
  const [uploaderBank, setUploaderBank] = useState('Sterling Bank');
  const [uploaderReference, setUploaderReference] = useState('');
  const [uploaderAmount, setUploaderAmount] = useState('');
  const [uploaderDate, setUploaderDate] = useState(new Date().toISOString().split('T')[0]);
  const [uploaderFile, setUploaderFile] = useState<string>('');
  const [isSubmittingReceipt, setIsSubmittingReceipt] = useState(false);

  // Line item detail expand state
  const [expandedDetailsId, setExpandedDetailsId] = useState<string | null>(null);

  // Helper to generate default settled invoices for active owned animals
  const generateInvoiceForAnimal = (animal: FarmerLivestock) => {
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

    const lineItems: InvoiceLineItem[] = [
      {
        id: 'item-purchase',
        name: `${animal.category} Acquisition Price`,
        description: `Direct farmer purchase cost for ${animal.breed} (Tag: ${animal.tagNumber}). 100% went to original breeder.`,
        category: 'purchase',
        amount: basePrice
      },
      {
        id: 'item-transport',
        name: 'Specialized Live-Ventilated Transport',
        description: `Bio-secure, ventilated delivery from breeder ranch to Oyo Pasture Range C. Includes animal transit insurance.`,
        category: 'transport',
        amount: transportFee
      },
      {
        id: 'item-vet',
        name: 'Mandatory Intake Veterinary Examination',
        description: 'Comprehensive physical status screening, quarantine clearance, and weight baseline logging.',
        category: 'vet',
        amount: vetInspectionFee
      },
      {
        id: 'item-medication',
        name: 'Mandatory Preventive Vaccinations & Deworming',
        description: 'Administration of FMD (Foot & Mouth Disease) vaccine, PPR booster, and broad-spectrum dewormers upon intake.',
        category: 'medication',
        amount: medicationFee
      },
      {
        id: 'item-management',
        name: `Active Boarding & Diet Plan (${animal.feedingPlan || 'Pasture Only'})`,
        description: `Includes professional range-hand surveillance, scheduled salt-licks, rotational grazing, and customized feed ratios.`,
        category: 'management',
        amount: monthlyMgmtFee
      }
    ];

    const subtotal = lineItems.reduce((acc, item) => acc + item.amount, 0);
    const taxAndLevies = 0; 
    const total = subtotal + taxAndLevies;

    const ledgerHash = `CPG-TX-${animal.tagNumber}-${animal.id.substring(animal.id.length - 6).toUpperCase()}-${(basePrice + monthlyMgmtFee).toString(16).toUpperCase()}`;

    return {
      id: `inv-settled-${animal.id}`,
      invoiceNumber: `INV-2026-${animal.tagNumber.replace('-', '')}`,
      customerFullName: currentUser?.fullName || animal.ownersName || 'Customer',
      customerEmail: currentUser?.email || 'customer@cowplug.com',
      date: animal.datePurchased || '2026-07-01',
      dueDate: 'Immediate Settlement',
      lineItems,
      subtotal,
      taxAndLevies,
      total,
      ledgerHash,
      status: 'Paid',
      internalNotes: 'Auto-verified blockchain custody record.'
    };
  };

  // Compile default settled invoices for active owned animals
  const settledInvoices = ownedAnimals.map(generateInvoiceForAnimal);

  // Dynamic system invoices filtered by logged in user
  const userDynamicInvoices = invoices.filter(inv => 
    inv.customerEmail?.toLowerCase() === currentUser?.email?.toLowerCase()
  );

  // Filter invoices for search queries
  const matchesSearch = (inv: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      inv.invoiceNumber.toLowerCase().includes(query) ||
      (inv.id && inv.id.toLowerCase().includes(query)) ||
      (inv.customerFullName && inv.customerFullName.toLowerCase().includes(query))
    );
  };

  const pendingList = userDynamicInvoices.filter(inv => 
    inv.status === 'Pending Payment' || inv.status === 'Awaiting Verification' || inv.status === 'Rejected'
  ).filter(matchesSearch);

  const ledgerList = [
    ...userDynamicInvoices.filter(inv => inv.status === 'Paid' || inv.status === 'Verified'),
    ...settledInvoices
  ].filter(matchesSearch);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  // Open receipt uploader with prefilled invoice details
  const openReceiptUploader = (inv: Invoice) => {
    setUploaderInvoiceId(inv.id);
    setUploaderAmount(inv.amount.toString());
    setUploaderBank('Sterling Bank');
    setUploaderReference('');
    setUploaderDate(new Date().toISOString().split('T')[0]);
    // Prefill simulated receipt
    setUploaderFile(`cowplug_receipt_invoice_${inv.invoiceNumber}.pdf`);
  };

  // Handle uploading/submitting payment receipt
  const handleSubmitReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploaderInvoiceId) return;

    setIsSubmittingReceipt(true);

    setTimeout(() => {
      // Find matching invoice to update
      const targetInvoice = invoices.find(i => i.id === uploaderInvoiceId);
      if (targetInvoice) {
        // Update invoice in App level state
        onUpdateInvoice(uploaderInvoiceId, {
          status: 'Awaiting Verification',
          bankUsed: uploaderBank,
          paymentReference: uploaderReference || `TXN-REF-${Math.floor(100000 + Math.random() * 900000)}`,
          paymentDate: uploaderDate,
          receiptUrl: uploaderFile || `sterling_bank_receipt_${Date.now().toString().substring(6)}.pdf`,
          internalNotes: 'Payment receipt uploaded by customer. Awaiting Admin verification.',
          auditLog: [
            ...(targetInvoice.auditLog || []),
            {
              date: new Date().toISOString(),
              status: 'Awaiting Verification',
              actionBy: currentUser?.fullName || 'Customer',
              notes: `Receipt uploaded. Reference: ${uploaderReference || 'N/A'}. Paid via ${uploaderBank}.`
            }
          ]
        });

        // Also locate and update corresponding Order fulfillment status
        const associatedOrder = orders.find(o => o.invoiceId === targetInvoice.invoiceNumber);
        if (associatedOrder && onUpdateOrder) {
          onUpdateOrder(associatedOrder.id, {
            fulfillmentStep: 'Awaiting Verification',
            status: 'Pending',
            internalNotes: `Customer uploaded transfer receipt: ${uploaderFile}. Ready for administrator approval.`
          });
        }
      }

      setIsSubmittingReceipt(false);
      setUploaderInvoiceId(null);
      alert("Proof of Bank Transfer submitted successfully! Our audit desk will review the receipt, assign your Livestock Tag, and list your animals in 'My Animals' shortly.");
    }, 1000);
  };

  return (
    <div id="financial-transactions-component" className="space-y-6">
      
      {/* Banner */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 bg-emerald-500/5 dark:bg-emerald-400/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono bg-emerald-500/10 dark:bg-emerald-400/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-full font-extrabold uppercase tracking-widest flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> SECURE BANK COOPERATIVE
              </span>
            </div>
            <h2 className="font-display font-extrabold text-2xl text-zinc-950 dark:text-white tracking-tight">
              Transparent Financial Ledger & Invoices
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Complete your livestock acquisitions safely via manual bank transfers. Every transaction is logged and audited by the CowPlug registry.
            </p>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={handlePrint}
              type="button" 
              className="px-3.5 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-850 flex items-center gap-1.5 transition-colors"
            >
              <Printer className="h-4 w-4" /> Print ledger
            </button>
            <button 
              onClick={() => alert('Agricultural CSV Statement compilation complete! Download started.')}
              type="button" 
              className="px-3.5 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-850 flex items-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="h-4 w-4" /> Export CSV
            </button>
          </div>
        </div>

        {/* Tab switcher & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-5">
          <div className="flex bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'pending'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Pending Payments & Verifications ({pendingList.length})
            </button>
            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'ledger'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Verified Sourcing Ledger ({ledgerList.length})
            </button>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search invoice number..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border text-xs dark:bg-zinc-950 dark:border-zinc-800"
            />
          </div>
        </div>
      </div>

      {/* Official bank transfer instruction banner for Pending Payment */}
      {activeTab === 'pending' && pendingList.some(i => i.status === 'Pending Payment') && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 p-5 rounded-3xl space-y-3">
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <h4 className="font-display font-black text-xs uppercase tracking-wider text-amber-800 dark:text-amber-300">
              CowPlugNG Official Bank Account details
            </h4>
          </div>
          <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Please make bank transfers to our accredited Escrow bank account below. Ensure you transfer the <strong>exact amount</strong>, and quote the <strong>Invoice ID</strong> as the transfer description/reference.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-zinc-950 p-4 border rounded-2xl text-xs font-mono">
            <div>
              <span className="text-[9px] text-zinc-400 block font-bold uppercase tracking-wide">BANK NAME</span>
              <strong className="text-zinc-800 dark:text-zinc-200 font-sans text-sm">Sterling Bank Plc</strong>
            </div>
            <div>
              <span className="text-[9px] text-zinc-400 block font-bold uppercase tracking-wide">ACCOUNT NUMBER</span>
              <strong className="text-emerald-600 text-sm select-all">0012948192</strong>
            </div>
            <div>
              <span className="text-[9px] text-zinc-400 block font-bold uppercase tracking-wide">ACCOUNT NAME</span>
              <strong className="text-zinc-800 dark:text-zinc-200 font-sans text-sm">CowPlug Escrow Logistics Ltd</strong>
            </div>
          </div>
        </div>
      )}

      {/* Main List */}
      <div className="space-y-6">
        {activeTab === 'pending' ? (
          pendingList.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl">
              <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
              <h3 className="font-display font-bold text-zinc-700 dark:text-zinc-300">All invoices settled perfectly</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                No pending bank transfers or awaiting payment verification slips are currently outstanding.
              </p>
            </div>
          ) : (
            pendingList.map((inv) => (
              <div 
                key={inv.id}
                className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm"
              >
                {/* Invoice Header */}
                <div className="bg-zinc-50 dark:bg-zinc-900/40 p-5 border-b border-zinc-150 dark:border-zinc-900/60 flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="font-mono text-xs text-zinc-800 dark:text-zinc-200">
                          {inv.invoiceNumber}
                        </strong>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                          inv.status === 'Awaiting Verification' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 animate-pulse' :
                          inv.status === 'Rejected' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400' :
                          'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}>
                          {inv.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400">
                        Issued: {inv.date} • Due: within 48 hours
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end justify-center">
                    <span className="text-xs font-semibold text-zinc-400">Amount Due</span>
                    <strong className="font-display font-black text-lg text-zinc-950 dark:text-white">
                      ₦{inv.amount.toLocaleString()}
                    </strong>
                  </div>
                </div>

                {/* Info and action bar */}
                <div className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="text-zinc-500">
                      <strong>Customer:</strong> {inv.customerFullName} ({inv.customerEmail})
                    </div>
                    {inv.internalNotes && (
                      <p className="text-rose-600 dark:text-rose-400 text-[11px] font-bold">
                        ⚠️ Admin Feedback: {inv.internalNotes}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {inv.status === 'Pending Payment' || inv.status === 'Rejected' ? (
                      <button
                        onClick={() => openReceiptUploader(inv)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Upload className="h-4 w-4" /> Upload Payment Receipt
                      </button>
                    ) : (
                      <div className="text-[11px] text-zinc-400 italic">
                        ✓ Reference {inv.paymentReference} uploaded. Awaiting physical bank handshake audit.
                      </div>
                    )}
                  </div>
                </div>

                {/* Submitted receipt details */}
                {(inv.bankUsed || inv.paymentReference || inv.receiptUrl) && (
                  <div className="bg-zinc-50 dark:bg-zinc-900/40 p-4 border-t border-zinc-150 dark:border-zinc-900 text-xs font-mono grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-[9px] text-zinc-400 block font-bold">TRANSFERRED FROM</span>
                      <span className="text-zinc-700 dark:text-zinc-300 font-bold font-sans">{inv.bankUsed}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-400 block font-bold">TRANSACTION REFERENCE</span>
                      <span className="text-zinc-700 dark:text-zinc-300 font-bold">{inv.paymentReference}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-400 block font-bold">PAYMENT DATE</span>
                      <span className="text-zinc-700 dark:text-zinc-300">{inv.paymentDate}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-400 block font-bold">RECEIPT FILE</span>
                      <span className="text-emerald-600 dark:text-emerald-400 underline truncate block">{inv.receiptUrl}</span>
                    </div>
                  </div>
                )}
              </div>
            ))
          )
        ) : (
          ledgerList.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl">
              <FileText className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
              <h3 className="font-display font-bold text-zinc-700 dark:text-zinc-300">No historic entries found</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                No verified or settled ledger receipts are logged yet. Once payments are verified, they will appear here.
              </p>
            </div>
          ) : (
            ledgerList.map((invAny) => {
              const inv = invAny as any;
              return (
                <div 
                  key={inv.invoiceNumber}
                  className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm animate-fade-in"
                >
                {/* Invoice Top Header */}
                <div className="bg-zinc-50 dark:bg-zinc-900/40 p-5 border-b border-zinc-250/60 dark:border-zinc-900 flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-emerald-500/10 dark:bg-emerald-400/10 rounded-xl flex items-center justify-center text-emerald-600">
                      <FileText className="h-5.5 w-5.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-xs text-zinc-700 dark:text-zinc-300">
                          {inv.invoiceNumber}
                        </span>
                        <span className="text-[9px] font-black uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 px-2 py-0.5 rounded">
                          {inv.status || 'Verified'}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400 font-medium">
                        Date Issued: {inv.date} • Due: Immediate Settlement
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end justify-center">
                    <span className="text-xs font-semibold text-zinc-400">Total Sourced Value</span>
                    <span className="font-display font-black text-lg text-zinc-950 dark:text-white">
                      ₦{inv.total?.toLocaleString() || inv.amount?.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Itemized Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-50/50 dark:bg-zinc-900/20 text-[9px] font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-150 dark:border-zinc-900">
                        <th className="p-4 pl-6">Line Item / Expense Type</th>
                        <th className="p-4 hidden md:table-cell">Transparent Operational Scope</th>
                        <th className="p-4 text-right pr-6">Audited Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-150 dark:divide-zinc-900 text-xs">
                      {(inv.lineItems || [
                        { id: 'item-purchase', name: 'Livestock Sourcing Acquisition', description: 'Acquisition payment cleared to ranch breeder network.', amount: inv.amount }
                      ]).map((item: any) => {
                        const isExpanded = expandedDetailsId === `${inv.invoiceNumber}-${item.id}`;
                        return (
                          <React.Fragment key={item.id}>
                            <tr className="hover:bg-zinc-50/30 dark:hover:bg-zinc-900/10 transition-colors">
                              <td className="p-4 pl-6 font-semibold text-zinc-900 dark:text-zinc-100 max-w-xs md:max-w-sm">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold">{item.name}</span>
                                  <button
                                    type="button"
                                    onClick={() => setExpandedDetailsId(isExpanded ? null : `${inv.invoiceNumber}-${item.id}`)}
                                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                                    title="Click to view line item documentation"
                                  >
                                    <Info className="h-3.5 w-3.5 cursor-pointer" />
                                  </button>
                                </div>
                              </td>
                              <td className="p-4 text-zinc-500 dark:text-zinc-400 max-w-md hidden md:table-cell leading-relaxed">
                                {item.description}
                              </td>
                              <td className="p-4 text-right pr-6 font-mono font-bold text-zinc-900 dark:text-white">
                                ₦{item.amount.toLocaleString()}
                              </td>
                            </tr>
                            
                            {/* Expanded description */}
                            <AnimatePresence>
                              {isExpanded && (
                                <tr>
                                  <td colSpan={3} className="bg-zinc-50 dark:bg-zinc-900/40 p-4 pl-6 pr-6 border-b border-zinc-200 dark:border-zinc-800">
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400"
                                    >
                                      <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-extrabold text-[10px] uppercase tracking-wider">
                                        <Sparkles className="h-3.5 w-3.5" /> Operational Audit & Verification
                                      </div>
                                      <p className="leading-relaxed">
                                        {item.description} CowPlug NG operates under a strict agricultural custody model. We do not markup vet services or medication; they are charged exactly at the Oyo range cooperative group rates.
                                      </p>
                                    </motion.div>
                                  </td>
                                </tr>
                              )}
                            </AnimatePresence>
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Dynamic crypt proof block */}
                <div className="p-6 bg-zinc-50 dark:bg-zinc-900/20 border-t border-zinc-150 dark:border-zinc-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1.5 flex-1 max-w-lg">
                    <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block font-extrabold">
                      DIGITAL INTEGRITY PROOF (SHA-256 LEDGER REFERENCE)
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-850 truncate select-all">
                        {inv.ledgerHash || `CPG-TX-LEDGER-VERIFIED-${inv.id.substring(4, 12).toUpperCase()}`}
                      </span>
                    </div>
                  </div>

                  <div className="w-full md:w-64 space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400 font-semibold">
                    <div className="flex justify-between pt-2 border-t border-zinc-250 dark:border-zinc-850 text-sm font-black text-zinc-950 dark:text-white">
                      <span>Verified Total:</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400">₦{(inv.total || inv.amount).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )
      )}
    </div>

      {/* Slide-out Receipt Uploader Panel */}
      <AnimatePresence>
        {uploaderInvoiceId && (
          <div className="fixed inset-0 z-50 flex justify-end bg-zinc-950/70 backdrop-blur-sm">
            {/* Backdrop Close trigger */}
            <div className="absolute inset-0" onClick={() => setUploaderInvoiceId(null)} />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-white dark:bg-zinc-900 h-full shadow-2xl p-6 overflow-y-auto space-y-6 flex flex-col z-10"
            >
              <div className="flex justify-between items-center pb-4 border-b">
                <div>
                  <h3 className="font-display font-black text-sm text-zinc-900 dark:text-white uppercase tracking-wider">
                    Upload Bank Transfer Proof
                  </h3>
                  <p className="text-[11px] text-zinc-500">Provide bank transaction logs to verify escrow wallet or animal payment.</p>
                </div>
                <button
                  onClick={() => setUploaderInvoiceId(null)}
                  className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5 text-zinc-400" />
                </button>
              </div>

              <form onSubmit={handleSubmitReceipt} className="space-y-4 flex-1 text-xs">
                {/* Amount Paid (Prefilled) */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Amount Transferred (₦)
                  </label>
                  <input
                    type="text"
                    required
                    disabled
                    value={`₦${Number(uploaderAmount).toLocaleString()}`}
                    className="w-full px-3.5 py-2.5 rounded-xl border bg-zinc-50 font-mono font-bold dark:bg-zinc-950/50 text-zinc-800 dark:text-zinc-200"
                  />
                </div>

                {/* Bank selection */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Your Bank Name (Used for Transfer)
                  </label>
                  <select
                    value={uploaderBank}
                    onChange={(e) => setUploaderBank(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border bg-white dark:bg-zinc-950"
                  >
                    <option value="Sterling Bank">Sterling Bank</option>
                    <option value="GTBank">GTBank (Guaranty Trust Bank)</option>
                    <option value="Zenith Bank">Zenith Bank</option>
                    <option value="Access Bank">Access Bank</option>
                    <option value="UBA">UBA (United Bank for Africa)</option>
                    <option value="First Bank">First Bank of Nigeria</option>
                    <option value="Kuda Bank">Kuda Microfinance Bank</option>
                    <option value="OPay">OPay Digital Services</option>
                  </select>
                </div>

                {/* Reference Number */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Transaction Reference / Session ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1000284910283718 or TXN-81920"
                    required
                    value={uploaderReference}
                    onChange={(e) => setUploaderReference(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border bg-white dark:bg-zinc-950"
                  />
                </div>

                {/* Payment Date */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    required
                    value={uploaderDate}
                    onChange={(e) => setUploaderDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border bg-white dark:bg-zinc-950"
                  />
                </div>

                {/* Simulated File upload */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Payment Receipt (PDF or Image)
                  </label>
                  <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 text-center space-y-2 hover:border-emerald-500/50 transition-colors bg-zinc-50/50 dark:bg-zinc-950/30">
                    <FileUp className="h-8 w-8 text-zinc-400 mx-auto" />
                    <div className="text-[11px] text-zinc-500">
                      Drag & drop your receipt, or <span className="text-emerald-600 font-bold underline cursor-pointer">browse file</span>
                    </div>
                    <p className="text-[9px] text-zinc-400">Supports PDF, JPG, PNG up to 10MB</p>
                  </div>
                  
                  {/* Selected simulated file */}
                  {uploaderFile && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 rounded-xl flex items-center space-x-2">
                      <ImageIcon className="h-4 w-4 text-emerald-600" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-zinc-800 dark:text-zinc-200 font-bold truncate">{uploaderFile}</p>
                        <span className="text-[9px] text-zinc-400 font-mono">1.2 MB • Ready</span>
                      </div>
                      <X 
                        onClick={() => setUploaderFile('')} 
                        className="h-3.5 w-3.5 text-zinc-400 hover:text-zinc-600 cursor-pointer" 
                      />
                    </div>
                  )}
                </div>

                {/* Notice message */}
                <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl text-[10px] text-zinc-400 flex items-start gap-1.5">
                  <Info className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>By submitting, you certify that this receipt represents a real funds transfer. Fraudulent submissions will result in instant account suspension.</span>
                </div>

                {/* Buttons */}
                <div className="pt-4 flex gap-2">
                  <button
                    type="submit"
                    disabled={isSubmittingReceipt}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white font-black rounded-xl text-xs transition-colors cursor-pointer shadow-lg shadow-emerald-600/10"
                  >
                    {isSubmittingReceipt ? 'Registering transaction...' : 'Submit Payment Receipt'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploaderInvoiceId(null)}
                    className="px-4 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Trust Philosophy Statement Banner */}
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-zinc-800">
        <div className="absolute top-0 right-0 opacity-15 pointer-events-none">
          <Globe className="h-44 w-44 text-zinc-400 -mr-8 -mt-8" />
        </div>
        
        <div className="max-w-2xl space-y-3 relative z-10">
          <span className="text-[9px] font-mono font-black tracking-widest text-emerald-400 uppercase bg-emerald-950/80 border border-emerald-500/20 px-3 py-1 rounded-full">
            OUR CORE VALUE PROPOSITION
          </span>
          <h4 className="font-display font-black text-lg sm:text-xl text-white">
            "Trust is our technology" Philosophy
          </h4>
          <p className="text-zinc-300 text-xs leading-relaxed">
            CowPlug NG believes agricultural investment is built on absolute transparency. Unlike legacy broker models, we do not obfuscate pricing or hide administration overheads in high feed costs. Every vet visit, dose of medication, or transport leg is tracked by expert handlers, verified by smart cloud logs, and made 100% visible to you.
          </p>
        </div>
      </div>

    </div>
  );
}
