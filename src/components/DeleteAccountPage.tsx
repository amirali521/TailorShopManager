import { ArrowLeft, ShieldAlert, Mail, Trash2, Smartphone, FileText, CheckCircle } from "lucide-react";

interface DeleteAccountPageProps {
  onBack: () => void;
}

export default function DeleteAccountPage({ onBack }: DeleteAccountPageProps) {
  return (
    <div className="min-h-screen bg-[#F6F4EB] text-brand-charcoal font-sans antialiased py-16 px-4 flex flex-col justify-between">
      <div className="max-w-3xl mx-auto w-full bg-white border-2 border-[#8B6B3F]/20 rounded-xl shadow-lg p-8 sm:p-12 relative paper-grain text-left">
        
        {/* Back Button */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-gold hover:text-brand-charcoal transition mb-8 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Landing</span>
        </button>

        <header className="border-b border-zinc-150 pb-6 mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-200 rounded-full text-[10px] font-mono font-bold text-red-700 uppercase tracking-widest mb-4">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Data Sovereignty & Privacy Safeguard</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-charcoal">
            Account & User Data Deletion Guide
          </h1>
          <p className="text-xs text-brand-slate mt-2 font-mono uppercase tracking-wider">
            Official Compliance Statement • Last Updated: June 28, 2026
          </p>
        </header>

        <main className="space-y-8 text-sm sm:text-base leading-relaxed text-zinc-600">
          
          {/* Overview */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg font-bold text-brand-charcoal flex items-center gap-2">
              <span className="text-brand-gold">1.</span>
              <span>Overview of User Data Sovereignty</span>
            </h2>
            <p className="text-zinc-600">
              At <strong>TailorShopManager</strong>, we adhere strictly to user data sovereignty. Any customer sizing charts, tailors' wages ledger logs, rolled inventory counts, and bespoke specifications belong exclusively to your workspace. You maintain complete control over your account status and possess the absolute right to request or perform total erasure of your personal data at any time.
            </p>
          </section>

          {/* Method A: In-App Deletion */}
          <section className="space-y-4 bg-[#FBF9F3] p-6 rounded-xl border border-brand-gold/15">
            <h2 className="font-serif text-lg font-bold text-brand-charcoal flex items-center gap-2">
              <span className="text-brand-gold">2.</span>
              <span className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-brand-gold" />
                <span>Method A: Instant In-App Erasure (Recommended)</span>
              </span>
            </h2>
            <p className="text-zinc-600 text-sm">
              The fastest and most direct path to completely wipe your registered charts is directly inside our Android mobile interface:
            </p>
            <ol className="list-decimal pl-5 space-y-2.5 text-xs sm:text-sm text-zinc-600 font-medium">
              <li>
                Launch the <strong>TailorShopManager</strong> mobile app on your Android device.
              </li>
              <li>
                Go to the <strong>Account Settings</strong> or <strong>Atelier Profile</strong> section.
              </li>
              <li>
                Select the safety action labeled <strong className="text-red-700 font-bold">"Delete My Account and All Synced Data"</strong>.
              </li>
              <li>
                Confirm the prompt. This action instantly purges your local storage workspace cache and executes an absolute, cascading deletion across all connected Firestore cloud tables.
              </li>
            </ol>
          </section>

          {/* Method B: Manual request email */}
          <section className="space-y-4">
            <h2 className="font-serif text-lg font-bold text-brand-charcoal flex items-center gap-2">
              <span className="text-brand-gold">3.</span>
              <span className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-brand-gold" />
                <span>Method B: Manual Deletion Request Form</span>
              </span>
            </h2>
            <p className="text-zinc-600">
              If you have uninstalled the mobile APK or can no longer access your registered device, you may lodge a manual data erasure request through our administration console.
            </p>
            
            <div className="bg-red-50/50 border border-red-100 rounded-lg p-5 space-y-3.5 text-xs sm:text-sm">
              <span className="font-bold text-red-950 uppercase font-mono tracking-wide block">
                Please draft an email following this template structure:
              </span>
              <ul className="space-y-2 text-zinc-700 pl-4 list-disc font-medium">
                <li>
                  <strong>Subject Line:</strong> TailorShopManager - Account Deletion Request
                </li>
                <li>
                  <strong>Account Email:</strong> The exact email address linked to your synchronized Google or email profile.
                </li>
                <li>
                  <strong>Atelier Shop Name:</strong> Your business identifier (if registered).
                </li>
              </ul>
              
              <div className="pt-2 border-t border-red-200/50 text-zinc-600">
                Send this request directly to our secure inbox: <br />
                <a 
                  href="mailto:amiralikh.khan02@gmail.com" 
                  className="inline-block mt-1 font-mono font-extrabold text-red-700 underline text-sm hover:text-red-800 transition"
                >
                  amiralikh.khan02@gmail.com
                </a>
              </div>
            </div>

            <p className="text-[11px] text-zinc-400 italic">
              Verification Notice: For your security, we will perform ownership validation checks before purging. Once verified, all cloud records, database indices, and backup segments will be irreversibly wiped within 48 to 72 hours.
            </p>
          </section>

          {/* Purge Guarantee */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg font-bold text-brand-charcoal flex items-center gap-2">
              <span className="text-brand-gold">4.</span>
              <span>Zero Retained Backups Guarantee</span>
            </h2>
            <p className="text-zinc-600">
              Upon final confirmation of deletion via either method, <strong>100% of your records</strong> (including client sizing parameters, worker orders, inventory values, and credentials) are deleted from our servers permanently. We do not keep secondary backup files, shadow logs, or recovery files. Your erasure is absolute and final.
            </p>
          </section>

        </main>

        <footer className="border-t border-zinc-100 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-4">
          <div className="flex items-center gap-1.5 font-mono">
            <CheckCircle className="w-4 h-4 text-[#4F5D2F]" />
            <span>GDPR & CalOPPA Data Erasure Compliant</span>
          </div>
          <span>&copy; 2026 TailorShopManager. All Rights Reserved.</span>
        </footer>

      </div>
    </div>
  );
}
