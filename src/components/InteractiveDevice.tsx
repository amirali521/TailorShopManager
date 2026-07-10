import React, { useState, useEffect, ReactNode, FormEvent } from "react";
import { 
  Scissors, Heart, Search, Bell, Plus, Trash2, Edit2, 
  ChevronRight, Smartphone, Share2, Printer, Check, 
  FileText, DollarSign, RotateCcw, AlertCircle, ShoppingBag, Eye, User,
  CreditCard, ChevronLeft, LogIn, LogOut
} from "lucide-react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { firebaseService } from "../lib/firebaseService";
import { SIZING_TEMPLATES, SizingTemplate, Customer, InventoryItem, Order, ShopProfile, SizingCard } from "../types";

const SEED_CUSTOMERS: Customer[] = [
  {
    id: "cust-amirali",
    name: "Amirali Khan",
    phone: "+92 300 4584852",
    address: "Bespoke Avenue, Block 4, Karachi",
    debtDue: 120,
    paidSnapshot: 150,
    totalBilled: 270,
    ledgerHistory: [
      { id: "ledger-1", type: "bill", amount: 270, description: "Bespoke Suit + Golden Lining Cut", date: "08 Jul, 2026" },
      { id: "ledger-2", type: "payment", amount: 150, description: "Initial Deposit Paid", date: "08 Jul, 2026" }
    ],
    sizingCards: [
      {
        id: "card-amirali-1",
        templateId: "shalwar_kameez",
        templateName: "Shalwar Kameez / شلوار قمیص",
        createdDate: "08 Jul, 2026",
        fitPreference: "Regular",
        specialNotes: "Prefers wider sleeve cuffs to accommodate left-hand watch dial",
        values: {
          length: "40.5",
          shoulder: "18",
          sleeve: "24.5",
          chest: "22.5",
          collar: "15.5",
          shalwar_length: "38.5",
          shalwar_bottom: "8"
        }
      }
    ]
  },
  {
    id: "cust-sarah",
    name: "Sarah Jenkins",
    phone: "+44 7700 900077",
    address: "Savile Row Mews, London",
    debtDue: 0,
    paidSnapshot: 450,
    totalBilled: 450,
    ledgerHistory: [
      { id: "ledger-3", type: "bill", amount: 450, description: "Artisanal Velvet Blazer Custom Stitching", date: "09 Jul, 2026" },
      { id: "ledger-4", type: "payment", amount: 450, description: "Paid in full via Bank Transfer", date: "09 Jul, 2026" }
    ],
    sizingCards: [
      {
        id: "card-sarah-1",
        templateId: "mens_suit",
        templateName: "Bespoke Lounge Suit",
        createdDate: "09 Jul, 2026",
        fitPreference: "Slim",
        specialNotes: "Peak lapel style, velvet lining trims",
        values: {
          jacket_length: "28",
          shoulder: "16.5",
          chest: "35",
          sleeve_length: "23.5",
          trouser_waist: "28",
          trouser_length: "39"
        }
      }
    ]
  }
];

const SEED_INVENTORY: InventoryItem[] = [
  { id: "inv-1", name: "Premium Irish Linen (White)", colorCode: "#FFFFFF", type: "Fabric", quantity: 45, safetyLevel: 10, unit: "Yards", costPrice: 12.5, supplier: "Linen Traders", lastUpdated: "09 Jul, 2026" },
  { id: "inv-2", name: "Classic Italian Velvet Roll", colorCode: "#4A0E17", type: "Fabric", quantity: 6, safetyLevel: 8, unit: "Yards", costPrice: 28.0, supplier: "Savile Textile Co.", lastUpdated: "10 Jul, 2026" },
  { id: "inv-3", name: "Premium Boski Silk Roll #4", colorCode: "#FCFAF0", type: "Fabric", quantity: 28, safetyLevel: 5, unit: "Yards", costPrice: 22.0, supplier: "Orient Silk Mills", lastUpdated: "10 Jul, 2026" }
];

interface InteractiveDeviceProps {
  children?: ReactNode;
}

