import { Request, Response } from "express";
import { prisma } from "../prisma.js";

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const revenueResult = await prisma.order.aggregate({
      _sum: {
        totalAmount: true, //“Sum the totalAmount column for all orders”
      },
    });
    const totalRevenue = revenueResult._sum.totalAmount || 0;

    // 2. Total Orders
    const totalOrders = await prisma.order.count(); //Counts all rows in the table

    // 3. Total Products
    const totalProducts = await prisma.product.count();

    // 4. Total Customers
    const totalCustomers = await prisma.user.count();

    // 5. Recent Orders (limit 5)
    // We need to fetch customer name, so we include the user relation
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc", //recent order
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // 6. Top Products
    const topProducts = await prisma.product.findMany({
      take: 6,
      orderBy: {
        price: "desc", // The 6 most expensive products
      },
    });

    // 7. Low Stock Products
    const lowStockProducts = await prisma.product.findMany({
      where: {
        quantity: {
          lt: 10, //is less than 10.”
        },
      },
      take: 5,
    });

    // 8. Revenue by Day (Last 7 days) - for Area Chart
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); //get date return a day of a month
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const ordersLast7Days = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo, //“greater than or equal”
        },
      },
      select: {
        createdAt: true,
        totalAmount: true,
      },
    });

    // Group by day
    const revenueByDay: { [key: string]: number } = {};
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Creates an object (revenueByDay) where each key is the day of the week for the last 7 days, and the value is initialized to 0.
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = dayNames[date.getDay()];
      revenueByDay[dayName] = 0;
    }

    // Sum revenue by day //Loop through orders → add totalAmount to the corresponding day
    ordersLast7Days.forEach((order) => {
      const dayName = dayNames[new Date(order.createdAt).getDay()];
      revenueByDay[dayName] += Number(order.totalAmount) || 0;
    });

    // Object.entries is a built-in JavaScript method that takes an object and returns an array of key-value pairs.
    const revenueChartData = Object.entries(revenueByDay).map(
      ([day, revenue]) => ({
        day,
        revenue: Math.round(revenue * 100) / 100,
      }),
    );

    // 9. Orders by Status - for Pie Chart
    const ordersByStatus = await prisma.order.groupBy({
      //group orders by their status.
      by: ["status"],
      _count: {
        //count how many orders are in each status group.
        status: true,
      },
    });

    //Creates a new array of objects suitable for charts.
    const statusChartData = ordersByStatus.map((item) => ({
      name:
        item.status.charAt(0).toUpperCase() +
        item.status.slice(1).toLowerCase(),
      value: item._count.status,
    }));

    res.json({
      stats: {
        revenue: totalRevenue,
        orders: totalOrders,
        products: totalProducts,
        customers: totalCustomers,
      },
      recentOrders,
      topProducts,
      lowStockProducts,
      chartData: {
        revenueByDay: revenueChartData,
        ordersByStatus: statusChartData,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Failed to fetch dashboard statistics" });
  }
};
