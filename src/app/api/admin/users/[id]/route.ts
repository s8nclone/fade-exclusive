import { requireAdmin } from "@/server/auth";
import { recordAuditLog } from "@/server/audit";
import { getStore } from "@/server/db/client";
import { hashPassword } from "@/server/security/crypto";
import { ApiError, handleRouteError, jsonSuccess } from "@/server/security/http";
import { updateAdminUserSchema } from "@/services/users/users.schema";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const owner = await requireAdmin({ roles: ["owner"] });
    const { id } = await context.params;
    const body = await request.json();
    const parsed = updateAdminUserSchema.parse(body);

    const store = getStore();
    const user = store.users.find((u) => u.id === id);
    if (!user) {
      throw new ApiError(404, "USER_NOT_FOUND", "User not found.");
    }

    if (parsed.isActive === false && user.id === owner.id) {
      throw new ApiError(400, "CANNOT_DISABLE_SELF", "You cannot disable your own owner account.");
    }

    const before = { isActive: user.isActive, totpEnabled: user.totpEnabled };

    if (parsed.isActive !== undefined) user.isActive = parsed.isActive;
    if (parsed.totpEnabled !== undefined) user.totpEnabled = parsed.totpEnabled;
    if (parsed.newPassword) {
      user.passwordHash = hashPassword(parsed.newPassword);
      user.failedLoginAttempts = 0;
      user.lockedUntil = null;
    }
    user.updatedAt = new Date().toISOString();

    recordAuditLog({
      actorId: owner.id,
      actorEmail: owner.email,
      actorRole: owner.role,
      action: "user.updated",
      entity: "user",
      entityId: user.id,
      summary: `Updated staff account ${user.email} (isActive=${user.isActive}, passwordReset=${Boolean(parsed.newPassword)})`,
      beforeJson: before,
      afterJson: { isActive: user.isActive, totpEnabled: user.totpEnabled },
    });

    return jsonSuccess({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      totpEnabled: user.totpEnabled,
      createdAt: user.createdAt,
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
