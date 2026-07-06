import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Search, Bell, CheckCheck, Eye, Trash2, Shield, 
  Wallet, ShoppingCart, User, HelpCircle, HeartPulse, ShieldAlert,
  ArrowRight, ExternalLink, Calendar, Check, AlertTriangle, AlertCircle
} from 'lucide-react';

export interface AdminNotification {
  id: string;
  category: 'User Activity' | 'Payments' | 'Livestock' | 'Orders' | 'Security';
  title: string;
  message: string;
  date: string;
  read: boolean;
  severity: 'info' | 'success' | 'warning' | 'danger';
  metadata?: Record<string, any>;
}

interface AdminNotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AdminNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDeleteNotif: (id: string) => void;
  onOpenTab: (tabId: string) => void;
}

export const AdminNotificationCenterModal: React.FC<AdminNotificationCenterModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead,
  onDeleteNotif,
  onOpenTab
}) => {
  const [activeCategory, setActiveCategory] = useState<'All' | AdminNotification['category']>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotifId, setSelectedNotifId] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories: ('All' | AdminNotification['category'])[] = [
    'All', 'User Activity', 'Payments', 'Livestock', 'Orders', 'Security'
  ];

  const getCategoryIcon = (category: AdminNotification['category']) => {
    switch (category) {
      case 'User Activity':
        return <User className="h-4 w-4" />;
      case 'Payments':
        return <Wallet className="h-4 w-4" />;
      case 'Livestock':
        return <HeartPulse className="h-4 w-4" />;
      case 'Orders':
        return <ShoppingCart className="h-4 w-4" />;
      case 'Security':
        return <ShieldAlert className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getCategoryStyles = (category: AdminNotification['category']) => {
    switch (category) {
      case 'User Activity':
        return 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-900/30';
      case 'Payments':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-900/30';
      case 'Livestock':
        return 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950 dark:text-purple-400 dark:border-purple-900/30';
      case 'Orders':
        return 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950 dark:text-indigo-400 dark:border-indigo-900/30';
      case 'Security':
        return 'bg-red-50 text-red-700 border-red-100 dark:bg-red-950 dark:text-red-400 dark:border-red-900/30';
      default:
        return 'bg-zinc-50 text-zinc-700 border-zinc-100 dark:bg-zinc-950 dark:text-zinc-400 dark:border-zinc-900/30';
    }
  };

  const getSeverityBadge = (severity: AdminNotification['severity']) => {
    switch (severity) {
      case 'success':
        return <span className="h-2 w-2 rounded-full bg-emerald-500 block" />;
      case 'warning':
        return <span className="h-2 w-2 rounded-full bg-amber-500 block animate-pulse" />;
      case 'danger':
        return <span className="h-2 w-2 rounded-full bg-red-500 block animate-ping" />;
      default:
        return <span className="h-2 w-2 rounded-full bg-blue-500 block" />;
    }
  };

  const filteredNotifs = notifications.filter(notif => {
    if (activeCategory !== 'All' && notif.category !== activeCategory) return false;
    
    const matchesSearch = 
      notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const selectedNotif = notifications.find(n => n.id === selectedNotifId);

  const handleAction = (notif: AdminNotification) => {
    setSelectedNotifId(null);
    onClose();
    
    // Map categories to dashboard tabs
    if (notif.category === 'Payments') {
      onOpenTab('invoices');
    } else if (notif.category === 'User Activity') {
      onOpenTab('customers');
    } else if (notif.category === 'Livestock') {
      onOpenTab('livestock');
    } else if (notif.category === 'Orders') {
      onOpenTab('meat-orders');
    } else if (notif.category === 'Security') {
      onOpenTab('audit');
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

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

      {/* Side-drawer */}
      <motion.div 
        initial={{ x: '100%' }} 
        animate={{ x: 0 }} 
        exit={{ x: '100%' }} 
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="relative bg-zinc-50 dark:bg-zinc-950 w-full max-w-lg h-full shadow-2xl flex flex-col z-10 md:rounded-l-3xl border-l border-zinc-200 dark:border-zinc-800"
      >
        {/* Header */}
        <div className="p-6 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-600 dark:text-emerald-400">
                <Bell className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-display font-black text-lg text-zinc-900 dark:text-white">Notification Command Center</h2>
                <p className="text-xs text-zinc-400">Real-time telemetry and platform lifecycle events.</p>
              </div>
            </div>
            <button 
              id="close-notifications-panel"
              onClick={onClose} 
              className="p-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-500 rounded-xl transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick actions bar */}
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-zinc-500">
              {unreadCount} unread triggers pending
            </span>
            {unreadCount > 0 && (
              <button 
                onClick={onMarkAllRead}
                className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="h-4 w-4" /> Mark all as read
              </button>
            )}
          </div>
        </div>

        {/* Categories list and Search */}
        <div className="p-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search event triggers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border dark:bg-zinc-950 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:text-white"
            />
          </div>

          {/* Category Pills (horizontal scroll) */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin text-xs font-semibold select-none">
            {categories.map(cat => {
              const isSelected = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all border ${
                    isSelected 
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' 
                      : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-850 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notifications Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredNotifs.length === 0 ? (
            <div className="p-12 text-center text-zinc-400">
              <Bell className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
              <p className="font-bold text-xs">No notifications found</p>
              <p className="text-[10px] text-zinc-500 mt-1">Check back later for system event captures.</p>
            </div>
          ) : (
            filteredNotifs.map(notif => (
              <div 
                key={notif.id}
                onClick={() => {
                  setSelectedNotifId(notif.id);
                  if (!notif.read) onMarkRead(notif.id);
                }}
                className={`p-4 border rounded-2xl text-xs relative flex gap-3.5 items-start cursor-pointer hover:shadow-xs transition-all ${
                  notif.read 
                    ? 'bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-850 text-zinc-500' 
                    : 'bg-white dark:bg-zinc-900 border-emerald-500/30 shadow-xs ring-1 ring-emerald-500/10'
                }`}
              >
                {/* Visual indicators */}
                <div className={`p-2 rounded-xl border flex-shrink-0 ${getCategoryStyles(notif.category)}`}>
                  {getCategoryIcon(notif.category)}
                </div>

                {/* Content */}
                <div className="space-y-1.5 flex-1 pr-4 min-w-0">
                  <div className="flex justify-between items-start gap-1">
                    <span className="text-[10px] font-extrabold uppercase font-mono tracking-wider text-zinc-400">
                      {notif.category}
                    </span>
                    <span className="text-[9px] text-zinc-400 font-mono flex items-center gap-1">
                      {getSeverityBadge(notif.severity)}
                      {new Date(notif.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h4 className={`font-bold truncate ${notif.read ? 'text-zinc-700 dark:text-zinc-300' : 'text-zinc-950 dark:text-white'}`}>
                    {notif.title}
                  </h4>
                  <p className="text-[11px] leading-relaxed text-zinc-400 dark:text-zinc-400 line-clamp-2">
                    {notif.message}
                  </p>
                  <div className="pt-2 flex">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!notif.read) onMarkRead(notif.id);
                        handleAction(notif);
                      }}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 font-extrabold font-mono text-[9px] rounded-lg flex items-center gap-1 transition-all cursor-pointer z-10"
                    >
                      <Eye className="h-3 w-3" /> View Record
                    </button>
                  </div>
                </div>

                {/* Right edge unread indicator */}
                {!notif.read && (
                  <span className="absolute top-4 right-4 h-2 w-2 rounded-full bg-emerald-500" />
                )}
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Detailed notification popup */}
      <AnimatePresence>
        {selectedNotif && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setSelectedNotifId(null)} 
              className="fixed inset-0 bg-zinc-950/50 backdrop-blur-xs" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-white dark:bg-zinc-900 border rounded-3xl p-6 relative z-10 w-full max-w-md shadow-2xl space-y-5"
            >
              <button 
                onClick={() => setSelectedNotifId(null)} 
                className="absolute top-4 right-4 p-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 rounded-xl text-zinc-500"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-start gap-3.5 border-b pb-4">
                <div className={`p-2.5 rounded-xl border ${getCategoryStyles(selectedNotif.category)}`}>
                  {getCategoryIcon(selectedNotif.category)}
                </div>
                <div>
                  <span className="text-[9px] font-extrabold uppercase font-mono tracking-wider text-zinc-400 block">
                    Telemetry Dispatch • {selectedNotif.category}
                  </span>
                  <h3 className="font-display font-black text-md text-zinc-950 dark:text-white mt-0.5">
                    {selectedNotif.title}
                  </h3>
                  <span className="text-[9px] font-mono text-zinc-400 mt-1 block">
                    {new Date(selectedNotif.date).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border dark:border-zinc-850 rounded-2xl text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {selectedNotif.message}
                </div>

                {selectedNotif.metadata && (
                  <div className="bg-zinc-50 dark:bg-zinc-950 p-3.5 rounded-2xl border text-[10px] font-mono space-y-1">
                    <span className="text-zinc-400 font-bold uppercase block tracking-wider mb-1.5">Event Metadata:</span>
                    {Object.entries(selectedNotif.metadata).map(([key, val]) => (
                      <div key={key} className="flex justify-between border-b border-dashed border-zinc-200 dark:border-zinc-900 py-1">
                        <span className="text-zinc-400">{key}:</span>
                        <strong className="text-zinc-700 dark:text-zinc-300">{String(val)}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-end text-xs">
                <button 
                  onClick={() => {
                    onDeleteNotif(selectedNotif.id);
                    setSelectedNotifId(null);
                  }}
                  className="px-3.5 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-950/20 font-semibold rounded-xl flex items-center gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete Dispatch
                </button>
                <button 
                  onClick={() => handleAction(selectedNotif)}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  View & Manage Endpoint <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
