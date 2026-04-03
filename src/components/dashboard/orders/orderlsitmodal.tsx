"use client"

import Link from "next/link"
import { useState } from "react"
import ButtonRose from "@/components/ui/button"
import { ORDER_STATUS_CONFIG } from "@/lib/dashboard/orders/orderStatus"
import { getInvoiceReferenceFromOrderNumber } from "@/lib/orders/reference"
import type { Order } from "@/types/order"

export default function OrderListModal({order, onClose, update, cancel, referencePrefix} : 
    {
        order: Order,
        onClose: ()=>void, 
        update: (id: string, status? : string, waybillNumber?: string)=>Promise<void> | void,
        cancel: (id: string, by: string)=>void,
        referencePrefix: string
    }){

    const invoiceReference = getInvoiceReferenceFromOrderNumber(order.order_number, referencePrefix)
    const nextStatus = ORDER_STATUS_CONFIG[order.status]?.next
    const requiresWaybill = nextStatus === 'order_shipped'
    const [waybillNumber, setWaybillNumber] = useState(order.waybill_number ?? '')
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    async function handleOrderUpdate() {
        if (requiresWaybill && waybillNumber.trim().length === 0) {
            setErrorMessage('Enter a waybill number before marking this order as shipped.')
            return
        }

        setErrorMessage(null)
        await update(order.id, nextStatus, waybillNumber.trim())
        onClose()
    }

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
                        <h1 className="min-w-0 truncate">{i.item_name ?? "Item"}</h1>
                        <p>{i.quantity}</p>
                    </div>
                    )}
                    </div>
                    {order.waybill_number ? (
                        <div className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-sm text-rose-900">
                            <p className="font-medium">Saved waybill</p>
                            <p className="mt-1">{order.waybill_number}</p>
                        </div>
                    ) : null}
                    {requiresWaybill ? (
                        <div className="rounded-xl border border-rose-100 bg-white p-3">
                            <label className="block text-sm font-medium text-rose-900" htmlFor="waybill-number">Waybill number</label>
                            <input
                                id="waybill-number"
                                type="text"
                                value={waybillNumber}
                                onChange={(event) => setWaybillNumber(event.target.value)}
                                placeholder="Enter courier waybill"
                                className="mt-2 w-full rounded-md border border-rose-200 px-3 py-2 text-sm text-stone-900"
                            />
                            <p className="mt-2 text-xs text-stone-500">This is required when moving an order to shipped and will be included in the customer notification email.</p>
                        </div>
                    ) : null}
                    {errorMessage ? <p className="text-sm text-rose-700">{errorMessage}</p> : null}
                </div>
                <div className="flex flex-col gap-2 border-t p-5">
                    <div className="flex flex-wrap justify-between gap-2">
                        <ButtonRose onClick={onClose}>Cancel</ButtonRose>
                        <div className="flex flex-wrap gap-2">
                                                        <Link href={`/dashboard/accounting/invoices/${invoiceReference}`} className="inline-flex items-center justify-center rounded-md border border-rose-200 px-4 py-2 text-sm font-medium text-rose-800 transition hover:bg-rose-50">
                              Open Invoice
                            </Link>
                            <ButtonRose onClick={() => cancel(order.id, "admin")}>Cancel Order</ButtonRose>
                                                        {nextStatus ? <ButtonRose onClick={handleOrderUpdate}>Update status</ButtonRose> : null}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
