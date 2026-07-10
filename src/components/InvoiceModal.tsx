import React from "react";
import { X, Printer, Scissors, Award, Compass, Sparkles, Shirt } from "lucide-react";
import { Customer, Order, ShopProfile } from "../types";

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  customer: Customer | null;
  shopProfile: ShopProfile;
}

export default function InvoiceModal({
  isOpen,
  onClose,
  order,
  customer,
  shopProfile,
}: InvoiceModalProps) {
  if (!isOpen || !order || !customer) return null;

  const handlePrint = () => {
    // Standard print
    window.print();
  };

  const getLogoIcon = () => {
    switch (shopProfile.logoIcon) {
      case "Crown":
        return <Award className="w-8 h-8 text-[#D97706]" />;
      case "Royal":
        return <Compass className="w-8 h-8 text-[#D97706]" />;
      case "Velvet":
        return <Sparkles className="w-8 h-8 text-[#D97706]" />;
      case "Blazer":
        return <Shirt className="w-8 h-8 text-[#D97706]" />;
      default:
        return <Scissors className="w-8 h-8 text-[#D97706]" />;
    }
  };

  const currency = shopProfile.currency || "$";
  const balance = Math.max(0, order.totalCost - order.depositPaid);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm overflow-y-auto py-12 no-print">
      <div className="w-full max-w-2xl bg-[#FCFAF5] border border-[#8B6B3F]/30 rounded-xl shadow-2xl p-6 sm:p-8 relative my-auto text-zinc-900 font-sans print-area">
        {/* Top actions */}
        <div className="flex justify-between items-center border-b border-[#8B6B3F]/20 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-[#8B6B3F]" />
            <span className="font-serif font-extrabold text-lg text-[#1B1A18] tracking-tight">
              Bespoke Invoice Docket
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#8B6B3F] hover:bg-[#A48356] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-zinc-200 rounded-lg text-zinc-400 hover:text-zinc-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINT CONTENT AREA (Beautifully styled for screen and print) */}
        <div id="printable-invoice" className="bg-white border border-[#8B6B3F]/15 p-6 rounded-lg shadow-sm space-y-6 text-left selection:bg-amber-100 print-receipt-only">
          
          {/* Header Block: Studio Brand Card */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-zinc-900/10 pb-6 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#FAF8ED] border border-[#8B6B3F]/25 rounded-lg flex items-center justify-center shadow-sm">
                {getLogoIcon()}
              </div>
              <div>
                <h2 className="font-serif font-extrabold text-xl tracking-tight text-[#1B1A18] leading-none uppercase">
                  {shopProfile.shopName || "Royal Atelier"}
                </h2>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#8B6B3F] font-bold block mt-1">
                  Master Artisanal Book
                </span>
              </div>
            </div>
            <div className="text-right sm:text-right text-xs space-y-1 font-mono text-zinc-500">
              <p className="font-bold text-zinc-800">Invoice: #{order.id.slice(-6).toUpperCase()}</p>
              <p>Date: {order.createdDate}</p>
              <p>Due: {order.dueDate}</p>
            </div>
          </div>

          {/* Customer & Studio Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-zinc-900/10">
            {/* Studio Info */}
            <div className="space-y-2 text-xs">
              <h4 className="text-[10px] font-mono font-bold text-[#8B6B3F] uppercase tracking-wider">
                FROM: STUDIO ATELIER
              </h4>
              <p className="font-serif text-sm font-bold text-zinc-900">
                {shopProfile.shopName || "Atelier Shop"}
              </p>
              <p className="text-zinc-600 font-sans leading-relaxed">
                {shopProfile.shopAddress || "Physical Atelier Lane"}
              </p>
              <p className="text-zinc-600 font-sans">
                Contact: {shopProfile.shopPhone || "No contact info"}
              </p>
            </div>

            {/* Customer Info */}
            <div className="space-y-2 text-xs md:text-right">
              <h4 className="text-[10px] font-mono font-bold text-[#8B6B3F] uppercase tracking-wider md:text-right">
                TO: CUSTOMER DOCKET
              </h4>
              <p className="font-serif text-sm font-bold text-zinc-900">
                {customer.name}
              </p>
              <p className="text-zinc-600 font-sans leading-relaxed md:text-right">
                {customer.address}
              </p>
              <p className="text-zinc-600 font-sans md:text-right">
                Mobile: {customer.phone}
              </p>
            </div>
          </div>

          {/* Sizing Blueprint Panel */}
          <div className="space-y-3 bg-[#FCFAF5]/50 border border-[#8B6B3F]/10 p-4 rounded-lg">
            <div className="flex justify-between items-center border-b border-[#8B6B3F]/15 pb-2">
              <h4 className="text-[10px] font-mono font-bold text-[#8B6B3F] uppercase tracking-wider">
                SIZING BLUEPRINT: {order.clothingType.toUpperCase()}
              </h4>
              <span className="px-2.5 py-0.5 bg-[#FAF8ED] border border-[#8B6B3F]/20 rounded text-[10px] font-mono font-bold text-[#8B6B3F]">
                Fit: {order.fitPreference}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {Object.entries(order.values).map(([key, value]) => (
                <div key={key} className="p-2 bg-white border border-[#8B6B3F]/5 rounded flex flex-col justify-between">
                  <span className="text-[9px] font-mono text-zinc-400 uppercase leading-tight">
                    {key.replace("_", " ")}:
                  </span>
                  <span className="font-mono text-sm font-bold text-[#8B6B3F] mt-0.5">
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {order.specialNotes && (
              <div className="text-xs pt-2 border-t border-dashed border-[#8B6B3F]/10">
                <span className="font-bold text-zinc-800">Special notes: </span>
                <span className="text-zinc-600 italic font-sans">{order.specialNotes}</span>
              </div>
            )}
          </div>

          {/* Service specs and totals table */}
          <div className="space-y-4">
            <div className="border border-zinc-900/10 rounded-lg overflow-hidden">
              <table className="w-full text-xs font-sans text-left">
                <thead>
                  <tr className="bg-[#FAF8ED] border-b border-zinc-900/10 text-zinc-800 font-bold">
                    <th className="p-3">Sartorial Description</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Price</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-zinc-900/5">
                    <td className="p-3 font-medium">
                      Bespoke Stitching & Cutting Service ({order.clothingType})
                      {order.fabricUsed && (
                        <p className="text-[10px] font-mono text-zinc-400 mt-1">
                          Fabric: {order.fabricUsed}
                        </p>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 bg-[#8B6B3F]/10 text-[#8B6B3F] text-[9px] font-bold uppercase rounded">
                        {order.status}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-zinc-900">
                      {currency}{order.totalCost.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Financial Ledger Pillars */}
            <div className="flex flex-col sm:flex-row justify-end items-end gap-3 text-xs font-mono">
              <div className="w-full sm:w-64 space-y-1.5 p-3 bg-[#FCFAF5] border border-[#8B6B3F]/15 rounded-lg">
                <div className="flex justify-between text-zinc-500">
                  <span>TOTAL SERVICES:</span>
                  <span className="font-bold text-zinc-900">{currency}{order.totalCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-600">
                  <span>DEPOSIT PAID:</span>
                  <span className="font-bold">-{currency}{order.depositPaid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-zinc-900/10 pt-1.5 font-bold text-[#8B6B3F]">
                  <span>OUTSTANDING DUE:</span>
                  <span className="text-sm">{currency}{balance.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer of receipt */}
          <div className="border-t border-zinc-900/10 pt-6 text-center space-y-2">
            <p className="font-serif italic text-xs text-zinc-500">
              "Every stitch tells an artisanal story. Thank you for commissioning our studio."
            </p>
            <div className="text-[9px] font-mono text-zinc-400 flex justify-between items-center px-4">
              <span>Power by Atelier OS v1.2</span>
              <span>Authentication Secure Client Code</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
