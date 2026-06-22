import { useState, FormEvent } from "react";
import { Plus, Users, Landmark, FileCheck, CheckCircle, Trash2, DollarSign, ClipboardList, Scissors } from "lucide-react";

interface Worker {
  id: string;
  name: string;
  role: string;
  unpaidWages: number;
  completedCount: number;
}

interface LoggedOrder {
  id: string;
  workerName: string;
  task: string;
  wage: number;
  time: string;
}

export default function WorkersLedger() {
  const [workers, setWorkers] = useState<Worker[]>( [
    { id: "1", name: "Arthur Pendelton", role: "Master Pattern Cutter", unpaidWages: 280, completedCount: 8 },
    { id: "2", name: "Clara Jenkins", role: "Jacket & Suit Specialist", unpaidWages: 450, completedCount: 12 },
    { id: "3", name: "Edward Finch", role: "Button & Detail Artisan", unpaidWages: 95, completedCount: 19 }
  ]);

  const [orders, setOrders] = useState<LoggedOrder[]>([
    { id: "o1", workerName: "Clara Jenkins", task: "Bespoke Suit Stitching", wage: 180, time: "2:10 PM" },
    { id: "o2", workerName: "Arthur Pendelton", task: "Collar & Lapel Cutting", wage: 120, time: "Yesterday" }
  ]);

  // Form State
  const [selectedWorkerId, setSelectedWorkerId] = useState(workers[0].id);
  const [customTask, setCustomTask] = useState("Slim Fit Trouser Sewing");
  const [customWage, setCustomWage] = useState(55);
  const [payoutSlip, setPayoutSlip] = useState<{ workerName: string; amount: number; date: string } | null>(null);

  const handleAddOrder = (e: FormEvent) => {
    e.preventDefault();
    const w = workers.find(work => work.id === selectedWorkerId);
    if (!w) return;

    const newOrder: LoggedOrder = {
      id: "o_" + Date.now(),
      workerName: w.name,
      task: customTask,
      wage: Number(customWage),
      time: "Just Now"
    };

    setOrders([newOrder, ...orders]);

    // Update worker's wage ledger
    setWorkers(workers.map(work => {
      if (work.id === selectedWorkerId) {
        return {
          ...work,
          unpaidWages: work.unpaidWages + Number(customWage),
          completedCount: work.completedCount + 1
        };
      }
      return work;
    }));
  };

  const handleClearBalance = (workerId: string) => {
    const w = workers.find(work => work.id === workerId);
    if (!w || w.unpaidWages === 0) return;

    setPayoutSlip({
      workerName: w.name,
      amount: w.unpaidWages,
      date: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) + " (Live)"
    });

    setWorkers(workers.map(work => {
      if (work.id === workerId) {
        return {
          ...work,
          unpaidWages: 0
        };
      }
      return work;
    }));
  };

  return (
    <section id="ledger-showcase" className="py-20 bg-brand-cream border-b border-brand-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Row Intro */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Text Info Column */}
          <div className="text-left">
            <span className="text-xs uppercase font-mono text-brand-gold font-bold tracking-widest block mb-2">
              ❖ WORKER LEDGER logs
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-brand-charcoal font-bold tracking-tight mb-4">
              Handcrafted Staff Directory & Wage Ledger
            </h2>
            <p className="text-sm text-brand-slate mb-6">
              Unlike ordinary business registers, <strong>TailorShopManager</strong> understands the traditional piece-rate structure of custom tailoring shops. Many masters hire specialists for coat linings, lapels, buttonholes, or premium trouser finishes paid strictly per product.
            </p>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-moss/10 flex items-center justify-center text-brand-moss shrink-0">
                  <Scissors className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-base text-brand-charcoal">Piece-Rate Wages Tracking</h4>
                  <p className="text-xs text-brand-slate">Record each item tailored by staff with custom rates per garment. Eliminates messy diary scribble sheets.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold shrink-0">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-base text-brand-charcoal">Balanced Shop Liquidity</h4>
                  <p className="text-xs text-brand-slate">Keep a running tally of unpaid staff accounts. Instantly clear ledger logs and generate clean payout receipts.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Ledger Board Panel (Cardboard/Paper mockup visual style) */}
          <div className="bg-[#FCFAF2] border-2 border-brand-gold/30 p-6 sm:p-8 rounded-xl shadow-md relative kraft-shadow text-left">
            
            <div className="flex justify-between items-center mb-6 border-b pb-3 border-brand-gold/20">
              <div className="flex items-center gap-2">
                <ClipboardList className="text-brand-gold w-5 h-5" />
                <span className="font-serif font-bold text-lg text-brand-charcoal">Active Atelier Ledger</span>
              </div>
              <span className="text-[10px] font-mono text-brand-gold tracking-widest uppercase">
                2026 Season Records
              </span>
            </div>

            {/* Workers Directory List */}
            <div className="space-y-3 mb-6">
              <span className="text-[10px] font-mono font-bold text-brand-gold uppercase block">Atelier Staff Directory</span>
              {workers.map(work => (
                <div key={work.id} className="bg-white border rounded-lg p-3 border-zinc-200 hover:border-brand-gold/30 transition flex justify-between items-center text-xs">
                  <div>
                    <h5 className="font-bold text-brand-charcoal">{work.name}</h5>
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{work.role} • {work.completedCount} garments made</p>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <span className="block text-[8px] text-zinc-400 font-mono font-bold uppercase">UNPAID</span>
                      <span className={`font-mono font-bold ${work.unpaidWages > 0 ? "text-brand-gold" : "text-[#4F5D2F]"}`}>
                        ${work.unpaidWages}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => handleClearBalance(work.id)}
                      disabled={work.unpaidWages === 0}
                      className={`px-2.5 py-1 rounded text-[10px] font-bold border cursor-pointer transition ${
                        work.unpaidWages > 0
                          ? "bg-[#4F5D2F]/10 border-[#4F5D2F]/20 text-[#4F5D2F] hover:bg-[#4F5D2F]/20"
                          : "bg-zinc-100 border-zinc-200 text-zinc-400 cursor-not-allowed"
                      }`}
                    >
                      Pay Out
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Log Form */}
            <div className="border-t border-brand-gold/20 pt-4 mb-4">
              <span className="text-[10px] font-mono font-bold text-brand-gold uppercase block mb-3">Quick Piece-Work Log Entry</span>
              
              <form onSubmit={handleAddOrder} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[9px] text-zinc-500 mb-1 font-mono uppercase">ARTISAN</label>
                  <select
                    value={selectedWorkerId}
                    onChange={(e) => setSelectedWorkerId(e.target.value)}
                    className="w-full text-xs p-1.5 border border-zinc-200 bg-white rounded outline-none focus:ring-1 focus:ring-brand-gold"
                  >
                    {workers.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] text-zinc-500 mb-1 font-mono uppercase">GARMENT TASK</label>
                  <input
                    type="text"
                    value={customTask}
                    onChange={(e) => setCustomTask(e.target.value)}
                    className="w-full text-xs p-1.5 border border-zinc-200 bg-white rounded outline-none focus:ring-1 focus:ring-brand-gold"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-zinc-500 mb-1 font-mono uppercase">WAGE PIECE-RATE ($)</label>
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      value={customWage}
                      onChange={(e) => setCustomWage(Number(e.target.value))}
                      className="w-full text-xs p-1.5 border border-zinc-200 bg-white rounded outline-none focus:ring-1 focus:ring-brand-gold font-mono"
                    />
                    <button
                      type="submit"
                      className="px-3 bg-brand-gold hover:bg-brand-gold-light text-[#FCFAF2] rounded font-bold text-xs cursor-pointer transition"
                    >
                      Log
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Receipts Log Feedback */}
            {payoutSlip && (
              <div className="bg-[#4F5D2F]/5 border border-dashed border-[#4F5D2F]/30 p-3 rounded-lg text-xs text-[#4F5D2F] animate-fadeIn mt-4 relative">
                <button 
                  onClick={() => setPayoutSlip(null)}
                  className="absolute top-1 right-2 hover:text-brand-charcoal text-zinc-400 font-bold"
                >
                  ×
                </button>
                <div className="font-mono flex items-center justify-between mb-1">
                  <strong className="text-[10px] uppercase font-bold tracking-wider">✔ REAL-TIME PAYOUT VOUCHER</strong>
                  <span>{payoutSlip.date}</span>
                </div>
                <p>
                  Cleared <strong>${payoutSlip.amount}</strong> outstanding wages successfully for <strong>{payoutSlip.workerName}</strong>. A payout voucher has been automatically saved to the offline ledger.
                </p>
              </div>
            )}

          </div>

        </div>

      </div>
    </section>
  );
}
