import { Shield, Sprout, ShoppingCart, CheckCircle, ArrowRight, Eye, Heart, Truck, Image as ImageIcon, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import PricingPackages from './PricingPackages';

interface AboutProps {
  onRegisterFarmer: () => void;
  onLearnMoreMarketplace: () => void;
}

export default function About({ onRegisterFarmer, onLearnMoreMarketplace }: AboutProps) {
  
  const focusSteps = [
    {
      title: 'Buy Livestock Today',
      description: 'Select from certified, healthy cows, goats, or rams inside our verified digital marketplace.',
      icon: <ShoppingCart className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
    },
    {
      title: 'We Raise It For You',
      description: 'Our professional, certified pastoralist partners raise your animals in highly secure, premium green pastures.',
      icon: <Sprout className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
    },
    {
      title: 'Regular Updates',
      description: 'Receive professional, regular updates on your livestock including photos, videos, and manual weight logs from our veterinary team.',
      icon: <ImageIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
    },
    {
      title: 'Custom Feeding Plans',
      description: 'Select your preferred nutrition regime—from standard pasture grass to premium high-density supplement mixes.',
      icon: <Sprout className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
    },
    {
      title: 'Full Veterinary Logs',
      description: 'Instant visibility of health reports, anti-parasite drenching histories, and regular vaccine tags.',
      icon: <Shield className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
    },
    {
      title: 'Deliver Whenever Needed',
      description: 'Request live transport directly to your wedding, festival, business premises, or home whenever you are ready.',
      icon: <Truck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
    }
  ];

  return (
    <section className="py-20 bg-slate-50 dark:bg-zinc-900/40 transition-colors" id="about">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/50 border border-slate-200/80 dark:border-emerald-500/10 px-3.5 py-1.5 rounded-full">
            HOW COWPLUG WORKS
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white mt-4 tracking-tight">
            Digital Livestock Ownership Made Simple
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mt-4 text-base sm:text-lg leading-relaxed">
            We operate as a highly transparent, professional livestock management partner. No complex herding or land setup needed. Buy your animals online, track their growth, and summon delivery at your convenience.
          </p>
        </div>

        {/* Vision & Mission Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <motion.div
            whileHover={{ y: -4 }}
            className="p-8 rounded-3xl bg-white dark:bg-zinc-950 border border-slate-200/60 dark:border-zinc-800/80 shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center mb-6">
                <Eye className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="font-display font-bold text-xl text-zinc-900 dark:text-white">Our Vision</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed mt-3">
                To become Africa's most trusted digital livestock ownership platform by making livestock purchasing, management, and ownership simple, transparent, and accessible to everyone.
              </p>
            </div>
            <div className="mt-6 flex items-center text-xs font-mono text-zinc-400 uppercase tracking-widest">
              <span>Convenience & Trust</span>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="p-8 rounded-3xl bg-white dark:bg-zinc-950 border border-slate-200/60 dark:border-zinc-800/80 shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mb-6">
                <Heart className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-display font-bold text-xl text-zinc-900 dark:text-white">Our Mission</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed mt-3">
                To connect livestock buyers with trusted sellers while providing professional farm management, transparent pricing, digital tracking, animal health monitoring, and reliable delivery.
              </p>
            </div>
            <div className="mt-6 flex items-center text-xs font-mono text-zinc-400 uppercase tracking-widest">
              <span>Aesthetic Stewardship</span>
            </div>
          </motion.div>
        </div>

        {/* Homepage Focus points */}
        <div className="space-y-12">
          <div className="text-center max-w-xl mx-auto">
            <h3 className="font-display font-extrabold text-2xl text-zinc-900 dark:text-white">Our Service Experience Blueprint</h3>
            <p className="text-zinc-500 text-xs sm:text-sm mt-2">Everything you need to secure and raise your animals with zero headache.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {focusSteps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="bg-white dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800/80 rounded-2xl p-6 hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mb-4">
                    {step.icon}
                  </div>
                  <h4 className="font-display font-bold text-base text-zinc-900 dark:text-white">{step.title}</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">{step.description}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-50 dark:border-zinc-900 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-between">
                  <span>Step 0{idx + 1}</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">Active •</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Pricing Packages Section */}
        <PricingPackages onChoosePackage={onLearnMoreMarketplace} />

        {/* Call to action section for Farmers registration & marketplace browse */}
        <div className="rounded-3xl bg-zinc-900 text-white p-8 sm:p-12 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
            <svg className="h-96 w-96 text-white" fill="currentColor" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" />
            </svg>
          </div>
          
          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center space-x-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 text-[11px] font-bold text-emerald-400 font-mono uppercase">
              <Sparkles className="h-3 w-3" />
              <span>Certified Pastoral Network</span>
            </div>
            <h3 className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl tracking-tight leading-tight">
              Are you a local pastoralist or professional herdsman?
            </h3>
            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
              We empower local herdsmen across Nigeria with professional veterinary registers, animal health guidelines, and high-quality nutrition support. Plug your farm into CowPlugNG and get paid professional monthly management fees.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={onRegisterFarmer}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-emerald-600/10"
              >
                Apply to Raise Livestock
              </button>
              <button
                onClick={onLearnMoreMarketplace}
                className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold rounded-xl text-xs sm:text-sm border border-zinc-700 transition-all"
              >
                Browse Livestock Catalogue
              </button>
            </div>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="space-y-8 pt-12 border-t border-slate-200/50 dark:border-zinc-800/50">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest bg-amber-50 dark:bg-amber-950/30 border border-slate-200/80 dark:border-amber-500/10 px-3.5 py-1.5 rounded-full">
              FUTURE ROADMAP
            </span>
            <h3 className="font-display font-extrabold text-2xl text-zinc-900 dark:text-white mt-4">Coming Soon</h3>
            <p className="text-zinc-500 text-xs sm:text-sm mt-2">
              We focus on honest, professional livestock care and transparent records today. Here is the advanced technology we plan to implement in the future:
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { title: 'GPS Animal Tracking', desc: 'Real-time satellite coordinates' },
              { title: 'Smart Ear Tags', desc: 'Automated identity registers' },
              { title: 'AI Health Monitoring', desc: 'Predictive health trends' },
              { title: 'Automated Weight Tracking', desc: 'Electronic load-cell scaling' },
              { title: 'Livestock Insurance Integration', desc: 'Third-party coverage' },
              { title: 'Veterinary Marketplace', desc: 'Direct-to-ranch veterinary logs' },
              { title: 'Mobile App', desc: 'iOS & Android management portals' }
            ].map((f, idx) => (
              <div key={idx} className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200/60 dark:border-zinc-800/80 relative overflow-hidden flex flex-col justify-between h-28">
                <span className="self-start text-[8px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400">
                  Future Feature
                </span>
                <div>
                  <h5 className="font-display font-bold text-xs sm:text-sm text-zinc-900 dark:text-white mt-2">{f.title}</h5>
                  <p className="text-[10px] text-zinc-400 mt-1">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
