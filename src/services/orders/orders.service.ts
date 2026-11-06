import { http } from "@/lib/http/axios";
import type { ApiSuccess } from "@/lib/http/errors";
import type {
  AdminOrderDTO,
  AdminOrderListQuery,
  AdminOrderListResponse,
  ConfirmPaymentInput,
  CustomerPaymentSubmittedInput,
  OrderLookupInput,
  PublicOrderDTO,
  PublicReceiptDTO,
  UpdateOrderStatusInput,
} from "./orders.types";

export const ordersService = {
  getByToken: async (token: string) =>
    (
      await http.get<ApiSuccess<PublicOrderDTO>>(
        `/public/orders/${encodeURIComponent(token)}`,
      )
    ).data.data,

  lookup: async (input: OrderLookupInput) =>
    (
      await http.post<ApiSuccess<{ accessToken: string; orderNumber: string }>>(
        "/public/orders/lookup",
        input,
      )
    ).data.data,

  markPaymentSubmitted: async (token: string, input: CustomerPaymentSubmittedInput) =>
    (
      await http.post<ApiSuccess<PublicOrderDTO>>(
        `/public/orders/${encodeURIComponent(token)}/payment-submitted`,
        input,
      )
    ).data.data,

  getReceiptByToken: async (token: string) =>
    (
      await http.get<ApiSuccess<PublicReceiptDTO>>(
        `/public/receipts/${encodeURIComponent(token)}`,
      )
    ).data.data,

  adminList: async (q: Partial<AdminOrderListQuery>) =>
    (
      await http.get<ApiSuccess<AdminOrderListResponse>>("/admin/orders", {
        params: q,
      })
    ).data.data,

  adminConfirmPayment: async (orderId: string, input: ConfirmPaymentInput) =>
    (
      await http.post<
        ApiSuccess<{
          order: AdminOrderDTO;
          receiptNumber: string;
          receiptToken: string;
          whatsappShareUrl: string;
        }>
      >(`/admin/orders/${encodeURIComponent(orderId)}/confirm-payment`, input)
    ).data.data,

  adminUpdateStatus: async (orderId: string, input: UpdateOrderStatusInput) =>
    (
      await http.patch<ApiSuccess<AdminOrderDTO>>(
        `/admin/orders/${encodeURIComponent(orderId)}`,
        input,
      )
    ).data.data,
};