export default function InteractiveDevice({ children }: InteractiveDeviceProps) {
  // Mobile Simulator Views
  const [activeTab, setActiveTab] = useState<"Splash" | "Customers" | "Inventory" | "Templates" | "Auth">("Customers");
  const [searchQuery, setSearchQuery] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");

  // Firebase Real-time Data Store
  const [activeUser, setActiveUser] = useState<any | null>(null);
  const [dbCustomers, setDbCustomers] = useState<Customer[]>([]);
  const [dbOrders, setDbOrders] = useState<Order[]>([]);
  const [dbInventory, setDbInventory] = useState<InventoryItem[]>([]);
  const [dbTemplates, setDbTemplates] = useState<any[]>([]);
  const [dbShop, setDbShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Active Selections inside Phone App
  const [selectedCustId, setSelectedCustId] = useState<string | null>(null);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [showSizingTicket, setShowSizingTicket] = useState(false);
  const [selectedLedgerEntry, setSelectedLedgerEntry] = useState<any | null>(null);
  const [selectedInvItem, setSelectedInvItem] = useState<InventoryItem | null>(null);

  // Simulation overlays
  const [ticketPrinted, setTicketPrinted] = useState(false);
  const [ticketShared, setTicketShared] = useState(false);
  const [showAddCustomerForm, setShowAddCustomerForm] = useState(false);
  const [showAddSizingBookletForm, setShowAddSizingBookletForm] = useState(false);
  const [showAddTemplateForm, setShowAddTemplateForm] = useState(false);
  const [showDirectSaleForm, setShowDirectSaleForm] = useState(false);

  // New forms local states inside Phone
  const [newCustName, setNewCustName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");
  const [newCustAddress, setNewCustAddress] = useState("");

  const [newBookletTemplateId, setNewBookletTemplateId] = useState("dress_shirt");
  const [newBookletValues, setNewBookletValues] = useState<Record<string, string>>({});
  const [newBookletFit, setNewBookletFit] = useState<"Slim" | "Regular" | "Relaxed">("Regular");
  const [newBookletNotes, setNewBookletNotes] = useState("");

  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateFields, setNewTemplateFields] = useState("");

  const [saleItemName, setSaleItemName] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [saleDeposit, setSaleDeposit] = useState("");
  const [saleNotes, setSaleNotes] = useState("");
  const [saleInventoryId, setSaleInventoryId] = useState("");
  const [saleQty, setSaleQty] = useState("1");

  // 1. Listen to auth state and sync data
  useEffect(() => {
    let unsubscribeFirestore: (() => void) | null = null;
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setActiveUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          isGuest: false
        });
        unsubscribeFirestore = firebaseService.subscribeToAllData(user.uid, (data) => {
          setDbCustomers(data.customers);
          setDbOrders(data.orders);
          setDbInventory(data.inventory);
          setDbTemplates(data.sizingTemplates);
          setDbShop(data.shopProfile);
          setLoading(false);
        });
      } else {
        // Fallback check for offline/guest session
        const cachedGuest = localStorage.getItem("atelier_guest_user");
        if (cachedGuest) {
          const guest = JSON.parse(cachedGuest);
          setActiveUser(guest);
          // Load local mock cache if available
          const localCust = localStorage.getItem(`atelier_customers_${guest.uid}`);
          if (localCust) setDbCustomers(JSON.parse(localCust));
          const localInv = localStorage.getItem(`atelier_inventory_${guest.uid}`);
          if (localInv) setDbInventory(JSON.parse(localInv));
          const localTemplates = localStorage.getItem(`atelier_templates_${guest.uid}`);
          if (localTemplates) setDbTemplates(JSON.parse(localTemplates));
        } else {
          setActiveUser(null);
        }
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  }, []);

  // Merge datasets
  const finalCustomers = activeUser ? dbCustomers : SEED_CUSTOMERS;
  const finalInventory = activeUser ? dbInventory : SEED_INVENTORY;
  const finalShop = (activeUser && dbShop) ? dbShop : {
    shopName: "Golden Shears Atelier",
    shopPhone: "+92 300 9876543",
    shopAddress: "Bespoke Row, Artisanal Sector, Karachi",
    currency: "₨",
    logoIcon: "Scissors"
  };
  const finalTemplates = [...SIZING_TEMPLATES, ...(dbTemplates || [])];

  const filteredCustomers = finalCustomers.filter(c => 
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone.includes(customerSearch)
  );

  const filteredInventory = finalInventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Selected customer logic
  const activeCustomer = finalCustomers.find(c => c.id === selectedCustId) || finalCustomers[0] || {
    id: "default",
    name: "Julian Thorne",
    phone: "+1 (555) 234-5678",
    address: "12 Savile Row, London, W1S 3PF",
    debtDue: 0,
    paidSnapshot: 0,
    totalBilled: 0,
    ledgerHistory: [],
    sizingCards: []
  };

  const activeSizingCard = activeCustomer.sizingCards?.find(c => c.id === activeCardId) || activeCustomer.sizingCards?.[0];
  const activeTemplate = finalTemplates.find(t => t.id === (activeSizingCard?.templateId || "dress_shirt")) || finalTemplates[0];

  // Playground control panel bindings (synchronizing on-screen edits to state)
  const handleSizeChange = (fieldName: string, value: string) => {
    // If we've got an active sizing card, let's update it
    if (activeSizingCard) {
      const updatedValues = { ...activeSizingCard.values, [fieldName]: value };
      if (activeUser) {
        // Write to Firestore in real-time!
        firebaseService.addSizingCard(activeUser.uid, activeCustomer.id, {
          templateId: activeSizingCard.templateId,
          templateName: activeSizingCard.templateName,
          values: updatedValues,
          fitPreference: activeSizingCard.fitPreference || "Regular",
          specialNotes: activeSizingCard.specialNotes || ""
        });
      } else {
        // Seed customer update
        activeSizingCard.values[fieldName] = value;
        setDbCustomers([...finalCustomers]);
      }
    }
  };

  const handleShareSimulate = () => {
    setTicketShared(true);
    setTimeout(() => setTicketShared(false), 2500);
  };

  const handlePrintSimulate = () => {
    setTicketPrinted(true);
    setTimeout(() => setTicketPrinted(false), 2500);
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setActiveTab("Customers");
    } catch (e) {
      console.error("Popup blocked or declined:", e);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("atelier_guest_user");
    setActiveUser(null);
    setDbCustomers([]);
    setDbInventory([]);
    setSelectedCustId(null);
    setActiveCardId(null);
  };

  // Add customer in Phone
  const handlePhoneAddCustomer = async (e: FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) return;

    if (activeUser) {
      await firebaseService.addCustomer(activeUser.uid, {
        name: newCustName,
        phone: newCustPhone || "No Mobile Line",
        address: newCustAddress || "No Shop Address"
      });
    } else {
      const mockId = "mock-cust-" + Date.now();
      const newC: Customer = {
        id: mockId,
        name: newCustName,
        phone: newCustPhone || "No Mobile Line",
        address: newCustAddress || "No Shop Address",
        debtDue: 0,
        paidSnapshot: 0,
        totalBilled: 0,
        ledgerHistory: [],
        sizingCards: []
      };
      SEED_CUSTOMERS.unshift(newC);
      setSelectedCustId(mockId);
    }

    setNewCustName("");
    setNewCustPhone("");
    setNewCustAddress("");
    setShowAddCustomerForm(false);
  };

  // Create sizing booklet inside Phone
  const handlePhoneAddSizingBooklet = async (e: FormEvent) => {
    e.preventDefault();
    const tpl = finalTemplates.find(t => t.id === newBookletTemplateId) || finalTemplates[0];
    
    // Fallback/fill values with default values from template if empty
    const finalValues: Record<string, string> = {};
    tpl.fields.forEach(f => {
      finalValues[f.name] = newBookletValues[f.name] || f.value;
    });

    const cardData = {
      templateId: tpl.id,
      templateName: tpl.name,
      values: finalValues,
      fitPreference: newBookletFit,
      specialNotes: newBookletNotes
    };

    if (activeUser) {
      await firebaseService.addSizingCard(activeUser.uid, activeCustomer.id, cardData);
    } else {
      const mockCardId = "mock-card-" + Date.now();
      if (!activeCustomer.sizingCards) activeCustomer.sizingCards = [];
      activeCustomer.sizingCards.push({
        id: mockCardId,
        createdDate: "Just Now",
        ...cardData
      });
      setActiveCardId(mockCardId);
      setDbCustomers([...finalCustomers]);
    }

    setNewBookletValues({});
    setNewBookletNotes("");
    setShowAddSizingBookletForm(false);
    setShowSizingTicket(true); // Auto view
  };

  // Create template in Phone
  const handlePhoneAddTemplate = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTemplateName.trim() || !newTemplateFields.trim()) return;

    const fieldsArr = newTemplateFields.split(",").map(f => f.trim()).filter(Boolean);

    if (activeUser) {
      await firebaseService.saveSizingTemplate(activeUser.uid, newTemplateName, fieldsArr);
    } else {
      const mockTplId = "mock-tpl-" + Date.now();
      const mockTpl: SizingTemplate = {
        id: mockTplId,
        name: newTemplateName,
        description: "Custom user guidelines defined locally",
        fields: fieldsArr.map(f => ({ name: f.toLowerCase().replace(/\s+/g, "_"), label: f, value: "0" }))
      };
      SIZING_TEMPLATES.push(mockTpl);
      setDbTemplates([...dbTemplates]);
    }

    setNewTemplateName("");
    setNewTemplateFields("");
    setShowAddTemplateForm(false);
  };

  // Direct Sale / Stock deduction in Phone
  const handlePhoneDirectSale = async (e: FormEvent) => {
    e.preventDefault();
    if (!saleItemName.trim() || !salePrice) return;

    const priceNum = parseFloat(salePrice);
    const depositNum = parseFloat(saleDeposit || "0");
    const qtyNum = parseFloat(saleQty || "1");

    if (activeUser) {
      // 1. Add order
      await firebaseService.addOrder(activeUser.uid, {
        customerId: activeCustomer.id,
        customerName: activeCustomer.name,
        clothingType: saleItemName,
        values: {},
        fitPreference: "Regular",
        specialNotes: saleNotes || "Direct Sale from Inventory",
        totalCost: priceNum * qtyNum,
        depositPaid: depositNum,
        status: "Delivered",
        dueDate: new Date().toISOString().split("T")[0],
        fabricUsed: saleInventoryId || undefined
      });

      // 2. Deduct inventory if linked
      if (saleInventoryId) {
        const item = finalInventory.find(i => i.id === saleInventoryId);
        if (item) {
          const newQty = Math.max(0, item.quantity - qtyNum);
          await firebaseService.updateInventoryItemStock(activeUser.uid, saleInventoryId, newQty);
        }
      }
    } else {
      // Offline local disburse
      const billId = "mock-bill-" + Date.now();
      const pmntId = "mock-pmnt-" + Date.now();
      const nowStr = new Date().toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' });

      activeCustomer.totalBilled += priceNum * qtyNum;
      activeCustomer.paidSnapshot += depositNum;
      activeCustomer.debtDue = Math.max(0, activeCustomer.totalBilled - activeCustomer.paidSnapshot);

      if (!activeCustomer.ledgerHistory) activeCustomer.ledgerHistory = [];
      activeCustomer.ledgerHistory.unshift({
        id: billId,
        type: "bill",
        amount: priceNum * qtyNum,
        description: `${saleItemName} (Qty: ${qtyNum})`,
        date: nowStr
      });

      if (depositNum > 0) {
        activeCustomer.ledgerHistory.unshift({
          id: pmntId,
          type: "payment",
          amount: depositNum,
          description: `Deposit: ${saleItemName}`,
          date: nowStr
        });
      }

      if (saleInventoryId) {
        const item = finalInventory.find(i => i.id === saleInventoryId);
        if (item) {
          item.quantity = Math.max(0, item.quantity - qtyNum);
        }
      }
      setDbCustomers([...finalCustomers]);
    }

    setSaleItemName("");
    setSalePrice("");
    setSaleDeposit("");
    setSaleNotes("");
    setSaleInventoryId("");
    setSaleQty("1");
    setShowDirectSaleForm(false);
  };

  // Stock values
  const potentialProfit = finalInventory.reduce((sum, item) => sum + ((item.costPrice ? (item.quantity * (item.costPrice * 1.5)) : 100)), 0);
  const totalCost = finalInventory.reduce((sum, item) => sum + ((item.costPrice || 10) * item.quantity), 0);
  const totalIncome = totalCost + potentialProfit;

  return (
    <div id="tailor-app-simulator" className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start justify-between w-full text-left">
      
      {/* 1. HERO CONTENT COLUMN */}
      {children && (
        <div className="flex-1 max-w-2xl w-full">
          {children}
        </div>
      )}

      {/* 2. SIMULATED DEVICE (UPPER RIGHT ON DESKTOP) */}
      <div className="lg:sticky lg:top-32 flex justify-center lg:justify-end shrink-0 w-full lg:w-auto">
        <div className="relative group shrink-0">
          <div className="absolute -inset-1 rounded-[42px] bg-gradient-to-tr from-brand-gold via-brand-slate to-brand-moss opacity-15 blur-lg group-hover:opacity-25 transition duration-1000"></div>

          {/* Outer Phone Frame */}
          <div className="relative w-[340px] h-[690px] bg-[#1a1816] rounded-[42px] p-3 flex flex-col border-4 border-[#2e2b26] shadow-[0_24px_50px_-12px_rgba(27,26,24,0.5)]">
            
            {/* Speaker & notch */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-5 bg-[#1a1816] rounded-b-2xl z-40 flex items-center justify-around px-4">
              <div className="w-12 h-1 bg-[#2e2b26] rounded-full"></div>
              <div className="w-2 h-2 bg-[#100f0e] rounded-full ring-1 ring-zinc-800"></div>
            </div>

            {/* Screen Screen Body */}
            <div className="w-full h-full bg-[#fcfbfc] rounded-[32px] overflow-hidden relative flex flex-col select-none text-brand-charcoal font-sans text-xs">
              
              {/* Status bar */}
              <div className="bg-[#FCFAF2] h-7 px-5 flex items-center justify-between text-[#333333] font-sans font-semibold text-[11px] relative pt-1 shrink-0">
                <span className="tracking-tight">2:50</span>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <div className="flex gap-px items-end h-2">
                    <span className="w-0.5 h-1 bg-[#333333] rounded-full"></span>
                    <span className="w-0.5 h-1.5 bg-[#333333] rounded-full"></span>
                    <span className="w-0.5 h-2 bg-[#333333] rounded-full"></span>
                    <span className="w-0.5 h-2.5 bg-[#333333] rounded-full"></span>
                  </div>
                  <span>95%</span>
                  <div className="w-4 h-2 border border-[#333333] rounded-sm p-0.5 flex items-center justify-start">
                    <div className="h-full w-2.5 bg-[#333333] rounded-2xs"></div>
                  </div>
                </div>
              </div>

              {/* VIEW CONDITIONAL SCREEN CONTENT */}
              <div className="flex-1 overflow-y-auto bg-slate-50/50 flex flex-col relative">

                {/* SPLASH VIEW */}
                {activeTab === "Splash" && (
                  <div className="absolute inset-0 bg-[#161513] flex flex-col items-center justify-center text-center z-30 transition-all animate-fadeIn">
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
                      Atelier Mobile
                    </h2>
                    <p className="text-[10px] text-zinc-500 font-mono tracking-widest mt-2 uppercase">
                      SHARED DATABASE VERSION
                    </p>
                    
                    <button 
                      onClick={() => setActiveTab("Customers")}
                      className="absolute bottom-16 px-5 py-2.5 text-[11px] bg-brand-gold hover:bg-brand-gold/90 text-brand-cream font-bold uppercase rounded-full shadow-md transition cursor-pointer"
                    >
                      Enter Suite
                    </button>
                  </div>
                )}

                {/* APP HEADER */}
                {activeTab !== "Splash" && (
                  <div className="bg-[#FCFAF2] border-b border-zinc-100 px-4 py-3 shrink-0">
                    <div className="flex justify-between items-center">
                      <div>
                        <h1 className="text-sm font-bold text-zinc-900 tracking-wide font-sans">
                          {finalShop.shopName}
                        </h1>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className={`inline-block w-1.5 h-1.5 rounded-full animate-pulse ${activeUser ? "bg-emerald-600" : "bg-brand-gold"}`}></span>
                          <span className="text-[9px] text-zinc-500 font-mono">
                            {activeUser ? "Cloud Synced DB" : "Offline Sandbox"}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => setActiveTab("Auth")}
                          className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 border border-zinc-200"
                        >
                          <User className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* CUSTOMERS TAB */}
                {activeTab === "Customers" && !showSizingTicket && (
                  <div className="flex-1 p-3 flex flex-col gap-3 animate-fadeIn">
                    
                    {/* Customer Header & Add Action */}
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-zinc-800 text-[11px]">Boutique Clients</span>
                      <button 
                        onClick={() => setShowAddCustomerForm(true)}
                        className="px-2 py-1 bg-brand-gold text-white rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-0.5"
                      >
                        <Plus className="w-3 h-3" /> Add
                      </button>
                    </div>

                    {/* Add Customer Form Modal overlay inside Phone */}
                    {showAddCustomerForm && (
                      <div className="bg-white border border-zinc-200 rounded-xl p-3 text-left shadow-md space-y-2.5">
                        <span className="block font-bold text-xs text-brand-charcoal">New Account Sheet</span>
                        <form onSubmit={handlePhoneAddCustomer} className="space-y-2">
                          <input 
                            type="text" 
                            placeholder="Client Full Name *" 
                            value={newCustName}
                            onChange={(e) => setNewCustName(e.target.value)}
                            className="w-full px-2 py-1.5 border border-zinc-200 rounded text-[10px] outline-none"
                            required
                          />
                          <input 
                            type="text" 
                            placeholder="Phone Number" 
                            value={newCustPhone}
                            onChange={(e) => setNewCustPhone(e.target.value)}
                            className="w-full px-2 py-1.5 border border-zinc-200 rounded text-[10px] outline-none"
                          />
                          <input 
                            type="text" 
                            placeholder="Home/Workshop Address" 
                            value={newCustAddress}
                            onChange={(e) => setNewCustAddress(e.target.value)}
                            className="w-full px-2 py-1.5 border border-zinc-200 rounded text-[10px] outline-none"
                          />
                          <div className="flex gap-1.5 pt-1">
                            <button type="submit" className="flex-1 py-1 bg-brand-gold text-white text-[10px] font-bold rounded">Save</button>
                            <button type="button" onClick={() => setShowAddCustomerForm(false)} className="flex-1 py-1 bg-zinc-100 text-zinc-500 text-[10px] font-bold rounded border">Cancel</button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Customer Search Bar */}
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                      <input 
                        type="text" 
                        placeholder="Search custom client..."
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 bg-white border border-zinc-200 rounded-full text-[10px] outline-none"
                      />
                    </div>

                    {/* Customers List */}
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-0.5">
                      {filteredCustomers.map(c => (
                        <div 
                          key={c.id} 
                          onClick={() => {
                            setSelectedCustId(c.id);
                            // Default to first card if exists
                            if (c.sizingCards && c.sizingCards.length > 0) {
                              setActiveCardId(c.sizingCards[0].id);
                            } else {
                              setActiveCardId(null);
                            }
                          }}
                          className={`p-2.5 rounded-xl border text-left cursor-pointer transition ${
                            activeCustomer.id === c.id ? "bg-[#FCFAF2] border-brand-gold shadow-xs" : "bg-white border-zinc-100 hover:border-zinc-200"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-zinc-900 text-xs block truncate max-w-[150px]">{c.name}</span>
                            <span className="text-[9px] font-mono font-bold text-zinc-500">
                              {finalShop.currency}{c.debtDue > 0 ? c.debtDue : 0} due
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-1 text-[9px] text-zinc-400">
                            <span>📞 {c.phone}</span>
                            <span className="bg-[#4F5D2F]/10 text-[#4F5D2F] px-1 rounded font-bold uppercase">
                              {c.sizingCards?.length || 0} Booklets
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* ACTIVE CUSTOMER DETAIL CARD */}
                    <div className="bg-[#FCFAF2] border border-brand-gold/30 rounded-2xl p-3 text-left space-y-2.5">
                      <div className="flex justify-between items-start border-b pb-2">
                        <div>
                          <span className="text-[9px] uppercase font-mono tracking-wider text-brand-gold block font-bold">Active Account Folder</span>
                          <span className="text-sm font-extrabold text-zinc-950">{activeCustomer.name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-[#4F5D2F] font-bold">
                          📍 {activeCustomer.address?.split(',')[0]}
                        </span>
                      </div>

                      {/* Sizing booklet list */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-zinc-700">Measurement Cards</span>
                          <button 
                            onClick={() => setShowAddSizingBookletForm(true)}
                            className="text-brand-gold text-[9px] font-bold flex items-center gap-0.5"
                          >
                            <Plus className="w-3 h-3" /> New Booklet
                          </button>
                        </div>

                        {showAddSizingBookletForm && (
                          <div className="bg-white border p-2.5 rounded-lg space-y-2 text-[10px]">
                            <span className="block font-bold">Create Sizing Booklet</span>
                            <form onSubmit={handlePhoneAddSizingBooklet} className="space-y-2">
                              <select 
                                value={newBookletTemplateId} 
                                onChange={(e) => setNewBookletTemplateId(e.target.value)}
                                className="w-full p-1 border rounded text-[10px]"
                              >
                                {finalTemplates.map(t => (
                                  <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                              </select>
                              <div className="flex gap-1">
                                <span className="text-[8px] text-zinc-400 italic">Defaults from blueprint will fill coordinates</span>
                              </div>
                              <input 
                                type="text" 
                                placeholder="Special notes or fit preference..." 
                                value={newBookletNotes}
                                onChange={(e) => setNewBookletNotes(e.target.value)}
                                className="w-full px-2 py-1 border rounded text-[10px]"
                              />
                              <div className="flex gap-1 pt-1">
                                <button type="submit" className="flex-1 py-1 bg-brand-gold text-white font-bold rounded text-[9px]">Save Booklet</button>
                                <button type="button" onClick={() => setShowAddSizingBookletForm(false)} className="flex-1 py-1 bg-zinc-100 text-zinc-500 border rounded text-[9px]">Cancel</button>
                              </div>
                            </form>
                          </div>
                        )}

                        {activeCustomer.sizingCards && activeCustomer.sizingCards.length > 0 ? (
                          <div className="grid grid-cols-2 gap-1.5">
                            {activeCustomer.sizingCards.map(sc => (
                              <button
                                key={sc.id}
                                onClick={() => {
                                  setActiveCardId(sc.id);
                                  setShowSizingTicket(true);
                                }}
                                className={`p-2 rounded-lg border text-left flex flex-col justify-between cursor-pointer transition ${
                                  activeCardId === sc.id ? "bg-brand-gold/15 border-brand-gold text-brand-charcoal" : "bg-white border-zinc-200"
                                }`}
                              >
                                <span className="font-bold text-[10px] block truncate max-w-[100px]">{sc.templateName}</span>
                                <span className="text-[8px] text-zinc-400 mt-1 font-mono uppercase block">{sc.fitPreference || "Regular"}</span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-3 bg-white/50 border border-dashed rounded-lg text-zinc-400 text-[10px]">
                            No sizing cards. Click "New Booklet" to generate specs!
                          </div>
                        )}
                      </div>

                      {/* Cash Book ledger list */}
                      <div className="space-y-1.5 border-t pt-2.5">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-zinc-700">Financial Ledger Cash Book</span>
                          <button 
                            onClick={() => setShowDirectSaleForm(true)}
                            className="text-brand-moss text-[9px] font-bold flex items-center gap-0.5"
                          >
                            <Plus className="w-3 h-3" /> Sell Product
                          </button>
                        </div>

                        {showDirectSaleForm && (
                          <div className="bg-white border p-2.5 rounded-lg space-y-2 text-[10px]">
                            <span className="block font-bold">Sell Product / Deduct Stock</span>
                            <form onSubmit={handlePhoneDirectSale} className="space-y-2">
                              <select 
                                value={saleInventoryId}
                                onChange={(e) => {
                                  setSaleInventoryId(e.target.value);
                                  const item = finalInventory.find(i => i.id === e.target.value);
                                  if (item) {
                                    setSaleItemName(item.name);
                                    setSalePrice((item.costPrice ? (item.costPrice * 1.5).toFixed(0) : "100"));
                                  }
                                }}
                                className="w-full p-1 border rounded text-[10px]"
                              >
                                <option value="">-- Select Fabric/Material (Optional) --</option>
                                {finalInventory.map(item => (
                                  <option key={item.id} value={item.id}>{item.name} ({item.quantity} {item.unit} left)</option>
                                ))}
                              </select>
                              <input 
                                type="text" 
                                placeholder="Order/Item Name *" 
                                value={saleItemName}
                                onChange={(e) => setSaleItemName(e.target.value)}
                                className="w-full px-2 py-1 border rounded text-[10px]"
                                required
                              />
                              <div className="grid grid-cols-2 gap-1.5">
                                <input 
                                  type="number" 
                                  placeholder="Sale Price *" 
                                  value={salePrice}
                                  onChange={(e) => setSalePrice(e.target.value)}
                                  className="w-full px-2 py-1 border rounded text-[10px]"
                                  required
                                />
                                <input 
                                  type="number" 
                                  placeholder="Deposit Paid" 
                                  value={saleDeposit}
                                  onChange={(e) => setSaleDeposit(e.target.value)}
                                  className="w-full px-2 py-1 border rounded text-[10px]"
                                />
                              </div>
                              <input 
                                type="number" 
                                placeholder="Quantity to Deduct" 
                                value={saleQty}
                                onChange={(e) => setSaleQty(e.target.value)}
                                className="w-full px-2 py-1 border rounded text-[10px]"
                              />
                              <div className="flex gap-1 pt-1">
                                <button type="submit" className="flex-1 py-1 bg-[#4F5D2F] text-white font-bold rounded text-[9px]">Confirm Sale</button>
                                <button type="button" onClick={() => setShowDirectSaleForm(false)} className="flex-1 py-1 bg-zinc-100 text-zinc-500 border rounded text-[9px]">Cancel</button>
                              </div>
                            </form>
                          </div>
                        )}

                        {activeCustomer.ledgerHistory && activeCustomer.ledgerHistory.length > 0 ? (
                          <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-0.5">
                            {activeCustomer.ledgerHistory.map(entry => (
                              <button
                                key={entry.id}
                                type="button"
                                onClick={() => setSelectedLedgerEntry(entry)}
                                className="w-full text-left p-2 bg-white border border-zinc-100 rounded-lg hover:border-brand-gold/30 flex justify-between items-center transition"
                              >
                                <div className="min-w-0 flex-1">
                                  <span className="font-bold text-[10px] text-zinc-800 block truncate leading-tight">{entry.description}</span>
                                  <span className="text-[8px] text-zinc-400 block font-mono mt-0.5">{entry.date}</span>
                                </div>
                                <span className={`text-[10px] font-bold shrink-0 font-mono ${entry.type === "payment" ? "text-emerald-600" : "text-rose-600"}`}>
                                  {entry.type === "payment" ? "+" : "-"}{finalShop.currency}{entry.amount}
                                </span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-3 bg-white/50 border border-dashed rounded-lg text-zinc-400 text-[10px]">
                            No cash transactions recorded. Log a direct sale above!
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* LEDGER ENTRY MODAL OVERLAY INSIDE PHONE */}
                {selectedLedgerEntry && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-end justify-center animate-slideUp">
                    <div className="w-full bg-[#FCFAF2] rounded-t-3xl border-t border-brand-gold/40 p-4 space-y-3.5 shadow-2xl">
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="font-serif text-sm font-bold text-brand-charcoal">Ledger Receipt Log</span>
                        <button 
                          onClick={() => setSelectedLedgerEntry(null)}
                          className="px-2 py-1 bg-zinc-200 text-zinc-600 rounded text-[9px] font-bold"
                        >
                          Close
                        </button>
                      </div>

                      <div className="bg-white border rounded-xl p-3 space-y-2.5 font-mono text-[10px] text-zinc-700">
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-zinc-400">Log Reference:</span>
                          <span className="font-bold">#{selectedLedgerEntry.id.toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-zinc-400">Client Name:</span>
                          <span className="font-bold">{activeCustomer.name}</span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-zinc-400">Docket Type:</span>
                          <span className={`font-bold ${selectedLedgerEntry.type === 'payment' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {selectedLedgerEntry.type.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-zinc-400">Description:</span>
                          <span className="font-bold truncate max-w-[150px]">{selectedLedgerEntry.description}</span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-zinc-400">Logged Date:</span>
                          <span className="font-bold">{selectedLedgerEntry.date}</span>
                        </div>

                        {/* Associated Order calculation directly inside phone */}
                        <div className="bg-amber-50/50 p-2.5 rounded border border-amber-200/50 text-[10px] font-sans">
                          <span className="font-mono text-[8px] text-amber-800 font-bold block uppercase tracking-wider mb-1">
                            Associated Pricing Specs
                          </span>
                          <div className="flex justify-between text-zinc-600">
                            <span>Item Cost:</span>
                            <span className="font-bold text-zinc-900">{finalShop.currency}{selectedLedgerEntry.amount}</span>
                          </div>
                          <div className="flex justify-between text-zinc-600 mt-1">
                            <span>Payment Status:</span>
                            <span className={`px-1 py-0.2 rounded text-[8px] font-bold uppercase ${selectedLedgerEntry.type === "payment" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                              {selectedLedgerEntry.type === "payment" ? "Full payment credit" : "Awaiting billing resolution"}
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-1.5 text-xs">
                          <span className="font-bold font-sans">Amount Settled:</span>
                          <span className="font-black text-brand-charcoal text-sm">
                            {finalShop.currency}{selectedLedgerEntry.amount}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* DETAILS TICKET VIEW */}
                {showSizingTicket && activeSizingCard && (
                  <div className="flex-1 p-3 bg-[#FCFAF2] flex flex-col relative animate-fadeIn">
                    
                    {/* Back control */}
                    <div className="flex justify-between items-center mb-2 border-b pb-1">
                      <button 
                        onClick={() => setShowSizingTicket(false)}
                        className="text-brand-slate hover:text-brand-charcoal text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Client Workspace</span>
                      </button>
                      <span className="text-[8px] font-mono text-brand-gold font-bold">GOLDEN DOCKET</span>
                    </div>

                    {/* RECEIPT / TICKET BODY */}
                    <div className="bg-white border-2 border-brand-gold/60 p-3 rounded shadow-md flex-1 flex flex-col relative paper-grain text-left">
                      
                      <div className="text-center mt-2.5">
                        <h3 className="font-serif text-[15px] font-bold tracking-wide uppercase text-brand-charcoal">
                          {finalShop.shopName.toUpperCase()}
                        </h3>
                        <p className="font-mono text-[8px] text-brand-gold tracking-widest uppercase">
                          Bespoke Sizing Docket
                        </p>
                        <div className="border-y border-dashed border-zinc-200 my-2 py-0.5 text-[8px] font-mono flex justify-between px-1.5 text-zinc-500">
                          <span>EST. 2026</span>
                          <span>{activeUser ? "CLOUD VALIDATED" : "LOCAL CACHED"}</span>
                          <span>ID: #{activeSizingCard.id.toUpperCase().slice(0, 8)}</span>
                        </div>
                      </div>

                      {/* Info box */}
                      <div className="bg-zinc-50 p-2 border border-zinc-100 rounded text-[9px] mb-2 font-mono">
                        <div><strong className="text-brand-slate uppercase font-sans text-[7px] tracking-widest block font-bold">CUSTOMER DETAILS:</strong></div>
                        <div className="text-zinc-800 font-bold">{activeCustomer.name}</div>
                        <div className="text-zinc-500">Phone: {activeCustomer.phone}</div>
                        <div className="text-zinc-400 truncate">Address: {activeCustomer.address}</div>
                      </div>

                      {/* Coordinates */}
                      <div className="flex-1 min-h-[140px]">
                        <div className="text-[9px] text-brand-gold font-bold font-serif italic mb-1.5 border-b pb-0.5 flex justify-between">
                          <span>{activeSizingCard.templateName}</span>
                          <span>{activeSizingCard.fitPreference || "Regular"}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-[9px]">
                          {Object.entries(activeSizingCard.values).map(([fieldKey, value]) => {
                            const fieldDef = activeTemplate.fields.find(f => f.name === fieldKey) || { label: fieldKey };
                            return (
                              <div key={fieldKey} className="flex justify-between border-b border-dashed border-zinc-100 pb-0.5">
                                <span className="text-zinc-500 truncate max-w-[80px]">{fieldDef.label.split('(')[0]}</span>
                                <span className="font-bold text-brand-gold shrink-0">
                                  {value}″
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {activeSizingCard.specialNotes && (
                          <div className="border-t border-zinc-100 mt-2 pt-1">
                            <span className="text-[7px] text-zinc-400 block font-bold font-sans">SPECIAL BOOKLET INSTRUCTIONS:</span>
                            <p className="text-[8px] text-zinc-500 italic font-mono leading-tight mt-0.5">{activeSizingCard.specialNotes}</p>
                          </div>
                        )}
                      </div>

                      {/* Foot print verified */}
                      <div className="border-t border-dashed border-zinc-200 mt-2 pt-2">
                        <div className="flex items-center justify-between font-mono text-[8px] text-[#4F5D2F] font-bold bg-[#4F5D2F]/5 p-1 rounded border border-[#4F5D2F]/20">
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-[#4F5D2F] rounded-full inline-block animate-pulse"></span>
                            STITCH READY
                          </span>
                          <span>{finalShop.shopPhone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-1.5 mt-2 bg-white p-2 border rounded">
                      <button 
                        onClick={handlePrintSimulate}
                        className="py-1.5 px-2 bg-brand-gold text-brand-cream hover:bg-brand-gold-light text-[9px] font-bold rounded flex items-center justify-center gap-1 transition cursor-pointer"
                      >
                        {ticketPrinted ? <Check className="w-3 h-3" /> : <Printer className="w-3 h-3" />}
                        <span>{ticketPrinted ? "Printed!" : "Print Ticket"}</span>
                      </button>
                      <button 
                        onClick={handleShareSimulate}
                        className="py-1.5 px-2 border border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-white text-[9px] font-bold rounded flex items-center justify-center gap-1 transition cursor-pointer"
                      >
                        {ticketShared ? <Check className="w-3 h-3" /> : <Share2 className="w-3 h-3" />}
                        <span>{ticketShared ? "Shared!" : "Share Docket"}</span>
                      </button>
                    </div>
                  </div>
                )}


                {/* INVENTORY TAB */}
                {activeTab === "Inventory" && (
                  <div className="flex-1 p-3 flex flex-col gap-3 animate-fadeIn">
                    
                    {/* Stats */}
                    <div className="bg-[#FCFAF2] border border-brand-gold/40 p-2.5 rounded-xl text-left relative overflow-hidden">
                      <span className="text-[8px] uppercase tracking-wider text-brand-gold font-mono font-bold">Stock Profit Target</span>
                      <h3 className="font-mono text-base font-extrabold text-brand-charcoal flex items-center gap-0.5 mt-0.5">
                        <DollarSign className="w-3 h-3 text-brand-gold" />
                        {potentialProfit.toFixed(0)}
                      </h3>
                      <div className="grid grid-cols-2 gap-1 text-[8px] font-mono text-zinc-500 border-t pt-1.5 mt-1.5">
                        <span>Cost: {finalShop.currency}{totalCost}</span>
                        <span className="text-right">Income: {finalShop.currency}{totalIncome}</span>
                      </div>
                    </div>

                    {/* Products list */}
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-zinc-800 text-[10px]">Aura Fabrics Roll</span>
                      <span className="text-[9px] text-brand-gold font-mono font-bold">{finalInventory.length} Items</span>
                    </div>

                    <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-0.5">
                      {filteredInventory.map(item => {
                        const isLow = item.quantity <= item.safetyLevel;
                        return (
                          <div 
                            key={item.id}
                            onClick={() => setSelectedInvItem(item)}
                            className="p-2 bg-white border border-zinc-200 rounded-xl text-left cursor-pointer hover:border-brand-gold/30 transition flex justify-between items-center"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full border border-zinc-200 shrink-0" style={{ backgroundColor: item.colorCode }}></span>
                                <span className="font-bold text-[11px] text-zinc-800 block truncate leading-tight">{item.name}</span>
                              </div>
                              <span className="text-[9px] text-zinc-400 mt-0.5 block">Supplier: {item.supplier}</span>
                            </div>
                            <div className="text-right shrink-0">
                              <span className={`text-[10px] font-bold block font-mono ${isLow ? 'text-red-500' : 'text-[#4F5D2F]'}`}>
                                {item.quantity} {item.unit}
                              </span>
                              <span className="text-[8px] text-zinc-400 block font-mono">cost: {finalShop.currency}{item.costPrice || 10}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Stock Detail overlay drawer inside Phone */}
                    {selectedInvItem && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-end justify-center animate-slideUp">
                        <div className="w-full bg-white rounded-t-3xl p-4 space-y-3 shadow-2xl text-left">
                          <div className="flex justify-between items-center border-b pb-2">
                            <span className="font-bold text-xs">Atelier Stock Card</span>
                            <button onClick={() => setSelectedInvItem(null)} className="text-[9px] bg-zinc-100 text-zinc-500 px-2 py-1 rounded">Close</button>
                          </div>
                          <div className="space-y-2 text-[10px]">
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full border border-zinc-300" style={{ backgroundColor: selectedInvItem.colorCode }}></span>
                              <span className="font-extrabold text-zinc-900 text-xs">{selectedInvItem.name}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 bg-zinc-50 p-2 rounded-lg font-mono">
                              <div><strong>Supplier:</strong> {selectedInvItem.supplier}</div>
                              <div><strong>Stock Level:</strong> {selectedInvItem.quantity} {selectedInvItem.unit}</div>
                              <div><strong>Cost Price:</strong> {finalShop.currency}{selectedInvItem.costPrice || 10}</div>
                              <div><strong>Disburse Threshold:</strong> {selectedInvItem.safetyLevel} {selectedInvItem.unit}</div>
                            </div>
                            <button 
                              onClick={() => {
                                setSaleInventoryId(selectedInvItem.id);
                                setSaleItemName(`Roll Disburse: ${selectedInvItem.name}`);
                                setSalePrice((selectedInvItem.costPrice ? (selectedInvItem.costPrice * 1.5).toFixed(0) : "100"));
                                setSelectedInvItem(null);
                                setShowDirectSaleForm(true);
                                setActiveTab("Customers");
                              }}
                              className="w-full py-1.5 bg-brand-gold text-white font-bold rounded text-[10px] flex items-center justify-center gap-1 uppercase"
                            >
                              <Scissors className="w-3.5 h-3.5" />
                              <span>Disburse To Client</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TEMPLATES TAB */}
                {activeTab === "Templates" && (
                  <div className="flex-1 p-3 flex flex-col gap-3 animate-fadeIn">
                    
                    <div className="flex justify-between items-center bg-[#FCFAF2] p-2 border border-brand-gold/30 rounded-xl">
                      <div>
                        <h4 className="font-serif text-xs font-bold text-brand-charcoal">Design Guidelines</h4>
                        <p className="text-[8px] text-slate-500 font-mono">Pre-selected coordinates map</p>
                      </div>
                      <button 
                        onClick={() => setShowAddTemplateForm(true)}
                        className="px-2 py-1 bg-brand-gold text-white rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-0.5"
                      >
                        <Plus className="w-3 h-3" /> Custom
                      </button>
                    </div>

                    {showAddTemplateForm && (
                      <div className="bg-white border p-3 rounded-lg space-y-2.5 text-left text-[10px]">
                        <span className="block font-bold">Configure Custom Sizing Card</span>
                        <form onSubmit={handlePhoneAddTemplate} className="space-y-2">
                          <input 
                            type="text" 
                            placeholder="Template Name (e.g. Waistcoat) *" 
                            value={newTemplateName}
                            onChange={(e) => setNewTemplateName(e.target.value)}
                            className="w-full px-2 py-1.5 border rounded text-[10px]"
                            required
                          />
                          <input 
                            type="text" 
                            placeholder="Fields, comma-separated (collar, chest, waist) *" 
                            value={newTemplateFields}
                            onChange={(e) => setNewTemplateFields(e.target.value)}
                            className="w-full px-2 py-1.5 border rounded text-[10px]"
                            required
                          />
                          <div className="flex gap-1">
                            <button type="submit" className="flex-1 py-1 bg-brand-gold text-white font-bold rounded">Add Card</button>
                            <button type="button" onClick={() => setShowAddTemplateForm(false)} className="flex-1 py-1 bg-zinc-100 text-zinc-500 border rounded">Cancel</button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Blueprints */}
                    <div className="space-y-2 max-h-[340px] overflow-y-auto pr-0.5">
                      {finalTemplates.map(tpl => (
                        <div 
                          key={tpl.id}
                          onClick={() => {
                            // Apply template to create custom booklet
                            setNewBookletTemplateId(tpl.id);
                            setShowAddSizingBookletForm(true);
                            setActiveTab("Customers");
                          }}
                          className="p-2.5 bg-white border border-zinc-200 hover:border-brand-gold rounded-xl cursor-pointer transition text-left flex gap-2"
                        >
                          <div className="w-7 h-7 bg-brand-gold/10 text-brand-gold font-serif font-bold rounded flex items-center justify-center shrink-0">
                            {tpl.name[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-[11px] text-zinc-800 truncate">{tpl.name}</span>
                              {tpl.urduName && <span className="text-[9px] text-brand-gold font-serif font-bold">{tpl.urduName}</span>}
                            </div>
                            <span className="text-[8px] text-zinc-400 block truncate mt-0.5">{tpl.description || "Bespoke customized sizing coordinates."}</span>
                            <span className="text-[8px] text-[#4F5D2F] font-mono block mt-1">⚡ {tpl.fields?.length || 0} measurements coordinates defined</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}


                {/* AUTH / PROFILE TAB */}
                {activeTab === "Auth" && (
                  <div className="flex-1 p-4 flex flex-col items-center justify-center text-center animate-fadeIn gap-4">
                    <div className="w-16 h-16 rounded-full bg-brand-gold/10 border-2 border-brand-gold flex items-center justify-center text-brand-gold">
                      <User className="w-8 h-8" />
                    </div>

                    {activeUser ? (
                      <div className="space-y-2">
                        <span className="text-xs text-zinc-400 font-mono">AUTHENTICATED OPERATOR:</span>
                        <h4 className="font-serif text-lg font-bold text-zinc-950">{activeUser.displayName || "Master Tailor"}</h4>
                        <p className="text-[10px] text-zinc-500 font-mono">{activeUser.email}</p>
                        
                        <div className="pt-4">
                          <button 
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 mx-auto"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Sign Out Suite</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 max-w-xs">
                        <h4 className="font-serif text-sm font-bold text-zinc-950">Atelier Suite Cloud Sandbox</h4>
                        <p className="text-[10px] text-zinc-500 leading-relaxed">
                          Connect with your verified Google account or continue in the offline local sandbox environment to run real-time multi-platform simulations!
                        </p>
                        
                        <div className="pt-2">
                          <button 
                            onClick={handleLogin}
                            className="px-4 py-2 bg-brand-gold hover:bg-brand-gold-light text-white rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 mx-auto"
                          >
                            <LogIn className="w-3.5 h-3.5" />
                            <span>Sign In / Connect</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* AD BANNER */}
              <div className="bg-[#2D3035] h-[52px] p-2 flex items-center gap-2 border-t border-zinc-800 shrink-0 relative">
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
                      <span className="text-[8px] text-[#A2A9B3] block truncate font-mono">
                        Tap for tutorial screencasts!
                      </span>
                    </div>
                  </div>
                  <div className="bg-brand-gold text-brand-cream text-[7px] font-extrabold uppercase px-1 py-0.5 rounded shadow shrink-0 font-mono">
                    Ad
                  </div>
                </div>
              </div>

              {/* BOTTOM NAVIGATION BAR */}
              <div className="bg-[#FCFAF2] h-14 border-t border-zinc-200 flex items-center justify-around shrink-0 pb-1.5 relative">
                
                <button 
                  id="tab-customers"
                  onClick={() => { setActiveTab("Customers"); setShowSizingTicket(false); }}
                  className={`flex flex-col items-center gap-0.5 cursor-pointer h-full justify-center w-1/5 ${
                    activeTab === "Customers" ? "text-brand-gold font-bold" : "text-brand-slate opacity-70"
                  }`}
                >
                  <div className={`px-2 py-0.5 rounded-full ${activeTab === "Customers" ? "bg-brand-gold/15" : ""}`}>
                    <User className="w-5 h-5" />
                  </div>
                  <span className="text-[7px] tracking-wide uppercase mt-0.5">Customers</span>
                </button>

                <button 
                  id="tab-inventory"
                  onClick={() => { setActiveTab("Inventory"); setShowSizingTicket(false); }}
                  className={`flex flex-col items-center gap-0.5 cursor-pointer h-full justify-center w-1/5 ${
                    activeTab === "Inventory" ? "text-brand-gold font-bold" : "text-brand-slate opacity-70"
                  }`}
                >
                  <div className={`px-2 py-0.5 rounded-full ${activeTab === "Inventory" ? "bg-brand-gold/15" : ""}`}>
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <span className="text-[7px] tracking-wide uppercase mt-0.5">Inventory</span>
                </button>

                <button 
                  id="tab-templates"
                  onClick={() => { setActiveTab("Templates"); setShowSizingTicket(false); }}
                  className={`flex flex-col items-center gap-0.5 cursor-pointer h-full justify-center w-1/5 ${
                    activeTab === "Templates" ? "text-brand-gold font-bold" : "text-brand-slate opacity-70"
                  }`}
                >
                  <div className={`px-2 py-0.5 rounded-full ${activeTab === "Templates" ? "bg-brand-gold/15" : ""}`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-[7px] tracking-wide uppercase mt-0.5">Templates</span>
                </button>

                <button 
                  id="tab-splash"
                  onClick={() => { setActiveTab("Splash"); }}
                  className={`flex flex-col items-center gap-0.5 cursor-pointer h-full justify-center w-1/5 ${
                    activeTab === "Splash" ? "text-brand-gold font-bold" : "text-brand-slate opacity-70"
                  }`}
                >
                  <div className={`px-2 py-0.5 rounded-full ${activeTab === "Splash" ? "bg-brand-gold/15" : ""}`}>
                    <Scissors className="w-5 h-5" />
                  </div>
                  <span className="text-[7px] tracking-wide uppercase mt-0.5">Splash</span>
                </button>

              </div>

            </div>
          </div>
        </div>
      </div>

      {/* 3. LANDING PAGE CONTROL PANEL (SYNC CONTROLS PLAYGROUND) */}
      <div id="simulator-control-panel" className="lg:col-span-7 lg:row-start-2 w-full bg-white p-6 sm:p-8 rounded-2xl border border-brand-gold/30 shadow-md kraft-shadow">
        <span className="text-xs uppercase font-mono text-brand-gold font-bold tracking-widest block mb-1">
          ❖ BESPOKE CLIENT PLAYGROUND SANDBOX
        </span>
        <h3 className="font-serif text-2xl font-bold text-brand-charcoal mb-3">
          Configure Your Bespoke Ticket
        </h3>
        
        <p className="text-sm text-brand-slate mb-5">
          Type measurements or customer details below and watch them synchronize inside the retro-styled smartphone ticket mock-up screen on the right! If you're signed in to your Google Account, you can write directly to your cloud Firestore instance!
        </p>

        {/* Input Details */}
        <div className="space-y-4 font-sans text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-brand-charcoal mb-1 font-mono">CUSTOMER NAME</label>
              <input 
                type="text"
                value={activeCustomer.name}
                onChange={(e) => {
                  if (activeUser) {
                    firebaseService.updateCustomer(activeUser.uid, activeCustomer.id, { name: e.target.value });
                  } else {
                    activeCustomer.name = e.target.value;
                    setDbCustomers([...finalCustomers]);
                  }
                }}
                className="w-full px-3 py-2 border border-zinc-200 rounded focus:ring-1 focus:ring-brand-gold outline-none bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-brand-charcoal mb-1 font-mono">PHONE NUMBER</label>
              <input 
                type="text"
                value={activeCustomer.phone}
                onChange={(e) => {
                  if (activeUser) {
                    firebaseService.updateCustomer(activeUser.uid, activeCustomer.id, { phone: e.target.value });
                  } else {
                    activeCustomer.phone = e.target.value;
                    setDbCustomers([...finalCustomers]);
                  }
                }}
                className="w-full px-3 py-2 border border-zinc-200 rounded focus:ring-1 focus:ring-brand-gold outline-none bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-brand-charcoal mb-1 font-mono">SHOP ADDRESS COORDINATE</label>
            <input 
              type="text"
              value={activeCustomer.address}
              onChange={(e) => {
                if (activeUser) {
                  firebaseService.updateCustomer(activeUser.uid, activeCustomer.id, { address: e.target.value });
                } else {
                  activeCustomer.address = e.target.value;
                  setDbCustomers([...finalCustomers]);
                }
              }}
              className="w-full px-3 py-2 border border-zinc-200 rounded focus:ring-1 focus:ring-brand-gold outline-none bg-white"
            />
          </div>

          <div>
            <label className="block font-bold text-brand-charcoal mb-1.5 font-mono">CHOOSE CUSTOM SIZING TEMPLATE FOR SIZING CARD</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {finalTemplates.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => {
                    // Create a new card or update the active card
                    const defaultVals = tpl.fields.reduce((acc: any, f: any) => ({ ...acc, [f.name]: f.value }), {});
                    if (activeUser) {
                      firebaseService.addSizingCard(activeUser.uid, activeCustomer.id, {
                        templateId: tpl.id,
                        templateName: tpl.name,
                        values: defaultVals,
                        fitPreference: "Regular",
                        specialNotes: "Preset values assigned"
                      }).then(cardId => {
                        setActiveCardId(cardId);
                        setShowSizingTicket(true);
                      });
                    } else {
                      const mockCardId = "mock-card-" + Date.now();
                      if (!activeCustomer.sizingCards) activeCustomer.sizingCards = [];
                      activeCustomer.sizingCards.unshift({
                        id: mockCardId,
                        templateId: tpl.id,
                        templateName: tpl.name,
                        createdDate: "Just Now",
                        values: defaultVals,
                        fitPreference: "Regular",
                        specialNotes: "Preset values assigned"
                      });
                      setActiveCardId(mockCardId);
                      setShowSizingTicket(true);
                      setDbCustomers([...finalCustomers]);
                    }
                  }}
                  className={`py-1.5 px-1.5 rounded border text-[10px] font-bold text-center truncate cursor-pointer transition ${
                    activeSizingCard?.templateId === tpl.id 
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
          {activeSizingCard && (
            <div className="border-t pt-4 animate-fadeIn">
              <span className="block font-bold text-brand-charcoal font-mono mb-2">
                📏 EDIT SELECTED COORDINATES: {activeSizingCard.templateName} (inches ″)
              </span>
              <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1 bg-brand-eggshell/40 p-2.5 rounded border">
                {activeTemplate.fields.map((field) => (
                  <div key={field.name} className="flex items-center justify-between gap-1.5">
                    <span className="text-[10px] text-zinc-600 truncate max-w-[130px]" title={field.label}>
                      {field.label.split('(')[0]}
                    </span>
                    <input
                      type="text"
                      value={activeSizingCard.values[field.name] || ""}
                      onChange={(e) => handleSizeChange(field.name, e.target.value)}
                      className="w-14 text-center px-1 py-1 border border-zinc-200 bg-white font-mono rounded text-[11px] font-bold focus:ring-1 focus:ring-brand-gold outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

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
                if (activeSizingCard) {
                  // Reset sizing card values back to default
                  const resetVals = activeTemplate.fields.reduce((acc: any, f: any) => ({ ...acc, [f.name]: f.value }), {});
                  if (activeUser) {
                    firebaseService.addSizingCard(activeUser.uid, activeCustomer.id, {
                      templateId: activeSizingCard.templateId,
                      templateName: activeSizingCard.templateName,
                      values: resetVals,
                      fitPreference: activeSizingCard.fitPreference || "Regular",
                      specialNotes: activeSizingCard.specialNotes || ""
                    });
                  } else {
                    activeSizingCard.values = resetVals;
                    setDbCustomers([...finalCustomers]);
                  }
                }
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
