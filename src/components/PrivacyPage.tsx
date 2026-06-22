import { Shield, FileText, ArrowLeft, Lock, Trash2, Database, HelpCircle } from "lucide-react";

interface PrivacyPageProps {
  onBack: () => void;
}

export default function PrivacyPage({ onBack }: PrivacyPageProps) {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1B1A18] font-sans antialiased selection:bg-[#8B6B3F] selection:text-white">
      
      {/* Decorative top accent */}
      <div className="h-1.5 w-full bg-[#8B6B3F]"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Navigation back header */}
        <div className="flex items-center justify-between mb-10 border-b border-[#E5DECE] pb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs uppercase font-bold tracking-wider text-[#8B6B3F] hover:text-[#1B1A18] transition p-1 cursor-pointer bg-transparent border-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
          
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#8B6B3F]" />
            <span className="font-mono text-xs uppercase tracking-widest text-[#8B6B3F] font-bold">
              Compliance Document
            </span>
          </div>
        </div>

        {/* Lead Content */}
        <div className="space-y-6 text-left">
          <div className="space-y-2">
            <h1 className="font-serif text-3xl sm:text-4xl text-[#1B1A18] font-extrabold tracking-tight">
              Privacy Policy & Terms of Service
            </h1>
            <p className="text-xs font-mono text-zinc-400">
              Last Updated: June 22, 2026 • Version 1.4.0 Certified
            </p>
          </div>

          <div className="p-6 bg-[#F5F2EB] border border-[#E5DECE] rounded-lg">
            <span className="font-mono text-[10px] text-[#8B6B3F] uppercase tracking-wider font-extrabold block mb-2">
              Summary Statement
            </span>
            <p className="text-sm font-serif italic text-zinc-700 leading-relaxed">
              "We believe that a gentleman or lady's clothing measurements represent a direct, precious relationship between the tailor and their patron. This data is not an asset for commercial profit or tracking. It stays secure, offline by default, and encrypted when synchronized key-to-key with our databases."
            </p>
          </div>

          <div className="prose prose-stone max-w-none text-zinc-700 space-y-8 pt-4">
            
            {/* Section 1 */}
            <section className="space-y-3">
              <h3 className="font-serif text-lg font-bold text-[#1B1A18] flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded bg-[#8B6B3F]/10 text-[#8B6B3F] text-xs font-mono">01</span>
                Data Collection Boundaries
              </h3>
              <p className="text-sm leading-relaxed">
                TailorShopManager collects and processes only the information necessary to fulfill your shop management needs:
              </p>
              <ul className="list-disc pl-5 text-sm space-y-1 font-sans text-zinc-600">
                <li><strong>Customer Identity:</strong> Name, phone numbers, and addresses of your buyers.</li>
                <li><strong>Drape Dimensions:</strong> High-precision tailoring measurements (including collar, sleeve draft, chest, waist length, knee, bottom widths).</li>
                <li><strong>Ledgers and Wages:</strong> Payments received, outstanding advances, staff piece-rate accounts, and billing logs.</li>
              </ul>
              <p className="text-sm leading-relaxed font-sans text-zinc-600">
                We collect zero ambient telemetry, location coordinates, device IDs, or behavioral advertising cookies.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h3 className="font-serif text-lg font-bold text-[#1B1A18] flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded bg-[#8B6B3F]/10 text-[#8B6B3F] text-xs font-mono">02</span>
                Real-Time Cloud Sync Security
              </h3>
              <p className="text-sm leading-relaxed">
                When you initiate cloud synchronization using Google sign-in:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
                <div className="p-4 border border-[#E5DECE] rounded bg-white space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#8B6B3F] uppercase font-mono">
                    <Lock className="w-4 h-4" />
                    <span>Firebase Auth</span>
                  </div>
                  <p className="text-xs text-zinc-600">
                    Authentication is proxied through Google's OAuth 2.0 system directly to our Firestore database. Your Google credentials are never readable by our application.
                  </p>
                </div>
                <div className="p-4 border border-[#E5DECE] rounded bg-white space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#8B6B3F] uppercase font-mono">
                    <Database className="w-4 h-4" />
                    <span>Isolated Firestore Node</span>
                  </div>
                  <p className="text-xs text-zinc-600">
                    Your records are stored inside a partitioned document directory keyed exactly to your unique Google UID. Other boutiques have absolute zero visibility into your data.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h3 className="font-serif text-lg font-bold text-[#1B1A18] flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded bg-[#8B6B3F]/10 text-[#8B6B3F] text-xs font-mono">03</span>
                The Anti-Tracking Protocol
              </h3>
              <p className="text-sm leading-relaxed">
                Your registers contain proprietary tailoring secrets. We pledge a 100% advertising-free commitment:
              </p>
              <blockquote className="border-l-4 border-[#8B6B3F] pl-4 italic text-zinc-600 text-sm">
                No third-party cookies, no marketing software, no analytics trackers, and no sales to credit bureaus or commercial agencies. Your records are entirely local to you unless synchronized using Firebase Cloud.
              </blockquote>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h3 className="font-serif text-lg font-bold text-[#1B1A18] flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded bg-[#8B6B3F]/10 text-[#8B6B3F] text-xs font-mono">04</span>
                Your Sovereignty Rights
              </h3>
              <p className="text-sm leading-relaxed">
                At any time, you retain the explicit right to purge, update, or backup your registers:
              </p>
              <div className="bg-white border border-[#E5DECE] p-4 rounded text-sm space-y-1.5 text-zinc-600 font-mono">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-700">
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  <span>Permanent Purge: Delete customer data instantly local-and-cloud</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-700">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>Manual Backups: Export your database list anytime via standard JSON format</span>
                </div>
              </div>
            </section>

            {/* Verification signature */}
            <div className="pt-8 border-t border-[#E5DECE] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="text-left">
                <p className="text-xs font-bold uppercase text-zinc-400 font-mono">Governance Body</p>
                <p className="text-sm font-serif font-bold text-zinc-800">TailorShopManager Software Group</p>
              </div>

              <button
                onClick={onBack}
                className="px-6 py-2.5 bg-[#8B6B3F] hover:bg-[#1B1A18] text-white font-mono text-xs uppercase tracking-wider font-extrabold cursor-pointer transition rounded"
              >
                I Understand and Accept
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
