import prismadb from "@/lib/prismadb";

export const getTotalRevenue = async (storeId: string) => {
    const paidOrders = await prismadb.order.findMany({
        where: {
            storeId,
            isPaid: true,
        },
        include: {
            orderItems: {
                include: {
                    product: true
                }
            }
        }
    });

    const getTotalRevenue = paidOrders.reduce((total, order) => {
        const orderToltal = order.orderItems.reduce((orderSum, item) => {
           return orderSum + item.product.price.toNumber();
        }, 0);

        return total + orderToltal;
    }, 0);
    
    return getTotalRevenue;
};