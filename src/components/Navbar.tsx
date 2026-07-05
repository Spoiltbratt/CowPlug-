import { useState } from 'react';
import { 
  Menu, 
  X, 
  Bell, 
  ShoppingBag, 
  Sun, 
  Moon, 
  User, 
  TrendingUp, 
  ChevronDown, 
  LogOut,
  Home,
  Heart,
  Package,
  Settings,
  Info,
  Phone,
  PlusCircle,
  Truck,
  Wallet,
  BookOpen,
  Utensils,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppNotification, User as UserType } from '../types';
import { db } from '../firebase';
import { seedUserIfMissing } from '../db/sync';
import { INITIAL_NOTIFICATIONS } from '../data';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface NavbarProps {
  activeSection: string;
  setActiveSection: (sec: string) => void;
  currentUser: UserType | null;
  setCurrentUser: (user: UserType | null) => void;
  onOpenAuth: (mode?: 'login' | 'register-choose') => void;
  notifications: AppNotification[];
  onMarkNotificationsRead: () => void;
  cartCount: number;
  onOpenCart: () => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  dashboardTab?: string;
  onSelectDashboardTab?: (tab: string) => void;
  experienceMode?: 'lite' | 'pro';
  setExperienceMode?: (mode: 'lite' | 'pro') => void;
  liteActiveTab?: string;
  setLiteActiveTab?: (tab: any) => void;
  onOpenAdminNotifs?: () => void;
  onOpenAdminOrders?: () => void;
}

const NAV_PRESET_USERS: Record<'investor' | 'farmer' | 'admin', UserType> = {
  investor: {
    id: 'user-investor-bashir',
    email: 'bashir@yusuf-holdings.com',
    fullName: 'Alhaji Bashir Yusuf',
    role: 'investor',
    phone: '+234 803 111 2222',
    balance: 4500000,
    investmentsCount: 3,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
  },
  farmer: {
    id: 'user-farmer-musa',
    email: 'musa.farm@cowplug.ng',
    fullName: 'Musa Ibrahim',
    role: 'farmer',
    phone: '+234 802 333 4444',
    balance: 240000,
    investmentsCount: 0,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
  },
  admin: {
    id: 'user-admin-amina',
    email: 'amina.bello@cowplug.ng',
    fullName: 'Dr. Amina Bello',
    role: 'admin',
    phone: '+234 809 999 8888',
    balance: 0,
    investmentsCount: 0,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
  },
};

