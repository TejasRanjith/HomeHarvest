'use client'

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(price)
}

interface VendorAnalyticsContentProps {
  topProducts: Array<{ id: string; name: string; units: number }>
  monthlyRevenue: Array<{ month: string; revenue: number }>
  maxRevenue: number
}

export function VendorAnalyticsContent({
  topProducts,
  monthlyRevenue,
  maxRevenue,
}: VendorAnalyticsContentProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Top Products by Units Sold
        </h2>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
          {topProducts.map((product, idx) => (
            <div key={product.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-[#8FBC8F] w-6">
                  #{idx + 1}
                </span>
                <span className="text-sm text-gray-700">{product.name}</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {product.units} units
              </span>
            </div>
          ))}
          {topProducts.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">
              No sales data yet
            </p>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Monthly Revenue (Last 6 Months)
        </h2>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-end gap-3 h-48">
            {monthlyRevenue.map((month) => {
              const heightPercent =
                maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0
              return (
                <div
                  key={month.month}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <span className="text-xs text-gray-500">
                    {month.revenue > 0 ? formatPrice(month.revenue) : '₹0'}
                  </span>
                  <div
                    className="w-full bg-[#8FBC8F] rounded-t-md transition-all min-h-[4px]"
                    style={{ height: `${Math.max(heightPercent, 2)}%` }}
                  />
                  <span className="text-xs text-gray-400">{month.month}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
