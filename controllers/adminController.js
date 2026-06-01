const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { success, error } = require('../utils/apiResponse');

function pctChange(current, previous) {
  if (!previous) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function fillDailySeries(raw, days = 7) {
  const map = Object.fromEntries(raw.map((d) => [d._id, d]));
  const series = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  cursor.setDate(cursor.getDate() - (days - 1));

  for (let i = 0; i < days; i++) {
    const key = cursor.toISOString().slice(0, 10);
    series.push({
      date: key,
      label: cursor.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
      revenue: map[key]?.revenue ?? 0,
      orders: map[key]?.orders ?? 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return series;
}

exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const notCancelled = { status: { $ne: 'cancelled' } };

    const [
      totalRevenueAgg,
      revenueThisMonthAgg,
      revenueLastMonthAgg,
      ordersThisMonth,
      ordersLastMonth,
      userCount,
      productCount,
      orderCount,
      ordersByStatus,
      recentOrders,
      lowStockProducts,
      dailyRevenue,
      newUsersThisWeek,
    ] = await Promise.all([
      Order.aggregate([
        { $match: notCancelled },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.aggregate([
        { $match: { ...notCancelled, createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.aggregate([
        {
          $match: {
            ...notCancelled,
            createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
          },
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.countDocuments({ ...notCancelled, createdAt: { $gte: startOfMonth } }),
      Order.countDocuments({
        ...notCancelled,
        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
      }),
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Order.find().sort({ createdAt: -1 }).limit(8).lean(),
      Product.find({ stock: { $lte: 10 } }).sort({ stock: 1 }).limit(6).lean(),
      Order.aggregate([
        { $match: { ...notCancelled, createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$totalAmount' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      User.countDocuments({ createdAt: { $gte: weekAgo } }),
    ]);

    const totalRevenue = totalRevenueAgg[0]?.total ?? 0;
    const revenueThisMonth = revenueThisMonthAgg[0]?.total ?? 0;
    const revenueLastMonth = revenueLastMonthAgg[0]?.total ?? 0;

    const statusMap = Object.fromEntries(
      ordersByStatus.map((s) => [s._id || 'pending', s.count])
    );

    return success(res, {
      kpis: {
        revenue: {
          total: totalRevenue,
          thisMonth: revenueThisMonth,
          trend: pctChange(revenueThisMonth, revenueLastMonth),
        },
        orders: {
          total: orderCount,
          thisMonth: ordersThisMonth,
          trend: pctChange(ordersThisMonth, ordersLastMonth),
        },
        users: { total: userCount, newThisWeek: newUsersThisWeek },
        products: { total: productCount, lowStock: lowStockProducts.length },
      },
      ordersByStatus: {
        pending: statusMap.pending ?? 0,
        confirmed: statusMap.confirmed ?? 0,
        shipped: statusMap.shipped ?? 0,
        delivered: statusMap.delivered ?? 0,
        cancelled: statusMap.cancelled ?? 0,
      },
      revenueChart: fillDailySeries(dailyRevenue),
      recentOrders,
      lowStockProducts,
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    return error(res, 'Failed to load dashboard stats.', 500);
  }
};
