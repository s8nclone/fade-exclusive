export const BRAND_COPY = {
  name: "Fadé Exclusive",
  editorialName: "FADÉ EXCLUSIVES",
  tagline: "African luxury. Contemporary expression.",
  subTagline: "Thoughtfully designed. Expertly crafted. Distinctively Fadé.",
  description:
    "Fadé creates fashion at the intersection of African identity, contemporary design and modern luxury. Ready-to-wear, made-to-order, and custom-fit occasionwear crafted in our Abuja atelier.",
  pillars: [
    {
      number: "01",
      title: "SILHOUETTE",
      description: "Distinctive proportions and occasion-led construction.",
    },
    {
      number: "02",
      title: "MATERIAL",
      description: "Premium textiles selected for texture, movement and visual presence.",
    },
    {
      number: "03",
      title: "DETAIL",
      description: "Hand-finished elements that create recognition and elevate the overall look.",
    },
    {
      number: "04",
      title: "IDENTITY",
      description: "African references translated through a contemporary luxury lens.",
    },
  ],
} as const;

export const BRAND_COLOR_SWATCHES = [
  { label: "Obsidian Ink", hex: "#161412" },
  { label: "Alabaster Ivory", hex: "#F4F1EA" },
  { label: "Warm Stone", hex: "#EAE4D8" },
  { label: "Heritage Bronze", hex: "#9E7344" },
  { label: "Deep Espresso", hex: "#28211C" },
  { label: "Forest Emerald", hex: "#1E3F2F" },
  { label: "Royal Indigo", hex: "#1C2841" },
  { label: "Crimson Terracotta", hex: "#7A2822" },
] as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  awaiting_payment: "Awaiting Payment",
  payment_submitted: "Payment Submitted",
  paid: "Paid",
  deposit_paid: "Deposit Paid",
  in_production: "In Production",
  ready: "Ready",
  shipped: "Shipped",
  ready_for_pickup: "Ready for Pickup",
  delivered: "Delivered",
  cancelled: "Cancelled",
  expired: "Expired",
  refunded: "Refunded",
};

export const CUSTOM_REQUEST_STATUS_LABELS: Record<string, string> = {
  new: "New Inquiry",
  in_review: "In Review",
  quoted: "Quoted",
  accepted: "Accepted",
  in_production: "In Production",
  ready: "Ready",
  delivered: "Delivered",
  declined: "Declined",
  cancelled: "Cancelled",
};
