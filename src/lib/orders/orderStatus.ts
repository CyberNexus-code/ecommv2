type OrderStatus = 
"order_placed_pending_payment"
|'order_placed_payment_received'
|'order_shipped'
|'completed'
|'suspended_pending_payment'
|'cancelled';

type StatusConfig = {
    bg: string;
    text: string;
    next?: OrderStatus
};

export const ORDER_STATUS_CONFIG: Record<OrderStatus, StatusConfig> = {
    order_placed_pending_payment: {
        bg: "bg-yellow-500",
        text: "Pending Payment",
        next: "order_placed_payment_received"
    },
     order_placed_payment_received: {
    bg: "bg-blue-500",
    text: "Payment Received",
    next: "order_shipped",
    },
    order_shipped: {
        bg: "bg-green-600",
        text: "Shipped",
        next: "completed"
    },
    completed: {
        bg: "bg-gray-400",
        text: "Order Completed"
    },
    suspended_pending_payment: {
        bg: "bg-orange-600",
        text: "Outstanding payment"
    },
    cancelled: {
        bg: "bg-red-600",
        text: "Order cancelled"
    }
}