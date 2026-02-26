"use server"

import { updateOrderStatus } from "@/lib/orders/orders"

export async function updateStatus(id: string, status: string){
    await updateOrderStatus(id, status)
}