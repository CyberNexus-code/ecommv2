"use client"

import ButtonRose from "@/components/ui/button"

type OrderModalItem = {
    id: string;
    quantity: number;
    item_name?: string;
    name?: string;
};

type OrderModalData = {
    id: string;
    order_items: OrderModalItem[];
};

export default function OrderListModal({order, onClose, update, cancel} : 
    {
        order: OrderModalData,
        onClose: ()=>void, 
        update: (id: string, status? : string)=>void,
        cancel: (id: string, by: string)=>void
    }){

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
            <div className="flex max-h-[85dvh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-lg">
                <div className="themed-scrollbar flex flex-1 flex-col gap-5 overflow-y-auto p-5"> 
                    <div className="flex justify-between">
                        <h1 className="text-lg">Order Details</h1>
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
                    <div className="flex justify-between">
                        <ButtonRose onClick={onClose}>Cancel</ButtonRose>
                        <div className="flex gap-2">
                            <ButtonRose onClick={() => cancel(order.id, "admin")}>Cancel Order</ButtonRose>
                            <ButtonRose onClick={() => update(order.id)}>Update status</ButtonRose>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
