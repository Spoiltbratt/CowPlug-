import React, { useState } from 'react';
import { Mail, Phone, MessageSquare, MapPin, Send, CheckCircle2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    }, 3500);
  };

  return (
    <section className="py-20 bg-white dark:bg-zinc-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-100 dark:bg-emerald-950/50 px-3.5 py-1.5 rounded-full">
            GET IN TOUCH
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-zinc-900 dark:text-white mt-4 tracking-tight">
            We’d Love to Hear From You
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mt-4 text-base sm:text-lg">
            Whether you’re an investor wanting to fund slots, a local herder requesting vet tags, or a caterer looking for wholesale beef. Let’s talk!
          </p>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Contact Methods Cards */}
          <div className="lg:col-span-5 space-y-6">
            <h3 className="font-display font-bold text-2xl text-zinc-950 dark:text-white mb-6">
              Core Touchpoints
            </h3>

            {/* Email */}
            <div className="bg-zinc-50 dark:bg-zinc-900/40 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-start space-x-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Email Communications</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">General: support@cowplug.ng</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Institutional: wholesale@cowplug.ng</p>
              </div>
            </div>

            {/* Phone */}
            <div className="bg-zinc-50 dark:bg-zinc-900/40 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-start space-x-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/50 rounded-xl text-amber-500 flex-shrink-0">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Direct Phone Call Desk</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Lagos Office: +234 (0) 803 456 7891</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Abuja Ranch: +234 (0) 902 123 4567</p>
              </div>
            </div>

            {/* WhatsApp */}
            <div className="bg-zinc-50 dark:bg-zinc-900/40 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-start space-x-4">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl text-indigo-500 flex-shrink-0">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Instant WhatsApp Helper</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Chat 24/7: +234 812 987 6543</p>
                <a
                  href="https://wa.me/2348129876543"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline mt-1 inline-block"
                >
                  Launch Quick Chat →
                </a>
              </div>
            </div>

            {/* Location */}
            <div className="bg-zinc-50 dark:bg-zinc-900/40 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-start space-x-4">
              <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-600 dark:text-zinc-400 flex-shrink-0">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Corporate HQ Office</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Plot 12, Block 4, Admiralty Road, Lekki Phase 1, Lagos, Nigeria.</p>
              </div>
            </div>

          </div>

          {/* Form Panel & Mock Map */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm">
              <h3 className="font-display font-bold text-lg text-zinc-950 dark:text-white mb-6">Send a Digital Message</h3>
              
              <AnimatePresence mode="wait">
                {!submitted ? (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Your Full Name *</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Oluwaseun Alabi"
                          className="w-full px-4 py-2.5 rounded-xl border dark:bg-zinc-950 dark:border-zinc-800 text-xs text-zinc-800 dark:text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. seun@gmail.com"
                          className="w-full px-4 py-2.5 rounded-xl border dark:bg-zinc-950 dark:border-zinc-800 text-xs text-zinc-800 dark:text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Subject / Topic</label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="e.g. Inquiry about Balami sheep slot volumes"
                        className="w-full px-4 py-2.5 rounded-xl border dark:bg-zinc-950 dark:border-zinc-800 text-xs text-zinc-800 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Message / Details *</label>
                      <textarea
                        required
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Write your request details here..."
                        className="w-full px-4 py-2.5 rounded-xl border dark:bg-zinc-950 dark:border-zinc-800 text-xs text-zinc-800 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-md shadow-emerald-500/10 transition-all"
                    >
                      <Send className="h-4 w-4" />
                      <span>Send secure message</span>
                    </button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-12 flex flex-col items-center justify-center text-center space-y-4"
                  >
                    <div className="h-14 w-14 bg-emerald-100 dark:bg-emerald-950 rounded-full border border-emerald-500/20 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 className="h-7 w-7 text-emerald-500 animate-bounce" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-lg text-zinc-900 dark:text-white">Message Transmitted!</h4>
                      <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                        Thank you for reaching out. A client support desk officer will respond to your registered email coordinate shortly.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
