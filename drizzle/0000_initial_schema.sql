-- Initial Drizzle PostgreSQL Migration for Fadé Exclusive
-- Generated for src/server/db/schema/index.ts

CREATE TABLE IF NOT EXISTS "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL,
  "email_verified" boolean DEFAULT false NOT NULL,
  "image" text,
  "password_hash" text NOT NULL,
  "role" text DEFAULT 'manager' NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "totp_enabled" boolean DEFAULT false NOT NULL,
  "totp_secret" text,
  "failed_login_attempts" integer DEFAULT 0 NOT NULL,
  "locked_until" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_idx" ON "users" ("email");

CREATE TABLE IF NOT EXISTS "sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "token_hash" text NOT NULL,
  "ip_address" text,
  "user_agent" text,
  "expires_at" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "sessions_token_hash_idx" ON "sessions" ("token_hash");
CREATE INDEX IF NOT EXISTS "sessions_user_id_idx" ON "sessions" ("user_id");

CREATE TABLE IF NOT EXISTS "size_guides" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "slug" text NOT NULL,
  "unit" text DEFAULT 'cm' NOT NULL,
  "notes_markdown" text NOT NULL,
  "measurements_json" jsonb NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "categories" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "slug" text NOT NULL,
  "description" text,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "categories_slug_idx" ON "categories" ("slug");

CREATE TABLE IF NOT EXISTS "products" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "slug" text NOT NULL,
  "type" text NOT NULL,
  "description" text NOT NULL,
  "price_minor" integer NOT NULL,
  "compare_at_price_minor" integer,
  "currency" text DEFAULT 'NGN' NOT NULL,
  "lead_time_days" integer,
  "deposit_percent" integer,
  "fabric_notes" text,
  "care_notes" text,
  "fit_notes" text,
  "size_guide_id" uuid REFERENCES "size_guides"("id"),
  "status" text DEFAULT 'draft' NOT NULL,
  "is_featured" boolean DEFAULT false NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "seo_title" text,
  "seo_description" text,
  "published_at" timestamp with time zone,
  "archived_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "products_slug_idx" ON "products" ("slug");

CREATE TABLE IF NOT EXISTS "orders" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "order_number" text NOT NULL,
  "reference_code" text NOT NULL,
  "access_token_hash" text NOT NULL,
  "idempotency_key" text NOT NULL,
  "status" text DEFAULT 'awaiting_payment' NOT NULL,
  "customer_name" text NOT NULL,
  "customer_email" text NOT NULL,
  "customer_phone" text NOT NULL,
  "delivery_address_json" jsonb NOT NULL,
  "shipping_option_json" jsonb NOT NULL,
  "subtotal_minor" integer NOT NULL,
  "discount_total_minor" integer DEFAULT 0 NOT NULL,
  "shipping_minor" integer DEFAULT 0 NOT NULL,
  "total_minor" integer NOT NULL,
  "deposit_required_minor" integer NOT NULL,
  "amount_paid_minor" integer DEFAULT 0 NOT NULL,
  "currency" text DEFAULT 'NGN' NOT NULL,
  "payment_due_at" timestamp with time zone NOT NULL,
  "customer_notes" text,
  "extra_fields_json" jsonb,
  "internal_notes" text,
  "receipt_asset_url" text,
  "source" text DEFAULT 'storefront' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "orders_number_idx" ON "orders" ("order_number");
CREATE UNIQUE INDEX IF NOT EXISTS "orders_ref_code_idx" ON "orders" ("reference_code");
CREATE UNIQUE INDEX IF NOT EXISTS "orders_idempotency_idx" ON "orders" ("idempotency_key");
CREATE UNIQUE INDEX IF NOT EXISTS "orders_token_hash_idx" ON "orders" ("access_token_hash");
