import { toWhatsAppDigits } from "./phone";
import { formatMinorCurrency } from "./format/money";

export function buildWhatsAppLink(phone: string, message: string): string {
  const digits = toWhatsAppDigits(phone);
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${digits}?text=${encoded}`;
}

export function buildOrderReceiptWhatsAppLink(params: {
  businessWhatsApp: string;
  orderNumber: string;
  referenceCode: string;
  amountMinor: number;
  currency: string;
  customerName: string;
}): string {
  const formattedAmount = formatMinorCurrency(params.amountMinor, params.currency);
  const text = [
    `Hello Fadé Exclusive Atelier,`,
    `I have completed the bank transfer for my order.`,
    `Order Number: ${params.orderNumber}`,
    `Transfer Reference: ${params.referenceCode}`,
    `Amount Sent: ${formattedAmount}`,
    `Customer Name: ${params.customerName}`,
    `Please find my transfer receipt attached.`,
  ].join("\n");

  return buildWhatsAppLink(params.businessWhatsApp, text);
}

export function buildAdminReceiptShareWhatsAppLink(params: {
  customerPhone: string;
  customerName: string;
  orderNumber: string;
  receiptNumber: string;
  amountMinor: number;
  currency: string;
  receiptUrl: string;
}): string {
  const formattedAmount = formatMinorCurrency(params.amountMinor, params.currency);
  const text = [
    `Hello ${params.customerName},`,
    `Thank you for your patronage at Fadé Exclusive.`,
    `We have confirmed your payment of ${formattedAmount} for Order ${params.orderNumber}.`,
    `Official Receipt (${params.receiptNumber}): ${params.receiptUrl}`,
  ].join("\n");

  return buildWhatsAppLink(params.customerPhone, text);
}

export function buildCustomQuoteWhatsAppLink(params: {
  customerPhone: string;
  customerName: string;
  requestNumber: string;
  quoteMinor: number;
  depositMinor: number;
  currency: string;
  estimatedCompletion: string;
}): string {
  const quoteStr = formatMinorCurrency(params.quoteMinor, params.currency);
  const depositStr = formatMinorCurrency(params.depositMinor, params.currency);
  const text = [
    `Hello ${params.customerName},`,
    `Our Abuja Atelier has prepared the bespoke quotation for your Custom Fit inquiry (${params.requestNumber}):`,
    `Total Quote: ${quoteStr}`,
    `Required Deposit: ${depositStr}`,
    `Estimated Completion: ${params.estimatedCompletion}`,
    `Reply to this message to accept your quote and receive your official order link.`,
  ].join("\n");

  return buildWhatsAppLink(params.customerPhone, text);
}
