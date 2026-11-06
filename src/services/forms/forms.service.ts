import { http } from "@/lib/http/axios";
import type { ApiSuccess } from "@/lib/http/errors";
import type {
  FormConfigDTO,
  FormSubmissionDTO,
  UpdateFormConfigInput,
} from "./forms.types";

export const formsService = {
  getPublicForm: async (slug: "contact" | "custom-fit" | "checkout-extra") =>
    (
      await http.get<ApiSuccess<FormConfigDTO>>(
        `/public/forms/${encodeURIComponent(slug)}`,
      )
    ).data.data,

  submitPublicForm: async (
    slug: "contact" | "custom-fit",
    answers: Record<string, unknown>,
    turnstileToken?: string,
  ) =>
    (
      await http.post<
        ApiSuccess<{
          submissionId: string;
          customRequestNumber?: string;
          message: string;
        }>
      >(`/public/forms/${encodeURIComponent(slug)}/submit`, {
        answers,
        turnstileToken,
      })
    ).data.data,

  adminListForms: async () =>
    (await http.get<ApiSuccess<FormConfigDTO[]>>("/admin/forms")).data.data,

  adminUpdateForm: async (slug: string, input: UpdateFormConfigInput) =>
    (
      await http.put<ApiSuccess<FormConfigDTO>>(
        `/admin/forms/${encodeURIComponent(slug)}`,
        input,
      )
    ).data.data,

  adminResetForm: async (slug: string) =>
    (
      await http.post<ApiSuccess<FormConfigDTO>>(
        `/admin/forms/${encodeURIComponent(slug)}/reset`,
      )
    ).data.data,

  adminListSubmissions: async () =>
    (await http.get<ApiSuccess<FormSubmissionDTO[]>>("/admin/submissions")).data.data,
};
