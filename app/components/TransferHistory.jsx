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
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <button onClick={onBack} className="text-gray-600 hover:text-gray-800">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h2 className="text-lg font-semibold text-gray-800">Transfer History</h2>
          </div>
        </div>
        {/* Rest of the component remains the same */}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Coin Transfer</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Reason</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Transferred By</th>
              </tr>
            </thead>
            <tbody>
              {transferData.map((transfer, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-800">{transfer.name}</td>
                  <td className="py-3 px-4 text-gray-800">{transfer.coins}</td>
                  <td className="py-3 px-4 text-gray-600">{transfer.reason}</td>
                  <td className="py-3 px-4 text-gray-600">{transfer.date}</td>
                  <td className="py-3 px-4 text-gray-600">{transfer.transferredBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
