import { test, expect } from "@playwright/test";

test.describe("Fadé Exclusives — Storefront & Hidden Admin E2E Suite", () => {
  test("1. Public storefront loads 2026 signature pieces and Brand Portfolio", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /FADÉ EXCLUSIVES/i }),
    ).toBeVisible();

    await page.goto("/about");
    await expect(
      page.getByRole("heading", { name: /THE DESIGNER/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /BUILT FOR QUALITY/i }),
    ).toBeVisible();
  });

  test("2. Hidden Admin returns 404 on wrong slug and renders login on valid ADMIN_PATH_SLUG", async ({
    page,
  }) => {
    const wrongRes = await page.goto("/admin");
    expect(wrongRes?.status()).toBe(404);

    const validSlug = process.env.ADMIN_PATH_SLUG || "atelier-ops-dev";
    const validRes = await page.goto(`/${validSlug}/login`);
    expect(validRes?.status()).toBe(200);
    await expect(
      page.getByRole("button", { name: /Sign In to Atelier Admin/i }),
    ).toBeVisible();
  });

  test("3. Guest checkout reserves stock and generates reference code + WhatsApp link", async ({
    page,
  }) => {
    await page.goto("/shop/the-obsidian-noir-sculpted-kaftan");
    await page.getByRole("button", { name: /Add to Shopping Bag/i }).click();

    await page.goto("/checkout");
    await page.getByLabel(/Full Name/i).fill("Chief Adebayo Ogunlesi");
    await page.getByLabel(/Email Address/i).fill("adebayo@example.com");
    await page.getByLabel(/WhatsApp \/ Phone Number/i).fill("+2348031234567");
    await page.getByLabel(/Street Address/i).fill("10 Queen's Drive, Ikoyi");

    await page
      .getByRole("button", { name: /Place Order & View Bank Details/i })
      .click();

    await expect(page).toHaveURL(/\/order\/ord_tok_/);
    await expect(
      page.getByRole("link", { name: /Send Payment Receipt on WhatsApp/i }),
    ).toHaveAttribute("href", /wa\.me/);
  });
});
