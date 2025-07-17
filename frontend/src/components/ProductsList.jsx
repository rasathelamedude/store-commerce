import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Trash, Star } from "lucide-react";
import { useProductStore } from "../stores/useProductStore.js";

const ProductsList = () => {
  const { deleteProduct, toggleFeaturedProduct, products } = useProductStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="mx-auto shadow-lg rounded-lg bg-gray-800 overflow-hidden max-w-xl"
    >
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-700">
          <tr>
            <th
              className="px-6 py-3 text-sm text-left font-medium uppercase text-gray-300 tracking-wider"
              scope="col"
            >
              Product
            </th>
            <th
              className="px-6 py-3 text-sm text-left font-medium uppercase text-gray-300 tracking-wider"
              scope="col"
            >
              Price
            </th>
            <th
              className="px-6 py-3 text-sm text-left font-medium uppercase text-gray-300 tracking-wider"
              scope="col"
            >
              Category
            </th>
            <th
              className="px-6 py-3 text-sm text-left font-medium uppercase text-gray-300 tracking-wider"
              scope="col"
            >
              Featured
            </th>
            <th
              className="px-6 py-3 text-sm text-left font-medium uppercase text-gray-300 tracking-wider"
              scope="col"
            >
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {products?.map((product) => (
            <tr key={product._id} className="hover:bg-gray-700">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-10 210
                     rounded-full object-cover"
                    />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-white">
                      {product.name}
                    </div>
                  </div>
                </div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-300">
                  ${product.price.toFixed(2)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-300">{product.category}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => toggleFeaturedProduct(product._id)}
                  className={`p-1 rounded-full ${
                    product.isFeatured
                      ? "bg-yellow-400 text-gray-900"
                      : "bg-gray-600 text-gray-300"
                  } hover:bg-yellow-500 transition-colors duration-200`}
                >
                  <Star className="h-5 w-5" />
                </button>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => deleteProduct(product._id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
};

export default ProductsList;
