import { requireAdmin } from "@/server/auth";
import { getStore } from "@/server/db/client";
import {
  mapToAdminOrderDTO,
  mapToCustomRequestAdminDTO,
} from "@/server/domain/mappers";
import {
  expireOverdueOrders,
  getAvailableVariantStock,
} from "@/server/domain/orders/orders.domain";
import { handleRouteError, jsonSuccess } from "@/server/security/http";

export async function GET() {
  try {
    await requireAdmin();
    expireOverdueOrders();

    const store = getStore();
    const now = new Date();

    const awaitingPayment = store.orders.filter(
      (o) => o.status === "awaiting_payment",
    ).length;
    const paymentSubmitted = store.orders.filter(
      (o) => o.status === "payment_submitted",
    ).length;
    const inProduction = store.orders.filter(
      (o) => o.status === "in_production",
    ).length;
    const readyForDispatch = store.orders.filter(
      (o) => o.status === "ready" || o.status === "ready_for_pickup",
    ).length;
    const newCustomRequests = store.customRequests.filter(
      (cr) => cr.status === "new" || cr.status === "in_review",
    ).length;

    const totalRevenueConfirmedMinor = store.orders.reduce(
      (sum, o) => sum + o.amountPaidMinor,
      0,
    );

    const lowStockAlerts: Array<{
      productId: string;
      productName: string;
      variantId: string;
      variantLabel: string;
      sku: string;
      availableStock: number;
      lowStockThreshold: number;
    }> = [];

    for (const prod of store.products) {
      if (prod.status !== "published" || prod.type !== "ready_to_wear") continue;
      for (const v of prod.variants) {
        const available = getAvailableVariantStock(v.id, v.stockOnHand, now);
        if (available <= v.lowStockThreshold) {
          lowStockAlerts.push({
            productId: prod.id,
            productName: prod.name,
            variantId: v.id,
            variantLabel: v.label,
            sku: v.sku,
            availableStock: available,
            lowStockThreshold: v.lowStockThreshold,
          });
        }
      }
    }

    const recentOrders = store.orders.slice(0, 6).map(mapToAdminOrderDTO);
    const recentCustomRequests = store.customRequests
      .slice(0, 5)
      .map(mapToCustomRequestAdminDTO);

    return jsonSuccess({
      counts: {
        awaitingPayment,
        paymentSubmitted,
        inProduction,
        readyForDispatch,
        newCustomRequests,
        lowStockVariants: lowStockAlerts.length,
        totalRevenueConfirmedMinor,
      },
      currency: store.settings.currency,
      recentOrders,
      recentCustomRequests,
      lowStockAlerts,
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
