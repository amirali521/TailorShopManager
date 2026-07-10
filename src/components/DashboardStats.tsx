import React from "react";
import { 
  Users, ClipboardList, Wallet, AlertTriangle, Clock, 
  ChevronRight, Scissors, TrendingUp, Plus, ArrowRight, UserPlus
} from "lucide-react";
import { Customer, Order, InventoryItem, ShopProfile } from "../types";

interface DashboardStatsProps {
  customers: Customer[];
  orders: Order[];
  inventory: InventoryItem[];
  shopProfile: ShopProfile;
  onNavigateTab: (tab: "customers" | "orders" | "inventory" | "settings") => void;
  onAddCustomerClick: () => void;
  onAddOrderClick: () => void;
  onViewOrder: (order: Order) => void;
}

export default function DashboardStats({
  customers,
  orders,
  inventory,
  shopProfile,
  onNavigateTab,
  onAddCustomerClick,
  onAddOrderClick,
  onViewOrder
}: DashboardStatsProps) {
  const currency = shopProfile.currency || "$";

  // Calculate metrics
  const totalCustomers = customers.length;
  const activeOrdersCount = orders.filter(o => o.status !== "Delivered").length;
  
  // Financial summaries
  const totalBooked = orders.reduce((sum, o) => sum + o.totalCost, 0);
  const totalPaid = orders.reduce((sum, o) => sum + o.depositPaid, 0);
  const totalOutstanding = Math.max(0, totalBooked - totalPaid);

  // Inventory warnings
  const lowStockItems = inventory.filter(i => i.quantity <= i.safetyLevel);

  // Group orders by status
  const statusCounts = {
    Received: orders.filter(o => o.status === "Received").length,
    Cutting: orders.filter(o => o.status === "Cutting").length,
    Stitching: orders.filter(o => o.status === "Stitching").length,
    "Trial Fit": orders.filter(o => o.status === "Trial Fit").length,
    Ready: orders.filter(o => o.status === "Ready").length,
    Delivered: orders.filter(o => o.status === "Delivered").length,
  };

  // Urgent Orders (Due today or soon - within next 5 days)
  const sortedUpcomingOrders = [...orders]
    .filter(o => o.status !== "Delivered")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0F172A] to-[#1E293B] border border-[#D97706]/20 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
          <Scissors className="w-64 h-64 text-[#D97706]" />
        </div>
        <div className="relative z-10 space-y-4 max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#D97706]/15 border border-[#D97706]/30 rounded-full text-xs font-mono font-bold text-[#F59E0B] uppercase tracking-wider">
            ✨ Premium Artisan Workspace
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold tracking-tight">
            Welcome to <span className="text-[#F59E0B]">{shopProfile.shopName || "Royal Atelier"}</span>
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed font-sans">
            Oversee bespoke cutting templates, track rolling textile supplies, record client deposits, and dispatch printer-friendly invoice blueprints. Offline backup storage has been compiled and secured.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={onAddCustomerClick}
              className="px-4 py-2 bg-[#D97706] hover:bg-[#F59E0B] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register Client</span>
            </button>
            <button
              onClick={onAddOrderClick}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#D97706]" />
              <span>Commission Order</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Metrics 4-Column Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1 */}
        <div className="bg-white border border-[#8B6B3F]/15 rounded-xl p-5 shadow-sm hover:shadow-md transition flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-[#D97706] rounded-xl border border-amber-100 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">
              Registered Clients
            </span>
            <span className="text-2xl font-serif font-extrabold text-zinc-900 block mt-0.5">
              {totalCustomers}
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-[#8B6B3F]/15 rounded-xl p-5 shadow-sm hover:shadow-md transition flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 shrink-0">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">
              Active Commissions
            </span>
            <span className="text-2xl font-serif font-extrabold text-zinc-900 block mt-0.5">
              {activeOrdersCount}
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-[#8B6B3F]/15 rounded-xl p-5 shadow-sm hover:shadow-md transition flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">
              Paid Deposits
            </span>
            <span className="text-2xl font-serif font-extrabold text-zinc-900 block mt-0.5">
              {currency}{totalPaid.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-[#8B6B3F]/15 rounded-xl p-5 shadow-sm hover:shadow-md transition flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">
              Outstanding Debt
            </span>
            <span className="text-2xl font-serif font-extrabold text-zinc-900 block mt-0.5">
              {currency}{totalOutstanding.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Workflow Queue & Inventory Warnings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Stitching Queue Breakdown Block */}
        <div className="bg-white border border-[#8B6B3F]/15 rounded-xl p-6 shadow-sm space-y-4 lg:col-span-2 text-left">
          <div className="flex justify-between items-center border-b border-zinc-900/5 pb-3">
            <div>
              <h3 className="font-serif text-lg font-bold text-zinc-900">Stitching Workflow Queue</h3>
              <p className="text-xs text-zinc-400">Order distribution across real-time workstation status</p>
            </div>
            <button
              onClick={() => onNavigateTab("orders")}
              className="text-xs font-mono text-[#D97706] hover:text-[#F59E0B] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
            >
              <span>View Board</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { status: "Received", color: "bg-blue-50 border-blue-100 text-blue-700 text-blue-500" },
              { status: "Cutting", color: "bg-amber-50 border-amber-100 text-amber-700 text-amber-500" },
              { status: "Stitching", color: "bg-purple-50 border-purple-100 text-purple-700 text-purple-500" },
              { status: "Trial Fit", color: "bg-pink-50 border-pink-100 text-pink-700 text-pink-500" },
              { status: "Ready", color: "bg-emerald-50 border-emerald-100 text-emerald-700 text-emerald-500" },
              { status: "Delivered", color: "bg-slate-50 border-slate-100 text-slate-700 text-slate-500" },
            ].map(({ status, color }) => {
              const count = statusCounts[status as keyof typeof statusCounts] || 0;
              return (
                <div key={status} className={`p-4 rounded-xl border text-center ${color}`}>
                  <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest opacity-80 block">
                    {status}
                  </span>
                  <p className="text-2xl font-serif font-black mt-1">
                    {count}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Low Stock Inventory Warn Module */}
        <div className="bg-white border border-[#8B6B3F]/15 rounded-xl p-6 shadow-sm space-y-4 text-left">
          <div className="flex justify-between items-center border-b border-zinc-900/5 pb-3">
            <div>
              <h3 className="font-serif text-lg font-bold text-zinc-900">Inventory Warnings</h3>
              <p className="text-xs text-zinc-400">Material counts currently below safety levels</p>
            </div>
            <button
              onClick={() => onNavigateTab("inventory")}
              className="text-xs font-mono text-[#D97706] hover:text-[#F59E0B] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
            >
              <span>Manage</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {lowStockItems.length === 0 ? (
            <div className="py-8 text-center bg-emerald-50/40 border border-emerald-100 rounded-xl space-y-2">
              <span className="inline-block p-2 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold font-mono">
                ✓ ALL STABLE
              </span>
              <p className="text-xs text-zinc-600 font-medium">All rolls and shears above limits</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {lowStockItems.map((item) => (
                <div 
                  key={item.id} 
                  className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-zinc-800">{item.name}</p>
                    <p className="text-[10px] text-zinc-400 font-mono">
                      Type: {item.type} | Min: {item.safetyLevel} {item.unit}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-red-600">
                      {item.quantity} {item.unit}
                    </span>
                    <span className="text-[9px] font-mono block text-red-400 font-extrabold uppercase mt-0.5">
                      Low Stock
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Quick-Access Tasks: Due today or urgent trials */}
      <div className="bg-white border border-[#8B6B3F]/15 rounded-xl p-6 shadow-sm text-left">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-zinc-900/5 pb-3 mb-4 gap-2">
          <div>
            <h3 className="font-serif text-lg font-bold text-zinc-900">Upcoming Bespoke Commissions</h3>
            <p className="text-xs text-zinc-400">Horizontal view of pending sartorial deadlines sorted chronologically</p>
          </div>
          <button
            onClick={() => onNavigateTab("orders")}
            className="text-xs font-mono text-[#D97706] hover:text-[#F59E0B] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer self-start"
          >
            <span>All Orders</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {sortedUpcomingOrders.length === 0 ? (
          <div className="py-12 text-center text-zinc-400 space-y-2 border border-dashed border-zinc-200 rounded-xl">
            <ClipboardList className="w-8 h-8 text-zinc-300 mx-auto" />
            <p className="text-xs font-bold text-zinc-600">No active commissions scheduled</p>
            <p className="text-[10px] text-zinc-400">Press 'Commission Order' in client files to setup tasks</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sortedUpcomingOrders.map((order) => {
              const outstandingAmount = Math.max(0, order.totalCost - order.depositPaid);
              const isPaidInFull = outstandingAmount === 0;

              return (
                <div 
                  key={order.id}
                  onClick={() => onViewOrder(order)}
                  className="bg-slate-50 hover:bg-[#FAF8ED] border border-[#8B6B3F]/10 hover:border-[#D97706]/40 rounded-xl p-4 transition cursor-pointer space-y-3 relative group text-xs text-left"
                >
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-800 text-[9px] font-bold uppercase rounded font-mono">
                      {order.clothingType}
                    </span>
                    <span className="font-mono text-[9px] text-zinc-400">
                      #{order.id.slice(-4).toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-serif font-bold text-zinc-900 text-sm group-hover:text-[#D97706] transition truncate">
                      {order.customerName}
                    </h4>
                    <p className="text-[10px] text-zinc-400 font-mono mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#D97706]" />
                      <span>Due: {order.dueDate}</span>
                    </p>
                  </div>

                  <div className="border-t border-zinc-900/5 pt-2.5 flex justify-between items-center text-[10px] font-mono">
                    <div>
                      <span className="text-zinc-400 block">Balance</span>
                      <span className={`font-bold ${isPaidInFull ? 'text-emerald-600' : 'text-red-500'}`}>
                        {currency}{outstandingAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-zinc-400 block">Status</span>
                      <span className="font-bold text-[#D97706]">
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
