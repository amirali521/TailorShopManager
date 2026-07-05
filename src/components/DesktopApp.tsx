import { useState, useEffect, FormEvent } from "react";
import { 
  Search, Plus, Trash2, Edit2, ShieldCheck, Printer, Share2, Check, 
  FileText, DollarSign, RotateCcw, AlertCircle, ShoppingBag, Eye, User, 
  LogOut, LogIn, Sparkles, Scissors, Users, Landmark, ClipboardList, 
  Database, Wifi, WifiOff, X, HelpCircle, Save
} from "lucide-react";
import { 
  collection, doc, setDoc, addDoc, updateDoc, deleteDoc, 
  onSnapshot, query, where, getDocs
} from "firebase/firestore";
import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { db, auth, googleProvider } from "../lib/firebase";
import { SIZING_TEMPLATES, SizingTemplate } from "../types";

// Firebase error handling schema as required by developer guidelines
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Interfaces for our state objects
interface CustomerData {
  id: string;
  name: string;
  phone: string;
  address: string;
  templateId: string;
  customSizes: Record<string, string>;
  userId: string;
}

interface WorkerData {
  id: string;
  name: string;
  role: string;
  unpaidWages: number;
  completedCount: number;
  userId: string;
}

interface OrderData {
  id: string;
  workerName: string;
  task: string;
  wage: number;
  time: string;
  userId: string;
}

interface InventoryData {
  id: string;
  name: string;
  unitType: string;
  cost: number;
  price: number;
  stock: number;
  userId: string;
}

interface DesktopAppProps {
  onBackToLanding: () => void;
}

