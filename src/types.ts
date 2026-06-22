export interface MeasurementField {
  name: string;
  label: string;
  value: string;
  category: "Length" | "Width" | "Circumference" | "Detail";
}

export interface SizingTemplate {
  id: string;
  name: string;
  urduName?: string;
  description: string;
  fields: MeasurementField[];
}

export interface WorkerOrder {
  id: string;
  workerName: string;
  item: string;
  wage: number;
  date: string;
  status: "Pending" | "Paid";
}

export interface ContactFormData {
  name: string;
  shopEmail: string;
  shopName: string;
  message: string;
}

export const SIZING_TEMPLATES: SizingTemplate[] = [
  {
    id: "dress_shirt",
    name: "Classic Dress Shirt",
    description: "Premium tailored button-down dress shirt with custom collar, cuff, and chest measurements.",
    fields: [
      { name: "length", label: "Shirt Length", value: "30.5", category: "Length" },
      { name: "shoulder", label: "Yoke / Shoulder", value: "18.5", category: "Width" },
      { name: "chest", label: "Chest Circumference", value: "41.0", category: "Circumference" },
      { name: "waist", label: "Waist Circumference", value: "37.5", category: "Circumference" },
      { name: "sleeve_length", label: "Sleeve Length", value: "25.5", category: "Length" },
      { name: "cuff", label: "Cuff Circumference", value: "9.2", category: "Width" },
      { name: "neck", label: "Collar / Neck", value: "16.0", category: "Circumference" }
    ]
  },
  {
    id: "mens_suit",
    name: "Two-Piece Bespoke Suit",
    description: "Classic structured jacket and trousers layout with detailed lapel and pocket options.",
    fields: [
      { name: "jacket_length", label: "Jacket Length", value: "29.5", category: "Length" },
      { name: "shoulder", label: "Shoulder Cross", value: "17.5", category: "Width" },
      { name: "chest", label: "Chest Target", value: "38.0", category: "Circumference" },
      { name: "waist", label: "Jacket Waist", value: "34.0", category: "Circumference" },
      { name: "sleeve_length", label: "Sleeve Length", value: "24.5", category: "Length" },
      { name: "trouser_length", label: "Outseam Length", value: "40.5", category: "Length" },
      { name: "trouser_waist", label: "Trouser Waist", value: "32.0", category: "Circumference" },
      { name: "trouser_seat", label: "Hip / Seat", value: "39.0", category: "Circumference" },
      { name: "trouser_inseam", label: "Inseam", value: "30.0", category: "Length" },
      { name: "trouser_bottom", label: "Leg Opening", value: "8.2", category: "Width" }
    ]
  },
  {
    id: "chinos_trousers",
    name: "Slim Fit Trouser",
    description: "Sleek formal chinos or suit pants with defined thigh, rise, and leg opening specifications.",
    fields: [
      { name: "trouser_length", label: "Outseam Length", value: "41.0", category: "Length" },
      { name: "trouser_waist", label: "Waist Circumference", value: "34.0", category: "Circumference" },
      { name: "trouser_seat", label: "Seat / Hip", value: "40.5", category: "Circumference" },
      { name: "trouser_inseam", label: "Inseam", value: "31.5", category: "Length" },
      { name: "thigh", label: "Thigh Circumference", value: "23.5", category: "Circumference" },
      { name: "knee", label: "Knee Circumference", value: "17.0", category: "Circumference" },
      { name: "trouser_bottom", label: "Leg Opening", value: "7.8", category: "Width" }
    ]
  },
  {
    id: "waistcoat",
    name: "Classic Tailored Vest",
    description: "Sleek, body-hugging waistcoat styling with customized neck drop and back-strap coordinates.",
    fields: [
      { name: "vest_length", label: "Front Length", value: "25.0", category: "Length" },
      { name: "chest", label: "Chest Spec", value: "37.5", category: "Circumference" },
      { name: "waist", label: "Waist Spec", value: "33.5", category: "Circumference" },
      { name: "neck_drop", label: "Neck Drop / Shape", value: "11.0", category: "Detail" },
      { name: "shoulder_width", label: "Shoulder Width", value: "4.5", category: "Width" }
    ]
  }
];
