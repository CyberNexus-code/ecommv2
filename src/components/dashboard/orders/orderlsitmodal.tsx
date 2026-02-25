"use client"

export default function OrderListModal({order, onClose} : {order: any,onClose: ()=>void}){

    console.log(order.order_items?.[0])
    return (
        <div className="fixed inset-50 z-40 bg-white h-100 w-100 rounded-xl shadow-lg">
            <div>
                <h1>Orders modal</h1>
                <button className="cursor-pointer" onClick={onClose}>X</button>
                <div>
                 {order.order_items.map((i: any) => 
                 <div>
                    <h1>{i.item_name}</h1>
                    <p>{i.quantity}</p>
                </div>
                )}
                </div>
            </div>
        </div>
    )
}