export default function Navbar({
  activeSection,
  setActiveSection,
  currentUser,
  setCurrentUser,
  onOpenAuth,
  notifications,
  onMarkNotificationsRead,
  cartCount,
  onOpenCart,
  darkMode,
  setDarkMode,
  dashboardTab = 'dashboard',
  onSelectDashboardTab,
  experienceMode = 'pro',
  setExperienceMode,
  liteActiveTab = 'home',
  setLiteActiveTab,
  onOpenAdminNotifs,
  onOpenAdminOrders,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // States for Mobile / Quick Sign-In Box
  const [signInEmail, setSignInEmail] = useState('bashir@yusuf-holdings.com');
  const [signInPassword, setSignInPassword] = useState('password123');
  const [signInError, setSignInError] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleNavSignIn = async (email: string) => {
    setIsSigningIn(true);
    setSignInError('');
    try {
      const trimmedEmail = email.trim().toLowerCase();
      let matchedUser: UserType | null = null;
      if (trimmedEmail === 'bashir@yusuf-holdings.com') {
        matchedUser = NAV_PRESET_USERS.investor;
      } else if (trimmedEmail === 'musa.farm@cowplug.ng') {
        matchedUser = NAV_PRESET_USERS.farmer;
      } else if (trimmedEmail === 'amina.bello@cowplug.ng') {
        matchedUser = NAV_PRESET_USERS.admin;
      } else {
        const q = query(collection(db, 'users'), where('email', '==', trimmedEmail));
        const snap = await getDocs(q);
        if (!snap.empty) {
          matchedUser = snap.docs[0].data() as UserType;
        }
      }

      if (matchedUser) {
        await seedUserIfMissing(matchedUser, [], [], INITIAL_NOTIFICATIONS);
        setCurrentUser(matchedUser);
        if (experienceMode === 'lite') {
          setLiteActiveTab?.('home');
        } else {
          setActiveSection('dashboard');
          onSelectDashboardTab?.(matchedUser.role === 'admin' ? 'overview' : 'dashboard');
        }
      } else {
        setSignInError('Account not found. Use a preset email.');
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      setSignInError('Failed to sign in. Please try again.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const guestNavItems = [
    { name: 'Home', id: 'home' },
    { name: 'About', id: 'about' },
    { name: 'Marketplace', id: 'marketplace' },
    { name: 'Meat Supply', id: 'meatsupply' },
    { name: 'Blog & FAQ', id: 'blog-faq' },
    { name: 'Contact', id: 'contact' },
  ];

  const loggedInNavItems = [
    { name: 'Dashboard', id: 'dashboard' },
    { name: 'My Livestock', id: 'my-livestock' },
    { name: 'Marketplace', id: 'marketplace' },
    { name: 'Orders', id: 'orders' },
    { name: 'Notifications', id: 'notifications' },
    { name: 'Profile', id: 'profile' },
    { name: 'Settings', id: 'settings' },
    { name: 'Logout', id: 'logout' },
  ];

  const navItems = currentUser ? loggedInNavItems : guestNavItems;

  const isNavItemActive = (itemId: string) => {
    if (!currentUser) {
      return activeSection === itemId;
    }
    if (itemId === 'logout') {
      return false;
    }
    if (itemId === 'marketplace') {
      return activeSection === 'marketplace';
    }
    if (itemId === 'dashboard') {
      return activeSection === 'dashboard' && (dashboardTab === 'dashboard' || dashboardTab === 'overview');
    }
    if (itemId === 'my-livestock') {
      return activeSection === 'dashboard' && (dashboardTab === 'my-livestock' || dashboardTab === 'my-listings' || dashboardTab === 'livestock');
    }
    if (itemId === 'orders') {
      return activeSection === 'dashboard' && (dashboardTab === 'delivery-requests' || dashboardTab === 'orders' || dashboardTab === 'meat-orders');
    }
    if (itemId === 'notifications') {
      return activeSection === 'dashboard' && dashboardTab === 'notifications';
    }
    if (itemId === 'profile') {
      return activeSection === 'dashboard' && (dashboardTab === 'profile' || dashboardTab === 'staff');
    }
    if (itemId === 'settings') {
      return activeSection === 'dashboard' && dashboardTab === 'settings';
    }
    return activeSection === itemId;
  };

  const handleNavClick = (id: string) => {
    if (id === 'logout') {
      setCurrentUser(null);
      setActiveSection('home');
      setMobileMenuOpen(false);
      return;
    }

    if (currentUser) {
      if (id === 'marketplace') {
        setActiveSection('marketplace');
      } else if (id === 'home') {
        setActiveSection('dashboard');
        if (onSelectDashboardTab) {
          onSelectDashboardTab(currentUser.role === 'admin' ? 'overview' : 'dashboard');
        }
      } else {
        setActiveSection('dashboard');
        if (onSelectDashboardTab) {
          if (id === 'dashboard') {
            onSelectDashboardTab(currentUser.role === 'admin' ? 'overview' : 'dashboard');
          } else if (id === 'my-livestock') {
            onSelectDashboardTab(currentUser.role === 'admin' ? 'livestock' : currentUser.role === 'farmer' ? 'my-listings' : 'my-livestock');
          } else if (id === 'orders') {
            onSelectDashboardTab(currentUser.role === 'admin' ? 'meat-orders' : currentUser.role === 'farmer' ? 'orders' : 'delivery-requests');
          } else if (id === 'notifications') {
            onSelectDashboardTab('notifications');
          } else if (id === 'profile') {
            onSelectDashboardTab(currentUser.role === 'admin' ? 'staff' : 'profile');
          } else if (id === 'settings') {
            onSelectDashboardTab('settings');
          }
        }
      }
    } else {
      setActiveSection(id);
    }
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => handleNavClick('home')}>
            <div className="h-11 w-11 rounded-xl bg-emerald-600 dark:bg-emerald-700 flex items-center justify-center text-white mr-3 shadow-md shadow-emerald-600/20">
              <TrendingUp className="h-6 w-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-display font-bold text-2xl tracking-tight text-zinc-900 dark:text-white flex items-center">
                Cow<span className="text-emerald-600 dark:text-emerald-400">Plug</span>
                <span className="text-amber-500 font-extrabold text-lg ml-0.5">NG</span>
              </span>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono tracking-widest uppercase -mt-1 font-bold">
                {currentUser ? 'Workspace' : 'Livestock Management'}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex space-x-1 xl:space-x-2">
            {!currentUser && navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isNavItemActive(item.id)
                    ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 font-semibold'
                    : 'text-zinc-600 hover:text-emerald-600 dark:text-zinc-300 dark:hover:text-emerald-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/60'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* Action Buttons, Dark Mode, Cart & Auth */}
          <div className="hidden md:flex items-center space-x-4">
            
            {currentUser?.role === 'admin' ? (
              <>
                {/* Admin Order Center (Cart Icon) */}
                <button
                  id="navbar-admin-order-center"
                  onClick={onOpenAdminOrders}
                  className="relative p-2 rounded-lg text-zinc-500 hover:text-emerald-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-emerald-400 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                  title="Order Management Center"
                >
                  <ShoppingBag className="h-5 w-5" />
                  <span className="absolute top-1 right-1 h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></span>
                </button>

                {/* Admin Notification Center (Bell Icon) */}
                <button
                  id="navbar-admin-notification-center"
                  onClick={onOpenAdminNotifs}
                  className="relative p-2 rounded-lg text-zinc-500 hover:text-emerald-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-emerald-400 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                  title="Real-Time Admin Notifications"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></span>
                </button>
              </>
            ) : (
              <>
                {/* Search Input (optional) */}
                {currentUser && (
                  <div className="relative hidden lg:block w-32 xl:w-48 transition-all duration-300">
                    <input
                      type="text"
                      placeholder="Search workspace..."
                      className="w-full text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-3 pr-8 py-2 text-zinc-700 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                      onChange={(e) => {
                        // Placeholder search feedback
                      }}
                    />
                    <span className="absolute right-3 top-2.5 text-[10px] text-zinc-400 font-mono select-none">⌘K</span>
                  </div>
                )}


                {/* Shopping Cart Trigger */}
                <button
                  onClick={onOpenCart}
                  className="relative p-2 rounded-lg text-zinc-500 hover:text-emerald-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-emerald-400 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                >
                  <ShoppingBag className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute top-1 right-1 h-4 w-4 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                      {cartCount}
                    </span>
                  )}
                </button>

                {/* Notifications Trigger */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setNotifDropdownOpen(!notifDropdownOpen);
                      if (!notifDropdownOpen) onMarkNotificationsRead();
                    }}
                    className="relative p-2 rounded-lg text-zinc-500 hover:text-emerald-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-emerald-400 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                    title="Notifications"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    )}
                  </button>

                  <AnimatePresence>
                    {notifDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setNotifDropdownOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 15 }}
                          className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 py-2 z-50"
                        >
                          <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                            <span className="font-display font-semibold text-zinc-800 dark:text-white">Workspace Alerts</span>
                            <span className="text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                              {unreadCount} New
                            </span>
                          </div>
                          <div className="max-h-72 overflow-y-auto">
                            {notifications.length === 0 ? (
                              <div className="p-4 text-center text-sm text-zinc-500 dark:text-zinc-400">No alerts right now</div>
                            ) : (
                              notifications.map((n) => (
                                <div key={n.id} className="p-3 border-b border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                                  <div className="flex items-start">
                                    <span className="text-xl mr-2">
                                      {n.type === 'vaccination' ? '💉' : n.type === 'feed' ? '🌾' : n.type === 'drug' ? '💊' : '🐄'}
                                    </span>
                                    <div>
                                      <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{n.title}</h4>
                                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">{n.message}</p>
                                      <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono mt-1 block">
                                        {new Date(n.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                          <div className="p-2 border-t border-zinc-100 dark:border-zinc-800 text-center">
                            <button
                              onClick={() => {
                                setNotifDropdownOpen(false);
                                if (experienceMode === 'lite') {
                                  setLiteActiveTab?.('profile');
                                } else {
                                  setActiveSection('dashboard');
                                  onSelectDashboardTab?.('notifications');
                                }
                              }}
                              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-350 transition-colors w-full py-1.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-850 cursor-pointer"
                            >
                              More Alerts & Notifications
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
            {/* Authenticated / Guest Actions */}
            <div className="relative">
              {currentUser ? (
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="h-10 w-10 rounded-full overflow-hidden border-2 border-emerald-500 hover:border-emerald-600 focus:outline-none transition-all shadow-sm shrink-0 flex items-center justify-center bg-zinc-100 dark:bg-zinc-850 cursor-pointer"
                  title="User Profile Menu"
                >
                  {currentUser.avatar ? (
                    <img 
                      src={currentUser.avatar} 
                      alt={currentUser.fullName} 
                      className="h-full w-full object-cover" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                      {currentUser.fullName.split(' ').map(n => n[0]).join('')}
                    </div>
                  )}
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="px-4 py-2 text-xs font-black bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 border border-emerald-100/60 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 shadow-xs"
                    id="desktop-signin-trigger"
                    title="Sign In / Options Menu"
                  >
                    <User className="h-3.5 w-3.5" />
                    <span>Access Portal</span>
                    <ChevronDown className="h-3 w-3 opacity-60" />
                  </button>
                  <button
                    onClick={() => onOpenAuth('register-choose')}
                    className="px-4 py-2 text-xs font-black bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800 text-white rounded-xl shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/20 transition-all cursor-pointer"
                  >
                    Sign Up
                  </button>
                </div>
              )}

              <AnimatePresence>
                {userDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserDropdownOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`absolute right-0 mt-2 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-850 py-3 z-50 overflow-hidden ${
                        currentUser ? 'w-60' : 'w-80 px-4'
                      }`}
                    >
                      {currentUser ? (
                        /* LOGGED IN USER DROPDOWN CONTENT */
                        <>
                          <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800">
                            <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">Workspace Account</p>
                            <p className="text-xs font-extrabold text-zinc-800 dark:text-white truncate">{currentUser.fullName}</p>
                            <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mt-0.5">{currentUser.role}</p>
                          </div>
                          
                          {/* Experience Switcher inside the menu dropdown */}
                          {setExperienceMode && (
                            <div className="p-2.5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20">
                              <span className="text-[8px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1">App Experience</span>
                              <div className="bg-zinc-100 dark:bg-zinc-950 p-0.5 rounded-lg flex items-center border border-zinc-150 dark:border-zinc-850">
                                <button
                                  onClick={() => {
                                    setExperienceMode('lite');
                                    setUserDropdownOpen(false);
                                  }}
                                  className={`flex-1 py-1 text-[9px] font-bold rounded-md transition-all cursor-pointer flex items-center justify-center ${
                                    experienceMode === 'lite'
                                      ? 'bg-emerald-600 text-white shadow-xs'
                                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-750'
                                  }`}
                                >
                                  <span>Lite</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setExperienceMode('pro');
                                    setUserDropdownOpen(false);
                                  }}
                                  className={`flex-1 py-1 text-[9px] font-bold rounded-md transition-all cursor-pointer flex items-center justify-center ${
                                    experienceMode === 'pro'
                                      ? 'bg-emerald-600 text-white shadow-xs'
                                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-750'
                                  }`}
                                >
                                  <span>Pro</span>
                                </button>
                              </div>
                            </div>
                          )}

                          <div className="py-1">
                            {currentUser.role === 'admin' ? (
                              <button
                                id="admin-sign-out"
                                onClick={() => {
                                  setCurrentUser(null);
                                  setUserDropdownOpen(false);
                                  if (experienceMode === 'lite') {
                                    setLiteActiveTab?.('home');
                                  } else {
                                    setActiveSection('home');
                                  }
                                }}
                                className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 transition-colors flex items-center cursor-pointer"
                              >
                                <LogOut className="h-4 w-4 mr-2.5" /> Sign Out
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    if (experienceMode === 'lite') {
                                      setLiteActiveTab?.('profile');
                                    } else {
                                      setActiveSection('dashboard');
                                      onSelectDashboardTab?.(currentUser.role === 'admin' ? 'staff' : 'profile');
                                    }
                                    setUserDropdownOpen(false);
                                  }}
                                  className="w-full text-left px-4 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors flex items-center cursor-pointer"
                                >
                                  <User className="h-4 w-4 mr-2.5 text-zinc-400" /> My Profile
                                </button>

                                <button
                                  onClick={() => {
                                    if (experienceMode === 'lite') {
                                      setLiteActiveTab?.('profile');
                                    } else {
                                      setActiveSection('dashboard');
                                      onSelectDashboardTab?.('settings');
                                    }
                                    setUserDropdownOpen(false);
                                  }}
                                  className="w-full text-left px-4 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors flex items-center cursor-pointer"
                                >
                                  <Settings className="h-4 w-4 mr-2.5 text-zinc-400" /> Account Settings
                                </button>

                                <button
                                  onClick={() => {
                                    if (experienceMode === 'lite') {
                                      setLiteActiveTab?.('profile');
                                    } else {
                                      setActiveSection('dashboard');
                                      onSelectDashboardTab?.('settings');
                                    }
                                    setUserDropdownOpen(false);
                                  }}
                                  className="w-full text-left px-4 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors flex items-center cursor-pointer"
                                >
                                  <Lock className="h-4 w-4 mr-2.5 text-zinc-400" /> Security
                                </button>

                                <button
                                  onClick={() => {
                                    if (experienceMode === 'lite') {
                                      setLiteActiveTab?.('profile');
                                    } else {
                                      setActiveSection('dashboard');
                                      onSelectDashboardTab?.('dashboard');
                                    }
                                    setUserDropdownOpen(false);
                                  }}
                                  className="w-full text-left px-4 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors flex items-center cursor-pointer"
                                >
                                  <Info className="h-4 w-4 mr-2.5 text-zinc-400" /> Help & Support
                                </button>

                                <button
                                  onClick={() => {
                                    setCurrentUser(null);
                                    setUserDropdownOpen(false);
                                    if (experienceMode === 'lite') {
                                      setLiteActiveTab?.('home');
                                    } else {
                                      setActiveSection('home');
                                    }
                                  }}
                                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 transition-colors flex items-center border-t border-zinc-100 dark:border-zinc-800 mt-1 pt-2 cursor-pointer"
                                >
                                  <LogOut className="h-4 w-4 mr-2.5" /> Sign Out
                                </button>
                              </>
                            )}
                          </div>
                        </>
                      ) : (
                        /* GUEST USER/AUTH DROPDOWN CONTENT */
                        <>
                          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800 mb-3">
                            <div>
                              <h4 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">Access Portal</h4>
                              <p className="text-[9px] text-zinc-500 dark:text-zinc-400 font-medium">Select a demo account or sign in below</p>
                            </div>
                            <button
                              onClick={() => setUserDropdownOpen(false)}
                              className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          {/* Experience Switcher inside the menu dropdown for Guest */}
                          {setExperienceMode && (
                            <div className="mb-3.5">
                              <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1">App Experience</span>
                              <div className="bg-zinc-50 dark:bg-zinc-950 p-0.5 rounded-xl flex items-center border border-zinc-150 dark:border-zinc-850 shadow-inner">
                                <button
                                  onClick={() => setExperienceMode('lite')}
                                  className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                                    experienceMode === 'lite'
                                      ? 'bg-emerald-600 text-white shadow-xs'
                                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700'
                                  }`}
                                >
                                  <span>Lite Mode</span>
                                </button>
                                <button
                                  onClick={() => setExperienceMode('pro')}
                                  className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                                    experienceMode === 'pro'
                                      ? 'bg-emerald-600 text-white shadow-xs'
                                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700'
                                  }`}
                                >
                                  <span>Pro Mode</span>
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Quick Preset Accounts */}
                          <div className="space-y-1.5 mb-3.5">
                            <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Quick Demo Logins</span>
                            
                            {/* Bashir - Investor */}
                            <button
                              onClick={() => {
                                handleNavSignIn('bashir@yusuf-holdings.com');
                                setUserDropdownOpen(false);
                              }}
                              disabled={isSigningIn}
                              className="w-full flex items-center p-2 rounded-xl border border-zinc-150 dark:border-zinc-800/85 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/10 text-left transition-all group cursor-pointer"
                            >
                              <div className="h-7 w-7 rounded-lg overflow-hidden border border-emerald-500/30 shrink-0 mr-2.5">
                                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100" alt="Bashir" className="h-full w-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-extrabold text-zinc-800 dark:text-zinc-200 truncate leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400">Alhaji Bashir Yusuf</p>
                                <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-medium font-mono">Investor Account</p>
                              </div>
                            </button>

                            {/* Musa - Farmer */}
                            <button
                              onClick={() => {
                                handleNavSignIn('musa.farm@cowplug.ng');
                                setUserDropdownOpen(false);
                              }}
                              disabled={isSigningIn}
                              className="w-full flex items-center p-2 rounded-xl border border-zinc-150 dark:border-zinc-800/85 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/10 text-left transition-all group cursor-pointer"
                            >
                              <div className="h-7 w-7 rounded-lg overflow-hidden border border-emerald-500/30 shrink-0 mr-2.5">
                                <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100" alt="Musa" className="h-full w-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-extrabold text-zinc-800 dark:text-zinc-200 truncate leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400">Musa Ibrahim</p>
                                <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-medium font-mono">Farmer Account</p>
                              </div>
                            </button>

                            {/* Amina - Admin */}
                            <button
                              onClick={() => {
                                handleNavSignIn('amina.bello@cowplug.ng');
                                setUserDropdownOpen(false);
                              }}
                              disabled={isSigningIn}
                              className="w-full flex items-center p-2 rounded-xl border border-zinc-150 dark:border-zinc-800/85 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/10 text-left transition-all group cursor-pointer"
                            >
                              <div className="h-7 w-7 rounded-lg overflow-hidden border border-emerald-500/30 shrink-0 mr-2.5">
                                <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100" alt="Amina" className="h-full w-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-extrabold text-zinc-800 dark:text-zinc-200 truncate leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400">Dr. Amina Bello</p>
                                <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-medium font-mono">Admin Console</p>
                              </div>
                            </button>
                          </div>

                          {/* Custom Sign-In Form */}
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              handleNavSignIn(signInEmail);
                              setUserDropdownOpen(false);
                            }}
                            className="space-y-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-800"
                          >
                            <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Or Custom Credentials</span>
                            <div>
                              <label className="block text-[8px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Email Address</label>
                              <input
                                type="email"
                                required
                                placeholder="e.g. bashir@yusuf-holdings.com"
                                value={signInEmail}
                                onChange={(e) => setSignInEmail(e.target.value)}
                                className="w-full px-3 py-1.5 rounded-xl border bg-white dark:bg-zinc-950 dark:border-zinc-800 text-[11px] text-zinc-850 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                              />
                            </div>
                            <div>
                              <label className="block text-[8px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Password</label>
                              <input
                                type="password"
                                required
                                placeholder="••••••••"
                                value={signInPassword}
                                onChange={(e) => setSignInPassword(e.target.value)}
                                className="w-full px-3 py-1.5 rounded-xl border bg-white dark:bg-zinc-950 dark:border-zinc-800 text-[11px] text-zinc-855 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                              />
                            </div>

                            {signInError && (
                              <p className="text-[10px] text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/20 p-2 rounded-lg border border-rose-100 dark:border-rose-900/40">{signInError}</p>
                            )}

                            <button
                              type="submit"
                              disabled={isSigningIn}
                              className="w-full py-2 text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/20 transition-all flex items-center justify-center space-x-1 cursor-pointer"
                            >
                              {isSigningIn ? (
                                <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                              ) : (
                                <>
                                  <Lock className="h-3 w-3 mr-1" />
                                  <span>Access Ledger</span>
                                </>
                              )}
                            </button>

                            <div className="text-center pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setUserDropdownOpen(false);
                                  onOpenAuth('register-choose');
                                }}
                                className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
                              >
                                No account? Register standard
                              </button>
                            </div>
                          </form>
                        </>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Handset Controls */}
          <div className="flex items-center space-x-4 md:hidden h-[51.9841px]">
            

            {/* Quick Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotifDropdownOpen(!notifDropdownOpen);
                  if (!notifDropdownOpen) onMarkNotificationsRead();
                }}
                className="relative p-2 rounded-lg text-zinc-500 hover:text-emerald-600 dark:text-zinc-400"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></span>
                )}
              </button>

              <AnimatePresence>
                {notifDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setNotifDropdownOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 15 }}
                      className="absolute right-[-40px] sm:right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 py-2 z-50"
                    >
                      <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                        <span className="font-display font-semibold text-zinc-800 dark:text-white text-xs sm:text-sm">Ranch Alerts</span>
                        <span className="text-[10px] sm:text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                          {unreadCount} New
                        </span>
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">No alerts right now</div>
                        ) : (
                          notifications.map((n) => (
                            <div key={n.id} className="p-3 border-b border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                              <div className="flex items-start">
                                <span className="text-lg mr-2">
                                  {n.type === 'vaccination' ? '💉' : n.type === 'feed' ? '🌾' : n.type === 'drug' ? '💊' : '🐄'}
                                </span>
                                <div>
                                  <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{n.title}</h4>
                                  <p className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">{n.message}</p>
                                  <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono mt-1 block">
                                    {new Date(n.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Cart */}
            <button
              onClick={onOpenCart}
              className="relative p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-500 hover:text-emerald-600 dark:text-zinc-400"
            >
              <ShoppingBag className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Hamburger Menu Toggle / Sign In Box Dropdown */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="h-10 w-10 rounded-full overflow-hidden border-2 border-emerald-500 hover:border-emerald-600 focus:outline-none transition-all shadow-md shrink-0 flex items-center justify-center bg-zinc-50 dark:bg-zinc-850 cursor-pointer duration-150 active:scale-95 animate-in fade-in zoom-in-95 duration-200"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5.5 w-5.5 text-emerald-600 dark:text-emerald-400 animate-in spin-in-90 duration-200" />
              ) : currentUser ? (
                currentUser.avatar ? (
                  <img 
                    src={currentUser.avatar} 
                    alt={currentUser.fullName} 
                    className="h-full w-full object-cover" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase">
                    {currentUser.fullName.split(' ').map(n => n[0]).join('')}
                  </div>
                )
              ) : (
                <User className="h-5.5 w-5.5 text-emerald-600 dark:text-emerald-400" />
              )}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Drawer (Slide-out Sidebar) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[100] md:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-zinc-950/60 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Slide-out Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-[300px] bg-white dark:bg-zinc-950 h-full flex flex-col z-[101] border-r border-zinc-200 dark:border-zinc-800/80 shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center space-x-2">
                  <div className="h-9 w-9 rounded-xl bg-emerald-600 dark:bg-emerald-700 flex items-center justify-center text-white mr-1 shadow-md shadow-emerald-600/20">
                    <TrendingUp className="h-5 w-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="font-display font-bold text-lg text-zinc-900 dark:text-white">
                      Cow<span className="text-emerald-600 dark:text-emerald-400">Plug</span>
                      <span className="text-amber-500 font-extrabold text-xs ml-0.5">NG</span>
                    </span>
                    <p className="text-[8px] text-zinc-500 dark:text-zinc-400 font-mono tracking-widest uppercase -mt-0.5 font-bold">LIVESTOCK</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-500 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Scrollable Navigation Groups */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
                
                {/* Premium User Profile Card */}
                {currentUser && (
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-150 dark:border-zinc-800/80 shadow-xs relative overflow-hidden group">
                    <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
                    
                    <div className="flex items-center space-x-3.5 relative z-10">
                      <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-emerald-500/80 shadow-md shrink-0 bg-white dark:bg-zinc-800 flex items-center justify-center">
                        {currentUser.avatar ? (
                          <img src={currentUser.avatar} alt={currentUser.fullName} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm uppercase">
                            {currentUser.fullName.split(' ').map(n => n[0]).join('')}
                          </span>
                        )}
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-400 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                            {currentUser.role}
                          </span>
                          <span className="text-[9px] bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-1.5 py-0.5 rounded-md font-mono font-bold">
                            ₦{currentUser.balance?.toLocaleString() || '0'}
                          </span>
                        </div>
                        <p className="text-sm font-black text-zinc-900 dark:text-white truncate mt-1 leading-none">{currentUser.fullName}</p>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold mt-1 truncate">{currentUser.email}</p>
                      </div>
                    </div>

                    {/* Quick Profile Actions */}
                    <div className="grid grid-cols-2 gap-1.5 mt-3.5 pt-3 border-t border-zinc-200/50 dark:border-zinc-800/50 relative z-10">
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          if (experienceMode === 'lite') {
                            setLiteActiveTab?.('profile');
                          } else {
                            setActiveSection('dashboard');
                            onSelectDashboardTab?.('profile');
                          }
                        }}
                        className="flex items-center justify-center space-x-2 py-2 px-3 bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/60 rounded-xl text-[11px] font-bold text-zinc-700 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/30 dark:hover:border-emerald-500/30 transition-all cursor-pointer shadow-xs"
                      >
                        <User className="h-3.5 w-3.5 text-zinc-400" />
                        <span>Profile</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          if (experienceMode === 'lite') {
                            setLiteActiveTab?.('profile');
                          } else {
                            setActiveSection('dashboard');
                            onSelectDashboardTab?.('settings');
                          }
                        }}
                        className="flex items-center justify-center space-x-2 py-2 px-3 bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/60 rounded-xl text-[11px] font-bold text-zinc-700 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/30 dark:hover:border-emerald-500/30 transition-all cursor-pointer shadow-xs"
                      >
                        <Settings className="h-3.5 w-3.5 text-zinc-400" />
                        <span>Settings</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Guest Actions - Slide-out Credentials and Quick Logins */}
                {!currentUser && (
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-150 dark:border-zinc-800/80 shadow-xs relative overflow-hidden">
                    <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="pb-3 border-b border-zinc-200/50 dark:border-zinc-800/50 mb-3 relative z-10">
                      <h4 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">Access CowPlug NG</h4>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold leading-tight">Input credentials or choose a preset account</p>
                    </div>

                    {/* Preset Accounts */}
                    <div className="space-y-1.5 mb-3.5 relative z-10">
                      <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Quick Demo Logins</span>
                      
                      {/* Bashir */}
                      <button
                        onClick={() => {
                          handleNavSignIn('bashir@yusuf-holdings.com');
                          setMobileMenuOpen(false);
                        }}
                        disabled={isSigningIn}
                        className="w-full flex items-center p-2 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-150 dark:border-zinc-850 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/10 text-left transition-all group cursor-pointer"
                      >
                        <div className="h-7 w-7 rounded-lg overflow-hidden border border-emerald-500/30 shrink-0 mr-2.5">
                          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100" alt="Bashir" className="h-full w-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-extrabold text-zinc-800 dark:text-zinc-200 truncate leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400">Alhaji Bashir Yusuf</p>
                          <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-medium font-mono">Investor Account</p>
                        </div>
                      </button>

                      {/* Musa */}
                      <button
                        onClick={() => {
                          handleNavSignIn('musa.farm@cowplug.ng');
                          setMobileMenuOpen(false);
                        }}
                        disabled={isSigningIn}
                        className="w-full flex items-center p-2 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-150 dark:border-zinc-850 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/10 text-left transition-all group cursor-pointer"
                      >
                        <div className="h-7 w-7 rounded-lg overflow-hidden border border-emerald-500/30 shrink-0 mr-2.5">
                          <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100" alt="Musa" className="h-full w-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-extrabold text-zinc-800 dark:text-zinc-200 truncate leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400">Musa Ibrahim</p>
                          <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-medium font-mono">Farmer Account</p>
                        </div>
                      </button>

                      {/* Amina */}
                      <button
                        onClick={() => {
                          handleNavSignIn('amina.bello@cowplug.ng');
                          setMobileMenuOpen(false);
                        }}
                        disabled={isSigningIn}
                        className="w-full flex items-center p-2 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-150 dark:border-zinc-850 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/10 text-left transition-all group cursor-pointer"
                      >
                        <div className="h-7 w-7 rounded-lg overflow-hidden border border-emerald-500/30 shrink-0 mr-2.5">
                          <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100" alt="Amina" className="h-full w-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-extrabold text-zinc-800 dark:text-zinc-200 truncate leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400">Dr. Amina Bello</p>
                          <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-medium font-mono">Admin Console</p>
                        </div>
                      </button>
                    </div>

                    {/* Custom Form */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleNavSignIn(signInEmail);
                        setMobileMenuOpen(false);
                      }}
                      className="space-y-3 pt-3 border-t border-zinc-200/50 dark:border-zinc-800/50 relative z-10"
                    >
                      <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Or Custom Credentials</span>
                      <div>
                        <label className="block text-[8px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Email Address</label>
                        <input
                          type="email"
                          required
                          placeholder="e.g. bashir@yusuf-holdings.com"
                          value={signInEmail}
                          onChange={(e) => setSignInEmail(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-zinc-950 dark:border-zinc-850 text-[11px] text-zinc-800 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Password</label>
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={signInPassword}
                          onChange={(e) => setSignInPassword(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-zinc-950 dark:border-zinc-850 text-[11px] text-zinc-800 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                        />
                      </div>

                      {signInError && (
                        <p className="text-[10px] text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/20 p-2 rounded-lg border border-rose-100 dark:border-rose-900/40">{signInError}</p>
                      )}

                      <button
                        type="submit"
                        disabled={isSigningIn}
                        className="w-full py-2.5 text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/20 transition-all flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        {isSigningIn ? (
                          <span className="h-4.5 w-4.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        ) : (
                          <>
                            <Lock className="h-3.5 w-3.5 mr-1" />
                            <span>Access Ledger</span>
                          </>
                        )}
                      </button>

                      <div className="text-center pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            onOpenAuth('register-choose');
                          }}
                          className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
                        >
                          No account? Register standard
                        </button>
                      </div>
                    </form>
                  </div>
                )}
                
                {/* 1. EXPERIENCE TOGGLE */}
                {setExperienceMode && (
                  <div className="bg-zinc-50 dark:bg-zinc-900 p-1 rounded-2xl flex items-center border border-zinc-150 dark:border-zinc-800 shadow-sm">
                    <button
                      onClick={() => {
                        setExperienceMode('lite');
                        setMobileMenuOpen(false);
                      }}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                        experienceMode === 'lite'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700'
                      }`}
                    >
                      <span>Lite Mode</span>
                    </button>
                    <button
                      onClick={() => {
                        setExperienceMode('pro');
                        setMobileMenuOpen(false);
                      }}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                        experienceMode === 'pro'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700'
                      }`}
                    >
                      <span>Pro Mode</span>
                    </button>
                  </div>
                )}

                {/* 2. GROUPED NAVIGATION ITEMS */}
                {experienceMode === 'lite' ? (
                  // LITE MODE ITEMS
                  <div className="space-y-4">
                    <h4 className="px-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Lite Navigation</h4>
                    <div className="space-y-1">
                      {[
                        { id: 'home', name: 'Home', icon: Home },
                        { id: 'buy', name: 'Buy Livestock', icon: ShoppingBag },
                        { id: 'my-animals', name: 'My Herd', icon: Heart },
                        { id: 'find-animal', name: 'Find an Animal', icon: PlusCircle },
                        { id: 'payments', name: 'Payments & Wallet', icon: Wallet },
                        { id: 'receive', name: 'Receive My Animal', icon: Truck },
                        { id: 'rates', name: 'Market Rates', icon: TrendingUp },
                        { id: 'profile', name: 'My Profile', icon: User },
                      ].map((item) => {
                        const Icon = item.icon;
                        const isActive = liteActiveTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setMobileMenuOpen(false);
                              if (item.id === 'my-animals' || item.id === 'payments' || item.id === 'profile' || item.id === 'find-animal' || item.id === 'receive') {
                                if (!currentUser) {
                                  onOpenAuth();
                                } else {
                                  setLiteActiveTab?.(item.id as any);
                                }
                              } else {
                                setLiteActiveTab?.(item.id as any);
                              }
                            }}
                            className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                              isActive
                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10'
                                : 'text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/60'
                            }`}
                          >
                            <Icon className="h-5 w-5 mr-3" />
                            {item.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  // PRO MODE ITEMS
                  <>
                    {/* PRIMARY SECTIONS */}
                    <div className="space-y-3">
                      <h4 className="px-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Primary Sections</h4>
                      <div className="space-y-1">
                        {[
                          { id: 'home', name: 'Home', icon: Home, action: () => { setActiveSection('home'); } },
                          { id: 'marketplace', name: 'Marketplace', icon: ShoppingBag, action: () => { setActiveSection('marketplace'); } },
                          { 
                            id: 'my-herd', 
                            name: 'My Herd', 
                            icon: Heart, 
                            action: () => {
                              if (!currentUser) {
                                onOpenAuth();
                              } else {
                                setActiveSection('dashboard');
                                onSelectDashboardTab?.('dashboard');
                              }
                            } 
                          },
                          { 
                            id: 'payments', 
                            name: 'Payments & Wallet', 
                            icon: Wallet, 
                            action: () => {
                              if (!currentUser) {
                                onOpenAuth();
                              } else {
                                setActiveSection('dashboard');
                                onSelectDashboardTab?.('payments');
                              }
                            } 
                          },
                          { 
                            id: 'profile', 
                            name: 'My Profile', 
                            icon: User, 
                            action: () => {
                              if (!currentUser) {
                                onOpenAuth();
                              } else {
                                setActiveSection('dashboard');
                                onSelectDashboardTab?.('profile');
                              }
                            } 
                          },
                        ].map((item) => {
                          const Icon = item.icon;
                          
                          // Active status calculation for Pro Mode
                          let isActive = false;
                          if (item.id === 'home') {
                            isActive = activeSection === 'home' || activeSection === 'home-public';
                          } else if (item.id === 'marketplace') {
                            isActive = activeSection === 'marketplace';
                          } else if (item.id === 'my-herd') {
                            isActive = activeSection === 'dashboard' && dashboardTab === 'dashboard';
                          } else if (item.id === 'payments') {
                            isActive = activeSection === 'dashboard' && dashboardTab === 'payments';
                          } else if (item.id === 'profile') {
                            isActive = activeSection === 'dashboard' && (dashboardTab === 'profile' || dashboardTab === 'settings');
                          }

                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                setMobileMenuOpen(false);
                                item.action();
                              }}
                              className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                                isActive
                                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10'
                                  : 'text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/60'
                              }`}
                            >
                              <Icon className="h-5 w-5 mr-3" />
                              {item.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* RANCH OPERATIONS (Only if logged in) */}
                    {currentUser && (
                      <div className="space-y-3">
                        <h4 className="px-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Ranch Operations</h4>
                        <div className="space-y-1">
                          {[
                            { 
                              id: 'orders', 
                              name: 'Orders & Requests', 
                              icon: Package, 
                              action: () => {
                                setActiveSection('dashboard');
                                onSelectDashboardTab?.(currentUser.role === 'admin' ? 'meat-orders' : currentUser.role === 'farmer' ? 'orders' : 'delivery-requests');
                              }
                            },
                            { 
                              id: 'notifications', 
                              name: 'Alerts & Bulletins', 
                              icon: Bell, 
                              action: () => {
                                setActiveSection('dashboard');
                                onSelectDashboardTab?.('notifications');
                              }
                            },
                            { 
                              id: 'settings', 
                              name: 'Settings', 
                              icon: Settings, 
                              action: () => {
                                setActiveSection('dashboard');
                                onSelectDashboardTab?.('settings');
                              }
                            }
                          ].map((item) => {
                            const Icon = item.icon;
                            let isActive = false;
                            if (item.id === 'orders') {
                              isActive = activeSection === 'dashboard' && (dashboardTab === 'delivery-requests' || dashboardTab === 'orders' || dashboardTab === 'meat-orders');
                            } else if (item.id === 'notifications') {
                              isActive = activeSection === 'dashboard' && dashboardTab === 'notifications';
                            } else if (item.id === 'settings') {
                              isActive = activeSection === 'dashboard' && dashboardTab === 'settings';
                            }

                            return (
                              <button
                                key={item.id}
                                onClick={() => {
                                  setMobileMenuOpen(false);
                                  item.action();
                                }}
                                className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                                  isActive
                                    ? 'bg-emerald-600/10 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                                    : 'text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/60'
                                }`}
                              >
                                <Icon className="h-5 w-5 mr-3" />
                                {item.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* GENERAL */}
                    <div className="space-y-3">
                      <h4 className="px-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">General Information</h4>
                      <div className="space-y-1">
                        {[
                          { id: 'about', name: 'About', icon: Info, action: () => { setActiveSection('about'); } },
                          { id: 'meatsupply', name: 'Meat Supply', icon: Utensils, action: () => { setActiveSection('meatsupply'); } },
                          { id: 'blog-faq', name: 'Blog & FAQ', icon: BookOpen, action: () => { setActiveSection('blog-faq'); } },
                          { id: 'contact', name: 'Contact', icon: Phone, action: () => { setActiveSection('contact'); } },
                        ].map((item) => {
                          const Icon = item.icon;
                          const isActive = activeSection === item.id;
                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                setMobileMenuOpen(false);
                                item.action();
                              }}
                              className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                                isActive
                                  ? 'bg-emerald-600/10 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                                  : 'text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/60'
                              }`}
                            >
                              <Icon className="h-5 w-5 mr-3" />
                              {item.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Platform Snapshot Stats Card */}
                    <div className="px-3 py-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-150 dark:border-zinc-800/80 mt-2">
                      <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3 px-1">Ranch Snapshot</h4>
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="bg-white dark:bg-zinc-950 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-900 shadow-2xs">
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">Herd Yield</p>
                          <p className="text-xs sm:text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">Up to 22%</p>
                          <p className="text-[8px] text-zinc-400 font-mono mt-0.5">Per Annum</p>
                        </div>
                        <div className="bg-white dark:bg-zinc-950 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-900 shadow-2xs">
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">Veterinary</p>
                          <p className="text-xs sm:text-sm font-extrabold text-amber-500 mt-0.5">24/7 Care</p>
                          <p className="text-[8px] text-zinc-400 font-mono mt-0.5">Certified Vet</p>
                        </div>
                        <div className="bg-white dark:bg-zinc-950 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-900 shadow-2xs">
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">Active Herds</p>
                          <p className="text-xs sm:text-sm font-extrabold text-zinc-800 dark:text-zinc-200 mt-0.5">14,850+</p>
                          <p className="text-[8px] text-zinc-400 font-mono mt-0.5">Heads Tracked</p>
                        </div>
                        <div className="bg-white dark:bg-zinc-950 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-900 shadow-2xs">
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">Insured By</p>
                          <p className="text-[11px] font-extrabold text-blue-600 dark:text-blue-400 mt-1 truncate">Leadway</p>
                          <p className="text-[8px] text-zinc-400 font-mono mt-0.5">100% Protected</p>
                        </div>
                      </div>
                    </div>

                    {/* Support & Contact */}
                    <div className="px-3 py-1 space-y-2.5">
                      <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Contact & Support</h4>
                      <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                        <div className="flex items-center">
                          <Phone className="h-3.5 w-3.5 mr-2.5 text-emerald-600 dark:text-emerald-400" />
                          <span className="font-semibold">+234 (0) 803 123 4567</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-bold text-zinc-400 mr-2.5 text-xs font-mono">@</span>
                          <span className="font-semibold">support@cowplug.ng</span>
                        </div>
                      </div>

                      {/* Social Links */}
                      <div className="flex items-center space-x-2.5 pt-1.5">
                        <a href="https://twitter.com/cowplug_ng" target="_blank" rel="noreferrer" className="h-7 w-7 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 transition-colors">
                          <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                        </a>
                        <a href="https://linkedin.com/company/cowplug" target="_blank" rel="noreferrer" className="h-7 w-7 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 transition-colors">
                          <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z"/>
                          </svg>
                        </a>
                        <a href="https://facebook.com/cowplug" target="_blank" rel="noreferrer" className="h-7 w-7 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 transition-colors">
                          <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                        </a>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Footer (Profile Info & Logout / Login) */}
              <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 mt-auto">
                {currentUser ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 px-2">
                      <img src={currentUser.avatar} alt={currentUser.fullName} className="h-10 w-10 rounded-full border border-emerald-500 object-cover shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 truncate">{currentUser.fullName}</p>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wide font-extrabold">{currentUser.role} Account</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setCurrentUser(null);
                        setActiveSection('home');
                      }}
                      className="w-full flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all border border-red-200/40 dark:border-red-900/20 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth();
                    }}
                    className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center cursor-pointer"
                  >
                    <User className="h-4.5 w-4.5 mr-2" />
                    Sign In to Account
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </nav>
  );
}
