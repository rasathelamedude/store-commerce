import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "../lib/axios.js";
import { Users, Package, ShoppingCart, DollarSign } from "lucide-react";

const AnalyticsTab = () => {
  const [analytics, setAnalytics] = useState({
    users: 0,
    products: 0,
    sales: 0,
    revenue: 0,
  });
  const [dailySales, setDailySales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const response = await axios.get("/api/v1/analytics");
        setAnalytics(response.data.data.analyticsData);
        setDailySales(response.data.data.dailySales);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <AnalyticsCard
          title="Total Users"
          value={analytics.users}
          icon={Users}
          color="from-emerald-500 to-teal-700"
        />

        <AnalyticsCard
          title="Total Products"
          value={analytics.products}
          icon={Package}
          color="from-blue-500 to-indigo-700"
        />

        <AnalyticsCard
          title="Total Sales"
          value={analytics.sales}
          icon={ShoppingCart}
          color="from-purple-500 to-pink-700"
        />

        <AnalyticsCard
          title="Total Revenue"
          value={`$${analytics.revenue}`}
          icon={DollarSign}
          color="from-amber-500 to-orange-700"
        />
      </div>
    </div>
  );
};

const AnalyticsCard = ({ title, value, icon: Icon, color }) => (
  <motion.div
    className={`bg-gray-800 rounded-lg p-6 shadow-lg overflow-hidden relative ${color}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="flex justify-between items-center">
      <div className="z-10">
        <p className="text-emerald-300 text-sm mb-1 font-semibold">{title}</p>
        <h3 className="text-white text-3xl font-bold">{value}</h3>
      </div>
    </div>
    <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-emerald-900 opacity-30" />
    <div className="absolute -bottom-4 -right-4 text-emerald-800 opacity-50">
      <Icon className="h-32 w-32" />
    </div>
  </motion.div>
);

export default AnalyticsTab;
