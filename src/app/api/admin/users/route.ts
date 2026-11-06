import { requireAdmin } from "@/server/auth";
import { recordAuditLog } from "@/server/audit";
import { getStore } from "@/server/db/client";
import { hashPassword } from "@/server/security/crypto";
import { ApiError, handleRouteError, jsonSuccess } from "@/server/security/http";
import { createAdminUserSchema } from "@/services/users/users.schema";

export async function GET() {
  try {
    await requireAdmin({ roles: ["owner"] });
    const store = getStore();
    return jsonSuccess(
      store.users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        isActive: u.isActive,
        totpEnabled: u.totpEnabled,
        createdAt: u.createdAt,
      })),
    );
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function POST(request: Request) {
  try {
    const owner = await requireAdmin({ roles: ["owner"] });
    const body = await request.json();
    const parsed = createAdminUserSchema.parse(body);

    const store = getStore();
    const normalizedEmail = parsed.email.trim().toLowerCase();
    if (store.users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
      throw new ApiError(409, "EMAIL_EXISTS", "A staff account with this email already exists.");
    }

    const nowIso = new Date().toISOString();
    const newUser = {
      id: `usr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: parsed.name.trim(),
      email: normalizedEmail,
      passwordHash: hashPassword(parsed.password),
      role: parsed.role,
      isActive: true,
      totpEnabled: false,
      totpSecret: null,
      failedLoginAttempts: 0,
      lockedUntil: null,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    store.users.push(newUser);

    recordAuditLog({
      actorId: owner.id,
      actorEmail: owner.email,
      actorRole: owner.role,
      action: "user.created",
      entity: "user",
      entityId: newUser.id,
      summary: `Created ${newUser.role} account for ${newUser.email}`,
      afterJson: { id: newUser.id, email: newUser.email, role: newUser.role },
    });

    return jsonSuccess(
      {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isActive: newUser.isActive,
        totpEnabled: newUser.totpEnabled,
        createdAt: newUser.createdAt,
      },
      { status: 201 },
    );
  } catch (err) {
    return handleRouteError(err);
  }
}
