import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Search, FileText, Check, AlertTriangle, Trash2, Edit2, 
  MapPin, Printer, Mail, Phone, Calendar, ShoppingBag, 
  ArrowRight, MessageSquare, Info, ChevronRight, User, DollarSign, Award
} from 'lucide-react';

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  animalType: 'Cow' | 'Goat' | 'Ram';
  breed: string;
  packageType: string;
  amount: number;
  date: string;
  invoiceId: string;
  bankPaidInto?: string;
  uploadedReceipt?: string;
  transactionReference?: string;
  status: 'Pending' | 'Paid' | 'Fulfillment' | 'Cancelled';
  fulfillmentStep: 
    | 'Animal Selected' 
    | 'Package Selected' 
    | 'Invoice Generated' 
    | 'Awaiting Payment' 
    | 'Receipt Uploaded' 
    | 'Awaiting Verification' 
    | 'Payment Verified' 
    | 'Preparing Animal' 
    | 'Veterinary Inspection' 
    | 'Ready for Transportation' 
    | 'Assigned Delivery Personnel' 
    | 'In Transit' 
    | 'Delivered' 
    | 'Cancelled';
  internalNotes?: string;
}

interface AdminOrderManagementCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onUpdateOrder: (id: string, updates: Partial<Order>) => void;
  onAddAuditLog: (action: string, details: string, status?: 'success' | 'warning' | 'danger') => void;
}

