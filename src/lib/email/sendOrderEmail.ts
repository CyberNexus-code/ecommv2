import nodemailer from "nodemailer";

type OrderEmailItem = {
  item_name?: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
};

type OrderEmailPayload = {
  orderId: string;
  orderNumber: number;
  status: string;
  total: number;
  createdAt: string;
  customerEmail: string;
  items: OrderEmailItem[];
};

function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#039;");
}

function formatCurrency(value: number): string {
  return `R ${value.toFixed(2)}`;
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

function orderHtml(payload: OrderEmailPayload, heading: string, intro: string): string {
  const rows = payload.items
    .map((item) => {
      const name = item.item_name ?? "Item";
      return `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #ffe4e6;">${escapeHtml(name)}</td>
        <td style="padding:8px;text-align:right;border-bottom:1px solid #ffe4e6;">${item.quantity}</td>
        <td style="padding:8px;text-align:right;border-bottom:1px solid #ffe4e6;">${formatCurrency(Number(item.unit_price ?? 0))}</td>
        <td style="padding:8px;text-align:right;border-bottom:1px solid #ffe4e6;">${formatCurrency(Number(item.line_total ?? 0))}</td>
      </tr>`;
    })
    .join("");

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#fff7f8;padding:20px;">
    <div style="max-width:700px;margin:0 auto;background:#fff;border:1px solid #fecdd3;border-radius:12px;overflow:hidden;">
      <div style="padding:14px 16px;background:linear-gradient(90deg,#be123c,#e11d48);color:#fff;">
        <h2 style="margin:0;font-size:18px;">${escapeHtml(heading)}</h2>
      </div>
      <div style="padding:16px;color:#1c1917;">
        <p style="margin:0 0 12px;">${escapeHtml(intro)}</p>
        <p style="margin:0 0 8px;"><strong>Order #:</strong> ${payload.orderNumber}</p>
        <p style="margin:0 0 8px;"><strong>Status:</strong> ${escapeHtml(statusLabel(payload.status))}</p>
        <p style="margin:0 0 8px;"><strong>Placed:</strong> ${escapeHtml(payload.createdAt)}</p>
        <p style="margin:0 0 16px;"><strong>Order ID:</strong> <code>${escapeHtml(payload.orderId)}</code></p>
        <table style="width:100%;border-collapse:collapse;border:1px solid #ffe4e6;border-radius:8px;overflow:hidden;">
          <thead style="background:#fff1f2;color:#9f1239;">
            <tr>
              <th style="padding:8px;text-align:left;">Item</th>
              <th style="padding:8px;text-align:right;">Qty</th>
              <th style="padding:8px;text-align:right;">Unit</th>
              <th style="padding:8px;text-align:right;">Line Total</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div style="margin-top:12px;text-align:right;">
          <p style="margin:0;color:#57534e;">Total</p>
          <p style="margin:0;font-size:20px;font-weight:800;color:#be123c;">${formatCurrency(payload.total)}</p>
        </div>
      </div>
    </div>
  </div>`;
}

function orderText(payload: OrderEmailPayload, heading: string, intro: string): string {
  const lines: string[] = [];
  lines.push(heading);
  lines.push(intro);
  lines.push("");
  lines.push(`Order #: ${payload.orderNumber}`);
  lines.push(`Order ID: ${payload.orderId}`);
  lines.push(`Status: ${statusLabel(payload.status)}`);
  lines.push(`Placed: ${payload.createdAt}`);
  lines.push("");
  lines.push("Items:");
  for (const item of payload.items) {
    lines.push(
      `- ${item.item_name ?? "Item"} | Qty: ${item.quantity} | Unit: ${formatCurrency(
        Number(item.unit_price ?? 0)
      )} | Line: ${formatCurrency(Number(item.line_total ?? 0))}`
    );
  }
  lines.push("");
  lines.push(`Total: ${formatCurrency(payload.total)}`);
  return lines.join("\n");
}

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendOrderPlacedEmails(payload: OrderEmailPayload) {
  const transporter = createTransporter();
  const adminEmail = process.env.ORDER_ADMIN_EMAIL ?? "shanejoubert12@gmail.com";

  const adminSubject = `New Order Placed #${payload.orderNumber}`;
  const clientSubject = `Order Confirmation #${payload.orderNumber}`;

  await Promise.all([
    transporter.sendMail({
      from: `"Cute & Creative Orders" <${process.env.SMTP_USER}>`,
      to: adminEmail,
      subject: adminSubject,
      text: orderText(payload, "New order received", "A customer placed a new order."),
      html: orderHtml(payload, "New Order Received", "A customer placed a new order."),
    }),
    transporter.sendMail({
      from: `"Cute & Creative Orders" <${process.env.SMTP_USER}>`,
      to: payload.customerEmail,
      subject: clientSubject,
      text: orderText(
        payload,
        "Order confirmation",
        "Thanks for your order. Here is a snapshot of what we received."
      ),
      html: orderHtml(
        payload,
        "Order Confirmation",
        "Thanks for your order. Here is a snapshot of what we received."
      ),
    }),
  ]);
}

export async function sendOrderStatusUpdateEmail(
  payload: OrderEmailPayload & { previousStatus: string }
) {
  const transporter = createTransporter();

  const subject = `Order Update #${payload.orderNumber}: ${statusLabel(payload.status)}`;
  const intro = `Your order status changed from "${statusLabel(
    payload.previousStatus
  )}" to "${statusLabel(payload.status)}".`;

  await transporter.sendMail({
    from: `"Cute & Creative Orders" <${process.env.SMTP_USER}>`,
    to: payload.customerEmail,
    subject,
    text: orderText(payload, "Order status update", intro),
    html: orderHtml(payload, "Order Status Update", intro),
  });
}

