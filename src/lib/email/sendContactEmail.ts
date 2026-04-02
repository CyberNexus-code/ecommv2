
import nodemailer from "nodemailer"

interface ContactEmailParams {
    name: string
    email: string
    message: string
    basketTextSummary?: string
    basketHtmlSummary?: string
}

function escapeHtml(input: string): string {
    return input
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("\"", "&quot;")
        .replaceAll("'", "&#039;");
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if(!value){
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export async function sendContactEmail({name, email, message, basketTextSummary, basketHtmlSummary}: ContactEmailParams){

    const transporter = nodemailer.createTransport({
    host: getRequiredEnv("SMTP_HOST"),
    port: Number(getRequiredEnv("SMTP_PORT")),
    secure: Number(getRequiredEnv("SMTP_PORT")) === 465,
        auth: {
      user: getRequiredEnv("SMTP_USER"),
      pass: getRequiredEnv("SMTP_PASS")
        }
    })

  const smtpUser = getRequiredEnv("SMTP_USER");
  const contactEmail = getRequiredEnv("CONTACT_EMAIL");

    await transporter.sendMail({
    from: `"Contact Form" <${smtpUser}>`,
    to: contactEmail,
        replyTo: email,
        subject: `New Contact Message from ${name}`,
        text: `
        Customer Name: ${name}
        Customer Email: ${email}
        
        Message:
        ${message}

${basketTextSummary ? `\n\n${basketTextSummary}` : ""}`,
        html: `
        <div style="font-family:Arial,Helvetica,sans-serif;background:#fff7f8;padding:20px;color:#1c1917;">
          <div style="max-width:680px;margin:0 auto;border:1px solid #fecdd3;border-radius:14px;background:white;overflow:hidden;">
            <div style="background:linear-gradient(90deg,#be123c,#e11d48);padding:14px 18px;color:white;">
              <h2 style="margin:0;font-size:18px;">New Contact Message</h2>
            </div>
            <div style="padding:18px;">
              <p style="margin:0 0 8px;"><strong>Customer Name:</strong> ${escapeHtml(name)}</p>
              <p style="margin:0 0 16px;"><strong>Customer Email:</strong> ${escapeHtml(email)}</p>
              <p style="margin:0 0 8px;"><strong>Message:</strong></p>
              <div style="border:1px solid #ffe4e6;border-radius:10px;padding:12px;background:#fff7f8;white-space:pre-wrap;">${escapeHtml(message)}</div>
              ${basketHtmlSummary ?? ""}
            </div>
          </div>
        </div>`
    })

}
