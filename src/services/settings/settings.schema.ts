import { z } from "zod";

export const shippingOptionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2).max(120),
  feeMinor: z.coerce.number().int().min(0),
  eta: z.string().min(2).max(100),
  isActive: z.boolean().default(true),
});

export const updateSettingsSchema = z.object({
  businessName: z.string().min(2).max(120),
  tagline: z.string().min(2).max(200),
  contactEmail: z.string().email(),
  whatsappNumber: z.string().min(6).max(30),
  address: z.string().min(4).max(250),
  currency: z.string().length(3).default("NGN"),
  defaultPhoneCountry: z.string().length(2).default("NG"),
  paymentWindowHours: z.coerce.number().int().min(1).max(168).default(48),
  orderPrefix: z.string().min(1).max(4).default("FD"),
  largeDiscountAlertThresholdPercent: z.coerce.number().int().min(5).max(90).default(25),
  storePaused: z.boolean().default(false),
  storePausedMessage: z.string().min(5).max(500),
  shippingOptions: z.array(shippingOptionSchema).min(1),
});

export const upsertBankAccountSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(2, "Account label is required").max(100),
  bankName: z.string().min(2, "Bank name is required").max(120),
  accountName: z.string().min(2, "Account holder name is required").max(140),
  accountNumber: z.string().min(6, "Account number is required").max(34),
  instructions: z.string().max(400).default(""),
  isActive: z.boolean().default(true),
  currentPassword: z.string().min(6, "Owner password re-entry is required to modify bank details"),
});