export const AdminOrderManagementCenterModal: React.FC<AdminOrderManagementCenterModalProps> = ({
  isOpen,
  onClose,
  orders,
  onUpdateOrder,
  onAddAuditLog
}) => {
  const [activeTab, setActiveTab] = useState<'All' | 'Pending' | 'Paid' | 'Fulfillment'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isContacting, setIsContacting] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [zoomReceipt, setZoomReceipt] = useState<string | null>(null);

  // Form states for editing
  const [editForm, setEditForm] = useState<Partial<Order>>({});

  if (!isOpen) return null;

  const filteredOrders = orders.filter(order => {
    // Tab filter
    if (activeTab !== 'All' && order.status !== activeTab) return false;

    // Search query filter
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.breed.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  const startEditing = (order: Order) => {
    setEditForm({ ...order });
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (selectedOrderId && editForm) {
      onUpdateOrder(selectedOrderId, editForm);
      onAddAuditLog(
        'Order Edited', 
        `Updated details for Order ${editForm.orderNumber} (Customer: ${editForm.customerName})`, 
        'warning'
      );
      setIsEditing(false);
    }
  };

  const handleUpdateStep = (step: Order['fulfillmentStep']) => {
    if (selectedOrderId) {
      let nextStatus = selectedOrder?.status || 'Pending';
      if (['Preparing Animal', 'Veterinary Inspection', 'Ready for Transportation', 'Assigned Delivery Personnel', 'In Transit', 'Delivered'].includes(step)) {
        nextStatus = 'Fulfillment';
      } else if (['Payment Verified', 'Receipt Uploaded', 'Awaiting Verification'].includes(step)) {
        nextStatus = 'Paid';
      } else if (step === 'Cancelled') {
        nextStatus = 'Cancelled';
      } else {
        nextStatus = 'Pending';
      }

      onUpdateOrder(selectedOrderId, { fulfillmentStep: step, status: nextStatus });
      onAddAuditLog(
        'Order Step Updated', 
        `Changed Order ${selectedOrder?.orderNumber} step to "${step}"`, 
        'success'
      );
    }
  };

  const handleApproveOrder = () => {
    if (selectedOrderId) {
      onUpdateOrder(selectedOrderId, { status: 'Fulfillment', fulfillmentStep: 'Preparing Animal' });
      onAddAuditLog(
        'Order Approved', 
        `Approved Order ${selectedOrder?.orderNumber}. Moved to Fulfillment.`, 
        'success'
      );
    }
  };

  const handleRejectOrder = () => {
    if (selectedOrderId) {
      onUpdateOrder(selectedOrderId, { status: 'Pending', fulfillmentStep: 'Awaiting Payment', uploadedReceipt: undefined });
      onAddAuditLog(
        'Order Payment Rejected', 
        `Rejected payment proof for Order ${selectedOrder?.orderNumber}. Reverted to pending.`, 
        'danger'
      );
    }
  };

  const handleCancelOrder = () => {
    if (selectedOrderId) {
      if (confirm('Are you sure you want to cancel this order? This action is irreversible.')) {
        onUpdateOrder(selectedOrderId, { status: 'Cancelled', fulfillmentStep: 'Cancelled' });
        onAddAuditLog(
          'Order Cancelled', 
          `Cancelled Order ${selectedOrder?.orderNumber}`, 
          'danger'
        );
      }
    }
  };

  const handleSendContactMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactMessage.trim()) return;
    
    alert(`Message dispatched successfully to ${selectedOrder?.customerName} (${selectedOrder?.customerEmail}) via SMS & Email!`);
    onAddAuditLog(
      'Customer Contacted', 
      `Sent notification to ${selectedOrder?.customerName} regarding Order ${selectedOrder?.orderNumber}`, 
      'success'
    );
    setContactMessage('');
    setIsContacting(false);
  };

  const handlePrint = () => {
    const printContent = document.getElementById('print-area-order')?.innerHTML;
    const originalContent = document.body.innerHTML;
    
    if (printContent) {
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(`
          <html>
            <head>
              <title>Order Summary - ${selectedOrder?.orderNumber}</title>
              <style>
                body { font-family: 'Inter', sans-serif; padding: 40px; color: #18181b; }
                .header { border-b: 2px solid #e4e4e7; padding-bottom: 20px; margin-bottom: 20px; }
                .grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
                .label { font-size: 11px; font-weight: bold; text-transform: uppercase; color: #71717a; }
                .value { font-size: 14px; margin-top: 4px; font-weight: 600; }
                .title { font-size: 24px; font-weight: 900; color: #059669; }
                .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #a1a1aa; border-t: 1px solid #e4e4e7; padding-top: 20px; }
              </style>
            </head>
            <body>
              ${printContent}
            </body>
          </html>
        `);
        win.document.close();
        win.print();
      }
    }
  };

  const stepList: Order['fulfillmentStep'][] = [
    'Animal Selected',
    'Package Selected',
    'Invoice Generated',
    'Awaiting Payment',
    'Receipt Uploaded',
    'Awaiting Verification',
    'Payment Verified',
    'Preparing Animal',
    'Veterinary Inspection',
    'Ready for Transportation',
    'Assigned Delivery Personnel',
    'In Transit',
    'Delivered'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end p-0 md:p-4 overflow-hidden">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose}
        className="fixed inset-0 bg-zinc-950/70 backdrop-blur-sm"
      />

      {/* Slide-over panel */}
      <motion.div 
        initial={{ x: '100%' }} 
        animate={{ x: 0 }} 
        exit={{ x: '100%' }} 
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="relative bg-zinc-50 dark:bg-zinc-950 w-full max-w-5xl h-full shadow-2xl flex flex-col z-10 md:rounded-l-3xl border-l border-zinc-200 dark:border-zinc-800"
      >
        {/* Header */}
        <div className="p-6 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-600 dark:text-emerald-400">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-display font-black text-xl text-zinc-900 dark:text-white">Order Control & Fulfillment Desk</h2>
              <p className="text-xs text-zinc-500">Track and manage animal delivery pipelines and manual cash acquisitions.</p>
            </div>
          </div>
          <button 
            id="close-order-panel"
            onClick={onClose} 
            className="p-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-500 rounded-xl transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Master-Detail Split Screen */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Master List Left */}
          <div className="w-full md:w-5/12 border-r border-zinc-200 dark:border-zinc-800 flex flex-col bg-white dark:bg-zinc-900 h-full">
            
            {/* Search and Filters */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search orders, clients, breeds..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border dark:bg-zinc-950 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:text-white"
                />
              </div>

              {/* Sub-tabs */}
              <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl text-xs font-bold text-zinc-500">
                {(['All', 'Pending', 'Paid', 'Fulfillment'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-1.5 text-center rounded-lg transition-all ${
                      activeTab === tab 
                        ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                        : 'hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Feed */}
            <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {filteredOrders.length === 0 ? (
                <div className="p-12 text-center text-zinc-400">
                  <ShoppingBag className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
                  <p className="font-bold text-xs">No customer orders found</p>
                  <p className="text-[10px] text-zinc-500 mt-1">Refine filters or wait for client bookings.</p>
                </div>
              ) : (
                filteredOrders.map(order => {
                  const isSelected = order.id === selectedOrderId;
                  return (
                    <button
                      key={order.id}
                      onClick={() => {
                        setSelectedOrderId(order.id);
                        setIsEditing(false);
                        setIsContacting(false);
                      }}
                      className={`w-full p-4 text-left flex justify-between items-start border-l-4 transition-all ${
                        isSelected 
                          ? 'bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-500' 
                          : 'border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900/40'
                      }`}
                    >
                      <div className="space-y-1 max-w-[70%]">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-zinc-800 dark:text-zinc-200">
                            {order.orderNumber}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase font-mono ${
                            order.status === 'Fulfillment' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 dark:bg-indigo-950 dark:text-indigo-400' :
                            order.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950 dark:text-emerald-400' :
                            order.status === 'Cancelled' ? 'bg-red-50 text-red-700 border border-red-100 dark:bg-red-950' :
                            'bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-950 dark:text-amber-400'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                          {order.customerName}
                        </h4>
                        <p className="text-[10px] text-zinc-500 font-mono">
                          {order.breed} • {order.packageType}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <span className="font-mono font-black text-xs text-emerald-600 dark:text-emerald-400 block">
                          ₦{order.amount.toLocaleString()}
                        </span>
                        <span className="text-[9px] text-zinc-400 block">
                          {order.date}
                        </span>
                        <span className="text-[8px] font-medium text-zinc-400 block italic truncate max-w-[100px]">
                          {order.fulfillmentStep}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Detail View Right */}
          <div className="hidden md:flex flex-col flex-1 bg-zinc-50 dark:bg-zinc-950 h-full overflow-hidden">
            {selectedOrder ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                
                {/* Scrollable content area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  
                  {/* Top Bar actions */}
                  <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-4 border rounded-2xl border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500 font-bold">Fulfillment Status:</span>
                      <select 
                        value={selectedOrder.fulfillmentStep}
                        onChange={(e) => handleUpdateStep(e.target.value as any)}
                        className="px-2.5 py-1 text-xs border rounded-lg bg-zinc-50 dark:bg-zinc-950 dark:border-zinc-800 font-bold text-zinc-800 dark:text-white"
                      >
                        {stepList.map(step => (
                          <option key={step} value={step}>{step}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => startEditing(selectedOrder)}
                        className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-850 rounded-lg text-zinc-500 hover:text-emerald-600 transition-colors"
                        title="Edit Details"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setIsContacting(true)}
                        className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-850 rounded-lg text-zinc-500 hover:text-emerald-600 transition-colors"
                        title="Contact Customer"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handlePrint}
                        className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-850 rounded-lg text-zinc-500 hover:text-emerald-600 transition-colors"
                        title="Print Summary"
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleCancelOrder}
                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-zinc-400 hover:text-red-500 transition-colors"
                        title="Cancel Order"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Print Wrapper */}
                  <div id="print-area-order" className="space-y-6">
                    {/* Invoice detail header */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="header">
                          <span className="text-[10px] font-extrabold uppercase font-mono tracking-widest text-emerald-600 dark:text-emerald-400 block">COWPLUG NG TRANSACTION DEED</span>
                          <h3 className="font-display font-black text-2xl text-zinc-950 dark:text-white mt-1 title">
                            {selectedOrder.orderNumber}
                          </h3>
                        </div>
                        <p className="text-xs text-zinc-400">Created date: {selectedOrder.date}</p>
                        
                        <div className="flex items-center gap-4 pt-2">
                          <div className="flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-300">
                            <User className="h-3.5 w-3.5 text-zinc-400" />
                            <strong>{selectedOrder.customerName}</strong>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-300">
                            <Mail className="h-3.5 w-3.5 text-zinc-400" />
                            <span>{selectedOrder.customerEmail}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-300">
                            <Phone className="h-3.5 w-3.5 text-zinc-400" />
                            <span>{selectedOrder.customerPhone}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest block">Contract Value</span>
                        <strong className="font-mono font-black text-xl text-emerald-600 dark:text-emerald-400 block mt-1">
                          ₦{selectedOrder.amount.toLocaleString()}
                        </strong>
                        <span className="text-[9px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 px-2 py-0.5 rounded font-bold uppercase mt-1 inline-block">
                          {selectedOrder.status}
                        </span>
                      </div>
                    </div>

                    {/* Order Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Livestock Specs */}
                      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-3">
                        <h4 className="font-display font-bold text-xs text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Award className="h-4 w-4 text-emerald-500" /> Animal Specifications
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-zinc-400 block">Animal Sourced</span>
                            <strong className="text-zinc-800 dark:text-zinc-200">{selectedOrder.animalType} ({selectedOrder.breed})</strong>
                          </div>
                          <div>
                            <span className="text-zinc-400 block">Program Tier</span>
                            <strong className="text-zinc-800 dark:text-zinc-200">{selectedOrder.packageType}</strong>
                          </div>
                          <div>
                            <span className="text-zinc-400 block">Transaction ID</span>
                            <strong className="text-zinc-800 dark:text-zinc-200 font-mono">{selectedOrder.invoiceId}</strong>
                          </div>
                          <div>
                            <span className="text-zinc-400 block">Operational Node</span>
                            <strong className="text-zinc-800 dark:text-zinc-200">Oyo Node #2</strong>
                          </div>
                        </div>
                      </div>

                      {/* Payment Proof */}
                      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-3">
                        <h4 className="font-display font-bold text-xs text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                          <DollarSign className="h-4 w-4 text-emerald-500" /> Payment & Settlement Info
                        </h4>
                        {selectedOrder.bankPaidInto ? (
                          <div className="space-y-2 text-xs">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <span className="text-zinc-400 block">Bank Settle Node</span>
                                <strong className="text-zinc-800 dark:text-zinc-200">{selectedOrder.bankPaidInto}</strong>
                              </div>
                              <div>
                                <span className="text-zinc-400 block">Reference</span>
                                <strong className="text-zinc-800 dark:text-zinc-200 font-mono">{selectedOrder.transactionReference || 'N/A'}</strong>
                              </div>
                            </div>
                            {selectedOrder.uploadedReceipt && (
                              <button
                                onClick={() => setZoomReceipt(selectedOrder.uploadedReceipt)}
                                className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold underline flex items-center gap-1 cursor-pointer"
                              >
                                🔎 Inspect Uploaded Receipt
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-zinc-400 flex items-center gap-1.5 h-12">
                            <Info className="h-4 w-4 text-amber-500" />
                            <span>Awaiting manual bank payment proof from client.</span>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>

                  {/* Multi-step Visual Tracker */}
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
                    <h4 className="font-display font-bold text-xs text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-emerald-500" /> Pipeline Progress Tracker
                    </h4>

                    {/* Vertical checklist */}
                    <div className="relative pl-6 space-y-6 border-l border-zinc-150 dark:border-zinc-800 ml-3 text-xs pt-1">
                      {[
                        { step: 'Animal Selected', desc: 'Livestock selected from range stock catalog' },
                        { step: 'Invoice Generated', desc: 'Secure banking receipt dispatched' },
                        { step: 'Receipt Uploaded', desc: 'Bank remittance docket uploaded' },
                        { step: 'Payment Verified', desc: 'Cleared and approved by billing department' },
                        { step: 'Preparing Animal', desc: 'Biometric RFID chip and weight profiling' },
                        { step: 'Veterinary Inspection', desc: 'Diagnostic health screening and vaccination' },
                        { step: 'Ready for Transportation', desc: 'Cleared and assigned to Cold Logistics Partner' },
                        { step: 'In Transit', desc: 'Dispatched to target hub point' },
                        { step: 'Delivered', desc: 'Signed receipt uploaded and payment settled' }
                      ].map((item, idx) => {
                        const currentIdx = stepList.indexOf(selectedOrder.fulfillmentStep);
                        const itemIdx = stepList.indexOf(item.step as any);
                        const isCompleted = itemIdx <= currentIdx;
                        const isCurrent = item.step === selectedOrder.fulfillmentStep;

                        return (
                          <div key={item.step} className="relative">
                            {/* Dot */}
                            <span className={`absolute -left-[31px] top-0.5 h-4.5 w-4.5 rounded-full flex items-center justify-center border-2 transition-all ${
                              isCompleted 
                                ? 'bg-emerald-600 border-emerald-600 text-white' 
                                : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400'
                            }`}>
                              {isCompleted ? <Check className="h-2.5 w-2.5 stroke-[3]" /> : <span className="h-1 w-1 bg-zinc-300 dark:bg-zinc-700 rounded-full" />}
                            </span>

                            {/* Content */}
                            <div>
                              <strong className={`font-semibold block ${
                                isCurrent ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' : 
                                isCompleted ? 'text-zinc-800 dark:text-zinc-200' : 'text-zinc-400'
                              }`}>
                                {item.step}
                              </strong>
                              <p className="text-[10px] text-zinc-400">{item.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Manual Approval Actions Block (if paid but awaiting verification) */}
                  {selectedOrder.status === 'Paid' && selectedOrder.fulfillmentStep === 'Awaiting Verification' && (
                    <div className="p-5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
                          <strong className="text-xs text-amber-800 dark:text-amber-400 font-bold uppercase tracking-wider">Manual Verification Action Required</strong>
                        </div>
                        <p className="text-[10px] text-zinc-500">Please audit the manual bank payment proof receipt before clearing and funding this transaction.</p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={handleApproveOrder}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                        >
                          Approve Payment
                        </button>
                        <button
                          onClick={handleRejectOrder}
                          className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center items-center text-zinc-400 p-8">
                <ShoppingBag className="h-12 w-12 text-zinc-200 dark:text-zinc-800 mb-2" />
                <h3 className="font-bold text-sm">No Order Selected</h3>
                <p className="text-xs text-zinc-500 mt-1">Select an active customer order from the sidebar feed to audit telemetry and pipeline status.</p>
              </div>
            )}
          </div>

        </div>
      </motion.div>

      {/* Edit Form Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditing(false)} className="fixed inset-0 bg-zinc-950/50" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-zinc-900 border rounded-3xl p-6 relative z-10 w-full max-w-md shadow-2xl space-y-4">
              <h3 className="font-display font-extrabold text-md text-zinc-900 dark:text-white">Modify Order Details</h3>
              
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Customer Full Name</label>
                  <input 
                    type="text" 
                    value={editForm.customerName || ''} 
                    onChange={e => setEditForm({ ...editForm, customerName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:text-white font-sans" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Customer Phone</label>
                  <input 
                    type="text" 
                    value={editForm.customerPhone || ''} 
                    onChange={e => setEditForm({ ...editForm, customerPhone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:text-white" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Sourced Breed</label>
                  <input 
                    type="text" 
                    value={editForm.breed || ''} 
                    onChange={e => setEditForm({ ...editForm, breed: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:text-white" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Order Price Value (₦)</label>
                  <input 
                    type="number" 
                    value={editForm.amount || 0} 
                    onChange={e => setEditForm({ ...editForm, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:text-white font-mono" 
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2 text-xs">
                <button onClick={() => setIsEditing(false)} className="px-3.5 py-1.5 border rounded-xl dark:border-zinc-800 font-semibold dark:text-white">
                  Cancel
                </button>
                <button onClick={saveEdit} className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors">
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Contact Form Modal */}
      <AnimatePresence>
        {isContacting && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsContacting(false)} className="fixed inset-0 bg-zinc-950/50" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-zinc-900 border rounded-3xl p-6 relative z-10 w-full max-w-md shadow-2xl space-y-4">
              <div>
                <h3 className="font-display font-extrabold text-md text-zinc-900 dark:text-white">Contact {selectedOrder?.customerName}</h3>
                <p className="text-[10px] text-zinc-400">Dispatch dynamic SMS & Email notifications concerning progress updates.</p>
              </div>
              
              <form onSubmit={handleSendContactMessage} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Notification Message</label>
                  <textarea 
                    rows={4}
                    value={contactMessage}
                    onChange={e => setContactMessage(e.target.value)}
                    placeholder="e.g., Dear Babajide, your Red Sokoto has passed the veterinary isolation audit successfully..."
                    className="w-full px-3 py-2 border rounded-xl dark:bg-zinc-950 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:text-white resize-none" 
                    required
                  />
                </div>

                <div className="flex gap-2 justify-end text-xs">
                  <button type="button" onClick={() => setIsContacting(false)} className="px-3.5 py-1.5 border rounded-xl dark:border-zinc-800 font-semibold dark:text-white">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors">
                    Dispatch Alert
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Zoom Receipt Image Modal */}
      <AnimatePresence>
        {zoomReceipt && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setZoomReceipt(null)} className="fixed inset-0 bg-zinc-950/90 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative z-10 max-w-3xl w-full flex flex-col items-center">
              <button 
                onClick={() => setZoomReceipt(null)} 
                className="absolute -top-12 right-0 p-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-full border border-zinc-800 shadow-xl cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
              <img src={zoomReceipt} alt="Payment Receipt" className="max-h-[80vh] object-contain rounded-2xl shadow-2xl border dark:border-zinc-800 bg-white" />
              
              <div className="flex gap-3 mt-4 text-xs">
                <a 
                  href={zoomReceipt} 
                  download={`COWPLUG_RECEIPT_${selectedOrder?.orderNumber}`}
                  onClick={() => onAddAuditLog('Document Downloaded', `Downloaded proof of payment receipt for Order ${selectedOrder?.orderNumber}`, 'success')}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xl"
                  referrerPolicy="no-referrer"
                >
                  Download Receipt
                </a>
                <button 
                  onClick={() => {
                    alert('Simulating receipt scale/zoom configuration reset!');
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xl"
                >
                  Zoom Reset
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
