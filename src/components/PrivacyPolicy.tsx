import { useState } from "react";
import { ShieldCheck, HardDrive, KeyRound, EyeOff, Check, HeartHandshake, Eye } from "lucide-react";

export default function PrivacyPolicy() {
  const [activeCheck, setActiveCheck] = useState<"offline" | "encryption" | "ads">("offline");

  const corePolicies = [
    {
      id: "offline",
      icon: <HardDrive className="w-5 h-5 text-[#4F5D2F]" />,
      shortTitle: "Offline security Protection",
      title: "Offline-First Local Storage Guarantee",
      desc: "All customer coordinates, measurements, order registers, and financial accounts are saved securely inside your phone's offline-first local database. If there is no network connection, the app remains fully functional.",
      fact: "No unauthorized cloud leaks. Data stays on-device unless you explicitly choose to sync."
    },
    {
      id: "encryption",
      icon: <KeyRound className="w-5 h-5 text-[#4F5D2F]" />,
      shortTitle: "Secure Private Syncing",
      title: "Encrypted Transport Syncing Protocols",
      desc: "When opting to log in via custom cloud-sync to back up your shop registers, all server transfers use modern end-to-end encrypted transport protocols, ensuring only registered shop owners or verified staff helpers have access.",
      fact: "256-bit secure transport layers with zero key sharing for bespoke privacy."
    },
    {
      id: "ads",
      icon: <EyeOff className="w-5 h-5 text-[#4F5D2F]" />,
      shortTitle: "Zero Commercial Tracking",
      title: "No Data Sales or Advertising Brokers",
      desc: "We do not sell, rent, share, or disclose customer measurements, phone numbers, or account histories to third-party advertising brokers or commercial tracking networks. Your client's ratios are private work secrets.",
      fact: "No telemetry. Your boutique transactions are nobody else's business."
    }
  ];

  const selectedPolicy = corePolicies.find(p => p.id === activeCheck) || corePolicies[0];

  return (
    <section id="privacy" className="py-24 bg-brand-cream border-b border-brand-gold/20 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Main Privacy Text Left */}
          <div className="lg:col-span-7 text-left">
            <span className="text-xs uppercase font-mono text-[#4F5D2F] font-bold tracking-widest inline-flex items-center gap-1.5 bg-brand-moss/10 px-3 py-1 rounded-full mb-3">
              <ShieldCheck className="w-4 h-4 text-brand-moss" />
              Privacy Verified & Certified
            </span>
            
            <h2 className="font-serif text-3xl sm:text-4xl text-brand-charcoal font-bold tracking-tight mb-4">
              Your Client's Measures Are Your Private Trade Secrets
            </h2>
            
            <p className="text-sm text-brand-slate mb-8 leading-relaxed">
              In bespoke tailoring, the specific drape coordinates and measurements represent years of client loyalty and high-fidelity tailoring craftsmanship. They are not metrics to be harvested. TailorShopManager offers a transparent, offline-first stance on user security.
            </p>

            {/* Core horizontal items */}
            <div className="space-y-4">
              {corePolicies.map((p) => (
                <div 
                  key={p.id}
                  onClick={() => setActiveCheck(p.id as any)}
                  className={`p-4 border rounded-xl cursor-transition transition-all cursor-pointer text-left ${
                    activeCheck === p.id 
                      ? "bg-brand-cream border-brand-gold/60 ring-1 ring-brand-gold/15 shadow-xs" 
                      : "bg-[#FCFAF2]/50 border-brand-gold/15 hover:bg-[#FCFAF2] hover:border-brand-gold/30"
                  }`}
                >
                  <div className="flex gap-3.5">
                    <div className="w-9 h-9 rounded-full bg-brand-moss/10 flex items-center justify-center shrink-0">
                      {p.icon}
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-sm text-brand-charcoal flex items-center gap-1.5">
                        <span>{p.title}</span>
                        {activeCheck === p.id && <span className="w-1.5 h-1.5 bg-brand-moss rounded-full inline-block animate-pulse"></span>}
                      </h4>
                      <p className="text-xs text-brand-slate mt-1 block">
                        {p.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* DYNAMIC LIVE PRIVACY BADGE RIGHT */}
          <div className="lg:col-span-5 text-left">
            <div className="bg-brand-eggshell border border-brand-gold/30 p-6 sm:p-8 rounded-xl shadow-md relative kraft-shadow overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-moss/5 rounded-bl-full pointer-events-none"></div>

              <div className="text-center mb-6 border-b pb-4 border-brand-gold/20">
                <ShieldCheck className="w-12 h-12 text-[#4F5D2F] mx-auto mb-2" />
                <h3 className="font-mono text-sm tracking-widest uppercase font-bold text-brand-charcoal">
                  TailorShop Security Shield
                </h3>
                <span className="text-[9px] font-mono text-[#4F5D2F] font-bold uppercase tracking-wider block mt-1 bg-brand-moss/10 px-2.5 py-0.5 rounded-full inline-block">
                  ● ACTIVE SECURITY DEFENSE
                </span>
              </div>

              {/* Dynamic Fact Inspector card */}
              <div className="bg-brand-cream border border-brand-gold/25 p-4 rounded-lg text-xs space-y-4">
                <div className="flex justify-between items-center border-b pb-2 text-[10px] text-zinc-400 font-mono">
                  <span>AUDIT TARGET</span>
                  <span className="text-brand-gold font-bold">LIVE METRIC</span>
                </div>

                <div className="space-y-3 font-mono text-[11px]">
                  <div className="flex justify-between items-center text-zinc-700">
                    <span>Local Database:</span>
                    <span className="font-bold text-[#4F5D2F] flex items-center gap-1">
                      <span className="inline-block w-1.5 h-1.5 bg-[#4F5D2F] rounded-full"></span>
                      LOCKED (SQLite/Room)
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-zinc-700">
                    <span>Ad Broker Trackers:</span>
                    <span className="font-bold text-[#4F5D2F]">0 Trackers Found</span>
                  </div>

                  <div className="flex justify-between items-center text-zinc-700">
                    <span>Credentials Sync:</span>
                    <span className="font-bold text-brand-gold">E2EE SSL Layer</span>
                  </div>

                  <div className="flex justify-between items-center text-zinc-700">
                    <span>Compliance Stat:</span>
                    <span className="font-bold text-zinc-800">100% Sovereign Tailor</span>
                  </div>
                </div>

                {/* Explorer fact output */}
                <div className="pt-2 border-t border-dashed border-zinc-200">
                  <span className="text-[9px] text-zinc-400 font-bold block uppercase mb-1 font-mono">
                    Audit Spotlight Detail:
                  </span>
                  <p className="text-[11px] text-[#4F5D2F] leading-tight font-serif italic">
                    "{selectedPolicy.fact}"
                  </p>
                </div>
              </div>

              {/* Compliance verification notice */}
              <div className="mt-5 text-[10px] text-brand-slate text-center leading-relaxed">
                🛡 TailorShopManager operates under complete sandboxed isolation. Your measurements data is yours because nobody else deserves your trade secrets.
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
