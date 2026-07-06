import React from 'react';
import { motion } from 'motion/react';
import { FileText, CheckCircle, Clock, XCircle, Mail, MapPin } from 'lucide-react';
import { User } from '../types';

interface MyApplicationsProps {
  currentUser: User | null;
}

export default function MyApplications({ currentUser }: MyApplicationsProps) {
  // Dummy data
  const myApplications = [
    {
      id: 'app-1',
      jobTitle: 'Senior Livestock Custodian',
      location: 'Lagos, Nigeria',
      status: 'Pending',
      appliedDate: '2026-07-05',
      messages: []
    },
    {
      id: 'app-2',
      jobTitle: 'Veterinary Technician',
      location: 'Abuja, Nigeria',
      status: 'Shortlisted',
      appliedDate: '2026-06-28',
      messages: [
        { id: 'm1', from: 'CowPlugNG HR', text: 'We would like to invite you for a brief online interview this Friday.', date: '2026-07-01' }
      ]
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      <div className="border-b border-slate-200 dark:border-zinc-800 pb-4">
        <h2 className="text-xl font-black text-zinc-950 dark:text-white">My Applications</h2>
        <p className="text-xs text-zinc-500 mt-1">Track the status of your opportunity applications and messages.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {myApplications.map(app => (
          <div key={app.id} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900 dark:text-white text-base">{app.jobTitle}</h3>
                    <div className="text-xs text-zinc-500 flex items-center mt-0.5">
                      <MapPin className="h-3 w-3 mr-1" />
                      {app.location}
                    </div>
                  </div>
                </div>
                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full border ${
                  app.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 
                  app.status === 'Shortlisted' ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' :
                  app.status === 'Rejected' ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' :
                  'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
                }`}>
                  {app.status}
                </span>
              </div>
              
              <div className="text-xs text-zinc-500 flex items-center mb-4">
                <Clock className="h-3.5 w-3.5 mr-1" />
                Applied on: {new Date(app.appliedDate).toLocaleDateString()}
              </div>

              {app.messages.length > 0 && (
                <div className="mt-4 border-t border-slate-100 dark:border-zinc-800 pt-4">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center mb-2">
                    <Mail className="h-3.5 w-3.5 mr-1.5" />
                    Messages from CowPlugNG
                  </h4>
                  <div className="space-y-2 text-xs">
                    {app.messages.map(msg => (
                      <div key={msg.id} className="bg-zinc-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">{msg.from}</span>
                          <span className="text-zinc-400 text-[10px]">{new Date(msg.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-zinc-600 dark:text-zinc-400">{msg.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {app.status === 'Shortlisted' && (
              <div className="px-5 py-3 bg-amber-50 dark:bg-amber-900/10 border-t border-amber-100 dark:border-amber-900/30 flex items-center text-xs text-amber-800 dark:text-amber-400 font-bold">
                <CheckCircle className="h-4 w-4 mr-2" />
                You have an upcoming interview invitation!
              </div>
            )}
          </div>
        ))}
      </div>
      {myApplications.length === 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center text-zinc-500">
          <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p className="text-sm font-bold text-zinc-900 dark:text-white">No Applications Found</p>
          <p className="text-xs mt-1">You haven't applied to any opportunities yet.</p>
        </div>
      )}
    </div>
  );
}
