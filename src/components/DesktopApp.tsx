import { useState, useEffect, useMemo, FormEvent } from "react";
import { 
  Scissors, Search, SlidersHorizontal, Plus, User, Phone, MapPin, 
  Ruler, CreditCard, Users, Settings, Database, ArrowLeft, Check, 
  Trash2, DollarSign, Share2, Copy, Printer, CheckCircle, AlertTriangle, 
  HelpCircle, Sparkles, Send, FileText, Download, Briefcase, RefreshCw, LogIn, LogOut,
  Lock, Shield
} from "lucide-react";
import { 
  collection, doc, getDocs, setDoc, updateDoc, deleteDoc, 
  addDoc, onSnapshot, query, where, writeBatch 
} from "firebase/firestore";
import { 
  onAuthStateChanged, signInWithPopup, signOut, User as FirebaseUser 
} from "firebase/auth";
import { db, auth, googleProvider } from "../lib/firebase";
import { SIZING_TEMPLATES } from "../types";
import PrivacyPage from "./PrivacyPage";

// Customer Data Structure
interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  hasPendingDeliveries: boolean;
  hasOutstandingDebt: boolean;
  trialScheduled: boolean;
  trialDate?: string;
  activeTemplateId: string;
  measurements: Record<string, string>;
  styleSelections: Record<string, string>;
  ledger: LedgerEntry[];
}

interface LedgerEntry {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
  creditAdvance: boolean; // if true, this subtracts from the overall balance (negative entry or credit advance)
  date: string;
}

// Staff Member Wage Structure
interface StaffMember {
  id: string;
  name: string;
  role: string;
  pieceRate: number; // custom per-item rate
  completedTasks: { id: string; task: string; payout: number; date: string }[];
  advancesPaid: number;
}

// Prebuilt Styling Demands mapping
const STYLE_OPTIONS: Record<string, { labelUrdu: string, options: string[] }> = {
  collar: { labelUrdu: "Collar / کالر", options: ["Half-Collar / ہاف کالر", "Ban Collar / بین کالر", "English Collar / بڑا کالر", "No Collar / بغیر کالر"] },
  daaman: { labelUrdu: "Daaman / دامن", options: ["Chauras (Square) / چورس", "Gool (Round) / گول", "Apple Cut / سیب کٹ"] },
  pocket: { labelUrdu: "Pocket / جیب", options: ["Front Chest Pocket / سامنے جیب", "Both Side Pocket / دونوں طرف جیب", "Left Side Only / صرف بائیں طرف", "No Pocket / بغیر جیب"] },
  cuff: { labelUrdu: "Cuff Style / کف سٹائل", options: ["Two-Button Round / گول کف", "Single-Button Square / چورس کف", "French Cuff / قیمتی کف", "No Cuff / سادہ کف"] },
  backKatz: { labelUrdu: "Back Design / بیک ڈیزائن", options: ["Single Vent / ایک کٹ", "Double Vent / دو کٹ", "No Vent / بغیر کٹ"] }
};

interface DesktopAppProps {
  onBackToLanding: () => void;
}

