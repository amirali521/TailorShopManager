import { useState, useEffect } from "react";
import { 
  Download, ArrowDown, Smartphone, ShieldCheck, 
  HelpCircle, Check, X, ExternalLink, Sparkles 
} from "lucide-react";

import Header from "./components/Header";
import InteractiveDevice from "./components/InteractiveDevice";
import FeaturesList from "./components/FeaturesList";
import WorkersLedger from "./components/WorkersLedger";
import AboutUs from "./components/AboutUs";
import PrivacyPolicy from "./components/PrivacyPolicy";
import ContactUs from "./components/ContactUs";
import Footer from "./components/Footer";
import PrivacyPage from "./components/PrivacyPage";
import DesktopApp from "./components/DesktopApp";
import DeleteAccountPage from "./components/DeleteAccountPage";

export default function App() {
  const [viewMode, setViewMode] = useState<"landing" | "privacyPage" | "desktopApp" | "deleteAccountPage">("landing");
  const [activeSection, setActiveSection] = useState("home");
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Monitor scrolling to highlight correct headers dynamically
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["home", "features", "about", "privacy", "contact"];
      const scrollPosition = window.scrollY + 160;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavigate = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setActiveSection(sectionId);
    }
  };

  const triggerDownloadApk = () => {
    // Open Google Play Store listing directly in a new tab
    try {
      window.open("https://play.google.com/store/apps/details?id=com.tailorshopmanager.tsm", "_blank");
    } catch (e) {
      // Ignored if browser popup protection intercepts
    }

    setIsDownloadOpen(true);
    setDownloadSuccess(false);
    setDownloadProgress(0);

    // Simulate progress bar quickly then display success & direct links
    const timer = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setDownloadSuccess(true);
          return 100;
        }
        return prev + 25;
      });
    }, 100);
  };

  if (viewMode === "privacyPage") {
    return <PrivacyPage onBack={() => setViewMode("landing")} />;
  }

  if (viewMode === "desktopApp") {
    return <DesktopApp onBackToLanding={() => setViewMode("landing")} />;
  }

  if (viewMode === "deleteAccountPage") {
    return <DeleteAccountPage onBack={() => setViewMode("landing")} />;
  }

  return (
    <div id="atelier-landing-root" className="min-h-screen bg-[#FCFAF2] text-brand-charcoal font-sans antialiased selection:bg-brand-gold selection:text-white">
      
      {/* Dynamic Header */}
      <Header 
        activeSection={activeSection} 
        onNavigate={handleNavigate} 
        onInstallClick={triggerDownloadApk} 
        onDesktopPortalClick={() => setViewMode("desktopApp")}
      />

      {/* 1. HERO HIGHLIGHTS SECTION (HOME PAGE) */}
      <main id="main-content-flow">
        
        <section 
          id="home" 
          className="pt-32 pb-20 sm:pt-36 sm:pb-24 lg:pt-40 lg:pb-32 bg-brand-eggshell border-b border-brand-gold/20 relative overflow-hidden"
        >
          {/* Subtle background tailor grid patterns */}
          <div className="absolute inset-0 opacity-2.5 pointer-events-none select-none">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
                  <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#1B1A18" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <InteractiveDevice>
              <div className="space-y-6">
                
                {/* Micro active security banner */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#4F5D2F]/10 border border-[#4F5D2F]/20 rounded-full text-[10px] font-mono text-[#4F5D2F] font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Safe Offline-First OS</span>
                </div>

                <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-brand-charcoal font-black tracking-tight leading-[1.08] block">
                  Elevating Traditional <br />
                  <span className="text-brand-gold">Craftsmanship</span> <br className="hidden sm:block" />
                  to Modern Masterpiece
                </h1>

                <p className="text-sm sm:text-base text-brand-slate leading-relaxed font-sans font-medium">
                  The ultimate mobile atelier assistant for bespoke tailors, custom suit makers, and fashion boutique artisans. Track master sizing records, generate retro aesthetic billing tickets, and manage employee ledger logs with flawless precision.
                </p>

                 {/* Main CTAs */}
                <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <button
                    id="hero-cta-download-apk"
                    onClick={triggerDownloadApk}
                    className="px-8 py-4 bg-[#8B6B3F] hover:bg-[#1B1A18] text-[#FCFAF2] rounded font-sans text-xs tracking-wider uppercase font-extrabold flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer hover:-translate-y-0.5"
                  >
                    {/* Simulated android installer icon */}
                    <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
                      <path d="M17.523 15.3l1.816 3.146a.715.715 0 1 1-1.238.715L16.264 16H7.736l-1.837 3.161a.715.715 0 0 1-1.237-.715L6.477 15.3c-2.45-1.554-4.108-4.223-4.136-7.3H21.66c-.028 3.077-1.686 5.746-4.137 7.3M15 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2m-6 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2"/>
                    </svg>
                    <span>Download Android APK</span>
                  </button>

                  <button
                    id="hero-cta-explore"
                    onClick={() => handleNavigate("features")}
                    className="px-6 py-4 border-2 border-[#8B6B3F]/40 hover:bg-[#F5F2EB] text-brand-charcoal rounded font-sans text-xs tracking-wider uppercase font-extrabold flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer hover:-translate-y-0.5"
                  >
                    <span>Sizing Specs</span>
                    <ArrowDown className="w-4 h-4 animate-bounce text-brand-gold" />
                  </button>
                </div>

                {/* Micro specs bullet row */}
                <div className="pt-2 border-t border-brand-gold/15 flex items-center gap-6 font-mono text-[10px] text-zinc-500">
                  <div>
                    <span>APK Size:</span>
                    <strong className="text-zinc-700 ml-1">7.4 MB</strong>
                  </div>
                  <div>
                    <span>Offline Database:</span>
                    <strong className="text-zinc-700 ml-1">SQLite Enclosed</strong>
                  </div>
                </div>

              </div>
            </InteractiveDevice>
          </div>
        </section>

        {/* 2. POWERFUL CORE APP FEATURES GRID */}
        <FeaturesList />

        {/* 3. STAFF DIRECTORY & WAGE LEDGER SHOWCASE */}
        <WorkersLedger />

        {/* 4. ABOUT US SECTION */}
        <AboutUs />

        {/* 5. PRIVACY POLICY SECTION */}
        <PrivacyPolicy onOpenFullPolicy={() => setViewMode("privacyPage")} />

        {/* 6. CONTACT US SECTION */}
        <ContactUs />

      </main>

      {/* Footer containing tear off coupon replica */}
      <Footer 
        onNavigate={handleNavigate} 
        onPrivacyPolicyClick={() => setViewMode("privacyPage")}
        onDeleteAccountClick={() => setViewMode("deleteAccountPage")}
      />


      {/* INSTALLATION DRAWER MODAL (CARDBOARD INSPIRED THEME DESIGN) */}
      {isDownloadOpen && (
        <div 
          id="apk-download-modal-backdrop" 
          className="fixed inset-0 z-50 bg-[#1B1A18]/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setIsDownloadOpen(false)}
        >
          <div 
            id="apk-download-modal" 
            className="bg-[#FCFAF2] border-2 border-brand-gold rounded-xl p-6 sm:p-8 max-w-md w-full relative shadow-2xl paper-grain text-left kraft-shadow animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={() => setIsDownloadOpen(false)}
              className="absolute top-4 right-4 text-brand-slate hover:text-brand-charcoal p-1 rounded-full hover:bg-zinc-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title */}
            <div className="text-center mb-6 border-b pb-4 border-brand-gold/20">
              <span className="text-[10px] uppercase font-mono text-brand-gold font-bold tracking-widest block mb-1">
                ⚡ GOOGLE PLAY INSTALLER
              </span>
              <h3 className="font-serif text-2xl font-bold text-center text-brand-charcoal">
                TailorShopManager App
              </h3>
            </div>

            {/* Progress / Success State */}
            {!downloadSuccess ? (
              <div className="space-y-4">
                <p className="text-xs text-brand-slate leading-relaxed">
                  Connecting to the secure Google Play Store servers. Launching official store page...
                </p>
                
                {/* Vintage Card progress bar */}
                <div className="bg-brand-eggshell rounded border h-4 overflow-hidden relative p-0.5">
                  <div 
                    className="bg-brand-gold h-full rounded transition-all duration-300"
                    style={{ width: `${downloadProgress}%` }}
                  ></div>
                  <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono font-bold text-zinc-600">
                    Routing to Play Store... {downloadProgress}%
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Success sign */}
                <div className="flex gap-3 items-start bg-[#4F5D2F]/10 border border-[#4F5D2F]/20 p-3 rounded-lg text-xs text-[#4F5D2F] font-medium leading-relaxed">
                  <Check className="w-5 h-5 shrink-0 text-brand-moss" />
                  <div>
                    <span className="font-bold block">Redirected Successfully!</span>
                    Our official listing has been opened in a new window.
                  </div>
                </div>

                {/* Manual Link in case of popups blocked */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase block">
                    Did not redirect automatically?
                  </span>
                  <a
                    href="https://play.google.com/store/apps/details?id=com.tailorshopmanager.tsm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-[#4F5D2F] hover:bg-[#3d4924] text-[#FCFAF2] rounded font-sans text-xs tracking-wider uppercase font-extrabold flex items-center justify-center gap-2 transition duration-300 shadow-sm cursor-pointer"
                  >
                    <span>Open Google Play Page</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* Installation Guidelines */}
                <div className="space-y-3.5 pt-1">
                  <span className="text-[10px] font-mono font-bold text-brand-gold uppercase block">
                    HOW TO GET STARTED:
                  </span>
                  
                  <ol className="text-xs text-brand-slate space-y-2.5 font-sans pl-4 list-decimal">
                    <li>
                      Tap <strong>Install</strong> on the Google Play Store interface.
                    </li>
                    <li>
                      Wait for the safe download and automatic configuration to finish.
                    </li>
                    <li>
                      Launch the app to manage customers, measurements, and wage ledgers with full data privacy!
                    </li>
                  </ol>
                </div>

                {/* Action button close */}
                <button
                  onClick={() => setIsDownloadOpen(false)}
                  className="w-full py-2.5 bg-brand-charcoal hover:bg-brand-gold text-brand-cream font-bold text-xs tracking-wider uppercase rounded transition cursor-pointer"
                >
                  Close & Open Sandbox
                </button>
              </div>
            )}

            {/* Support guarantee footer */}
            <div className="pt-4 border-t border-brand-gold/15 mt-5 text-[10px] font-mono text-center text-zinc-400">
              SSL SECURED • NO COMMERCIAL AD CLOUD TRACKING
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
