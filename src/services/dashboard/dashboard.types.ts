import type { AdminOrderDTO } from "@/services/orders/orders.types";
import type { CustomRequestAdminDTO } from "@/services/custom-requests/custom-requests.types";

export interface DashboardSummaryDTO {
  counts: {
    awaitingPayment: number;
    paymentSubmitted: number;
    inProduction: number;
    readyForDispatch: number;
    newCustomRequests: number;
    lowStockVariants: number;
    totalRevenueConfirmedMinor: number;
  };
  currency: string;
  recentOrders: AdminOrderDTO[];
  recentCustomRequests: CustomRequestAdminDTO[];
  lowStockAlerts: Array<{
    productId: string;
    productName: string;
    variantId: string;
    variantLabel: string;
    sku: string;
    availableStock: number;
    lowStockThreshold: number;
  }>;
}
