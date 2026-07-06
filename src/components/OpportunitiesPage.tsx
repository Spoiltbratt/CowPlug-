import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Briefcase, MapPin, Clock, Users, X, Send, Search, CheckCircle, Upload } from 'lucide-react';
import { User } from '../types';

interface Opportunity {
  id: string;
  title: string;
  location: string;
  type: string;
  positions: number;
  salary: string;
  description: string;
  requirements: string[];
  deadline: string;
  datePosted: string;
  status: 'Open' | 'Closed';
}

interface OpportunitiesPageProps {
  currentUser: User | null;
  onNavigateHome: () => void;
}

// Dummy data for now, ideally fetched from a DB
const dummyOpportunities: Opportunity[] = [
  {
    id: '1',
    title: 'Senior Livestock Custodian',
    location: 'Lagos, Nigeria',
    type: 'Full-Time',
    positions: 3,
    salary: 'Negotiable',
    description: 'We are looking for an experienced livestock custodian to oversee our premium goat herd...',
    requirements: ['5+ years experience', 'Knowledge of animal health', 'Ability to manage junior staff'],
    deadline: '2026-08-01',
    datePosted: '2026-07-01',
    status: 'Open'
  },
  {
    id: '2',
    title: 'Veterinary Technician',
    location: 'Abuja, Nigeria',
    type: 'Contract',
    positions: 1,
    salary: 'Negotiable',
    description: 'Provide medical care and routine checkups for all farm animals in the Abuja facility.',
    requirements: ['Degree in Veterinary Medicine', 'Valid practice license'],
    deadline: '2026-07-31',
    datePosted: '2026-07-02',
    status: 'Open'
  }
];

export default function OpportunitiesPage({ currentUser, onNavigateHome }: OpportunitiesPageProps) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(dummyOpportunities);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleApply = (opp: Opportunity) => {
    setSelectedOpportunity(opp);
    setShowApplicationForm(true);
    setIsSubmitted(false);
  };

  const closeForm = () => {
    setShowApplicationForm(false);
    setSelectedOpportunity(null);
  };

  const handleApplicationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, send application to backend
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-zinc-900 dark:text-white">
              Available Opportunities
            </h1>
            <p className="text-zinc-500 mt-2 text-sm sm:text-base max-w-2xl">
              Join our team of dedicated professionals and help us build the future of digital livestock management.
            </p>
          </div>
          <button 
            onClick={onNavigateHome}
            className="px-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Back to Home
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.filter(o => o.status === 'Open').map(opp => (
            <motion.div 
              key={opp.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="h-12 w-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Briefcase className="h-6 w-6" />
                  </div>
                  <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                    {opp.type}
                  </span>
                </div>
                
                <h3 className="font-display font-bold text-lg text-zinc-900 dark:text-white mb-2">{opp.title}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 line-clamp-2">{opp.description}</p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-xs text-zinc-600 dark:text-zinc-400">
                    <MapPin className="h-3.5 w-3.5 mr-2 opacity-70" />
                    {opp.location}
                  </div>
                  <div className="flex items-center text-xs text-zinc-600 dark:text-zinc-400">
                    <Users className="h-3.5 w-3.5 mr-2 opacity-70" />
                    {opp.positions} Position{opp.positions > 1 ? 's' : ''}
                  </div>
                  <div className="flex items-center text-xs text-zinc-600 dark:text-zinc-400">
                    <Clock className="h-3.5 w-3.5 mr-2 opacity-70" />
                    Deadline: {new Date(opp.deadline).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => handleApply(opp)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-colors"
              >
                Apply Now
              </button>
            </motion.div>
          ))}
        </div>

      </div>

      {/* Application Form Modal */}
      <AnimatePresence>
        {showApplicationForm && selectedOpportunity && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeForm}
              className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
                <div>
                  <h2 className="font-display font-extrabold text-xl text-zinc-900 dark:text-white">Apply for {selectedOpportunity.title}</h2>
                  <p className="text-xs text-zinc-500 mt-1">{selectedOpportunity.location}</p>
                </div>
                <button onClick={closeForm} className="p-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar">
                {isSubmitted ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="font-display font-bold text-xl text-zinc-900 dark:text-white mb-2">Application Submitted!</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto text-sm leading-relaxed mb-8">
                      Your application has been submitted successfully. We will review your application and contact you if you are shortlisted.
                    </p>
                    <button 
                      onClick={closeForm}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-colors"
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplicationSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">Full Name</label>
                        <input required type="text" className="w-full bg-zinc-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all dark:text-white" placeholder="John Doe" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">Phone Number</label>
                        <input required type="tel" className="w-full bg-zinc-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all dark:text-white" placeholder="+234..." />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">Email Address <span className="font-normal text-zinc-400">(Optional)</span></label>
                        <input type="email" className="w-full bg-zinc-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all dark:text-white" placeholder="john@example.com" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">Years of Experience</label>
                        <select className="w-full bg-zinc-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all dark:text-white">
                          <option>0-2 years</option>
                          <option>3-5 years</option>
                          <option>5+ years</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">State</label>
                        <input required type="text" className="w-full bg-zinc-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all dark:text-white" placeholder="Lagos" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">Local Government Area</label>
                        <input required type="text" className="w-full bg-zinc-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all dark:text-white" placeholder="Ikeja" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">Residential Address</label>
                      <input required type="text" className="w-full bg-zinc-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all dark:text-white" placeholder="Full address" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">Upload CV <span className="font-normal text-zinc-400">(Optional)</span></label>
                        <div className="border border-dashed border-slate-300 dark:border-zinc-700 rounded-xl p-4 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950/50 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer text-zinc-500">
                          <Upload className="h-5 w-5 mb-2" />
                          <span className="text-xs">Click to upload PDF</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">Upload National ID <span className="font-normal text-zinc-400">(Optional)</span></label>
                        <div className="border border-dashed border-slate-300 dark:border-zinc-700 rounded-xl p-4 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950/50 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer text-zinc-500">
                          <Upload className="h-5 w-5 mb-2" />
                          <span className="text-xs">Click to upload Image/PDF</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">Additional Notes</label>
                      <textarea rows={3} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all dark:text-white resize-none" placeholder="Tell us why you are a good fit..."></textarea>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex justify-end space-x-3">
                      <button 
                        type="button"
                        onClick={closeForm}
                        className="px-5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold rounded-xl text-sm transition-all hover:bg-slate-50 dark:hover:bg-zinc-800"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm flex items-center shadow-lg shadow-emerald-600/20 transition-all"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Submit Application
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
