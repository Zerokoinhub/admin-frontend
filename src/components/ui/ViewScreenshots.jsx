"use client"

import React, { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Loader2,
  RefreshCw,
  X,
  Coins,
} from "lucide-react"

export default function ViewScreenshots({ onBack, onApprove, selectedUser }) {
  const [screenshots, setScreenshots] = useState([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState(null)
  const [previewIndex, setPreviewIndex] = useState(null)

  const getStorageKey = () => `screenshots_approved_${selectedUser?.email}`

  useEffect(() => {
    if (!selectedUser?.screenshots) {
      setLoading(false)
      return
    }

    const validLinks = selectedUser.screenshots.filter(url => 
      url && typeof url === 'string' && url !== 'null' && url !== 'undefined' && url.trim() !== ''
    )

    const savedApproved = JSON.parse(localStorage.getItem(getStorageKey()) || "{}")

    const items = validLinks.map((url, idx) => ({
      id: `${selectedUser._id || selectedUser.id || "user"}_${idx}`,
      imageUrl: url,
      description: `Screenshot ${idx + 1}`,
      coins: 10,
      approved: savedApproved[idx] == true,  // ✅ Double equals
      uploadedAt: new Date().toISOString(),
    }))

    setScreenshots(items)
    setLoading(false)
  }, [selectedUser])

  const approvedCount = screenshots.filter(s => s.approved).length
  const totalCoins = screenshots.filter(s => s.approved).reduce((sum, s) => sum + s.coins, 0)

  const saveToLocalStorage = (updatedScreenshots) => {
    const approvedStatus = {}
    updatedScreenshots.forEach((s, idx) => {
      approvedStatus[idx] = s.approved
    })
    localStorage.setItem(getStorageKey(), JSON.stringify(approvedStatus))
  }

  // ✅ APPROVE - Positive amount
  const handleApprove = async (id) => {
    const screenshot = screenshots.find(s => s.id === id)
    if (!screenshot || screenshot.approved) return

    setProcessingId(id)
    
    try {
      const adminUser = JSON.parse(localStorage.getItem("user") || "{}")
      const admin = adminUser.username || adminUser.name || "Admin"
      const token = localStorage.getItem("token")
      
      const response = await fetch('/api/users/edit-balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: selectedUser.email,
          newBalance: screenshot.coins,
          admin: admin
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        const updatedScreenshots = screenshots.map(s => 
          s.id === id ? { ...s, approved: true } : s
        )
        setScreenshots(updatedScreenshots)
        saveToLocalStorage(updatedScreenshots)
        
        onApprove?.({
          approvedCount: approvedCount + 1,
          totalCoins: totalCoins + screenshot.coins,
          hasApprovedScreenshots: true,
        })
        
        alert(`✅ ${screenshot.coins} coins added to ${selectedUser.name}`)
      } else {
        alert("❌ Failed: " + (result.message || "Unknown error"))
      }
    } catch (error) {
      console.error("Approve error:", error)
      alert("❌ Error approving screenshot")
    } finally {
      setProcessingId(null)
    }
  }

  // ✅ UNAPPROVE - Fetch balance, send positive new balance
  const handleUnapprove = async (id) => {
    const screenshot = screenshots.find(s => s.id === id)
    if (!screenshot || !screenshot.approved) return

    const confirm = window.confirm(`⚠️ Are you sure? ${screenshot.coins} coins will be DEDUCTED.`)
    if (!confirm) return

    setProcessingId(id)
    
    try {
      const adminUser = JSON.parse(localStorage.getItem("user") || "{}")
      const admin = adminUser.username || adminUser.name || "Admin"
      const token = localStorage.getItem("token")
      
      // Get current balance
      const userResponse = await fetch(`/api/users?email=${selectedUser.email}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const userData = await userResponse.json()
      const users = userData.users || userData.data || []
      const currentUser = users.find(u => u.email === selectedUser.email)
      const currentBalance = currentUser?.balance || 0
      
      const newBalance = currentBalance - screenshot.coins
      
      if (newBalance < 0) {
        alert(`❌ User only has ${currentBalance} coins.`)
        setProcessingId(null)
        return
      }
      
      // Send POSITIVE new balance
      const response = await fetch('/api/users/edit-balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: selectedUser.email,
          newBalance: newBalance,
          admin: admin
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        const updatedScreenshots = screenshots.map(s => 
          s.id === id ? { ...s, approved: false } : s
        )
        setScreenshots(updatedScreenshots)
        saveToLocalStorage(updatedScreenshots)
        
        onApprove?.({
          approvedCount: approvedCount - 1,
          totalCoins: totalCoins - screenshot.coins,
          hasApprovedScreenshots: approvedCount - 1 > 0,
        })
        
        alert(`✅ Unapproved! ${screenshot.coins} coins deducted. New balance: ${newBalance}`)
      } else {
        alert("❌ Failed to unapprove: " + (result.message))
      }
    } catch (error) {
      alert("❌ Error unapproving screenshot")
    } finally {
      setProcessingId(null)
    }
  }

  const handleRefresh = () => {
    const savedApproved = JSON.parse(localStorage.getItem(getStorageKey()) || "{}")
    const updatedScreenshots = screenshots.map((s, idx) => ({
      ...s,
      approved: savedApproved[idx] == true
    }))
    setScreenshots(updatedScreenshots)
  }

  // ... rest of the component (openPreviewAt, closePreview, etc.)

  if (loading) {
    return (
      <div className="p-6 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <p>Loading screenshots...</p>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <Button onClick={onBack} variant="outline">
            <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
            Back
          </Button>
          <h2 className="text-xl font-bold mt-2">{selectedUser?.name}</h2>
          <p className="text-sm text-gray-500">{selectedUser?.email}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Approved: {approvedCount}/{screenshots.length}</p>
          <p className="text-lg font-bold text-green-600">
            <Coins className="inline h-4 w-4 mr-1" />
            {totalCoins} coins
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {screenshots.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <p>No screenshots found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {screenshots.map((s, idx) => (
            <Card key={s.id} className={s.approved ? "border-green-500 bg-green-50" : ""}>
              <CardContent className="p-4">
                <div className="flex gap-4 items-center">
                  <button
                    className="relative w-20 h-20 rounded overflow-hidden border shrink-0"
                    onClick={() => openPreviewAt(idx)}
                  >
                    <ScreenshotImage screenshot={s} index={idx} />
                  </button>
                  
                  <div className="flex-1">
                    <p className="font-medium">{s.description}</p>
                    <p className="text-sm text-gray-600">
                      <Coins className="inline h-3 w-3 mr-1" />
                      {s.coins} coins
                    </p>
                  </div>
                  
                  <div>
                    {s.approved ? (
                      <Button
                        onClick={() => handleUnapprove(s.id)}
                        disabled={processingId === s.id}
                        variant="outline"
                        size="sm"
                        className="bg-red-600 text-white"
                      >
                        {processingId === s.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Unapprove"}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleApprove(s.id)}
                        disabled={processingId === s.id}
                        variant="default"
                        size="sm"
                        className="bg-green-600"
                      >
                        {processingId === s.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Approve"}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
