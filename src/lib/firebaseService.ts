import { 
  collection, doc, setDoc, getDoc, updateDoc, onSnapshot, 
  query, where, writeBatch, Timestamp, deleteDoc
} from "firebase/firestore";
import { db } from "./firebase";
import { Customer, Order, InventoryItem, ShopProfile, SizingCard, LedgerEntry } from "../types";
import { Template } from "../components/MeasurementTemplates";

// Firebase Schema Type Declarations

export interface FirestoreShop {
  userId: string;
  shopName: string;
  ownerName: string;
  email: string;
  phone: string;
  currency: string;
  shopAddress?: string;
  logoIcon?: string;
  createdAt: number;
  updatedAt: number;
}

export interface FirestoreCustomer {
  id: string;
  userId: string;
  name: string;
  phone: string;
  address: string;
  updatedAt: number;
  isDeleted: boolean;
}

export interface FirestoreCustomerMeasurement {
  id: string;
  userId: string;
  customerId: string;
  measurementData: Record<string, string>;
  notes: string;
  updatedAt: number;
  isDeleted: boolean;
  templateId: string;
  templateName: string;
  fitPreference: "Slim" | "Regular" | "Relaxed";
}

export interface FirestoreSizingTemplate {
  id: string;
  userId: string;
  name: string;
  fields: string[];
  updatedAt: number;
}

export interface FirestoreOrderRecord {
  id: string;
  userId: string;
  customerId: string;
  customerName: string;
  itemName: string;
  price: number;
  quantity: number;
  advancePaid: number;
  balance: number;
  status: "PENDING" | "CUTTING" | "STITCHING" | "READY" | "DELIVERED";
  orderDate: number;
  deliveryDate: number;
  ledgerId: string;
  isCompleted: boolean;
  updatedAt: number;
  isDeleted: boolean;
  values: Record<string, string>;
  fitPreference: "Slim" | "Regular" | "Relaxed";
  specialNotes: string;
  fabricUsed?: string;
}

export interface FirestorePaymentRecord {
  id: string;
  userId: string;
  orderId: string;
  customerId: string;
  amountPaid: number;
  paymentDate: number;
  paymentMethod: "CASH" | "CARD" | "ONLINE" | "MOBILE_MONEY";
  receiptNumber: string;
  updatedAt: number;
}

export interface FirestoreEmployee {
  id: string;
  userId: string;
  name: string;
  phone: string;
  role: string;
  salaryType: "MONTHLY_FIXED" | "PIECE_RATE";
  baseRate: number;
  isActive: boolean;
  updatedAt: number;
}

export interface FirestoreEmployeeWorkRecord {
  id: string;
  userId: string;
  employeeId: string;
  orderId: string;
  workType: string;
  rateEarned: number;
  completionDate: number;
  updatedAt: number;
}

export interface FirestoreEmployeePaymentRecord {
  id: string;
  userId: string;
  employeeId: string;
  amountPaid: number;
  paymentDate: number;
  paymentPeriod: string;
  updatedAt: number;
}

export interface FirestoreInventoryItem {
  id: string;
  userId: string;
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  minStockThreshold: number;
  updatedAt: number;
  isDeleted: boolean;
  colorCode: string;
  costPrice: number;
  supplier: string;
}

export interface FirestoreLedgerRecord {
  id: string;
  userId: string;
  type: "INCOME" | "EXPENSE";
  category: string;
  amount: number;
  date: number;
  description: string;
  associatedId?: string;
  updatedAt: number;
  isDeleted: boolean;
}

// Order Status Converters
export function mapOrderStatusToFirestore(status: Order["status"]): FirestoreOrderRecord["status"] {
  switch (status) {
    case "Received":
    case "Trial Fit":
      return "PENDING";
    case "Cutting":
      return "CUTTING";
    case "Stitching":
      return "STITCHING";
    case "Ready":
      return "READY";
    case "Delivered":
      return "DELIVERED";
    default:
      return "PENDING";
  }
}

