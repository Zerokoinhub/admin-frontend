"use client"

import { ArrowLeft, Loader2 } from "lucide-react"
import { useUsers } from "../../hooks/useUsers"

export default function TransferHistory({ onBack }) {
  const { users, loading, error } = useUsers(1, 50)

  // Generate transfer history using real user names
  const generateTransferData = (users) => {
    if (!users.length) return []

    const transferReasons = [
      "Bonus for milestone",
      "Referral reward",
      "Course completion",
      "Daily login bonus",
      "Achievement unlock",
    ]

    const transferAmounts = [400, 350, 300, 250, 200, 150, 100]

    return users.slice(0, 11).map((user, index) => ({
      name: user.name || "Unknown User",
      coins: transferAmounts[index % transferAmounts.length],
      reason: transferReasons[index % transferReasons.length],
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      transferredBy: "Admin 1",
      userId: user._id,
    }))
  }

  const transferData = generateTransferData(users)

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

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading transfer history...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600">Error loading transfer history: {error}</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-3 sm:px-6 font-medium text-gray-600 text-sm">Name</th>
                    <th className="text-left py-3 px-3 sm:px-6 font-medium text-gray-600 text-sm">Coins</th>
                    <th className="hidden sm:table-cell text-left py-3 px-6 font-medium text-gray-600 text-sm">
                      Reason
                    </th>
                    <th className="hidden md:table-cell text-left py-3 px-6 font-medium text-gray-600 text-sm">Date</th>
                    <th className="hidden lg:table-cell text-left py-3 px-6 font-medium text-gray-600 text-sm">
                      Transferred By
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transferData.map((transfer, index) => (
                    <tr key={transfer.userId || index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-3 sm:px-6 text-gray-800 text-sm">
                        <div>
                          <div className="font-medium">{transfer.name}</div>
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
        )}

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
