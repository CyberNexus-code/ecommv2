'use client'

import { useState } from "react"
import OrderListModal from "./orderlsitmodal"
import { ORDER_STATUS_CONFIG } from "@/lib/orders/orderStatus"
import type { Order } from "@/types/order"
import { updateStatus, cancelOrder } from "@/app/_actions/dashboardActions"
import { stat } from "fs"
import ButtonRose from "@/components/ui/button"

export default function OrderListContianer({order}: {order: Order}){

    const [showModal, setShowModal] = useState(false);
    const status = ORDER_STATUS_CONFIG[order.status] 

    const orderAge = Math.floor((Date.now() - new Date(order.created_at).getTime()) / (1000 * 60 * 60 * 24));

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
        if(days > 2 || days <= 5) return 2;
        if(days > 5 || days <= 10) return 3;
        return 4;
    }

    const ageLevel = getOrderAgeLevel(orderAge);
    const ageConfig = ORDER_AGE_CONFIG[ageLevel]
    
    function handleStatusUpdate(id: string, changeStatus? : string){
        console.log("handle status:", id)

        const newStatus = changeStatus ? changeStatus : status.next

        console.log(newStatus)
        if(!newStatus){

            console.error("error setting new status, no next status found")
            return 
        }

        updateStatus(id, newStatus);
    }

    function handleOrderCancel(id: string, by: string){
        cancelOrder(id, by);
    }


    return (
        <>
        <div onClick={() => setShowModal(true)} key={order.id} className="flex h-full justify-between gap-2 p-2 my-4 bg-white rounded-lg shadow-sm cursor-pointer hover:bg-gray-100">
            <div className="flex">
                <div className="flex flex-col justify-center p-4">
                    <h2>{`# ${order.order_number}`}</h2>
                </div>
                <div className="flex flex-col gap-1 p-4">
                    <p>User: {order.profiles.email}</p>
                    <p>{(order.created_at).replace('T',' ').split('.')[0]}</p>
                <div>
                    <p>Total: R {order.total}</p>
                </div>
                </div>
            </div>
            <div className="flex flex-col items-center justify-center p-4 gap-4">
                <div className="flex flex-col items-center">
                    <p className="text-xs">Status</p>
                    <div className={`text-xs ${status.bg} ${status.tc} py-1 px-2 rounded-full`}>
                        {status.text}
                    </div>
                </div>
              <div className={`text-xs ${ageConfig.bg} py-1 px-2 rounded-full`}>
                <p>placed {orderAge} days ago</p>
              </div>
            </div>
        </div>
        {showModal && <OrderListModal order={order} onClose={() => setShowModal(false)} update={handleStatusUpdate} cancel={handleOrderCancel}/>}
        </>
    )
}