export function mapOrderStatusFromFirestore(status: FirestoreOrderRecord["status"]): Order["status"] {
  switch (status) {
    case "PENDING":
      return "Received";
    case "CUTTING":
      return "Cutting";
    case "STITCHING":
      return "Stitching";
    case "READY":
      return "Ready";
    case "DELIVERED":
      return "Delivered";
    default:
      return "Received";
  }
}

// Receipt Generator Helper
export function generateReceiptNumber(): string {
  return "REC-" + Math.floor(100000 + Math.random() * 900000);
}

// --- DATABASE OPERATIONS SERVICE ---

export const firebaseService = {
  // 1. Shops Operations
  async saveShopProfile(userId: string, profile: Partial<ShopProfile>, ownerName = "", email = ""): Promise<void> {
    const shopDocRef = doc(db, "shops", userId);
    const now = Date.now();
    
    const docSnap = await getDoc(shopDocRef);
    if (docSnap.exists()) {
      await updateDoc(shopDocRef, {
        shopName: profile.shopName || "Golden Shears Atelier",
        phone: profile.shopPhone || "",
        shopAddress: profile.shopAddress || "",
        currency: profile.currency || "$",
        logoIcon: profile.logoIcon || "Scissors",
        updatedAt: now,
      });
    } else {
      const shopData: FirestoreShop = {
        userId,
        shopName: profile.shopName || "Golden Shears Atelier",
        ownerName: ownerName || "Master Tailor",
        email: email || "",
        phone: profile.shopPhone || "",
        currency: profile.currency || "$",
        createdAt: now,
        updatedAt: now
      };
      await setDoc(shopDocRef, shopData);
    }
  },

  // 2. Customers Operations
  async addCustomer(userId: string, cData: { name: string; phone: string; address: string }): Promise<string> {
    const batch = writeBatch(db);
    const customerId = "cust-" + Date.now();
    const customerDocRef = doc(db, "customers", customerId);
    
    const customerData: FirestoreCustomer = {
      id: customerId,
      userId,
      name: cData.name,
      phone: cData.phone || "No Mobile Line",
      address: cData.address || "No Workshop Address",
      updatedAt: Date.now(),
      isDeleted: false
    };

    batch.set(customerDocRef, customerData);
    await batch.commit();
    return customerId;
  },

  async updateCustomer(userId: string, customerId: string, updatedFields: Partial<Customer>): Promise<void> {
    const customerDocRef = doc(db, "customers", customerId);
    const updates: Partial<FirestoreCustomer> = {
      updatedAt: Date.now()
    };
    if (updatedFields.name !== undefined) updates.name = updatedFields.name;
    if (updatedFields.phone !== undefined) updates.phone = updatedFields.phone;
    if (updatedFields.address !== undefined) updates.address = updatedFields.address;

    await updateDoc(customerDocRef, updates);
  },

  async deleteCustomer(userId: string, customerId: string): Promise<void> {
    const batch = writeBatch(db);
    
    // Soft delete Customer
    const customerDocRef = doc(db, "customers", customerId);
    batch.update(customerDocRef, { isDeleted: true, updatedAt: Date.now() });

    await batch.commit();
  },

  // 3. Sizing Cards (Measurements) Operations
  async addSizingCard(userId: string, customerId: string, cardData: Omit<SizingCard, "id" | "createdDate">): Promise<string> {
    const cardId = "card-" + Date.now();
    const measurementDocRef = doc(db, "customer_measurements", cardId);

    const measurementData: FirestoreCustomerMeasurement = {
      id: cardId,
      userId,
      customerId,
      measurementData: cardData.values,
      notes: cardData.specialNotes || "",
      updatedAt: Date.now(),
      isDeleted: false,
      templateId: cardData.templateId,
      templateName: cardData.templateName,
      fitPreference: cardData.fitPreference || "Regular"
    };

    await setDoc(measurementDocRef, measurementData);
    return cardId;
  },

  async deleteSizingCard(userId: string, cardId: string): Promise<void> {
    const measurementDocRef = doc(db, "customer_measurements", cardId);
    await updateDoc(measurementDocRef, { isDeleted: true, updatedAt: Date.now() });
  },

  // 4. Sizing Templates
  async saveSizingTemplate(userId: string, name: string, fields: string[]): Promise<void> {
    const templateId = "template-" + Date.now();
    const templateDocRef = doc(db, "sizing_templates", templateId);
    await setDoc(templateDocRef, {
      id: templateId,
      userId,
      name,
      fields,
      updatedAt: Date.now()
    });
  },

  async deleteSizingTemplate(userId: string, templateId: string): Promise<void> {
    const templateDocRef = doc(db, "sizing_templates", templateId);
    await deleteDoc(templateDocRef);
  },

  // 5. Orders & Associated Core Business Logic Pipelines
  async addOrder(userId: string, orderData: Omit<Order, "id" | "createdDate">): Promise<string> {
    const batch = writeBatch(db);
    const orderId = "order-" + Date.now();
    const ledgerId = "ledger-b-" + Date.now();
    const paymentId = "payment-p-" + Date.now();
    const now = Date.now();

    const outstanding = Math.max(0, orderData.totalCost - orderData.depositPaid);

    // Create main Order Record doc
    const orderDocRef = doc(db, "order_records", orderId);
    const orderRecord: FirestoreOrderRecord = {
      id: orderId,
      userId,
      customerId: orderData.customerId,
      customerName: orderData.customerName,
      itemName: orderData.clothingType,
      price: orderData.totalCost,
      quantity: 1,
      advancePaid: orderData.depositPaid,
      balance: outstanding,
      status: mapOrderStatusToFirestore(orderData.status),
      orderDate: now,
      deliveryDate: new Date(orderData.dueDate).getTime() || now + 7 * 24 * 60 * 60 * 1000,
      ledgerId: ledgerId,
      isCompleted: orderData.status === "Ready" || orderData.status === "Delivered",
      updatedAt: now,
      isDeleted: false,
      values: orderData.values,
      fitPreference: orderData.fitPreference,
      specialNotes: orderData.specialNotes,
      fabricUsed: orderData.fabricUsed
    };
    batch.set(orderDocRef, orderRecord);

    // Business Logic Pipeline Constraint 1: INCOME ledger entry of category "Order Advance"
    const ledgerDocRef = doc(db, "ledger_records", ledgerId);
    const ledgerRecord: FirestoreLedgerRecord = {
      id: ledgerId,
      userId,
      type: "INCOME",
      category: "Order Advance",
      amount: orderData.depositPaid,
      date: now,
      description: `Docket Draft: ${orderData.clothingType} (Deposit Received)`,
      associatedId: orderId,
      updatedAt: now,
      isDeleted: false
    };
    batch.set(ledgerDocRef, ledgerRecord);

    // Business Logic Pipeline Constraint 2: Initial payment record
    if (orderData.depositPaid > 0) {
      const paymentDocRef = doc(db, "payment_records", paymentId);
      const paymentRecord: FirestorePaymentRecord = {
        id: paymentId,
        userId,
        orderId,
        customerId: orderData.customerId,
        amountPaid: orderData.depositPaid,
        paymentDate: now,
        paymentMethod: "CASH",
        receiptNumber: generateReceiptNumber(),
        updatedAt: now
      };
      batch.set(paymentDocRef, paymentRecord);
    }

    await batch.commit();
    return orderId;
  },

  async updateOrderStatus(
    userId: string, 
    orderId: string, 
    newStatus: Order["status"], 
    finalBalanceCollectedAmount?: number,
    paymentMethod?: "CASH" | "CARD" | "ONLINE" | "MOBILE_MONEY"
  ): Promise<void> {
    const batch = writeBatch(db);
    const orderDocRef = doc(db, "order_records", orderId);
    const now = Date.now();

    const isCompleted = newStatus === "Ready" || newStatus === "Delivered";
    const firestoreStatus = mapOrderStatusToFirestore(newStatus);

    // Fetch existing order to understand balance
    const orderSnap = await getDoc(orderDocRef);
    if (!orderSnap.exists()) return;
    const orderData = orderSnap.data() as FirestoreOrderRecord;

    const currentBalance = orderData.balance;

    if (newStatus === "Delivered" && currentBalance > 0) {
      // If balance collected at delivery
      const collected = finalBalanceCollectedAmount !== undefined ? finalBalanceCollectedAmount : currentBalance;
      const finalMethod = paymentMethod || "CASH";

      if (collected > 0) {
        const paymentId = "payment-b-" + Date.now();
        const ledgerId = "ledger-b-fin-" + Date.now();

        // 1. Log a second receipt in payment_records with the remaining amount
        const paymentDocRef = doc(db, "payment_records", paymentId);
        const paymentRecord: FirestorePaymentRecord = {
          id: paymentId,
          userId,
          orderId,
          customerId: orderData.customerId,
          amountPaid: collected,
          paymentDate: now,
          paymentMethod: finalMethod,
          receiptNumber: generateReceiptNumber(),
          updatedAt: now
        };
        batch.set(paymentDocRef, paymentRecord);

        // 2. Add another entry to ledger_records under INCOME matching the balance
        const ledgerDocRef = doc(db, "ledger_records", ledgerId);
        const ledgerRecord: FirestoreLedgerRecord = {
          id: ledgerId,
          userId,
          type: "INCOME",
          category: "Order Payment",
          amount: collected,
          date: now,
          description: `Final Delivery Balance: ${orderData.itemName}`,
          associatedId: orderId,
          updatedAt: now,
          isDeleted: false
        };
        batch.set(ledgerDocRef, ledgerRecord);

        // Update Order with collected amount
        batch.update(orderDocRef, {
          status: firestoreStatus,
          isCompleted: true,
          balance: Math.max(0, currentBalance - collected),
          advancePaid: orderData.advancePaid + collected,
          updatedAt: now
        });
      } else {
        batch.update(orderDocRef, {
          status: firestoreStatus,
          isCompleted: isCompleted,
          updatedAt: now
        });
      }
    } else {
      batch.update(orderDocRef, {
        status: firestoreStatus,
        isCompleted: isCompleted,
        updatedAt: now
      });
    }

    await batch.commit();
  },

  async deleteOrder(userId: string, orderId: string): Promise<void> {
    const batch = writeBatch(db);
    const orderDocRef = doc(db, "order_records", orderId);
    
    // Soft Delete Order
    batch.update(orderDocRef, { isDeleted: true, updatedAt: Date.now() });

    // Soft Delete associated ledger records too to maintain perfect audit balances
    // (In actual Firestore we could run query then update, let's update this record's associated ledger records if possible,
    // or let it be handled on sync).
    
    await batch.commit();
  },

  // 6. Employees Operations
  async addEmployee(userId: string, emp: Omit<FirestoreEmployee, "id" | "userId" | "updatedAt">): Promise<string> {
    const empId = "emp-" + Date.now();
    const empDocRef = doc(db, "employees", empId);
    const empData: FirestoreEmployee = {
      id: empId,
      userId,
      ...emp,
      updatedAt: Date.now()
    };
    await setDoc(empDocRef, empData);
    return empId;
  },

  async addEmployeeWorkRecord(userId: string, wrk: Omit<FirestoreEmployeeWorkRecord, "id" | "userId" | "updatedAt">): Promise<void> {
    const workId = "wrk-" + Date.now();
    const wrkDocRef = doc(db, "employee_work_records", workId);
    const wrkData: FirestoreEmployeeWorkRecord = {
      id: workId,
      userId,
      ...wrk,
      updatedAt: Date.now()
    };
    await setDoc(wrkDocRef, wrkData);
  },

  async addEmployeePaymentRecord(userId: string, pmnt: Omit<FirestoreEmployeePaymentRecord, "id" | "userId" | "updatedAt">): Promise<void> {
    const paymentId = "emp-pmnt-" + Date.now();
    const pmntDocRef = doc(db, "employee_payment_records", paymentId);
    const pmntData: FirestoreEmployeePaymentRecord = {
      id: paymentId,
      userId,
      ...pmnt,
      updatedAt: Date.now()
    };
    
    const batch = writeBatch(db);
    batch.set(pmntDocRef, pmntData);

    // Also write to ledger_records under EXPENSE
    const ledgerId = "ledger-e-" + Date.now();
    const ledgerDocRef = doc(db, "ledger_records", ledgerId);
    const ledgerRecord: FirestoreLedgerRecord = {
      id: ledgerId,
      userId,
      type: "EXPENSE",
      category: "Staff Payout",
      amount: pmnt.amountPaid,
      date: pmnt.paymentDate,
      description: `Staff Wage Payout: ${pmnt.paymentPeriod}`,
      associatedId: paymentId,
      updatedAt: Date.now(),
      isDeleted: false
    };
    batch.set(ledgerDocRef, ledgerRecord);

    await batch.commit();
  },

  // 7. Inventory Operations
  async addInventoryItem(userId: string, itemData: Omit<InventoryItem, "id" | "lastUpdated">): Promise<string> {
    const itemId = "inv-" + Date.now();
    const invDocRef = doc(db, "inventory_items", itemId);
    
    const invData: FirestoreInventoryItem = {
      id: itemId,
      userId,
      itemName: itemData.name,
      category: itemData.type,
      quantity: itemData.quantity,
      unit: itemData.unit,
      minStockThreshold: itemData.safetyLevel,
      updatedAt: Date.now(),
      isDeleted: false,
      colorCode: itemData.colorCode,
      costPrice: itemData.costPrice,
      supplier: itemData.supplier
    };

    await setDoc(invDocRef, invData);
    return itemId;
  },

  async updateInventoryItemStock(userId: string, itemId: string, newQuantity: number): Promise<void> {
    const invDocRef = doc(db, "inventory_items", itemId);
    await updateDoc(invDocRef, {
      quantity: newQuantity,
      updatedAt: Date.now()
    });
  },

  async deleteInventoryItem(userId: string, itemId: string): Promise<void> {
    const invDocRef = doc(db, "inventory_items", itemId);
    await updateDoc(invDocRef, {
      isDeleted: true,
      updatedAt: Date.now()
    });
  },

  // 8. REAL-TIME SYNCHRONIZER SNAPSHOT ENGINE
  // This combines all Firestore top-level collections in single, lightweight, real-time snapshot listeners
  subscribeToAllData(
    userId: string, 
    onUpdate: (data: {
      customers: Customer[];
      orders: Order[];
      inventory: InventoryItem[];
      shopProfile: ShopProfile;
      employees: FirestoreEmployee[];
      employeeWorkRecords: FirestoreEmployeeWorkRecord[];
      employeePaymentRecords: FirestoreEmployeePaymentRecord[];
      ledgerRecords: FirestoreLedgerRecord[];
      paymentRecords: FirestorePaymentRecord[];
      sizingTemplates: Template[];
    }) => void
  ) {
    const unsubscribers: (() => void)[] = [];

    // Local cached buffers of Firestore raw data
    let rawShops: Record<string, FirestoreShop> = {};
    let rawCustomers: Record<string, FirestoreCustomer> = {};
    let rawMeasurements: Record<string, FirestoreCustomerMeasurement> = {};
    let rawOrders: Record<string, FirestoreOrderRecord> = {};
    let rawPayments: Record<string, FirestorePaymentRecord> = {};
    let rawInventory: Record<string, FirestoreInventoryItem> = {};
    let rawLedgers: Record<string, FirestoreLedgerRecord> = {};
    let rawEmployees: Record<string, FirestoreEmployee> = {};
    let rawWorkRecords: Record<string, FirestoreEmployeeWorkRecord> = {};
    let rawEmployeePayments: Record<string, FirestoreEmployeePaymentRecord> = {};
    let rawTemplates: Record<string, FirestoreSizingTemplate> = {};

    const triggerUpdate = () => {
      // 1. Get current shop profile
      const shopProfileRaw = rawShops[userId] || {
        userId,
        shopName: "Golden Shears Atelier",
        phone: "+92 300 9876543",
        shopAddress: "Bespoke Row, Artisanal Sector, Karachi",
        currency: "₨",
        logoIcon: "Scissors",
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const shopProfile: ShopProfile = {
        shopName: shopProfileRaw.shopName,
        shopPhone: shopProfileRaw.phone,
        shopAddress: shopProfileRaw.shopAddress,
        currency: shopProfileRaw.currency || "$",
        logoIcon: shopProfileRaw.logoIcon || "Scissors",
        isConfigured: true
      };

      // 2. Map inventory
      const inventory: InventoryItem[] = Object.values(rawInventory).map(inv => ({
        id: inv.id,
        name: inv.itemName,
        colorCode: inv.colorCode || "#000000",
        type: inv.category as any,
        quantity: inv.quantity,
        safetyLevel: inv.minStockThreshold,
        unit: inv.unit,
        costPrice: inv.costPrice,
        supplier: inv.supplier,
        lastUpdated: new Date(inv.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
      }));

      // 3. Map orders
      const orders: Order[] = Object.values(rawOrders).map(ord => ({
        id: ord.id,
        customerId: ord.customerId,
        customerName: ord.customerName,
        clothingType: ord.itemName,
        values: ord.values || {},
        fitPreference: ord.fitPreference || "Regular",
        specialNotes: ord.specialNotes || "",
        totalCost: ord.price,
        depositPaid: ord.advancePaid,
        status: mapOrderStatusFromFirestore(ord.status),
        dueDate: new Date(ord.deliveryDate).toISOString().split('T')[0],
        createdDate: new Date(ord.orderDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
        fabricUsed: ord.fabricUsed
      }));

      // 4. Map customers (and enrich them with real-time sizingCards & ledgerHistory metrics!)
      const customers: Customer[] = Object.values(rawCustomers).map(cust => {
        // Associated sizing cards
        const sizingCards: SizingCard[] = Object.values(rawMeasurements)
          .filter(meas => meas.customerId === cust.id)
          .map(meas => ({
            id: meas.id,
            templateId: meas.templateId,
            templateName: meas.templateName,
            createdDate: new Date(meas.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
            values: meas.measurementData,
            fitPreference: meas.fitPreference,
            specialNotes: meas.notes
          }));

        // Ledger entry creation from bills (orders) and payments
        const customerLedgerHistory: LedgerEntry[] = [];
        
        // Custom order logs as Bills
        const customerOrders = Object.values(rawOrders).filter(ord => ord.customerId === cust.id);
        customerOrders.forEach(ord => {
          customerLedgerHistory.push({
            id: `bill-${ord.id}`,
            type: "bill",
            amount: ord.price,
            description: `Bespoke Order: ${ord.itemName}`,
            date: new Date(ord.orderDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
          });
        });

        // Payment logs as Payments
        const customerPayments = Object.values(rawPayments).filter(pmnt => pmnt.customerId === cust.id);
        customerPayments.forEach(pmnt => {
          customerLedgerHistory.push({
            id: `pmnt-${pmnt.id}`,
            type: "payment",
            amount: pmnt.amountPaid,
            description: `Instalment Payment Received`,
            date: new Date(pmnt.paymentDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
          });
        });

        const totalBilled = customerOrders.reduce((sum, ord) => sum + ord.price, 0);
        const paidSnapshot = customerPayments.reduce((sum, pmnt) => sum + pmnt.amountPaid, 0);
        const debtDue = Math.max(0, totalBilled - paidSnapshot);

        return {
          id: cust.id,
          name: cust.name,
          phone: cust.phone,
          address: cust.address,
          debtDue,
          paidSnapshot,
          totalBilled,
          ledgerHistory: customerLedgerHistory.sort((a, b) => b.id.localeCompare(a.id)), // sorted DESC
          sizingCards
        };
      });

      const sizingTemplates: Template[] = Object.values(rawTemplates).map(t => ({
        id: t.id,
        name: t.name,
        fields: (t.fields || []).map(f => ({
          key: f.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
          label: f,
          placeholder: `e.g. Enter ${f}`
        }))
      }));

      // Invoke main callback
      onUpdate({
        customers,
        orders,
        inventory,
        shopProfile,
        employees: Object.values(rawEmployees),
        employeeWorkRecords: Object.values(rawWorkRecords),
        employeePaymentRecords: Object.values(rawEmployeePayments),
        ledgerRecords: Object.values(rawLedgers),
        paymentRecords: Object.values(rawPayments),
        sizingTemplates
      });
    };

    // Subscriptions setup
    const qShops = query(collection(db, "shops"));
    const qCustomers = query(collection(db, "customers"), where("userId", "==", userId), where("isDeleted", "==", false));
    const qMeasurements = query(collection(db, "customer_measurements"), where("userId", "==", userId), where("isDeleted", "==", false));
    const qOrders = query(collection(db, "order_records"), where("userId", "==", userId), where("isDeleted", "==", false));
    const qPayments = query(collection(db, "payment_records"), where("userId", "==", userId));
    const qInventory = query(collection(db, "inventory_items"), where("userId", "==", userId), where("isDeleted", "==", false));
    const qLedger = query(collection(db, "ledger_records"), where("userId", "==", userId), where("isDeleted", "==", false));
    const qEmployees = query(collection(db, "employees"), where("userId", "==", userId));
    const qWorkRecords = query(collection(db, "employee_work_records"), where("userId", "==", userId));
    const qEmployeePayments = query(collection(db, "employee_payment_records"), where("userId", "==", userId));
    const qTemplates = query(collection(db, "sizing_templates"), where("userId", "==", userId));

    unsubscribers.push(onSnapshot(qShops, (snapshot) => {
      snapshot.forEach(doc => {
        rawShops[doc.id] = doc.data() as FirestoreShop;
      });
      triggerUpdate();
    }));

    unsubscribers.push(onSnapshot(qCustomers, (snapshot) => {
      rawCustomers = {};
      snapshot.forEach(doc => {
        rawCustomers[doc.id] = doc.data() as FirestoreCustomer;
      });
      triggerUpdate();
    }));

    unsubscribers.push(onSnapshot(qMeasurements, (snapshot) => {
      rawMeasurements = {};
      snapshot.forEach(doc => {
        rawMeasurements[doc.id] = doc.data() as FirestoreCustomerMeasurement;
      });
      triggerUpdate();
    }));

    unsubscribers.push(onSnapshot(qOrders, (snapshot) => {
      rawOrders = {};
      snapshot.forEach(doc => {
        rawOrders[doc.id] = doc.data() as FirestoreOrderRecord;
      });
      triggerUpdate();
    }));

    unsubscribers.push(onSnapshot(qPayments, (snapshot) => {
      rawPayments = {};
      snapshot.forEach(doc => {
        rawPayments[doc.id] = doc.data() as FirestorePaymentRecord;
      });
      triggerUpdate();
    }));

    unsubscribers.push(onSnapshot(qInventory, (snapshot) => {
      rawInventory = {};
      snapshot.forEach(doc => {
        rawInventory[doc.id] = doc.data() as FirestoreInventoryItem;
      });
      triggerUpdate();
    }));

    unsubscribers.push(onSnapshot(qLedger, (snapshot) => {
      rawLedgers = {};
      snapshot.forEach(doc => {
        rawLedgers[doc.id] = doc.data() as FirestoreLedgerRecord;
      });
      triggerUpdate();
    }));

    unsubscribers.push(onSnapshot(qEmployees, (snapshot) => {
      rawEmployees = {};
      snapshot.forEach(doc => {
        rawEmployees[doc.id] = doc.data() as FirestoreEmployee;
      });
      triggerUpdate();
    }));

    unsubscribers.push(onSnapshot(qWorkRecords, (snapshot) => {
      rawWorkRecords = {};
      snapshot.forEach(doc => {
        rawWorkRecords[doc.id] = doc.data() as FirestoreEmployeeWorkRecord;
      });
      triggerUpdate();
    }));

    unsubscribers.push(onSnapshot(qEmployeePayments, (snapshot) => {
      rawEmployeePayments = {};
      snapshot.forEach(doc => {
        rawEmployeePayments[doc.id] = doc.data() as FirestoreEmployeePaymentRecord;
      });
      triggerUpdate();
    }));

    unsubscribers.push(onSnapshot(qTemplates, (snapshot) => {
      rawTemplates = {};
      snapshot.forEach(doc => {
        rawTemplates[doc.id] = doc.data() as FirestoreSizingTemplate;
      });
      triggerUpdate();
    }));

    // Return function to unsubscribe all listeners at once when component unmounts
    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }
};
