import React, { useState } from "react";
import { 
  Scissors, Plus, Search, AlertTriangle, RefreshCw, BarChart2,
  Trash2, Filter, ShieldCheck, HelpCircle, Package, ArrowRight, X
} from "lucide-react";
import { InventoryItem, ShopProfile } from "../types";

interface InventoryWorkspaceProps {
  inventory: InventoryItem[];
  shopProfile: ShopProfile;
  onAddItem: (itemData: Omit<InventoryItem, "id" | "lastUpdated">) => void;
  onUpdateStock: (id: string, newQuantity: number) => void;
  onDeleteItem: (id: string) => void;
}

export default function InventoryWorkspace({
  inventory,
  shopProfile,
  onAddItem,
  onUpdateStock,
  onDeleteItem
}: InventoryWorkspaceProps) {
  const currency = shopProfile.currency || "$";
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("All");
  const [showAddForm, setShowAddForm] = useState(false);

  // New item form state
  const [name, setName] = useState("");
  const [colorCode, setColorCode] = useState("#8B6B3F");
  const [type, setType] = useState<InventoryItem["type"]>("Fabric");
  const [quantity, setQuantity] = useState("");
  const [safetyLevel, setSafetyLevel] = useState("");
  const [unit, setUnit] = useState("Yards");
  const [costPrice, setCostPrice] = useState("");
  const [supplier, setSupplier] = useState("");

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !quantity || !safetyLevel || !costPrice) return;

    onAddItem({
      name,
      colorCode,
      type,
      quantity: parseFloat(quantity),
      safetyLevel: parseFloat(safetyLevel),
      unit,
      costPrice: parseFloat(costPrice),
      supplier: supplier || "Local Distributor"
    });

    // Reset Form
    setName("");
    setColorCode("#8B6B3F");
    setType("Fabric");
    setQuantity("");
    setSafetyLevel("");
    setCostPrice("");
    setSupplier("");
    setShowAddForm(false);
  };

  const filteredItems = inventory.filter(item => {
    const term = search.toLowerCase();
    const matchesSearch = item.name.toLowerCase().includes(term) || item.supplier.toLowerCase().includes(term);
    const matchesFilter = filterType === "All" || item.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const typesList = ["All", "Fabric", "Thread", "Button", "Lining", "Accessory"];

  return (
    <div className="space-y-6">
      
      {/* Top action layout */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 text-left">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search rolling fabrics, thread reels, brass buttons, suppliers..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-sans placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#D97706] shadow-sm transition"
          />
        </div>

        <div className="flex gap-2">
          {/* Custom Select Filter */}
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-mono font-bold text-zinc-600 focus:outline-none cursor-pointer"
            >
              {typesList.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2.5 bg-[#D97706] hover:bg-[#F59E0B] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Stock Item</span>
          </button>
        </div>
      </div>

      {/* Sizing indicators bar & count details */}
      <div className="flex items-center justify-between border-b border-zinc-900/5 pb-2">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-[#D97706]" />
          <span className="text-xs font-bold uppercase text-zinc-400 tracking-wider">
            Material Roll Inventories
          </span>
        </div>
        <span className="px-2.5 py-0.5 bg-slate-100 border border-zinc-200 text-zinc-500 text-xs font-mono font-bold rounded-lg">
          {filteredItems.length} items listed
        </span>
      </div>

      {/* Main Grid View */}
      {filteredItems.length === 0 ? (
        <div className="py-20 text-center text-zinc-400 border border-dashed border-zinc-200 rounded-2xl bg-white space-y-4">
          <div className="p-4 bg-amber-50 rounded-full text-[#D97706] border border-amber-100 inline-block">
            <Package className="w-12 h-12" />
          </div>
          <div className="space-y-1">
            <h4 className="font-serif text-lg font-bold text-zinc-950">No stock Matching Filter</h4>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Please refine your filter or add custom boutique assets using the "Add Stock Item" wizard above.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredItems.map((item) => {
            const isLowStock = item.quantity <= item.safetyLevel;
            const percentage = Math.min(100, Math.max(5, (item.quantity / (item.safetyLevel * 2)) * 100));

            return (
              <div 
                key={item.id}
                className="bg-white border border-[#8B6B3F]/15 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-[#D97706]/40 transition text-left flex flex-col justify-between relative group"
              >
                {/* Low Stock Warning Badge */}
                {isLowStock && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-0.5 bg-rose-50 border border-rose-200 text-rose-600 text-[9px] font-mono font-bold uppercase rounded-full shadow-inner animate-pulse">
                    <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0" />
                    <span>Low Stock</span>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Item Identifier */}
                  <div className="flex gap-3 items-start pr-12">
                    <div 
                      className="w-5 h-10 rounded-lg shadow-inner shrink-0 mt-0.5"
                      style={{ backgroundColor: item.colorCode || "#C2B280" }}
                      title={`Color identifier: ${item.colorCode}`}
                    />
                    <div>
                      <h4 className="font-serif font-bold text-sm text-zinc-950 truncate max-w-[150px]" title={item.name}>
                        {item.name}
                      </h4>
                      <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                        {item.type}
                      </span>
                    </div>
                  </div>

                  {/* Stock level details */}
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between items-end font-mono">
                      <span className="text-zinc-400">Current Level</span>
                      <span className={`text-base font-bold ${isLowStock ? "text-rose-600" : "text-zinc-800"}`}>
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                    {/* Visual Meter Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${isLowStock ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] font-mono text-zinc-400 mt-1">
                      <span>Safety: {item.safetyLevel} {item.unit}</span>
                      <span>Supplier: {item.supplier}</span>
                    </div>
                  </div>

                  {/* Pricing detail */}
                  <div className="bg-slate-50 border border-zinc-100 rounded-lg p-2 flex justify-between items-center text-[10px] font-mono">
                    <span className="text-zinc-400 uppercase">Cost Price:</span>
                    <span className="font-bold text-[#D97706]">
                      {currency}{item.costPrice.toFixed(2)} per {item.unit.toLowerCase().replace("s", "")}
                    </span>
                  </div>
                </div>

                {/* Operations Actions bar */}
                <div className="flex items-center justify-between border-t border-zinc-100 pt-3.5 mt-4">
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        const amt = prompt("Adjust stock level (Enter absolute value):", item.quantity.toString());
                        if (amt !== null && !isNaN(parseFloat(amt))) {
                          onUpdateStock(item.id, parseFloat(amt));
                        }
                      }}
                      className="px-2 py-1 border border-zinc-200 hover:bg-zinc-50 rounded text-[10px] font-mono font-bold uppercase transition flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3 text-zinc-400" />
                      <span>Adjust</span>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`Remove "${item.name}" from rolling catalog?`)) {
                        onDeleteItem(item.id);
                      }
                    }}
                    className="p-1.5 text-zinc-300 hover:text-rose-500 hover:bg-rose-50 rounded transition"
                    title="Delete inventory roll"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: REGISTER STOCK ITEM */}
      {showAddForm && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 text-left">
          <div className="w-full max-w-md bg-white border border-[#8B6B3F]/20 rounded-xl shadow-2xl p-6 relative">
            <button
              onClick={() => setShowAddForm(false)}
              className="absolute top-4 right-4 p-1 hover:bg-zinc-100 rounded text-zinc-400 hover:text-zinc-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-xl font-bold text-zinc-950 mb-2 flex items-center gap-2">
              <Package className="w-5 h-5 text-[#D97706]" />
              <span>Register Stock Asset</span>
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Catalog rolling fabrics, designer lining yardage, thread, and luxury gold button supplies.
            </p>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-zinc-500 mb-1.5">
                  Item Description / Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Classic Irish Linen (Golden Brown)"
                  className="w-full p-2.5 bg-slate-50 border border-zinc-200 rounded-lg font-sans focus:outline-none focus:border-[#D97706]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-zinc-500 mb-1.5">
                    Material Category
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as InventoryItem["type"])}
                    className="w-full p-2.5 bg-slate-50 border border-zinc-200 rounded-lg font-sans focus:outline-none"
                  >
                    <option value="Fabric">Fabric Roll</option>
                    <option value="Thread">Thread Spool</option>
                    <option value="Button">Buttons Pack</option>
                    <option value="Lining">Lining Cloth</option>
                    <option value="Accessory">Trim/Accessory</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-zinc-500 mb-1.5">
                    Supplier Catalog Code
                  </label>
                  <input
                    type="text"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    placeholder="e.g. Al-Karam Mills"
                    className="w-full p-2.5 bg-slate-50 border border-zinc-200 rounded-lg font-sans focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-zinc-500 mb-1.5">
                    Starting Stock *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="45"
                    className="w-full p-2.5 bg-slate-50 border border-zinc-200 rounded-lg font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-zinc-500 mb-1.5">
                    Min Safety *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={safetyLevel}
                    onChange={(e) => setSafetyLevel(e.target.value)}
                    placeholder="10"
                    className="w-full p-2.5 bg-slate-50 border border-zinc-200 rounded-lg font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-zinc-500 mb-1.5">
                    Unit Category
                  </label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="Yards"
                    className="w-full p-2.5 bg-slate-50 border border-zinc-200 rounded-lg font-sans focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-zinc-500 mb-1.5">
                    Artisanal Color Tag
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={colorCode}
                      onChange={(e) => setColorCode(e.target.value)}
                      className="w-10 h-10 border rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={colorCode}
                      onChange={(e) => setColorCode(e.target.value)}
                      placeholder="#8B6B3F"
                      className="w-full p-2.5 bg-slate-50 border border-zinc-200 rounded-lg font-mono focus:outline-none text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-zinc-500 mb-1.5">
                    Price per Unit ({currency}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    placeholder="12.50"
                    className="w-full p-2.5 bg-slate-50 border border-zinc-200 rounded-lg font-mono focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#D97706] hover:bg-[#F59E0B] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-md transition cursor-pointer"
              >
                Catalog Asset Roll
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
