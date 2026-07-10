import React, { useState } from "react";
import { 
  ClipboardList, Plus, Search, Calendar, DollarSign, Clock, 
  ArrowRight, FileText, Check, CheckCircle2, ChevronRight, X,
  User, ShieldCheck, HelpCircle, UserPlus, FileSignature, Sparkles
} from "lucide-react";
import { Customer, Order, ShopProfile, SizingCard } from "../types";
import { MEASUREMENT_TEMPLATES, Template } from "./MeasurementTemplates";

interface OrdersWorkspaceProps {
  orders: Order[];
  customers: Customer[];
  shopProfile: ShopProfile;
  sizingTemplates?: Template[];
  onAddOrder: (orderData: Omit<Order, "id" | "createdDate">) => void;
  onUpdateOrderStatus: (id: string, newStatus: Order["status"]) => void;
  onViewOrder: (order: Order) => void;
  onDeleteOrder: (id: string) => void;
  showCommissionFormDefault?: boolean;
  preSelectedCustomerForOrder?: Customer | null;
  onCloseCommissionForm?: () => void;
}

export default function OrdersWorkspace({
  orders,
  customers,
  shopProfile,
  sizingTemplates = [],
  onAddOrder,
  onUpdateOrderStatus,
  onViewOrder,
  onDeleteOrder,
  showCommissionFormDefault = false,
  preSelectedCustomerForOrder = null,
  onCloseCommissionForm
}: OrdersWorkspaceProps) {
  const currency = shopProfile.currency || "$";
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(showCommissionFormDefault);
  const [selectedCustomerId, setSelectedCustomerId] = useState(
    preSelectedCustomerForOrder ? preSelectedCustomerForOrder.id : ""
  );

  // Form states
  const [clothingType, setClothingType] = useState("shalwar_kameez");
  const [dueDate, setDueDate] = useState("");
  const [totalCost, setTotalCost] = useState("");
  const [depositPaid, setDepositPaid] = useState("");
  const [fabricUsed, setFabricUsed] = useState("");
  const [fitPreference, setFitPreference] = useState<"Slim" | "Regular" | "Relaxed">("Regular");
  const [specialNotes, setSpecialNotes] = useState("");
  const [measurementValues, setMeasurementValues] = useState<{ [key: string]: string }>({});

  const allTemplates = [...MEASUREMENT_TEMPLATES, ...sizingTemplates];

  // Sync state if pre-selected customer changes
  React.useEffect(() => {
    if (preSelectedCustomerForOrder) {
      setSelectedCustomerId(preSelectedCustomerForOrder.id);
      setShowForm(true);

      // Pre-fill measurements if they have any sizing cards saved
      if (preSelectedCustomerForOrder.sizingCards.length > 0) {
        const latestCard = preSelectedCustomerForOrder.sizingCards[0];
        setClothingType(latestCard.templateId);
        setMeasurementValues(latestCard.values);
        setFitPreference(latestCard.fitPreference || "Regular");
        setSpecialNotes(latestCard.specialNotes || "");
      }
    }
  }, [preSelectedCustomerForOrder]);

  const handleCustomerChange = (id: string) => {
    setSelectedCustomerId(id);
    const selectedCust = customers.find(c => c.id === id);
    if (selectedCust && selectedCust.sizingCards.length > 0) {
      const card = selectedCust.sizingCards[0];
      setClothingType(card.templateId);
      setMeasurementValues(card.values);
      setFitPreference(card.fitPreference || "Regular");
      setSpecialNotes(card.specialNotes || "");
    } else {
      setMeasurementValues({});
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !dueDate || !totalCost) return;

    const selectedCust = customers.find(c => c.id === selectedCustomerId);
    if (!selectedCust) return;

    onAddOrder({
      customerId: selectedCustomerId,
      customerName: selectedCust.name,
      clothingType: allTemplates.find(t => t.id === clothingType)?.name || clothingType,
      values: measurementValues,
      fitPreference,
      specialNotes,
      totalCost: parseFloat(totalCost),
      depositPaid: parseFloat(depositPaid || "0"),
      status: "Received",
      dueDate,
      fabricUsed: fabricUsed || undefined
    });

    // Reset Form
    setSelectedCustomerId("");
    setDueDate("");
    setTotalCost("");
    setDepositPaid("");
    setFabricUsed("");
    setFitPreference("Regular");
    setSpecialNotes("");
    setMeasurementValues({});
    setShowForm(false);
    if (onCloseCommissionForm) onCloseCommissionForm();
  };

  // Grouping orders by status for Kanban Board representation
  const columns: { label: string; status: Order["status"]; bg: string; border: string; text: string }[] = [
    { label: "Received", status: "Received", bg: "bg-blue-50/50", border: "border-blue-200", text: "text-blue-700" },
    { label: "Cutting Board", status: "Cutting", bg: "bg-amber-50/50", border: "border-amber-200", text: "text-amber-700" },
    { label: "Stitching Work", status: "Stitching", bg: "bg-purple-50/50", border: "border-purple-200", text: "text-purple-700" },
    { label: "Trial Fit Room", status: "Trial Fit", bg: "bg-pink-50/50", border: "border-pink-200", text: "text-pink-700" },
    { label: "Finished & Ready", status: "Ready", bg: "bg-emerald-50/50", border: "border-emerald-200", text: "text-emerald-700" },
    { label: "Delivered", status: "Delivered", bg: "bg-slate-50/50", border: "border-slate-200", text: "text-slate-500" }
  ];

  const filteredOrders = orders.filter(o => {
    const term = search.toLowerCase();
    return (
      o.customerName.toLowerCase().includes(term) ||
      o.clothingType.toLowerCase().includes(term) ||
      o.id.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {showForm ? (
        /* ORDER CREATION WIZARD SCREEN */
        <div className="bg-white border border-[#8B6B3F]/15 rounded-xl p-6 text-left shadow-md max-w-4xl mx-auto animate-fadeIn space-y-6">
          <div className="flex justify-between items-center border-b border-zinc-900/10 pb-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-[#D97706]" />
              <h3 className="font-serif text-xl font-bold text-zinc-950">Draft Sartorial Commission</h3>
            </div>
            <button
              onClick={() => {
                setShowForm(false);
                if (onCloseCommissionForm) onCloseCommissionForm();
              }}
              className="p-1 hover:bg-zinc-100 rounded text-zinc-400 hover:text-zinc-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-6 text-xs">
            {/* Column layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column: Client, Fabric, Sizing Class & Financials */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-zinc-500 mb-1.5">
                    Associate Client Portfolio *
                  </label>
                  <select
                    required
                    value={selectedCustomerId}
                    onChange={(e) => handleCustomerChange(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-zinc-200 rounded-lg text-xs font-sans focus:outline-none focus:border-[#D97706]"
                  >
                    <option value="">-- Choose registered customer --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-zinc-500 mb-1.5">
                      Bespoke Silhouette Template
                    </label>
                    <select
                      value={clothingType}
                      onChange={(e) => setClothingType(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-[#8B6B3F]/15 rounded-lg text-xs font-sans focus:outline-none focus:border-[#D97706]"
                    >
                      {allTemplates.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-zinc-500 mb-1.5">
                      Fabric Spec Code
                    </label>
                    <input
                      type="text"
                      value={fabricUsed}
                      onChange={(e) => setFabricUsed(e.target.value)}
                      placeholder="e.g. Boski Silk #4"
                      className="w-full p-2.5 bg-slate-50 border border-zinc-200 rounded-lg text-xs font-sans focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-zinc-500 mb-1.5">
                      Service Price ({currency}) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={totalCost}
                      onChange={(e) => setTotalCost(e.target.value)}
                      placeholder="e.g. 150"
                      className="w-full p-2.5 bg-slate-50 border border-zinc-200 rounded-lg text-xs font-mono focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-zinc-500 mb-1.5">
                      Deposit Received ({currency})
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={depositPaid}
                      onChange={(e) => setDepositPaid(e.target.value)}
                      placeholder="e.g. 50"
                      className="w-full p-2.5 bg-slate-50 border border-zinc-200 rounded-lg text-xs font-mono focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-zinc-500 mb-1.5">
                      Delivery Due Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-zinc-200 rounded-lg text-xs font-mono focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-zinc-500 mb-1.5">
                      Silhouette Fit Style
                    </label>
                    <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg text-center font-bold">
                      {(["Slim", "Regular", "Relaxed"] as const).map(p => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setFitPreference(p)}
                          className={`py-1 rounded transition cursor-pointer ${
                            fitPreference === p ? "bg-white text-[#D97706]" : "text-zinc-500"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-zinc-500 mb-1.5">
                    Special Artisanal Requests
                  </label>
                  <textarea
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    placeholder="Wears left cuff wider to fit massive gold watch dials..."
                    rows={2}
                    className="w-full p-2.5 bg-slate-50 border border-zinc-200 rounded-lg text-xs font-sans focus:outline-none"
                  />
                </div>
              </div>

              {/* Right Column: Interactive Measurement Blueprint Grid */}
              <div className="bg-[#FCFAF5] border border-[#8B6B3F]/15 p-4 rounded-xl flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="block text-[10px] font-mono font-bold text-[#8B6B3F] uppercase tracking-wider">
                    Sartorial Specification Values
                  </span>
                  <p className="text-[10px] text-zinc-500 leading-relaxed font-sans">
                    These metrics populate the client sizing booklet. Adjust measurements for this specific commission.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                    {(allTemplates.find(t => t.id === clothingType)?.fields || []).map(f => (
                      <div key={f.key}>
                        <label className="block text-[9px] font-mono font-bold text-zinc-400 uppercase truncate" title={f.label}>
                          {f.label.split(" (")[0]}
                        </label>
                        <input
                          type="text"
                          value={measurementValues[f.key] || ""}
                          onChange={(e) => setMeasurementValues({ ...measurementValues, [f.key]: e.target.value })}
                          placeholder={f.placeholder}
                          className="w-full p-1.5 bg-white border border-zinc-200 rounded text-xs font-mono text-[#D97706] focus:outline-none focus:border-[#D97706]"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-[#8B6B3F]/10 pt-4 mt-4 flex justify-between items-center">
                  <div className="text-left font-mono">
                    <span className="text-[10px] text-zinc-400 block uppercase">Outstanding Debt</span>
                    <span className="text-sm font-bold text-[#D97706]">
                      {currency}{Math.max(0, parseFloat(totalCost || "0") - parseFloat(depositPaid || "0")).toFixed(2)}
                    </span>
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#D97706] hover:bg-[#F59E0B] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-md transition cursor-pointer"
                  >
                    Setup Commission Ticket
                  </button>
                </div>

              </div>

            </div>
          </form>
        </div>
      ) : (
        /* KANBAN BOARD SCREEN */
        <div className="space-y-6 animate-fadeIn">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
            <div className="relative flex-1 max-w-md text-left">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400 pointer-events-none">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search active orders by customer name, fabric, or order ID..."
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-sans placeholder-zinc-400 focus:outline-none shadow-sm transition"
              />
            </div>
            
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2.5 bg-[#D97706] hover:bg-[#F59E0B] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Draft Commission</span>
            </button>
          </div>

          {/* Kanban Columns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4 items-start overflow-x-auto pb-4">
            {columns.map((col) => {
              const columnOrders = filteredOrders.filter(o => o.status === col.status);
              
              return (
                <div 
                  key={col.status} 
                  className={`border ${col.border} rounded-xl p-4 flex flex-col min-h-[500px] text-left shrink-0 ${col.bg}`}
                >
                  {/* Column Header */}
                  <div className="flex justify-between items-center border-b border-zinc-900/5 pb-2 mb-3 font-bold font-mono">
                    <span className={`text-xs uppercase tracking-wider ${col.text}`}>{col.label}</span>
                    <span className="px-2 py-0.5 bg-white border rounded text-[10px] text-zinc-400">
                      {columnOrders.length}
                    </span>
                  </div>

                  {/* Cards stack */}
                  <div className="space-y-3 flex-1">
                    {columnOrders.length === 0 ? (
                      <div className="py-12 text-center text-zinc-300 font-mono text-[9px] uppercase border border-dashed border-zinc-200 rounded-xl">
                        Empty column
                      </div>
                    ) : (
                      columnOrders.map((order) => {
                        const balance = Math.max(0, order.totalCost - order.depositPaid);
                        const isOutstanding = balance > 0;

                        return (
                          <div
                            key={order.id}
                            className="bg-white border border-zinc-200 rounded-xl p-3.5 shadow-sm hover:shadow-md transition cursor-pointer relative group space-y-2.5 text-xs text-left"
                            onClick={() => onViewOrder(order)}
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-[#D97706] font-mono leading-none uppercase truncate max-w-[80px]">
                                {order.clothingType}
                              </span>
                              <span className="text-[9px] font-mono text-zinc-400">
                                #{order.id.slice(-4).toUpperCase()}
                              </span>
                            </div>

                            <div>
                              <h4 className="font-serif font-black text-zinc-900 text-sm group-hover:text-[#D97706] transition truncate">
                                {order.customerName}
                              </h4>
                              <p className="text-[10px] text-zinc-400 font-mono mt-0.5 flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-zinc-300" />
                                <span>Due: {order.dueDate}</span>
                              </p>
                            </div>

                            {order.fabricUsed && (
                              <div className="text-[9px] font-mono px-2 py-0.5 bg-slate-50 border border-zinc-100 rounded text-zinc-500 inline-block truncate max-w-full">
                                {order.fabricUsed}
                              </div>
                            )}

                            {/* Financial status indicators & update status control */}
                            <div className="border-t border-zinc-100 pt-2.5 flex justify-between items-center text-[10px] font-mono">
                              <div>
                                <span className="text-zinc-400 block text-[8px] uppercase">Ledger</span>
                                <span className={`font-bold ${isOutstanding ? 'text-rose-500' : 'text-emerald-500'}`}>
                                  {isOutstanding ? `${currency}${balance}` : "Paid"}
                                </span>
                              </div>

                              <div onClick={(e) => e.stopPropagation()}>
                                <select
                                  value={order.status}
                                  onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as Order["status"])}
                                  className="p-1 border border-zinc-200 rounded text-[10px] text-zinc-700 bg-white font-mono cursor-pointer"
                                >
                                  <option value="Received">Received</option>
                                  <option value="Cutting">Cutting</option>
                                  <option value="Stitching">Stitching</option>
                                  <option value="Trial Fit">Trial Fit</option>
                                  <option value="Ready">Ready</option>
                                  <option value="Delivered">Delivered</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
