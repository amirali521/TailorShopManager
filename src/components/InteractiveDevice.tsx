import { useState, ReactNode } from "react";
import { 
  Scissors, Heart, Search, Bell, Plus, Trash2, Edit2, 
  ChevronRight, Smartphone, Share2, Printer, Check, 
  FileText, DollarSign, RotateCcw, AlertCircle, ShoppingBag, Eye, User
} from "lucide-react";
import { SIZING_TEMPLATES, SizingTemplate } from "../types";

interface InteractiveDeviceProps {
  children?: ReactNode;
}

export default function InteractiveDevice({ children }: InteractiveDeviceProps) {
  const [activeTab, setActiveTab] = useState<"Splash" | "Customers" | "Inventory" | "Templates">("Customers");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Simulated Customer State
  const [customer, setCustomer] = useState({
    name: "Julian Thorne",
    phone: "+1 (555) 234-5678",
    address: "12 Savile Row, London, W1S 3PF",
    templateId: "dress_shirt",
    customSizes: SIZING_TEMPLATES[0].fields.reduce((acc, f) => ({ ...acc, [f.name]: f.value }), {} as Record<string, string>)
  });

  // State to simulate receipt popup modal (or ticket layer)
  const [showSizingTicket, setShowSizingTicket] = useState(false);
  const [ticketPrinted, setTicketPrinted] = useState(false);
  const [ticketShared, setTicketShared] = useState(false);

  // Simulated Materials/Inventory
  const [materials, setMaterials] = useState([
    { name: "Egyptian Giza Cotton", unitType: "yards", cost: 15, price: 35, stock: 120 },
    { name: "Irish Heritage Linen", unitType: "yards", cost: 22, price: 48, stock: 85 },
    { name: "Super 120s Merino Wool", unitType: "yards", cost: 45, price: 95, stock: 60 }
  ]);

  const potentialProfit = materials.reduce((sum, item) => sum + ((item.price - item.cost) * item.stock), 0);
  const totalCost = materials.reduce((sum, item) => sum + (item.cost * item.stock), 0);
  const totalIncome = materials.reduce((sum, item) => sum + (item.price * item.stock), 0);

  const activeTemplate = SIZING_TEMPLATES.find(t => t.id === customer.templateId) || SIZING_TEMPLATES[0];

  const handleSizeChange = (fieldName: string, value: string) => {
    setCustomer(p => ({
      ...p,
      customSizes: {
        ...p.customSizes,
        [fieldName]: value
      }
    }));
  };

  const handleShareSimulate = () => {
    setTicketShared(true);
    setTimeout(() => setTicketShared(false), 2500);
  };

  const handlePrintSimulate = () => {
    setTicketPrinted(true);
    setTimeout(() => setTicketPrinted(false), 2500);
  };

  return (
    <div id="tailor-app-simulator" className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start w-full text-left">
      
      {/* 1. HERO CONTENT COLUMN */}
      {children && (
        <div className="lg:col-span-7 lg:row-start-1 w-full">
          {children}
        </div>
      )}

      {/* 2. SIMULATED DEVICE (UPPER RIGHT ON DESKTOP, SECOND ON MOBILE) */}
      <div className="lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-32 flex justify-center w-full">
        <div className="relative group shrink-0">
        {/* Glow effect surrounding phone */}
        <div className="absolute -inset-1 rounded-[42px] bg-gradient-to-tr from-brand-gold via-brand-slate to-brand-moss opacity-15 blur-lg group-hover:opacity-25 transition duration-1000"></div>

        {/* Outer Phone Hardware frame */}
        <div className="relative w-[340px] h-[690px] bg-[#1a1816] rounded-[42px] p-3 flex flex-col border-4 border-[#2e2b26] shadow-[0_24px_50px_-12px_rgba(27,26,24,0.5)]">
          
          {/* Ear-speaker notch & front camera */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-5 bg-[#1a1816] rounded-b-2xl z-40 flex items-center justify-around px-4">
            <div className="w-12 h-1 bg-[#2e2b26] rounded-full"></div>
            <div className="w-2 h-2 bg-[#100f0e] rounded-full ring-1 ring-zinc-800"></div>
          </div>

          {/* Device Screen Body */}
          <div className="w-full h-full bg-[#fcfbfc] rounded-[32px] overflow-hidden relative flex flex-col select-none text-brand-charcoal font-sans text-xs">
            
            {/* IN-APP STATUS BAR (Exact Replica of Screenshots metadata) */}
            <div className="bg-[#FCFAF2] h-7 px-5 flex items-center justify-between text-[#333333] font-sans font-semibold text-[11px] relative pt-1 shrink-0">
              <span className="tracking-tight">2:50</span>
              <div className="flex items-center gap-1.5 text-[10px]">
                {/* Simulated connection, notifications, battery percentages */}
                <div className="flex gap-px items-end h-2">
                  <span className="w-0.5 h-1 bg-[#333333] rounded-full"></span>
                  <span className="w-0.5 h-1.5 bg-[#333333] rounded-full"></span>
                  <span className="w-0.5 h-2 bg-[#333333] rounded-full"></span>
                  <span className="w-0.5 h-2.5 bg-[#333333] rounded-full"></span>
                </div>
                <span>15%</span>
                <div className="w-4 h-2 border border-[#333333] rounded-sm p-0.5 flex items-center justify-start">
                  <div className="h-full w-2.5 bg-[#333333] rounded-2xs"></div>
                </div>
              </div>
            </div>

            {/* SCREEN CONTENT CONDITIONAL VIEW */}
            <div className="flex-1 overflow-y-auto bg-slate-50/50 flex flex-col relative">

              {/* SPLASH SCREEN */}
              {activeTab === "Splash" && (
                <div className="absolute inset-0 bg-[#161513] flex flex-col items-center justify-center text-center z-30 transition-all">
                  <div className="w-28 h-28 rounded-full bg-[#1e1d1a] border border-[#2d2a25] flex items-center justify-center shadow-lg mb-6">
                    <div className="w-24 h-24 rounded-full bg-[#1b1a18] flex flex-col items-center justify-center p-3">
                      <Scissors className="w-12 h-12 text-brand-gold mb-1" />
                      <div className="flex gap-1">
                        <span className="h-1.5 w-1.5 bg-brand-gold rounded-full inline-block"></span>
                        <span className="h-1.5 w-4 bg-zinc-600 rounded-full inline-block"></span>
                      </div>
                    </div>
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-[#FCFAF2] tracking-wider">
                    TailorShopManager
                  </h2>
                  <p className="text-[10px] text-zinc-500 font-mono tracking-widest mt-2 uppercase">
                    ESTABLISHED 2026
                  </p>
                  
                  <button 
                    onClick={() => setActiveTab("Customers")}
                    className="absolute bottom-16 px-4 py-2 text-[11px] bg-brand-gold text-brand-cream font-bold uppercase rounded-full shadow-md"
                  >
                    Enter Workspace
                  </button>
                </div>
              )}

              {/* INSIDE THE APP VIEWS */}
              {/* APP CONTENT HEADER */}
              <div className="bg-[#FCFAF2] border-b border-zinc-100 px-4 py-3 shrink-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-base font-bold text-zinc-900 tracking-wide font-sans">
                      Tailor Workspace
                    </h1>
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-600 mt-0.5">
                      <span className="inline-block w-1.5 h-1.5 bg-[#4F5D2F] rounded-full animate-pulse"></span>
                      <span>Cloud: Uploaded & Synced</span>
                    </div>
                  </div>
                  <button className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 border border-zinc-200">
                    <Bell className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* TAB CONTENT: CUSTOMERS */}
              {activeTab === "Customers" && !showSizingTicket && (
                <div className="flex-1 p-4 flex flex-col gap-4 animate-fadeIn">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input 
                      type="text" 
                      placeholder="Search customer name or contact..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-full text-xs shadow-xs focus:ring-1 focus:ring-brand-gold outline-none"
                    />
                  </div>

                  {/* Customer summary count banner */}
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-bold text-zinc-800">Total Customer</span>
                    <span className="bg-zinc-200/70 border border-zinc-300 text-zinc-700 px-2.5 py-0.5 rounded-full font-mono">
                      1 Saved Total
                    </span>
                  </div>

                  {/* Customer list item */}
                  <div className="bg-white border text-left border-zinc-200 p-3.5 rounded-2xl shadow-xs relative hover:border-brand-gold/40 transition">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-zinc-800">{customer.name}</h4>
                          <p className="text-[10px] text-zinc-400 mt-0.5 font-mono">📞 {customer.phone}</p>
                        </div>
                      </div>
                      <span className="text-[9px] bg-brand-moss/10 text-brand-moss font-bold px-1.5 py-0.5 rounded">
                        {activeTemplate.name}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-2 italic border-t pt-2 border-zinc-100">
                      📍 {customer.address}
                    </p>

                    {/* View ticket action button */}
                    <div className="mt-3.5 flex justify-end">
                      <button 
                        onClick={() => setShowSizingTicket(true)}
                        className="px-3.5 py-1.5 bg-zinc-100 text-zinc-800 border border-zinc-200 hover:bg-brand-gold hover:text-white rounded-lg flex items-center gap-1 text-[10px] font-bold transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details Ticket</span>
                      </button>
                    </div>
                  </div>

                  {/* Empty Help Box */}
                  <div className="mt-auto border border-dashed border-zinc-300 rounded-xl p-3 bg-zinc-50/50 text-zinc-600">
                    <span className="font-semibold block mb-1">Tailor tip 📏</span>
                    Select "Details Ticket" to preview or print the stunning golden-bordered physical copy for customers!
                  </div>
                </div>
              )}

              {/* DETAILS TICKET VIEW */}
              {showSizingTicket && (
                <div className="flex-1 p-3 bg-[#FCFAF2] flex flex-col relative animate-fadeIn">
                  
                  {/* Mini control back bar */}
                  <div className="flex justify-between items-center mb-2 border-b pb-1">
                    <button 
                      onClick={() => setShowSizingTicket(false)}
                      className="text-brand-slate hover:text-brand-charcoal text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      ← Back to Workspace
                    </button>
                    <span className="text-[9px] font-mono text-brand-gold">RETRO FORMAT</span>
                  </div>

                  {/* HIGH FIDELITY RETRO TICKET (ACTUAL RECEIPT STYLE) */}
                  <div className="bg-white border-2 border-brand-gold/60 p-3 rounded shadow-md flex-1 flex flex-col relative paper-grain">
                    {/* Top ticket cut aesthetic */}
                    <div className="absolute top-0 inset-x-0 h-1 flex justify-around overflow-hidden">
                      {Array.from({ length: 15 }).map((_, i) => (
                        <div key={i} className="w-3 h-3 bg-[#FCFAF2] rounded-full -translate-y-2"></div>
                      ))}
                    </div>

                    {/* Ticket Header details */}
                    <div className="text-center mt-3 pt-2">
                       <h3 className="font-serif text-[17px] font-bold tracking-wide uppercase text-brand-charcoal">
                        TAILORSHOPMANAGER
                      </h3>
                      <p className="font-mono text-[9px] text-brand-gold tracking-widest uppercase">
                        Master Sizing Record
                      </p>
                      <div className="border-y border-dashed border-zinc-200 my-2 py-0.5 text-[8px] font-mono flex justify-between px-2 text-zinc-500">
                        <span>EST. 2026</span>
                        <span>OFFLINE SECURE DB</span>
                        <span>ORDER: #1209</span>
                      </div>
                    </div>

                    {/* Customer Info Card Box */}
                    <div className="text-left bg-zinc-50 p-2 border border-zinc-100 rounded text-[10px] mb-2 font-mono">
                      <div><strong className="text-brand-slate uppercase font-sans text-[8px] tracking-wide block">BILL TO / CLIENT:</strong></div>
                      <div className="text-zinc-800 font-bold block">{customer.name}</div>
                      <div className="text-[9px] text-zinc-500 block">Phone: {customer.phone}</div>
                      <div className="text-[9px] text-zinc-400 truncate block mt-0.5">Address: {customer.address}</div>
                    </div>

                    {/* Dynamic Sizing values */}
                    <div className="flex-1 min-h-[140px] text-left">
                      <div className="text-[9px] text-brand-gold font-bold font-serif italic mb-1.5 border-b pb-0.5">
                        {activeTemplate.name} Measurements ({activeTemplate.urduName || "Bespoke Specs"}):
                      </div>
                      
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-[10px]">
                        {activeTemplate.fields.map((field) => (
                          <div key={field.name} className="flex justify-between border-b border-dashed border-zinc-100 pb-0.5">
                            <span className="text-zinc-600 truncate max-w-[85px]">{field.label.split('(')[0]}</span>
                            <span className="font-bold text-brand-charcoal text-right text-brand-gold shrink-0">
                              {customer.customSizes[field.name] || field.value}″
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Status & Verification badges */}
                    <div className="border-t border-dashed border-zinc-300 mt-2 pt-2">
                      <div className="flex items-center justify-between font-mono text-[9px] text-[#4F5D2F] font-bold bg-[#4F5D2F]/5 p-1 rounded border border-[#4F5D2F]/20">
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-[#4F5D2F] rounded-full inline-block animate-pulse"></span>
                          MEASURED & VERIFIED
                        </span>
                        <span>PROPRIETOR LOCK</span>
                      </div>
                    </div>

                    {/* Tear-off coupon footer lines */}
                    <div className="ticket-dashed-border h-2 w-full mt-2"></div>
                  </div>

                  {/* Share / Print Mock Actions inside the phone interface */}
                  <div className="grid grid-cols-2 gap-2 mt-2 pt-1 border-t bg-white p-2 rounded">
                    <button 
                      onClick={handlePrintSimulate}
                      className="py-1.5 px-2.5 bg-brand-gold text-brand-cream hover:bg-brand-gold-light text-[10px] font-bold rounded flex items-center justify-center gap-1 transition cursor-pointer"
                    >
                      {ticketPrinted ? <Check className="w-3.5 h-3.5" /> : <Printer className="w-3.5 h-3.5" />}
                      <span>{ticketPrinted ? "Printed!" : "Print Ticket"}</span>
                    </button>
                    <button 
                      onClick={handleShareSimulate}
                      className="py-1.5 px-2.5 border-2 border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-white text-[10px] font-bold rounded flex items-center justify-center gap-1 transition cursor-pointer"
                    >
                      {ticketShared ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                      <span>{ticketShared ? "Shared!" : "Share Receipt"}</span>
                    </button>
                  </div>
                </div>
              )}


              {/* TAB CONTENT: INVENTORY */}
              {activeTab === "Inventory" && (
                <div className="flex-1 p-4 flex flex-col gap-4 animate-fadeIn">
                  
                  {/* Stock statistics summary card (EXACT from uploaded screenshot values structure) */}
                  <div className="bg-[#FCFAF2] border-2 border-brand-gold/60 p-3.5 rounded-2xl text-left relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-brand-gold/10 rounded-bl-full pointer-events-none flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-brand-gold/40 translate-x-1.5 -translate-y-1.5" />
                    </div>
                    
                    <span className="text-[10px] uppercase tracking-wider text-brand-gold font-mono font-bold">
                      Stock Statistics Summary
                    </span>
                    <h3 className="font-mono text-lg font-extrabold text-brand-charcoal mt-1 flex items-center gap-0.5">
                      <DollarSign className="w-3.5 h-3.5 text-brand-gold" />
                      {potentialProfit.toFixed(2)}
                    </h3>
                    <p className="text-[9px] text-[#4F5D2F] font-bold font-mono">Potential Profit Target</p>
                    
                    <div className="grid grid-cols-2 gap-2 mt-3.5 pt-2 border-t border-brand-gold/20 text-[9px] font-mono text-zinc-500">
                      <div>
                        <span>Cost: ${totalCost}</span>
                      </div>
                      <div className="text-right">
                        <span>Expected: ${totalIncome}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stock Materials List */}
                  <h4 className="text-[11px] font-bold text-zinc-800 text-left -mb-1 flex items-center justify-between">
                    <span>Available Fabrics & Items</span>
                    <span className="text-[9px] font-mono text-brand-gold">3 Registered Colors</span>
                  </h4>

                  <div className="flex flex-col gap-2">
                    {materials.map((m, idx) => (
                      <div key={idx} className="bg-white border border-zinc-200 p-3 rounded-xl text-left shadow-2xs hover:border-brand-gold/30 transition">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-bold text-zinc-800 text-xs">{m.name}</h5>
                            <span className="text-[9px] text-zinc-400 lowercase italic">Per customized {m.unitType}</span>
                          </div>
                          <span className="text-[10px] bg-[#4F5D2F]/10 text-[#4F5D2F] px-2 py-0.5 rounded-full font-bold">
                            Stock: {m.stock}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 mt-2.5 pt-2 border-t border-zinc-100 text-[10px] font-mono text-zinc-600">
                          <div>
                            <span className="block text-[8px] text-zinc-400">COST</span>
                            ${m.cost}
                          </div>
                          <div>
                            <span className="block text-[8px] text-zinc-400">RETAIL</span>
                            ${m.price}
                          </div>
                          <div className="text-right text-[#4F5D2F] font-bold">
                            <span className="block text-[8px] text-zinc-400">PROFIT</span>
                            +${m.price - m.cost}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button className="w-full mt-2 py-2 border border-dashed border-brand-gold text-brand-gold bg-brand-gold/5 rounded-xl text-[10px] font-bold hover:bg-brand-gold/15 transition flex items-center justify-center gap-1">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Register New Stock Material</span>
                  </button>
                </div>
              )}

              {/* TAB CONTENT: TEMPLATES */}
              {activeTab === "Templates" && (
                <div className="flex-1 p-4 flex flex-col gap-4 animate-fadeIn">
                  
                  {/* Headline EXACT matching screenshot reference style */}
                  <div className="flex justify-between items-center bg-[#FCFAF2] p-2.5 border border-brand-gold/30 rounded-xl text-left">
                    <div>
                      <h4 className="font-serif text-sm font-bold text-brand-charcoal">
                        Dynamic Sizing Templates
                      </h4>
                      <p className="text-[9px] text-slate-500 font-mono">1 Custom tailoring guideline defined</p>
                    </div>
                    <span className="p-1 px-2 bg-brand-gold text-brand-cream border border-brand-gold text-[9px] font-bold rounded flex items-center gap-1 uppercase">
                      Guide 📖
                    </span>
                  </div>

                  {/* Template List Box */}
                  <div className="flex flex-col gap-2">
                    {SIZING_TEMPLATES.map((tpl) => (
                      <div 
                        key={tpl.id}
                        onClick={() => {
                          setCustomer(p => ({
                            ...p,
                            templateId: tpl.id,
                            customSizes: tpl.fields.reduce((acc, f) => ({ ...acc, [f.name]: f.value }), {} as Record<string, string>)
                          }));
                          setActiveTab("Customers");
                        }} 
                        className={`bg-white border border-zinc-200 p-3 rounded-xl text-left shadow-2xs hover:border-brand-gold transition cursor-pointer flex gap-3 ${
                          customer.templateId === tpl.id ? "ring-2 ring-brand-gold/70" : ""
                        }`}
                      >
                        <div className="w-9 h-9 shrink-0 rounded-lg bg-brand-gold/10 flex items-center justify-center text-brand-gold font-bold text-sm">
                          {tpl.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-zinc-800 text-xs truncate">
                              {tpl.name}
                            </span>
                            {tpl.urduName && (
                              <span className="text-[10px] text-brand-gold font-serif">
                                {tpl.urduName}
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] text-zinc-500 line-clamp-1 block mt-0.5">
                            {tpl.description}
                          </span>
                          <span className="text-[8px] text-[#4F5D2F] font-mono font-bold block mt-1.5">
                            ⚡ {tpl.fields.length} predefined coordinates active
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Template action */}
                  <button className="w-full mt-auto py-2.5 border border-dashed border-zinc-300 bg-zinc-50 hover:bg-zinc-100 rounded-xl text-[11px] text-zinc-700 font-bold flex items-center justify-center gap-1">
                    <Plus className="w-4 h-4" />
                    <span>Create Custom Sizing Blueprint</span>
                  </button>
                </div>
              )}

            </div>

            {/* AD BANNER AT THE BOTTOM (EXACT REPLICA of user's uploaded AD BANNER) */}
            <div className="bg-[#2D3035] h-[52px] p-2 flex items-center gap-2 border-t border-zinc-800 select-none shrink-0 relative">
              <div id="youtube-mock-banner" className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2 overflow-hidden text-left">
                  <div className="w-8 h-8 rounded bg-red-600 flex items-center justify-center text-white shrink-0 shadow">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.524 3.545 12 3.545 12 3.545s-7.525 0-9.387.51A3.003 3.003 0 0 0 .502 6.163C0 8.044 0 12 0 12s0 3.956.502 5.837a3.003 3.003 0 0 0 2.11 2.108c1.862.51 9.387.51 9.387.51s7.524 0 9.387-.51a3.003 3.003 0 0 0 2.11-2.108c.502-1.881.502-5.837.502-5.837s0-3.956-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </div>
                  <div>
                    <span className="font-bold text-[9px] text-[#FCFAF2] block leading-tight truncate">
                      AdMob has a YouTube Test Ad!
                    </span>
                    <span className="text-[8px] text-[#A2A9B3] block truncate">
                      Tap for tutorials, screencasts, & more.
                    </span>
                  </div>
                </div>
                <div className="bg-brand-gold text-brand-cream text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded shadow shrink-0">
                  Ad
                </div>
              </div>
            </div>

            {/* DIRECT NAVIGATION BAR (EXACT replica of bottom-nav shown in images) */}
            <div className="bg-[#FCFAF2] h-14 border-t border-zinc-200 flex items-center justify-around shrink-0 pb-1.5 relative">
              
              <button 
                id="tab-customers"
                onClick={() => { setActiveTab("Customers"); setShowSizingTicket(false); }}
                className={`flex flex-col items-center gap-0.5 cursor-pointer h-full justify-center w-1/4 ${
                  activeTab === "Customers" ? "text-brand-gold font-bold" : "text-brand-slate opacity-70"
                }`}
              >
                <div className={`px-3 py-1 rounded-full ${activeTab === "Customers" ? "bg-brand-gold/15" : ""}`}>
                  <User className="w-5.5 h-5.5" />
                </div>
                <span className="text-[8px] tracking-wide uppercase mt-0.5">Customers</span>
              </button>

              <button 
                id="tab-inventory"
                onClick={() => { setActiveTab("Inventory"); setShowSizingTicket(false); }}
                className={`flex flex-col items-center gap-0.5 cursor-pointer h-full justify-center w-1/4 ${
                  activeTab === "Inventory" ? "text-brand-gold font-bold" : "text-brand-slate opacity-70"
                }`}
              >
                <div className={`px-3 py-1 rounded-full ${activeTab === "Inventory" ? "bg-brand-gold/15" : ""}`}>
                  <ShoppingBag className="w-5.5 h-5.5" />
                </div>
                <span className="text-[8px] tracking-wide uppercase mt-0.5">Inventory</span>
              </button>

              <button 
                id="tab-templates"
                onClick={() => { setActiveTab("Templates"); setShowSizingTicket(false); }}
                className={`flex flex-col items-center gap-0.5 cursor-pointer h-full justify-center w-1/4 ${
                  activeTab === "Templates" ? "text-brand-gold font-bold" : "text-brand-slate opacity-70"
                }`}
              >
                <div className={`px-3 py-1 rounded-full ${activeTab === "Templates" ? "bg-brand-gold/15" : ""}`}>
                  <FileText className="w-5.5 h-5.5" />
                </div>
                <span className="text-[8px] tracking-wide uppercase mt-0.5">Templates</span>
              </button>

              <button 
                id="tab-splash"
                onClick={() => { setActiveTab("Splash"); }}
                className={`flex flex-col items-center gap-0.5 cursor-pointer h-full justify-center w-1/4 ${
                  activeTab === "Splash" ? "text-brand-gold font-bold" : "text-brand-slate opacity-70"
                }`}
              >
                <div className={`px-3 py-1 rounded-full ${activeTab === "Splash" ? "bg-brand-gold/15" : ""}`}>
                  <Scissors className="w-5.5 h-5.5" />
                </div>
                <span className="text-[8px] tracking-wide uppercase mt-0.5">Splash</span>
              </button>

            </div>

          </div>
        </div>
      </div>
    </div>


      {/* 3. LANDING PAGE CONTROL PANEL (STACKED UNDER HERO ON DESKTOP, THIRD ON MOBILE) */}
      <div id="simulator-control-panel" className="lg:col-span-7 lg:row-start-2 w-full bg-white p-6 sm:p-8 rounded-2xl border border-brand-gold/30 shadow-md kraft-shadow">
        <span className="text-xs uppercase font-mono text-brand-gold font-bold tracking-widest block mb-1">
          ❖ LIVE APPLICATION SANDBOX
        </span>
        <h3 className="font-serif text-2xl font-bold text-brand-charcoal mb-3">
          Configure Your Bespoke Ticket
        </h3>
        
        <p className="text-sm text-brand-slate mb-5">
          Type measurements or customer details below and watch them synchronize inside the retro-styled smartphone ticket mock-up screen on the left!
        </p>

        {/* Input Details */}
        <div className="space-y-4 font-sans text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-brand-charcoal mb-1 font-mono">CUSTOMER NAME</label>
              <input 
                type="text"
                value={customer.name}
                onChange={(e) => setCustomer(p => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2 border border-zinc-200 rounded focus:ring-1 focus:ring-brand-gold outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-brand-charcoal mb-1 font-mono">PHONE NUMBER</label>
              <input 
                type="text"
                value={customer.phone}
                onChange={(e) => setCustomer(p => ({ ...p, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-zinc-200 rounded focus:ring-1 focus:ring-brand-gold outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-brand-charcoal mb-1 font-mono">SHOP ADDRESS COORDINATE</label>
            <input 
              type="text"
              value={customer.address}
              onChange={(e) => setCustomer(p => ({ ...p, address: e.target.value }))}
              className="w-full px-3 py-2 border border-zinc-200 rounded focus:ring-1 focus:ring-brand-gold outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-brand-charcoal mb-1.5 font-mono">CHOOSE CUSTOM SIZING TEMPLATE</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {SIZING_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => {
                    setCustomer(p => ({
                      ...p,
                      templateId: tpl.id,
                      customSizes: tpl.fields.reduce((acc, f) => ({ ...acc, [f.name]: f.value }), {} as Record<string, string>)
                    }));
                    // Open ticket automatically to show design instantly
                    setShowSizingTicket(true);
                  }}
                  className={`py-1.5 px-1.5 rounded border text-[10px] font-bold text-center truncate cursor-pointer transition ${
                    customer.templateId === tpl.id 
                      ? "bg-brand-gold text-[#FCFAF2] border-brand-gold shadow-sm" 
                      : "bg-brand-eggshell text-brand-slate border-zinc-200 hover:bg-zinc-100"
                  }`}
                >
                  {tpl.name.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Sizing inputs list */}
          <div className="border-t pt-4">
            <span className="block font-bold text-brand-charcoal font-mono mb-2">
              📏 ENTER ACTIVE COORDINATES (inches ″)
            </span>
            <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1 bg-brand-eggshell/40 p-2.5 rounded border">
              {activeTemplate.fields.map((field) => (
                <div key={field.name} className="flex items-center justify-between gap-1.5">
                  <span className="text-[10px] text-zinc-600 truncate max-w-[130px]" title={field.label}>
                    {field.label.split('(')[0]}
                  </span>
                  <input
                    type="text"
                    value={customer.customSizes[field.name] || ""}
                    onChange={(e) => handleSizeChange(field.name, e.target.value)}
                    className="w-14 text-center px-1 py-1 border border-zinc-200 bg-white font-mono rounded text-[11px] font-bold focus:ring-1 focus:ring-brand-gold outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Live Action Quick Links */}
          <div className="pt-2 flex flex-wrap gap-2.5">
            <button
              onClick={() => {
                setShowSizingTicket(true);
                setActiveTab("Customers");
              }}
              className="px-4 py-2 bg-brand-charcoal hover:bg-brand-slate text-brand-cream rounded font-sans text-xs tracking-wider uppercase font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview Live Receipt</span>
            </button>
            <button
              onClick={() => {
                // Reset to default sizing values
                setCustomer(p => ({
                  ...p,
                  customSizes: activeTemplate.fields.reduce((acc, f) => ({ ...acc, [f.name]: f.value }), {} as Record<string, string>)
                }));
              }}
              className="px-4 py-2 border border-zinc-300 text-zinc-700 hover:bg-zinc-100 rounded font-sans text-xs tracking-wider uppercase font-bold flex items-center gap-1 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Values</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
