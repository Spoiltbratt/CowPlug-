import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mail, Send, RefreshCcw, LogIn, LogOut, CheckCircle2 } from 'lucide-react';

export default function GmailIntegration() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'inbox' | 'compose'>('inbox');
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [text, setText] = useState('');
  const [sendSuccess, setSendSuccess] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMessages();
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
      setMessages([]);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/gmail/messages');
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      } else {
        if (res.status === 401) {
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendLoading(true);
    setSendSuccess(false);
    
    try {
      const res = await fetch('/api/gmail/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, text })
      });
      
      if (res.ok) {
        setSendSuccess(true);
        setTo('');
        setSubject('');
        setText('');
        setTimeout(() => setSendSuccess(false), 3000);
      } else {
        alert("Failed to send email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
    } finally {
      setSendLoading(false);
    }
  };

  const getHeaderValue = (payload: any, name: string) => {
    const headers = payload?.headers || [];
    const header = headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase());
    return header ? header.value : '';
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-center h-64">
        <Mail className="h-12 w-12 text-zinc-400 mb-4" />
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Gmail Integration</h3>
        <p className="text-sm text-zinc-500 mb-6 max-w-sm">
          Connect your Google account to view emails and send messages directly from the dashboard.
        </p>
        <button
          onClick={handleLogin}
          className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all"
        >
          <LogIn className="h-4 w-4" />
          <span>Connect Gmail</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-lg flex flex-col">
      <div className="p-4 sm:p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50">
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-100 dark:bg-emerald-500/20 p-2 rounded-xl text-emerald-600 dark:text-emerald-400">
            <Mail className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">Mailbox</h2>
        </div>
        
        <button 
          onClick={handleLogout}
          className="text-xs font-bold text-zinc-500 hover:text-red-500 flex items-center transition-colors"
        >
          <LogOut className="h-3.5 w-3.5 mr-1" />
          Disconnect
        </button>
      </div>

      <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <button
          onClick={() => setActiveTab('inbox')}
          className={`flex-1 py-3 text-xs font-bold tracking-wider uppercase transition-all border-b-2 ${
            activeTab === 'inbox' 
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' 
              : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
          }`}
        >
          Recent Inbox
        </button>
        <button
          onClick={() => setActiveTab('compose')}
          className={`flex-1 py-3 text-xs font-bold tracking-wider uppercase transition-all border-b-2 ${
            activeTab === 'compose' 
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' 
              : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
          }`}
        >
          Compose Email
        </button>
      </div>

      <div className="p-4 sm:p-6 min-h-[400px]">
        {activeTab === 'inbox' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-zinc-500">Showing last {messages.length} messages</span>
              <button 
                onClick={fetchMessages}
                disabled={isLoading}
                className="p-1.5 text-zinc-400 hover:text-emerald-500 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {isLoading && messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
                <RefreshCcw className="h-8 w-8 animate-spin mb-3 opacity-50" />
                <p className="text-sm">Syncing inbox...</p>
              </div>
            ) : messages.length > 0 ? (
              <div className="space-y-2">
                {messages.map((msg, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={msg.id} 
                    className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:border-emerald-500/30 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-sm text-zinc-900 dark:text-white truncate pr-4">
                        {getHeaderValue(msg.payload, 'From').split('<')[0]}
                      </span>
                      <span className="text-[10px] text-zinc-400 whitespace-nowrap">
                        {new Date(parseInt(msg.internalDate)).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1 truncate">
                      {getHeaderValue(msg.payload, 'Subject') || '(No Subject)'}
                    </div>
                    <p className="text-xs text-zinc-500 truncate">
                      {msg.snippet}
                    </p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-zinc-500 text-sm">
                No recent messages found.
              </div>
            )}
          </div>
        )}

        {activeTab === 'compose' && (
          <form onSubmit={handleSendEmail} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">To</label>
              <input
                type="email"
                required
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="recipient@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Subject</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email Subject"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Message</label>
              <textarea
                required
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type your message here..."
                rows={6}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
              />
            </div>
            
            <div className="pt-2 flex items-center justify-between">
              {sendSuccess ? (
                <div className="flex items-center text-emerald-600 dark:text-emerald-400 text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                  Message sent successfully!
                </div>
              ) : (
                <div /> // Spacer
              )}
              
              <button
                type="submit"
                disabled={sendLoading || !to || !subject || !text}
                className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
              >
                {sendLoading ? (
                  <RefreshCcw className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span>{sendLoading ? 'Sending...' : 'Send Message'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
