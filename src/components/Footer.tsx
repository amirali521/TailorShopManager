import { Scissors } from "lucide-react";

interface FooterProps {
  onNavigate: (sectionId: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const links = [
    { label: "Home", id: "home", isExternal: false },
    { label: "Features", id: "features", isExternal: false },
    { label: "About Us", id: "about", isExternal: false },
    { label: "Privacy Policy", id: "/privacy.html", isExternal: true },
    { label: "Data Deletion", id: "/delete-account.html", isExternal: true },
    { label: "Contact Us", id: "contact", isExternal: false }
  ];

  return (
    <footer id="main-footer" className="bg-brand-eggshell text-brand-charcoal pt-10 pb-16 relative overflow-hidden">
      
      {/* VINTAGE TEAR-OFF TICKET SEPARATOR (Physical ticket rip aesthetic) */}
      <div className="absolute top-0 inset-x-0 h-8 flex flex-col justify-center select-none pointer-events-none">
        
        {/* Dashed physical cutout guideline line */}
        <div className="border-t-2 border-dashed border-brand-gold/40 relative flex justify-center">
          
          {/* Rip Cutout Circles on left/right margins */}
          <div className="absolute -left-4 -top-3 w-6 h-6 bg-[#FCFAF2] rounded-full border border-brand-gold/20"></div>
          <div className="absolute -right-4 -top-3 w-6 h-6 bg-[#FCFAF2] rounded-full border border-brand-gold/20"></div>
 
          {/* Centered Scissors Icon with tear guide label */}
          <div className="absolute -top-3 px-3 bg-brand-eggshell text-brand-gold flex items-center gap-1.5 text-[10px] font-mono leading-none tracking-widest uppercase">
            <Scissors className="w-3.5 h-3.5 text-brand-gold rotate-90" />
            <span>TEAR HERE TO SHARE TICKET</span>
          </div>
 
        </div>
      </div>
 
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-brand-gold/15 pb-8">
          
          {/* Logo brand replicate */}
          <div className="text-left flex items-center gap-2 cursor-pointer" onClick={() => onNavigate("home")}>
            <div className="w-8 h-8 rounded-full bg-brand-charcoal flex items-center justify-center text-brand-cream border border-brand-gold">
              <Scissors className="w-4 h-4" />
            </div>
            <div>
              <span className="font-serif text-lg font-bold tracking-wide uppercase text-zinc-900 block">
                TailorShopManager
              </span>
              <span className="text-[8px] tracking-widest text-brand-gold font-mono uppercase block -mt-1 leading-none">
                Bespoke Tailoring OS
              </span>
            </div>
          </div>
 
          {/* Navigation Links Replica */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
            {links.map((link) => (
              link.isExternal ? (
                <a
                  key={link.id}
                  href={link.id}
                  className="text-xs font-mono font-bold uppercase tracking-wider text-brand-slate hover:text-brand-gold transition duration-200 cursor-pointer"
                >
                  {link.label}
                </a>
              ) : (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className="text-xs font-mono font-bold uppercase tracking-wider text-brand-slate hover:text-brand-gold transition duration-200 cursor-pointer"
                >
                  {link.label}
                </button>
              )
            ))}
          </div>

        </div>

        {/* Footer legal notices */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 text-[11px] text-zinc-500 font-mono">
          <div className="text-center sm:text-left">
            <span>Crafted for tailored excellence © 2026 TailorShopManager.</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Secure Offline Sandbox</span>
            <span>•</span>
            <span>No Ad Cookies</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
