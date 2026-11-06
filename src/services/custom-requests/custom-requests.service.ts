import { http } from "@/lib/http/axios";
import type { ApiSuccess } from "@/lib/http/errors";
import type {
  ConvertCustomRequestInput,
  CustomRequestAdminDTO,
  QuoteCustomRequestInput,
} from "./custom-requests.types";

export const customRequestsService = {
  adminList: async () =>
    (await http.get<ApiSuccess<CustomRequestAdminDTO[]>>("/admin/custom-requests")).data
      .data,

  adminUpdateAndQuote: async (id: string, input: QuoteCustomRequestInput) =>
    (
      await http.patch<ApiSuccess<CustomRequestAdminDTO>>(
        `/admin/custom-requests/${encodeURIComponent(id)}`,
        input,
      )
    ).data.data,

  adminConvertToOrder: async (id: string, input?: Partial<ConvertCustomRequestInput>) =>
    (
      await http.post<
        ApiSuccess<{
          customRequest: CustomRequestAdminDTO;
          orderId: string;
          orderNumber: string;
          orderToken: string;
        }>
      >(`/admin/custom-requests/${encodeURIComponent(id)}/convert`, input ?? {})
    ).data.data,
};
