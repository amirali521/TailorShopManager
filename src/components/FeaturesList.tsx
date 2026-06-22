import { useState } from "react";
import { 
  Ruler, Ticket, Users, BookOpen, Layers, 
  Sparkles, CheckCircle, Flame, HeartHandshake, FileCheck 
} from "lucide-react";
import { SIZING_TEMPLATES, SizingTemplate } from "../types";

export default function FeaturesList() {
  const [selectedExplorerTemplate, setSelectedExplorerTemplate] = useState<string>("dress_shirt");

  const coreFeatures = [
    {
      id: "sizing",
      icon: <Ruler className="w-6 h-6" />,
      title: "Master Sizing Registry",
      badge: "Custom Templates",
      description: "Keep perfect measurements for customers. Prebuilt templates for classic dress shirts, trousers, custom suits, and waistcoats, with custom fields for specialized style preferences.",
      bullets: [
        "Sizing guidelines in clear English parameters",
        "Add unlimited custom measurement fields",
        "Durable offline registry securely saved instantly",
        "Quick search by name or contact coordinates"
      ]
    },
    {
      id: "tickets",
      icon: <Ticket className="w-6 h-6" />,
      title: "High-Fidelity Retro Sizing Tickets",
      badge: "Vintage Receipts",
      description: "Create visually stunning vintage receipt tickets displaying sizing data, proprietor credentials, and bill-to values. Supports instant Sharing, Printing, and WhatsApp delivery directly to clients.",
      bullets: [
        "Aesthetic tear-off ticket coupon styling",
        "Export and share instantly as highly readable text",
        "Send sizing updates directly via WhatsApp in one click",
        "Proprietor credentials and shop branding headers"
      ]
    },
    {
      id: "ledger",
      icon: <Users className="w-6 h-6" />,
      title: "Handcrafted Staff Directory & Wage Ledger",
      badge: "Wage Ledger Logs",
      description: "Register shop workers, log piece-rate work orders in one click, and track unpaid wages, balance ledgers, and payout slips in real-time.",
      bullets: [
        "One-tap wage logger for completed tailoring items",
        "Unpaid balances ledger per helper assistant",
        "Detailed payout receipts for staff record safety",
        "Register workspace workers & contact list"
      ]
    }
  ];

  const activeExplorer = SIZING_TEMPLATES.find(t => t.id === selectedExplorerTemplate) || SIZING_TEMPLATES[0];

  return (
    <section id="features" className="py-20 bg-brand-eggshell border-b border-brand-gold/20 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* SECTION HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase font-mono text-brand-gold font-bold tracking-widest block mb-2">
            ❖ ATELIER APPARATUS
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl text-brand-charcoal font-bold tracking-tight mb-4">
            Powerful Core App Features
          </h2>
          <p className="text-base text-brand-slate">
            Engineered exclusively to streamline the chaotic physical ledger. Maintain premium quality records for the modern bespoke atelier.
          </p>
          <div className="w-24 h-0.5 bg-brand-gold mx-auto mt-6"></div>
        </div>

        {/* 3-COLUMN CORE FEATURES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {coreFeatures.map((feat) => (
            <div 
              key={feat.id} 
              className="bg-brand-cream border border-brand-gold/30 p-8 rounded-xl shadow-xs hover:shadow-md transition-all duration-300 relative group flex flex-col justify-between kraft-shadow"
            >
              {/* Feature Icon Container */}
              <div>
                <span className="absolute top-4 right-4 bg-brand-gold/10 text-brand-gold text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase">
                  {feat.badge}
                </span>

                <div className="w-12 h-12 rounded bg-brand-charcoal text-brand-cream flex items-center justify-center mb-6 group-hover:bg-brand-gold transition-colors duration-300 border border-brand-gold">
                  {feat.icon}
                </div>

                <h3 className="font-serif text-xl font-bold text-brand-charcoal mb-3">
                  {feat.title}
                </h3>
                
                <p className="text-sm text-brand-slate mb-6">
                  {feat.description}
                </p>
              </div>

              {/* Bullet details */}
              <ul className="space-y-2 border-t border-brand-gold/15 pt-5 text-xs text-brand-slate text-left">
                {feat.bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-brand-moss mt-0.5 select-none text-[10px]">✔</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* BLUEPRINT TEMPLATE EXPLORER */}
        <div id="sizing-explorer-widget" className="bg-brand-cream border border-brand-gold/30 rounded-xl overflow-hidden kraft-shadow p-6 sm:p-10 scroll-mt-20">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Explorer Info & Tab Controls */}
            <div className="lg:w-2/5 text-left flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-brand-moss font-bold tracking-widest inline-flex items-center gap-1 bg-brand-moss/10 px-2.5 py-0.5 rounded-full mb-3">
                  <Sparkles className="w-3 h-3" />
                  Sizing Blueprints Explorer
                </span>
                
                <h3 className="font-serif text-2xl sm:text-3xl text-brand-charcoal font-bold tracking-tight mb-3">
                  Traditional Sizing Specifications
                </h3>
                
                <p className="text-sm text-brand-slate mb-6">
                  Traditional bespoke fashion requires distinct tracking profiles. Explore our prebuilt configurations tailored for boutique workspace precision.
                </p>
              </div>

              {/* Nav buttons for templates */}
              <div className="space-y-1.5 bg-brand-eggshell/50 p-2 rounded-lg border border-brand-gold/15">
                {SIZING_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => setSelectedExplorerTemplate(tpl.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded text-xs font-bold transition-all text-left cursor-pointer ${
                      selectedExplorerTemplate === tpl.id
                        ? "bg-brand-gold text-[#FCFAF2] shadow-xs"
                        : "text-brand-slate hover:bg-brand-eggshell"
                    }`}
                  >
                    <span>{tpl.name}</span>
                    {tpl.urduName && (
                      <span className="font-serif font-normal opacity-85 text-[10px]">
                        {tpl.urduName}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Display Active Blueprint Card (The design representation of a custom layout config) */}
            <div className="lg:w-3/5 text-left flex flex-col bg-[#FCFAF2] p-6 rounded-xl border border-brand-gold/20">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-4 border-b border-dashed border-brand-gold/30 pb-3">
                <div>
                  <h4 className="font-serif text-lg font-bold text-brand-charcoal">
                    {activeExplorer.name} {activeExplorer.urduName ? `(${activeExplorer.urduName})` : ""}
                  </h4>
                  <p className="text-xs text-brand-slate mt-0.5">
                    {activeExplorer.description}
                  </p>
                </div>
                <span className="text-[10px] bg-[#4F5D2F]/10 text-[#4F5D2F] font-mono px-2.5 py-1 rounded font-bold shrink-0">
                  {activeExplorer.fields.length} Sizing Attributes
                </span>
              </div>

              {/* Attributes Checklist Grid */}
              <p className="text-[10px] uppercase font-mono text-brand-gold font-bold mb-3">
                PRESET COORDINATES RECORDED IN THE MOBILE APP:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                {activeExplorer.fields.map((field, idx) => (
                  <div key={idx} className="bg-brand-cream border border-brand-gold/10 p-3 rounded flex items-center justify-between text-xs hover:border-brand-gold/20 transition-all">
                    <span className="font-sans font-medium text-brand-slate">
                      {field.label}
                    </span>
                    <span className="font-mono text-zinc-400 text-[10px] flex items-center gap-1 bg-zinc-100 px-2 py-0.5 rounded">
                      <span>Default:</span>
                      <strong className="text-brand-charcoal">{field.value}″</strong>
                    </span>
                  </div>
                ))}
              </div>

              {/* Extra visual note */}
              <div className="mt-auto border border-dashed border-[#4F5D2F]/30 bg-[#4F5D2F]/5 p-3 rounded text-[11px] text-brand-slate flex gap-2">
                <span className="text-brand-moss font-bold shrink-0">💡 Note for Tailors:</span>
                <span>
                  The APK contains custom selection dropdowns for collar shapes (Mandarin / Round / Pointed Collar), cuff types, pocket alignments, and trouser drape styles.
                </span>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
