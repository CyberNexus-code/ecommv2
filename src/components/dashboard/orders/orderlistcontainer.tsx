'use client'

import { useState } from "react"
import OrderListModal from "./orderlsitmodal"
import { ORDER_STATUS_CONFIG } from "@/lib/dashboard/orders/orderStatus"
import { getCustomerDisplay } from "@/lib/customers/display"
import { formatSastDateTime } from "@/lib/dateTime"
import { logClientError } from "@/lib/logging/client"
import { getInvoiceReferenceFromOrderNumber } from "@/lib/orders/reference"
import type { Order } from "@/types/order"
import { updateStatus, cancelOrder } from "@/app/_actions/dashboardActions"

function formatCurrency(value: number): string {
    return `R ${value.toFixed(2)}`
}

export default function OrderListContianer({order, now, referencePrefix}: {order: Order, now: number, referencePrefix: string}){

    const [showModal, setShowModal] = useState(false);
    const status = ORDER_STATUS_CONFIG[order.status] 
    const customerDisplay = getCustomerDisplay(order.customer_name, order.customer_email)
    const invoiceReference = getInvoiceReferenceFromOrderNumber(order.order_number, referencePrefix)

    const orderAge = Math.floor((now - new Date(order.created_at).getTime()) / (1000 * 60 * 60 * 24));

    type OrderAgeLevel = 1 | 2 | 3 | 4;

    type OrderAgeStyle = {
        bg: string,
        tc: string
    }

    const ORDER_AGE_CONFIG: Record<OrderAgeLevel, OrderAgeStyle> = {
    1: { bg: "bg-green-400", tc: "text-green-900" },
    2: { bg: "bg-yellow-400", tc: "text-yellow-900" },
    3: { bg: "bg-orange-400", tc: "text-orange-900" },
    4: { bg: "bg-red-400", tc: "text-red-900" },
    };

    function getOrderAgeLevel(days : number) : OrderAgeLevel{
        if(days <= 2) return 1;
        if(days <= 5) return 2;
        if(days <= 10) return 3;
        return 4;
    }

    const ageLevel = getOrderAgeLevel(orderAge);
    const ageConfig = ORDER_AGE_CONFIG[ageLevel]
    
    async function handleStatusUpdate(id: string, changeStatus? : string, waybillNumber?: string){
        const newStatus = changeStatus ? changeStatus : status.next
        if(!newStatus){
            void logClientError('dashboard.orderListContainer.handleStatusUpdate', new Error('No next status found'), { id, currentStatus: order.status })
            return 
        }

        await updateStatus(id, newStatus, waybillNumber);
    }

    function handleOrderCancel(id: string, by: string){
        cancelOrder(id, by);
    }


    return (
        <>
        <div onClick={() => setShowModal(true)} key={order.id} className="my-3 flex w-full cursor-pointer flex-col gap-3 rounded-xl border border-rose-100 bg-white p-3 shadow-sm transition hover:border-rose-200 hover:bg-rose-50/30">
            <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <h2 className="text-base font-semibold text-rose-900">{invoiceReference}</h2>
                    <p className="truncate text-sm text-stone-600">User: {customerDisplay.primary}</p>
                    <p className="text-sm text-stone-500">{formatSastDateTime(order.created_at)}</p>
                    <p className="mt-1 text-sm text-stone-600">Delivery: {formatCurrency(order.delivery_fee)}</p>
                    <p className="font-medium text-rose-700">Total: {formatCurrency(order.total)}</p>
                </div>
                <div className="flex shrink-0 flex-row items-center gap-2 sm:flex-col sm:items-end">
                    <div className={`text-xs ${status.bg} ${status.tc} rounded-full px-2 py-1`}>
                        {status.text}
                    </div>
                    <div className={`text-xs ${ageConfig.bg} rounded-full px-2 py-1`}>
                        <p>placed {orderAge} days ago</p>
                    </div>
                </div>
            </div>
        </div>
        {showModal && <OrderListModal order={order} onClose={() => setShowModal(false)} update={handleStatusUpdate} cancel={handleOrderCancel} referencePrefix={referencePrefix}/>}
        </>
    )
}
