import { useState, FormEvent } from "react";
import { Mail, Briefcase, Scissors, Check, Send, Sparkles } from "lucide-react";
import { ContactFormData } from "../types";

export default function ContactUs() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    shopEmail: "",
    shopName: "",
    message: ""
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.shopEmail) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsSubmitted(true);
    }, 1200);
  };

  return (
    <section id="contact" className="py-24 bg-[#FCFAF2] border-b border-brand-gold/20 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Row Grid layouts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          
          {/* LEFT COLUMN: CONTACT FORM (Custom Bespoke physical form layout) */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div className="text-left max-w-xl mb-8">
              <span className="text-xs uppercase font-mono text-brand-gold font-bold tracking-widest block mb-1">
                ❖ SHOP INTAKE FORM
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-brand-charcoal font-bold tracking-tight mb-3">
                Get in Touch with Our Atelier Support Team
              </h2>
              <p className="text-sm text-brand-slate">
                Have a feature request? Need custom enterprise synchronization logs for multi-boutique tailoring outfits? Fill out our bespoke support ticket below.
              </p>
            </div>

            {/* PHYSICAL CARD VOUCHER */}
            <div className="bg-white border-2 border-brand-gold/45 rounded-xl p-6 sm:p-8 relative shadow-md kraft-shadow text-left paper-grain flex-1 flex flex-col justify-between">
              
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono text-brand-gold font-bold uppercase mb-1.5">
                        Proprietor Name
                      </label>
                      <input 
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                        placeholder="e.g. Julian Thorne"
                        className="w-full text-xs px-3.5 py-2.5 bg-[#FCFAF2]/40 border border-brand-gold/20 rounded focus:ring-1 focus:ring-brand-gold outline-none text-brand-charcoal placeholder-zinc-400 font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-brand-gold font-bold uppercase mb-1.5">
                        Shop Email address
                      </label>
                      <input 
                        type="email"
                        required
                        value={formData.shopEmail}
                        onChange={(e) => setFormData(p => ({ ...p, shopEmail: e.target.value }))}
                        placeholder="e.g. support@boutique.com"
                        className="w-full text-xs px-3.5 py-2.5 bg-[#FCFAF2]/40 border border-brand-gold/20 rounded focus:ring-1 focus:ring-brand-gold outline-none text-brand-charcoal placeholder-zinc-400 font-sans"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-brand-gold font-bold uppercase mb-1.5">
                      Shop / Proprietor Name
                    </label>
                    <input 
                      type="text"
                      required
                      value={formData.shopName}
                      onChange={(e) => setFormData(p => ({ ...p, shopName: e.target.value }))}
                      placeholder="e.g. Classic Savile Row Tailors"
                      className="w-full text-xs px-3.5 py-2.5 bg-[#FCFAF2]/40 border border-brand-gold/20 rounded focus:ring-1 focus:ring-brand-gold outline-none text-brand-charcoal placeholder-zinc-400 font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-brand-gold font-bold uppercase mb-1.5">
                      Your Sourcing Note or Inquiry Message
                    </label>
                    <textarea 
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData(p => ({ ...p, message: e.target.value }))}
                      placeholder="Let us know how your workshop works..."
                      className="w-full text-xs px-3.5 py-2.5 bg-[#FCFAF2]/40 border border-brand-gold/20 rounded focus:ring-1 focus:ring-brand-gold outline-none text-brand-charcoal placeholder-zinc-400 font-sans resize-none"
                    />
                  </div>

                  {/* Submission triggers */}
                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 bg-brand-gold text-brand-cream hover:bg-brand-charcoal rounded text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                    >
                      {loading ? (
                        <span>TRANSMITTING TICKET...</span>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>SEND BESPOKE INQUIRY</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                /* SUCCESS STATE (Tear ripped docket layout) */
                <div className="flex flex-col items-center justify-center text-center py-12 animate-fadeIn">
                  <div className="w-14 h-14 bg-[#4F5D2F]/10 border border-[#4F5D2F]/20 rounded-full flex items-center justify-center text-brand-moss mb-4">
                    <Check className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-brand-charcoal mb-2">
                    Bespoke Docket Transmitted!
                  </h3>
                  <p className="text-xs text-brand-slate max-w-sm mb-6 leading-relaxed">
                    Thank you, <strong>{formData.name}</strong>. Your workshop credentials note has been logged. We will contact you at <strong>{formData.shopEmail}</strong> within 24 hours.
                  </p>
                  
                  <div className="w-full max-w-xs border border-dashed border-brand-gold/30 bg-brand-eggshell/50 rounded-lg p-4 text-[10px] font-mono text-left space-y-1 text-zinc-500">
                    <div><span className="font-bold uppercase text-brand-gold block text-[9px] mb-1">Docket specs:</span></div>
                    <div>• SHOP: {formData.shopName || "Unspecified"}</div>
                    <div>• EMAIL: {formData.shopEmail}</div>
                    <div>• PROTOCOL STATUS: Pending Intake</div>
                  </div>

                  <button 
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({ name: "", shopEmail: "", shopName: "", message: "" });
                    }}
                    className="mt-6 px-4 py-1.5 border border-brand-gold/40 text-brand-gold hover:bg-brand-gold hover:text-white rounded text-[10px] font-bold uppercase transition"
                  >
                    Send Another Ticket
                  </button>
                </div>
              )}

            </div>
          </div>

          {/* RIGHT COLUMN: ATELIER SUPPORT SPECS */}
          <div className="lg:col-span-5 text-left flex flex-col justify-between">
            <div className="bg-brand-eggshell border border-brand-gold/30 p-8 rounded-xl h-full flex flex-col justify-between relative kraft-shadow overflow-hidden">
              <span className="absolute -bottom-8 -left-8 text-brand-gold/5 pointer-events-none">
                <Scissors className="w-48 h-48" />
              </span>

              {/* Support directory title */}
              <div>
                <span className="text-[10px] font-mono text-brand-gold font-bold tracking-widest block uppercase mb-4">
                  ❖ SUPPORT SPECIFICATIONS
                </span>

                <h3 className="font-serif text-xl font-bold text-brand-charcoal mb-4">
                  Connected Technical Contacts
                </h3>
                
                <p className="text-xs text-brand-slate leading-relaxed mb-8">
                  For bug reports, localized translations, customized regional paper size presets (A4, thermal 58mm/80mm ticket widths), or corporate boutique inquiries, our desk is standing by.
                </p>

                {/* Email spec */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-white flex items-center justify-center border border-zinc-200 text-brand-gold shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-[9px] text-zinc-400 font-mono font-bold uppercase">DIRECT MAILBOX</span>
                      <a 
                        href="mailto:support@tailorshopmanager.com" 
                        className="text-sm font-bold text-brand-charcoal hover:text-brand-gold underline font-mono"
                      >
                        support@tailorshopmanager.com
                      </a>
                    </div>
                  </div>

                  {/* Target audience spec requirements */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-white flex items-center justify-center border border-zinc-200 text-brand-gold shrink-0">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-[9px] text-zinc-400 font-mono font-bold uppercase">TARGET COHORT</span>
                      <span className="text-sm font-bold text-brand-charcoal block">
                        Boutique Outfitters, Sartorial Designers, and Craft Tailors
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Helpful footer detail card inside the column */}
              <div className="bg-brand-cream border border-brand-gold/20 p-4 rounded-lg relative">
                <h4 className="text-[10px] font-mono font-bold text-brand-gold uppercase mb-1">
                  ⚡ INSTANT DEPLOYMENT
                </h4>
                <p className="text-[11px] text-brand-slate leading-normal">
                  The Android APK is fully offline-first. To start using TailorShopManager in your shop, simply click "Download APK", install on your device, and configure your first sizing registry template in 30 seconds.
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
