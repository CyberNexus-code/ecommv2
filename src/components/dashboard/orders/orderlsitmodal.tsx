"use client"

import ButtonRose from "@/components/ui/button"
import { OrderStatus } from "@/lib/orders/orderStatus"

export default function OrderListModal({order, onClose, update} : {order: any,onClose: ()=>void, update: (id: string, status? : string)=>void}){

    console.log(order.order_items?.[0])
    return (
        <div className="fixed inset-0 z-50 w-full h-full">
            <div className="flex flex-col fixed inset-50 z-40 w-150 bg-white rounded-xl shadow-lg justify-between">
                <div className="flex flex-col p-5 gap-5"> 
                    <div className="flex justify-between">
                        <h1 className="text-lg">Order Details</h1>
                    </div>
                    <div>
                        <div className="flex border-b justify-between mb-4">
                            <h1>Product</h1>
                            <p>QTY</p>
                        </div>
                    {order.order_items.map((i: any) => 
                    <div className="flex justify-between p-1" key={i.id + i.name}>
                        <h1>{i.item_name}</h1>
                        <p>{i.quantity}</p>
                    </div>
                    )}
                    </div>
                </div>
                <div className="flex justify-between p-5">
                    <ButtonRose onClick={onClose}>Cancel</ButtonRose>
                    <ButtonRose onClick={() => update(order.id)}>Update order</ButtonRose>
                </div>
            </div>
        </div>
    )
}