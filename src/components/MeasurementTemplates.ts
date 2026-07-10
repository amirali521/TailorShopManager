export interface MeasurementField {
  key: string;
  label: string;
  placeholder: string;
}

export interface Template {
  id: string;
  name: string;
  urduName?: string;
  fields: MeasurementField[];
}

export const MEASUREMENT_TEMPLATES: Template[] = [
  {
    id: "shalwar_kameez",
    name: "Shalwar Kameez / شلوار قمیص",
    urduName: "شلوار-قمیص",
    fields: [
      { key: "length", label: "Length (لمبائی)", placeholder: "e.g. 40\"" },
      { key: "shoulder", label: "Shoulder (تیرا)", placeholder: "e.g. 18\"" },
      { key: "sleeve", label: "Sleeve (آستین)", placeholder: "e.g. 24\"" },
      { key: "chest", label: "Chest (چھاتی)", placeholder: "e.g. 22\"" },
      { key: "collar", label: "Collar/Neck (گلا/کالر)", placeholder: "e.g. 15\"" },
      { key: "waist", label: "Waist (کمر)", placeholder: "e.g. 21\"" },
      { key: "ghera", label: "Ghera (گھیرا)", placeholder: "e.g. 23\"" },
      { key: "shalwar_length", label: "Shalwar Length (شلوار لمبائی)", placeholder: "e.g. 38\"" },
      { key: "shalwar_bottom", label: "Shalwar Bottom (پانچہ)", placeholder: "e.g. 8\"" }
    ]
  },
  {
    id: "dress_shirt",
    name: "Classic Dress Shirt",
    fields: [
      { key: "length", label: "Shirt Length", placeholder: "e.g. 30.5\"" },
      { key: "shoulder", label: "Shoulder / Yoke", placeholder: "e.g. 18.5\"" },
      { key: "chest", label: "Chest Circumference", placeholder: "e.g. 41\"" },
      { key: "waist", label: "Waist Circumference", placeholder: "e.g. 37.5\"" },
      { key: "sleeve_length", label: "Sleeve Length", placeholder: "e.g. 25.5\"" },
      { key: "cuff", label: "Cuff Circumference", placeholder: "e.g. 9.2\"" },
      { key: "neck", label: "Collar / Neck", placeholder: "e.g. 16\"" }
    ]
  },
  {
    id: "mens_suit",
    name: "Two-Piece Bespoke Suit",
    fields: [
      { key: "jacket_length", label: "Jacket Length", placeholder: "e.g. 29.5\"" },
      { key: "shoulder", label: "Shoulder Cross", placeholder: "e.g. 17.5\"" },
      { key: "chest", label: "Chest Target", placeholder: "e.g. 38\"" },
      { key: "waist", label: "Jacket Waist", placeholder: "e.g. 34\"" },
      { key: "sleeve_length", label: "Sleeve Length", placeholder: "e.g. 24.5\"" },
      { key: "trouser_length", label: "Outseam Length", placeholder: "e.g. 40.5\"" },
      { key: "trouser_waist", label: "Trouser Waist", placeholder: "e.g. 32\"" },
      { key: "trouser_seat", label: "Hip / Seat", placeholder: "e.g. 39\"" }
    ]
  },
  {
    id: "trouser",
    name: "Slim Fit Trouser / Pants",
    fields: [
      { key: "trouser_length", label: "Outseam Length", placeholder: "e.g. 41\"" },
      { key: "trouser_waist", label: "Waist Circumference", placeholder: "e.g. 34\"" },
      { key: "trouser_seat", label: "Seat / Hip", placeholder: "e.g. 40.5\"" },
      { key: "thigh", label: "Thigh Circumference", placeholder: "e.g. 23.5\"" },
      { key: "trouser_bottom", label: "Leg Opening / Bottom", placeholder: "e.g. 7.8\"" }
    ]
  }
];
