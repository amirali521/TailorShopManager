import { Heart, Landmark, Compass, Award } from "lucide-react";

export default function AboutUs() {
  const values = [
    {
      icon: <Award className="w-5 h-5 text-brand-gold" />,
      title: "Artisanal Integrity",
      desc: "Our software preserves traditional nomenclature, respecting the precision patterns passed down through master tailor generations."
    },
    {
      icon: <Compass className="w-5 h-5 text-brand-gold" />,
      title: "Born of District Needs",
      desc: "Architected directly for busy market bazaars, busy outfitters, and high-street dressmaker boutiques where seconds matter."
    },
    {
      icon: <Landmark className="w-5 h-5 text-brand-gold" />,
      title: "Zero Overhead Digital",
      desc: "We ensure you don't need a laptop or server on-site. Everything runs directly on-device in your hand with robust performance."
    }
  ];

  return (
    <section id="about" className="py-24 bg-brand-eggshell border-b border-brand-gold/20 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Brand Left Column Quote Card */}
          <div className="lg:col-span-5 text-left bg-brand-cream border border-brand-gold/30 p-8 rounded-xl shadow-xs relative kraft-shadow overflow-hidden">
            <span className="absolute -bottom-6 -right-6 text-brand-gold/10 pointer-events-none scale-150">
              <Compass className="w-40 h-40" />
            </span>

            <span className="text-xs font-mono text-brand-gold font-bold tracking-widest block mb-4 uppercase">
              ❖ DESIGN MANIFESTO
            </span>
            
            <p className="font-serif italic text-2xl text-brand-charcoal mb-6 leading-relaxed relative z-10">
              "Your bespoke materials are premium; your coordinates are precise; your digital workspace apparatus should reflect the exact same discipline."
            </p>
            
            <div className="border-t border-brand-gold/20 pt-4 flex gap-3 items-center">
              <div className="w-9 h-9 rounded-full bg-brand-gold flex items-center justify-center text-[#FCFAF2] font-serif font-bold text-sm">
                A
              </div>
              <div>
                <span className="font-sans font-bold text-xs tracking-wider uppercase text-brand-charcoal block">Atelier Founder</span>
                <span className="font-mono text-[9px] text-zinc-500 block">Sartorial Craftsman OS Architect</span>
              </div>
            </div>
          </div>

          {/* Core Content Column */}
          <div className="lg:col-span-7 text-left">
            <span className="text-xs uppercase font-mono text-brand-gold font-bold tracking-widest block mb-2">
              ❖ PRESERVING TRADITION
            </span>
            
            <h2 className="font-serif text-3xl sm:text-4xl text-brand-charcoal font-bold tracking-tight mb-6">
              For Modern Tailors Preserving Traditional Excellence
            </h2>
            
            <div className="space-y-4 text-sm text-brand-slate leading-relaxed mb-8">
              <p>
                TailorShopManager is engineered specifically for bespoke artisans who cherish the personal touch of custom tailoring but require the absolute efficiency of modern digital logs. Born out of tailoring showroom needs, we design tools that protect client data, manage shop overheads, and streamline sizing records without cluttering your physical workspace.
              </p>
              <p>
                Whether you specialize in structured traditional outfits, custom tuxedo waistcoats, formal shirts, classic trousers, or English wool suits, our workspace provides templates designed for precise draping coordinates. Your shop is premium; your tools should feel premium too.
              </p>
            </div>

            {/* Sub values details list */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {values.map((v, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    {v.icon}
                    <h4 className="font-serif font-bold text-sm text-brand-charcoal">{v.title}</h4>
                  </div>
                  <p className="text-[11px] text-brand-slate tracking-wide">
                    {v.desc}
                  </p>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
