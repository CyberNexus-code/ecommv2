"use server"

import { sendContactEmail } from "@/lib/email/sendContactEmail"
import { createServer } from "@/lib/supabase/server";

type ContactBasketItem = {
    id: string;
    basket_id: string;
    quantity: number;
    items?: {
        name?: string;
        price?: number;
        item_images?: {
            image_url?: string;
            is_thumbnail?: boolean;
        }[];
    };
}

export type ContactFormState = {
    success: boolean
    error: string | null
}

function formatCurrency(value: number): string {
    return `R ${value.toFixed(2)}`;
}

function escapeHtml(input: string): string {
    return input
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("\"", "&quot;")
        .replaceAll("'", "&#039;");
}

function formatBasketTextSummary(basket: ContactBasketItem[]): string {
    if(!basket.length){
        return "";
    }

    const basketId = basket[0]?.basket_id ?? "unknown";
    const lines: string[] = [];
    let total = 0;

    lines.push("Basket Snapshot");
    lines.push(`Basket ID: ${basketId}`);
    lines.push("");
    lines.push("Item | Qty | Unit Price | Line Total");
    lines.push("-------------------------------------");

    for(const item of basket){
        const name = item.items?.name ?? "Unnamed item";
        const unitPrice = Number(item.items?.price ?? 0);
        const qty = Number(item.quantity ?? 0);
        const lineTotal = unitPrice * qty;
        total += lineTotal;

        lines.push(`${name} | ${qty} | ${formatCurrency(unitPrice)} | ${formatCurrency(lineTotal)}`);
    }

    lines.push("");
    lines.push(`Basket Total: ${formatCurrency(total)}`);

    return lines.join("\n");
}

function formatBasketHtmlSummary(basket: ContactBasketItem[]): string {
    if(!basket.length){
        return "";
    }

    const basketId = basket[0]?.basket_id ?? "unknown";
    const cards: string[] = [];
    let total = 0;

    for(const item of basket){
        const name = item.items?.name ?? "Unnamed item";
        const qty = Number(item.quantity ?? 0);
        const unitPrice = Number(item.items?.price ?? 0);
        const lineTotal = unitPrice * qty;
        total += lineTotal;

        const images = item.items?.item_images ?? [];
        const thumb = images.find((i) => i.is_thumbnail)?.image_url ?? images[0]?.image_url;
        const imageHtml = thumb
            ? `<img src="${escapeHtml(thumb)}" alt="${escapeHtml(name)}" style="height:72px;width:72px;object-fit:cover;border-radius:10px;border:1px solid #ffe4e6;" />`
            : `<div style="height:72px;width:72px;border-radius:10px;border:1px solid #ffe4e6;background:#fff1f2;color:#be123c;display:flex;align-items:center;justify-content:center;font-size:12px;">No image</div>`;

        cards.push(`
          <div style="display:flex;justify-content:space-between;gap:14px;padding:12px 0;border-bottom:1px solid #ffe4e6;">
            <div style="display:flex;gap:12px;align-items:center;">
              ${imageHtml}
              <div>
                <p style="margin:0;color:#881337;font-weight:700;font-size:15px;">${escapeHtml(name)}</p>
                <p style="margin:4px 0 0;color:#9f1239;font-size:13px;">Unit price: ${formatCurrency(unitPrice)}</p>
                <p style="margin:4px 0 0;color:#57534e;font-size:12px;">Qty: ${qty}</p>
              </div>
            </div>
            <div style="min-width:90px;text-align:right;color:#be123c;font-weight:700;font-size:14px;align-self:center;">
              ${formatCurrency(lineTotal)}
            </div>
          </div>
        `);
    }

    return `
      <section style="margin-top:24px;border:1px solid #fecdd3;border-radius:14px;background:#fff;padding:16px;">
        <p style="margin:0 0 10px;color:#be123c;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;font-weight:700;">Basket Snapshot</p>
        <p style="margin:0 0 8px;color:#881337;font-size:13px;">Basket ID: <code>${escapeHtml(basketId)}</code></p>
        ${cards.join("")}
        <div style="display:flex;justify-content:space-between;align-items:center;padding-top:12px;">
          <p style="margin:0;color:#57534e;font-size:13px;">Basket total</p>
          <p style="margin:0;color:#be123c;font-size:18px;font-weight:800;">${formatCurrency(total)}</p>
        </div>
      </section>
    `;
}

export async function submitContactForm(prevState: ContactFormState, formData: FormData): Promise<ContactFormState>{
    
    try{

        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const message = formData.get("message") as string;

        
        if(!name || !email || !message){
            throw new Error("All fields are required.");
        }

        let basketTextSummary: string | undefined;
        let basketHtmlSummary: string | undefined;

        try{
            const supabase = await createServer();
            const { data: { user } } = await supabase.auth.getUser();

            if(user){
                const { data: basketData, error: basketError } = await supabase.rpc("get_open_basket_items");

                if(!basketError && Array.isArray(basketData) && basketData.length > 0){
                    const typedBasket = basketData as ContactBasketItem[];
                    basketTextSummary = formatBasketTextSummary(typedBasket);
                    basketHtmlSummary = formatBasketHtmlSummary(typedBasket);
                }
            }
        } catch (basketLookupError){
            console.warn("Unable to attach basket snapshot to contact email:", basketLookupError);
        }

        await sendContactEmail({name, email, message, basketTextSummary, basketHtmlSummary})

        return { success: true, error: null }
            
    }catch(error){
        console.error("Error sending email:", error);
        return { success: false, error: "Failed to send message."}
    }
}
