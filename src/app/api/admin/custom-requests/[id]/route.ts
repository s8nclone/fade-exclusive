import { requireAdmin } from "@/server/auth";
import { recordAuditLog } from "@/server/audit";
import { getStore } from "@/server/db/client";
import { mapToCustomRequestAdminDTO } from "@/server/domain/mappers";
import { sendTransactionalEmail } from "@/server/email";
import { ApiError, handleRouteError, jsonSuccess } from "@/server/security/http";
import { quoteCustomRequestSchema } from "@/services/custom-requests/custom-requests.schema";
import { formatMinorCurrency } from "@/lib/format/money";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin();
    const { id } = await context.params;
    const body = await request.json();
    const parsed = quoteCustomRequestSchema.parse(body);

    const store = getStore();
    const req = store.customRequests.find((c) => c.id === id);
    if (!req) {
      throw new ApiError(404, "CUSTOM_REQUEST_NOT_FOUND", "Custom request not found.");
    }

    const before = {
      status: req.status,
      quoteMinor: req.quoteMinor,
      depositMinor: req.depositMinor,
    };

    req.status = parsed.status;
    if (parsed.quoteMinor !== undefined) req.quoteMinor = parsed.quoteMinor;
    if (parsed.depositMinor !== undefined) req.depositMinor = parsed.depositMinor;
    if (parsed.estimatedCompletion !== undefined)
      req.estimatedCompletion = parsed.estimatedCompletion;
    if (parsed.adminNotes !== undefined) req.adminNotes = parsed.adminNotes;
    req.updatedAt = new Date().toISOString();

    recordAuditLog({
      actorId: admin.id,
      actorEmail: admin.email,
      actorRole: admin.role,
      action: "custom_request.updated",
      entity: "custom_request",
      entityId: req.id,
      summary: `Updated Custom Fit inquiry ${req.requestNumber} -> ${req.status}`,
      beforeJson: before,
      afterJson: {
        status: req.status,
        quoteMinor: req.quoteMinor,
        depositMinor: req.depositMinor,
      },
    });

    if (req.status === "quoted" && req.quoteMinor) {
      const quoteStr = formatMinorCurrency(req.quoteMinor, req.currency);
      const depositStr = formatMinorCurrency(
        req.depositMinor ?? req.quoteMinor,
        req.currency,
      );
      void sendTransactionalEmail({
        to: req.customerEmail,
        subject: `Fadé Exclusive — Bespoke Quotation Ready (${req.requestNumber})`,
        text: `Dear ${req.customerName},\n\nYour bespoke quotation for ${req.occasion} (${req.requestNumber}) is ready:\nTotal Quote: ${quoteStr}\nRequired Deposit: ${depositStr}\nEstimated Completion: ${req.estimatedCompletion || "14–21 days"}.`,
        html: `<p>Dear ${req.customerName},</p><p>Your bespoke quotation for <strong>${req.occasion}</strong> (${req.requestNumber}) is ready: Total <strong>${quoteStr}</strong> (Deposit: <strong>${depositStr}</strong>).</p>`,
      });
    }

    return jsonSuccess(mapToCustomRequestAdminDTO(req));
  } catch (err) {
    return handleRouteError(err);
  }
}
