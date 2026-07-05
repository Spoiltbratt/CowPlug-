import { TrendingUp, Mail, Phone, MapPin, ShieldCheck, Heart, Github } from 'lucide-react';

interface FooterProps {
  setActiveSection: (sec: string) => void;
}

export default function Footer({ setActiveSection }: FooterProps) {
  
  const handleLinkClick = (id: string) => {
    setActiveSection(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-zinc-950 text-zinc-400 border-t border-zinc-900 pt-16 pb-8 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-zinc-900">
          
          {/* Logo & Intro */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center cursor-pointer" onClick={() => handleLinkClick('home')}>
              <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white mr-3">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <span className="font-display font-bold text-xl tracking-tight text-white flex items-center">
                  Cow<span className="text-emerald-500">Plug</span>
                  <span className="text-amber-500 font-extrabold text-sm ml-0.5">NG</span>
                </span>
                <p className="text-[9px] text-zinc-500 font-mono tracking-widest uppercase -mt-1 font-bold">Livestock Management</p>
              </div>
            </div>

            <p className="text-xs leading-relaxed max-w-sm text-zinc-500">
              CowPlugNG connects local herdsmen, wholesale meat off-takers, and fresh meat buyers inside a digital circular ecosystem. Maximizing food safety and scaling modern farm operations across Sub-Saharan Africa.
            </p>

            <div className="flex items-center space-x-2 text-xs text-zinc-500 font-sans">
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" />
              <span>RFID Tracked & Verified Biosecurity.</span>
            </div>
          </div>

          {/* Quick Nav links */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-zinc-200 text-xs font-bold uppercase tracking-widest">Platform Map</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => handleLinkClick('home')} className="hover:text-emerald-400 transition-colors">
                  Home Portfolio
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick('about')} className="hover:text-emerald-400 transition-colors">
                  Platform Core Mechanics
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick('marketplace')} className="hover:text-emerald-400 transition-colors">
                  Livestock Marketplace
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick('meatsupply')} className="hover:text-emerald-400 transition-colors">
                  B2B Meat Supply Logistics
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick('blog-faq')} className="hover:text-emerald-400 transition-colors">
                  FAO & Industry Reports
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick('admin-login')} className="text-amber-500 font-bold hover:text-amber-400 transition-colors">
                  🛡️ Admin Dashboard Console
                </button>
              </li>
            </ul>
          </div>

          {/* Contact coordinates summary */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-zinc-200 text-xs font-bold uppercase tracking-widest">Official Support Coordinates</h4>
            <ul className="space-y-3 text-xs text-zinc-500">
              <li className="flex items-start">
                <MapPin className="h-4 w-4 mr-2.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Plot 12, Block 4, Admiralty Road, Lekki Phase 1, Lagos, Nigeria.</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-4 w-4 mr-2.5 text-amber-500 flex-shrink-0" />
                <span>+234 (0) 803 456 7891</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-4 w-4 mr-2.5 text-indigo-400 flex-shrink-0" />
                <span>support@cowplug.ng</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Legal and copy rights */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center text-[11px] text-zinc-600 gap-4">
          <p>© 2026 CowPlugNG (CowPlug Technologies Ltd). All Rights Reserved.</p>
          
          <div className="flex space-x-4">
            <a href="#privacy" className="hover:underline">Privacy Policy</a>
            <span>•</span>
            <a href="#terms" className="hover:underline">Terms of Service</a>
            <span>•</span>
            <a href="#sec" className="hover:underline">Secure Escrow Policy</a>
          </div>

          <p className="flex items-center">
            Secured via CBN-licensed payment channels.
          </p>
        </div>

      </div>
    </footer>
  );
}
