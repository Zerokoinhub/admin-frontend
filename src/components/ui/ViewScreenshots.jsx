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
  const [processingId, setProcessingId] = useState(null)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [previewIndex, setPreviewIndex] = useState(null)
  const [transferring, setTransferring] = useState(false)

  // Load screenshots from API on mount and when selectedUser changes
  const loadScreenshotsFromAPI = useCallback(async () => {
    if (!selectedUser?.email) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/users?email=${selectedUser.email}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await response.json()
      const users = data.users || data.data || []
      const freshUser = users.find(u => u.email === selectedUser.email)
      
      if (freshUser?.screenshots) {
        const validLinks = freshUser.screenshots.filter(url => 
          url && typeof url === 'string' && url !== 'null' && url !== 'undefined' && url.trim() !== ''
        )
        
        const items = validLinks.map((url, idx) => ({
          id: `${freshUser._id || freshUser.id || "user"}_${idx}`,
          imageUrl: url,
          description: `Screenshot ${idx + 1}`,
          coins: 10,
          approved: false, // Always start with false, we'll track approval status separately
          uploadedAt: new Date().toISOString(),
          status: "pending",
        }))
        setScreenshots(items)
      }
    } catch (error) {
      console.error("Error loading screenshots:", error)
    } finally {
      setLoading(false)
    }
  }, [selectedUser])

  useEffect(() => {
    loadScreenshotsFromAPI()
  }, [loadScreenshotsFromAPI])

  const approvedCount = useMemo(() => {
    if (!Array.isArray(screenshots)) return 0
    return screenshots.filter((s) => s.approved).length
  }, [screenshots])

  const totalCoins = useMemo(() => {
    if (!Array.isArray(screenshots)) return 0
    return screenshots.filter((s) => s.approved).reduce((sum, s) => sum + (s.coins || 0), 0)
  }, [screenshots])
  
  const selectedCount = selectedIds?.size || 0

  // ✅ APPROVE - Add coins to user
  const handleApprove = async (id) => {
    const screenshot = screenshots.find(s => s.id === id)
    if (!screenshot || screenshot.approved || transferring) return

    setProcessingId(id)
    setTransferring(true)
    
    try {
      const adminUser = JSON.parse(localStorage.getItem("user") || "{}")
      const admin = adminUser.username || adminUser.name || "Admin"
      
      // Transfer coins to user
      const response = await userAPI.editUserBalance(selectedUser.email, screenshot.coins, admin)
      
      if (response.success) {
        // Update local state
        const updatedScreenshots = screenshots.map((s) => 
          s.id === id ? { ...s, approved: true, status: "approved" } : s
        )
        setScreenshots(updatedScreenshots)
        
        // Remove from selected if present
        if (selectedIds.has(id)) {
          const newSelected = new Set(selectedIds)
          newSelected.delete(id)
          setSelectedIds(newSelected)
        }
        
        // Update parent
        const newApprovedCount = approvedCount + 1
        const newTotalCoins = totalCoins + screenshot.coins
        onApprove?.({
          allScreenshotsApproved: newApprovedCount === screenshots.length,
          approvedCount: newApprovedCount,
          totalCoins: newTotalCoins,
          hasApprovedScreenshots: true,
        })
        
        alert(`✅ Approved! ${screenshot.coins} coins added to ${selectedUser.name}'s balance.`)
        
        // Reload to get fresh data
        await loadScreenshotsFromAPI()
      } else {
        alert("❌ Failed to approve. Please try again.")
      }
    } catch (error) {
      console.error("Approve error:", error)
      alert("❌ Error approving screenshot.")
    } finally {
      setProcessingId(null)
      setTransferring(false)
    }
  }

  // ✅ UNAPPROVE - Deduct coins from user
  const handleUnapprove = async (id) => {
    const screenshot = screenshots.find(s => s.id === id)
    if (!screenshot || !screenshot.approved || transferring) return

    const confirm = window.confirm(`⚠️ Are you sure? ${screenshot.coins} coins will be deducted from ${selectedUser.name}'s balance.`)
    if (!confirm) return

    setProcessingId(id)
    setTransferring(true)
    
    try {
      const adminUser = JSON.parse(localStorage.getItem("user") || "{}")
      const admin = adminUser.username || adminUser.name || "Admin"
      
      // Deduct coins from user
      const response = await userAPI.editUserBalance(selectedUser.email, -screenshot.coins, admin)
      
      if (response.success) {
        // Update local state
        const updatedScreenshots = screenshots.map((s) => 
          s.id === id ? { ...s, approved: false, status: "pending" } : s
        )
        setScreenshots(updatedScreenshots)
        
        // Update parent
        const newApprovedCount = approvedCount - 1
        const newTotalCoins = totalCoins - screenshot.coins
        onApprove?.({
          allScreenshotsApproved: newApprovedCount === screenshots.length,
          approvedCount: newApprovedCount,
          totalCoins: newTotalCoins,
          hasApprovedScreenshots: newApprovedCount > 0,
        })
        
        alert(`✅ Unapproved! ${screenshot.coins} coins deducted from ${selectedUser.name}'s balance.`)
        
        // Reload to get fresh data
        await loadScreenshotsFromAPI()
      } else {
        alert("❌ Failed to unapprove. Please try again.")
      }
    } catch (error) {
      console.error("Unapprove error:", error)
      alert("❌ Error unapproving screenshot.")
    } finally {
      setProcessingId(null)
      setTransferring(false)
    }
  }

  const toggleSelection = (id) => {
    const screenshot = screenshots.find(s => s.id === id)
    if (screenshot?.approved) return // Cannot select approved screenshots
    
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Approve selected (only pending ones)
  const approveSelected = async () => {
    const selectedScreenshots = screenshots.filter(s => selectedIds.has(s.id) && !s.approved)
    if (selectedScreenshots.length === 0) {
      alert("No pending screenshots selected!")
      return
    }

    if (transferring) return
    setTransferring(true)
    
    const totalAmount = selectedScreenshots.reduce((sum, s) => sum + s.coins, 0)
    
    try {
      const adminUser = JSON.parse(localStorage.getItem("user") || "{}")
      const admin = adminUser.username || adminUser.name || "Admin"
      
      const response = await userAPI.editUserBalance(selectedUser.email, totalAmount, admin)
      
      if (response.success) {
        const updatedScreenshots = screenshots.map((s) => 
          selectedIds.has(s.id) && !s.approved ? { ...s, approved: true, status: "approved" } : s
        )
        setScreenshots(updatedScreenshots)
        
        const newApprovedCount = updatedScreenshots.filter(s => s.approved).length
        const newTotalCoins = updatedScreenshots.filter(s => s.approved).reduce((sum, s) => sum + s.coins, 0)
        
        onApprove?.({
          allScreenshotsApproved: newApprovedCount === screenshots.length,
          approvedCount: newApprovedCount,
          totalCoins: newTotalCoins,
          hasApprovedScreenshots: true,
        })
        
        setSelectedIds(new Set())
        alert(`✅ Approved ${selectedScreenshots.length} screenshot(s)! ${totalAmount} coins added.`)
        
        await loadScreenshotsFromAPI()
      } else {
        alert("❌ Failed to approve selected screenshots.")
      }
    } catch (error) {
      alert("❌ Error approving selected screenshots.")
    } finally {
      setTransferring(false)
    }
  }

  // Approve all pending
  const approveAll = async () => {
    const unapprovedScreenshots = screenshots.filter(s => !s.approved)
    if (unapprovedScreenshots.length === 0) {
      alert("All screenshots are already approved!")
      return
    }

    if (transferring) return
    setTransferring(true)
    
    const totalAmount = unapprovedScreenshots.reduce((sum, s) => sum + s.coins, 0)
    
    try {
      const adminUser = JSON.parse(localStorage.getItem("user") || "{}")
      const admin = adminUser.username || adminUser.name || "Admin"
      
      const response = await userAPI.editUserBalance(selectedUser.email, totalAmount, admin)
      
      if (response.success) {
        const updatedScreenshots = screenshots.map((s) => ({ ...s, approved: true, status: "approved" }))
        setScreenshots(updatedScreenshots)
        
        onApprove?.({
          allScreenshotsApproved: true,
          approvedCount: updatedScreenshots.length,
          totalCoins: updatedScreenshots.reduce((sum, s) => sum + s.coins, 0),
          hasApprovedScreenshots: true,
        })
        
        setSelectedIds(new Set())
        alert(`✅ All ${unapprovedScreenshots.length} screenshot(s) approved! ${totalAmount} coins added.`)
        
        await loadScreenshotsFromAPI()
      } else {
        alert("❌ Failed to approve all screenshots.")
      }
    } catch (error) {
      alert("❌ Error approving all screenshots.")
    } finally {
      setTransferring(false)
    }
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
    loadScreenshotsFromAPI()
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
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={handleRefresh} variant="outline" size="sm" disabled={transferring}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>

        {/* ✅ REMOVED "Approved Selected" button from here - it was removed */}
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
                className={`transition-all ${
                  s.approved
                    ? "ring-2 ring-green-500 bg-green-50 cursor-default"
                    : selectedIds.has(s.id)
                      ? "ring-2 ring-blue-500 bg-blue-50 cursor-pointer"
                      : "hover:shadow-md cursor-pointer"
                }`}
                onClick={() => !s.approved && toggleSelection(s.id)}
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
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {s.approved ? (
                        <>
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approved
                          </Badge>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleUnapprove(s.id)
                            }}
                            disabled={processingId === s.id || transferring}
                            variant="destructive"
                            size="sm"
                            className="w-full sm:w-auto"
                          >
                            {processingId === s.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Unapprove"
                            )}
                          </Button>
                        </>
                      ) : (
                        <>
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            Pending
                          </Badge>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleApprove(s.id)
                            }}
                            disabled={processingId === s.id || transferring}
                            variant="default"
                            size="sm"
                            className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                          >
                            {processingId === s.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Approve"
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button
              onClick={approveAll}
              disabled={approvedCount === screenshots.length || transferring}
              className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
            >
              Approve All ({screenshots.filter(s => !s.approved).reduce((sum, s) => sum + s.coins, 0)} coins pending)
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
