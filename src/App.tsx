import { useState, useEffect } from "react";
import Header from "./components/Header";
import FeaturesList from "./components/FeaturesList";
import AboutUs from "./components/AboutUs";
import PrivacyPolicy from "./components/PrivacyPolicy";
import ContactUs from "./components/ContactUs";
import Footer from "./components/Footer";
import InteractiveDevice from "./components/InteractiveDevice";
import DesktopApp from "./components/DesktopApp";
import PrivacyPage from "./components/PrivacyPage";
import DeleteAccountPage from "./components/DeleteAccountPage";
import { Scissors, ShieldCheck, Download, Smartphone, Star, ArrowRight, X, Check } from "lucide-react";

export default function App() {
  const [view, setView] = useState<"landing" | "desktop" | "privacy" | "delete-account">("landing");
  const [activeSection, setActiveSection] = useState("home");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Trigger a clean toast notification instead of intrusive alerts
  const triggerToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleApkDownload = () => {
    triggerToast("📥 Simulated download: TailorShopManager_v1.2_Bespoke.apk (32.4 MB) initialized!");
  };

  const handleNavigate = (sectionId: string) => {
    setView("landing");
    setActiveSection(sectionId);
    
    // Smooth scroll helper
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  // Scroll to top on page or view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [view]);

  // Main Conditional View Routing
  if (view === "desktop") {
    return (
      <div className="animate-fadeIn">
        <DesktopApp onBackToLanding={() => setView("landing")} />
      </div>
    );
  }

  if (view === "privacy") {
    return (
      <div className="animate-fadeIn">
        <PrivacyPage onBack={() => setView("landing")} />
      </div>
    );
  }

  if (view === "delete-account") {
    return (
      <div className="animate-fadeIn">
        <DeleteAccountPage onBack={() => setView("landing")} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream text-brand-charcoal font-sans antialiased selection:bg-brand-gold selection:text-white relative">
      
      {/* Clean Floating Toast Notifier */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[999] px-5 py-3 bg-brand-charcoal text-brand-cream text-xs font-mono font-bold rounded-lg shadow-xl flex items-center gap-3 border border-brand-gold/30 animate-fadeIn">
          <Check className="w-4 h-4 text-brand-gold shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-zinc-500 hover:text-brand-cream transition ml-2">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Header */}
      <Header 
        activeSection={activeSection} 
        onNavigate={handleNavigate} 
        onInstallClick={handleApkDownload} 
        onDesktopPortalClick={() => setView("desktop")} 
      />

      {/* HERO SECTION */}
      <section id="home" className="pt-32 pb-24 bg-brand-cream border-b border-brand-gold/20 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center justify-between">
            {/* Left Column: Hero Text & CTA */}
            <div className="flex-1 max-w-2xl text-left">
              {/* Retro Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-gold/10 border border-brand-gold/30 rounded-full text-[10px] font-mono font-bold text-brand-gold uppercase tracking-wider mb-6">
                <Scissors className="w-3.5 h-3.5" />
                <span>Atelier Software Suite V1.2</span>
              </div>
              
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-brand-charcoal leading-none mb-6">
                The Sartorial <span className="text-brand-gold italic">Operating System</span> for Master Tailors.
              </h1>
              
              <p className="text-sm sm:text-base text-brand-slate leading-relaxed font-sans mb-8">
                Preserve artisanal nomenclature while streamlining modern boutique workflows. Save precise customer sizing blueprints, manage tailors' piecework wages, track rolled fabric yardage, and export clean retro docket tickets — offline-first or synchronized via secure cloud backup.
              </p>
              
              {/* CTA Actions */}
              <div className="flex flex-wrap gap-4 items-center mb-8">
                <button
                  onClick={() => setView("desktop")}
                  className="px-6 py-3.5 bg-brand-charcoal hover:bg-brand-gold text-brand-cream border border-brand-gold rounded font-sans text-xs tracking-wider uppercase font-extrabold flex items-center justify-center gap-2 transition-all duration-300 shadow-md cursor-pointer"
                >
                  <span>💻 Enter Desktop Portal</span>
                  <ArrowRight className="w-4 h-4 text-brand-gold" />
                </button>
                
                <button
                  onClick={handleApkDownload}
                  className="px-6 py-3.5 bg-brand-gold hover:bg-brand-charcoal hover:text-brand-cream text-[#FCFAF2] rounded font-sans text-xs tracking-wider uppercase font-extrabold flex items-center justify-center gap-2 transition-all duration-300 shadow-sm cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download APK</span>
                </button>
              </div>
              
              {/* Trust signals */}
              <div className="border-t border-brand-gold/20 pt-6 flex flex-wrap gap-x-8 gap-y-3 text-[11px] font-mono text-zinc-500">
                <div className="flex items-center gap-1">
                  <div className="flex text-brand-gold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <span>Trusted by 1,200+ Master Cutters</span>
                </div>
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-moss" />
                  <span>Verified 100% Secure & Zero Telemetry</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Phone Simulator Container */}
            <div className="w-full lg:w-auto flex flex-col items-center">
              <span className="text-[10px] font-mono uppercase tracking-widest text-brand-gold font-bold mb-4 flex items-center gap-1.5 bg-brand-gold/10 px-3 py-1 rounded-full">
                <Smartphone className="w-3.5 h-3.5" />
                <span>Live Interactive Simulator</span>
              </span>
              <InteractiveDevice />
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES SECTION */}
      <FeaturesList />

      {/* ABOUT US SECTION */}
      <AboutUs />

      {/* PRIVACY POLICY BRIEF SECTION */}
      <PrivacyPolicy onOpenFullPolicy={() => setView("privacy")} />

      {/* CONTACT & FEEDBACK INTAKE SECTION */}
      <ContactUs />

      {/* MAIN FOOTER */}
      <Footer 
        onNavigate={handleNavigate} 
      />

    </div>
  );
}
