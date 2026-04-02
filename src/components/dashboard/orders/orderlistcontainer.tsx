'use client'

import { useState } from "react"
import OrderListModal from "./orderlsitmodal"
import { ORDER_STATUS_CONFIG } from "@/lib/dashboard/orders/orderStatus"
import { logClientError } from "@/lib/logging/client"
import type { Order } from "@/types/order"
import { updateStatus, cancelOrder } from "@/app/_actions/dashboardActions"

export default function OrderListContianer({order, now}: {order: Order, now: number}){

    const [showModal, setShowModal] = useState(false);
    const status = ORDER_STATUS_CONFIG[order.status] 

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
    
    function handleStatusUpdate(id: string, changeStatus? : string){
        const newStatus = changeStatus ? changeStatus : status.next
        if(!newStatus){
            void logClientError('dashboard.orderListContainer.handleStatusUpdate', new Error('No next status found'), { id, currentStatus: order.status })
            return 
        }

        updateStatus(id, newStatus);
    }

    function handleOrderCancel(id: string, by: string){
        cancelOrder(id, by);
    }


    return (
        <>
        <div onClick={() => setShowModal(true)} key={order.id} className="my-3 flex w-full cursor-pointer flex-col gap-3 rounded-xl border border-rose-100 bg-white p-3 shadow-sm transition hover:border-rose-200 hover:bg-rose-50/30">
            <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <h2 className="text-base font-semibold text-rose-900">{`# ${order.order_number}`}</h2>
                    <p className="truncate text-sm text-stone-600">User: {order.customer_email}</p>
                    <p className="text-sm text-stone-500">{(order.created_at).replace('T',' ').split('.')[0]}</p>
                    <p className="mt-1 font-medium text-rose-700">Total: R {order.total}</p>
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
        {showModal && <OrderListModal order={order} onClose={() => setShowModal(false)} update={handleStatusUpdate} cancel={handleOrderCancel}/>}
        </>
    )
}
