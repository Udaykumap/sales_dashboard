import { prisma } from '../../config/adapter'

export const getSalesReportService = async () => {
  const orders = await prisma.order.findMany({
    where: { status: 'PAID' },
    include: {
      items: {
        include: {
          product: true
        }
      }
    }
  })

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0)
  const totalOrders = orders.length

  const productSales = orders.flatMap(order =>
    order.items.map(item => ({
      productId: item.productId,
      productName: item.product.name,
      quantity: item.quantity,
      revenue: item.price * item.quantity
    }))
  ).reduce((acc, item) => {
    const existing = acc.find(p => p.productId === item.productId)
    if (existing) {
      existing.quantity += item.quantity
      existing.revenue += item.revenue
    } else {
      acc.push(item)
    }
    return acc
  }, [] as any[])

  return {
    totalRevenue,
    totalOrders,
    productSales: productSales.sort((a, b) => b.revenue - a.revenue)
  }
}

export const getInventoryReportService = async () => {
  return await prisma.inventory.findMany({
    include: {
      product: {
        include: {
          category: true
        }
      }
    }
  })
}