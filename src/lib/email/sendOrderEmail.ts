import nodemailer from "nodemailer";
import {
  buildAdminReceiptHtml,
  buildAdminReceiptText,
  buildInvoiceHtml,
  buildInvoiceText,
  getInvoiceReference,
  getInvoiceLogoAttachment,
  type InvoicePayload,
} from "@/lib/orders/invoice";

type OrderEmailPayload = InvoicePayload;

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    order_placed_pending_payment: "Pending Payment",
    order_placed_payment_received: "Payment Received",
    order_shipped: "Shipped",
    completed: "Completed",
    suspended_pending_payment: "Suspended Pending Payment",
    cancelled: "Cancelled",
  };

  return map[status] ?? status;
}

function createTransporter() {
  const smtpPort = Number(getRequiredEnv("SMTP_PORT"));

  return nodemailer.createTransport({
    host: getRequiredEnv("SMTP_HOST"),
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: getRequiredEnv("SMTP_USER"),
      pass: getRequiredEnv("SMTP_PASS"),
    },
  });
}

export async function sendOrderPlacedEmails(payload: OrderEmailPayload) {
  const transporter = createTransporter();
  const smtpUser = getRequiredEnv("SMTP_USER");
  const adminEmail = process.env.ORDER_ADMIN_EMAIL ?? smtpUser;
  const invoiceLogo = await getInvoiceLogoAttachment();

  const invoiceReference = getInvoiceReference(payload);
  const adminSubject = `New Order Receipt #${payload.orderNumber}`;
  const clientSubject = `Invoice ${invoiceReference}`;

  await Promise.all([
    transporter.sendMail({
      from: `"Cute & Creative Orders" <${smtpUser}>`,
      to: adminEmail,
      subject: adminSubject,
      text: buildAdminReceiptText(payload),
      html: buildAdminReceiptHtml(payload),
    }),
    transporter.sendMail({
      from: `"Cute & Creative Orders" <${smtpUser}>`,
      to: payload.customerEmail,
      subject: clientSubject,
      text: buildInvoiceText(payload),
      html: buildInvoiceHtml(payload),
      attachments: [invoiceLogo],
    }),
  ]);
}

export async function sendOrderStatusUpdateEmail(
  payload: OrderEmailPayload & { previousStatus: string }
) {
  const transporter = createTransporter();
  const smtpUser = getRequiredEnv("SMTP_USER");

  const subject = `Order Update ${getInvoiceReference(payload)}: ${statusLabel(payload.status)}`;
  const intro = `Your order status changed from "${statusLabel(
    payload.previousStatus
  )}" to "${statusLabel(payload.status)}".`;

  await transporter.sendMail({
    from: `"Cute & Creative Orders" <${smtpUser}>`,
    to: payload.customerEmail,
    subject,
    text: `${intro}\n\n${buildInvoiceText(payload)}`,
    html: `<div style="font-family:Arial,Helvetica,sans-serif;padding:24px;background:#fff7f8;"><div style="max-width:760px;margin:0 auto;background:#fff;border:1px solid #fecdd3;border-radius:16px;padding:20px;"><p style="margin:0 0 16px;color:#57534e;">${intro}</p>${buildInvoiceHtml(payload)}</div></div>`,
  });
}

