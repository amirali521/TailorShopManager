import React, { useState } from "react";
import { 
  Search, Users, Plus, Phone, MapPin, UserCheck, Eye, Trash2, 
  Ruler, ClipboardList, Clock, CreditCard, X, Scissors, Heart,
  Edit2, Save, FileText, Check, PlusCircle, FileSpreadsheet
} from "lucide-react";
import { Customer, Order, ShopProfile, SizingCard } from "../types";
import { MEASUREMENT_TEMPLATES } from "./MeasurementTemplates";

interface CustomerWorkspaceProps {
  customers: Customer[];
  orders: Order[];
  shopProfile: ShopProfile;
  inventory?: any[];
  onUpdateStock?: (id: string, newQuantity: number) => void;
  selectedCustomerId: string | null;
  onSelectCustomer: (customerId: string | null) => void;
  onAddCustomer: (customerData: { name: string; phone: string; address: string }) => void;
  onDeleteCustomer: (id: string) => void;
  onUpdateCustomerDetails: (id: string, updated: Partial<Customer>) => void;
  onAddSizingCard: (customerId: string, sizingCard: Omit<SizingCard, "id" | "createdDate">) => void;
  onDeleteSizingCard: (customerId: string, cardId: string) => void;
  sizingTemplates?: any[];
  onAddSizingTemplate?: (name: string, fields: string[]) => void;
  onDeleteSizingTemplate?: (templateId: string) => void;
  onAddOrder?: (orderData: Omit<Order, "id" | "createdDate">) => void;
  onAddOrderClick: (customer: Customer) => void;
  onViewOrder: (order: Order) => void;
}

