"use client"

import Link from "next/link"
import ButtonRose from "@/components/ui/button"
import { getInvoiceReferenceFromOrderNumber } from "@/lib/orders/reference"

type OrderModalItem = {
    id: string;
    quantity: number;
    item_name?: string | null;
    name?: string;
};

type OrderModalData = {
    id: string;
    order_number: number;
    order_items: OrderModalItem[];
};

export default function OrderListModal({order, onClose, update, cancel, referencePrefix} : 
    {
        order: OrderModalData,
        onClose: ()=>void, 
        update: (id: string, status? : string)=>void,
        cancel: (id: string, by: string)=>void,
        referencePrefix: string
    }){

    const invoiceReference = getInvoiceReferenceFromOrderNumber(order.order_number, referencePrefix)

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
            <div className="flex max-h-[85dvh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-lg">
                <div className="themed-scrollbar flex flex-1 flex-col gap-5 overflow-y-auto p-5"> 
                    <div className="flex justify-between">
                        <h1 className="text-lg">Order Details</h1>
                        <p className="text-sm font-medium text-rose-700">{invoiceReference}</p>
                    </div>
                    <div>
                        <div className="flex border-b justify-between mb-4">
                            <h1>Product</h1>
                            <p>QTY</p>
                        </div>
                    {order.order_items.map((i) => 
                    <div className="flex justify-between gap-3 p-1" key={i.id}>
                        <h1 className="min-w-0 truncate">{i.item_name ?? i.name ?? "Item"}</h1>
                        <p>{i.quantity}</p>
                    </div>
                    )}
                    </div>
                </div>
                <div className="flex flex-col gap-2 border-t p-5">
                    <div className="flex flex-wrap justify-between gap-2">
                        <ButtonRose onClick={onClose}>Cancel</ButtonRose>
                        <div className="flex flex-wrap gap-2">
                                                        <Link href={`/dashboard/accounting/invoices/${invoiceReference}`} className="inline-flex items-center justify-center rounded-md border border-rose-200 px-4 py-2 text-sm font-medium text-rose-800 transition hover:bg-rose-50">
                              Open Invoice
                            </Link>
                            <ButtonRose onClick={() => cancel(order.id, "admin")}>Cancel Order</ButtonRose>
                            <ButtonRose onClick={() => update(order.id)}>Update status</ButtonRose>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