export default function DesktopApp({ onBackToLanding }: DesktopAppProps) {
  // Navigation State
  const [activeTab, setActiveTab] = useState<"customers" | "templates" | "wages" | "settings">("customers");
  
  // Auth State
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPrivacyPage, setShowPrivacyPage] = useState(false);

  // Core Data State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [staff, setStaff] = useState<StaffMember[]>([]);
  
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "deliveries" | "debt" | "trials">("all");

  // Local/Temporary form inputs
  const [showAddCustModal, setShowAddCustModal] = useState(false);
  const [newCustName, setNewCustName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");
  const [newCustAddress, setNewCustAddress] = useState("");

  const [invoiceDesc, setInvoiceDesc] = useState("");
  const [invoiceQty, setInvoiceQty] = useState(1);
  const [invoicePrice, setInvoicePrice] = useState(0);
  const [isAdvance, setIsAdvance] = useState(false);

  // Staff wages builder input
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffRole, setNewStaffRole] = useState("Helper");
  const [newStaffRate, setNewStaffRate] = useState(40);
  
  // Staff Log Work Task form
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [workTaskDesc, setWorkTaskDesc] = useState("Sewing Classic Formal Shirt");
  const [workTaskQty, setWorkTaskQty] = useState(1);

  // Slips Receipt Modal overlay
  const [showInvoiceReceipt, setShowInvoiceReceipt] = useState(false);
  const [showSizingReceipt, setShowSizingReceipt] = useState(false);
  
  // Alerts feedback
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Initialize Default Local Storage Mock Data
  const defaultCustomers: Customer[] = [
    {
      id: "cust-1",
      name: "Julian Thorne",
      phone: "+1 (555) 234-5678",
      address: "12 Savile Row, London, W1S 3PF",
      hasPendingDeliveries: true,
      hasOutstandingDebt: true,
      trialScheduled: true,
      trialDate: "2026-06-28",
      activeTemplateId: "dress_shirt",
      measurements: {
        length: "30.5",
        shoulder: "18.5",
        chest: "41.0",
        waist: "37.5",
        sleeve_length: "25.5",
        cuff: "9.2",
        neck: "16.0"
      },
      styleSelections: {
        collar: "English Collar / بڑا کالر",
        daaman: "Chauras (Square) / چورس",
        pocket: "Front Chest Pocket / سامنے جیب",
        cuff: "Two-Button Round / گول کف"
      },
      ledger: [
        { id: "led-1", description: "Bespoke Egyptian Giza Cotton Shirt Fabric Sourcing", qty: 2, unitPrice: 35, creditAdvance: false, date: "06/15" },
        { id: "led-2", description: "Stitch-work master tailoring sewing charge", qty: 1, unitPrice: 120, creditAdvance: false, date: "06/15" },
        { id: "led-3", description: "First Phase Advance Deposit Payment", qty: 1, unitPrice: 80, creditAdvance: true, date: "06/16" }
      ]
    },
    {
      id: "cust-2",
      name: "Arthur Montgomery",
      phone: "+1 (555) 890-1234",
      address: "88 Bond St, Westminster, London",
      hasPendingDeliveries: false,
      hasOutstandingDebt: false,
      trialScheduled: false,
      activeTemplateId: "chinos_trousers",
      measurements: {
        trouser_length: "41.0",
        trouser_waist: "34.0",
        trouser_seat: "40.5",
        trouser_inseam: "31.5",
        thigh: "23.5",
        knee: "17.0",
        trouser_bottom: "7.8"
      },
      styleSelections: {
        pocket: "Both Side Pocket / دونوں طرف جیب",
        backKatz: "Single Vent / ایک کٹ"
      },
      ledger: [
        { id: "led-4", description: "Irish Heritage Linen Custom Pants Fabric Sourcing", qty: 1, unitPrice: 75, creditAdvance: false, date: "06/20" },
        { id: "led-5", description: "Irish Linen pants stitching and trim button fitting", qty: 1, unitPrice: 90, creditAdvance: false, date: "06/20" },
        { id: "led-6", description: "Cleared full settlement draft", qty: 1, unitPrice: 165, creditAdvance: true, date: "06/20" }
      ]
    },
    {
      id: "cust-3",
      name: "Theodore Finch",
      phone: "+1 (555) 345-6789",
      address: "The Croft, Oxfordshire, OX14",
      hasPendingDeliveries: true,
      hasOutstandingDebt: true,
      trialScheduled: true,
      trialDate: "2026-07-02",
      activeTemplateId: "waistcoat",
      measurements: {
        vest_length: "25.0",
        vest_chest: "39.5",
        vest_waist: "35.0"
      },
      styleSelections: {
        collar: "No Collar / بغیر کالر",
        daaman: "Apple Cut / سیب کٹ"
      },
      ledger: [
        { id: "led-7", description: "Bespoke Navy Woolen Tailored Vest stitches", qty: 1, unitPrice: 210, creditAdvance: false, date: "06/22" }
      ]
    }
  ];

  const defaultStaff: StaffMember[] = [
    {
      id: "staff-1",
      name: "Arthur Pendelton",
      role: "Master Pattern Cutter",
      pieceRate: 25,
      completedTasks: [
        { id: "task-1", task: "Coat Pattern Cutting for Thorne Suite", payout: 45, date: "06/18" },
        { id: "task-2", task: "Precision Silk Vest Lining Trim Setup", payout: 25, date: "06/21" }
      ],
      advancesPaid: 30
    },
    {
      id: "staff-2",
      name: "Clara Jenkins",
      role: "Jacket & Suit Specialist",
      pieceRate: 40,
      completedTasks: [
        { id: "task-3", task: "Full Egyptian Giza Cotton Shirt finish stitching", payout: 40, date: "06/19" },
        { id: "task-4", task: "Double Vent Waistcoat Assembly", payout: 40, date: "06/22" }
      ],
      advancesPaid: 50
    }
  ];

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // 1. Firebase Auth state checking
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
      triggerToast(firebaseUser ? `Welcome, logged in with Cloud Sync!` : "Operating in Safe Local offline mode.");
    });
    return unsubscribe;
  }, []);

  // 2. Fetch and sync from Firestore or default to Local Storage
  useEffect(() => {
    // If we have a logged-in user, fetch from unique node in firebase
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      const unsubscribeCustomers = onSnapshot(collection(db, "users", user.uid, "customers"), (snapshot) => {
        const list: Customer[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...d.data() } as Customer);
        });
        setCustomers(list.length > 0 ? list : defaultCustomers);
        if (list.length > 0 && !selectedCustomerId) {
          setSelectedCustomerId(list[0].id);
        }
      }, (err) => {
        console.error("Firestore error:", err);
      });

      const unsubscribeStaff = onSnapshot(collection(db, "users", user.uid, "staff_directory"), (snapshot) => {
        const list: StaffMember[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...d.data() } as StaffMember);
        });
        setStaff(list.length > 0 ? list : defaultStaff);
      });

      return () => {
        unsubscribeCustomers();
        unsubscribeStaff();
      };
    } else {
      // Local Storage support for high-fidelity offline operations
      const localCusts = localStorage.getItem("tsm_customers");
      const localStaff = localStorage.getItem("tsm_staff");
      
      const parsedCusts = localCusts ? JSON.parse(localCusts) : defaultCustomers;
      setCustomers(parsedCusts);
      
      const parsedStaff = localStaff ? JSON.parse(localStaff) : defaultStaff;
      setStaff(parsedStaff);

      if (parsedCusts.length > 0 && !selectedCustomerId) {
        setSelectedCustomerId(parsedCusts[0].id);
      }
    }
  }, [user]);

  // Sync state back to local storage if offline
  useEffect(() => {
    if (!user && customers.length > 0) {
      localStorage.setItem("tsm_customers", JSON.stringify(customers));
    }
  }, [customers, user]);

  useEffect(() => {
    if (!user && staff.length > 0) {
      localStorage.setItem("tsm_staff", JSON.stringify(staff));
    }
  }, [staff, user]);

  // Auth Action Handlers
  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e: any) {
      triggerToast("Cloud integration bypassed: " + e.message);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      triggerToast("Logged out successfully.");
    } catch (e: any) {
      triggerToast("Logout failed: " + e.message);
    }
  };

  // Selected Customer detail memoization
  const activeCustomer = useMemo(() => {
    return customers.find(c => c.id === selectedCustomerId) || customers[0] || null;
  }, [customers, selectedCustomerId]);

  // Calculate selected Customer's financial status
  const customerLedgerSummary = useMemo(() => {
    if (!activeCustomer) return { totalCharges: 0, totalAdvances: 0, balanceDue: 0 };
    
    let totalCharges = 0;
    let totalAdvances = 0;

    activeCustomer.ledger.forEach((item) => {
      const lineCost = item.unitPrice * item.qty;
      if (item.creditAdvance) {
        totalAdvances += lineCost;
      } else {
        totalCharges += lineCost;
      }
    });

    const balanceDue = totalCharges - totalAdvances;
    return {
      totalCharges,
      totalAdvances,
      balanceDue
    };
  }, [activeCustomer]);

  // Handle active Sizing Inputs Changes
  const handleMeasurementChange = async (fieldName: string, value: string) => {
    if (!activeCustomer) return;
    
    const updatedCustomers = customers.map(c => {
      if (c.id === activeCustomer.id) {
        return {
          ...c,
          measurements: {
            ...c.measurements,
            [fieldName]: value
          }
        };
      }
      return c;
    });
    setCustomers(updatedCustomers);

    // Save back to Firestore in real-time
    if (user) {
      try {
        await updateDoc(doc(db, "users", user.uid, "customers", activeCustomer.id), {
          measurements: {
            ...activeCustomer.measurements,
            [fieldName]: value
          }
        });
      } catch (e) {
        console.error("Cloud save failed", e);
      }
    }
  };

  // Handle Style Selector Changes
  const handleStyleChange = async (styleKey: string, val: string) => {
    if (!activeCustomer) return;

    const updatedCustomers = customers.map(c => {
      if (c.id === activeCustomer.id) {
        return {
          ...c,
          styleSelections: {
            ...c.styleSelections,
            [styleKey]: val
          }
        };
      }
      return c;
    });
    setCustomers(updatedCustomers);

    if (user) {
      try {
        await updateDoc(doc(db, "users", user.uid, "customers", activeCustomer.id), {
          styleSelections: {
            ...activeCustomer.styleSelections,
            [styleKey]: val
          }
        });
      } catch (e) {
        console.error("Cloud style save failed", e);
      }
    }
  };

  // Add Customer Action
  const handleAddCustomer = async (e: FormEvent) => {
    e.preventDefault();
    if (!newCustName) return;

    const newId = "cust_id_" + Date.now();
    const newRecord: Customer = {
      id: newId,
      name: newCustName,
      phone: newCustPhone || "+1 (555) 000-0000",
      address: newCustAddress || "Not Specified Address",
      hasPendingDeliveries: false,
      hasOutstandingDebt: false,
      trialScheduled: false,
      activeTemplateId: "dress_shirt",
      measurements: {
        length: "30.0",
        shoulder: "18.0",
        chest: "40.0",
        waist: "36.0",
        sleeve_length: "25.0",
        cuff: "9.0",
        neck: "15.5"
      },
      styleSelections: {
        collar: "Half-Collar / بین کالر",
        daaman: "Chauras (Square) / چورس",
        pocket: "Front Chest Pocket / سامنے جیب"
      },
      ledger: []
    };

    const newCustsList = [...customers, newRecord];
    setCustomers(newCustsList);
    setSelectedCustomerId(newId);
    setShowAddCustModal(false);
    
    // reset form
    setNewCustName("");
    setNewCustPhone("");
    setNewCustAddress("");

    if (user) {
      try {
        await setDoc(doc(db, "users", user.uid, "customers", newId), newRecord);
        triggerToast(`Customer ${newCustName} uploaded to Cloud Server!`);
      } catch (e) {
        triggerToast("Saved locally. Cloud upload failed.");
      }
    } else {
      triggerToast(`Successfully added ${newCustName} locally.`);
    }
  };

  // Delete Customer Action
  const handleDeleteCustomer = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this customer's entire portfolio?")) return;
    
    const index = customers.findIndex(c => c.id === id);
    const updated = customers.filter(c => c.id !== id);
    setCustomers(updated);
    
    if (updated.length > 0) {
      setSelectedCustomerId(updated[Math.max(0, index - 1)].id);
    } else {
      setSelectedCustomerId("");
    }

    if (user) {
      try {
        await deleteDoc(doc(db, "users", user.uid, "customers", id));
        triggerToast("Customer deleted from cloud safely.");
      } catch (e) {
        console.error(e);
      }
    } else {
      triggerToast("Customer deleted locally.");
    }
  };

  // Quick Ledger log submit
  const handleAddLedgerEntry = async (e: FormEvent) => {
    e.preventDefault();
    if (!activeCustomer || !invoiceDesc || invoicePrice <= 0) return;

    const newEntry: LedgerEntry = {
      id: "led_" + Date.now(),
      description: invoiceDesc,
      qty: invoiceQty,
      unitPrice: invoicePrice,
      creditAdvance: isAdvance,
      date: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })
    };

    const updatedLedger = [...activeCustomer.ledger, newEntry];

    // Determine outstanding state
    let totalCharges = 0;
    let totalAdvances = 0;
    updatedLedger.forEach(item => {
      const lineCost = item.unitPrice * item.qty;
      if (item.creditAdvance) totalAdvances += lineCost;
      else totalCharges += lineCost;
    });
    const debt = (totalCharges - totalAdvances) > 0;

    const updatedCustomers = customers.map(c => {
      if (c.id === activeCustomer.id) {
        return {
          ...c,
          ledger: updatedLedger,
          hasOutstandingDebt: debt
        };
      }
      return c;
    });

    setCustomers(updatedCustomers);
    
    // Clear inputs
    setInvoiceDesc("");
    setInvoiceQty(1);
    setInvoicePrice(0);
    setIsAdvance(false);

    if (user) {
      try {
        await updateDoc(doc(db, "users", user.uid, "customers", activeCustomer.id), {
          ledger: updatedLedger,
          hasOutstandingDebt: debt
        });
        triggerToast("Ledger item ledger logged.");
      } catch (e) {
        console.error(e);
      }
    } else {
      triggerToast("Saved entry to offline ledger.");
    }
  };

  const handleDeleteLedgerEntry = async (entryId: string) => {
    if (!activeCustomer) return;
    const updatedLedger = activeCustomer.ledger.filter(item => item.id !== entryId);

    // Re-check debt
    let totalCharges = 0;
    let totalAdvances = 0;
    updatedLedger.forEach(item => {
      const lineCost = item.unitPrice * item.qty;
      if (item.creditAdvance) totalAdvances += lineCost;
      else totalCharges += lineCost;
    });
    const debt = (totalCharges - totalAdvances) > 0;

    const updatedCustomers = customers.map(c => {
      if (c.id === activeCustomer.id) {
        return { ...c, ledger: updatedLedger, hasOutstandingDebt: debt };
      }
      return c;
    });
    setCustomers(updatedCustomers);

    if (user) {
      try {
        await updateDoc(doc(db, "users", user.uid, "customers", activeCustomer.id), {
          ledger: updatedLedger,
          hasOutstandingDebt: debt
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Staff wages triggers
  const handleAddStaffMember = async (e: FormEvent) => {
    e.preventDefault();
    if (!newStaffName) return;

    const newId = "staff_" + Date.now();
    const newMember: StaffMember = {
      id: newId,
      name: newStaffName,
      role: newStaffRole,
      pieceRate: Number(newStaffRate),
      completedTasks: [],
      advancesPaid: 0
    };

    const updatedStaff = [...staff, newMember];
    setStaff(updatedStaff);
    
    // reset form
    setNewStaffName("");
    setNewStaffRate(40);
    setNewStaffRole("Helper");

    if (user) {
      try {
        await setDoc(doc(db, "users", user.uid, "staff_directory", newId), newMember);
        triggerToast(`Added ${newStaffName} to Staff Directory Hub!`);
      } catch (e) {
        console.error(e);
      }
    } else {
      triggerToast(`Enrolled ${newStaffName} locally.`);
    }
  };

  const handleLogStaffWork = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedStaffId) return;

    const staffMember = staff.find(s => s.id === selectedStaffId);
    if (!staffMember) return;

    const totalPayout = staffMember.pieceRate * workTaskQty;
    
    const updatedTasks = [
      ...staffMember.completedTasks,
      {
        id: "task_" + Date.now(),
        task: `${workTaskDesc} (x${workTaskQty})`,
        payout: totalPayout,
        date: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })
      }
    ];

    const updatedStaff = staff.map(s => {
      if (s.id === selectedStaffId) {
        return {
          ...s,
          completedTasks: updatedTasks
        };
      }
      return s;
    });

    setStaff(updatedStaff);
    triggerToast(`Rewarded piece-work task and added $${totalPayout}`);

    if (user) {
      try {
        await updateDoc(doc(db, "users", user.uid, "staff_directory", selectedStaffId), {
          completedTasks: updatedTasks
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handlePayStaffAdvance = async (staffId: string, amount: number) => {
    if (amount <= 0 || isNaN(amount)) return;

    const updatedStaff = staff.map(s => {
      if (s.id === staffId) {
        return {
          ...s,
          advancesPaid: s.advancesPaid + amount
        };
      }
      return s;
    });

    setStaff(updatedStaff);
    triggerToast(`Subsumed $${amount} payout details to employee.`);

    if (user) {
      try {
        const staffMember = staff.find(s => s.id === staffId);
        if (staffMember) {
          await updateDoc(doc(db, "users", user.uid, "staff_directory", staffId), {
            advancesPaid: staffMember.advancesPaid + amount
          });
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleResetEmployeeLedger = async (staffId: string) => {
    if (!window.confirm("Complete master settlement for this employee? This flushes completed balance offsets.")) return;

    const updatedStaff = staff.map(s => {
      if (s.id === staffId) {
        return {
          ...s,
          completedTasks: [],
          advancesPaid: 0
        };
      }
      return s;
    });

    setStaff(updatedStaff);
    triggerToast("Ledger balances fully cleared & recorded!");

    if (user) {
      try {
        await updateDoc(doc(db, "users", user.uid, "staff_directory", staffId), {
          completedTasks: [],
          advancesPaid: 0
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            c.phone.includes(searchQuery);
      
      if (!matchesSearch) return false;

      if (filterType === "deliveries") return c.hasPendingDeliveries;
      if (filterType === "debt") return c.hasOutstandingDebt;
      if (filterType === "trials") return c.trialScheduled;

      return true;
    });
  }, [customers, searchQuery, filterType]);

  // JSON backup configuration exports
  const exportBackupDetails = () => {
    try {
      const backupData = JSON.stringify({
        app: "TailorShopManager",
        exportedAt: new Date().toISOString(),
        customers,
        staff
      }, null, 2);

      const streamBlob = new Blob([backupData], { type: "application/json" });
      const dlLink = document.createElement("a");
      dlLink.href = URL.createObjectURL(streamBlob);
      dlLink.download = `tailor_shop_master_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(dlLink);
      dlLink.click();
      document.body.removeChild(dlLink);
      triggerToast("System JSON Backup profile saved to storage!");
    } catch (_) {
      triggerToast("Local storage backup export blocked.");
    }
  };

  if (showPrivacyPage) {
    return <PrivacyPage onBack={() => setShowPrivacyPage(false)} />;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center font-sans p-6">
        <div className="w-12 h-12 border-4 border-[#8B6B3F] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-mono text-xs uppercase tracking-widest text-[#8B6B3F] animate-pulse">
          Unlocking Secure Workspace...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F5F2EB] flex flex-col items-center justify-center font-sans p-4 relative overflow-hidden">
        {/* Decorative thread lines */}
        <div className="absolute inset-0 opacity-5 pointer-events-none select-none">
          <svg width="100%" height="100%">
            <pattern id="diag" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 0 40 L 40 0 M 0 0 L 40 40" fill="none" stroke="#1B1A18" strokeWidth="1" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#diag)" />
          </svg>
        </div>

        <div className="w-full max-w-lg bg-[#FDFBF7] border border-[#E5DECE] p-8 rounded-xl shadow-xl space-y-6 relative z-10 text-center">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-[#8B6B3F]/10 text-[#8B6B3F] rounded-full flex items-center justify-center mb-4 border border-[#8B6B3F]/20">
              <Lock className="w-8 h-8" />
            </div>
            
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#1B1A18]">
              Workspace Locked
            </h1>
            <p className="text-[10px] font-mono tracking-widest uppercase text-[#8B6B3F] mt-1 font-bold">
              Secure Cloud Sync Needed
            </p>
          </div>

          <p className="text-xs text-zinc-600 leading-relaxed max-w-sm mx-auto">
            To conform to patron confidentiality standard directives and secure real-time cross-device cloud synchronization, this workshop register requires authentication before loading directory databases.
          </p>

          {/* Privacy Verification Requirement Checkbox container */}
          <div className="bg-[#F5F2EB] border border-[#E5DECE] p-4 rounded-lg text-left space-y-3">
            <label className="flex items-start gap-3 cursor-pointer select-none text-xs text-zinc-700">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 rounded border-[#C8B195] text-[#8B6B3F] focus:ring-[#8B6B3F]"
              />
              <span className="leading-tight">
                I declare that I have read, understood, and accept the active{" "}
                <button
                  type="button"
                  onClick={() => setShowPrivacyPage(true)}
                  className="font-bold underline text-[#8B6B3F] hover:text-[#1B1A18] inline bg-transparent p-0 border-0 cursor-pointer"
                >
                  Privacy Policy & Terms of Service
                </button>
                . I grant permission to sync my client records securely to my designated Google UID directory.
              </span>
            </label>
          </div>

          {/* Connect Google Sync action button */}
          <div className="space-y-3 pt-2">
            <button
              onClick={() => {
                if (!termsAccepted) {
                  triggerToast("Please accept the Terms and Privacy Policy first!");
                  return;
                }
                handleGoogleSignIn();
              }}
              className={`w-full py-3.5 flex items-center justify-center gap-3 font-sans text-xs tracking-wider uppercase font-bold rounded-lg transition-all shadow-md ${
                termsAccepted
                  ? "bg-[#8B6B3F] hover:bg-[#1B1A18] text-[#FCFAF2] cursor-pointer hover:-translate-y-0.5"
                  : "bg-zinc-200 text-zinc-400 cursor-not-allowed opacity-75"
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Connect Google Cloud Sync</span>
            </button>

            <button
              onClick={onBackToLanding}
              className="w-full py-2.5 bg-transparent hover:bg-zinc-100 text-[#8B6B3F] hover:text-[#1B1A18] font-mono text-[10px] tracking-wide uppercase font-bold cursor-pointer rounded transition-all border-0"
            >
              ← Back to Landing Page
            </button>
          </div>

          {/* Small footer */}
          <div className="pt-4 border-t border-zinc-100 flex justify-between items-center text-[9px] text-zinc-400 font-mono">
            <span>ISOLATED SYSTEM NODE</span>
            <span className="text-[#8B6B3F] font-bold">100% PRIVATE TAILORING OS</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1B1A18] font-sans flex flex-col antialiased selection:bg-[#8B6B3F] selection:text-white relative">
      
      {/* Toast Alert bar */}
      {toastMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#1B1A18] text-[#FCFAF2] border border-[#8B6B3F] px-4 py-2.5 rounded-lg shadow-xl text-xs font-mono tracking-wide flex items-center gap-2 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-brand-gold animate-pulse" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* TOP DESKTOP NAVIGATION ROW */}
      <header className="h-16 border-b border-[#E5DECE] bg-[#FDFBF7] flex items-center justify-between px-6 shrink-0 relative z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBackToLanding}
            className="flex items-center gap-1 text-xs uppercase font-bold tracking-wider text-[#8B6B3F] hover:text-[#1B1A18] transition p-1 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Landing Page</span>
          </button>
          
          <div className="w-px h-6 bg-[#E5DECE]" />

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#8B6B3F] rounded-full flex items-center justify-center">
              <Scissors className="w-4 h-4 text-white rotate-45" />
            </div>
            <div>
              <span className="font-serif text-lg font-bold tracking-tight text-[#1B1A18] block leading-none">
                TailorShopManager
              </span>
              <span className="text-[8px] font-mono tracking-widest text-[#8B6B3F] uppercase block mt-0.5">
                Professional Workspace
              </span>
            </div>
          </div>
        </div>

        {/* Central Cloud status indicator */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2 bg-[#4F5D2F]/10 border border-[#4F5D2F]/20 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#4F5D2F] animate-pulse"></span>
              <span className="text-[10px] font-mono font-bold text-[#4F5D2F] uppercase block">
                Cloud Sync Active • {user.displayName || "Owner"}
              </span>
              <button 
                onClick={handleSignOut}
                title="Disconnect Cloud Sync"
                className="ml-1 text-[9px] font-mono text-[#8B6B3F] hover:text-[#1B1A18] underline cursor-pointer"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={handleGoogleSignIn}
              className="px-3 py-1.5 bg-[#8B6B3F] hover:bg-[#5E584E] text-[#FCFAF2] rounded-full text-[10px] font-mono uppercase font-bold tracking-wider flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <LogIn className="w-3 h-3" />
              <span>Connect Cloud Sync</span>
            </button>
          )}

          <div className="w-px h-6 bg-[#E5DECE]" />

          {/* Quick instructions indicator */}
          <span className="text-[10px] font-mono text-zinc-400">Ver 1.4.0 Live</span>
        </div>
      </header>

      {/* CORE THREE-COLUMN EXPANDED VIEW SCREEN */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* ======================================================== */}
        {/* COLUMN 1: LEFTMOST NAVIGATION RAIL (COMPACT WIDGETS)     */}
        {/* ======================================================== */}
        <aside className="w-20 bg-[#F5F2EB] border-r border-[#E5DECE] flex flex-col items-center py-6 justify-between shrink-0">
          
          {/* Main action triggers */}
          <div className="space-y-6 w-full px-2">
            
            <button
              onClick={() => setActiveTab("customers")}
              className={`w-full flex flex-col items-center py-3.5 px-1 rounded-xl transition ${
                activeTab === "customers"
                  ? "bg-white text-[#8B6B3F] border border-[#E5DECE] shadow-sm font-bold"
                  : "text-[#5E584E]/70 hover:bg-white/50 hover:text-[#1B1A18]"
              }`}
            >
              <Users className="w-5 h-5 mb-1" />
              <span className="text-[9px] font-mono uppercase tracking-tighter">Directory</span>
            </button>

            <button
              onClick={() => setActiveTab("templates")}
              className={`w-full flex flex-col items-center py-3.5 px-1 rounded-xl transition ${
                activeTab === "templates"
                  ? "bg-white text-[#8B6B3F] border border-[#E5DECE] shadow-sm font-bold"
                  : "text-[#5E584E]/70 hover:bg-white/50 hover:text-[#1B1A18]"
              }`}
            >
              <Ruler className="w-5 h-5 mb-1" />
              <span className="text-[9px] font-mono uppercase tracking-tighter">Sizings</span>
            </button>

            <button
              onClick={() => setActiveTab("wages")}
              className={`w-full flex flex-col items-center py-3.5 px-1 rounded-xl transition ${
                activeTab === "wages"
                  ? "bg-white text-[#8B6B3F] border border-[#E5DECE] shadow-sm font-bold"
                  : "text-[#5E584E]/70 hover:bg-white/50 hover:text-[#1B1A18]"
              }`}
            >
              <Briefcase className="w-5 h-5 mb-1" />
              <span className="text-[9px] font-mono uppercase tracking-tighter">Staff wages</span>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full flex flex-col items-center py-3.5 px-1 rounded-xl transition ${
                activeTab === "settings"
                  ? "bg-white text-[#8B6B3F] border border-[#E5DECE] shadow-sm font-bold"
                  : "text-[#5E584E]/70 hover:bg-white/50 hover:text-[#1B1A18]"
              }`}
            >
              <Settings className="w-5 h-5 mb-1" />
              <span className="text-[9px] font-mono uppercase tracking-tighter">Backup</span>
            </button>

          </div>

          {/* Quick user badge info at bottom of rail */}
          <div className="flex flex-col items-center gap-1 pt-4 border-t border-[#E5DECE] w-full text-center">
            <div className="w-8 h-8 rounded-full bg-[#8B6B3F]/10 text-[#8B6B3F] font-bold text-xs flex items-center justify-center border border-[#8B6B3F]/20">
              {user ? user.displayName?.slice(0, 2).toUpperCase() : "A"}
            </div>
            <span className="text-[8px] font-mono text-zinc-400">Offline On</span>
          </div>

        </aside>

        {/* ======================================================== */}
        {/* COLUMN 2: MIDDLE COLUMN (CUSTOMER INDEX SELECTION, 320px)*/}
        {/* ======================================================== */}
        <aside className="w-80 border-r border-[#E5DECE] bg-[#FDFBF7] flex flex-col overflow-hidden shrink-0">
          
          {/* Header toolbar stats */}
          <div className="p-4 border-b border-[#E5DECE] space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="font-serif text-lg font-bold text-[#1B1A18] flex items-center gap-1.5">
                <span>Atelier Profiles</span>
                <span className="text-xs bg-[#8B6B3F]/10 text-[#8B6B3F] px-2 py-0.5 rounded font-mono">
                  {customers.length}
                </span>
              </h2>

              <button
                onClick={() => setShowAddCustModal(true)}
                className="w-7 h-7 bg-[#8B6B3F] hover:bg-[#5E584E] text-[#FCFAF2] rounded-full flex items-center justify-center cursor-pointer transition shadow-xs"
                title="Enroll New Portfolio"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Quick search input filter */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search Client registry..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs py-2 bg-[#F5F2EB]/55 border border-[#E5DECE] rounded-lg pl-8 pr-3 outline-none text-[#1B1A18] placeholder-zinc-400 focus:border-[#8B6B3F] focus:ring-1 focus:ring-[#8B6B3F]/25 font-sans"
              />
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-3" />
            </div>

            {/* Sub-filters buttons layout */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <button
                onClick={() => setFilterType("all")}
                className={`text-[9px] font-mono uppercase px-2 py-1 rounded transition border cursor-pointer ${
                  filterType === "all"
                    ? "bg-[#8B6B3F] border-[#8B6B3F] text-[#FCFAF2] font-bold"
                    : "bg-[#FDFBF7] border-[#E5DECE] text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType("deliveries")}
                className={`text-[9px] font-mono uppercase px-2 py-1 rounded transition border cursor-pointer ${
                  filterType === "deliveries"
                    ? "bg-[#8B6B3F] border-[#8B6B3F] text-[#FCFAF2] font-bold"
                    : "bg-[#FDFBF7] border-[#E5DECE] text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                Deliveries
              </button>
              <button
                onClick={() => setFilterType("debt")}
                className={`text-[9px] font-mono uppercase px-2 py-1 rounded transition border cursor-pointer ${
                  filterType === "debt"
                    ? "bg-[#8B6B3F] border-[#8B6B3F] text-[#FCFAF2] font-bold"
                    : "bg-[#FDFBF7] border-[#E5DECE] text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                Debts
              </button>
              <button
                onClick={() => setFilterType("trials")}
                className={`text-[9px] font-mono uppercase px-2 py-1 rounded transition border cursor-pointer ${
                  filterType === "trials"
                    ? "bg-[#8B6B3F] border-[#8B6B3F] text-[#FCFAF2] font-bold"
                    : "bg-[#FDFBF7] border-[#E5DECE] text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                Trials
              </button>
            </div>
          </div>

          {/* Customer Scroll List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-[#FBF9F4]">
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-12 text-zinc-400 font-serif italic text-xs">
                No matching tailor portfolios.
              </div>
            ) : (
              filteredCustomers.map((cust) => {
                const isActive = cust.id === selectedCustomerId;
                
                // calculate overall outstanding in middle list index
                let charges = 0;
                let advances = 0;
                cust.ledger.forEach(l => {
                  if (l.creditAdvance) advances += (l.unitPrice * l.qty);
                  else charges += (l.unitPrice * l.qty);
                });
                const dueOffset = charges - advances;

                return (
                  <div
                    key={cust.id}
                    onClick={() => {
                      setSelectedCustomerId(cust.id);
                      if (activeTab !== "customers") setActiveTab("customers");
                    }}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-200 ${
                      isActive 
                        ? "bg-white border-[#8B6B3F] ring-1 ring-[#8B6B3F]/35 shadow-md scale-[1.01]" 
                        : "bg-white border-[#E5DECE] hover:border-brand-gold/40 shadow-xs"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-serif font-bold text-sm text-[#1B1A18] leading-tight max-w-[150px] truncate">
                          {cust.name}
                        </h4>
                        <p className="text-[10px] text-zinc-500 font-mono mt-0.5 flex items-center gap-1">
                          <Phone className="w-2.5 h-2.5 inline text-zinc-400" />
                          <span>{cust.phone}</span>
                        </p>
                      </div>

                      {/* Status pill cards */}
                      <div className="flex flex-col items-end gap-1">
                        {dueOffset > 0 ? (
                          <span className="text-[9px] font-mono text-[#D2691E] font-bold bg-[#D2691E]/15 border border-[#D2691E]/20 px-1.5 py-0.5 rounded">
                            Due: ${dueOffset}
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono text-[#4F5D2F] font-bold bg-[#4F5D2F]/15 border border-[#4F5D2F]/20 px-1.5 py-0.5 rounded">
                            Paid
                          </span>
                        )}

                        <span className="text-[8px] font-mono text-zinc-400 tracking-wider uppercase">
                          {cust.activeTemplateId.split('_').join(' ')}
                        </span>
                      </div>
                    </div>

                    {/* Badge details */}
                    <div className="mt-2.5 pt-2 border-t border-[#E5DECE]/50 flex items-center justify-between text-[8px] font-mono text-zinc-400">
                      <div className="flex items-center gap-2">
                        {cust.hasPendingDeliveries && (
                          <span className="flex items-center gap-0.5 text-brand-gold">
                            <span className="w-1 h-1 bg-brand-gold rounded-full inline-block"></span>
                            PENDING DELIVERY
                          </span>
                        )}
                        {cust.trialScheduled && (
                          <span className="text-[#4F5D2F] font-bold font-mono">
                            ● TRIAL {cust.trialDate ? cust.trialDate.slice(5) : ""}
                          </span>
                        )}
                      </div>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCustomer(cust.id);
                        }}
                        title="Delete Portfolio"
                        className="text-zinc-300 hover:text-red-600 transition p-0.5"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                  </div>
                );
              })
            )}
          </div>

        </aside>

        {/* ======================================================== */}
        {/* COLUMN 3: RIGHT-MOST DETAIL WORKSPACE (EXPANDED FLEX)    */}
        {/* ======================================================== */}
        <main className="flex-1 bg-[#FDFBF7] overflow-y-auto flex flex-col">
          
          {/* TAB CONTENT A: CUSTOMER PROFILE DIRECTORY HUB */}
          {activeTab === "customers" && activeCustomer && (
            <div className="p-6 space-y-8 animate-fadeIn text-left">
              
              {/* Profile Card Summary Banner Header */}
              <div className="bg-[#F5F2EB] border border-[#E5DECE] p-6 rounded-2xl relative shadow-xs text-left">
                <div className="flex justify-between items-start flex-wrap gap-4">
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-[#8B6B3F] font-bold uppercase tracking-widest block">
                      ❖ ACTIVE ATELIER PORTFOLIO
                    </span>
                    <h2 className="font-serif text-3xl font-black text-[#1B1A18]">
                      {activeCustomer.name}
                    </h2>
                    
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-[#5E584E] font-medium pt-1">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-[#8B6B3F]" />
                        <span>{activeCustomer.phone}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#8B6B3F]" />
                        <span>{activeCustomer.address}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowSizingReceipt(true)}
                      className="px-4 py-2 border border-[#8B6B3F] hover:bg-[#8B6B3F] text-[#8B6B3F] hover:text-white rounded text-xs font-mono font-bold uppercase transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Ruler className="w-3.5 h-3.5" />
                      <span>Sizing Ticket</span>
                    </button>

                    <button
                      onClick={() => setShowInvoiceReceipt(true)}
                      className="px-4 py-2 bg-[#8B6B3F] hover:bg-[#5E584E] text-white rounded text-xs font-mono font-bold uppercase transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Invoice Slip</span>
                    </button>
                  </div>
                </div>

                {/* Sub features indicators toolbar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-6 pt-4 border-t border-[#E5DECE] text-xs font-mono">
                  
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      checked={activeCustomer.hasPendingDeliveries}
                      onChange={async (e) => {
                        const val = e.target.checked;
                        setCustomers(customers.map(c => c.id === activeCustomer.id ? { ...c, hasPendingDeliveries: val } : c));
                        if (user) await updateDoc(doc(db, "users", user.uid, "customers", activeCustomer.id), { hasPendingDeliveries: val });
                      }}
                      className="rounded border-[#E5DECE] text-[#8B6B3F] focus:ring-[#8B6B3F] w-4 h-4"
                    />
                    <span className="text-[#5E584E] font-bold">Has Pending Delivery</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      checked={activeCustomer.trialScheduled}
                      onChange={async (e) => {
                        const val = e.target.checked;
                        setCustomers(customers.map(c => c.id === activeCustomer.id ? { ...c, trialScheduled: val, trialDate: "2026-06-28" } : c));
                        if (user) await updateDoc(doc(db, "users", user.uid, "customers", activeCustomer.id), { trialScheduled: val, trialDate: "2026-06-28" });
                      }}
                      className="rounded border-[#E5DECE] text-[#8B6B3F] focus:ring-[#8B6B3F] w-4 h-4"
                    />
                    <span className="text-[#5E584E] font-bold">Trial Fitting Setup</span>
                  </label>

                  {/* High visibility debt outstanding notification */}
                  <div className="flex items-center justify-end">
                    {customerLedgerSummary.balanceDue > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-[#912F1B]/10 text-[#912F1B] border border-[#912F1B]/35 px-2.5 py-1 rounded font-bold animate-pulse">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        DEBT OUTSTANDING: ${customerLedgerSummary.balanceDue}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-[#4F5D2F]/10 text-[#4F5D2F] border border-[#4F5D2F]/30 px-2.5 py-1 rounded font-bold">
                        <CheckCircle className="w-3.5 h-3.5" />
                        ACCOUNT PAID FULL
                      </span>
                    )}
                  </div>

                </div>
              </div>

              {/* TWO SIDES CONTAINER: LEFT SIZING GRID VS RIGHT ACTIVE LEDGER TRANSACTIONS */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                
                {/* LEFT: SIZING RECORD CARD & STYLE SELECTORS */}
                <div className="xl:col-span-7 bg-white border border-[#E5DECE] p-6 rounded-2xl relative shadow-xs">
                  
                  {/* Select active template */}
                  <div className="flex justify-between items-center mb-6 pb-3 border-b border-[#E5DECE]">
                    <div className="flex items-center gap-1.5">
                      <Ruler className="text-[#8B6B3F] w-4.5 h-4.5" />
                      <span className="font-serif font-bold text-base text-[#1B1A18]">
                        Measurements & Style Demands
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-zinc-400">TEMPLATE:</span>
                      <select
                        value={activeCustomer.activeTemplateId}
                        onChange={async (e) => {
                          const val = e.target.value;
                          setCustomers(customers.map(c => c.id === activeCustomer.id ? { ...c, activeTemplateId: val } : c));
                          if (user) await updateDoc(doc(db, "users", user.uid, "customers", activeCustomer.id), { activeTemplateId: val });
                          triggerToast(`Switched active custom template!`);
                        }}
                        className="text-xs font-mono font-bold py-1 px-2 border border-[#E5DECE] bg-white rounded focus:ring-1 focus:ring-[#8B6B3F]"
                      >
                        {SIZING_TEMPLATES.map(t => (
                          <option key={t.id} value={t.id}>{t.name.toUpperCase()}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* DOUBLE-GRID CONFIGURATION */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 leading-none">
                    
                    {/* LEFT GRID: MEASUREMENTS (minimised vertical padding inputs) */}
                    <div className="space-y-3.5 text-left">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#8B6B3F] block border-b pb-1.5 border-[#E5DECE]">
                        ✦ DRAPE COORDINATES (INCHES)
                      </span>

                      {/* Display template specific fields */}
                      <div className="space-y-2">
                        {SIZING_TEMPLATES.find(t => t.id === activeCustomer.activeTemplateId)?.fields.map((field) => (
                          <div key={field.name} className="flex justify-between items-center text-xs">
                            <span className="font-sans font-medium text-zinc-500">
                              {field.label}
                            </span>
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={activeCustomer.measurements[field.name] || ""}
                                onChange={(e) => handleMeasurementChange(field.name, e.target.value)}
                                className="w-16 p-1 text-center font-mono font-bold bg-[#F5F2EB]/40 border border-[#E5DECE] rounded focus:ring-1 focus:ring-[#8B6B3F] text-xs"
                              />
                              <span className="text-[10px] text-zinc-400 font-mono">"</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* RIGHT GRID: STYLE DEMANDS SELECTION */}
                    <div className="space-y-4 text-left">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#8B6B3F] block border-b pb-1.5 border-[#E5DECE]">
                        ✦ FIT & DESIGNS demand
                      </span>

                      <div className="space-y-3 font-sans text-xs">
                        {Object.entries(STYLE_OPTIONS).map(([key, item]) => {
                          return (
                            <div key={key} className="space-y-1">
                              <label className="text-[10px] font-mono text-zinc-400 uppercase block">
                                {item.labelUrdu}
                              </label>
                              <select
                                value={activeCustomer.styleSelections[key] || ""}
                                onChange={(e) => handleStyleChange(key, e.target.value)}
                                className="w-full text-xs py-1 px-2 border border-[#E5DECE] bg-white rounded font-sans outline-none focus:ring-1 focus:ring-[#8B6B3F]"
                              >
                                <option value="">-- No customization --</option>
                                {item.options.map(option => (
                                  <option key={option} value={option}>{option}</option>
                                ))}
                              </select>
                            </div>
                          );
                        })}
                      </div>

                    </div>

                  </div>

                </div>

                {/* RIGHT: LEDGER ACCOUNT & INVOICE STATEMENTS */}
                <div className="xl:col-span-5 space-y-6 text-left">
                  
                  {/* Quick Form logger */}
                  <div className="bg-white border border-[#E5DECE] p-5 rounded-2xl relative shadow-xs text-left">
                    <span className="text-[10px] font-mono text-[#8B6B3F] font-bold uppercase block tracking-wider mb-3">
                      ✍ LOG LEDGER FEE / CREDIT ADVANCE
                    </span>

                    <form onSubmit={handleAddLedgerEntry} className="space-y-3.5">
                      <div>
                        <label className="block text-[9px] font-mono text-zinc-400 mb-1">Garment item or Material Description</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Traditional Suit sewing"
                          value={invoiceDesc}
                          onChange={(e) => setInvoiceDesc(e.target.value)}
                          className="w-full text-xs p-2 border border-[#E5DECE] rounded"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] font-mono text-zinc-400 mb-1">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            value={invoiceQty}
                            onChange={(e) => setInvoiceQty(Number(e.target.value))}
                            className="w-full text-xs p-2 border border-[#E5DECE] rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-mono text-zinc-400 mb-1">Unit Price ($)</label>
                          <input
                            type="number"
                            min="1"
                            value={invoicePrice}
                            onChange={(e) => setInvoicePrice(Number(e.target.value))}
                            className="w-full text-xs p-2 border border-[#E5DECE] rounded font-mono"
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-1.5">
                        <label className="flex items-center gap-2 cursor-pointer text-xs select-none">
                          <input
                            type="checkbox"
                            checked={isAdvance}
                            onChange={(e) => setIsAdvance(e.target.checked)}
                            className="rounded border-[#E5DECE] text-[#8B6B3F] focus:ring-[#8B6B3F] w-4 h-4"
                          />
                          <span className="font-mono text-[10px] text-[#8B6B3F] font-bold uppercase">
                            Is Financial Advance / Deposit
                          </span>
                        </label>

                        <button
                          type="submit"
                          className="px-4 py-2 bg-[#8B6B3F] hover:bg-[#1B1A18] text-[#FCFAF2] rounded text-[11px] font-mono font-bold uppercase transition block"
                        >
                          Log Entry
                        </button>
                      </div>

                    </form>
                  </div>

                  {/* Transaction Statement ledger */}
                  <div className="bg-white border border-[#E5DECE] p-5 rounded-2xl relative shadow-xs">
                    <span className="text-[10px] font-mono text-[#8B6B3F] font-bold uppercase tracking-wider block mb-3 border-b border-[#E5DECE] pb-2">
                      ❖ CUSTOMER LEDGER STATEMENT
                    </span>

                    <div className="space-y-2 overflow-y-auto max-h-[220px] pr-1">
                      {activeCustomer.ledger.length === 0 ? (
                        <div className="text-center py-6 text-zinc-400 italic text-xs font-serif">
                          No logging entries on balance paper yet.
                        </div>
                      ) : (
                        activeCustomer.ledger.map((entry) => (
                          <div key={entry.id} className="bg-[#FDFBF7] p-2.5 rounded border border-[#E5DECE] flex justify-between items-center text-xs">
                            <div className="text-left font-sans">
                              <div className="font-bold text-[#1B1A18]">{entry.description}</div>
                              <span className="text-[9px] text-zinc-400 font-mono">
                                {entry.date} • Qty {entry.qty} x ${entry.unitPrice} 
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`font-mono font-bold ${entry.creditAdvance ? "text-[#4F5D2F]" : "text-[#912F1B]"}`}>
                                {entry.creditAdvance ? "-" : "+"}${entry.qty * entry.unitPrice}
                              </span>
                              <button
                                onClick={() => handleDeleteLedgerEntry(entry.id)}
                                className="text-zinc-300 hover:text-red-500 transition p-0.5"
                                title="Void Entry"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-[#E5DECE] space-y-2 font-mono text-xs">
                      <div className="flex justify-between text-zinc-500">
                        <span>Sartorial Charges Sum:</span>
                        <span>${customerLedgerSummary.totalCharges}</span>
                      </div>
                      <div className="flex justify-between text-[#4F5D2F] font-bold">
                        <span>Advance Payments Handed:</span>
                        <span>-${customerLedgerSummary.totalAdvances}</span>
                      </div>
                      <div className="flex justify-between text-[#1B1A18] font-bold border-t border-dashed border-[#E5DECE] pt-1.5 text-sm">
                        <span>Current Studio Debt due:</span>
                        <span className={customerLedgerSummary.balanceDue > 0 ? "text-[#912F1B] font-black" : "text-[#4F5D2F] font-black"}>
                          ${customerLedgerSummary.balanceDue}
                        </span>
                      </div>
                    </div>

                  </div>

                </div>

              </div>

            </div>
          )}

          {/* TAB CONTENT B: BASELINE SIZING TEMPLATES DIRECTORY */}
          {activeTab === "templates" && (
            <div className="p-6 space-y-6 text-left max-w-4xl animate-fadeIn">
              <span className="text-xs uppercase font-mono text-[#8B6B3F] font-bold tracking-widest block">
                ❖ ATELIER SIZING LAYOUT TEMPLATES
              </span>
              <h2 className="font-serif text-3xl font-black text-[#1B1A18]">
                Configure Customized Styling Blueprints
              </h2>
              <p className="text-sm text-zinc-600 max-w-2xl leading-relaxed">
                Different traditional and classic apparel shapes need dedicated measurement coordinates. Switch here to review active master guides or add tailor specification properties seamlessly.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {SIZING_TEMPLATES.map((tpl) => (
                  <div key={tpl.id} className="bg-white border border-[#E5DECE] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-serif font-black text-lg text-[#8B6B3F]">{tpl.name}</h4>
                        <span className="text-[9px] font-mono bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded font-bold uppercase">
                          {tpl.fields.length} parameters
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 mb-4 font-sans leading-relaxed">{tpl.description}</p>
                      
                      <div className="border-t border-[#E5DECE] pt-3 space-y-1.5">
                        {tpl.fields.slice(0, 4).map((f) => (
                          <div key={f.name} className="flex justify-between items-center text-[11px] font-mono text-zinc-500">
                            <span>{f.label}</span>
                            <span className="font-extrabold text-zinc-700">{f.value}" (Standard)</span>
                          </div>
                        ))}
                        {tpl.fields.length > 4 && (
                          <div className="text-[10px] text-zinc-400 font-mono italic pt-1">
                            + {tpl.fields.length - 4} additional parameters tracked
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB CONTENT C: STAFF WAGES HUB */}
          {activeTab === "wages" && (
            <div className="p-6 space-y-8 text-left animate-fadeIn">
              
              <div className="space-y-2">
                <span className="text-xs uppercase font-mono text-[#8B6B3F] font-bold tracking-widest block">
                  ❖ WORKSHOP LABOUR STATUS REGISTER
                </span>
                <h2 className="font-serif text-3xl font-black text-[#1B1A18]">
                  Piece-Rate Workspace Payout Statements
                </h2>
                <p className="text-sm text-zinc-600 max-w-2xl leading-relaxed">
                  Avoid ledger book handwriting scraps. Record piece-work completed on jackets, trouser waistbands, cuffs, and buttonholes with instant clear buttons producing printable pay vouchers.
                </p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                
                {/* Enlist Helper Form & Work task logger */}
                <div className="xl:col-span-4 space-y-6 text-left">
                  
                  {/* Form 1: Add staff */}
                  <div className="bg-white border border-[#E5DECE] p-5 rounded-2xl shadow-xs">
                    <span className="text-[10px] font-mono text-[#8B6B3F] font-bold uppercase block tracking-wider mb-3">
                      ✍ ENROLL NEW HELPER / MASTER TAILOR
                    </span>

                    <form onSubmit={handleAddStaffMember} className="space-y-3.5">
                      <div>
                        <label className="block text-[9px] font-mono text-zinc-400 mb-1">Tailor / Artisan Name</label>
                        <input
                          type="text"
                          required
                          value={newStaffName}
                          onChange={(e) => setNewStaffName(e.target.value)}
                          placeholder="e.g. Master Edwin Miller"
                          className="w-full text-xs p-2 border border-[#E5DECE] rounded bg-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] font-mono text-zinc-400 mb-1">Role Type</label>
                          <select
                            value={newStaffRole}
                            onChange={(e) => setNewStaffRole(e.target.value)}
                            className="w-full text-xs p-2 border border-[#E5DECE] rounded bg-white"
                          >
                            <option value="Cutter">Master Cutter</option>
                            <option value="Sewer">Specialist Tailor</option>
                            <option value="Detailer">Button Artisan</option>
                            <option value="Helper">General Helper</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[9px] font-mono text-zinc-400 mb-1">Stitch piece-rate ($)</label>
                          <input
                            type="number"
                            value={newStaffRate}
                            onChange={(e) => setNewStaffRate(Number(e.target.value))}
                            className="w-full text-xs p-2 border border-[#E5DECE] rounded bg-white font-mono"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-[#8B6B3F] hover:bg-[#1B1A18] text-[#FCFAF2] rounded text-xs font-mono font-bold uppercase transition"
                      >
                        Enroll Artisan Portfolio
                      </button>
                    </form>
                  </div>

                  {/* Form 2: Log Completed Piecework */}
                  <div className="bg-white border border-[#E5DECE] p-5 rounded-2xl shadow-xs">
                    <span className="text-[10px] font-mono text-[#8B6B3F] font-bold uppercase block tracking-wider mb-3">
                      ✍ RECORD COMPLETED PIECE WORK
                    </span>

                    <form onSubmit={handleLogStaffWork} className="space-y-3.5">
                      <div>
                        <label className="block text-[9px] font-mono text-zinc-400 mb-1">Artisan</label>
                        <select
                          required
                          value={selectedStaffId}
                          onChange={(e) => setSelectedStaffId(e.target.value)}
                          className="w-full text-xs p-2.5 border border-[#E5DECE] rounded bg-white"
                        >
                          <option value="">-- Choose Artisan --</option>
                          {staff.map(s => (
                            <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9px] font-mono text-zinc-400 mb-1">Description (e.g., custom trousers stitch)</label>
                        <input
                          type="text"
                          required
                          value={workTaskDesc}
                          onChange={(e) => setWorkTaskDesc(e.target.value)}
                          className="w-full text-xs p-2 border border-[#E5DECE] rounded bg-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3 items-end">
                        <div>
                          <label className="block text-[9px] font-mono text-[#1B1A18] mb-1">Garments Qty</label>
                          <input
                            type="number"
                            min="1"
                            value={workTaskQty}
                            onChange={(e) => setWorkTaskQty(Number(e.target.value))}
                            className="w-full text-xs p-2 border border-[#E5DECE] rounded bg-white font-mono"
                          />
                        </div>
                        <button
                          type="submit"
                          className="py-2.5 bg-[#8B6B3F] hover:bg-brand-charcoal text-[#FCFAF2] rounded text-xs font-mono font-bold uppercase transition w-full"
                        >
                          Log Work Task
                        </button>
                      </div>
                    </form>
                  </div>

                </div>

                {/* Staff directory overview grid */}
                <div className="xl:col-span-8 space-y-4">
                  
                  {staff.length === 0 ? (
                    <div className="bg-white border border-[#E5DECE] rounded-2xl p-8 text-center italic text-zinc-450 text-xs font-serif">
                      No workshop employees logged yet. Enroll workers on the left panel!
                    </div>
                  ) : (
                    staff.map((artisan) => {
                      const completedSum = artisan.completedTasks.reduce((sum, t) => sum + t.payout, 0);
                      const currentBalance = completedSum - artisan.advancesPaid;

                      return (
                        <div key={artisan.id} className="bg-white border border-[#E5DECE] p-6 rounded-2xl shadow-xs text-left">
                          <div className="flex justify-between items-start flex-wrap gap-4 border-b border-[#E5DECE] pb-3 mb-4">
                            <div>
                              <h4 className="font-serif font-bold text-lg text-[#1B1A18]">{artisan.name}</h4>
                              <p className="text-[10px] text-zinc-400 font-mono uppercase mt-0.5">
                                {artisan.role} • Piece-rate: ${artisan.pieceRate} / finished product
                              </p>
                            </div>

                            <div className="flex gap-4 text-xs font-mono text-right">
                              <div>
                                <span className="block text-[9px] text-zinc-400">CREDIT EARNED</span>
                                <span className="font-bold text-[#1B1A18]">${completedSum}</span>
                              </div>
                              <div>
                                <span className="block text-[9px] text-zinc-400">ADVANCE DRAWN</span>
                                <span className="font-bold text-[#912F1B]">-${artisan.advancesPaid}</span>
                              </div>
                              <div className="pl-3 border-l border-[#E5DECE]">
                                <span className="block text-[9px] text-[#8B6B3F] font-bold">NET BAL DUE</span>
                                <span className={`font-black text-sm ${currentBalance > 0 ? "text-[#4F5D2F]" : "text-zinc-600"}`}>
                                  ${currentBalance}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Completed tasks inside */}
                          {artisan.completedTasks.length > 0 && (
                            <div className="space-y-1.5 mb-4 max-h-[140px] overflow-y-auto">
                              <span className="text-[8px] font-mono text-zinc-400 uppercase tracking-widest block">COMPLETED TALLY CHECKS</span>
                              {artisan.completedTasks.map((t) => (
                                <div key={t.id} className="flex justify-between items-center text-[11px] font-mono py-1 border-b border-zinc-100 last:border-0">
                                  <span className="text-zinc-700">{t.task}</span>
                                  <div className="flex gap-4">
                                    <span className="text-zinc-400 font-normal">{t.date}</span>
                                    <strong className="text-[#4F5D2F]">${t.payout}</strong>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Quick interactions */}
                          <div className="flex justify-end gap-3 items-center border-t border-dashed border-[#E5DECE] pt-3 text-xs">
                            
                            <span className="text-[10px] text-zinc-400 font-mono">Quick Settlement Advance:</span>
                            
                            <button
                              onClick={() => {
                                const val = prompt("Enter advance sum to hand out ($):");
                                if (val) handlePayStaffAdvance(artisan.id, Number(val));
                              }}
                              className="px-3 py-1 bg-[#F5F2EB] hover:bg-[#E5DECE] text-[#5E584E] rounded border border-[#E5DECE] font-mono font-bold text-[10px] uppercase transition cursor-pointer"
                            >
                              Log Advance Payment
                            </button>

                            <button
                              onClick={() => handleResetEmployeeLedger(artisan.id)}
                              disabled={currentBalance <= 0}
                              className={`px-3 py-1 font-mono font-bold text-[10px] uppercase transition rounded cursor-pointer ${
                                currentBalance > 0
                                  ? "bg-[#4F5D2F]/10 border border-[#4F5D2F]/20 text-[#4F5D2F] hover:bg-[#4F5D2F]/20"
                                  : "bg-zinc-100 text-zinc-300 border border-zinc-200 cursor-not-allowed"
                              }`}
                            >
                              Pay Off Outstanding Balance
                            </button>

                          </div>

                        </div>
                      );
                    })
                  )}

                </div>

              </div>

            </div>
          )}

          {/* TAB CONTENT D: SETTINGS & BACKUP ACTIONS */}
          {activeTab === "settings" && (
            <div className="p-6 space-y-6 text-left max-w-2xl animate-fadeIn">
              <span className="text-xs uppercase font-mono text-[#8B6B3F] font-bold tracking-widest block">
                ❖ ATELIER DIGITAL BACKUPS
              </span>
              <h2 className="font-serif text-3xl font-black text-[#1B1A18]">
                Enterprise Storage Compliance
              </h2>
              <p className="text-sm text-zinc-650 leading-relaxed font-sans font-medium">
                Sartorial master coordinates and accounting statements represent decades of high fidelity tailoring values and customer loyalty lists. Keep full secure copy dossiers on your workstation.
              </p>

              <div className="bg-white border border-[#E5DECE] p-6 rounded-2xl relative shadow-xs text-left space-y-5">
                
                <div className="space-y-1">
                  <h4 className="font-serif font-black text-base text-[#1B1A18]">Sovereign Local Backups (Offline-First)</h4>
                  <p className="text-xs text-zinc-550 leading-normal">
                    Download full archive snapshots of your atelier customer sizing directories, styling records, and invoice lists. These files are encrypted locally and are completely read/write compatible.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={exportBackupDetails}
                    className="px-5 py-3 bg-[#8B6B3F] hover:bg-[#1B1A18] text-[#FCFAF2] rounded text-xs font-mono font-bold uppercase transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download JSON Backup Archive</span>
                  </button>

                  <button
                    onClick={() => {
                      const uploadField = document.createElement("input");
                      uploadField.type = "file";
                      uploadField.accept = "application/json";
                      uploadField.onchange = (e: any) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = async (event: any) => {
                          try {
                            const data = JSON.parse(event.target.result);
                            if (data.customers) {
                              setCustomers(data.customers);
                              if (data.staff) setStaff(data.staff);
                              triggerToast("Successfully merged client database records!");
                            } else {
                              triggerToast("Invalid schema profile!");
                            }
                          } catch (_) {
                            triggerToast("JSON backup parsing failed!");
                          }
                        };
                        reader.readAsText(file);
                      };
                      uploadField.click();
                    }}
                    className="px-5 py-3 border border-[#8B6B3F] hover:bg-[#8B6B3F] hover:text-white text-[#8B6B3F] rounded text-xs font-mono font-bold uppercase transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Database className="w-4 h-4" />
                    <span>Upload & Restore Backup JSON</span>
                  </button>
                </div>

                <div className="pt-4 border-t border-[#E5DECE] text-[11px] font-mono text-zinc-500 leading-normal">
                  💡 <strong>Tip:</strong> TailorShopManager utilizes a secure server sandbox. Setting up <em>Google Cloud Synchronization</em> automatically backs up customer ledger cards seamlessly.
                </div>

              </div>

            </div>
          )}

        </main>

      </div>

      {/* ======================================================== */}
      {/* MODAL OVERLAY 1: PRINTABLE INVOICE STATEMENT SLIP        */}
      {/* ======================================================== */}
      {showInvoiceReceipt && activeCustomer && (
        <div 
          className="fixed inset-0 z-50 bg-[#1B1A18]/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowInvoiceReceipt(false)}
        >
          <div 
            className="bg-white border-2 border-[#8B6B3F] rounded-xl p-6 sm:p-8 max-w-sm w-full relative shadow-2xl animate-scaleIn text-left font-mono text-xs text-[#1B1A18]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button 
              onClick={() => setShowInvoiceReceipt(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-[#1B1A18]"
            >
              ×
            </button>

            {/* Thermal layout style receipt wrapper */}
            <div id="thermal-invoice-slip-pane" className="space-y-4">
              <div className="text-center font-serif">
                <span className="font-serif text-lg tracking-tight font-black uppercase text-[#1B1A18] block">
                  TAILORSHOPMANAGER
                </span>
                <span className="text-[8px] font-mono tracking-widest text-[#8B6B3F] uppercase block leading-none pt-0.5">
                  Est. 2026 Studio Docket
                </span>
              </div>

              <div className="border-t border-[#8B6B3F] border-dashed pt-2.5 flex justify-between text-[9px] text-zinc-500 font-mono">
                <span>SLIP ID: #AM-IV-{selectedCustomerId.slice(-4).toUpperCase()}</span>
                <span>DATE: {new Date().toLocaleDateString()}</span>
              </div>

              <div className="space-y-1 pt-1 font-sans">
                <div className="text-[10px] text-zinc-400 uppercase font-mono">Client Details:</div>
                <div className="font-bold text-sm text-[#1B1A18]">{activeCustomer.name}</div>
                <div className="text-[11px] text-zinc-500">{activeCustomer.phone}</div>
                <div className="text-[11px] text-[#5E584E] leading-tight">{activeCustomer.address}</div>
              </div>

              {/* Transactions grid */}
              <div className="border-t border-[#8B6B3F] border-dashed pt-3">
                <span className="text-[9px] text-[#8B6B3F] font-bold block uppercase mb-1.5 font-mono">
                  ITEM BILLING SPECIFICATIONS
                </span>
                
                <table className="w-full text-left font-mono text-[10px]">
                  <thead>
                    <tr className="border-b border-zinc-200 text-zinc-400 text-[9px]">
                      <th className="pb-1 uppercase">Desc</th>
                      <th className="pb-1 text-center">Qty</th>
                      <th className="pb-1 text-right">Sum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeCustomer.ledger.map((ent) => (
                      <tr key={ent.id} className="border-b border-zinc-100 last:border-0">
                        <td className="py-1.5 font-sans leading-tight">
                          {ent.description}
                          {ent.creditAdvance && <span className="text-[8px] text-[#4F5D2F] font-mono block">(Advance Deposit)</span>}
                        </td>
                        <td className="py-1.5 text-center font-bold">x{ent.qty}</td>
                        <td className="py-1.5 text-right font-bold text-zinc-800">
                          {ent.creditAdvance ? "-" : ""}${ent.qty * ent.unitPrice}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Outward totals */}
              <div className="border-t border-brand-gold/20 pt-3.5 space-y-1.5 font-mono text-[10px] text-zinc-500">
                <div className="flex justify-between">
                  <span>Gross Tailoring Charges:</span>
                  <span>${customerLedgerSummary.totalCharges}</span>
                </div>
                <div className="flex justify-between text-[#4F5D2F] font-bold">
                  <span>Total Deposits on Hand:</span>
                  <span>-${customerLedgerSummary.totalAdvances}</span>
                </div>
                <div className="flex justify-between text-[#1B1A18] font-black border-t border-dashed border-[#8B6B3F]/40 pt-2 text-xs">
                  <span>BALANCE OUTSTANDING DUE:</span>
                  <span className="text-right text-red-700">${customerLedgerSummary.balanceDue}</span>
                </div>
              </div>

              <div className="text-center text-[9px] text-zinc-400 pt-3 border-t border-zinc-100 uppercase">
                *** secure offline invoice receipt ***
              </div>
            </div>

            {/* Utility actions */}
            <div className="grid grid-cols-2 gap-2 mt-6 pt-4 border-t border-[#E5DECE]">
              <button
                onClick={() => {
                  try {
                    const printable = `
========================================
TAILORSHOPMANAGER STUDIO STATEMENT
Customer: ${activeCustomer.name}
Phone: ${activeCustomer.phone}
Date: ${new Date().toLocaleDateString()}
----------------------------------------
Charges: $${customerLedgerSummary.totalCharges}
Deposits: $${customerLedgerSummary.totalAdvances}
Outstanding Balance: $${customerLedgerSummary.balanceDue}
----------------------------------------
Sovereign client registry summary
                    `;
                    navigator.clipboard.writeText(printable);
                    triggerToast("Invoice plain-text copied!");
                  } catch (_) {}
                }}
                className="py-2 border border-[#8B6B3F] text-[#8B6B3F] hover:bg-[#8B6B3F] hover:text-white rounded text-[10px] uppercase font-bold tracking-wider text-center cursor-pointer transition"
              >
                Copy Text
              </button>
              
              <button
                onClick={() => {
                  window.print();
                }}
                className="py-2 bg-[#8B6B3F] hover:bg-[#5E584E] text-white rounded text-[10px] uppercase font-bold tracking-wider text-center cursor-pointer transition shadow-sm"
              >
                Print Slip
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL OVERLAY 2: PRINTABLE SIZING MEASUREMENT CARD      */}
      {/* ======================================================== */}
      {showSizingReceipt && activeCustomer && (
        <div 
          className="fixed inset-0 z-50 bg-[#1B1A18]/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowSizingReceipt(false)}
        >
          <div 
            className="bg-white border-2 border-[#8B6B3F] rounded-xl p-6 sm:p-8 max-w-sm w-full relative shadow-2xl animate-scaleIn text-left font-mono text-xs text-[#1B1A18]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button 
              onClick={() => setShowSizingReceipt(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-[#1B1A18]"
            >
              ×
            </button>

            {/* Sizing sheet thermal receipt style container */}
            <div id="thermal-sizing-slip-pane" className="space-y-4">
              <div className="text-center font-serif">
                <span className="font-serif text-lg tracking-tight font-black uppercase text-[#1B1A18] block">
                  TAILORSHOPMANAGER
                </span>
                <span className="text-[8px] font-mono tracking-widest text-[#8B6B3F] uppercase block leading-none">
                  BIOMETRIC CO-ORDINATES DOCKET
                </span>
              </div>

              <div className="border-t border-[#8B6B3F] border-dashed pt-2.5 flex justify-between text-[9px] text-zinc-500 font-mono">
                <span>DOCKET TYPE: {activeCustomer.activeTemplateId.toUpperCase()}</span>
                <span>DATE: {new Date().toLocaleDateString()}</span>
              </div>

              <div className="space-y-1 pt-1 font-sans">
                <div className="text-[10px] text-zinc-400 uppercase font-mono">Client Details:</div>
                <div className="font-bold text-sm text-[#1B1A18]">{activeCustomer.name}</div>
                <div className="text-[11px] text-zinc-500">{activeCustomer.phone}</div>
              </div>

              {/* Sizing grid list */}
              <div className="border-t border-[#8B6B3F] border-dashed pt-3">
                <span className="text-[9px] text-[#8B6B3F] font-bold block uppercase mb-2 font-mono">
                  Sizing parameters
                </span>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                  {Object.entries(activeCustomer.measurements).map(([key, val]) => (
                    <div key={key} className="flex justify-between border-b border-zinc-100 py-1 font-mono">
                      <span className="text-[10px] uppercase text-zinc-500">{key.replace('_', ' ')}</span>
                      <strong className="text-zinc-800">{val}"</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected design patterns */}
              {Object.keys(activeCustomer.styleSelections).length > 0 && (
                <div className="border-t border-zinc-200 pt-3">
                  <span className="text-[9px] text-[#8B6B3F] font-bold block uppercase mb-2 font-mono">
                    DESIGN STYLING DEMANDS
                  </span>
                  
                  <div className="space-y-1.5 font-sans text-[11px]">
                    {Object.entries(activeCustomer.styleSelections).map(([key, val]) => (
                      <div key={key} className="flex justify-between text-zinc-600 border-b border-zinc-50 last:border-0 pb-1">
                        <span className="uppercase font-mono text-[9px] text-zinc-400">{key}:</span>
                        <span className="text-right font-medium text-zinc-800 leading-tight">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-center text-[9px] text-zinc-400 pt-3 border-t border-zinc-100 uppercase">
                *** verified bespoke master coordinates ***
              </div>
            </div>

            {/* Utility actions */}
            <div className="grid grid-cols-2 gap-2 mt-6 pt-4 border-t border-[#E5DECE]">
              <button
                onClick={() => {
                  try {
                    const textLines = Object.entries(activeCustomer.measurements)
                      .map(([key, val]) => `• ${key.toUpperCase()}: ${val}"`)
                      .join("\n");
                    const styleLines = Object.entries(activeCustomer.styleSelections)
                      .map(([key, val]) => `• ${key.toUpperCase()}: ${val}`)
                      .join("\n");
                    const printable = `
========================================
TAILORSHOPMANAGER SIZING TICKET
Customer: ${activeCustomer.name}
Template: ${activeCustomer.activeTemplateId.toUpperCase()}
Date: ${new Date().toLocaleDateString()}
----------------------------------------
MEASUREMENTS:
${textLines}
----------------------------------------
STYLING DEMANDS:
${styleLines}
========================================
                    `;
                    navigator.clipboard.writeText(printable);
                    triggerToast("Sizing ticket plain-text copied!");
                  } catch (_) {}
                }}
                className="py-2 border border-[#8B6B3F] text-[#8B6B3F] hover:bg-[#8B6B3F] hover:text-white rounded text-[10px] uppercase font-bold tracking-wider text-center cursor-pointer transition"
              >
                Copy Text
              </button>
              
              <button
                onClick={() => {
                  window.print();
                }}
                className="py-2 bg-[#8B6B3F] hover:bg-[#5E584E] text-white rounded text-[10px] uppercase font-bold tracking-wider text-center cursor-pointer transition shadow-sm"
              >
                Print Ticket
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL OVERLAY 3: ADD CUSTOMER PORTFOLIO FORM             */}
      {/* ======================================================== */}
      {showAddCustModal && (
        <div 
          className="fixed inset-0 z-50 bg-[#1B1A18]/65 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowAddCustModal(false)}
        >
          <div 
            className="bg-white border-2 border-[#8B6B3F] rounded-xl p-6 sm:p-8 max-w-md w-full relative shadow-2xl text-left animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button 
              onClick={() => setShowAddCustModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-[#1B1A18] font-bold text-lg"
            >
              ×
            </button>

            <div className="text-left mb-6 border-b pb-4 border-[#E5DECE]">
              <span className="text-[10px] uppercase font-mono text-[#8B6B3F] font-bold tracking-widest block mb-1">
                ❖ ATELIER PORTFOLIO REGISTRATION
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#1B1A18]">
                Enroll New Client Profile
              </h3>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1.5 font-bold">
                  Full Customer Name (English / Latin character format)
                </label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Sir Reginald Sterling"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-[#FDFBF7] border border-[#E5DECE] rounded focus:ring-1 focus:ring-[#8B6B3F] outline-none text-[#1B1A18]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1.5 font-bold">
                    Primary Contact Phone
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. +1 (555) 543-2109"
                    value={newCustPhone}
                    onChange={(e) => setNewCustPhone(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-[#FDFBF7] border border-[#E5DECE] rounded focus:ring-1 focus:ring-[#8B6B3F] outline-none text-[#1B1A18]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1.5 font-bold">
                    Boutique Location / Address
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g. Mayfair, London"
                    value={newCustAddress}
                    onChange={(e) => setNewCustAddress(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-[#FDFBF7] border border-[#E5DECE] rounded focus:ring-1 focus:ring-[#8B6B3F] outline-none text-[#1B1A18]"
                  />
                </div>
              </div>

              {/* Trigger */}
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddCustModal(false)}
                  className="px-4 py-2.5 border border-[#E5DECE] rounded text-xs font-bold uppercase hover:bg-zinc-50 cursor-pointer"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#8B6B3F] hover:bg-[#1B1A18] text-[#FCFAF2] rounded text-xs font-bold uppercase transition shadow-sm cursor-pointer"
                >
                  Create Portfolio Card
                </button>
              </div>
            </form>

            <div className="pt-4 border-t border-[#E5DECE] mt-5 text-[9px] font-mono text-center text-zinc-400">
              Biometric measurement record template will default automatically.
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
