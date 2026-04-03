"use server"

import { updateOrderStatus, cancelOrder as cancel } from "@/lib/dashboard/orders/orders"

export async function updateStatus(id: string, status: string, waybillNumber?: string){
    await updateOrderStatus(id, status, waybillNumber)
}

export async function cancelOrder(id: string, by: string) {
    await cancel(id, by);
}