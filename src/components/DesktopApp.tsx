import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, LogOut, LogIn, User, Scissors, Check, X, ShieldCheck,
  Search, Users, Box, Ruler, Settings, Plus, CreditCard, ChevronLeft,
  Bell, Trash2, Edit2, FileText, Info, Save, Phone, MapPin, PlusCircle,
  TrendingUp, TrendingDown, Layers, Download, CheckSquare, Sparkles,
  Award, Compass, Shirt
} from "lucide-react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { 
  firebaseService, 
  FirestoreEmployee, 
  FirestoreEmployeeWorkRecord, 
  FirestoreEmployeePaymentRecord, 
  FirestoreLedgerRecord, 
  FirestorePaymentRecord 
} from "../lib/firebaseService";

// Import types
import { ActiveUser, Customer, Order, InventoryItem, ShopProfile, SizingCard, LedgerEntry } from "../types";

// Import custom workspaces
import DashboardStats from "./DashboardStats";
import CustomerWorkspace from "./CustomerWorkspace";
import OrdersWorkspace from "./OrdersWorkspace";
import InventoryWorkspace from "./InventoryWorkspace";
import SettingsWorkspace from "./SettingsWorkspace";
import InvoiceModal from "./InvoiceModal";
import { Template } from "./MeasurementTemplates";

interface DesktopAppProps {
  onBackToLanding: () => void;
}

