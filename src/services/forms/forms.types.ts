import type { z } from "zod";
import type { FormFieldConfig, updateFormConfigSchema } from "./forms.schema";

export type UpdateFormConfigInput = z.infer<typeof updateFormConfigSchema>;

export interface FormConfigDTO {
  id: string;
  slug: "contact" | "custom-fit" | "checkout-extra";
  title: string;
  description: string;
  version: number;
  fields: FormFieldConfig[];
  updatedAt: string;
}

export interface FormSubmissionDTO {
  id: string;
  formId: string;
  formSlug: string;
  formVersion: number;
  schemaSnapshot: FormFieldConfig[];
  answers: Record<string, unknown>;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: "new" | "read" | "archived";
  createdAt: string;
}
