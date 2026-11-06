import type { z } from "zod";
import type {
  shippingOptionSchema,
  updateSettingsSchema,
  upsertBankAccountSchema,
} from "./settings.schema";

export type ShippingOptionDTO = z.infer<typeof shippingOptionSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
export type UpsertBankAccountInput = z.infer<typeof upsertBankAccountSchema>;

export interface BankAccountDTO {
  id: string;
  label: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  instructions: string;
  isActive: boolean;
  sortOrder: number;
  updatedAt: string;
}

export interface PublicSettingsDTO {
  businessName: string;
  tagline: string;
  contactEmail: string;
  whatsappNumber: string;
  address: string;
  currency: string;
  defaultPhoneCountry: string;
  paymentWindowHours: number;
  storePaused: boolean;
  storePausedMessage: string;
  shippingOptions: ShippingOptionDTO[];
  socialLinks: {
    instagram?: string;
    tiktok?: string;
    pinterest?: string;
    linkedin?: string;
  };
}

export interface AdminSettingsBundleDTO extends PublicSettingsDTO {
  orderPrefix: string;
  largeDiscountAlertThresholdPercent: number;
  bankAccounts: BankAccountDTO[];
  updatedAt: string;
}
