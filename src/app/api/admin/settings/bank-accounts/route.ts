import { requireAdmin } from "@/server/auth";
import { recordAuditLog } from "@/server/audit";
import { getStore } from "@/server/db/client";
import { sendTransactionalEmail } from "@/server/email";
import { verifyPassword } from "@/server/security/crypto";
import { ApiError, handleRouteError, jsonSuccess } from "@/server/security/http";
import { upsertBankAccountSchema } from "@/services/settings/settings.schema";

export async function POST(request: Request) {
  try {
    // Strictly owner-only + requires password re-entry per Section 13 & 17
    const owner = await requireAdmin({ roles: ["owner"] });
    const body = await request.json();
    const parsed = upsertBankAccountSchema.parse(body);

    const store = getStore();
    const ownerRecord = store.users.find((u) => u.id === owner.id);
    if (!ownerRecord || !verifyPassword(parsed.currentPassword, ownerRecord.passwordHash)) {
      throw new ApiError(
        401,
        "PASSWORD_REENTRY_FAILED",
        "Current owner password verification failed. Bank account changes require your current password.",
      );
    }

    const nowIso = new Date().toISOString();
    let targetAccount = parsed.id
      ? store.bankAccounts.find((b) => b.id === parsed.id)
      : undefined;

    const beforeSnapshot = targetAccount ? { ...targetAccount } : null;

    if (targetAccount) {
      targetAccount.label = parsed.label;
      targetAccount.bankName = parsed.bankName;
      targetAccount.accountName = parsed.accountName;
      targetAccount.accountNumber = parsed.accountNumber;
      targetAccount.instructions = parsed.instructions;
      targetAccount.isActive = parsed.isActive;
      targetAccount.updatedAt = nowIso;
    } else {
      targetAccount = {
        id: `bank-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        label: parsed.label,
        bankName: parsed.bankName,
        accountName: parsed.accountName,
        accountNumber: parsed.accountNumber,
        instructions: parsed.instructions,
        isActive: parsed.isActive,
        sortOrder: store.bankAccounts.length + 1,
        updatedAt: nowIso,
      };
      store.bankAccounts.push(targetAccount);
    }

    recordAuditLog({
      actorId: owner.id,
      actorEmail: owner.email,
      actorRole: owner.role,
      action: beforeSnapshot ? "bank_account.updated" : "bank_account.created",
      entity: "bank_account",
      entityId: targetAccount.id,
      summary: `Modified bank account "${targetAccount.label}" (${targetAccount.bankName} — ${targetAccount.accountNumber})`,
      beforeJson: beforeSnapshot,
      afterJson: targetAccount,
    });

    // Immediate fraud-prevention alert email to owner
    void sendTransactionalEmail({
      to: store.settings.contactEmail,
      subject: "[SECURITY ALERT] Fadé Exclusive Bank Account Details Modified",
      text: `Owner ${owner.email} modified bank account "${targetAccount.label}" (${targetAccount.bankName} / ${targetAccount.accountNumber}) at ${nowIso}.`,
      html: `<p><strong>Security Alert:</strong> Owner <strong>${owner.email}</strong> modified bank account <strong>${targetAccount.label}</strong> (${targetAccount.bankName} / ${targetAccount.accountNumber}) at ${nowIso}.</p>`,
    });

    return jsonSuccess(targetAccount);
  } catch (err) {
    return handleRouteError(err);
  }
}
