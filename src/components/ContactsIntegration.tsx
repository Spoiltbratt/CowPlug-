import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, LogIn, LogOut, RefreshCcw, Mail, Phone, MapPin } from 'lucide-react';

export default function ContactsIntegration() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchContacts();
    }
  }, [isAuthenticated]);

  const checkAuthStatus = async () => {
    try {
      const res = await fetch('/api/oauth/status');
      const data = await res.json();
      setIsAuthenticated(data.isAuthenticated);
    } catch (error) {
      console.error("Auth status error:", error);
    }
  };

  const handleLogin = async () => {
    try {
      const res = await fetch('/api/oauth/url');
      const data = await res.json();
      window.location.href = data.url;
    } catch (error) {
      console.error("Failed to get OAuth URL:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/oauth/logout', { method: 'POST' });
      setIsAuthenticated(false);
      setContacts([]);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/contacts');
      if (res.ok) {
        const data = await res.json();
        setContacts(data.contacts || []);
      } else {
        if (res.status === 401) {
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-center h-64">
        <Users className="h-12 w-12 text-zinc-400 mb-4" />
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Google Contacts Integration</h3>
        <p className="text-sm text-zinc-500 mb-6 max-w-sm">
          Connect your Google account to view and manage your contacts directly from the dashboard.
        </p>
        <button
          onClick={handleLogin}
          className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all"
        >
          <LogIn className="h-4 w-4" />
          <span>Connect Google Account</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-lg flex flex-col">
      <div className="p-4 sm:p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50">
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-100 dark:bg-emerald-500/20 p-2 rounded-xl text-emerald-600 dark:text-emerald-400">
            <Users className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">Google Contacts</h2>
        </div>
        
        <button 
          onClick={handleLogout}
          className="text-xs font-bold text-zinc-500 hover:text-red-500 flex items-center transition-colors"
        >
          <LogOut className="h-3.5 w-3.5 mr-1" />
          Disconnect
        </button>
      </div>

      <div className="p-4 sm:p-6 min-h-[400px]">
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-zinc-500">Showing {contacts.length} contacts</span>
            <button 
              onClick={fetchContacts}
              disabled={isLoading}
              className="p-1.5 text-zinc-400 hover:text-emerald-500 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {isLoading && contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
              <RefreshCcw className="h-8 w-8 animate-spin mb-3 opacity-50" />
              <p className="text-sm">Syncing contacts...</p>
            </div>
          ) : contacts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contacts.map((contact, idx) => {
                const name = contact.names?.[0]?.displayName || 'Unknown Name';
                const email = contact.emailAddresses?.[0]?.value || '';
                const phone = contact.phoneNumbers?.[0]?.value || '';

                return (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    key={contact.resourceName} 
                    className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:border-emerald-500/30 transition-colors"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-lg">
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-white truncate">{name}</h4>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {email && (
                        <div className="flex items-center text-xs text-zinc-500">
                          <Mail className="h-3 w-3 mr-2" />
                          <span className="truncate">{email}</span>
                        </div>
                      )}
                      {phone && (
                        <div className="flex items-center text-xs text-zinc-500">
                          <Phone className="h-3 w-3 mr-2" />
                          <span className="truncate">{phone}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-zinc-500 text-sm">
              No contacts found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
