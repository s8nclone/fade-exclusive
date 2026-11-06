import { z } from "zod";

export const formFieldTypeSchema = z.enum([
  "text",
  "textarea",
  "number",
  "email",
  "phone",
  "select",
  "radio",
  "checkbox",
  "checkbox_group",
  "date",
  "measurement",
  "image",
]);

export const formFieldConfigSchema = z.object({
  key: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-zA-Z0-9_]+$/, "Field key must be alphanumeric"),
  label: z.string().min(1, "Field label is required").max(120),
  type: formFieldTypeSchema,
  placeholder: z.string().max(200).optional(),
  helpText: z.string().max(400).optional(),
  helpImageUrl: z.string().max(500).optional(),
  required: z.boolean().default(false),
  options: z.array(z.string().min(1).max(120)).max(50).optional(),
  min: z.coerce.number().optional(),
  max: z.coerce.number().optional(),
  minLength: z.coerce.number().int().min(0).max(5000).optional(),
  maxLength: z.coerce.number().int().min(1).max(5000).optional(),
  width: z.enum(["full", "half"]).default("full"),
  sortOrder: z.coerce.number().int().default(1),
  isVisible: z.boolean().default(true),
  isSystem: z.boolean().default(false),
});

export type FormFieldConfig = z.infer<typeof formFieldConfigSchema>;

export const updateFormConfigSchema = z.object({
  title: z.string().min(2).max(160),
  description: z.string().max(600).default(""),
  fields: z
    .array(formFieldConfigSchema)
    .min(1)
    .max(40, "Maximum 40 fields allowed per form"),
});

/**
 * Generates a runtime Zod schema from an admin-configured FormFieldConfig[] array.
 * Used identically on the client (React Hook Form zodResolver) and on the server
 * (route validation). Never executes user-supplied regular expressions (prevents ReDoS).
 */
export function buildDynamicFormZodSchema(
  fields: FormFieldConfig[],
): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    if (!field.isVisible) continue;

    switch (field.type) {
      case "text":
      case "textarea": {
        let s = z.string().trim();
        if (field.required) {
          s = s.min(
            field.minLength && field.minLength > 0 ? field.minLength : 1,
            `${field.label} is required`,
          );
        } else if (field.minLength && field.minLength > 0) {
          s = s.min(field.minLength, `${field.label} must be at least ${field.minLength} characters`);
        }
        if (field.maxLength) {
          s = s.max(field.maxLength, `${field.label} must be at most ${field.maxLength} characters`);
        }
        shape[field.key] = field.required ? s : s.optional().or(z.literal(""));
        break;
      }

      case "email": {
        const s = z.string().trim().email(`${field.label} must be a valid email address`);
        shape[field.key] = field.required ? s : s.optional().or(z.literal(""));
        break;
      }

      case "phone": {
        const s = z
          .string()
          .trim()
          .min(6, `${field.label} must be a valid phone number`)
          .max(30);
        shape[field.key] = field.required ? s : s.optional().or(z.literal(""));
        break;
      }

      case "number": {
        let n = z.coerce.number({ invalid_type_error: `${field.label} must be a number` });
        if (field.min !== undefined) {
          n = n.min(field.min, `${field.label} must be at least ${field.min}`);
        }
        if (field.max !== undefined) {
          n = n.max(field.max, `${field.label} must be at most ${field.max}`);
        }
        shape[field.key] = field.required ? n : n.optional();
        break;
      }

      case "measurement": {
        let valSchema = z.coerce.number({
          invalid_type_error: `${field.label} requires a numeric measurement`,
        });
        if (field.min !== undefined) {
          valSchema = valSchema.min(
            field.min,
            `${field.label} must be at least ${field.min}`,
          );
        }
        if (field.max !== undefined) {
          valSchema = valSchema.max(
            field.max,
            `${field.label} must be at most ${field.max}`,
          );
        }
        const mObj = z.object({
          value: valSchema,
          unit: z.enum(["cm", "in"]).default("cm"),
        });
        shape[field.key] = field.required ? mObj : mObj.optional();
        break;
      }

      case "select":
      case "radio": {
        const allowed = field.options && field.options.length > 0 ? field.options : [];
        const s = z
          .string()
          .refine(
            (val) => {
              if (!val && !field.required) return true;
              if (allowed.length === 0) return Boolean(val);
              return allowed.includes(val);
            },
            { message: `Please select a valid option for ${field.label}` },
          );
        shape[field.key] = field.required ? s : s.optional().or(z.literal(""));
        break;
      }

      case "checkbox": {
        const b = z.boolean();
        shape[field.key] = field.required
          ? b.refine((v) => v === true, { message: `${field.label} is required` })
          : b.optional().default(false);
        break;
      }

      case "checkbox_group": {
        const arr = z.array(z.string());
        shape[field.key] = field.required
          ? arr.min(1, `Select at least one option for ${field.label}`)
          : arr.optional().default([]);
        break;
      }

      case "date": {
        const d = z.string().trim();
        shape[field.key] = field.required
          ? d.min(1, `${field.label} is required`)
          : d.optional().or(z.literal(""));
        break;
      }

      case "image": {
        const img = z.string().trim();
        shape[field.key] = field.required
          ? img.min(1, `Please upload an image for ${field.label}`)
          : img.optional().or(z.literal(""));
        break;
      }
    }
  }

  return z.object(shape);
}
