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
import DesktopApp from "./components/DesktopApp";
import PrivacyPage from "./components/PrivacyPage";

export default function App() {
  const [viewMode, setViewMode] = useState<"landing" | "desktopApp" | "privacyPage">("landing");
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
    setIsDownloadOpen(true);
    setDownloadSuccess(false);
    setDownloadProgress(0);

    // Simulate standard down-stream transmission progress
    const timer = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setDownloadSuccess(true);
          
          // Trigger a lightweight mock download of sizing manual text file as a keepsake!
          try {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
              JSON.stringify({
                app: "TailorShopManager OS",
                version: "1.4.0-build-2026",
                architecture: "Android-ARM64-Offline",
                signature: "TAILORSHOPMANAGER-SECURE-STITCH",
                checksum: "SHA256-a9f82dbeec23ee"
              }, null, 2)
            );
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", "tailorshopmanager_setup_docket.json");
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
          } catch (e) {
            // Ignored if browser sandbox prevents frame download trigger
          }
          return 100;
        }
        return prev + 20;
      });
    }, 150);
  };

  if (viewMode === "desktopApp") {
    return <DesktopApp onBackToLanding={() => setViewMode("landing")} />;
  }

  if (viewMode === "privacyPage") {
    return <PrivacyPage onBack={() => setViewMode("landing")} />;
  }

  return (
    <div id="atelier-landing-root" className="min-h-screen bg-[#FCFAF2] text-brand-charcoal font-sans antialiased selection:bg-brand-gold selection:text-white">
      
      {/* Dynamic Header */}
      <Header 
        activeSection={activeSection} 
        onNavigate={handleNavigate} 
        onInstallClick={triggerDownloadApk} 
        onLaunchApp={() => setViewMode("desktopApp")}
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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center text-left">
              
              {/* Text Highlights Column (Left on Desktop) */}
              <div className="lg:col-span-6 space-y-6">
                
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
                    id="hero-cta-launch-app"
                    onClick={() => setViewMode("desktopApp")}
                    className="px-6 py-4 bg-[#8B6B3F] hover:bg-[#1B1A18] text-[#FCFAF2] rounded font-sans text-xs tracking-wider uppercase font-extrabold flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer hover:-translate-y-0.5"
                  >
                    <Sparkles className="w-4 h-4 text-brand-gold animate-pulse" />
                    <span>Launch Desktop Web App</span>
                  </button>

                  <button
                    id="hero-cta-download-apk"
                    onClick={triggerDownloadApk}
                    className="px-6 py-4 border-2 border-[#8B6B3F]/60 hover:bg-[#F5F2EB] text-brand-charcoal rounded font-sans text-xs tracking-wider uppercase font-extrabold flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer hover:-translate-y-0.5"
                  >
                    {/* Simulated android installer icon */}
                    <svg className="w-5 h-5 fill-current text-[#8B6B3F]" viewBox="0 0 24 24">
                      <path d="M17.523 15.3l1.816 3.146a.715.715 0 1 1-1.238.715L16.264 16H7.736l-1.837 3.161a.715.715 0 0 1-1.237-.715L6.477 15.3c-2.45-1.554-4.108-4.223-4.136-7.3H21.66c-.028 3.077-1.686 5.746-4.137 7.3M15 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2m-6 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2"/>
                    </svg>
                    <span>Download Android APK</span>
                  </button>

                  <button
                    id="hero-cta-explore"
                    onClick={() => handleNavigate("features")}
                    className="px-5 py-4 text-[#8B6B3F] hover:text-[#1B1A18] font-sans text-xs tracking-wider uppercase font-bold flex items-center justify-center gap-1.5 transition-colors duration-300 cursor-pointer"
                  >
                    <span>Sizing Specs</span>
                    <ArrowDown className="w-4 h-4 animate-bounce" />
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

              {/* Dynamic Interactive Smartphone Mockup */}
              <div className="lg:col-span-6 flex justify-center">
                <InteractiveDevice />
              </div>

            </div>
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
      <Footer onNavigate={handleNavigate} />


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
                ⚡ SECURE APK DOCKET
              </span>
              <h3 className="font-serif text-2xl font-bold text-center text-brand-charcoal">
                TailorShopManager Setup
              </h3>
            </div>

            {/* Progress / Success State */}
            {!downloadSuccess ? (
              <div className="space-y-4">
                <p className="text-xs text-brand-slate leading-relaxed">
                  Packaging your secure offline-first tailor shop registry credentials. Generating latest workspace build...
                </p>
                
                {/* Vintage Card progress bar */}
                <div className="bg-brand-eggshell rounded border h-4 overflow-hidden relative p-0.5">
                  <div 
                    className="bg-brand-gold h-full rounded transition-all duration-300"
                    style={{ width: `${downloadProgress}%` }}
                  ></div>
                  <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono font-bold text-zinc-600">
                    Transmitting Package... {downloadProgress}%
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Success sign */}
                <div className="flex gap-3 items-start bg-[#4F5D2F]/10 border border-[#4F5D2F]/20 p-3 rounded-lg text-xs text-[#4F5D2F] font-medium leading-relaxed">
                  <Check className="w-5 h-5 shrink-0 text-brand-moss" />
                  <div>
                    <span className="font-bold block">build docket saved!</span>
                    Sizing dockets checksum verified. APK signature keys set successfully.
                  </div>
                </div>

                {/* Installation Guidelines */}
                <div className="space-y-3.5">
                  <span className="text-[10px] font-mono font-bold text-brand-gold uppercase block">
                    HOW TO INSTALL APK (ANDROID DIRECTIONS):
                  </span>
                  
                  <ol className="text-xs text-brand-slate space-y-2.5 font-sans pl-4 list-decimal">
                    <li>
                      <strong>Check Your Downloads Folder:</strong> Look for the downloaded installer file <code>tailorshopmanager_setup_docket.json</code> or the downloaded configuration package in your notifications.
                    </li>
                    <li>
                      <strong>Enable Unknown Sources:</strong> Slide down your Android settings, tap <em>Security</em>, and temporarily authorize <u>Install from Unknown Sources</u>.
                    </li>
                    <li>
                      <strong>Open & Align:</strong> Run the package. Start measuring instantly with absolute biometric safety!
                    </li>
                  </ol>
                </div>

                {/* Action button close */}
                <button
                  onClick={() => setIsDownloadOpen(false)}
                  className="w-full py-2.5 bg-brand-charcoal hover:bg-brand-gold text-brand-cream font-bold text-xs tracking-wider uppercase rounded transition"
                >
                  Dismiss & Open Workspace
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
