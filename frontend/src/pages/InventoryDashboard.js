"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { inventoryApi } from "../services/api"
import LoadingSpinner from "../Components/common/LoadingSpinner"
import ErrorMessage from "../Components/common/ErrorMessage"

function InventoryDashboard() {
  const [stats, setStats] = useState({
    totalItems: 0,
    totalValue: 0,
    lowStockItems: [],
    categories: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchInventoryStats = async () => {
      try {
        const response = await inventoryApi.getAllItems()
        const items = response.data

        // Calculate total items
        const totalItems = items.length

        // Calculate total inventory value
        const totalValue = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

        // Find items with low stock (less than 10)
        const lowStockItems = items.filter((item) => item.quantity < 10)

        // Get categories and count items in each
        const categoryCounts = items.reduce((acc, item) => {
          acc[item.category] = (acc[item.category] || 0) + 1
          return acc
        }, {})

        const categories = Object.keys(categoryCounts).map((category) => ({
          name: category,
          count: categoryCounts[category],
          value: items
            .filter((item) => item.category === category)
            .reduce((sum, item) => sum + item.price * item.quantity, 0),
        }))

        setStats({
          totalItems,
          totalValue,
          lowStockItems,
          categories,
        })

        setLoading(false)
      } catch (err) {
        setError("Failed to fetch inventory statistics")
        setLoading(false)
      }
    }

    fetchInventoryStats()
  }, [])

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />

  return (
    <div className="inventory-container">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Inventory Dashboard</h1>
        <p className="text-gray-600">Overview of your inventory status and statistics</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-icon purple">
              <span>📦</span>
            </div>
            <div className="stat-info">
              <p className="stat-label">Total Items</p>
              <p className="stat-value">{stats.totalItems}</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-icon green">
              <span>💰</span>
            </div>
            <div className="stat-info">
              <p className="stat-label">Total Value</p>
              <p className="stat-value">Rs.{stats.totalValue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-icon yellow">
              <span>⚠️</span>
            </div>
            <div className="stat-info">
              <p className="stat-label">Low Stock Items</p>
              <p className="stat-value">{stats.lowStockItems.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Category Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-indigo-600 mr-2">📊</span>
              <h3 className="font-semibold text-gray-800">Category Distribution</h3>
            </div>
          </div>
          <div className="p-6">
            {stats.categories.length > 0 ? (
              <div className="space-y-4">
                {stats.categories.map((category, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{category.name}</span>
                      <span className="text-sm text-gray-500">{category.count} items</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-indigo-600 h-2.5 rounded-full"
                        style={{ width: `${(category.count / stats.totalItems) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">No categories found</div>
            )}
          </div>
        </div>

        {/* Value by Category */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-green-600 mr-2">📈</span>
              <h3 className="font-semibold text-gray-800">Value by Category</h3>
            </div>
          </div>
          <div className="p-6">
            {stats.categories.length > 0 ? (
              <div className="space-y-4">
                {stats.categories.map((category, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{category.name}</span>
                      <span className="text-sm text-gray-500">Rs.{category.value.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-green-600 h-2.5 rounded-full"
                        style={{ width: `${(category.value / stats.totalValue) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">No categories found</div>
            )}
          </div>
        </div>
      </div>

      {/* Low Stock Items */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-yellow-600 mr-2">⚠️</span>
            <h3 className="font-semibold text-gray-800">Low Stock Items</h3>
          </div>
          <Link to="/inventory/list" className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center">
            View All <span className="ml-1">➡️</span>
          </Link>
        </div>

        {stats.lowStockItems.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {stats.lowStockItems.map((item) => (
              <div key={item._id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-medium text-gray-800">{item.name}</p>
                  <p className="text-sm text-gray-500">Category: {item.category}</p>
                </div>
                <div className="flex items-center">
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full mr-4">
                    Qty: {item.quantity}
                  </span>
                  <Link
                    to={`/inventory/edit/${item._id}`}
                    className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition-colors"
                  >
                    Restock
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">No low stock items found. Your inventory levels are good!</div>
        )}
      </div>
    </div>
  )
}

export default InventoryDashboard
