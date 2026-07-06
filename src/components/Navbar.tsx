import { useState, FormEvent, useEffect } from 'react';
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

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // States for Mobile / Quick Sign-In Box
  const [signInEmail, setSignInEmail] = useState('bashir@yusuf-holdings.com');
  const [signInPassword, setSignInPassword] = useState('password123');
  const [signInError, setSignInError] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  // States for simplified mobile auth
  const [mobileAuthTab, setMobileAuthTab] = useState<'login' | 'register'>('login');
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<'investor' | 'farmer'>('investor');
  const [regError, setRegError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleNavRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (!regFullName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setRegError('Please fill out all required fields.');
      return;
    }
    setIsRegistering(true);
    setRegError('');
    try {
      const trimmedEmail = regEmail.trim().toLowerCase();
      
      const q = query(collection(db, 'users'), where('email', '==', trimmedEmail));
      const snap = await getDocs(q);
      if (!snap.empty) {
        setRegError('This email is already registered.');
        setIsRegistering(false);
        return;
      }

      const newUser: UserType = {
        id: `user-${Date.now()}`,
        email: trimmedEmail,
        fullName: regFullName.trim(),
        role: regRole,
        phone: regPhone.trim() || '+234 803 000 0000',
        balance: regRole === 'investor' ? 500000 : 0,
        investmentsCount: 0,
        avatar: regRole === 'investor'
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      };

      await seedUserIfMissing(newUser, [], [], INITIAL_NOTIFICATIONS);
      setCurrentUser(newUser);
      setMobileMenuOpen(false);
      // Reset forms
      setRegFullName('');
      setRegEmail('');
      setRegPhone('');
      setRegPassword('');
    } catch (err: any) {
      console.error('Registration error:', err);
      setRegError('Registration failed. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  };

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
    { name: 'Meat Supply', id: 'meatsupply' },
  ];

  const loggedInNavItems = [
    { name: 'Dashboard', id: 'dashboard' },
    { name: 'My Livestock', id: 'my-livestock' },
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
      if (id === 'home') {
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

                {/* Dark Mode Toggle */}
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="relative p-2 rounded-lg text-zinc-500 hover:text-emerald-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-emerald-400 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                  title="Toggle Theme"
                >
                  {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>

                {/* Shopping Cart Trigger */}
                {currentUser && (
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
                )}

                {/* Notifications Trigger */}
                {currentUser && (
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
                )}
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
                    className="hidden md:hidden px-4 py-2 text-xs font-black bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 border border-emerald-100/60 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 shadow-xs"
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
            
            {/* Dark Mode Toggle Mobile */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg text-zinc-500 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400 transition-colors cursor-pointer"
            >
              {darkMode ? <Sun className="h-5.5 w-5.5" /> : <Moon className="h-5.5 w-5.5" />}
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

      {/* Mobile Pop-up Menu (Centered Overlay Card) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[100] md:hidden flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-zinc-950/50 backdrop-blur-md"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Centered Pop-up Panel */}
            <motion.div
              id="mobile-nav-panel"
              initial={{ opacity: 0, scale: 0.93 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.93 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="relative w-full max-w-[340px] h-[410px] max-h-[90vh] bg-white dark:bg-zinc-950 flex flex-col z-[101] border border-zinc-200 dark:border-zinc-800/80 rounded-3xl shadow-2xl overflow-hidden mt-[400px]"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-lg bg-emerald-600 dark:bg-emerald-700 flex items-center justify-center text-white shadow-md">
                    <TrendingUp className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="font-display font-bold text-sm text-zinc-900 dark:text-white">
                      Cow<span className="text-emerald-600 dark:text-emerald-400">Plug</span>
                      <span className="text-amber-500 font-extrabold text-[10px] ml-0.5">NG</span>
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-500 transition-colors"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {currentUser ? (
                /* LOGGED IN VIEW */
                <div className="flex-1 flex flex-col justify-between p-5">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3.5 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-150 dark:border-zinc-800/60">
                      <img src={currentUser.avatar} alt={currentUser.fullName} className="h-11 w-11 rounded-full border-2 border-emerald-500 object-cover shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">{currentUser.fullName}</p>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase mt-0.5">{currentUser.role} account</p>
                      </div>
                    </div>

                    <div className="space-y-2">
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
                        className="w-full flex items-center justify-between px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 transition-all"
                      >
                        <span className="flex items-center"><User className="h-4 w-4 mr-2 text-zinc-400" /> My Profile</span>
                        <span className="text-zinc-400">→</span>
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
                        className="w-full flex items-center justify-between px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 transition-all"
                      >
                        <span className="flex items-center"><Settings className="h-4 w-4 mr-2 text-zinc-400" /> Account Settings</span>
                        <span className="text-zinc-400">→</span>
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setCurrentUser(null);
                      setActiveSection('home');
                    }}
                    className="w-full flex items-center justify-center py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/30 border border-red-200/40 dark:border-red-900/20 text-xs font-black text-red-600 dark:text-red-400 rounded-xl transition-all"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              ) : (
                /* GUEST AUTHENTICATION VIEW (LOGIN & CREATE ACCOUNT) */
                <div className="flex-1 flex flex-col min-h-0">
                  {/* Tab Selector */}
                  <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200/40 dark:border-zinc-800 shrink-0">
                    <button
                      onClick={() => setMobileAuthTab('login')}
                      className={`flex-1 py-1.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                        mobileAuthTab === 'login'
                          ? 'bg-emerald-600 text-white shadow-sm font-black'
                          : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => setMobileAuthTab('register')}
                      className={`flex-1 py-1.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                        mobileAuthTab === 'register'
                          ? 'bg-emerald-600 text-white shadow-sm font-black'
                          : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                      }`}
                    >
                      Create Account
                    </button>
                  </div>

                  {/* Scrollable Form Content */}
                  <div className="flex-1 overflow-y-auto px-5 py-4 min-h-0">
                    {mobileAuthTab === 'login' ? (
                      /* SIMPLE LOGIN FORM */
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleNavSignIn(signInEmail);
                          setMobileMenuOpen(false);
                        }}
                        className="space-y-3.5"
                      >
                        <div>
                          <label className="block text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Email Address</label>
                          <input
                            type="email"
                            required
                            placeholder="e.g. bashir@yusuf-holdings.com"
                            value={signInEmail}
                            onChange={(e) => setSignInEmail(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl border dark:bg-zinc-900 bg-white dark:border-zinc-800 text-xs text-zinc-800 dark:text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Password</label>
                          <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={signInPassword}
                            onChange={(e) => setSignInPassword(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl border dark:bg-zinc-900 bg-white dark:border-zinc-800 text-xs text-zinc-800 dark:text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        {signInError && (
                          <p className="text-[10px] text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/20 p-2 rounded-lg border border-rose-100 dark:border-rose-900/40">{signInError}</p>
                        )}

                        <button
                          type="submit"
                          disabled={isSigningIn}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center justify-center space-x-1 cursor-pointer"
                        >
                          {isSigningIn ? (
                            <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                          ) : (
                            <>
                              <Lock className="h-3.5 w-3.5 mr-1" />
                              <span>Sign In</span>
                            </>
                          )}
                        </button>

                        {/* Quick Presets */}
                        <div className="pt-3 border-t border-zinc-150 dark:border-zinc-900">
                          <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1.5">Quick Demo Accounts</span>
                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSignInEmail('bashir@yusuf-holdings.com');
                                setSignInPassword('password123');
                              }}
                              className="py-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-lg text-[9px] font-bold text-zinc-600 dark:text-zinc-400 hover:border-emerald-500"
                            >
                              Investor
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSignInEmail('musa.farm@cowplug.ng');
                                setSignInPassword('password123');
                              }}
                              className="py-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-lg text-[9px] font-bold text-zinc-600 dark:text-zinc-400 hover:border-emerald-500"
                            >
                              Farmer
                            </button>

                          </div>
                        </div>
                      </form>
                    ) : (
                      /* SIMPLE CREATE ACCOUNT FORM */
                      <form
                        onSubmit={handleNavRegister}
                        className="space-y-3.5"
                      >
                        <div>
                          <label className="block text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Full Name</label>
                          <input
                            type="text"
                            required
                            placeholder="Alhaji Bashir Yusuf"
                            value={regFullName}
                            onChange={(e) => setRegFullName(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl border dark:bg-zinc-900 bg-white dark:border-zinc-800 text-xs text-zinc-800 dark:text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Email Address</label>
                          <input
                            type="email"
                            required
                            placeholder="name@domain.com"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl border dark:bg-zinc-900 bg-white dark:border-zinc-800 text-xs text-zinc-800 dark:text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Phone Number</label>
                            <input
                              type="tel"
                              placeholder="+234..."
                              value={regPhone}
                              onChange={(e) => setRegPhone(e.target.value)}
                              className="w-full px-3 py-1.5 rounded-xl border dark:bg-zinc-900 bg-white dark:border-zinc-800 text-xs text-zinc-800 dark:text-white focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">I am a</label>
                            <select
                              value={regRole}
                              onChange={(e) => setRegRole(e.target.value as any)}
                              className="w-full px-2 py-1.5 rounded-xl border dark:bg-zinc-900 bg-white dark:border-zinc-800 text-xs text-zinc-800 dark:text-white focus:outline-none focus:border-emerald-500"
                            >
                              <option value="investor">Customer</option>
                              <option value="farmer">Seller</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Password</label>
                          <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl border dark:bg-zinc-900 bg-white dark:border-zinc-800 text-xs text-zinc-800 dark:text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        {regError && (
                          <p className="text-[10px] text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/20 p-2 rounded-lg border border-rose-100 dark:border-rose-900/40">{regError}</p>
                        )}

                        <button
                          type="submit"
                          disabled={isRegistering}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center justify-center space-x-1 cursor-pointer"
                        >
                          {isRegistering ? (
                            <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                          ) : (
                            <span>Create Account</span>
                          )}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              )}
                        </motion.div>
          </div>
        )}
      </AnimatePresence>
    </nav>
  );
}
