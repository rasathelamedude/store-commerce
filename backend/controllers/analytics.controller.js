import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";

// helper function to get analytics data;
async function getAnalyticsData() {
  // number of users;
  const users = await User.countDocuments();

  // number of products;
  const products = await Product.countDocuments();

  // Sales data (#sales #revenue);
  const sales = await Order.aggregate([
    {
      $group: {
        _id: null,
        totalSales: { $sum: 1 },
        totalRevenue: { $sum: "$totalAmount" },
      },
    },
  ]);

  // Get the total sales and revenue out of the aggregation results;
  const { totalSales, totalRevenue } = sales[0] || {
    totalSales: 0,
    totalRevenue: 0,
  };

  // return data;
  return {
    users,
    products,
    sales: totalSales,
    revenue: totalRevenue,
  };
}

// helper function to get the dates in a week range;
function getDatesInRange(endDate, startDate) {
  const dates = []; // dates array to return;

  let currentDate = new Date(startDate); // get today's date;

  // until we reach the next week push current date to the array;
  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().split("T")[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

// helper funciton to get daily sales data;
async function getDailySalesData(endDate, startDate) {
  try {
    const dailySalesData = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          sales: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Example of daily sales data;
    /*
     * [
     *    {
     *        createdAt: Date *monday*,
     *        sales: 4 *on monday*,
     *        revenue: 20000 *on monday,
     *    },
     *    {
     *        createdAt: Date *tuesday*,
     *        sales: 5, *on tuesday*,
     *        revenue: 21000, *on tuesday*
     *    }
     * ]
     */

    const dateArray = getDatesInRange(endDate, startDate);

    return dateArray.map((date) => {
      const foundDate = dailySalesData.find((sale) => sale._id === date);

      return {
        date,
        sales: foundDate?.sales || 0,
        revenue: foundDate?.revenue || 0,
      };
    });
  } catch (error) {
    console.error("Error in getDailySalesData:", error.message);
    return [];
  }
}

// Route hanlder
export const getAnalytics = async (req, res) => {
  try {
    const analyticsData = await getAnalyticsData();

    // Create 7 day period analytics;
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get daily sales;
    const dailySalesData = await getDailySalesData(endDate, startDate);

    res.status(200).json({
      success: true,
      message: "Fetched analytics",
      data: {
        analyticsData,
        dailySalesData,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
