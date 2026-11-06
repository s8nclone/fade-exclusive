import "server-only";
import { Resend } from "resend";
import { getEnv } from "@/lib/env";
import { formatMinorCurrency } from "@/lib/format/money";

export interface TransactionalEmailPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
}

function getResendClient(): Resend | null {
  const env = getEnv();
  if (!env.RESEND_API_KEY || env.RESEND_API_KEY === "re_placeholder_key") {
    return null;
  }
  return new Resend(env.RESEND_API_KEY);
}

/**
 * Fire-and-forget transactional email dispatcher.
 * Never throws or blocks order placement / admin operations (Section 18).
 */
export async function sendTransactionalEmail(payload: TransactionalEmailPayload): Promise<void> {
  try {
    const resend = getResendClient();
    const env = getEnv();
    if (!resend) {
      if (process.env.NODE_ENV !== "test") {
        console.info(`[Email Dispatch Simulated] Subject: "${payload.subject}"`);
      }
      return;
    }
    await resend.emails.send({
      from: env.EMAIL_FROM,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });
  } catch (err) {
    console.error(
      "[Email Dispatch Error]",
      err instanceof Error ? err.message : "Failed to send email",
    );
  }
}

export function buildOrderPlacedEmail(params: {
  customerName: string;
  orderNumber: string;
  referenceCode: string;
  totalMinor: number;
  depositRequiredMinor: number;
  currency: string;
  orderUrl: string;
  paymentWindowHours: number;
}): { subject: string; html: string; text: string } {
  const amountDue = formatMinorCurrency(params.depositRequiredMinor, params.currency);
  const totalFormatted = formatMinorCurrency(params.totalMinor, params.currency);
  const subject = `Fadé Exclusive — Order ${params.orderNumber} Payment Instructions`;
  const text = [
    `Dear ${params.customerName},`,
    ``,
    `Thank you for your order with Fadé Exclusive (${params.orderNumber}).`,
    `Order Total: ${totalFormatted}`,
    `Amount Due Now: ${amountDue}`,
    `Bank Transfer Reference Code: ${params.referenceCode}`,
    ``,
    `Please complete your bank transfer within ${params.paymentWindowHours} hours using reference "${params.referenceCode}" in the transfer description.`,
    `View bank details and send your receipt on WhatsApp here: ${params.orderUrl}`,
  ].join("\n");

  const html = `
    <div style="background-color:#F4F1EA;color:#161412;padding:32px;font-family:Georgia,serif;max-width:600px;margin:0 auto;border:1px solid #D6CFC1;">
      <p style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#9E7344;margin:0 0 8px;">FADÉ EXCLUSIVE ATELIER</p>
      <h1 style="font-size:24px;margin:0 0 16px;font-weight:normal;">Order ${params.orderNumber} Reserved</h1>
      <p style="font-family:sans-serif;font-size:14px;line-height:1.6;">Dear ${params.customerName},</p>
      <p style="font-family:sans-serif;font-size:14px;line-height:1.6;">
        Your piece(s) have been reserved for <strong>${params.paymentWindowHours} hours</strong>. To confirm your order, please complete a bank transfer using the reference code below:
      </p>
      <div style="background-color:#EAE4D8;padding:20px;margin:20px 0;border-left:4px solid #9E7344;font-family:sans-serif;">
        <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;color:#5E564E;">Transfer Reference Code</p>
        <p style="margin:0 0 16px;font-size:22px;font-weight:bold;letter-spacing:2px;">${params.referenceCode}</p>
        <p style="margin:0;font-size:14px;">Amount Due Now: <strong>${amountDue}</strong> (Order Total: ${totalFormatted})</p>
      </div>
      <p style="margin:24px 0;">
        <a href="${params.orderUrl}" style="background-color:#161412;color:#F4F1EA;padding:12px 24px;text-decoration:none;font-family:sans-serif;font-size:13px;letter-spacing:1px;text-transform:uppercase;display:inline-block;">
          View Bank Details &amp; Order Status
        </a>
      </p>
    </div>
  `;
  return { subject, html, text };
}

export function buildPaymentConfirmedEmail(params: {
  customerName: string;
  orderNumber: string;
  receiptNumber: string;
  amountMinor: number;
  currency: string;
  receiptUrl: string;
  orderUrl: string;
}): { subject: string; html: string; text: string } {
  const amountFormatted = formatMinorCurrency(params.amountMinor, params.currency);
  const subject = `Fadé Exclusive — Payment Confirmed & Official Receipt (${params.receiptNumber})`;
  const text = [
    `Dear ${params.customerName},`,
    ``,
    `We have confirmed your payment of ${amountFormatted} for Order ${params.orderNumber}.`,
    `Official Receipt (${params.receiptNumber}): ${params.receiptUrl}`,
    `Track your order progress: ${params.orderUrl}`,
  ].join("\n");

  const html = `
    <div style="background-color:#F4F1EA;color:#161412;padding:32px;font-family:Georgia,serif;max-width:600px;margin:0 auto;border:1px solid #D6CFC1;">
      <p style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#9E7344;margin:0 0 8px;">FADÉ EXCLUSIVE ATELIER</p>
      <h1 style="font-size:24px;margin:0 0 16px;font-weight:normal;">Payment Confirmed — ${amountFormatted}</h1>
      <p style="font-family:sans-serif;font-size:14px;line-height:1.6;">Dear ${params.customerName},</p>
      <p style="font-family:sans-serif;font-size:14px;line-height:1.6;">
        Thank you. Your payment of <strong>${amountFormatted}</strong> for Order <strong>${params.orderNumber}</strong> has been verified by our atelier.
      </p>
      <p style="margin:24px 0;">
        <a href="${params.receiptUrl}" style="background-color:#161412;color:#F4F1EA;padding:12px 24px;text-decoration:none;font-family:sans-serif;font-size:13px;letter-spacing:1px;text-transform:uppercase;display:inline-block;">
          View Official Receipt (${params.receiptNumber})
        </a>
      </p>
    </div>
  `;
  return { subject, html, text };
}