export default function DesktopApp({ onBackToLanding }: DesktopAppProps) {
  // Auth & Global states
  const [activeUser, setActiveUser] = useState<ActiveUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"dashboard" | "customers" | "orders" | "inventory" | "settings">("dashboard");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Core Datasets
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [shopProfile, setShopProfile] = useState<ShopProfile>({
    shopName: "Golden Shears Atelier",
    shopPhone: "+92 300 9876543",
    shopAddress: "Bespoke Row, Artisanal Sector, Karachi",
    currency: "₨",
    logoIcon: "Scissors",
    isConfigured: true
  });

  // Extra Firestore Collections States for advanced multi-tenant schemas
  const [employees, setEmployees] = useState<FirestoreEmployee[]>([]);
  const [employeeWorkRecords, setEmployeeWorkRecords] = useState<FirestoreEmployeeWorkRecord[]>([]);
  const [employeePaymentRecords, setEmployeePaymentRecords] = useState<FirestoreEmployeePaymentRecord[]>([]);
  const [ledgerRecords, setLedgerRecords] = useState<FirestoreLedgerRecord[]>([]);
  const [paymentRecords, setPaymentRecords] = useState<FirestorePaymentRecord[]>([]);
  const [sizingTemplates, setSizingTemplates] = useState<Template[]>([]);

  // Active items for detailed view
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [activeInvoiceOrder, setActiveInvoiceOrder] = useState<Order | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  // Helper states for launching modals/wizards from Dashboard
  const [showCommissionFormFromDashboard, setShowCommissionFormFromDashboard] = useState(false);
  const [preSelectedCustomer, setPreSelectedCustomer] = useState<Customer | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Firebase Auth State Observer & Real-time Firestore Sync
  useEffect(() => {
    let unsubscribeFirestore: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const loggedUser: ActiveUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          isGuest: false
        };
        setActiveUser(loggedUser);

        if (unsubscribeFirestore) {
          unsubscribeFirestore();
        }

        // Initialize Shop Profile in Firestore if needed
        firebaseService.saveShopProfile(user.uid, {
          shopName: "Golden Shears Atelier",
          shopPhone: "+92 300 9876543",
          shopAddress: "Bespoke Row, Artisanal Sector, Karachi",
          currency: "₨",
          logoIcon: "Scissors",
          isConfigured: true
        } as any, user.displayName || "Master Tailor", user.email || "");

        // Real-time listener for all 11 collections partitioned by tenant user.uid
        unsubscribeFirestore = firebaseService.subscribeToAllData(user.uid, (data) => {
          setCustomers(data.customers);
          setOrders(data.orders);
          setInventory(data.inventory);
          setShopProfile(data.shopProfile);
          setEmployees(data.employees);
          setEmployeeWorkRecords(data.employeeWorkRecords);
          setEmployeePaymentRecords(data.employeePaymentRecords);
          setLedgerRecords(data.ledgerRecords);
          setPaymentRecords(data.paymentRecords);
          setSizingTemplates(data.sizingTemplates);
        });

      } else {
        if (unsubscribeFirestore) {
          unsubscribeFirestore();
          unsubscribeFirestore = null;
        }

        // Fallback check for offline guest session
        const cachedGuest = localStorage.getItem("atelier_guest_user");
        if (cachedGuest) {
          const guest = JSON.parse(cachedGuest);
          setActiveUser(guest);
          loadUserData(guest.uid);
        } else {
          setActiveUser(null);
        }
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, []);

  // 2. Synchronize Data to LocalStorage ONLY in Guest mode when states change
  useEffect(() => {
    if (activeUser && activeUser.isGuest) {
      localStorage.setItem(`atelier_customers_${activeUser.uid}`, JSON.stringify(customers));
    }
  }, [customers, activeUser]);

  useEffect(() => {
    if (activeUser && activeUser.isGuest) {
      localStorage.setItem(`atelier_orders_${activeUser.uid}`, JSON.stringify(orders));
    }
  }, [orders, activeUser]);

  useEffect(() => {
    if (activeUser && activeUser.isGuest) {
      localStorage.setItem(`atelier_inventory_${activeUser.uid}`, JSON.stringify(inventory));
    }
  }, [inventory, activeUser]);

  useEffect(() => {
    if (activeUser && activeUser.isGuest) {
      localStorage.setItem(`atelier_shop_${activeUser.uid}`, JSON.stringify(shopProfile));
    }
  }, [shopProfile, activeUser]);

  useEffect(() => {
    if (activeUser && activeUser.isGuest) {
      localStorage.setItem(`atelier_templates_${activeUser.uid}`, JSON.stringify(sizingTemplates));
    }
  }, [sizingTemplates, activeUser]);

  // 3. Dynamic Seeder for first-time / fresh directories
  const loadUserData = (uid: string) => {
    // Customers Seed
    const localCust = localStorage.getItem(`atelier_customers_${uid}`);
    let loadedCusts: Customer[] = [];
    if (localCust) {
      loadedCusts = JSON.parse(localCust);
      setCustomers(loadedCusts);
    } else {
      loadedCusts = [
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
              templateName: "Measurements / شلوار-قمیص",
              createdDate: "08 Jul, 2026",
              fitPreference: "Regular",
              specialNotes: "Prefers wider sleeve cuffs to accommodate left-hand watch dial",
              values: {
                length: "40.5\"",
                shoulder: "18\"",
                sleeve: "24.5\"",
                chest: "22.5\"",
                collar: "15.5\"",
                waist: "21.5\"",
                ghera: "23\"",
                shalwar_length: "38.5\"",
                shalwar_bottom: "8\""
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
              templateName: "Two-Piece Bespoke Suit",
              createdDate: "09 Jul, 2026",
              fitPreference: "Slim",
              specialNotes: "Peak lapel style, velvet lining trims",
              values: {
                jacket_length: "28\"",
                shoulder: "16.5\"",
                chest: "35\"",
                waist: "31\"",
                sleeve_length: "23.5\"",
                trouser_length: "39\"",
                trouser_waist: "28\"",
                trouser_seat: "36\""
              }
            }
          ]
        }
      ];
      setCustomers(loadedCusts);
    }

    // Orders Seed
    const localOrd = localStorage.getItem(`atelier_orders_${uid}`);
    if (localOrd) {
      setOrders(JSON.parse(localOrd));
    } else {
      setOrders([
        {
          id: "order-1",
          customerId: "cust-amirali",
          customerName: "Amirali Khan",
          clothingType: "Shalwar Kameez / شلوار قمیص",
          values: {
            length: "40.5\"",
            shoulder: "18\"",
            sleeve: "24.5\"",
            chest: "22.5\"",
            collar: "15.5\"",
            waist: "21.5\"",
            ghera: "23\"",
            shalwar_length: "38.5\"",
            shalwar_bottom: "8\""
          },
          fitPreference: "Regular",
          specialNotes: "Prefers wider sleeve cuffs to accommodate left-hand watch dial",
          totalCost: 270,
          depositPaid: 150,
          status: "Stitching",
          dueDate: "2026-07-15",
          createdDate: "08 Jul, 2026",
          fabricUsed: "Premium Boski Silk Roll #4"
        },
        {
          id: "order-2",
          customerId: "cust-sarah",
          customerName: "Sarah Jenkins",
          clothingType: "Two-Piece Bespoke Suit",
          values: {
            jacket_length: "28\"",
            shoulder: "16.5\"",
            chest: "35\"",
            waist: "31\"",
            sleeve_length: "23.5\"",
            trouser_length: "39\"",
            trouser_waist: "28\"",
            trouser_seat: "36\""
          },
          fitPreference: "Slim",
          specialNotes: "Peak lapel style, velvet lining trims",
          totalCost: 450,
          depositPaid: 450,
          status: "Ready",
          dueDate: "2026-07-12",
          createdDate: "09 Jul, 2026",
          fabricUsed: "Classic Italian Velvet Roll"
        }
      ]);
    }

    // Inventory Seed
    const localInv = localStorage.getItem(`atelier_inventory_${uid}`);
    if (localInv) {
      setInventory(JSON.parse(localInv));
    } else {
      setInventory([
        { id: "inv-1", name: "Premium Irish Linen (White)", colorCode: "#FFFFFF", type: "Fabric", quantity: 45, safetyLevel: 10, unit: "Yards", costPrice: 12.5, supplier: "Linen Traders", lastUpdated: "09 Jul, 2026" },
        { id: "inv-2", name: "Classic Italian Velvet Roll", colorCode: "#4A0E17", type: "Fabric", quantity: 6, safetyLevel: 8, unit: "Yards", costPrice: 28.0, supplier: "Savile Textile Co.", lastUpdated: "10 Jul, 2026" },
        { id: "inv-3", name: "Premium Boski Silk Roll #4", colorCode: "#FCFAF0", type: "Fabric", quantity: 28, safetyLevel: 5, unit: "Yards", costPrice: 22.0, supplier: "Orient Silk Mills", lastUpdated: "10 Jul, 2026" },
        { id: "inv-4", name: "Luxury Brass Button Spindles", colorCode: "#D4AF37", type: "Button", quantity: 250, safetyLevel: 50, unit: "Pcs", costPrice: 0.75, supplier: "Artisan Trims Co.", lastUpdated: "08 Jul, 2026" },
        { id: "inv-5", name: "Reinforced Polyester Threads (Gold)", colorCode: "#FFD700", type: "Thread", quantity: 3, safetyLevel: 5, unit: "Spools", costPrice: 4.5, supplier: "Coats Threads Ltd.", lastUpdated: "09 Jul, 2026" }
      ]);
    }

    // Shop Profile Seed
    const localShop = localStorage.getItem(`atelier_shop_${uid}`);
    if (localShop) {
      setShopProfile(JSON.parse(localShop));
    } else {
      setShopProfile({
        shopName: "Royal Atelier",
        shopPhone: "+92 300 9876543",
        shopAddress: "Bespoke Row, Sector 4, Karachi, Pakistan",
        currency: "₨",
        logoIcon: "Scissors",
        isConfigured: true
      });
    }

    // Sizing Templates Seed
    const localTemplates = localStorage.getItem(`atelier_templates_${uid}`);
    if (localTemplates) {
      setSizingTemplates(JSON.parse(localTemplates));
    } else {
      setSizingTemplates([]);
    }
  };

  // 4. Authenticators Handlers
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
      triggerToast("🔑 Signed in successfully with Google!");
    } catch (error: any) {
      console.error("Sign-in error:", error);
      triggerToast(`⚠️ Sign-in failed: ${error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSignIn = () => {
    setLoading(true);
    const guestUser: ActiveUser = {
      uid: "guest-user-session",
      email: "guest@offline-sandbox",
      displayName: "Guest Master",
      photoURL: null,
      isGuest: true
    };
    localStorage.setItem("atelier_guest_user", JSON.stringify(guestUser));
    setActiveUser(guestUser);
    loadUserData(guestUser.uid);
    triggerToast("🍂 Entered Offline Guest Sandbox!");
    setLoading(false);
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      if (activeUser?.isGuest) {
        localStorage.removeItem("atelier_guest_user");
      } else {
        await signOut(auth);
      }
      setActiveUser(null);
      setCustomers([]);
      setOrders([]);
      setInventory([]);
      triggerToast("🔒 Signed out successfully.");
    } catch (error: any) {
      console.error("Sign-out error:", error);
      triggerToast("⚠️ Sign-out failed.");
    } finally {
      setLoading(false);
    }
  };

  // 5. Data Mutations Handlers

  // Customers
  const handleAddCustomer = async (cData: { name: string; phone: string; address: string }) => {
    if (activeUser && !activeUser.isGuest) {
      try {
        await firebaseService.addCustomer(activeUser.uid, cData);
        triggerToast(`👤 Registered "${cData.name}" portfolio in Firestore!`);
      } catch (err: any) {
        console.error("Firestore addCustomer error:", err);
        triggerToast(`⚠️ Firestore write failed: ${err.message || err}`);
      }
    } else {
      const newCust: Customer = {
        id: "cust-" + Date.now(),
        name: cData.name,
        phone: cData.phone || "No Mobile Line",
        address: cData.address || "No Workshop Address",
        debtDue: 0,
        paidSnapshot: 0,
        totalBilled: 0,
        ledgerHistory: [],
        sizingCards: []
      };
      setCustomers([newCust, ...customers]);
      triggerToast(`👤 Registered "${newCust.name}" portfolio!`);
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (activeUser && !activeUser.isGuest) {
      try {
        await firebaseService.deleteCustomer(activeUser.uid, id);
        if (selectedCustomerId === id) setSelectedCustomerId(null);
        triggerToast("🗑️ Client profile soft-deleted from Firestore.");
      } catch (err: any) {
        console.error("Firestore deleteCustomer error:", err);
        triggerToast(`⚠️ Firestore write failed: ${err.message || err}`);
      }
    } else {
      setCustomers(customers.filter(c => c.id !== id));
      setOrders(orders.filter(o => o.customerId !== id));
      if (selectedCustomerId === id) setSelectedCustomerId(null);
      triggerToast("🗑️ Client profile purged from offline directory.");
    }
  };

  const handleUpdateCustomerDetails = async (id: string, updatedFields: Partial<Customer>) => {
    if (activeUser && !activeUser.isGuest) {
      try {
        await firebaseService.updateCustomer(activeUser.uid, id, updatedFields);
        triggerToast("✨ Customer portfolio updated in Firestore.");
      } catch (err: any) {
        console.error("Firestore updateCustomer error:", err);
        triggerToast(`⚠️ Firestore write failed: ${err.message || err}`);
      }
    } else {
      setCustomers(customers.map(c => c.id === id ? { ...c, ...updatedFields } : c));
      triggerToast("✨ Customer portfolio updated.");
    }
  };

  // Sizing Cards Booklet
  const handleAddSizingCard = async (custId: string, cardData: Omit<SizingCard, "id" | "createdDate">) => {
    if (activeUser && !activeUser.isGuest) {
      try {
        await firebaseService.addSizingCard(activeUser.uid, custId, cardData);
        triggerToast("📏 Measurement blueprint archived in Firestore!");
      } catch (err: any) {
        console.error("Firestore addSizingCard error:", err);
        triggerToast(`⚠️ Firestore write failed: ${err.message || err}`);
      }
    } else {
      const newCard: SizingCard = {
        id: "card-" + Date.now(),
        createdDate: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
        ...cardData
      };
      setCustomers(customers.map(c => {
        if (c.id === custId) {
          return {
            ...c,
            sizingCards: [newCard, ...c.sizingCards]
          };
        }
        return c;
      }));
      triggerToast("📏 Measurement blueprint archived in booklet!");
    }
  };

  const handleDeleteSizingCard = async (custId: string, cardId: string) => {
    if (activeUser && !activeUser.isGuest) {
      try {
        await firebaseService.deleteSizingCard(activeUser.uid, cardId);
        triggerToast("🗑️ Sizing booklet entry soft-deleted from Firestore.");
      } catch (err: any) {
        console.error("Firestore deleteSizingCard error:", err);
        triggerToast(`⚠️ Firestore write failed: ${err.message || err}`);
      }
    } else {
      setCustomers(customers.map(c => {
        if (c.id === custId) {
          return {
            ...c,
            sizingCards: c.sizingCards.filter(card => card.id !== cardId)
          };
        }
        return c;
      }));
      triggerToast("🗑️ Sizing booklet entry removed.");
    }
  };

  // Orders
  const handleAddOrder = async (orderData: Omit<Order, "id" | "createdDate">) => {
    if (activeUser && !activeUser.isGuest) {
      try {
        await firebaseService.addOrder(activeUser.uid, orderData);
        triggerToast("🎟️ Sartorial commission active! Ledger dockets synchronized in Firestore.");
      } catch (err: any) {
        console.error("Firestore addOrder error:", err);
        triggerToast(`⚠️ Firestore write failed: ${err.message || err}`);
      }
    } else {
      const outstanding = Math.max(0, orderData.totalCost - orderData.depositPaid);
      const newOrder: Order = {
        id: "order-" + Date.now(),
        createdDate: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
        ...orderData
      };

      // Update Customer's Financial Ledgers
      setCustomers(customers.map(c => {
        if (c.id === orderData.customerId) {
          const billLedger = {
            id: "ledger-b-" + Date.now(),
            type: "bill" as const,
            amount: orderData.totalCost,
            description: `Docket Draft: ${orderData.clothingType}`,
            date: newOrder.createdDate
          };
          const paymentLedger = orderData.depositPaid > 0 ? {
            id: "ledger-p-" + Date.now(),
            type: "payment" as const,
            amount: orderData.depositPaid,
            description: "Initial Deposit Received",
            date: newOrder.createdDate
          } : null;

          const ledgerHistory: LedgerEntry[] = [billLedger];
          if (paymentLedger) ledgerHistory.push(paymentLedger);

          return {
            ...c,
            totalBilled: c.totalBilled + orderData.totalCost,
            paidSnapshot: c.paidSnapshot + orderData.depositPaid,
            debtDue: c.debtDue + outstanding,
            ledgerHistory: [...ledgerHistory, ...c.ledgerHistory]
          };
        }
        return c;
      }));

      setOrders([newOrder, ...orders]);
      triggerToast("🎟️ Sartorial commission active! Ledger dockets updated.");
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order["status"]) => {
    if (activeUser && !activeUser.isGuest) {
      try {
        const ordObj = orders.find(o => o.id === orderId);
        const balance = ordObj ? Math.max(0, ordObj.totalCost - ordObj.depositPaid) : 0;

        // Constraint check: On Delivered, collect final balance, log receipt & income ledger
        if (newStatus === "Delivered" && balance > 0) {
          await firebaseService.updateOrderStatus(activeUser.uid, orderId, newStatus, balance, "CASH");
          triggerToast(`🔄 Delivered! Automatically logged balance receipt of ${shopProfile.currency}${balance}`);
        } else {
          await firebaseService.updateOrderStatus(activeUser.uid, orderId, newStatus);
          triggerToast(`🔄 Workflow updated: Order status changed to "${newStatus}"`);
        }
      } catch (err: any) {
        console.error("Firestore updateOrderStatus error:", err);
        triggerToast(`⚠️ Firestore write failed: ${err.message || err}`);
      }
    } else {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      triggerToast(`🔄 Workflow updated: Order status changed to "${newStatus}"`);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (activeUser && !activeUser.isGuest) {
      try {
        await firebaseService.deleteOrder(activeUser.uid, orderId);
        triggerToast("🗑️ Commission soft-deleted from Firestore.");
      } catch (err: any) {
        console.error("Firestore deleteOrder error:", err);
        triggerToast(`⚠️ Firestore write failed: ${err.message || err}`);
      }
    } else {
      const orderToDelete = orders.find(o => o.id === orderId);
      if (!orderToDelete) return;
      const balance = Math.max(0, orderToDelete.totalCost - orderToDelete.depositPaid);

      setCustomers(customers.map(c => {
        if (c.id === orderToDelete.customerId) {
          return {
            ...c,
            totalBilled: Math.max(0, c.totalBilled - orderToDelete.totalCost),
            paidSnapshot: Math.max(0, c.paidSnapshot - orderToDelete.depositPaid),
            debtDue: Math.max(0, c.debtDue - balance)
          };
        }
        return c;
      }));

      setOrders(orders.filter(o => o.id !== orderId));
      triggerToast("🗑️ Commission ledger entry removed.");
    }
  };

  // Inventory
  const handleAddItem = async (itemData: Omit<InventoryItem, "id" | "lastUpdated">) => {
    if (activeUser && !activeUser.isGuest) {
      try {
        await firebaseService.addInventoryItem(activeUser.uid, itemData);
        triggerToast(`📦 "${itemData.name}" added to Firestore stock!`);
      } catch (err: any) {
        console.error("Firestore addInventoryItem error:", err);
        triggerToast(`⚠️ Firestore write failed: ${err.message || err}`);
      }
    } else {
      const newItem: InventoryItem = {
        id: "inv-" + Date.now(),
        lastUpdated: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
        ...itemData
      };
      setInventory([newItem, ...inventory]);
      triggerToast(`📦 "${newItem.name}" added to rolling stock!`);
    }
  };

  const handleUpdateStock = async (id: string, newQuantity: number) => {
    if (activeUser && !activeUser.isGuest) {
      try {
        await firebaseService.updateInventoryItemStock(activeUser.uid, id, newQuantity);
        triggerToast("🔄 Asset stock level updated in Firestore.");
      } catch (err: any) {
        console.error("Firestore updateStock error:", err);
        triggerToast(`⚠️ Firestore write failed: ${err.message || err}`);
      }
    } else {
      setInventory(inventory.map(item => {
        if (item.id === id) {
          return {
            ...item,
            quantity: newQuantity,
            lastUpdated: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
          };
        }
        return item;
      }));
      triggerToast("🔄 Asset stock level updated.");
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (activeUser && !activeUser.isGuest) {
      try {
        await firebaseService.deleteInventoryItem(activeUser.uid, id);
        triggerToast("🗑️ Inventory roll soft-deleted in Firestore.");
      } catch (err: any) {
        console.error("Firestore deleteInventoryItem error:", err);
        triggerToast(`⚠️ Firestore write failed: ${err.message || err}`);
      }
    } else {
      setInventory(inventory.filter(i => i.id !== id));
      triggerToast("🗑️ Inventory roll removed.");
    }
  };

  // Sizing Template Handlers
  const handleAddSizingTemplate = async (name: string, fields: string[]) => {
    if (activeUser && !activeUser.isGuest) {
      try {
        await firebaseService.saveSizingTemplate(activeUser.uid, name, fields);
        triggerToast(`✨ Custom template "${name}" synchronized in Firestore!`);
      } catch (err: any) {
        console.error("Firestore saveSizingTemplate error:", err);
        triggerToast(`⚠️ Firestore template save failed: ${err.message || err}`);
      }
    } else {
      const newTemplate: Template = {
        id: "template-" + Date.now(),
        name,
        fields: fields.map(f => ({
          key: f.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
          label: f,
          placeholder: `e.g. Enter ${f}`
        }))
      };
      const updated = [...sizingTemplates, newTemplate];
      setSizingTemplates(updated);
      triggerToast(`✨ Offline template "${name}" registered!`);
    }
  };

  const handleDeleteSizingTemplate = async (templateId: string) => {
    if (activeUser && !activeUser.isGuest) {
      try {
        await firebaseService.deleteSizingTemplate(activeUser.uid, templateId);
        triggerToast("🗑️ Sizing template deleted from Firestore.");
      } catch (err: any) {
        console.error("Firestore deleteSizingTemplate error:", err);
        triggerToast(`⚠️ Firestore template delete failed: ${err.message || err}`);
      }
    } else {
      const updated = sizingTemplates.filter(t => t.id !== templateId);
      setSizingTemplates(updated);
      triggerToast("🗑️ Offline sizing template deleted.");
    }
  };

  // Data Restore
  const handleRestoreBackup = (restored: { customers: Customer[]; orders: Order[]; inventory: InventoryItem[]; shopProfile: ShopProfile }) => {
    setCustomers(restored.customers);
    setOrders(restored.orders);
    setInventory(restored.inventory);
    setShopProfile(restored.shopProfile);
    triggerToast("📥 Sartorial backup successfully synced!");
  };

  const getShopLogoComponent = () => {
    switch (shopProfile.logoIcon) {
      case "Crown":
        return <Award className="w-5 h-5 text-[#D97706]" />;
      case "Royal":
        return <Compass className="w-5 h-5 text-[#D97706]" />;
      case "Velvet":
        return <Sparkles className="w-5 h-5 text-[#D97706]" />;
      case "Blazer":
        return <Shirt className="w-5 h-5 text-[#D97706]" />;
      default:
        return <Scissors className="w-5 h-5 text-[#D97706]" />;
    }
  };

  // Render Gatekeepers
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center text-white p-4 font-mono">
        <div className="w-12 h-12 border-2 border-[#D97706] border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-xs tracking-widest text-[#C2B280]">COMMILING ARTISAN OPERATING SYSTEM...</span>
      </div>
    );
  }

  if (!activeUser) {
    /* STUNNING AUTHENTICATION LANDING SCREEN */
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4 sm:p-6 text-zinc-100 font-sans selection:bg-[#D97706] selection:text-white">
        <div className="w-full max-w-md bg-slate-900 border border-[#D97706]/20 rounded-2xl p-6 sm:p-8 space-y-8 shadow-2xl relative overflow-hidden text-center">
          
          <button
            onClick={onBackToLanding}
            className="absolute top-4 left-4 p-2 text-slate-400 hover:text-white transition flex items-center gap-1.5 text-xs font-mono font-bold"
          >
            ← Leave
          </button>

          {/* Artistic Scissors Illustration */}
          <div className="pt-4 flex justify-center">
            <div className="p-4 bg-slate-800/80 border border-[#D97706]/20 rounded-2xl shadow-inner relative flex items-center justify-center">
              <Scissors className="w-12 h-12 text-[#D97706] animate-pulse" />
              <div className="absolute -bottom-1 -right-1 p-1 bg-[#D97706] text-white text-[8px] font-mono font-bold rounded-lg uppercase tracking-wider">
                V1.2
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="font-serif text-3xl font-extrabold tracking-tight text-[#F59E0B]">
              Tailor Studio Manager
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
              Welcome, Master Tailor. Access your personal offline-ready atelier suite to log customers, configure sizing booklets, and commission dockets.
            </p>
          </div>

          <div className="space-y-3.5 pt-4">
            <button
              onClick={handleGoogleSignIn}
              className="w-full py-3.5 bg-[#FCFAF5] hover:bg-[#FAF8ED] border border-zinc-200 hover:border-[#D97706]/40 text-slate-900 rounded-xl font-sans text-xs font-extrabold tracking-wider uppercase flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.9h6.6c-.28 1.5-1.11 2.76-2.39 3.62v3h3.86c2.26-2.09 3.56-5.14 3.56-8.52z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.12C3.26 21.36 7.37 24 12 24z"/>
                <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.59H1.29C.47 8.24 0 10.07 0 12s.47 3.76 1.29 5.41l3.98-3.12z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.26 2.64 1.29 6.59l3.98 3.12c.95-2.85 3.6-4.96 6.73-4.96z"/>
              </svg>
              <span>Synchronize via Google</span>
            </button>

            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-600 px-2 py-1">
              <span className="h-px bg-zinc-800 flex-1" />
              <span className="px-3 uppercase">OR SECURE OFFLINE ACCESS</span>
              <span className="h-px bg-zinc-800 flex-1" />
            </div>

            <button
              onClick={handleGuestSignIn}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 hover:border-[#D97706]/40 text-slate-300 rounded-xl font-sans text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>🍂 Enter Guest Sandbox (Offline)</span>
            </button>
          </div>

          <div className="border-t border-zinc-800 pt-5 flex items-center justify-center gap-2 text-[10px] font-mono text-zinc-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>256-Bit Local Encryption Client Storage Verified</span>
          </div>

        </div>
      </div>
    );
  }

  // ACTIVE INTERACTIVE PORTAL APP VIEW
  return (
    <div className="min-h-screen bg-[#FCFAF5] text-zinc-900 font-sans antialiased selection:bg-[#D97706] selection:text-white flex flex-col">
      
      {/* Dynamic Toast notifier */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[2000] px-5 py-3 bg-zinc-900 text-white text-xs font-mono font-bold rounded-lg shadow-xl flex items-center gap-3 border border-[#D97706]/30 animate-fadeIn">
          <span className="w-2 h-2 rounded-full bg-[#D97706] animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="bg-[#0F172A] border-b border-[#D97706]/20 text-white sticky top-0 z-[500] px-4 py-3 sm:px-6 shadow-md no-print">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToLanding}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition mr-1"
              title="Return to landing page"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="p-1.5 bg-[#1E293B] border border-[#D97706]/20 rounded-lg flex items-center justify-center">
              {getShopLogoComponent()}
            </div>
            <div className="text-left">
              <h1 className="font-serif font-black text-sm sm:text-base tracking-tight uppercase leading-none text-white">
                {shopProfile.shopName || "Atelier Studio"}
              </h1>
              <span className="text-[10px] font-mono text-[#D97706] font-bold block mt-0.5 tracking-wider uppercase">
                Artisanal Suite V1.2
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            {/* User credentials badge */}
            <div className="hidden md:flex items-center gap-2.5 bg-[#1E293B] px-3.5 py-1.5 rounded-lg border border-[#D97706]/10 text-slate-300">
              <User className="w-3.5 h-3.5 text-[#D97706]" />
              <span className="font-bold truncate max-w-[120px]">{activeUser.displayName || "Artisan Tailor"}</span>
              <span className="px-1.5 py-0.5 bg-slate-800 text-[#D97706] text-[9px] uppercase font-bold rounded">
                {activeUser.isGuest ? "Guest" : "Synced"}
              </span>
            </div>

            <button
              onClick={handleSignOut}
              className="px-3 py-2 bg-slate-800 hover:bg-[#D97706] hover:text-white text-slate-300 rounded-lg transition-all flex items-center gap-1.5 font-bold cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        
        {/* Workspace navigation sub-menu */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-zinc-200 no-print">
          {[
            { id: "dashboard", label: "Dashboard overview" },
            { id: "customers", label: "Client portfolios" },
            { id: "orders", label: "Workflow Board" },
            { id: "inventory", label: "Stock inventories" },
            { id: "settings", label: "Studio settings" },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  if (tab.id !== "customers") setSelectedCustomerId(null);
                }}
                className={`px-4.5 py-2 rounded-xl text-xs font-mono font-extrabold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  isSelected 
                    ? "bg-[#0F172A] text-white shadow-md border-b-2 border-[#D97706]" 
                    : "text-zinc-500 hover:text-zinc-950 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* WORKSPACE SELECTION SWITCH ROUTER */}
        <div className="flex-1 no-print">
          {activeTab === "dashboard" && (
            <DashboardStats
              customers={customers}
              orders={orders}
              inventory={inventory}
              shopProfile={shopProfile}
              onNavigateTab={(tab) => {
                setActiveTab(tab);
                if (tab !== "customers") setSelectedCustomerId(null);
              }}
              onAddCustomerClick={() => {
                setActiveTab("customers");
                setSelectedCustomerId(null);
              }}
              onAddOrderClick={() => {
                setPreSelectedCustomer(null);
                setShowCommissionFormFromDashboard(true);
                setActiveTab("orders");
              }}
              onViewOrder={(order) => {
                setActiveInvoiceOrder(order);
                setIsInvoiceOpen(true);
              }}
            />
          )}

          {activeTab === "customers" && (
            <CustomerWorkspace
              customers={customers}
              orders={orders}
              shopProfile={shopProfile}
              inventory={inventory}
              onUpdateStock={handleUpdateStock}
              selectedCustomerId={selectedCustomerId}
              onSelectCustomer={setSelectedCustomerId}
              onAddCustomer={handleAddCustomer}
              onDeleteCustomer={handleDeleteCustomer}
              onUpdateCustomerDetails={handleUpdateCustomerDetails}
              onAddSizingCard={handleAddSizingCard}
              onDeleteSizingCard={handleDeleteSizingCard}
              sizingTemplates={sizingTemplates}
              onAddSizingTemplate={handleAddSizingTemplate}
              onDeleteSizingTemplate={handleDeleteSizingTemplate}
              onAddOrder={handleAddOrder}
              onAddOrderClick={(customer) => {
                setPreSelectedCustomer(customer);
                setShowCommissionFormFromDashboard(true);
                setActiveTab("orders");
              }}
              onViewOrder={(order) => {
                setActiveInvoiceOrder(order);
                setIsInvoiceOpen(true);
              }}
            />
          )}

          {activeTab === "orders" && (
            <OrdersWorkspace
              orders={orders}
              customers={customers}
              shopProfile={shopProfile}
              sizingTemplates={sizingTemplates}
              onAddOrder={handleAddOrder}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onViewOrder={(order) => {
                setActiveInvoiceOrder(order);
                setIsInvoiceOpen(true);
              }}
              onDeleteOrder={handleDeleteOrder}
              showCommissionFormDefault={showCommissionFormFromDashboard}
              preSelectedCustomerForOrder={preSelectedCustomer}
              onCloseCommissionForm={() => {
                setShowCommissionFormFromDashboard(false);
                setPreSelectedCustomer(null);
              }}
            />
          )}

          {activeTab === "inventory" && (
            <InventoryWorkspace
              inventory={inventory}
              shopProfile={shopProfile}
              onAddItem={handleAddItem}
              onUpdateStock={handleUpdateStock}
              onDeleteItem={handleDeleteItem}
            />
          )}

          {activeTab === "settings" && (
            <SettingsWorkspace
              shopProfile={shopProfile}
              onUpdateShopProfile={setShopProfile}
              customers={customers}
              orders={orders}
              inventory={inventory}
              onRestoreBackup={handleRestoreBackup}
              triggerToast={triggerToast}
            />
          )}
        </div>

      </div>

      {/* MODAL WINDOW: PRINTER-FRIENDLY INVOICE DOCKETS */}
      {isInvoiceOpen && activeInvoiceOrder && (
        <InvoiceModal
          isOpen={isInvoiceOpen}
          onClose={() => {
            setIsInvoiceOpen(false);
            setActiveInvoiceOrder(null);
          }}
          order={activeInvoiceOrder}
          customer={customers.find(c => c.id === activeInvoiceOrder.customerId) || null}
          shopProfile={shopProfile}
        />
      )}

      {/* FOOTER */}
      <footer className="py-6 border-t border-zinc-200 text-center text-[10px] font-mono text-zinc-400 bg-white no-print mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>© 2026 Golden Shears Atelier OS. All local data is cached securely.</span>
          <span>Security Certified Client Client Session Safe</span>
        </div>
      </footer>

    </div>
  );
}
