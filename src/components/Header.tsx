import { useState, useEffect } from "react";
import { Scissors, Menu, X, Download, ShieldCheck } from "lucide-react";

interface HeaderProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  onInstallClick: () => void;
}

export default function Header({ activeSection, onNavigate, onInstallClick }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Home", id: "home" },
    { label: "Features", id: "features" },
    { label: "About Us", id: "about" },
    { label: "Privacy Policy", id: "privacy" },
    { label: "Contact Us", id: "contact" },
  ];

  const handleLinkClick = (id: string) => {
    setIsMobileMenuOpen(false);
    onNavigate(id);
  };

  return (
    <header
      id="main-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        isScrolled
          ? "bg-brand-cream/95 backdrop-blur-md py-3 shadow-md border-brand-gold/20"
          : "bg-transparent py-5 border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Brand Logo Identity */}
          <div
            id="brand-logo"
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => handleLinkClick("home")}
          >
            <div className="w-9 h-9 rounded-full bg-brand-charcoal flex items-center justify-center text-brand-cream border border-brand-gold group-hover:bg-brand-gold transition-colors duration-300">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif text-xl font-bold tracking-wide text-brand-charcoal uppercase block">
                TailorShopManager
              </span>
              <span className="text-[9px] tracking-widest text-brand-gold font-mono uppercase block -mt-1">
                Bespoke Tailoring OS
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav id="desktop-nav" className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.id}
                id={`nav-link-${link.id}`}
                onClick={() => handleLinkClick(link.id)}
                className={`text-sm font-sans tracking-wide transition-colors relative py-1 cursor-pointer font-medium ${
                  activeSection === link.id
                    ? "text-brand-gold"
                    : "text-brand-slate hover:text-brand-charcoal"
                }`}
              >
                {link.label}
                {activeSection === link.id && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-brand-gold rounded-full" />
                )}
              </button>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-brand-moss/10 text-brand-moss border border-brand-moss/20 rounded-full text-xs font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Privacy Verified</span>
            </div>
            <button
              id="header-cta-install"
              onClick={onInstallClick}
              className="px-4 py-2 border-2 border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-cream transition-all duration-300 rounded font-sans text-xs tracking-wider uppercase font-bold cursor-pointer hover:shadow-sm"
            >
              Download APK
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              id="header-cta-install-mobile-shortcut"
              onClick={onInstallClick}
              className="p-2 border border-brand-gold/50 rounded text-brand-gold hover:bg-brand-gold/10"
              title="Download APK"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              id="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-brand-slate hover:text-brand-charcoal focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div id="mobile-menu-drawer" className="md:hidden bg-brand-cream border-b border-brand-gold/20 shadow-lg px-4 py-6 space-y-4">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <button
                key={link.id}
                id={`mobile-nav-link-${link.id}`}
                onClick={() => handleLinkClick(link.id)}
                className={`text-left px-3 py-2 rounded text-base font-medium font-sans tracking-wide ${
                  activeSection === link.id
                    ? "bg-brand-gold/10 text-brand-gold border-l-4 border-brand-gold"
                    : "text-brand-slate hover:bg-brand-eggshell"
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>
          <div className="pt-4 border-t border-brand-gold/20 flex flex-col gap-3">
            <div className="flex items-center gap-2 px-3 py-2 text-brand-moss text-xs font-mono">
              <ShieldCheck className="w-4 h-4" />
              <span>Offline Local Auth: Verified</span>
            </div>
            <button
              id="mobile-drawer-cta-install"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onInstallClick();
              }}
              className="w-full text-center px-4 py-3 bg-brand-gold text-brand-cream hover:bg-brand-gold-light transition-all rounded font-sans text-xs tracking-wider uppercase font-bold"
            >
              Download Android App (APK)
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
