
"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Coins,
  History,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Loader2,
  Filter,
  User,
  List,
  Clock,
  Copy,
  Check,
} from "lucide-react"

import { withdrawalAPI, withdrawalHelpers } from "../../src/lib/api"



export default function WithdrawalsClientPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  const [filters, setFilters] = useState({
    search: "",
    status: "all", 
  })

  const [updatingId, setUpdatingId] = useState(null)
  const [copiedId, setCopiedId] = useState(null)

  const fetchWithdrawalRequests = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const response = await withdrawalAPI.getWithdrawalRequests(filters)
      if (response.success) {
        const formattedRequests = response.data.map(withdrawalHelpers.formatWithdrawalData)
        setRequests(formattedRequests)
      } else {
        setError(response.message || "Failed to fetch withdrawal requests")
      }
    } catch (err) {
      setError("Error loading requests: " + err.message)
      console.error("Withdrawal requests error:", err)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchWithdrawalRequests()
  }, [fetchWithdrawalRequests])

  const handleCopy = (address, id) => {
    if (!address) return;
    navigator.clipboard.writeText(address).then(() => {
      setCopiedId(id);
      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };
  
  const handleStatusChange = async (withdrawalId, newStatus) => {
    if (!window.confirm(`Are you sure you want to change this request's status to "${newStatus}"?`)) {
      return;
    }
    setUpdatingId(withdrawalId);
    setError("");
    try {
        const response = await withdrawalAPI.updateWithdrawalStatus(withdrawalId, newStatus);
        if (response.success) {
            fetchWithdrawalRequests();
        } else {
            setError(response.message || "Failed to update status.");
        }
    } catch (err) {
        setError("Client error updating status: " + err.message);
    } finally {
        setUpdatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case "failed":
         return <Badge variant="destructive">Failed</Badge>;
      case "rejected":
         return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const withdrawalStats = useMemo(() => {
    const stats = {
      total: requests.length,
      pending: 0,
      completed: 0,
      failedOrRejected: 0,
    };
    requests.forEach(req => {
      if (req.status === 'pending') stats.pending++;
      if (req.status === 'completed') stats.completed++;
      if (req.status === 'failed' || req.status === 'rejected') stats.failedOrRejected++;
    });
    return stats;
  }, [requests]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Withdrawal Requests</h1>
              <p className="text-gray-600 mt-1">Review and process user withdrawal requests</p>
            </div>
            <Button onClick={fetchWithdrawalRequests} disabled={loading} variant="outline" className="w-full sm:w-auto">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
            </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Displayed</p>
                <p className="text-2xl font-bold">{withdrawalStats.total}</p>
              </div>
              <List className="h-6 w-6 text-gray-400" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Pending</p>
                <p className="text-2xl font-bold">{withdrawalStats.pending}</p>
              </div>
              <Clock className="h-6 w-6 text-yellow-500" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Completed</p>
                <p className="text-2xl font-bold">{withdrawalStats.completed}</p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-500" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Failed/Rejected</p>
                <p className="text-2xl font-bold">{withdrawalStats.failedOrRejected}</p>
              </div>
              <XCircle className="h-6 w-6 text-red-500" />
            </CardContent>
          </Card>
        </div>

        <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><Filter className="h-5 w-5" /> Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by user name or email..."
                    value={filters.search}
                    onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger><SelectValue placeholder="Filter by status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
        </Card>
        
        {error && (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        <Card>
            <CardHeader><CardTitle>Withdrawal History</CardTitle></CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-16">
                  <History className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 font-medium">No requests found</p>
                  <p className="text-sm text-gray-400">Try adjusting your filters.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((req) => (
                    <div key={req.id} className="border rounded-lg p-4 hover:bg-gray-50/50 transition-colors">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                        
                        <div className="flex items-center gap-3 md:col-span-1">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{req.userName}</p>
                            <p className="text-sm text-gray-500">{req.userEmail}</p>
                          </div>
                        </div>

                        <div className="md:col-span-1">
                            <div className="flex items-center gap-2">
                                <Coins className="h-5 w-5 text-red-500" />
                                <p className="text-lg font-bold text-red-600">{req.amount} coins</p>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500 font-medium">To:</span>
                                <p className="text-xs text-gray-500 truncate" title={req.walletAddress}>
                                    {req.walletAddress || "N/A"}
                                </p>
                                {req.walletAddress && (
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-6 w-6" 
                                    onClick={() => handleCopy(req.walletAddress, req.id)}
                                  >
                                    {copiedId === req.id ? (
                                      <Check className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <Copy className="h-4 w-4 text-gray-400" />
                                    )}
                                  </Button>
                                )}
                            </div>
                        </div>
                        
                        <div className="text-sm text-gray-600 md:col-span-1">
                            {getStatusBadge(req.status)}
                            <p className="mt-1.5 text-xs text-gray-500">
                                {req.date} at {req.time}
                            </p>
                        </div>

                        <div className="md:col-span-1 md:justify-self-end">
                          {req.status === 'pending' ? (
                            <Select
                                onValueChange={(newStatus) => handleStatusChange(req.id, newStatus)}
                                disabled={updatingId === req.id}
                            >
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    {updatingId === req.id ? (
                                        <div className="flex items-center gap-2">
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                          <span>Processing...</span>
                                        </div>
                                    ) : (
                                        <SelectValue placeholder="Update Status" />
                                    )}
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="completed"><span className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-500" />Approve</span></SelectItem>
                                    <SelectItem value="rejected"><span className="flex items-center"><XCircle className="w-4 h-4 mr-2 text-red-500" />Reject</span></SelectItem>
                                    <SelectItem value="failed"><span className="flex items-center"><AlertTriangle className="w-4 h-4 mr-2 text-orange-500" />Mark as Failed</span></SelectItem>
                                </SelectContent>
                            </Select>
                          ) : (
                             <p className="text-sm text-gray-500 font-medium text-center md:text-right">No actions available</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
        </Card>
      </div>
    </div>
  )
}