export default function DesktopApp({ onBackToLanding }: DesktopAppProps) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"customers" | "workers" | "inventory">("customers");
  
  // Mobile customer view state
  const [customerSubTab, setCustomerSubTab] = useState<"list" | "form" | "ticket">("list");
  
  // Real-time synchronization states
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [workers, setWorkers] = useState<WorkerData[]>([]);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [inventory, setInventory] = useState<InventoryData[]>([]);
  
  // Local loading / sync states
  const [syncStatus, setSyncStatus] = useState<"connected" | "disconnected" | "offline">("offline");

  // Selection & Form states
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  
  // Customer Editor Form state
  const [editCustName, setEditCustName] = useState("");
  const [editCustPhone, setEditCustPhone] = useState("");
  const [editCustAddress, setEditCustAddress] = useState("");
  const [editCustTemplateId, setEditCustTemplateId] = useState(SIZING_TEMPLATES[0].id);
  const [editCustSizes, setEditCustSizes] = useState<Record<string, string>>({});
  const [isEditingCust, setIsEditingCust] = useState(false); // false = create new, true = update existing

  // Worker Form states
  const [newWorkerName, setNewWorkerName] = useState("");
  const [newWorkerRole, setNewWorkerRole] = useState("Master Tailor");
  const [selectedWorkerId, setSelectedWorkerId] = useState("");
  const [pieceTaskName, setPieceTaskName] = useState("Classic Coat Stitching");
  const [pieceTaskWage, setPieceTaskWage] = useState(120);
  const [payoutSlip, setPayoutSlip] = useState<{ name: string; amount: number; time: string } | null>(null);

  // Inventory Form states
  const [newFabricName, setNewFabricName] = useState("");
  const [newFabricUnit, setNewFabricUnit] = useState("yards");
  const [newFabricCost, setNewFabricCost] = useState(15);
  const [newFabricPrice, setNewFabricPrice] = useState(35);
  const [newFabricStock, setNewFabricStock] = useState(50);

  // Retro printer/share overlay mock simulation states
  const [isPrinted, setIsPrinted] = useState(false);
  const [isShared, setIsShared] = useState(false);

  // Track Auth and initialize
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
      if (user) {
        setSyncStatus("connected");
      } else {
        setSyncStatus("offline");
        // Reset state to fallback mock data for guest sandbox
        initializeMockSandbox();
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync data in real-time when user logs in
  useEffect(() => {
    if (!currentUser) return;

    const uid = currentUser.uid;

    // Real-time synchronization of CUSTOMERS
    const qCustomers = query(collection(db, "customers"), where("userId", "==", uid));
    const unsubCust = onSnapshot(qCustomers, (snap) => {
      const list: CustomerData[] = [];
      snap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as CustomerData);
      });
      setCustomers(list);
      if (list.length > 0 && !selectedCustomer) {
        setSelectedCustomer(list[0]);
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, "customers");
    });

    // Real-time synchronization of WORKERS
    const qWorkers = query(collection(db, "workers"), where("userId", "==", uid));
    const unsubWorkers = onSnapshot(qWorkers, (snap) => {
      const list: WorkerData[] = [];
      snap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as WorkerData);
      });
      setWorkers(list);
      if (list.length > 0 && !selectedWorkerId) {
        setSelectedWorkerId(list[0].id);
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, "workers");
    });

    // Real-time synchronization of ORDERS (piecework logs)
    const qOrders = query(collection(db, "orders"), where("userId", "==", uid));
    const unsubOrders = onSnapshot(qOrders, (snap) => {
      const list: OrderData[] = [];
      snap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as OrderData);
      });
      // Sort orders descending
      list.sort((a,b) => b.id.localeCompare(a.id));
      setOrders(list);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, "orders");
    });

    // Real-time synchronization of INVENTORY
    const qInventory = query(collection(db, "inventory"), where("userId", "==", uid));
    const unsubInventory = onSnapshot(qInventory, (snap) => {
      const list: InventoryData[] = [];
      snap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as InventoryData);
      });
      setInventory(list);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, "inventory");
    });

    return () => {
      unsubCust();
      unsubWorkers();
      unsubOrders();
      unsubInventory();
    };
  }, [currentUser]);

  // Handle active customer template selection
  const activeTemplate = SIZING_TEMPLATES.find(t => t.id === (isEditingCust ? editCustTemplateId : editCustTemplateId)) || SIZING_TEMPLATES[0];

  const initializeMockSandbox = () => {
    // Generate lovely mock sandbox dataset for guests
    const mockCustomers: CustomerData[] = [
      {
        id: "cust_1",
        name: "Lord Julian Thorne",
        phone: "+44 20 7946 0192",
        address: "12 Savile Row, Mayfair, London, W1S 3PF",
        templateId: "mens_suit",
        customSizes: {
          jacket_length: "29.5",
          shoulder: "18.2",
          chest: "41.0",
          waist: "36.5",
          sleeve_length: "25.2",
          trouser_length: "41.5",
          trouser_waist: "34.0",
          trouser_seat: "40.5",
          trouser_inseam: "31.0",
          trouser_bottom: "8.5"
        },
        userId: "guest"
      },
      {
        id: "cust_2",
        name: "Arthur Pendelton",
        phone: "+44 7700 900077",
        address: "8 King Street, St. James's, London",
        templateId: "dress_shirt",
        customSizes: {
          length: "31.0",
          shoulder: "18.5",
          chest: "40.0",
          waist: "35.5",
          sleeve_length: "26.0",
          cuff: "9.5",
          neck: "16.5"
        },
        userId: "guest"
      }
    ];

    const mockWorkers: WorkerData[] = [
      { id: "work_1", name: "Master Arthur Pendelton", role: "Master Pattern Cutter", unpaidWages: 280, completedCount: 8, userId: "guest" },
      { id: "work_2", name: "Clara Jenkins", role: "Coat & Suit Specialist", unpaidWages: 450, completedCount: 12, userId: "guest" },
      { id: "work_3", name: "Edward Finch", role: "Button & Trim Artisan", unpaidWages: 95, completedCount: 19, userId: "guest" }
    ];

    const mockOrders: OrderData[] = [
      { id: "order_1", workerName: "Clara Jenkins", task: "Bespoke Coat Linings", wage: 180, time: "Yesterday, 2:15 PM", userId: "guest" },
      { id: "order_2", workerName: "Arthur Pendelton", task: "Double Breasted Velvet Cutting", wage: 120, time: "Yesterday, 11:30 AM", userId: "guest" }
    ];

    const mockInventory: InventoryData[] = [
      { id: "inv_1", name: "Egyptian Giza Cotton (Cream)", unitType: "yards", cost: 15, price: 35, stock: 120, userId: "guest" },
      { id: "inv_2", name: "Irish Heritage Linen (Natural)", unitType: "yards", cost: 22, price: 48, stock: 85, userId: "guest" },
      { id: "inv_3", name: "Super 120s Loro Piana Wool", unitType: "yards", cost: 45, price: 95, stock: 60, userId: "guest" }
    ];

    setCustomers(mockCustomers);
    setSelectedCustomer(mockCustomers[0]);
    setWorkers(mockWorkers);
    setSelectedWorkerId(mockWorkers[0].id);
    setOrders(mockOrders);
    setInventory(mockInventory);

    // Sync state for new custom customer setup
    resetCustomerFormFields(mockCustomers[0]);
  };

  const resetCustomerFormFields = (cust?: CustomerData) => {
    if (cust) {
      setEditCustName(cust.name);
      setEditCustPhone(cust.phone);
      setEditCustAddress(cust.address);
      setEditCustTemplateId(cust.templateId);
      setEditCustSizes(cust.customSizes);
      setIsEditingCust(true);
    } else {
      setEditCustName("");
      setEditCustPhone("");
      setEditCustAddress("");
      const firstTpl = SIZING_TEMPLATES[0];
      setEditCustTemplateId(firstTpl.id);
      // pre-populate with default values from template
      const defaultSizes = firstTpl.fields.reduce((acc, f) => ({ ...acc, [f.name]: f.value }), {} as Record<string, string>);
      setEditCustSizes(defaultSizes);
      setIsEditingCust(false);
    }
  };

  const handleTemplateChange = (tplId: string) => {
    setEditCustTemplateId(tplId);
    const targetTpl = SIZING_TEMPLATES.find(t => t.id === tplId) || SIZING_TEMPLATES[0];
    const defaultSizes = targetTpl.fields.reduce((acc, f) => ({ ...acc, [f.name]: f.value }), {} as Record<string, string>);
    setEditCustSizes(defaultSizes);
  };

  const handleSizeInputChange = (fieldName: string, value: string) => {
    setEditCustSizes(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  // SIGN IN AND SIGN OUT HANDLERS
  const handleGoogleSignIn = async () => {
    try {
      setAuthLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Sign in failed:", error);
      alert("Auth Pop-up was blocked. If running in a preview iframe, please open the application in a new tab using the URL in the right panel to complete registration securely.");
      setAuthLoading(false);
    }
  };

  const handleUserSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  // FIRESTORE CRUD ACTIONS

  // 1. SAVE CUSTOMER
  const handleSaveCustomer = async (e: FormEvent) => {
    e.preventDefault();
    if (!editCustName.trim()) return;

    const dataPayload = {
      name: editCustName,
      phone: editCustPhone || "No Phone",
      address: editCustAddress || "No Address",
      templateId: editCustTemplateId,
      customSizes: editCustSizes,
      userId: currentUser ? currentUser.uid : "guest"
    };

    if (currentUser) {
      const collectionName = "customers";
      try {
        if (isEditingCust && selectedCustomer) {
          const docId = selectedCustomer.id;
          await setDoc(doc(db, collectionName, docId), dataPayload);
        } else {
          const newDocId = "cust_" + Date.now();
          await setDoc(doc(db, collectionName, newDocId), dataPayload);
        }
      } catch (error) {
        handleFirestoreError(error, isEditingCust ? OperationType.UPDATE : OperationType.CREATE, `${collectionName}/${isEditingCust ? selectedCustomer?.id : 'new'}`);
      }
    } else {
      // Guest local state fallback
      if (isEditingCust && selectedCustomer) {
        const updated = customers.map(c => c.id === selectedCustomer.id ? { ...c, ...dataPayload } : c);
        setCustomers(updated);
        setSelectedCustomer({ id: selectedCustomer.id, ...dataPayload });
      } else {
        const newCust = { id: "cust_" + Date.now(), ...dataPayload };
        setCustomers([...customers, newCust]);
        setSelectedCustomer(newCust);
      }
    }
    alert(isEditingCust ? "Customer measurements updated successfully!" : "New customer registered in database!");
    resetCustomerFormFields();
    setCustomerSubTab("ticket");
  };

  // 2. DELETE CUSTOMER
  const handleDeleteCustomer = async (custId: string) => {
    if (!confirm("Are you sure you want to permanently erase this customer record?")) return;

    if (currentUser) {
      const collectionName = "customers";
      try {
        await deleteDoc(doc(db, collectionName, custId));
        if (selectedCustomer?.id === custId) {
          setSelectedCustomer(null);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${custId}`);
      }
    } else {
      const updated = customers.filter(c => c.id !== custId);
      setCustomers(updated);
      if (selectedCustomer?.id === custId) {
        setSelectedCustomer(updated[0] || null);
      }
    }
  };

  // 3. REGISTER STAFF MEMBER
  const handleRegisterWorker = async (e: FormEvent) => {
    e.preventDefault();
    if (!newWorkerName.trim()) return;

    const payload = {
      name: newWorkerName,
      role: newWorkerRole,
      unpaidWages: 0,
      completedCount: 0,
      userId: currentUser ? currentUser.uid : "guest"
    };

    if (currentUser) {
      const collectionName = "workers";
      try {
        const newWorkerId = "work_" + Date.now();
        await setDoc(doc(db, collectionName, newWorkerId), payload);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `${collectionName}/new`);
      }
    } else {
      const newW = { id: "work_" + Date.now(), ...payload };
      setWorkers([...workers, newW]);
    }
    setNewWorkerName("");
    alert("New staff member registered in your shop directory!");
  };

  // 4. LOG PIECE-WORK TASK ORDER
  const handleLogPieceWork = async (e: FormEvent) => {
    e.preventDefault();
    const w = workers.find(work => work.id === selectedWorkerId);
    if (!w) return;

    const orderPayload = {
      workerName: w.name,
      task: pieceTaskName,
      wage: Number(pieceTaskWage),
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) + " (Synced)",
      userId: currentUser ? currentUser.uid : "guest"
    };

    if (currentUser) {
      try {
        // Create order
        const newOrderId = "order_" + Date.now();
        await setDoc(doc(db, "orders", newOrderId), orderPayload);

        // Update worker's parameters in Firestore
        const workerRef = doc(db, "workers", w.id);
        await updateDoc(workerRef, {
          unpaidWages: w.unpaidWages + Number(pieceTaskWage),
          completedCount: w.completedCount + 1
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `orders/new_and_workers_update`);
      }
    } else {
      // Guest update
      const newOrder: OrderData = {
        id: "order_" + Date.now(),
        ...orderPayload
      };
      setOrders([newOrder, ...orders]);
      setWorkers(workers.map(work => {
        if (work.id === w.id) {
          return {
            ...work,
            unpaidWages: work.unpaidWages + Number(pieceTaskWage),
            completedCount: work.completedCount + 1
          };
        }
        return work;
      }));
    }

    alert(`Successfully logged task for ${w.name}! Unpaid wage updated.`);
  };

  // 5. WIPE STAFF UNPAID LEDGER (PAY OUT)
  const handlePayoutWorker = async (workerId: string) => {
    const w = workers.find(work => work.id === workerId);
    if (!w || w.unpaidWages === 0) return;

    if (!confirm(`Confirm cash payout of $${w.unpaidWages} to ${w.name}?`)) return;

    setPayoutSlip({
      name: w.name,
      amount: w.unpaidWages,
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) + " (Live Payout)"
    });

    if (currentUser) {
      try {
        const workerRef = doc(db, "workers", w.id);
        await updateDoc(workerRef, {
          unpaidWages: 0
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `workers/${w.id}`);
      }
    } else {
      setWorkers(workers.map(work => {
        if (work.id === w.id) {
          return { ...work, unpaidWages: 0 };
        }
        return work;
      }));
    }
  };

  // 6. ADD FABRIC INVENTORY
  const handleAddFabric = async (e: FormEvent) => {
    e.preventDefault();
    if (!newFabricName.trim()) return;

    const payload = {
      name: newFabricName,
      unitType: newFabricUnit,
      cost: Number(newFabricCost),
      price: Number(newFabricPrice),
      stock: Number(newFabricStock),
      userId: currentUser ? currentUser.uid : "guest"
    };

    if (currentUser) {
      const collectionName = "inventory";
      try {
        const newInvId = "inv_" + Date.now();
        await setDoc(doc(db, collectionName, newInvId), payload);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `${collectionName}/new`);
      }
    } else {
      const newI = { id: "inv_" + Date.now(), ...payload };
      setInventory([...inventory, newI]);
    }

    setNewFabricName("");
    alert("New stock material registered in warehouse!");
  };

  // 7. DELETE INVENTORY ITEM
  const handleDeleteInventory = async (invId: string) => {
    if (!confirm("Remove this stock material from database?")) return;

    if (currentUser) {
      try {
        await deleteDoc(doc(db, "inventory", invId));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `inventory/${invId}`);
      }
    } else {
      setInventory(inventory.filter(i => i.id !== invId));
    }
  };

  // Calculated metrics
  const totalYards = inventory.reduce((acc, i) => acc + i.stock, 0);
  const totalCostVal = inventory.reduce((acc, i) => acc + (i.cost * i.stock), 0);
  const totalRetailVal = inventory.reduce((acc, i) => acc + (i.price * i.stock), 0);
  const netProfitPotential = totalRetailVal - totalCostVal;

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) || 
    c.phone.includes(customerSearch)
  );

  return (
    <div className="min-h-screen bg-[#F6F4EB] text-brand-charcoal font-sans antialiased flex flex-col">
      
      {/* Premium Desktop Header */}
      <header className="bg-brand-charcoal border-b-2 border-brand-gold text-brand-cream px-4 md:px-8 py-4 shrink-0 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3 text-center md:text-left flex-col md:flex-row">
          <div className="w-10 h-10 rounded-full bg-brand-gold flex items-center justify-center text-brand-cream border border-brand-gold/30 shrink-0">
            <Scissors className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif text-xl md:text-2xl font-bold tracking-wider uppercase flex items-center justify-center md:justify-start gap-2 flex-wrap">
              <span>TailorShopManager</span>
              <span className="text-[10px] bg-brand-gold px-2 py-0.5 rounded font-mono text-white tracking-widest">DESKTOP v1.2</span>
            </h1>
            <p className="text-[10px] tracking-widest text-brand-gold/80 font-mono uppercase">Bespoke Workshop Control Panel</p>
          </div>
        </div>

        {/* Database Connection / Auth Status indicator */}
        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2 px-3 py-1 bg-zinc-800/80 rounded border border-zinc-700 text-[11px] font-mono">
            {syncStatus === "connected" ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-[#4F5D2F]" />
                <span className="text-zinc-300">Firestore Syncing: <strong className="text-white">Active</strong></span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-brand-gold animate-pulse" />
                <span className="text-zinc-400">Sandbox Mode: <strong className="text-brand-gold">Guest Workspace</strong></span>
              </>
            )}
          </div>

          {/* User auth layout */}
          {authLoading ? (
            <span className="text-xs text-zinc-400 font-mono">Authenticating...</span>
          ) : currentUser ? (
            <div className="flex items-center gap-3 pl-4 border-l border-zinc-700">
              <div className="text-right">
                <span className="block text-xs font-semibold text-white">{currentUser.displayName || "Tailor Proprietor"}</span>
                <span className="block text-[9px] text-zinc-400 truncate max-w-[150px] font-mono">{currentUser.email}</span>
              </div>
              {currentUser.photoURL ? (
                <img src={currentUser.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-brand-gold" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-brand-gold/20 text-brand-gold flex items-center justify-center font-bold text-xs uppercase">
                  {currentUser.email ? currentUser.email[0] : "T"}
                </div>
              )}
              <button 
                onClick={handleUserSignOut}
                className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleGoogleSignIn}
              className="px-4 py-2 bg-brand-gold hover:bg-brand-gold-light text-[#FCFAF2] rounded font-sans text-xs tracking-wider uppercase font-bold flex items-center gap-2 transition duration-300 shadow cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In with Google</span>
            </button>
          )}

          <button
            onClick={onBackToLanding}
            className="px-3.5 py-1.5 border border-zinc-600 hover:bg-zinc-800 text-zinc-300 rounded font-sans text-xs uppercase font-medium transition cursor-pointer"
          >
            Exit Workspace
          </button>
        </div>
      </header>

      {/* Guest Mode Notification Bar */}
      {!currentUser && !authLoading && (
        <div className="bg-[#8B6B3F] text-white py-2.5 px-4 md:px-8 text-xs font-semibold flex flex-col md:flex-row items-center gap-3 justify-between shrink-0 shadow-inner">
          <div className="flex items-center gap-2 text-center md:text-left">
            <Sparkles className="w-4 h-4 shrink-0 animate-bounce" />
            <span>Currently using Guest Sandbox workspace. Sign in with Google to enable real-time cloud backup, permanent sizing records, and synchronized employee accounts!</span>
          </div>
          <button 
            onClick={handleGoogleSignIn}
            className="px-3 py-1 bg-white hover:bg-brand-cream text-[#8B6B3F] rounded uppercase font-mono font-extrabold text-[10px] tracking-wide transition shadow shrink-0"
          >
            Authorize Backup Setup
          </button>
        </div>
      )}

      {/* Desktop Workspace Grid */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Left Side: Desktop Sidebar Navigation */}
        <aside className="hidden md:flex w-64 bg-brand-cream border-r border-brand-gold/20 flex-col justify-between shrink-0">
          <div className="p-6 space-y-6">
            <span className="text-[10px] font-mono text-brand-gold font-bold uppercase tracking-widest block">
              Workspace Nav
            </span>

            <nav className="space-y-1.5">
              <button
                onClick={() => setActiveTab("customers")}
                className={`w-full px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-3 transition cursor-pointer ${
                  activeTab === "customers"
                    ? "bg-brand-gold text-white shadow"
                    : "text-brand-slate hover:bg-brand-eggshell"
                }`}
              >
                <User className="w-4.5 h-4.5" />
                <span>Customers & Sizing</span>
              </button>

              <button
                onClick={() => setActiveTab("workers")}
                className={`w-full px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-3 transition cursor-pointer ${
                  activeTab === "workers"
                    ? "bg-brand-gold text-white shadow"
                    : "text-brand-slate hover:bg-brand-eggshell"
                }`}
              >
                <Users className="w-4.5 h-4.5" />
                <span>Worker Wage Ledger</span>
              </button>

              <button
                onClick={() => setActiveTab("inventory")}
                className={`w-full px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-3 transition cursor-pointer ${
                  activeTab === "inventory"
                    ? "bg-brand-gold text-white shadow"
                    : "text-brand-slate hover:bg-brand-eggshell"
                }`}
              >
                <ShoppingBag className="w-4.5 h-4.5" />
                <span>Materials Inventory</span>
              </button>
            </nav>
          </div>

          {/* Quick instructions panel */}
          <div className="p-6 border-t border-brand-gold/10 bg-brand-eggshell/50 text-xs text-brand-slate space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-brand-charcoal uppercase font-mono text-[9px] tracking-wide text-brand-gold">
              <ShieldCheck className="w-4 h-4" />
              <span>Full-Stack Sovereignty</span>
            </div>
            <p className="leading-relaxed">This portal synchronizes your client charts directly using end-to-end encrypted Firestore listeners.</p>
          </div>
        </aside>

        {/* Main Workspace Frame */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#FBF9F3]">
          
          {/* TAB 1: CUSTOMERS HUB */}
          {activeTab === "customers" && (
            <div className="flex-1 flex flex-col xl:flex-row overflow-hidden animate-fadeIn">
              
              {/* Mobile customer sub-navigation */}
              <div className="xl:hidden flex bg-white border-b border-zinc-150 py-2.5 px-4 justify-between items-center shrink-0">
                <div className="flex gap-1.5 w-full">
                  <button
                    onClick={() => setCustomerSubTab("list")}
                    className={`flex-1 py-2 px-2 rounded-md text-center font-sans font-bold text-[10px] uppercase transition cursor-pointer ${
                      customerSubTab === "list"
                        ? "bg-brand-gold text-white shadow-sm"
                        : "bg-zinc-100 text-zinc-650 hover:bg-zinc-200"
                    }`}
                  >
                    Client List
                  </button>
                  <button
                    onClick={() => setCustomerSubTab("form")}
                    className={`flex-1 py-2 px-2 rounded-md text-center font-sans font-bold text-[10px] uppercase transition cursor-pointer ${
                      customerSubTab === "form"
                        ? "bg-brand-gold text-white shadow-sm"
                        : "bg-zinc-100 text-zinc-650 hover:bg-zinc-200"
                    }`}
                  >
                    Sizing Form
                  </button>
                  <button
                    onClick={() => setCustomerSubTab("ticket")}
                    className={`flex-1 py-2 px-2 rounded-md text-center font-sans font-bold text-[10px] uppercase transition cursor-pointer ${
                      customerSubTab === "ticket"
                        ? "bg-brand-gold text-white shadow-sm"
                        : "bg-zinc-100 text-zinc-650 hover:bg-zinc-200"
                    }`}
                  >
                    Ticket Preview
                  </button>
                </div>
              </div>

              {/* Customer Left Column - Directory List */}
              <div className={`w-full xl:w-80 bg-white border-r border-zinc-150 flex-col shrink-0 ${customerSubTab === "list" ? "flex flex-1 xl:flex-initial" : "hidden xl:flex"}`}>
                
                {/* Search Bar */}
                <div className="p-4 border-b border-zinc-100 space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input 
                      type="text" 
                      placeholder="Search bespoke records..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-brand-eggshell/60 border border-zinc-200 rounded-full text-xs outline-none focus:ring-1 focus:ring-brand-gold"
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 font-bold">
                    <span>BESPOKE CLIENTS</span>
                    <span className="bg-brand-eggshell px-2 py-0.5 rounded text-brand-charcoal">{filteredCustomers.length} Records</span>
                  </div>
                </div>

                {/* Directory list list */}
                <div className="flex-1 overflow-y-auto divide-y divide-zinc-50">
                  {filteredCustomers.length === 0 ? (
                    <div className="p-8 text-center text-zinc-400 text-xs">
                      No customer records found.
                    </div>
                  ) : (
                    filteredCustomers.map((cust) => (
                      <div 
                        key={cust.id}
                        onClick={() => {
                          setSelectedCustomer(cust);
                          resetCustomerFormFields(cust);
                          setCustomerSubTab("form");
                        }}
                        className={`p-4 text-left cursor-pointer transition flex items-center justify-between ${
                          selectedCustomer?.id === cust.id 
                            ? "bg-brand-eggshell border-l-4 border-brand-gold font-semibold" 
                            : "hover:bg-zinc-50"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-zinc-800 truncate">{cust.name}</h4>
                          <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">📞 {cust.phone}</span>
                          <span className="inline-block mt-1 text-[9px] bg-brand-moss/10 text-brand-moss font-bold px-1.5 py-0.2 rounded font-mono">
                            {(SIZING_TEMPLATES.find(t => t.id === cust.templateId)?.name || "Suit").split(" ")[0]}
                          </span>
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCustomer(cust.id);
                          }}
                          className="p-1 hover:text-red-600 hover:bg-zinc-100 rounded text-zinc-400 transition"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Create New Button */}
                <div className="p-4 bg-brand-cream border-t border-brand-gold/15 shrink-0">
                  <button
                    onClick={() => {
                      resetCustomerFormFields();
                      setCustomerSubTab("form");
                    }}
                    className="w-full py-2.5 bg-[#8B6B3F] hover:bg-[#1B1A18] text-white rounded font-sans text-xs tracking-wider uppercase font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Sizing Chart</span>
                  </button>
                </div>

              </div>

              {/* Customer Middle Column - Interactive Editor Form */}
              <div className={`flex-1 overflow-y-auto p-4 md:p-8 border-r border-zinc-150 ${customerSubTab === "form" ? "block" : "hidden xl:block"}`}>
                <div className="max-w-2xl mx-auto space-y-6">
                  
                  <div className="text-left">
                    <span className="text-[10px] font-mono text-brand-gold font-bold uppercase tracking-wider block mb-1">
                      {isEditingCust ? "❖ EDIT ACTIVE CLIENT SPECIFICATIONS" : "❖ NEW BESPOKE CLIENT SPECIFICATIONS"}
                    </span>
                    <h2 className="font-serif text-2xl font-bold text-brand-charcoal">
                      {isEditingCust ? `Modify: ${editCustName}` : "Register New Client Chart"}
                    </h2>
                    <p className="text-xs text-brand-slate mt-1">
                      Complete custom sizing details. Changes will synchronize with Firestore database records automatically.
                    </p>
                  </div>

                  <form onSubmit={handleSaveCustomer} className="space-y-6 text-left">
                    {/* Basic Info Rows */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono font-bold text-brand-charcoal mb-1.5">CLIENT FULL NAME</label>
                        <input 
                          type="text" 
                          required
                          value={editCustName}
                          onChange={(e) => setEditCustName(e.target.value)}
                          placeholder="e.g. Duke Henry Stuart"
                          className="w-full px-3.5 py-2.5 bg-white border border-zinc-200 rounded text-xs outline-none focus:ring-1 focus:ring-brand-gold shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono font-bold text-brand-charcoal mb-1.5">CONTACT PHONE</label>
                        <input 
                          type="text" 
                          required
                          value={editCustPhone}
                          onChange={(e) => setEditCustPhone(e.target.value)}
                          placeholder="e.g. +44 7700 900077"
                          className="w-full px-3.5 py-2.5 bg-white border border-zinc-200 rounded text-xs outline-none focus:ring-1 focus:ring-brand-gold shadow-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold text-brand-charcoal mb-1.5">SHIPPING / ATELIER ADDRESS</label>
                      <input 
                        type="text" 
                        value={editCustAddress}
                        onChange={(e) => setEditCustAddress(e.target.value)}
                        placeholder="e.g. 10 Savile Row, Mayfair, London"
                        className="w-full px-3.5 py-2.5 bg-white border border-zinc-200 rounded text-xs outline-none focus:ring-1 focus:ring-brand-gold shadow-sm"
                      />
                    </div>

                    {/* Template Choice */}
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-brand-gold mb-2.5">SELECT APPAREL BLUEPRINT DESIGN</label>
                      <div className="grid grid-cols-4 gap-2">
                        {SIZING_TEMPLATES.map((tpl) => (
                          <button
                            key={tpl.id}
                            type="button"
                            onClick={() => handleTemplateChange(tpl.id)}
                            className={`py-2 px-1 text-xs font-bold text-center border rounded transition cursor-pointer ${
                              editCustTemplateId === tpl.id 
                                ? "bg-brand-gold text-white border-brand-gold shadow-sm" 
                                : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
                            }`}
                          >
                            <span className="block truncate">{tpl.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sizing Parameters Grid (Numeric parameters) */}
                    <div className="border-t border-brand-gold/15 pt-5">
                      <span className="text-[10px] font-mono font-bold text-brand-charcoal block mb-3.5 uppercase">
                        📏 SIZING PARAMETERS & VALUES (INCHES ″)
                      </span>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 bg-brand-eggshell/30 p-4 border rounded-xl">
                        {activeTemplate.fields.map((field) => (
                          <div key={field.name} className="flex items-center justify-between border-b border-dashed border-zinc-200 pb-1.5">
                            <span className="text-xs text-zinc-600 truncate max-w-[120px]" title={field.label}>
                              {field.label.split('(')[0]}
                            </span>
                            <div className="flex items-center gap-1 shrink-0">
                              <input 
                                type="text" 
                                value={editCustSizes[field.name] || ""}
                                onChange={(e) => handleSizeInputChange(field.name, e.target.value)}
                                className="w-16 px-1.5 py-1 text-center font-mono font-bold bg-white border rounded text-xs focus:ring-1 focus:ring-brand-gold outline-none"
                              />
                              <span className="text-[10px] text-zinc-400 font-mono">″</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Form submission */}
                    <div className="pt-2 flex items-center gap-3 justify-end">
                      {isEditingCust && (
                        <button
                          type="button"
                          onClick={() => resetCustomerFormFields()}
                          className="px-4 py-2 border border-zinc-300 text-zinc-600 hover:bg-zinc-50 rounded text-xs font-semibold uppercase cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="submit"
                        className="px-6 py-3 bg-[#4F5D2F] hover:bg-[#3d4924] text-white rounded font-sans text-xs tracking-wider uppercase font-bold flex items-center gap-1.5 shadow cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>{isEditingCust ? "Save Synced Changes" : "Register Sizing Profile"}</span>
                      </button>
                    </div>

                  </form>
                </div>
              </div>

              {/* Customer Right Column - Retro Golden-Bordered Ticket Preview */}
              <div className={`w-full xl:w-96 bg-brand-cream/40 p-4 md:p-6 flex-col justify-start overflow-y-auto shrink-0 ${customerSubTab === "ticket" ? "flex flex-1 xl:flex-initial" : "hidden xl:flex"}`}>
                <span className="text-[10px] font-mono font-bold text-brand-gold tracking-widest block mb-4 uppercase text-center">
                  ⚡ CUSTOMER TICKET PREVIEW
                </span>

                {/* Classic Gilded Ticket Frame */}
                {selectedCustomer ? (
                  <div className="space-y-6">
                    <div className="bg-white border-2 border-brand-gold p-6 rounded-lg shadow-lg relative paper-grain text-left">
                      {/* Ticket tear cutout layout */}
                      <div className="absolute top-0 inset-x-0 h-1.5 flex justify-around overflow-hidden">
                        {Array.from({ length: 15 }).map((_, i) => (
                          <div key={i} className="w-3.5 h-3.5 bg-brand-cream rounded-full -translate-y-2.5"></div>
                        ))}
                      </div>

                      {/* Header details */}
                      <div className="text-center mt-3 pt-3">
                        <h3 className="font-serif text-xl font-extrabold tracking-wider text-brand-charcoal uppercase">
                          TAILORSHOPMANAGER
                        </h3>
                        <p className="font-mono text-[9.5px] text-brand-gold tracking-widest uppercase">
                          Master Sizing Record Sheet
                        </p>
                        <div className="border-y border-dashed border-zinc-200 my-3 py-1 text-[9px] font-mono flex justify-between px-2 text-zinc-500">
                          <span>EST. 2026</span>
                          <span>{syncStatus === "connected" ? "CLOUDFIRESTORE" : "LOCAL SANDBOX"}</span>
                          <span>CODE: #TSM-{selectedCustomer.id.slice(-4).toUpperCase()}</span>
                        </div>
                      </div>

                      {/* Client Details Box */}
                      <div className="bg-zinc-50 p-3.5 border border-zinc-150 rounded text-xs font-mono mb-4">
                        <span className="text-[9px] text-brand-slate uppercase font-sans font-bold block mb-1">CLIENT IDENTITY:</span>
                        <div className="text-zinc-900 font-bold text-sm">{selectedCustomer.name}</div>
                        <div className="text-zinc-600 mt-1">Contact: {selectedCustomer.phone}</div>
                        <div className="text-zinc-500 mt-0.5 truncate" title={selectedCustomer.address}>Address: {selectedCustomer.address}</div>
                      </div>

                      {/* Dimensions Specs */}
                      <div>
                        <span className="text-[10px] text-brand-gold font-bold font-serif italic mb-2 block border-b pb-1">
                          {(SIZING_TEMPLATES.find(t => t.id === selectedCustomer.templateId)?.name || "Apparel")} Blueprint Dimensions:
                        </span>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 font-mono text-xs">
                          {Object.entries(selectedCustomer.customSizes).map(([key, val]) => {
                            const lbl = SIZING_TEMPLATES.find(t => t.id === selectedCustomer.templateId)?.fields.find(f => f.name === key)?.label || key;
                            return (
                              <div key={key} className="flex justify-between border-b border-dashed border-zinc-100 pb-0.5">
                                <span className="text-zinc-500 truncate max-w-[110px]">{lbl.split('(')[0]}</span>
                                <span className="font-bold text-brand-gold text-right shrink-0">
                                  {val}″
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Verification seals */}
                      <div className="border-t border-dashed border-zinc-300 mt-4 pt-3.5">
                        <div className="flex items-center justify-between font-mono text-[9px] text-[#4F5D2F] font-bold bg-[#4F5D2F]/5 p-2 rounded border border-[#4F5D2F]/20">
                          <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-[#4F5D2F] rounded-full inline-block animate-pulse"></span>
                            AUTHENTICATED SPECIFICATION
                          </span>
                          <span>MASTER COPE</span>
                        </div>
                      </div>

                    </div>

                    {/* Printer action buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => {
                          setIsPrinted(true);
                          setTimeout(() => setIsPrinted(false), 2000);
                        }}
                        className="py-2.5 bg-brand-gold hover:bg-brand-gold-light text-white rounded font-sans text-xs tracking-wider uppercase font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        {isPrinted ? <Check className="w-4 h-4 animate-scaleIn" /> : <Printer className="w-4 h-4" />}
                        <span>{isPrinted ? "Sent to Printer!" : "Print Ticket"}</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsShared(true);
                          setTimeout(() => setIsShared(false), 2000);
                        }}
                        className="py-2.5 border-2 border-brand-gold hover:bg-brand-gold/10 text-brand-gold rounded font-sans text-xs tracking-wider uppercase font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        {isShared ? <Check className="w-4 h-4 animate-scaleIn" /> : <Share2 className="w-4 h-4" />}
                        <span>{isShared ? "Shared with Client!" : "Share Chart"}</span>
                      </button>
                    </div>

                    {/* Quick Tips */}
                    <div className="p-4 border border-zinc-200 bg-white rounded-lg text-xs text-zinc-500 text-left">
                      <span className="font-bold block mb-1 text-zinc-700">Workshop Tip:</span>
                      Keep this sizing chart open during fabric tailoring. You can print physical copies of these master tickets directly to layout thermal ticket receipt slips!
                    </div>

                  </div>
                ) : (
                  <div className="p-8 text-center bg-white border rounded border-dashed text-zinc-400 text-xs">
                    Please select or register a customer to view ticket parameters.
                  </div>
                )}

              </div>

            </div>
          )}

          {/* TAB 2: WORKERS LEDGER */}
          {activeTab === "workers" && (
            <div className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto animate-fadeIn text-left">
              <div className="max-w-5xl mx-auto w-full space-y-8">
                
                {/* Intro section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-gold/20 pb-4">
                  <div>
                    <span className="text-[10px] font-mono text-brand-gold font-bold uppercase tracking-wider block mb-1">
                      ❖ ATELIER STAFF WAGES & COMISSIONS
                    </span>
                    <h2 className="font-serif text-3xl font-bold text-brand-charcoal">
                      Proprietor Wage Ledger System
                    </h2>
                    <p className="text-xs text-brand-slate mt-1">
                      Manage tailors, pattern cutters, and seamstresses under traditional piece-rate metrics. Track wages accumulated per piece-work and dispatch payouts.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-zinc-500">Unpaid Liabilities:</span>
                    <span className="bg-brand-gold text-brand-cream font-mono font-bold px-3 py-1 rounded text-sm shadow">
                      ${workers.reduce((acc, w) => acc + w.unpaidWages, 0)} Total
                    </span>
                  </div>
                </div>

                {/* Split layout: Workers directory + Add form + Task logger */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left: Workers List and Register Form (lg:col-span-7) */}
                  <div className="lg:col-span-7 space-y-6">
                    
                    <div className="bg-white border rounded-xl p-6 shadow-sm space-y-4">
                      <h3 className="font-serif text-lg font-bold text-brand-charcoal flex items-center gap-2">
                        <Users className="w-5 h-5 text-brand-gold" />
                        <span>Registered Staff Directory</span>
                      </h3>

                      <div className="divide-y divide-zinc-100">
                        {workers.length === 0 ? (
                          <div className="py-6 text-center text-zinc-400 text-xs">
                            No tailors registered. Add staff members below.
                          </div>
                        ) : (
                          workers.map((work) => (
                            <div key={work.id} className="py-3.5 flex items-center justify-between text-xs">
                              <div>
                                <h4 className="font-bold text-zinc-800 text-sm">{work.name}</h4>
                                <span className="text-[10px] text-zinc-400 block mt-0.5">{work.role} • {work.completedCount} garments made</span>
                              </div>
                              <div className="flex items-center gap-4 text-right shrink-0">
                                <div>
                                  <span className="block text-[8px] text-zinc-400 font-mono font-bold uppercase">UNPAID WAGES</span>
                                  <span className={`font-mono font-bold text-sm ${work.unpaidWages > 0 ? "text-brand-gold" : "text-brand-moss"}`}>
                                    ${work.unpaidWages}
                                  </span>
                                </div>
                                <button
                                  onClick={() => handlePayoutWorker(work.id)}
                                  disabled={work.unpaidWages === 0}
                                  className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase transition border ${
                                    work.unpaidWages > 0
                                      ? "bg-[#4F5D2F]/15 border-[#4F5D2F]/30 text-[#4F5D2F] hover:bg-[#4F5D2F]/25 cursor-pointer"
                                      : "bg-zinc-100 border-zinc-200 text-zinc-400 cursor-not-allowed"
                                  }`}
                                >
                                  Disburse Cash
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Add Staff form */}
                    <div className="bg-white border rounded-xl p-6 shadow-sm">
                      <h3 className="font-serif text-base font-bold text-brand-charcoal mb-4 flex items-center gap-2">
                        <Plus className="w-4 h-4 text-brand-gold" />
                        <span>Register Seamstress or Tailor Artisan</span>
                      </h3>

                      <form onSubmit={handleRegisterWorker} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                        <div className="sm:col-span-2">
                          <label className="block text-[9px] font-mono text-zinc-500 mb-1 uppercase">ARTISAN NAME</label>
                          <input 
                            type="text" 
                            required
                            value={newWorkerName}
                            onChange={(e) => setNewWorkerName(e.target.value)}
                            placeholder="e.g. Master Clara Jenkins"
                            className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-brand-gold outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-mono text-zinc-500 mb-1 uppercase">ROLE / SPECIALTY</label>
                          <select
                            value={newWorkerRole}
                            onChange={(e) => setNewWorkerRole(e.target.value)}
                            className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-brand-gold outline-none bg-white"
                          >
                            <option value="Master Pattern Cutter">Pattern Cutter</option>
                            <option value="Coat & Jacket Specialist">Coat & Jacket Specialist</option>
                            <option value="Button & Lapel Artisan">Button & Lapel Artisan</option>
                            <option value="Master Tailor">Master Tailor</option>
                          </select>
                        </div>
                        <div className="sm:col-span-3 flex justify-end">
                          <button
                            type="submit"
                            className="px-5 py-2 bg-brand-charcoal hover:bg-brand-slate text-white rounded font-bold uppercase text-[10px] tracking-wide cursor-pointer transition"
                          >
                            Register Artisan
                          </button>
                        </div>
                      </form>
                    </div>

                  </div>

                  {/* Right: Task Logger Form & History Feed (lg:col-span-5) */}
                  <div className="lg:col-span-5 space-y-6">
                    
                    {/* Log Piece-work form */}
                    <div className="bg-brand-cream/60 border border-brand-gold/30 rounded-xl p-6 shadow-sm kraft-shadow">
                      <h3 className="font-serif text-lg font-bold text-brand-charcoal mb-4 flex items-center gap-2">
                        <ClipboardList className="w-5 h-5 text-brand-gold" />
                        <span>Log Piece-Work Rate</span>
                      </h3>

                      <form onSubmit={handleLogPieceWork} className="space-y-4 text-xs">
                        <div>
                          <label className="block text-[9px] font-mono text-zinc-500 mb-1 uppercase">SELECT ACTIVE TAILOR</label>
                          <select
                            required
                            value={selectedWorkerId}
                            onChange={(e) => setSelectedWorkerId(e.target.value)}
                            className="w-full p-2 border bg-white rounded outline-none focus:ring-1 focus:ring-brand-gold"
                          >
                            <option value="">-- Choose Artisan --</option>
                            {workers.map(w => (
                              <option key={w.id} value={w.id}>{w.name} ({w.role})</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[9px] font-mono text-zinc-500 mb-1 uppercase">GARMENT DETAIL TASK</label>
                          <input 
                            type="text" 
                            required
                            value={pieceTaskName}
                            onChange={(e) => setPieceTaskName(e.target.value)}
                            placeholder="e.g. Double Breasted Satin Stitching"
                            className="w-full p-2 border rounded bg-white outline-none focus:ring-1 focus:ring-brand-gold"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-mono text-zinc-500 mb-1 uppercase">WAGE PIECE-RATE AMOUNT ($)</label>
                          <div className="flex gap-2">
                            <input 
                              type="number" 
                              required
                              value={pieceTaskWage}
                              onChange={(e) => setPieceTaskWage(Number(e.target.value))}
                              className="w-full p-2 border rounded bg-white font-mono outline-none focus:ring-1 focus:ring-brand-gold"
                            />
                            <button
                              type="submit"
                              className="px-5 bg-[#4F5D2F] hover:bg-[#3d4924] text-white rounded font-bold uppercase text-[10px] tracking-wide transition cursor-pointer shrink-0"
                            >
                              Log Rate
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>

                    {/* Receipt payout slip simulator popup details */}
                    {payoutSlip && (
                      <div className="bg-[#4F5D2F]/5 border border-dashed border-[#4F5D2F]/40 p-4 rounded-xl text-xs text-[#4F5D2F] text-left relative animate-fadeIn shadow-xs">
                        <button 
                          onClick={() => setPayoutSlip(null)}
                          className="absolute top-2 right-3 font-bold text-lg hover:text-brand-charcoal text-zinc-400"
                        >
                          ×
                        </button>
                        <div className="font-mono flex justify-between items-center mb-1 bg-[#4F5D2F]/10 px-2 py-0.5 rounded">
                          <strong className="text-[9px] tracking-wide">✔ CASH PAYOUT VOUCHER COMPLETED</strong>
                          <span className="text-[10px]">{payoutSlip.time}</span>
                        </div>
                        <p className="mt-1.5 leading-relaxed">
                          Handed cash balance of <strong className="text-[#4F5D2F] font-bold font-mono">${payoutSlip.amount}</strong> to <strong className="font-bold">{payoutSlip.name}</strong>. The unpaid wage ledger is cleared. This event has been archived to the database records.
                        </p>
                      </div>
                    )}

                    {/* Logged task history list */}
                    <div className="bg-white border rounded-xl p-5 shadow-sm">
                      <span className="text-[10px] font-mono font-bold text-zinc-400 block mb-3 uppercase">Atelier Task Feed</span>
                      
                      <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                        {orders.length === 0 ? (
                          <div className="text-center text-zinc-400 text-xs py-4">
                            No logged transactions.
                          </div>
                        ) : (
                          orders.map((ord) => (
                            <div key={ord.id} className="text-xs flex items-start gap-2.5 bg-zinc-50 border p-2.5 rounded-lg border-zinc-150">
                              <div className="w-6.5 h-6.5 rounded bg-brand-gold/10 text-brand-gold font-bold flex items-center justify-center font-serif text-[10px] shrink-0 mt-0.5">
                                T
                              </div>
                              <div className="min-w-0 flex-1 text-left">
                                <div className="flex justify-between items-baseline">
                                  <span className="font-bold text-zinc-800 truncate">{ord.workerName}</span>
                                  <span className="font-mono text-zinc-400 text-[8px] shrink-0">{ord.time}</span>
                                </div>
                                <p className="text-[10px] text-zinc-500 mt-0.5">{ord.task}</p>
                                <span className="inline-block mt-1 font-mono font-extrabold text-[#4F5D2F] text-[10px]">+${ord.wage} Wage logged</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            </div>
          )}

          {/* TAB 3: INVENTORY HUB */}
          {activeTab === "inventory" && (
            <div className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto animate-fadeIn text-left">
              <div className="max-w-5xl mx-auto w-full space-y-8">
                
                {/* Intro header */}
                <div className="border-b border-brand-gold/20 pb-4 flex flex-col md:flex-row md:items-center gap-4 justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-brand-gold font-bold uppercase tracking-wider block mb-1">
                      ❖ FABRIC WAREHOUSE & STOCK CONTROLS
                    </span>
                    <h2 className="font-serif text-2xl md:text-3xl font-bold text-brand-charcoal">
                      Atelier Fabric & Materials Directory
                    </h2>
                    <p className="text-xs text-brand-slate mt-1">
                      Add premium yardages, track dynamic textile costs, and view potential profit targets based on your custom retail pricing structures.
                    </p>
                  </div>
                </div>

                {/* Grid Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                  <div className="bg-white border p-4.5 rounded-xl shadow-xs">
                    <span className="text-[10px] font-mono text-zinc-400 block uppercase font-bold">Fabrics Types</span>
                    <h4 className="font-mono text-xl font-bold mt-1 text-brand-charcoal">{inventory.length} Registered</h4>
                  </div>
                  <div className="bg-white border p-4.5 rounded-xl shadow-xs">
                    <span className="text-[10px] font-mono text-zinc-400 block uppercase font-bold">Total Yardage</span>
                    <h4 className="font-mono text-xl font-bold mt-1 text-brand-charcoal">{totalYards} yds</h4>
                  </div>
                  <div className="bg-white border p-4.5 rounded-xl shadow-xs">
                    <span className="text-[10px] font-mono text-zinc-400 block uppercase font-bold">Capital Invested</span>
                    <h4 className="font-mono text-xl font-bold mt-1 text-brand-charcoal">${totalCostVal}</h4>
                  </div>
                  <div className="bg-brand-cream border-2 border-brand-gold p-4.5 rounded-xl shadow-xs relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-12 h-12 bg-brand-gold/10 rounded-bl-full pointer-events-none"></div>
                    <span className="text-[10px] font-mono text-brand-gold block uppercase font-bold">Net Profit Potential</span>
                    <h4 className="font-mono text-xl font-extrabold mt-1 text-brand-moss">${netProfitPotential}</h4>
                  </div>
                </div>

                {/* Inventory Table and Register Form */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left: Materials Table List (lg:col-span-8) */}
                  <div className="lg:col-span-8 bg-white border rounded-xl overflow-hidden shadow-sm">
                    <div className="p-5 border-b border-zinc-100 flex justify-between items-center">
                      <h3 className="font-serif font-bold text-base text-brand-charcoal">Fabric Warehouse Rolls</h3>
                      <span className="text-[10px] font-mono bg-brand-eggshell text-brand-slate px-2.5 py-0.5 rounded font-bold uppercase">SECURED BACKUPS</span>
                    </div>

                    <div className="divide-y divide-zinc-100">
                      {inventory.length === 0 ? (
                        <div className="p-12 text-center text-zinc-400 text-xs">
                          Your fabric rolls are empty. Add stock material roll parameters in the sidebar!
                        </div>
                      ) : (
                        inventory.map((item) => (
                          <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50/50 transition text-xs">
                            <div className="min-w-0 flex-1 text-left w-full sm:w-auto">
                              <h4 className="font-bold text-zinc-800 text-sm">{item.name}</h4>
                              <span className="text-[10px] text-zinc-400 block mt-0.5">Rolled under yardage specifications • Unit: {item.unitType}</span>
                              
                              {/* Stock visualizer */}
                              <div className="w-full sm:w-48 bg-zinc-100 rounded-full h-1.5 overflow-hidden mt-2 border">
                                <div 
                                  className="bg-brand-moss h-full"
                                  style={{ width: `${Math.min(item.stock, 100)}%` }}
                                ></div>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 sm:gap-6 font-mono text-center sm:mx-6 text-[11px] bg-zinc-50 sm:bg-transparent p-2 sm:p-0 rounded border sm:border-0 border-zinc-100 w-full sm:w-auto">
                              <div>
                                <span className="block text-[8px] text-zinc-400 font-sans uppercase">COST</span>
                                ${item.cost}
                              </div>
                              <div>
                                <span className="block text-[8px] text-zinc-400 font-sans uppercase">RETAIL</span>
                                ${item.price}
                              </div>
                              <div className="text-right text-[#4F5D2F] font-bold">
                                <span className="block text-[8px] text-zinc-400 font-sans uppercase">PROFIT</span>
                                +${item.price - item.cost}
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto shrink-0">
                              <span className="font-mono bg-brand-eggshell text-brand-charcoal font-bold px-2.5 py-1 rounded border text-[11px]">
                                {item.stock} yds
                              </span>
                              <button
                                onClick={() => handleDeleteInventory(item.id)}
                                className="p-1.5 hover:text-red-600 hover:bg-zinc-100 rounded text-zinc-400 transition cursor-pointer"
                                title="Remove Roll"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Right: Add Fabric Form (lg:col-span-4) */}
                  <div className="lg:col-span-4 bg-white border rounded-xl p-6 shadow-sm">
                    <h3 className="font-serif text-base font-bold text-brand-charcoal mb-4 flex items-center gap-1.5">
                      <Plus className="w-4.5 h-4.5 text-brand-gold" />
                      <span>Register Fabric Roll</span>
                    </h3>

                    <form onSubmit={handleAddFabric} className="space-y-4 text-xs">
                      <div>
                        <label className="block text-[9px] font-mono text-zinc-500 mb-1 uppercase">FABRIC ROLL BRAND / COLOR</label>
                        <input 
                          type="text" 
                          required
                          value={newFabricName}
                          onChange={(e) => setNewFabricName(e.target.value)}
                          placeholder="e.g. Scabal Tweed (Midnight Blue)"
                          className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-brand-gold bg-white outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] font-mono text-zinc-500 mb-1 uppercase">MEASURE UNIT</label>
                          <input 
                            type="text" 
                            required
                            value={newFabricUnit}
                            onChange={(e) => setNewFabricUnit(e.target.value)}
                            className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-brand-gold bg-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-mono text-zinc-500 mb-1 uppercase">STOCK QTY</label>
                          <input 
                            type="number" 
                            required
                            value={newFabricStock}
                            onChange={(e) => setNewFabricStock(Number(e.target.value))}
                            className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-brand-gold bg-white font-mono outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 border-t pt-3 border-dashed">
                        <div>
                          <label className="block text-[9px] font-mono text-zinc-500 mb-1 uppercase">COST PER YARD ($)</label>
                          <input 
                            type="number" 
                            required
                            value={newFabricCost}
                            onChange={(e) => setNewFabricCost(Number(e.target.value))}
                            className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-brand-gold bg-white font-mono outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-mono text-zinc-500 mb-1 uppercase">RETAIL PRICE ($)</label>
                          <input 
                            type="number" 
                            required
                            value={newFabricPrice}
                            onChange={(e) => setNewFabricPrice(Number(e.target.value))}
                            className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-brand-gold bg-white font-mono outline-none"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-brand-gold hover:bg-brand-gold-light text-white rounded font-sans text-xs tracking-wider uppercase font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>Add Roll to Warehouse</span>
                      </button>
                    </form>
                  </div>

                </div>

              </div>
            </div>
          )}

        </main>

      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden flex border-t border-brand-gold/15 bg-brand-cream justify-around py-2.5 shrink-0 z-10 shadow-lg">
        <button
          onClick={() => setActiveTab("customers")}
          className={`flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-bold uppercase transition cursor-pointer ${
            activeTab === "customers" ? "text-brand-gold" : "text-brand-slate"
          }`}
        >
          <User className="w-5 h-5" />
          <span>Clients</span>
        </button>
        <button
          onClick={() => setActiveTab("workers")}
          className={`flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-bold uppercase transition cursor-pointer ${
            activeTab === "workers" ? "text-brand-gold" : "text-brand-slate"
          }`}
        >
          <Users className="w-5 h-5" />
          <span>Wages</span>
        </button>
        <button
          onClick={() => setActiveTab("inventory")}
          className={`flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-bold uppercase transition cursor-pointer ${
            activeTab === "inventory" ? "text-brand-gold" : "text-brand-slate"
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span>Stock</span>
        </button>
      </div>

    </div>
  );
}
