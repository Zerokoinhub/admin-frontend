"use client"

import { useState } from "react"
import { ArrowLeft, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ViewScreenshots({ onBack, onApprove, selectedUser }) {
  const [screenshots, setScreenshots] = useState([
    {
      id: 1,
      url: "/placeholder.svg?height=300&width=400",
      title: "Task Completion Screenshot 1",
      status: "pending",
      coins: 100,
      submittedAt: new Date().toISOString(),
    },
    {
      id: 2,
      url: "/placeholder.svg?height=300&width=400",
      title: "Task Completion Screenshot 2",
      status: "pending",
      coins: 150,
      submittedAt: new Date().toISOString(),
    },
    {
      id: 3,
      url: "/placeholder.svg?height=300&width=400",
      title: "Task Completion Screenshot 3",
      status: "pending",
      coins: 200,
      submittedAt: new Date().toISOString(),
    },
  ])

  const handleApprove = (screenshotId) => {
    setScreenshots((prev) =>
      prev.map((screenshot) => (screenshot.id === screenshotId ? { ...screenshot, status: "approved" } : screenshot)),
    )
  }

  const handleReject = (screenshotId) => {
    setScreenshots((prev) =>
      prev.map((screenshot) => (screenshot.id === screenshotId ? { ...screenshot, status: "rejected" } : screenshot)),
    )
  }

  const handleApproveAll = () => {
    const approvedCount = screenshots.filter((s) => s.status === "approved").length
    const totalCoins = screenshots.filter((s) => s.status === "approved").reduce((sum, s) => sum + s.coins, 0)

    const allScreenshotsApproved = screenshots.every((s) => s.status === "approved")

    onApprove({
      approvedCount,
      totalCoins,
      allScreenshotsApproved,
      hasApprovedScreenshots: approvedCount > 0,
    })
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
    }
  }

  const approvedCount = screenshots.filter((s) => s.status === "approved").length
  const totalCoins = screenshots.filter((s) => s.status === "approved").reduce((sum, s) => sum + s.coins, 0)
  const allApproved = screenshots.every((s) => s.status === "approved")

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <CardTitle className="text-xl">Screenshot Review</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Review and approve screenshots for {selectedUser?.name || "selected user"}
                </p>
              </div>
            </div>
            <Button onClick={handleApproveAll} disabled={approvedCount === 0}>
              Continue with Approved ({approvedCount})
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Summary */}
      {approvedCount > 0 && (
        <Alert className={allApproved ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
          <AlertDescription className={allApproved ? "text-green-800" : "text-yellow-800"}>
            {approvedCount} screenshot{approvedCount > 1 ? "s" : ""} approved for a total of {totalCoins} coins.
            {!allApproved && " Please review remaining screenshots."}
          </AlertDescription>
        </Alert>
      )}

      {/* Screenshots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {screenshots.map((screenshot) => (
          <Card key={screenshot.id} className="overflow-hidden">
            <div className="aspect-video bg-gray-100 relative">
              <img
                src={screenshot.url || "/placeholder.svg"}
                alt={screenshot.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2">{getStatusBadge(screenshot.status)}</div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-medium text-sm mb-2">{screenshot.title}</h3>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span>Reward: {screenshot.coins} coins</span>
                <span>{new Date(screenshot.submittedAt).toLocaleDateString()}</span>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleApprove(screenshot.id)}
                  disabled={screenshot.status === "approved"}
                  className="flex-1"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleReject(screenshot.id)}
                  disabled={screenshot.status === "rejected"}
                  className="flex-1"
                >
                  <X className="w-3 h-3 mr-1" />
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
