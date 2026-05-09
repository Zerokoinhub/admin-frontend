"use client"

import React from "react"
import { useEffect, useMemo, useState, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowRight,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Loader2,
  RefreshCw,
  X,
  AlertTriangle,
  Coins,
} from "lucide-react"
import { userAPI } from "../../src/lib/api"

export default function ViewScreenshots({ onBack, onApprove, selectedUser }) {
  const [screenshots, setScreenshots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [approving, setApproving] = useState(false)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [previewIndex, setPreviewIndex] = useState(null)
  const [transferLoading, setTransferLoading] = useState(false)

  // Build screenshot items from selectedUser.screenshots links
  useEffect(() => {
    setLoading(true)
    setError("")

    try {
      const links = selectedUser?.screenshots ?? []
      if (!selectedUser) {
        setError("No user selected")
        setScreenshots([])
        setLoading(false)
        return
      }
      
      // Filter out null/undefined/invalid URLs
      const validLinks = links.filter(url => 
        url && typeof url === 'string' && url !== 'null' && url !== 'undefined' && url.trim() !== ''
      )
      
      if (!Array.isArray(validLinks) || validLinks.length === 0) {
        setError("No screenshots found for this user")
        setScreenshots([])
        setLoading(false)
        return
      }

      const items = validLinks.map((url, idx) => ({
        id: `${selectedUser._id || selectedUser.id || "user"}_${idx}`,
        imageUrl: url,
        description: `Screenshot ${idx + 1}`,
        coins: 10,
        approved: false,
        uploadedAt: new Date().toISOString(),
        status: "pending",
      }))

      setScreenshots(items)
    } catch (e) {
      setError(e?.message || "Failed to prepare screenshots")
      setScreenshots([])
    } finally {
      setLoading(false)
    }
  }, [selectedUser])

  const approvedCount = useMemo(() => {
    if (!Array.isArray(screenshots)) return 0
    return screenshots.filter((s) => s.approved).length
  }, [screenshots])

  const totalCoins = useMemo(() => {
    if (!Array.isArray(screenshots)) return 0
    return screenshots.filter((s) => s.approved).reduce((sum, s) => sum + (s.coins || 0), 0)
  }, [screenshots])
  
  const selectedCount = selectedIds?.size || 0

  // ✅ ACTUALLY TRANSFER COINS TO USER
  const transferCoinsToUser = async (amount, reason) => {
    try {
      setTransferLoading(true)
      const adminUser = JSON.parse(localStorage.getItem("user") || "{}")
      const admin = adminUser.username || adminUser.name || "Admin"
      
      const response = await userAPI.editUserBalance(selectedUser.email, amount, admin)
      
      if (response.success) {
        console.log(`✅ Transferred ${amount} coins to ${selectedUser.email}`)
        return true
      } else {
        console.error("Transfer failed:", response.message)
        return false
      }
    } catch (error) {
      console.error("Transfer error:", error)
      return false
    } finally {
      setTransferLoading(false)
    }
  }

  // ✅ WITHDRAW COINS FROM USER (for unapprove)
  const withdrawCoinsFromUser = async (amount, reason) => {
    try {
      setTransferLoading(true)
      const adminUser = JSON.parse(localStorage.getItem("user") || "{}")
      const admin = adminUser.username || adminUser.name || "Admin"
      
      // Negative amount for withdrawal
      const response = await userAPI.editUserBalance(selectedUser.email, -amount, admin)
      
      if (response.success) {
        console.log(`✅ Withdrew ${amount} coins from ${selectedUser.email}`)
        return true
      } else {
        console.error("Withdrawal failed:", response.message)
        return false
      }
    } catch (error) {
      console.error("Withdrawal error:", error)
      return false
    } finally {
      setTransferLoading(false)
    }
  }

  // ✅ TOGGLE APPROVAL WITH COIN TRANSFER
  const toggleApproval = async (id) => {
    const screenshot = screenshots.find(s => s.id === id)
    if (!screenshot) return

    const newApprovedState = !screenshot.approved
    const coinAmount = screenshot.coins

    if (newApprovedState) {
      // Approving - give coins to user
      const success = await transferCoinsToUser(coinAmount, `Screenshot approval reward - ${screenshot.description}`)
      if (success) {
        setScreenshots((prev) =>
          prev.map((s) => (s.id === id ? { ...s, approved: true, status: "approved" } : s))
        )
        // Update parent component
        const newApprovedCount = approvedCount + 1
        const newTotalCoins = totalCoins + coinAmount
        onApprove?.({
          allScreenshotsApproved: newApprovedCount === screenshots.length,
          approvedCount: newApprovedCount,
          totalCoins: newTotalCoins,
          hasApprovedScreenshots: true,
        })
      } else {
        alert("Failed to approve screenshot. Please try again.")
      }
    } else {
      // Unapproving - take coins back
      const confirm = window.confirm(`Are you sure you want to unapprove this screenshot? ${coinAmount} coins will be deducted from user's balance.`)
      if (confirm) {
        const success = await withdrawCoinsFromUser(coinAmount, `Screenshot approval revoked - ${screenshot.description}`)
        if (success) {
          setScreenshots((prev) =>
            prev.map((s) => (s.id === id ? { ...s, approved: false, status: "pending" } : s))
          )
          // Update parent component
          const newApprovedCount = approvedCount - 1
          const newTotalCoins = totalCoins - coinAmount
          onApprove?.({
            allScreenshotsApproved: newApprovedCount === screenshots.length,
            approvedCount: newApprovedCount,
            totalCoins: newTotalCoins,
            hasApprovedScreenshots: newApprovedCount > 0,
          })
        } else {
          alert("Failed to unapprove screenshot. Please try again.")
        }
      }
    }
  }

  const toggleSelection = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // ✅ APPROVE SELECTED WITH COIN TRANSFER
  const approveSelected = async () => {
    if (!selectedIds || selectedIds.size === 0 || !Array.isArray(screenshots)) return

    setApproving(true)
    const selectedScreenshots = screenshots.filter(s => selectedIds.has(s.id))
    const totalAmount = selectedScreenshots.reduce((sum, s) => sum + s.coins, 0)
    
    const success = await transferCoinsToUser(totalAmount, `Bulk screenshot approval - ${selectedScreenshots.length} screenshot(s)`)
    
    if (success) {
      setScreenshots((prev) =>
        prev.map((s) => (selectedIds.has(s.id) ? { ...s, approved: true, status: "approved" } : s))
      )
      setSelectedIds(new Set())
      const updatedApprovedCount = approvedCount + selectedIds.size
      const updatedTotal = totalCoins + totalAmount
      onApprove?.({
        allScreenshotsApproved: updatedApprovedCount === screenshots.length,
        approvedCount: updatedApprovedCount,
        totalCoins: updatedTotal,
        hasApprovedScreenshots: true,
      })
    } else {
      alert("Failed to approve selected screenshots. Please try again.")
    }
    setApproving(false)
  }

  // ✅ APPROVE ALL WITH COIN TRANSFER
  const approveAll = async () => {
    if (!Array.isArray(screenshots) || screenshots.length === 0) return

    const unapprovedScreenshots = screenshots.filter(s => !s.approved)
    if (unapprovedScreenshots.length === 0) {
      alert("All screenshots are already approved!")
      return
    }

    setApproving(true)
    const totalAmount = unapprovedScreenshots.reduce((sum, s) => sum + s.coins, 0)
    
    const success = await transferCoinsToUser(totalAmount, `All screenshots approval - ${unapprovedScreenshots.length} screenshot(s)`)
    
    if (success) {
      const updated = screenshots.map((s) => ({ ...s, approved: true, status: "approved" }))
      setScreenshots(updated)
      onApprove?.({
        allScreenshotsApproved: true,
        approvedCount: updated.length,
        totalCoins: totalAmount + totalCoins,
        hasApprovedScreenshots: true,
      })
    } else {
      alert("Failed to approve all screenshots. Please try again.")
    }
    setApproving(false)
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

  const handleKey = useCallback(
    (e) => {
      if (previewIndex === null) return
      if (e.key === "Escape") closePreview()
      if (e.key === "ArrowLeft") setPreviewIndex((i) => (i - 1 + screenshots.length) % screenshots.length)
      if (e.key === "ArrowRight") setPreviewIndex((i) => (i + 1) % screenshots.length)
    },
    [previewIndex, screenshots.length],
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [handleKey])

  // ScreenshotImage Component
  const ScreenshotImage = ({ screenshot, index }) => {
    const [imageError, setImageError] = useState(false)
    const [imageLoaded, setImageLoaded] = useState(false)

    if (!screenshot?.imageUrl || screenshot.imageUrl === 'null' || imageError) {
      return (
        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
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
          className="w-full h-full object-cover relative z-[1]"
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true)
            setImageLoaded(false)
          }}
          crossOrigin="anonymous"
        />
      </>
    )
  }

  // Refresh function
  const handleRefresh = () => {
    setLoading(true)
    const links = selectedUser?.screenshots ?? []
    const validLinks = links.filter(url => 
      url && typeof url === 'string' && url !== 'null' && url !== 'undefined' && url.trim() !== ''
    )
    const items = validLinks.map((url, idx) => ({
      id: `${selectedUser?._id || selectedUser?.id || "user"}_${idx}`,
      imageUrl: url,
      description: `Screenshot ${idx + 1}`,
      coins: 10,
      approved: false,
      uploadedAt: new Date().toISOString(),
      status: "pending",
    }))
    setScreenshots(items)
    setSelectedIds(new Set())
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-3 text-blue-600" />
          <span className="text-gray-600">Loading screenshots...</span>
        </div>
      </div>
    )
  }

  if (error && screenshots.length === 0) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <Button onClick={onBack} variant="outline">
            <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
            Back
          </Button>
        </div>
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <Button onClick={onBack} variant="outline" className="mb-4 bg-transparent">
            <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
            Back to Transfer
          </Button>
          <h2 className="text-xl sm:text-2xl font-bold">Screenshots for {selectedUser?.name || "User"}</h2>
          <p className="text-gray-600 text-sm sm:text-base">Review and approve user screenshots</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">
            Approved: {approvedCount}/{screenshots.length}
          </p>
          <p className="text-lg font-bold text-green-600">
            <Coins className="inline h-4 w-4 mr-1" />
            {totalCoins} coins
          </p>
          {selectedCount > 0 && <p className="text-sm text-blue-600">Selected: {selectedCount}</p>}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={handleRefresh} variant="outline" size="sm" disabled={transferLoading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>

        {selectedCount > 0 && (
          <Button onClick={approveSelected} disabled={approving || transferLoading} size="sm" className="bg-blue-600 hover:bg-blue-700">
            {approving || transferLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Approving...
              </>
            ) : (
              `Approve Selected (${selectedCount})`
            )}
          </Button>
        )}
      </div>

      {screenshots.length === 0 && !loading && !error && (
        <div className="text-center py-12">
          <ImageIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium text-gray-600 mb-2">No Screenshots Found</p>
          <p className="text-sm text-gray-500 mb-4">This user hasn't uploaded any screenshots yet.</p>
        </div>
      )}

      {screenshots.length > 0 && (
        <>
          <div className="grid gap-4">
            {screenshots.map((s, idx) => (
              <Card
                key={s.id}
                className={`transition-all cursor-pointer ${
                  s.approved
                    ? "ring-2 ring-green-500 bg-green-50"
                    : selectedIds.has(s.id)
                      ? "ring-2 ring-blue-500 bg-blue-50"
                      : "hover:shadow-md"
                }`}
                onClick={() => toggleSelection(s.id)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <button
                        type="button"
                        className="relative w-20 h-20 rounded-lg overflow-hidden border bg-gray-100 shrink-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          openPreviewAt(idx)
                        }}
                        aria-label={`Open screenshot ${idx + 1}`}
                      >
                        <ScreenshotImage screenshot={s} index={idx} />
                        {selectedIds.has(s.id) && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center z-10">
                            <CheckCircle className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base break-words">{s.description}</p>
                        <p className="text-sm text-gray-600">
                          <Coins className="inline h-3 w-3 mr-1" />
                          {s.coins} coins
                        </p>
                        {s.uploadedAt && (
                          <div className="flex items-center gap-1 mt-1">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            <p className="text-xs text-gray-500">{new Date(s.uploadedAt).toLocaleDateString()}</p>
                          </div>
                        )}
                        {s.status && (
                          <Badge variant={s.status === "approved" ? "default" : "secondary"} className="mt-1 text-xs">
                            {s.status === "approved" ? "✓ Approved" : "Pending"}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {s.approved && (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approved
                        </Badge>
                      )}
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleApproval(s.id)
                        }}
                        disabled={transferLoading}
                        variant={s.approved ? "destructive" : "default"}
                        size="sm"
                        className="w-full sm:w-auto"
                      >
                        {s.approved ? "Unapprove" : "Approve"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button
              onClick={approveAll}
              disabled={approving || transferLoading || approvedCount === screenshots.length}
              className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
            >
              {approving || transferLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Approve All (${screenshots.reduce((sum, s) => sum + (s.coins || 0), 0)} coins)`
              )}
            </Button>
          </div>
        </>
      )}

      {/* Lightbox Overlay */}
      {previewIndex !== null && screenshots[previewIndex] && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={closePreview}
        >
          <button
            type="button"
            aria-label="Close preview"
            className="absolute top-4 right-4 text-white/90 hover:text-white"
            onClick={(e) => {
              e.stopPropagation()
              closePreview()
            }}
          >
            <X className="h-7 w-7" />
          </button>

          <button
            type="button"
            aria-label="Previous"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/90 hover:text-white"
            onClick={prevPreview}
          >
            <ChevronLeft className="h-10 w-10" />
          </button>

          <div className="max-w-[95vw] max-h-[85vh] relative" onClick={(e) => e.stopPropagation()}>
            <img
              src={screenshots[previewIndex].imageUrl}
              alt={`Screenshot preview ${previewIndex + 1}`}
              className="max-w-[95vw] max-h-[85vh] object-contain rounded-md shadow-lg"
              crossOrigin="anonymous"
            />
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white/90 text-sm bg-black/50 px-2 py-1 rounded">
              {previewIndex + 1} / {screenshots.length}
            </div>
          </div>

          <button
            type="button"
            aria-label="Next"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/90 hover:text-white"
            onClick={nextPreview}
          >
            <ChevronRight className="h-10 w-10" />
          </button>
        </div>
      )}
    </div>
  )
}
