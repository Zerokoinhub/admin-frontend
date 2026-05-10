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

  // Load screenshots from localStorage
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
      approved: savedApproved[idx] == true,
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

  // ✅ APPROVE - Send positive 10, API will add
  const handleApprove = async (id) => {
    const screenshot = screenshots.find(s => s.id === id)
    if (!screenshot || screenshot.approved) return

    setProcessingId(id)
    
    try {
      const adminUser = JSON.parse(localStorage.getItem("user") || "{}")
      const admin = adminUser.username || adminUser.name || "Admin"
      const token = localStorage.getItem("token")
      
      console.log("📤 Approve - Sending:", screenshot.coins)
      
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
      console.log("📥 Approve Response:", result)
      
      if (result.success) {
        // Update local state
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

  // ✅ UNAPPROVE - Fetch current balance, calculate new, send positive number
  const handleUnapprove = async (id) => {
    const screenshot = screenshots.find(s => s.id === id)
    if (!screenshot || !screenshot.approved) return

    const confirm = window.confirm(`⚠️ Are you sure? ${screenshot.coins} coins will be DEDUCTED from ${selectedUser.name}'s balance.`)
    if (!confirm) return

    setProcessingId(id)
    
    try {
      const adminUser = JSON.parse(localStorage.getItem("user") || "{}")
      const admin = adminUser.username || adminUser.name || "Admin"
      const token = localStorage.getItem("token")
      
      // Step 1: Get current balance
      const userResponse = await fetch(`/api/users?email=${selectedUser.email}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const userData = await userResponse.json()
      const users = userData.users || userData.data || []
      const currentUser = users.find(u => u.email === selectedUser.email)
      const currentBalance = currentUser?.balance || 0
      
      console.log("📤 Unapprove - Current Balance:", currentBalance)
      
      // Step 2: Calculate new balance (positive number)
      const newBalance = currentBalance - screenshot.coins
      
      if (newBalance < 0) {
        alert(`❌ Cannot unapprove! User only has ${currentBalance} coins.`)
        setProcessingId(null)
        return
      }
      
      console.log("📤 Unapprove - Sending new balance:", newBalance)
      
      // Step 3: Send POSITIVE number (API will SET to this value)
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
      console.log("📥 Unapprove Response:", result)
      
      if (result.success) {
        // Update local state
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
        alert("❌ Failed to unapprove: " + (result.message || "Please try again"))
      }
    } catch (error) {
      console.error("Unapprove error:", error)
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

  const openPreviewAt = (idx) => setPreviewIndex(idx)
  const closePreview = () => setPreviewIndex(null)
  
  const prevPreview = (e) => {
    e?.stopPropagation()
    if (previewIndex === null) return
    setPreviewIndex((prev) => (prev - 1 + screenshots.length) % screenshots.length)
  }
  
  const nextPreview = (e) => {
    e?.stopPropagation()
    if (previewIndex === null) return
    setPreviewIndex((prev) => (prev + 1) % screenshots.length)
  }

  const handleKey = useCallback((e) => {
    if (previewIndex === null) return
    if (e.key === "Escape") closePreview()
    if (e.key === "ArrowLeft") setPreviewIndex(i => (i - 1 + screenshots.length) % screenshots.length)
    if (e.key === "ArrowRight") setPreviewIndex(i => (i + 1) % screenshots.length)
  }, [previewIndex, screenshots.length])

  useEffect(() => {
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [handleKey])

  // ScreenshotImage Component
  const ScreenshotImage = ({ screenshot, index }) => {
    const [imageError, setImageError] = useState(false)
    const [imageLoaded, setImageLoaded] = useState(false)

    if (!screenshot?.imageUrl || imageError) {
      return (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          <ImageIcon className="h-8 w-8 text-gray-400" />
        </div>
      )
    }

    return (
      <>
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        )}
        <img
          src={screenshot.imageUrl}
          alt={`Screenshot ${index + 1}`}
          className="w-full h-full object-cover"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          crossOrigin="anonymous"
        />
      </>
    )
  }

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
      {/* Header */}
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

      {/* Refresh Button */}
      <div className="flex gap-2">
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Screenshots List */}
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
                  {/* Screenshot Thumbnail */}
                  <button
                    className="relative w-20 h-20 rounded overflow-hidden border shrink-0"
                    onClick={() => openPreviewAt(idx)}
                  >
                    <ScreenshotImage screenshot={s} index={idx} />
                  </button>
                  
                  {/* Screenshot Info */}
                  <div className="flex-1">
                    <p className="font-medium">{s.description}</p>
                    <p className="text-sm text-gray-600">
                      <Coins className="inline h-3 w-3 mr-1" />
                      {s.coins} coins
                    </p>
                    {s.uploadedAt && (
                      <p className="text-xs text-gray-400">{new Date(s.uploadedAt).toLocaleDateString()}</p>
                    )}
                  </div>
                  
                  {/* Action Button */}
                  <div>
                    {s.approved ? (
                      <Button
                        onClick={() => handleUnapprove(s.id)}
                        disabled={processingId === s.id}
                        variant="outline"
                        size="sm"
                        className="bg-red-600 text-white hover:bg-red-700 border-red-600"
                      >
                        {processingId === s.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Unapprove"}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleApprove(s.id)}
                        disabled={processingId === s.id}
                        variant="default"
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
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

      {/* Lightbox Preview */}
      {previewIndex !== null && screenshots[previewIndex] && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center" onClick={closePreview}>
          <button className="absolute top-4 right-4 text-white text-2xl" onClick={closePreview}>✕</button>
          <button className="absolute left-4 text-white text-4xl" onClick={prevPreview}>‹</button>
          <img src={screenshots[previewIndex].imageUrl} className="max-w-[90vw] max-h-[90vh] object-contain" />
          <button className="absolute right-4 text-white text-4xl" onClick={nextPreview}>›</button>
        </div>
      )}
    </div>
  )
}
