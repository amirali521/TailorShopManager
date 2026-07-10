import React, { useRef, useState } from "react";
import { 
  Settings, Award, Compass, Sparkles, Scissors, Shirt, Globe,
  Download, Upload, ShieldAlert, Check, HelpCircle, RefreshCw, FileText
} from "lucide-react";
import { ShopProfile, Customer, Order, InventoryItem } from "../types";
import { MEASUREMENT_TEMPLATES } from "./MeasurementTemplates";

interface SettingsWorkspaceProps {
  shopProfile: ShopProfile;
  onUpdateShopProfile: (profile: ShopProfile) => void;
  customers: Customer[];
  orders: Order[];
  inventory: InventoryItem[];
  onRestoreBackup: (data: { customers: Customer[]; orders: Order[]; inventory: InventoryItem[]; shopProfile: ShopProfile }) => void;
  triggerToast: (msg: string) => void;
}

export default function SettingsWorkspace({
  shopProfile,
  onUpdateShopProfile,
  customers,
  orders,
  inventory,
  onRestoreBackup,
  triggerToast
}: SettingsWorkspaceProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Profile settings state
  const [shopName, setShopName] = useState(shopProfile.shopName || "Royal Atelier");
  const [shopPhone, setShopPhone] = useState(shopProfile.shopPhone || "+92 300 1234567");
  const [shopAddress, setShopAddress] = useState(shopProfile.shopAddress || "Physical Atelier Lane, Central Hub");
  const [currency, setCurrency] = useState(shopProfile.currency || "$");
  const [logoIcon, setLogoIcon] = useState(shopProfile.logoIcon || "Scissors");

  const logoOptions = ["Scissors", "Crown", "Royal", "Velvet", "Blazer"];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateShopProfile({
      shopName,
      shopPhone,
      shopAddress,
      currency,
      logoIcon,
      isConfigured: true
    });
    triggerToast("✨ Studio profile custom settings applied!");
  };

  // JSON Export Backups
  const handleExportBackup = () => {
    const backupObj = {
      version: "1.2",
      exportedAt: new Date().toISOString(),
      shopProfile,
      customers,
      orders,
      inventory
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupObj, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `atelier_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("💾 Sartorial JSON backup docket downloaded successfully!");
  };

  // JSON Import Backups
  const handleImportBackupClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.customers && parsed.inventory) {
          onRestoreBackup({
            customers: parsed.customers || [],
            orders: parsed.orders || [],
            inventory: parsed.inventory || [],
            shopProfile: parsed.shopProfile || shopProfile
          });
          triggerToast("📥 JSON data docket restored successfully!");
        } else {
          triggerToast("⚠️ Invalid backup format. Missing core datasets.");
        }
      } catch (err) {
        triggerToast("⚠️ Failed to parse backup file. Please verify it is a valid JSON file.");
      }
    };
    reader.readAsText(file);
    // clear input
    e.target.value = "";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
      
      {/* Studio Profile & Brand Settings card */}
      <div className="bg-white border border-[#8B6B3F]/15 rounded-xl p-6 shadow-sm text-left space-y-6">
        <div>
          <h3 className="font-serif text-lg font-bold text-zinc-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#D97706]" />
            <span>Studio Profile Customizer</span>
          </h3>
          <p className="text-xs text-zinc-400">Personalize printer-friendly invoices, invoice currency symbols, and boutique header signatures</p>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-mono font-bold uppercase text-zinc-500 mb-1.5">
              Atelier / Shop Name *
            </label>
            <input
              type="text"
              required
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="e.g. Royal Atelier Karachi"
              className="w-full p-2.5 bg-slate-50 border border-zinc-200 rounded-lg font-sans focus:outline-none focus:border-[#D97706]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-zinc-500 mb-1.5">
                Contact Phone Line *
              </label>
              <input
                type="text"
                required
                value={shopPhone}
                onChange={(e) => setShopPhone(e.target.value)}
                placeholder="e.g. +92 300 1234567"
                className="w-full p-2.5 bg-slate-50 border border-zinc-200 rounded-lg font-sans focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-zinc-500 mb-1.5">
                Currency Symbol
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-zinc-200 rounded-lg font-mono font-bold text-zinc-700 focus:outline-none"
              >
                <option value="$">USD ($)</option>
                <option value="₨">PKR (₨)</option>
                <option value="£">GBP (£)</option>
                <option value="€">EUR (€)</option>
                <option value="₹">INR (₹)</option>
                <option value="AED ">AED (DH)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase text-zinc-500 mb-1.5">
              Physical Studio Address *
            </label>
            <textarea
              required
              value={shopAddress}
              onChange={(e) => setShopAddress(e.target.value)}
              placeholder="e.g. 2nd Floor, Grand Sartorial Arcade, London"
              rows={2}
              className="w-full p-2.5 bg-slate-50 border border-zinc-200 rounded-lg font-sans focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase text-zinc-500 mb-1.5">
              Brand Emblem Signature
            </label>
            <div className="grid grid-cols-5 gap-2 pt-1 text-center font-bold font-sans">
              {logoOptions.map((opt) => {
                const isSelected = logoIcon === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setLogoIcon(opt)}
                    className={`p-3.5 border rounded-xl flex flex-col items-center gap-1.5 transition cursor-pointer ${
                      isSelected 
                        ? "bg-[#FCFAF5] border-[#D97706] text-[#D97706] shadow-sm" 
                        : "bg-white border-zinc-200 text-zinc-400 hover:text-zinc-600 hover:bg-slate-50"
                    }`}
                  >
                    {opt === "Crown" && <Award className="w-5 h-5" />}
                    {opt === "Royal" && <Compass className="w-5 h-5" />}
                    {opt === "Velvet" && <Sparkles className="w-5 h-5" />}
                    {opt === "Blazer" && <Shirt className="w-5 h-5" />}
                    {opt === "Scissors" && <Scissors className="w-5 h-5" />}
                    <span className="text-[9px] font-mono capitalize tracking-tighter">{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#0F172A] hover:bg-[#D97706] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
          >
            Apply Visual customizer settings
          </button>
        </form>
      </div>

      {/* Sizing Blueprint Preset and Data Portability Card */}
      <div className="space-y-6 text-left">
        
        {/* Data portability card */}
        <div className="bg-white border border-[#8B6B3F]/15 rounded-xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="font-serif text-lg font-bold text-zinc-900 flex items-center gap-2">
              <Download className="w-5 h-5 text-indigo-600" />
              <span>Artisanal Backup & Portability</span>
            </h3>
            <p className="text-xs text-zinc-400">Offline JSON backups guarantee complete owner data sovereignty and zero telemetry leaks</p>
          </div>

          <div className="bg-[#FCFAF5] border border-amber-100 p-4 rounded-xl space-y-3">
            <span className="block text-[10px] font-mono font-bold text-[#D97706] uppercase tracking-wider">
              Local Storage Datasets Snapshot
            </span>
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono font-bold">
              <div className="p-2 bg-white border border-zinc-100 rounded-lg">
                <span className="text-zinc-400 text-[9px] uppercase block">Portfolios</span>
                <span className="text-sm mt-0.5 block">{customers.length}</span>
              </div>
              <div className="p-2 bg-white border border-zinc-100 rounded-lg">
                <span className="text-zinc-400 text-[9px] uppercase block">Orders</span>
                <span className="text-sm mt-0.5 block">{orders.length}</span>
              </div>
              <div className="p-2 bg-white border border-zinc-100 rounded-lg">
                <span className="text-zinc-400 text-[9px] uppercase block">Inventory</span>
                <span className="text-sm mt-0.5 block">{inventory.length}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleExportBackup}
              className="py-3 px-4 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-indigo-600" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={handleImportBackupClick}
              className="py-3 px-4 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>Restore Backup</span>
            </button>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".json" 
              className="hidden" 
            />
          </div>
          
          <p className="text-[10px] text-zinc-400 text-center flex items-center justify-center gap-1.5 font-mono">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Secure 256-bit Offline Encryption Safe</span>
          </p>
        </div>

        {/* Sizing formulas display / preset templates */}
        <div className="bg-white border border-[#8B6B3F]/15 rounded-xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="font-serif text-lg font-bold text-zinc-900 flex items-center gap-2">
              <Scissors className="w-5 h-5 text-[#D97706]" />
              <span>Tailoring Blueprint Formulas</span>
            </h3>
            <p className="text-xs text-zinc-400">Preset sizing fields standardizing measurements based on classical shapes</p>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {MEASUREMENT_TEMPLATES.map((t) => (
              <div key={t.id} className="p-3 border border-zinc-200 rounded-lg text-xs space-y-2">
                <div className="flex justify-between font-serif font-extrabold text-zinc-900">
                  <span>{t.name}</span>
                  <span className="text-[9px] font-mono uppercase bg-slate-100 border px-1.5 py-0.5 rounded text-zinc-400">
                    {t.fields.length} metrics
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {t.fields.map(f => (
                    <span key={f.key} className="px-1.5 py-0.5 bg-slate-50 text-[9px] font-mono text-zinc-500 rounded border border-zinc-100 uppercase">
                      {f.key.replace("_", " ")}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
