import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Briefcase, Plus, Search, Filter, Edit, Trash2, CheckCircle, XCircle, Mail, MapPin, Users } from 'lucide-react';

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

interface Applicant {
  id: string;
  opportunityId: string;
  name: string;
  email: string;
  phone: string;
  state: string;
  lga: string;
  experience: string;
  status: 'Pending' | 'Shortlisted' | 'Approved' | 'Rejected';
  appliedDate: string;
}

const dummyOpportunities: Opportunity[] = [
  {
    id: '1',
    title: 'Senior Livestock Custodian',
    location: 'Lagos, Nigeria',
    type: 'Full-Time',
    positions: 3,
    salary: 'Negotiable',
    description: 'We are looking for an experienced livestock custodian...',
    requirements: ['5+ years experience', 'Knowledge of animal health'],
    deadline: '2026-08-01',
    datePosted: '2026-07-01',
    status: 'Open'
  }
];

const dummyApplicants: Applicant[] = [
  {
    id: '1',
    opportunityId: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+23480000000',
    state: 'Lagos',
    lga: 'Ikeja',
    experience: '5+ years',
    status: 'Pending',
    appliedDate: '2026-07-05'
  }
];

export default function AdminOpportunities() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(dummyOpportunities);
  const [applicants, setApplicants] = useState<Applicant[]>(dummyApplicants);
  const [activeView, setActiveView] = useState<'opportunities' | 'applicants'>('opportunities');
  const [showOppModal, setShowOppModal] = useState(false);
  const [editingOpp, setEditingOpp] = useState<Opportunity | null>(null);

  const handleDeleteOpp = (id: string) => {
    setOpportunities(prev => prev.filter(o => o.id !== id));
  };

  const handleStatusToggle = (id: string) => {
    setOpportunities(prev => prev.map(o => o.id === id ? { ...o, status: o.status === 'Open' ? 'Closed' : 'Open' } : o));
  };

  const handleUpdateApplicantStatus = (id: string, status: Applicant['status']) => {
    setApplicants(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const handleOppSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowOppModal(false);
    setEditingOpp(null);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-2 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
          <button 
            onClick={() => setActiveView('opportunities')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeView === 'opportunities' ? 'bg-white dark:bg-zinc-900 shadow text-emerald-600 dark:text-emerald-400' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}
          >
            Manage Opportunities
          </button>
          <button 
            onClick={() => setActiveView('applicants')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeView === 'applicants' ? 'bg-white dark:bg-zinc-900 shadow text-emerald-600 dark:text-emerald-400' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}
          >
            Review Applicants
          </button>
        </div>

        {activeView === 'opportunities' && (
          <button 
            onClick={() => {
              setEditingOpp(null);
              setShowOppModal(true);
            }}
            className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Opportunity
          </button>
        )}
      </div>

      {activeView === 'opportunities' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-zinc-900/50 text-xs font-bold text-zinc-500 uppercase tracking-wider border-b border-slate-200 dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-4">Title & Location</th>
                  <th className="px-6 py-4">Type & Positions</th>
                  <th className="px-6 py-4">Deadline</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {opportunities.map(opp => (
                  <tr key={opp.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-zinc-900 dark:text-white">{opp.title}</div>
                      <div className="text-xs text-zinc-500 flex items-center mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        {opp.location}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-zinc-900 dark:text-zinc-300">{opp.type}</div>
                      <div className="text-xs text-zinc-500 flex items-center mt-1">
                        <Users className="h-3 w-3 mr-1" />
                        {opp.positions} Available
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-500">{new Date(opp.deadline).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleStatusToggle(opp.id)}
                        className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full border ${opp.status === 'Open' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'}`}
                      >
                        {opp.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => { setEditingOpp(opp); setShowOppModal(true); }} className="p-2 text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 bg-zinc-50 dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDeleteOpp(opp.id)} className="p-2 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 bg-zinc-50 dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {opportunities.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                      No opportunities found. Click "Create Opportunity" to add one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeView === 'applicants' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex flex-wrap gap-4 items-center justify-between bg-zinc-50 dark:bg-zinc-900/50">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search applicants..." 
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-zinc-400" />
              <select className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/50">
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-zinc-900/50 text-xs font-bold text-zinc-500 uppercase tracking-wider border-b border-slate-200 dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-4">Applicant</th>
                  <th className="px-6 py-4">Location & Exp</th>
                  <th className="px-6 py-4">Applied Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {applicants.map(app => (
                  <tr key={app.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-zinc-900 dark:text-white">{app.name}</div>
                      <div className="text-xs text-zinc-500 flex flex-col space-y-1 mt-1">
                        <span>{app.email}</span>
                        <span>{app.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400 text-xs space-y-1">
                      <div>{app.lga}, {app.state}</div>
                      <div className="font-bold text-emerald-600 dark:text-emerald-400">{app.experience} Exp.</div>
                    </td>
                    <td className="px-6 py-4 text-zinc-500">{new Date(app.appliedDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full border ${
                        app.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 
                        app.status === 'Shortlisted' ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' :
                        app.status === 'Rejected' ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' :
                        'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => handleUpdateApplicantStatus(app.id, 'Shortlisted')} title="Shortlist" className="p-2 text-zinc-400 hover:text-amber-600 bg-zinc-50 dark:bg-zinc-800 hover:bg-amber-50 rounded-lg transition-colors">
                        <CheckCircle className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleUpdateApplicantStatus(app.id, 'Approved')} title="Approve" className="p-2 text-zinc-400 hover:text-emerald-600 bg-zinc-50 dark:bg-zinc-800 hover:bg-emerald-50 rounded-lg transition-colors">
                        <CheckCircle className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleUpdateApplicantStatus(app.id, 'Rejected')} title="Reject" className="p-2 text-zinc-400 hover:text-red-600 bg-zinc-50 dark:bg-zinc-800 hover:bg-red-50 rounded-lg transition-colors">
                        <XCircle className="h-4 w-4" />
                      </button>
                      <button title="Message" className="p-2 text-zinc-400 hover:text-blue-600 bg-zinc-50 dark:bg-zinc-800 hover:bg-blue-50 rounded-lg transition-colors">
                        <Mail className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Opp Modal */}
      <AnimatePresence>
        {showOppModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowOppModal(false)} className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center">
                <h2 className="font-bold text-xl">{editingOpp ? 'Edit Opportunity' : 'Create Opportunity'}</h2>
              </div>
              <div className="p-6 overflow-y-auto">
                <form onSubmit={handleOppSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1">Title</label>
                      <input type="text" defaultValue={editingOpp?.title} required className="w-full border dark:border-zinc-800 rounded-xl px-4 py-2 bg-transparent" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">Location</label>
                      <input type="text" defaultValue={editingOpp?.location} required className="w-full border dark:border-zinc-800 rounded-xl px-4 py-2 bg-transparent" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">Type</label>
                      <select defaultValue={editingOpp?.type} className="w-full border dark:border-zinc-800 rounded-xl px-4 py-2 bg-transparent">
                        <option>Full-Time</option>
                        <option>Part-Time</option>
                        <option>Contract</option>
                        <option>Seasonal</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">Positions Available</label>
                      <input type="number" defaultValue={editingOpp?.positions || 1} min="1" required className="w-full border dark:border-zinc-800 rounded-xl px-4 py-2 bg-transparent" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">Salary</label>
                      <input type="text" defaultValue={editingOpp?.salary || 'Negotiable'} required className="w-full border dark:border-zinc-800 rounded-xl px-4 py-2 bg-transparent" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">Deadline</label>
                      <input type="date" defaultValue={editingOpp?.deadline} required className="w-full border dark:border-zinc-800 rounded-xl px-4 py-2 bg-transparent" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Description</label>
                    <textarea rows={4} defaultValue={editingOpp?.description} required className="w-full border dark:border-zinc-800 rounded-xl px-4 py-2 bg-transparent"></textarea>
                  </div>
                  <div className="pt-4 flex justify-end gap-3">
                    <button type="button" onClick={() => setShowOppModal(false)} className="px-5 py-2 font-bold text-sm">Cancel</button>
                    <button type="submit" className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl text-sm">{editingOpp ? 'Update' : 'Create'}</button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
