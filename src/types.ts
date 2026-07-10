export interface ActiveUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isGuest: boolean;
}

export interface LedgerEntry {
  id: string;
  type: "bill" | "payment";
  amount: number;
  description: string;
  date: string;
}

export interface SizingCard {
  id: string;
  templateId: string;
  templateName: string;
  createdDate: string;
  values: { [key: string]: string };
  fitPreference?: "Slim" | "Regular" | "Relaxed";
  specialNotes?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  debtDue: number;
  paidSnapshot: number;
  totalBilled: number;
  ledgerHistory: LedgerEntry[];
  sizingCards: SizingCard[];
}

export interface ShopProfile {
  shopName: string;
  shopPhone: string;
  shopAddress: string;
  currency: string;
  logoIcon: string;
  isConfigured: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  colorCode: string;
  type: "Fabric" | "Thread" | "Button" | "Lining" | "Accessory";
  quantity: number;
  safetyLevel: number;
  unit: string;
  costPrice: number;
  supplier: string;
  lastUpdated: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  clothingType: string;
  values: { [key: string]: string };
  fitPreference: "Slim" | "Regular" | "Relaxed";
  specialNotes: string;
  totalCost: number;
  depositPaid: number;
  status: "Received" | "Cutting" | "Stitching" | "Trial Fit" | "Ready" | "Delivered";
  dueDate: string;
  createdDate: string;
  fabricUsed?: string;
}

export interface ContactFormData {
  name: string;
  shopEmail: string;
  shopName: string;
  message: string;
}

export interface SizingField {
  name: string;
  label: string;
  value: string;
}

export interface SizingTemplate {
  id: string;
  name: string;
  urduName?: string;
  description: string;
  fields: SizingField[];
}

export const SIZING_TEMPLATES: SizingTemplate[] = [
  {
    id: "dress_shirt",
    name: "Classic Dress Shirt",
    description: "The standard pattern for modern office and evening wear. Seven-button placket, rounded cuffs, and precise neck circumference.",
    fields: [
      { name: "collar", label: "Collar Circumference", value: "15.5" },
      { name: "chest", label: "Chest Circumference", value: "42.0" },
      { name: "waist", label: "Waist Circumference", value: "38.5" },
      { name: "sleeve", label: "Sleeve Length", value: "25.0" },
      { name: "length", label: "Shirt Length", value: "30.5" },
      { name: "yoke", label: "Yoke/Shoulder Cross", value: "18.5" }
    ]
  },
  {
    id: "mens_suit",
    name: "Bespoke Lounge Suit",
    description: "Traditional two-piece suit jacket and matching trouser dimensions. Features customized button alignments and canvas lapel weights.",
    fields: [
      { name: "jacket_length", label: "Jacket Length", value: "29.5" },
      { name: "shoulder", label: "Shoulder Cross", value: "17.5" },
      { name: "chest", label: "Jacket Chest", value: "39.0" },
      { name: "sleeve_length", label: "Jacket Sleeve", value: "24.5" },
      { name: "trouser_waist", label: "Trouser Waist", value: "32.0" },
      { name: "trouser_length", label: "Trouser Outseam", value: "40.5" }
    ]
  },
  {
    id: "trouser",
    name: "Slim Fit Trouser",
    description: "Modern form-fitting trousers with customized leg openings, hip seat allowances, and precise outseam measurements.",
    fields: [
      { name: "waist", label: "Waist Circumference", value: "32.0" },
      { name: "seat", label: "Seat/Hip Curve", value: "38.5" },
      { name: "thigh", label: "Thigh Opening", value: "22.5" },
      { name: "length", label: "Outseam Length", value: "40.0" },
      { name: "bottom", label: "Bottom Hem Width", value: "7.8" }
    ]
  },
  {
    id: "shalwar_kameez",
    name: "Shalwar Kameez / شلوار قمیص",
    urduName: "شلوار قمیص",
    description: "Classic South Asian traditional drape fitting. Generous proportions offering optimal ventilation and comfort.",
    fields: [
      { name: "length", label: "Kameez Length", value: "40.0" },
      { name: "shoulder", label: "Shoulder", value: "18.0" },
      { name: "sleeve", label: "Sleeve Length", value: "24.5" },
      { name: "chest", label: "Chest", value: "22.0" },
      { name: "collar", label: "Collar/Neck", value: "15.0" },
      { name: "shalwar_length", label: "Shalwar Length", value: "38.0" },
      { name: "shalwar_bottom", label: "Shalwar Bottom", value: "8.0" }
    ]
  }
];
