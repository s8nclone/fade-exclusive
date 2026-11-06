import type { z } from "zod";
import type {
  convertCustomRequestToOrderSchema,
  quoteCustomRequestSchema,
} from "./custom-requests.schema";
import type { FormFieldConfig } from "@/services/forms/forms.schema";

export type QuoteCustomRequestInput = z.infer<typeof quoteCustomRequestSchema>;
export type ConvertCustomRequestInput = z.infer<
  typeof convertCustomRequestToOrderSchema
>;

export interface CustomRequestAdminDTO {
  id: string;
  requestNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  occasion: string;
  eventDate: string | null;
  budgetRange: string | null;
  styleNotes: string;
  measurements: Record<string, { value: number; unit: "cm" | "in" }>;
  referenceImageUrls: string[];
  preferredContact: string;
  status: string;
  quoteMinor: number | null;
  depositMinor: number | null;
  currency: string;
  estimatedCompletion: string | null;
  adminNotes: string | null;
  convertedOrderId: string | null;
  whatsappQuoteLink: string | null;
  formVersionSnapshot: FormFieldConfig[];
  createdAt: string;
  updatedAt: string;
}
