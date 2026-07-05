import React, { useState } from 'react';
import { Sparkles, ArrowRight, Check, ShieldCheck, Mail, Phone, Calendar, HeartHandshake, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QuoteRequest } from '../types';

export default function MeatSupply() {
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [meatType, setMeatType] = useState<'Beef' | 'Goat Meat' | 'Ram Meat' | 'Mixed Bulk'>('Beef');
  const [quantityKg, setQuantityKg] = useState<number>(200);
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const [wizardStep, setWizardStep] = useState<'form' | 'processing' | 'success'>('form');

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !contactPerson || !email || !phone || !deliveryLocation) {
      alert('Please fill out all required fields to request a premium quote.');
      return;
    }

    setWizardStep('processing');

    setTimeout(() => {
      setWizardStep('success');
    }, 2000);
  };

  const resetForm = () => {
    setCompanyName('');
    setContactPerson('');
    setEmail('');
    setPhone('');
    setMeatType('Beef');
    setQuantityKg(200);
    setDeliveryLocation('');
    setAdditionalNotes('');
    setWizardStep('form');
  };

  const pricesEstimate = {
    'Beef': 4500, // Naira per kg wholesale
    'Goat Meat': 5500,
    'Ram Meat': 6000,
    'Mixed Bulk': 5200
  };

  const estimatedCost = quantityKg * pricesEstimate[meatType];

  return (
    <section className="py-20 bg-white dark:bg-zinc-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-100 dark:bg-emerald-950/50 px-3.5 py-1.5 rounded-full">
            B2B WHOLESALE MEAT SUPPLY
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-zinc-900 dark:text-white mt-4 tracking-tight">
            Premium Traceable Cold-Chain Meat Logistics
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mt-4 text-base sm:text-lg">
            Supporting supermarkets, upscale hotels, catering services, and large festive events with hygienic, certified beef, goat, and ram meat deliveries.
          </p>
        </div>

        {/* Core Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Info Panels */}
          <div className="lg:col-span-5 space-y-8">
            <h3 className="font-display font-bold text-2xl text-zinc-950 dark:text-white leading-tight">
              Why Hotels & Retailers Choose CowPlugNG
            </h3>

            <div className="space-y-6">
              <div className="flex items-start">
                <div className="h-10 w-10 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0 mr-4">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white">100% Hygienic & Veterinary Signed</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">All animals undergo rigorous anti-mortem and post-mortem screenings by state veterinarians before cold distribution.</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="h-10 w-10 bg-amber-50 dark:bg-amber-950/50 rounded-xl flex items-center justify-center text-amber-500 flex-shrink-0 mr-4">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Reliable Custom Cuts & Butchery</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Our certified butchers slice, weigh, portion, and vacuum-pack to your exact culinary specifications (ribs, loins, flanks, mince).</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl flex items-center justify-center text-indigo-500 flex-shrink-0 mr-4">
                  <HeartHandshake className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Stable Guaranteed Contract Rates</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Avoid volatile market fluctuations. Lock in long-term monthly supply pricing agreements with us.</p>
                </div>
              </div>
            </div>

            {/* Direct Logistics Callout */}
            <div className="p-6 bg-zinc-900 text-white rounded-3xl border border-zinc-800 space-y-4">
              <span className="text-[9px] bg-emerald-950 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full font-mono font-bold">
                LOGISTICS GUARANTEE
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed">
                We operate a proprietary fleet of refrigerated delivery vans. Standard distribution timelines are <strong>under 4 hours</strong> post-slaughter to anywhere in Lagos, Abuja, and Port Harcourt.
              </p>
              <div className="pt-2 flex items-center space-x-4 text-xs font-mono text-zinc-400">
                <span className="flex items-center"><Check className="text-emerald-500 mr-1.5 h-4 w-4" /> Lagos Core</span>
                <span className="flex items-center"><Check className="text-emerald-500 mr-1.5 h-4 w-4" /> Abuja Hub</span>
              </div>
            </div>
          </div>

          {/* Wizard Form Panel */}
          <div className="lg:col-span-7 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-lg">
            
            <AnimatePresence mode="wait">
              
              {wizardStep === 'form' && (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleQuoteSubmit}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-display font-extrabold text-xl text-zinc-900 dark:text-white">
                      Request Bulk Wholesales Quote
                    </h4>
                    <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-3 py-1 rounded-full font-bold">
                      Direct Farm Rates
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                        Company / Hotel Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Radisson Blu Lagos"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border dark:bg-zinc-950 dark:border-zinc-800 text-xs text-zinc-800 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                        Contact Person Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Chef Kingsley"
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border dark:bg-zinc-950 dark:border-zinc-800 text-xs text-zinc-800 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                        Business Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. logistics@radissonlagos.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border dark:bg-zinc-950 dark:border-zinc-800 text-xs text-zinc-800 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                        Direct Phone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. +234 812 345 6789"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border dark:bg-zinc-950 dark:border-zinc-800 text-xs text-zinc-800 dark:text-white focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                        Select Primary Meat Type
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {([ 'Beef', 'Goat Meat', 'Ram Meat', 'Mixed Bulk' ] as const).map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setMeatType(type)}
                            className={`p-2.5 rounded-xl border text-[11px] font-bold transition-all ${
                              meatType === type
                                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-500/10'
                                : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                        Volume Quantity (KG)
                      </label>
                      <input
                        type="number"
                        min="50"
                        max="10000"
                        value={quantityKg}
                        onChange={(e) => setQuantityKg(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-xl border dark:bg-zinc-950 dark:border-zinc-800 text-xs font-mono font-bold text-zinc-800 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                      <span className="text-[9px] text-zinc-400 mt-1 block">*Min order is 50 KG</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                      Delivery Location Premises Address *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kitchen Dock, Radisson Blu Hotel, Ozumba Mbadiwe Ave, Victoria Island, Lagos"
                      value={deliveryLocation}
                      onChange={(e) => setDeliveryLocation(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border dark:bg-zinc-950 dark:border-zinc-800 text-xs text-zinc-800 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                      Custom Cuts & Packing Specifications (Optional)
                    </label>
                    <textarea
                      placeholder="e.g. vacuum-packed loins in 5kg parcels, trim excess back fat, bone-in goat shoulders."
                      rows={2}
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border dark:bg-zinc-950 dark:border-zinc-800 text-xs text-zinc-800 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Pricing Estimator widget */}
                  <div className="bg-emerald-500/5 border border-emerald-500/15 p-4 rounded-2xl flex justify-between items-center text-xs">
                    <div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono uppercase tracking-widest font-extrabold">Estimated wholesale pricing</span>
                      <p className="text-[10px] text-zinc-400 mt-0.5">Based on ₦{pricesEstimate[meatType].toLocaleString()}/kg wholesale farm index</p>
                    </div>
                    <p className="text-xl font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                      ~₦{estimatedCost.toLocaleString()}
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full group py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg flex items-center justify-center transition-all"
                  >
                    Generate Wholesales Proposal
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                </motion.form>
              )}

              {wizardStep === 'processing' && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-24 flex flex-col items-center justify-center space-y-4 text-center"
                >
                  <div className="relative h-16 w-16">
                    <div className="absolute inset-0 rounded-full border-4 border-zinc-100 dark:border-zinc-800"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin"></div>
                  </div>
                  <h4 className="font-display font-extrabold text-lg text-zinc-900 dark:text-white">Analyzing Farm Inventories...</h4>
                  <p className="text-xs text-zinc-500 max-w-sm">
                    Our cold-chain logistics manager is aligning ready-to-slaughter livestock batches to fulfill your contract.
                  </p>
                </motion.div>
              )}

              {wizardStep === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-12 flex flex-col items-center justify-center space-y-6 text-center"
                >
                  <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-500/20 rounded-full flex items-center justify-center">
                    <Check className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-display font-extrabold text-2xl text-zinc-900 dark:text-white">Wholesale Ticket Raised!</h4>
                    <p className="text-xs text-zinc-500 mt-1.5 max-w-sm mx-auto">
                      Thank you, <strong className="text-zinc-800 dark:text-zinc-100">{contactPerson}</strong>. Our corporate account manager has received your draft proposal.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 p-5 rounded-2xl w-full text-xs text-left space-y-2.5 font-mono">
                    <div className="flex justify-between"><span className="text-zinc-400">Company:</span> <strong className="text-zinc-800 dark:text-zinc-200">{companyName}</strong></div>
                    <div className="flex justify-between"><span className="text-zinc-400">Order Specs:</span> <strong className="text-zinc-800 dark:text-zinc-200">{quantityKg}kg {meatType}</strong></div>
                    <div className="flex justify-between"><span className="text-zinc-400">Rate Index:</span> <strong className="text-emerald-600">Locked at ₦{pricesEstimate[meatType].toLocaleString()}/kg</strong></div>
                    <div className="flex justify-between"><span className="text-zinc-400">Proposal Ref:</span> <strong className="text-zinc-800 dark:text-zinc-200">CPB-PRO-{Math.floor(Math.random() * 90000) + 10000}</strong></div>
                  </div>

                  <p className="text-[11px] text-zinc-400 leading-relaxed max-w-sm">
                    A formal pricing invoice, slaughter certification, and cold-chain route schedule have been dispatched to <strong>{email}</strong>.
                  </p>

                  <button
                    onClick={resetForm}
                    className="w-full py-3.5 bg-zinc-900 text-white rounded-xl font-bold text-xs"
                  >
                    Raise Another Quote
                  </button>
                </motion.div>
              )}

            </AnimatePresence>

          </div>

        </div>

      </div>
    </section>
  );
}