export default function CustomerWorkspace({
  customers,
  orders,
  shopProfile,
  inventory = [],
  onUpdateStock,
  selectedCustomerId,
  onSelectCustomer,
  onAddCustomer,
  onDeleteCustomer,
  onUpdateCustomerDetails,
  onAddSizingCard,
  onDeleteSizingCard,
  sizingTemplates = [],
  onAddSizingTemplate,
  onDeleteSizingTemplate,
  onAddOrder,
  onAddOrderClick,
  onViewOrder
}: CustomerWorkspaceProps) {
  const currency = shopProfile.currency || "$";
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", phone: "", address: "" });
  const [showSizingModal, setShowSizingModal] = useState(false);

  // Sizing form state
  const [sizingTemplateId, setSizingTemplateId] = useState("shalwar_kameez");
  const [sizingValues, setSizingValues] = useState<{ [key: string]: string }>({});
  const [fitPref, setFitPref] = useState<"Slim" | "Regular" | "Relaxed">("Regular");
  const [specialNotes, setSpecialNotes] = useState("");

  // Dynamic template creation state
  const [showTemplateCreator, setShowTemplateCreator] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateFields, setNewTemplateFields] = useState<string[]>([]);
  const [newFieldInput, setNewFieldInput] = useState("");

  // Ledger record click states
  const [selectedLedger, setSelectedLedger] = useState<any | null>(null);

  // Direct purchase from inventory state
  const [showDirectSaleModal, setShowDirectSaleModal] = useState(false);
  const [selectedInventoryId, setSelectedInventoryId] = useState("");
  const [saleQuantity, setSaleQuantity] = useState("1");
  const [saleNotes, setSaleNotes] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [saleDeposit, setSaleDeposit] = useState("");
  const [isFullyPaidSale, setIsFullyPaidSale] = useState(true);

  const allTemplates = [...MEASUREMENT_TEMPLATES, ...sizingTemplates];

  const currentCustomer = customers.find(c => c.id === selectedCustomerId);

  // Find customer's active status: active if has any non-Delivered order
  const getCustomerStatus = (custId: string) => {
    const hasActive = orders.some(o => o.customerId === custId && o.status !== "Delivered");
    return hasActive ? "Active" : "Idle";
  };

  const getCustomerOrders = (custId: string) => {
    return orders.filter(o => o.customerId === custId);
  };

  // Enforce international/standard digits format preview
  const filteredCustomers = customers.filter(c => {
    const term = search.toLowerCase();
    const matchesName = c.name.toLowerCase().includes(term);
    const matchesPhone = c.phone.includes(term);
    const matchesOrderId = orders.some(o => o.customerId === c.id && o.id.toLowerCase().includes(term));
    return matchesName || matchesPhone || matchesOrderId;
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name.trim()) return;
    onAddCustomer(addForm);
    setAddForm({ name: "", phone: "", address: "" });
    setShowAddModal(false);
  };

  const handleAddSizingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) return;
    const template = allTemplates.find(t => t.id === sizingTemplateId);
    if (!template) return;

    onAddSizingCard(selectedCustomerId, {
      templateId: sizingTemplateId,
      templateName: template.name,
      values: sizingValues,
      fitPreference: fitPref,
      specialNotes: specialNotes
    });

    // Reset
    setSizingValues({});
    setSpecialNotes("");
    setFitPref("Regular");
    setShowSizingModal(false);
  };

  // Template pre-fill action
  const prefillTemplate = (templateId: string) => {
    setSizingTemplateId(templateId);
    const templateObj = allTemplates.find(t => t.id === templateId);
    if (!templateObj) return;
    const initialVals: { [key: string]: string } = {};
    templateObj.fields.forEach(f => {
      // populate with mock average values for demonstration
      initialVals[f.key] = f.placeholder ? f.placeholder.replace("e.g. ", "") : "0";
    });
    setSizingValues(initialVals);
  };

  // CSV export function for current client directory
  const handleExportCSV = () => {
    const headers = ["ID", "Name", "Phone", "Address", "Debt Due", "Paid Snapshot", "Total Billed"];
    const rows = customers.map(c => [
      c.id,
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.phone}"`,
      `"${c.address.replace(/"/g, '""')}"`,
      c.debtDue,
      c.paidSnapshot,
      c.totalBilled
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "atelier_customer_directory.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {currentCustomer ? (
        /* DETAIL SUB-VIEW */
        <div className="animate-fadeIn space-y-6 text-left">
          
          {/* Back link */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-900/10 pb-4">
            <button
              onClick={() => onSelectCustomer(null)}
              className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#D97706] hover:text-zinc-900 transition"
            >
              ← Back to Client Directory
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => onAddOrderClick(currentCustomer)}
                className="px-3.5 py-1.5 bg-[#D97706] hover:bg-[#F59E0B] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Scissors className="w-4 h-4" />
                <span>New Commission</span>
              </button>
              <button
                onClick={() => {
                  const newName = window.prompt("Modify Name:", currentCustomer.name);
                  if (newName) {
                    const newPhone = window.prompt("Modify Phone:", currentCustomer.phone) || currentCustomer.phone;
                    const newAddr = window.prompt("Modify Address:", currentCustomer.address) || currentCustomer.address;
                    onUpdateCustomerDetails(currentCustomer.id, { name: newName, phone: newPhone, address: newAddr });
                  }
                }}
                className="px-3 py-1.5 border border-zinc-300 hover:bg-zinc-100 rounded-lg text-xs font-bold text-zinc-700 transition"
              >
                Edit Profile
              </button>
              <button
                onClick={() => {
                  if (confirm("Delete this customer entirely? This action is irreversible.")) {
                    onDeleteCustomer(currentCustomer.id);
                  }
                }}
                className="p-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition"
                title="Delete customer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Profile Overview Card */}
          <div className="bg-white border border-[#8B6B3F]/15 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-amber-50 text-[#D97706] border border-[#8B6B3F]/20 flex items-center justify-center text-2xl font-serif font-black shadow-inner">
                {currentCustomer.name.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h3 className="font-serif text-2xl font-bold text-zinc-900">{currentCustomer.name}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                    getCustomerStatus(currentCustomer.id) === "Active" 
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                      : "bg-slate-100 text-slate-500 border border-slate-200"
                  }`}>
                    {getCustomerStatus(currentCustomer.id)}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 font-mono flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>{currentCustomer.phone}</span>
                </p>
                <p className="text-xs text-zinc-600 flex items-center gap-1.5 leading-relaxed">
                  <MapPin className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>{currentCustomer.address}</span>
                </p>
              </div>
            </div>

            {/* Micro Financial Pillar within Customer Details */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 border border-zinc-900/5 p-3.5 rounded-xl sm:w-80 font-mono text-center">
              <div className="border-r border-zinc-200 pr-1 text-zinc-600">
                <span className="text-[9px] uppercase tracking-wider block font-bold text-zinc-400">Billed</span>
                <span className="text-xs font-bold text-zinc-800 block mt-0.5">{currency}{currentCustomer.totalBilled}</span>
              </div>
              <div className="border-r border-zinc-200 px-1 text-zinc-600">
                <span className="text-[9px] uppercase tracking-wider block font-bold text-zinc-400">Paid</span>
                <span className="text-xs font-bold text-emerald-600 block mt-0.5">{currency}{currentCustomer.paidSnapshot}</span>
              </div>
              <div className="pl-1 text-zinc-600">
                <span className="text-[9px] uppercase tracking-wider block font-bold text-zinc-400">Debt</span>
                <span className="text-xs font-bold text-rose-600 block mt-0.5">{currency}{currentCustomer.debtDue}</span>
              </div>
            </div>
          </div>

          {/* Sizing Card Blueprint Cards */}
          <div className="bg-white border border-[#8B6B3F]/15 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-900/5 pb-3">
              <div>
                <h4 className="font-serif text-lg font-bold text-zinc-900">Sizing Card Booklets</h4>
                <p className="text-xs text-zinc-400">Archived measurement presets and traditional silhouettes</p>
              </div>
              <button
                onClick={() => {
                  setSizingValues({});
                  setShowSizingModal(true);
                }}
                className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-[#D97706] border border-amber-200 text-xs font-bold uppercase rounded-lg flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Sizing Booklet</span>
              </button>
            </div>

            {currentCustomer.sizingCards.length === 0 ? (
              <div className="py-10 text-center text-zinc-400 space-y-2 border border-dashed border-zinc-200 rounded-xl bg-slate-50/50">
                <Ruler className="w-10 h-10 text-zinc-300 mx-auto" />
                <p className="text-xs font-bold text-zinc-600">No Measurement Blueprints Saved</p>
                <p className="text-[10px] text-zinc-400 max-w-xs mx-auto">
                  Log specific sizing cards matching bespoke categories (e.g. Suits, Trousers, Traditional Shalwar Kameez) for quick order lookups.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentCustomer.sizingCards.map((card) => (
                  <div key={card.id} className="border border-zinc-200 hover:border-[#D97706]/40 rounded-xl p-4 bg-slate-50/50 relative space-y-3 shadow-sm transition">
                    <div className="flex justify-between items-start border-b border-zinc-200 pb-2">
                      <div>
                        <span className="text-sm font-serif font-extrabold text-zinc-900">{card.templateName}</span>
                        <p className="text-[9px] font-mono text-zinc-400 mt-0.5">Logged: {card.createdDate}</p>
                      </div>
                      <button
                        onClick={() => onDeleteSizingCard(currentCustomer.id, card.id)}
                        className="p-1 hover:bg-rose-50 text-rose-500 rounded border border-rose-100 transition"
                        title="Delete card"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                      {Object.entries(card.values).map(([k, val]) => (
                        <div key={k} className="p-1.5 bg-white border border-zinc-100 rounded flex justify-between font-mono">
                          <span className="text-zinc-400 capitalize truncate max-w-[55px]">{k.replace("_", " ")}:</span>
                          <span className="font-bold text-[#D97706]">{val}</span>
                        </div>
                      ))}
                    </div>

                    {/* Sizing metadata details */}
                    <div className="border-t border-dashed border-zinc-200 pt-2 flex justify-between items-center text-[10px]">
                      {card.fitPreference && (
                        <span className="font-bold font-sans text-zinc-500">
                          Fit: <span className="text-zinc-900">{card.fitPreference}</span>
                        </span>
                      )}
                      {card.specialNotes && (
                        <span className="text-zinc-400 italic truncate max-w-[150px]" title={card.specialNotes}>
                          Notes: {card.specialNotes}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Historical Orders & Cash Book Ledger Side-by-Side Dual Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Sartorial Commission History */}
            <div className="bg-white border border-[#8B6B3F]/15 rounded-xl p-6 shadow-sm space-y-4 text-left">
              <h4 className="font-serif text-lg font-bold text-zinc-900 border-b border-zinc-900/5 pb-2">
                Sartorial Commission History ({getCustomerOrders(currentCustomer.id).length})
              </h4>

              {getCustomerOrders(currentCustomer.id).length === 0 ? (
                <div className="py-10 text-center text-zinc-400 space-y-2 border border-dashed border-zinc-200 rounded-xl bg-slate-50/50">
                  <ClipboardList className="w-10 h-10 text-zinc-300 mx-auto" />
                  <p className="text-xs font-bold text-zinc-600">No active or historical orders logged yet</p>
                  <p className="text-[10px] text-zinc-400">Press 'New Commission' to start drafting the client's order ledger dockets.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {getCustomerOrders(currentCustomer.id).map((order) => {
                    const balance = Math.max(0, order.totalCost - order.depositPaid);
                    return (
                      <div 
                        key={order.id} 
                        className="p-4 bg-slate-50 border border-zinc-200 hover:border-[#D97706]/20 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-serif font-bold text-sm text-zinc-900">
                              {order.clothingType}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-400">
                              #{order.id.slice(-6).toUpperCase()}
                            </span>
                          </div>
                          <p className="text-zinc-500 font-mono text-[10px]">
                            Due: {order.dueDate} | Ordered: {order.createdDate}
                          </p>
                          {order.fabricUsed && (
                            <p className="text-[#D97706] font-mono text-[10px] bg-amber-50 px-2 py-0.5 rounded border border-amber-100 inline-block">
                              Fabric: {order.fabricUsed}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                          <div className="text-left sm:text-right font-mono">
                            <span className="text-zinc-400 block text-[9px]">Ledger status</span>
                            <span className={`font-bold ${balance === 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                              {balance === 0 ? "Paid In Full" : `Due: ${currency}${balance.toFixed(2)}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 bg-amber-100/55 text-[#D97706] text-[10px] font-bold uppercase rounded-lg border border-amber-200 font-mono">
                              {order.status}
                            </span>
                            <button
                              onClick={() => onViewOrder(order)}
                              className="p-2 hover:bg-white border border-zinc-200 rounded-lg text-zinc-500 hover:text-[#D97706] transition"
                              title="Open Invoice/Docket"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Financial Cash Book Ledger */}
            <div className="bg-white border border-[#8B6B3F]/15 rounded-xl p-6 shadow-sm space-y-4 text-left">
              <div className="flex justify-between items-center border-b border-zinc-900/5 pb-2">
                <div>
                  <h4 className="font-serif text-lg font-bold text-zinc-900">
                    Financial Cash Book Ledger
                  </h4>
                  <p className="text-xs text-zinc-400 font-sans">Chronological transaction statements and receipts</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedInventoryId("");
                    setSaleQuantity("1");
                    setSaleNotes("");
                    setSalePrice("");
                    setSaleDeposit("");
                    setIsFullyPaidSale(true);
                    setShowDirectSaleModal(true);
                  }}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold uppercase rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Log Direct Sale</span>
                </button>
              </div>

              {currentCustomer.ledgerHistory.length === 0 ? (
                <div className="py-10 text-center text-zinc-400 space-y-2 border border-dashed border-zinc-200 rounded-xl bg-slate-50/50">
                  <CreditCard className="w-10 h-10 text-zinc-300 mx-auto" />
                  <p className="text-xs font-bold text-[#D97706]">No Ledger Entries Recorded</p>
                  <p className="text-[10px] text-zinc-400 max-w-xs mx-auto">
                    Transactions are logged automatically during commission bookings, or can be registered manually with direct inventory stock deduction.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-96 overflow-y-auto pr-2">
                  {currentCustomer.ledgerHistory.map((entry) => {
                    const isPayment = entry.type === "payment";
                    return (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => setSelectedLedger(entry)}
                        className="w-full text-left p-3.5 bg-slate-50 hover:bg-slate-100 border border-zinc-100 hover:border-[#D97706]/25 rounded-xl flex items-center justify-between gap-4 transition group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${isPayment ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            {isPayment ? <Check className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                          </div>
                          <div>
                            <span className="font-sans font-bold text-zinc-800 text-xs block group-hover:text-[#D97706] transition">
                              {entry.description}
                            </span>
                            <span className="text-[9px] font-mono text-zinc-400 block mt-0.5">
                              {entry.date} • ID: #{entry.id.slice(-6).toUpperCase()}
                            </span>
                          </div>
                        </div>

                        <div className="text-right font-mono text-xs">
                          <span className={`font-black ${isPayment ? 'text-emerald-600' : 'text-zinc-900'}`}>
                            {isPayment ? "+" : "-"}{currency}{entry.amount}
                          </span>
                          <span className="block text-[8px] uppercase tracking-wider text-zinc-400 font-bold mt-0.5">
                            {entry.type}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

        </div>
      ) : (
        /* LIST DIRECTORY SCREEN */
        <div className="space-y-6 animate-fadeIn">
          
          {/* Search Table Action Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400 pointer-events-none">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search custom client portfolios by name, mobile line, or order hash..."
                className="w-full pl-10 pr-4 py-3 bg-white border border-zinc-200 rounded-xl text-xs font-sans placeholder-zinc-400 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706] shadow-sm transition"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleExportCSV}
                className="px-4 py-3 bg-white hover:bg-slate-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-600 flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
                title="Export list to CSV file"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-3 bg-[#D97706] hover:bg-[#F59E0B] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Register Portfolio</span>
              </button>
            </div>
          </div>

          {/* Directory Count Title */}
          <div className="flex items-center justify-between border-b border-zinc-900/5 pb-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#D97706]" />
              <span className="text-xs font-bold uppercase text-zinc-400 tracking-wider">
                Tailor Client Portfolios
              </span>
            </div>
            <span className="px-2.5 py-0.5 bg-slate-100 border border-zinc-200 text-zinc-500 text-xs font-mono font-bold rounded-lg">
              {filteredCustomers.length} portfoliogrid
            </span>
          </div>

          {/* Table Directory Grid */}
          {filteredCustomers.length === 0 ? (
            <div className="py-20 text-center text-zinc-400 border border-dashed border-zinc-200 rounded-2xl bg-white space-y-4">
              <div className="p-4 bg-amber-50 rounded-full text-[#D97706] border border-amber-100 inline-block">
                <Users className="w-12 h-12" />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif text-lg font-bold text-zinc-950">No portfoliogrid Matching Filter</h4>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                  Refine your search term or insert a brand new customer registry directly using the button above.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 border border-[#D97706] text-[#D97706] text-xs font-bold uppercase rounded-lg hover:bg-amber-50 transition cursor-pointer"
              >
                Create Account
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredCustomers.map((customer) => {
                const recentOrders = getCustomerOrders(customer.id);
                const hasMeasurements = customer.sizingCards.length > 0;
                const balance = customer.debtDue;

                return (
                  <div 
                    key={customer.id}
                    className="bg-white border border-[#8B6B3F]/15 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-[#D97706]/40 transition text-left flex flex-col justify-between relative group"
                  >
                    <div className="space-y-3.5">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-amber-50 text-[#D97706] border border-amber-100 flex items-center justify-center text-base font-serif font-black shadow-inner shrink-0">
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-serif font-bold text-base text-zinc-900 group-hover:text-[#D97706] transition truncate">
                              {customer.name}
                            </h4>
                            <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-zinc-400 shrink-0" />
                              <span className="truncate">{customer.phone}</span>
                            </span>
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded ${
                          getCustomerStatus(customer.id) === "Active" 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                            : "bg-slate-50 text-slate-400 border border-slate-100"
                        }`}>
                          {getCustomerStatus(customer.id)}
                        </span>
                      </div>

                      <p className="text-[11px] text-zinc-500 font-sans leading-relaxed flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                        <span className="truncate">{customer.address}</span>
                      </p>

                      <div className="grid grid-cols-2 gap-2 border-t border-b border-zinc-100 py-2.5 my-1 text-[10px] font-mono">
                        <div>
                          <span className="text-zinc-400 block uppercase">Booklet Cards:</span>
                          <span className="font-bold text-zinc-800">
                            {hasMeasurements ? `✓ ${customer.sizingCards.length} Presets` : "⚠️ None logged"}
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-400 block uppercase">Outstanding:</span>
                          <span className={`font-bold ${balance > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                            {balance > 0 ? `${currency}${balance}` : "Paid In Full"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-3.5 mt-2">
                      <span className="text-[10px] font-mono text-zinc-400">
                        Orders: {recentOrders.length} logged
                      </span>
                      <button
                        onClick={() => onSelectCustomer(customer.id)}
                        className="px-3 py-1.5 bg-[#0F172A] hover:bg-[#D97706] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                      >
                        Open Profile
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: ADD CUSTOMER PORTFOLIO */}
      {showAddModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 text-left">
          <div className="w-full max-w-md bg-white border border-[#8B6B3F]/20 rounded-xl shadow-2xl p-6 relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-xl font-bold text-zinc-950 mb-2 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#D97706]" />
              <span>Register Customer Portfolio</span>
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Create an offline client card with precise ledger structures and measurement dockets.
            </p>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-zinc-500 mb-1.5">
                  Client Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="e.g. Master Amirali Khan"
                  className="w-full p-2.5 bg-slate-50 border border-zinc-200 rounded-lg text-xs font-sans focus:outline-none focus:border-[#D97706]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-zinc-500 mb-1.5">
                  Mobile Line Number
                </label>
                <input
                  type="text"
                  value={addForm.phone}
                  onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                  placeholder="e.g. +92 300 1234567"
                  className="w-full p-2.5 bg-slate-50 border border-zinc-200 rounded-lg text-xs font-sans focus:outline-none focus:border-[#D97706]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-zinc-500 mb-1.5">
                  Residential / Workshop Address
                </label>
                <textarea
                  value={addForm.address}
                  onChange={(e) => setAddForm({ ...addForm, address: e.target.value })}
                  placeholder="e.g. Street Lane, Bespoke Hub, Karachi, Pakistan"
                  rows={2}
                  className="w-full p-2.5 bg-slate-50 border border-zinc-200 rounded-lg text-xs font-sans focus:outline-none focus:border-[#D97706]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#D97706] hover:bg-[#F59E0B] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-md transition cursor-pointer"
              >
                Setup Portfolio Card
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD SIZING BLUEPRINT CARD */}
      {showSizingModal && currentCustomer && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto text-left py-12">
          <div className="w-full max-w-xl bg-white border border-[#8B6B3F]/20 rounded-xl shadow-2xl p-6 relative my-auto">
            <button
              onClick={() => setShowSizingModal(false)}
              className="absolute top-4 right-4 p-1 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-xl font-bold text-zinc-950 mb-1 flex items-center gap-2">
              <Ruler className="w-5 h-5 text-[#D97706]" />
              <span>Bespoke Sizing Docket</span>
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Add precise client measurements based on classic silhouettes (e.g., Shalwar Kameez, Classic Shirts, or Suits).
            </p>

            {/* Quick Templates Buttons bar */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1.5">
                <span className="block text-[10px] font-mono font-bold uppercase text-zinc-400">
                  Quick Preset Fillers:
                </span>
                <button
                  type="button"
                  onClick={() => setShowTemplateCreator(!showTemplateCreator)}
                  className="text-[#D97706] hover:underline text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer"
                >
                  {showTemplateCreator ? "← Use Presets" : "+ Create Custom Template"}
                </button>
              </div>

              {!showTemplateCreator ? (
                <div className="flex flex-wrap gap-1.5">
                  {allTemplates.map(t => {
                    const isCustom = !MEASUREMENT_TEMPLATES.some(mt => mt.id === t.id);
                    return (
                      <div key={t.id} className="relative group/tag inline-flex items-center">
                        <button
                          type="button"
                          onClick={() => prefillTemplate(t.id)}
                          className={`px-2.5 py-1 text-[10px] font-bold uppercase border rounded transition cursor-pointer ${
                            sizingTemplateId === t.id 
                              ? "bg-[#D97706] border-[#D97706] text-white rounded-lg" 
                              : "bg-slate-50 border-zinc-200 text-zinc-600 hover:bg-slate-100 rounded-lg"
                          }`}
                        >
                          {t.name.split("/")[0]}
                        </button>
                        {isCustom && onDeleteSizingTemplate && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Delete custom template "${t.name}" permanently?`)) {
                                onDeleteSizingTemplate(t.id);
                              }
                            }}
                            className="absolute -top-1 -right-1 bg-rose-500 text-white w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] border border-white hover:bg-rose-600 shadow opacity-0 group-hover/tag:opacity-100 transition"
                            title="Delete custom template"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-amber-50/70 border border-[#D97706]/20 p-3.5 rounded-xl space-y-3.5 text-xs text-left">
                  <div className="flex justify-between items-center">
                    <span className="font-serif font-bold text-[#D97706]">Bespoke Template Designer</span>
                    <button
                      type="button"
                      onClick={() => {
                        setNewTemplateName("");
                        setNewTemplateFields([]);
                        setNewFieldInput("");
                        setShowTemplateCreator(false);
                      }}
                      className="text-zinc-400 hover:text-zinc-600 font-bold"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="block text-[9px] font-mono font-bold uppercase text-zinc-500 mb-1">
                        Silhouette / Pattern Name *
                      </label>
                      <input
                        type="text"
                        value={newTemplateName}
                        onChange={(e) => setNewTemplateName(e.target.value)}
                        placeholder="e.g. Ladies Kurti, Waistcoat"
                        className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-xs font-sans focus:outline-none focus:border-[#D97706]"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono font-bold uppercase text-zinc-500 mb-1">
                        Add Measurement Fields/Tags * (Press Enter or click Add)
                      </label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={newFieldInput}
                          onChange={(e) => setNewFieldInput(e.target.value)}
                          placeholder="e.g. Shoulder Cross, Cuff Width"
                          className="flex-1 p-2 bg-white border border-zinc-200 rounded-lg text-xs font-sans focus:outline-none focus:border-[#D97706]"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (newFieldInput.trim() && !newTemplateFields.includes(newFieldInput.trim())) {
                                setNewTemplateFields([...newTemplateFields, newFieldInput.trim()]);
                                setNewFieldInput("");
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newFieldInput.trim() && !newTemplateFields.includes(newFieldInput.trim())) {
                              setNewTemplateFields([...newTemplateFields, newFieldInput.trim()]);
                              setNewFieldInput("");
                            }
                          }}
                          className="px-3 bg-[#D97706] text-white rounded-lg font-bold font-mono cursor-pointer"
                        >
                          + Add
                        </button>
                      </div>
                    </div>

                    {newTemplateFields.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {newTemplateFields.map(f => (
                          <span key={f} className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-zinc-200 text-zinc-700 rounded-full text-[10px] font-sans font-bold">
                            <span>{f}</span>
                            <button
                              type="button"
                              onClick={() => setNewTemplateFields(newTemplateFields.filter(x => x !== f))}
                              className="text-rose-500 font-bold hover:text-rose-700 ml-1 cursor-pointer"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    <button
                      type="button"
                      disabled={!newTemplateName.trim() || newTemplateFields.length === 0}
                      onClick={() => {
                        if (onAddSizingTemplate) {
                          onAddSizingTemplate(newTemplateName, newTemplateFields);
                          setNewTemplateName("");
                          setNewTemplateFields([]);
                          setNewFieldInput("");
                          setShowTemplateCreator(false);
                        }
                      }}
                      className="w-full py-2 bg-[#D97706] disabled:bg-zinc-300 disabled:cursor-not-allowed text-white font-bold uppercase rounded-lg text-center cursor-pointer"
                    >
                      Save & Register Dynamic Template
                    </button>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleAddSizingSubmit} className="space-y-4">
              
              {/* Render Fields based on selectedTemplate */}
              <div className="bg-slate-50 border border-zinc-100 p-4 rounded-xl">
                <span className="block text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider mb-3">
                  Sartorial Specifications Grid
                </span>
                <div className="grid grid-cols-2 gap-3">
                  {(allTemplates.find(t => t.id === sizingTemplateId)?.fields || []).map((f) => (
                    <div key={f.key}>
                      <label className="block text-[10px] font-mono font-bold text-zinc-500 mb-1 truncate" title={f.label}>
                        {f.label}
                      </label>
                      <input
                        type="text"
                        value={sizingValues[f.key] || ""}
                        onChange={(e) => setSizingValues({ ...sizingValues, [f.key]: e.target.value })}
                        placeholder={f.placeholder}
                        className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-xs font-mono focus:outline-none focus:border-[#D97706]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Fit Preference selector & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-zinc-500 mb-1.5">
                    Silhouettes Fit Preference
                  </label>
                  <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg text-center text-xs font-bold">
                    {(["Slim", "Regular", "Relaxed"] as const).map(pref => (
                      <button
                        key={pref}
                        type="button"
                        onClick={() => setFitPref(pref)}
                        className={`py-1.5 rounded transition cursor-pointer ${
                          fitPref === pref 
                            ? "bg-white text-[#D97706] shadow-sm" 
                            : "text-zinc-500 hover:text-zinc-800"
                        }`}
                      >
                        {pref}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-zinc-500 mb-1.5">
                    Special notes (e.g. Watch, cuffs)
                  </label>
                  <input
                    type="text"
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    placeholder="Wears left-hand massive dial watches..."
                    className="w-full p-2 bg-slate-50 border border-zinc-200 rounded-lg text-xs font-sans focus:outline-none focus:border-[#D97706]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#D97706] hover:bg-[#F59E0B] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-md transition cursor-pointer"
              >
                Archive Booklet Blueprint
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: LEDGER TRANSACTION DETAILS */}
      {selectedLedger && currentCustomer && (() => {
        const orderId = selectedLedger.id.startsWith("bill-") ? selectedLedger.id.replace("bill-", "") : 
                        selectedLedger.id.startsWith("pmnt-") ? selectedLedger.id.replace("pmnt-", "") : "";
        const associatedOrder = orders.find(o => 
          o.id === orderId || 
          o.id === selectedLedger.id ||
          (o.customerId === currentCustomer.id && (
            selectedLedger.description.toLowerCase().includes(o.clothingType.toLowerCase()) ||
            selectedLedger.description.toLowerCase().includes("deposit") ||
            o.id.includes(orderId) ||
            selectedLedger.id.includes(o.id)
          ))
        );

        return (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 text-left">
            <div className="w-full max-w-md bg-white border border-[#8B6B3F]/20 rounded-xl shadow-2xl p-6 relative">
              <button
                onClick={() => setSelectedLedger(null)}
                className="absolute top-4 right-4 p-1 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-serif text-xl font-bold text-zinc-950 mb-1 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#D97706]" />
                <span>Ledger Docket Entry</span>
              </h3>
              <p className="text-xs text-zinc-400 mb-4 font-sans">
                Reviewing single transaction reference from client account statement.
              </p>

              <div className="bg-slate-50 border border-zinc-100 rounded-xl p-4.5 space-y-3.5 font-mono text-xs text-zinc-700">
                <div className="flex justify-between border-b border-zinc-200 pb-1.5">
                  <span className="text-zinc-400">Transaction ID:</span>
                  <span className="font-bold text-zinc-900">#{selectedLedger.id.toUpperCase()}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-200 pb-1.5">
                  <span className="text-zinc-400">Posting Date:</span>
                  <span className="font-bold text-zinc-900">{selectedLedger.date}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-200 pb-1.5">
                  <span className="text-zinc-400">Client Account:</span>
                  <span className="font-bold text-zinc-900">{currentCustomer.name}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-200 pb-1.5">
                  <span className="text-zinc-400">Description:</span>
                  <span className="font-bold text-[#D97706] text-right max-w-[200px] truncate" title={selectedLedger.description}>
                    {selectedLedger.description}
                  </span>
                </div>
                <div className="flex justify-between border-b border-zinc-200 pb-1.5">
                  <span className="text-zinc-400">Entry Type:</span>
                  <span className={`font-bold uppercase ${selectedLedger.type === 'payment' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {selectedLedger.type}
                  </span>
                </div>

                {/* Associated Order / Bill specs directly inside Ledger Detail Modal */}
                {associatedOrder && (
                  <div className="bg-amber-50/50 border border-amber-200/50 rounded-lg p-3 space-y-2 text-[11px] font-sans">
                    <span className="block font-mono text-[9px] font-bold text-amber-800 uppercase tracking-wider">
                      Linked Commission Details
                    </span>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Order/Item Name:</span>
                      <span className="font-bold text-zinc-800">{associatedOrder.clothingType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Total Price:</span>
                      <span className="font-bold text-zinc-800">{currency}{associatedOrder.totalCost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Advance Payment:</span>
                      <span className="font-bold text-emerald-600">{currency}{associatedOrder.depositPaid}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Remaining Balance:</span>
                      <span className={`font-bold ${associatedOrder.totalCost - associatedOrder.depositPaid > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {currency}{(associatedOrder.totalCost - associatedOrder.depositPaid).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Full Payment:</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${associatedOrder.totalCost === associatedOrder.depositPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                        {associatedOrder.totalCost === associatedOrder.depositPaid ? "Paid in Full" : "Pending Balance"}
                      </span>
                    </div>
                    {associatedOrder.specialNotes && (
                      <div className="border-t border-zinc-200/50 pt-1.5 mt-1">
                        <span className="text-[10px] text-zinc-400 block font-bold uppercase font-mono">Special Note:</span>
                        <p className="text-[10px] text-zinc-600 italic leading-snug mt-0.5">{associatedOrder.specialNotes}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center pt-2">
                  <span className="text-zinc-500 font-bold">Transaction Sum:</span>
                  <span className="text-xl font-black text-zinc-950">
                    {currency}{selectedLedger.amount}
                  </span>
                </div>
              </div>

              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => setSelectedLedger(null)}
                  className="w-full py-2.5 bg-slate-900 hover:bg-[#D97706] text-white text-xs font-mono font-bold uppercase rounded-lg transition cursor-pointer"
                >
                  Close Transaction Log
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL 4: DIRECT SALE & STOCK DISBURSEMENT */}
      {showDirectSaleModal && currentCustomer && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-left overflow-y-auto py-12">
          <div className="w-full max-w-md bg-white border border-[#8B6B3F]/20 rounded-xl shadow-2xl p-6 relative my-auto">
            <button
              onClick={() => setShowDirectSaleModal(false)}
              className="absolute top-4 right-4 p-1 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-xl font-bold text-zinc-950 mb-1 flex items-center gap-2">
              <Scissors className="w-5 h-5 text-emerald-600" />
              <span>Direct Material Sale & Stock Dispatch</span>
            </h3>
            <p className="text-xs text-zinc-400 mb-4 font-sans">
              Disburse raw rolls, accessories or ready-made assets directly from inventory to client portfolio and debit account ledger.
            </p>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!selectedInventoryId) return;
              const item = (inventory || []).find(i => i.id === selectedInventoryId);
              if (!item) return;

              const qty = parseFloat(saleQuantity);
              if (isNaN(qty) || qty <= 0) return;

              if (qty > item.quantity) {
                alert(`⚠️ Insufficient stock! Only ${item.quantity} ${item.unit} available in inventory.`);
                return;
              }

              const price = parseFloat(salePrice) || 0;
              const deposit = isFullyPaidSale ? price : (parseFloat(saleDeposit) || 0);

              // 1. Log direct sale as Delivered Order in dockets
              if (onAddOrder) {
                onAddOrder({
                  customerId: currentCustomer.id,
                  customerName: currentCustomer.name,
                  clothingType: `Direct Asset: ${item.name}`,
                  values: {
                    dispatched_quantity: `${qty} ${item.unit}`,
                    unit_price: `${currency}${(price / qty).toFixed(2)}`,
                  },
                  fitPreference: "Regular",
                  specialNotes: `Purchased directly from Stock Inventory. Notes: ${saleNotes || "None"}`,
                  totalCost: price,
                  depositPaid: deposit,
                  status: "Delivered",
                  dueDate: new Date().toISOString().split('T')[0],
                  fabricUsed: item.name
                });
              }

              // 2. Decrement selected inventory stock
              if (onUpdateStock) {
                onUpdateStock(item.id, item.quantity - qty);
              }

              setShowDirectSaleModal(false);
            }} className="space-y-4 text-xs">
              
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-zinc-500 mb-1.5">
                  Select Stock Asset / Fabric Roll *
                </label>
                <select
                  required
                  value={selectedInventoryId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedInventoryId(id);
                    const item = (inventory || []).find(i => i.id === id);
                    if (item) {
                      setSalePrice((item.costPrice * 1.5).toString()); // suggest retail price
                    }
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-zinc-200 rounded-lg text-xs font-sans focus:outline-none focus:border-[#D97706]"
                >
                  <option value="">-- Choose Item from Inventory --</option>
                  {(inventory || []).map(i => (
                    <option key={i.id} value={i.id} disabled={i.quantity <= 0}>
                      {i.name} ({i.quantity} {i.unit} left) — Cost: {currency}{i.costPrice}
                    </option>
                  ))}
                </select>
              </div>

              {selectedInventoryId && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-zinc-500 mb-1.5">
                      Quantity to Buy *
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      min="0.1"
                      value={saleQuantity}
                      onChange={(e) => {
                        const qty = e.target.value;
                        setSaleQuantity(qty);
                        const item = (inventory || []).find(i => i.id === selectedInventoryId);
                        if (item && qty) {
                          setSalePrice((item.costPrice * 1.5 * parseFloat(qty)).toString());
                        }
                      }}
                      placeholder="e.g. 1"
                      className="w-full p-2.5 bg-slate-50 border border-zinc-200 rounded-lg text-xs font-mono focus:outline-none focus:border-[#D97706]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-zinc-500 mb-1.5">
                      Total Sale Price ({currency}) *
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={salePrice}
                      onChange={(e) => setSalePrice(e.target.value)}
                      placeholder="e.g. 150"
                      className="w-full p-2.5 bg-slate-50 border border-zinc-200 rounded-lg text-xs font-mono focus:outline-none focus:border-[#D97706]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-zinc-500 mb-1.5">
                  Sartorial Dispatch Notes
                </label>
                <input
                  type="text"
                  value={saleNotes}
                  onChange={(e) => setSaleNotes(e.target.value)}
                  placeholder="e.g. Delivered direct, client took fabric roll instantly"
                  className="w-full p-2.5 bg-slate-50 border border-zinc-200 rounded-lg text-xs font-sans focus:outline-none focus:border-[#D97706]"
                />
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-zinc-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-600 uppercase text-[9px] tracking-wider font-mono">Payment Status</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsFullyPaidSale(true)}
                      className={`px-2.5 py-1 text-[9px] uppercase font-bold rounded font-mono cursor-pointer ${isFullyPaidSale ? 'bg-[#D97706] text-white' : 'bg-slate-200 text-zinc-600'}`}
                    >
                      Full Pay
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsFullyPaidSale(false);
                        setSaleDeposit((parseFloat(salePrice) * 0.5 || 0).toString());
                      }}
                      className={`px-2.5 py-1 text-[9px] uppercase font-bold rounded font-mono cursor-pointer ${!isFullyPaidSale ? 'bg-[#D97706] text-white' : 'bg-slate-200 text-zinc-600'}`}
                    >
                      Deposit/Debt
                    </button>
                  </div>
                </div>

                {!isFullyPaidSale && (
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-zinc-500 mb-1">
                      Down Payment / Deposit Paid ({currency})
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={saleDeposit}
                      onChange={(e) => setSaleDeposit(e.target.value)}
                      placeholder="e.g. 50"
                      className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-xs font-mono focus:outline-none focus:border-[#D97706]"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!selectedInventoryId}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-md transition cursor-pointer"
              >
                Log Dispatched Sale
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
