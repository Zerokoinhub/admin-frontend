"use client"

import { ArrowLeft } from "lucide-react"

export default function TransferHistory({ onBack }) {
  const transferData = [
    { name: "Annette Black", coins: 400, reason: "Bonus for milestone", date: "4 June 2025", transferredBy: "Admin 1" },
    { name: "Floyd Miles", coins: 350, reason: "Bonus for milestone", date: "4 June 2025", transferredBy: "Admin 1" },
    { name: "Robert Fox", coins: 350, reason: "Bonus for milestone", date: "4 June 2025", transferredBy: "Admin 1" },
    { name: "Darlene", coins: 300, reason: "Bonus for milestone", date: "4 June 2025", transferredBy: "Admin 1" },
    { name: "Marvin", coins: 300, reason: "Bonus for milestone", date: "4 June 2025", transferredBy: "Admin 1" },
    { name: "Bessie Cooper", coins: 250, reason: "Bonus for milestone", date: "4 June 2025", transferredBy: "Admin 1" },
    { name: "Guy Hawkins", coins: 250, reason: "Bonus for milestone", date: "4 June 2025", transferredBy: "$98,270" },
    {
      name: "Darrell Steward",
      coins: 200,
      reason: "Bonus for milestone",
      date: "4 June 2025",
      transferredBy: "Admin 1",
    },
    { name: "Jacob Jones", coins: 200, reason: "Bonus for milestone", date: "4 June 2025", transferredBy: "Admin 1" },
    { name: "Jacob Jones", coins: 150, reason: "Bonus for milestone", date: "4 June 2025", transferredBy: "Admin 1" },
    { name: "Jacob Jones", coins: 150, reason: "Bonus for milestone", date: "4 June 2025", transferredBy: "Admin 1" },
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <button onClick={onBack} className="text-gray-600 hover:text-gray-800">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Transfer History</h2>
          </div>
        </div>

        {/* Mobile-first responsive table */}
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-3 sm:px-6 font-medium text-gray-600 text-sm">Name</th>
                  <th className="text-left py-3 px-3 sm:px-6 font-medium text-gray-600 text-sm">Coins</th>
                  <th className="hidden sm:table-cell text-left py-3 px-6 font-medium text-gray-600 text-sm">Reason</th>
                  <th className="hidden md:table-cell text-left py-3 px-6 font-medium text-gray-600 text-sm">Date</th>
                  <th className="hidden lg:table-cell text-left py-3 px-6 font-medium text-gray-600 text-sm">
                    Transferred By
                  </th>
                </tr>
              </thead>
              <tbody>
                {transferData.map((transfer, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-3 sm:px-6 text-gray-800 text-sm">
                      <div>
                        <div className="font-medium">{transfer.name}</div>
                        {/* Show additional info on mobile */}
                        <div className="sm:hidden text-xs text-gray-500 mt-1">
                          {transfer.reason} • {transfer.date}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 sm:px-6 text-gray-800 text-sm font-semibold">{transfer.coins}</td>
                    <td className="hidden sm:table-cell py-3 px-6 text-gray-600 text-sm">{transfer.reason}</td>
                    <td className="hidden md:table-cell py-3 px-6 text-gray-600 text-sm">{transfer.date}</td>
                    <td className="hidden lg:table-cell py-3 px-6 text-gray-600 text-sm">{transfer.transferredBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Responsive pagination */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-600 space-y-2 sm:space-y-0">
          <span>Showing {transferData.length} entries</span>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-white transition-colors text-sm">
              Previous
            </button>
            <span className="px-3 py-1">1</span>
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-white transition-colors text-sm">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
