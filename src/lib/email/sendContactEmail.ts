
import nodemailer from "nodemailer"

interface ContactEmailParams {
    name: string
    email: string
    message: string
}

interface UpdateOrderParams {
    name: string
    email: string
    message: string
    status: string
}

export async function sendContactEmail({name, email, message}: ContactEmailParams){
    
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    })

    await transporter.sendMail({
        from: `"Contact Form" <${process.env.SMTP_USER}>`,
        to: process.env.CONTACT_EMAIL,
        replyTo: email,
        subject: `New Contact Message from ${name}`,
        text: `
        Customer Name: ${name}
        Customer Email: ${email}
        
        Message:
        ${message}`
    })

}

export async function sendUpdateOrder({name, email, message, status}: UpdateOrderParams){
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    await transporter.sendMail({
        from: `"Order Updated" <${process.env.SMTP_USER}>`,
        to: email,
        replyTo: process.env.CONTACT_EMAIL,
        subject: `Order Update: ${status}`,
        html: `
        <div>
            <h1>Your order status has updated!</h1>
            <h2>${status}</h2>

            <p>We'll notify you as soon as the order has been shipped</p>
        </div>
        `
    })
}