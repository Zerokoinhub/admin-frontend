"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search, User, Coins, Send, History, CheckCircle, XCircle, AlertTriangle,
  RefreshCw, Download, Shield, Eye, Edit, ArrowRight, Loader2, Activity,
  Users, Wallet, Calculator, TrendingUp, Filter, Image as ImageIcon, Bug
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { userAPI, userHelpers } from "../../src/lib/api"
import UserAvatar from "@/components/ui/UserAvatar"

// Debug Hook
const useDebug = () => {
  const [logs, setLogs] = useState([])
  const addLog = useCallback((msg, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev.slice(-99), { msg, type, timestamp }])
    console.log(`[${type}] ${msg}`)
  }, [])
  return { logs, addLog, clearLogs: () => setLogs([]) }
}

// Fixed ScreenshotViewer
const ScreenshotViewer = ({ screenshots, onBack, onApprove, selectedUser, addLog }) => {
  const [selected, setSelected] = useState({})
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState({})
  
  const valid = (screenshots || []).filter(url => url && typeof url === 'string' && url !== 'null' && url.trim())
  
  useEffect(() => {
    const init = {}
    valid.forEach((_, i) => init[i] = true)
    setLoading(init)
  }, [valid])
  
  if (valid.length === 0) return (
    <div className="p-6 text-center">
      <Card className="max-w-md mx-auto">
        <CardContent className="p-8">
          <ImageIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p>No screenshots available</p>
          <Button onClick={onBack} className="mt-4">Go Back</Button>
        </CardContent>
      </Card>
    </div>
  )
  
  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <Button onClick={onBack} variant="outline"><ArrowRight className="rotate-180 mr-2" /> Back</Button>
        <div className="flex gap-2">
          <Button onClick={() => {
            const all = {}; valid.forEach((_, i) => all[i] = true); setSelected(all)
            addLog?.(`✅ Approved all ${valid.length} screenshots`, 'success')
          }} variant="outline">Approve All</Button>
          <Button onClick={() => {
            const approved = Object.keys(selected).filter(k => selected[k])
            onApprove({ approvedCount: approved.length, allScreenshotsApproved: approved.length === valid.length, totalCoins: approved.length * 10 })
          }} disabled={Object.keys(selected).length === 0}>Submit ({Object.keys(selected).length})</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {valid.map((url, i) => (
          <Card key={i}>
            <div className="relative aspect-video bg-gray-100">
              {loading[i] && <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="animate-spin" /></div>}
              {!errors[i] ? (
                <img src={url} className="w-full h-full object-contain" onLoad={() => setLoading(p => ({ ...p, [i]: false }))} onError={() => { setErrors(p => ({ ...p, [i]: true })); addLog?.(`❌ Failed: ${url.substring(0, 50)}`, 'error') }} />
              ) : (
                <div className="p-4 text-center">Failed to load</div>
              )}
            </div>
            <CardContent className="p-3">
              <Button variant={selected[i] ? "default" : "outline"} size="sm" onClick={() => setSelected(p => ({ ...p, [i]: !p[i] }))} className="w-full">
                {selected[i] ? <CheckCircle className="mr-1" /> : <XCircle className="mr-1" />}
                {selected[i] ? "Approved" : "Approve"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Compact TransferHistory
const TransferHistory = ({ onBack }) => (
  <div className="p-6"><Button onClick={onBack} variant="outline"><ArrowRight className="rotate-180 mr-2" /> Back</Button><Card><CardContent className="p-8 text-center">Transfer History View</CardContent></Card></div>
)

// UserSelector with Debug
const UserSelector = ({ selectedUser, onUserSelect, addLog }) => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  
  const fetchUsers = useCallback(async () => {
    setLoading(true)
    addLog?.("🔄 Fetching users...", "info")
    try {
      const res = await userAPI.getUsers(1, 200, { search })
      const data = res.users || res.data || []
      addLog?.(`✅ Loaded ${data.length} users`, "success")
      const usersWithScreenshots = data.filter(u => u.screenshots?.length > 0 && u.screenshots[0] !== null)
      addLog?.(`📸 Users with valid screenshots: ${usersWithScreenshots.length}`, "info")
      setUsers(data.map(u => ({ ...u, id: u._id || u.id, validScreenshots: (u.screenshots || []).filter(s => s && s !== null) })))
    } catch(e) { addLog?.(`❌ Error: ${e.message}`, "error") }
    finally { setLoading(false) }
  }, [search, addLog])
  
  useEffect(() => { fetchUsers() }, [fetchUsers])
  
  return (
    <div>
      <div className="relative mb-4"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" /></div>
      {loading ? <Loader2 className="animate-spin mx-auto" /> : (
        <Select value={selectedUser?.id || ""} onValueChange={v => { const u = users.find(u => (u.id || u._id) === v); addLog?.(`👤 Selected: ${u?.email} (${u?.validScreenshots?.length || 0} screenshots)`, "info"); onUserSelect(u) }}>
          <SelectTrigger><SelectValue placeholder="Select user..." /></SelectTrigger>
          <SelectContent>{users.map(u => (<SelectItem key={u.id} value={u.id || u._id}><div className="flex justify-between w-full"><span>{u.name} ({u.email})</span>{u.validScreenshots?.length > 0 && <Badge className="ml-2">{u.validScreenshots.length} 📸</Badge>}</div></SelectItem>))}</SelectContent>
        </Select>
      )}
    </div>
  )
}

// Main Component
export default function CoinTransferPage() {
  const [userRole, setUserRole] = useState("")
  const [selectedUser, setSelectedUser] = useState(null)
  const [transferAmount, setTransferAmount] = useState("")
  const [transferReason, setTransferReason] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })
  const [showScreenshots, setShowScreenshots] = useState(false)
  const [screenshotData, setScreenshotData] = useState(null)
  const { logs, addLog, clearLogs } = useDebug()
  const [showDebug, setShowDebug] = useState(false)

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      setUserRole(user.role || "")
      addLog(`✅ Logged in: ${user.email} (${user.role})`, "success")
    } catch(e) { addLog(`❌ Error: ${e.message}`, "error") }
  }, [])

  const handleApprove = (data) => {
    setScreenshotData(data)
    setShowScreenshots(false)
    if (data.allScreenshotsApproved) {
      setTransferAmount(data.totalCoins.toString())
      setTransferReason(`Screenshot reward - ${data.approvedCount} screenshot(s)`)
      addLog(`💰 Pre-filled transfer: ${data.totalCoins} coins`, "success")
    }
  }

  const handleTransfer = async () => {
    if (!selectedUser || !transferAmount) return setMessage({ type: "error", text: "Select user and enter amount" })
    const amount = parseInt(transferAmount)
    if (isNaN(amount) || amount <= 0) return setMessage({ type: "error", text: "Invalid amount" })
    
    setLoading(true)
    addLog(`💰 Transferring ${amount} coins to ${selectedUser.email}...`, "info")
    try {
      const admin = JSON.parse(localStorage.getItem("user") || "{}").username
      const res = await userAPI.editUserBalance(selectedUser.email, amount, admin)
      if (res.success) {
        addLog(`✅ Transfer successful! New balance: ${res.data.newBalance}`, "success")
        setMessage({ type: "success", text: `Transferred ${amount} coins to ${selectedUser.name}` })
        setSelectedUser(p => ({ ...p, balance: res.data.newBalance }))
        setTimeout(() => { setTransferAmount(""); setTransferReason(""); setScreenshotData(null) }, 2000)
      } else throw new Error(res.message)
    } catch(e) { addLog(`❌ Transfer failed: ${e.message}`, "error"); setMessage({ type: "error", text: e.message }) }
    finally { setLoading(false) }
  }

  if (showScreenshots) return <><ScreenshotViewer screenshots={selectedUser?.screenshots} onBack={() => setShowScreenshots(false)} onApprove={handleApprove} selectedUser={selectedUser} addLog={addLog} /><DebugPanel logs={logs} onClear={clearLogs} visible={showDebug} onToggle={() => setShowDebug(!showDebug)} /></>

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <button onClick={() => setShowDebug(!showDebug)} className="fixed bottom-4 right-4 z-50 bg-black text-white p-2 rounded-full"><Bug className="w-5 h-5" /></button>
      <div className="container mx-auto p-6">
        <Card className="mb-6"><CardContent className="p-4 flex justify-between items-center"><div><h1 className="text-2xl font-bold">Coin Transfer Management</h1><p className="text-gray-600">{userRole === "superadmin" ? "Admin access" : "View only"}</p></div><Button onClick={() => window.location.reload()} variant="outline"><RefreshCw className="mr-2" /> Refresh</Button></CardContent></Card>
        
        {message.text && <Alert className={`mb-4 ${message.type === "error" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}><AlertDescription>{message.text}</AlertDescription></Alert>}
        
        {userRole === "superadmin" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card><CardHeader><CardTitle>Select User</CardTitle></CardHeader><CardContent><UserSelector selectedUser={selectedUser} onUserSelect={setSelectedUser} addLog={addLog} /></CardContent></Card>
            <Card><CardHeader><CardTitle>Transfer Details</CardTitle></CardHeader><CardContent>{selectedUser ? (<>
              <div className="p-3 bg-blue-50 rounded-lg mb-4"><p><strong>{selectedUser.name}</strong> ({selectedUser.email})</p><p>Balance: {selectedUser.balance || 0} coins</p><p>Screenshots: {(selectedUser.screenshots || []).filter(s => s && s !== null).length} uploaded</p></div>
              <Button onClick={() => { addLog(`📸 Opening screenshot viewer...`, "info"); setShowScreenshots(true) }} variant="outline" className="w-full mb-4" disabled={!(selectedUser.screenshots || []).some(s => s && s !== null)}><ImageIcon className="mr-2" /> Review Screenshots</Button>
              <Input placeholder="Amount" type="number" value={transferAmount} onChange={e => setTransferAmount(e.target.value)} className="mb-3" />
              <Textarea placeholder="Reason (min 5 characters)" value={transferReason} onChange={e => setTransferReason(e.target.value)} rows={2} className="mb-3" />
              <Button onClick={handleTransfer} disabled={loading || !transferAmount || transferReason.length < 5} className="w-full bg-gradient-to-r from-blue-600 to-purple-600"><Send className="mr-2" /> Transfer Coins</Button>
            </>) : (<p className="text-center text-gray-500">Select a user first</p>)}</CardContent></Card>
          </div>
        ) : (
          <Card><CardContent className="p-8 text-center"><History className="w-12 h-12 mx-auto text-gray-300 mb-4" /><p>View-only mode. Contact admin for transfer permissions.</p></CardContent></Card>
        )}
      </div>
    </div>
  )
}

// Debug Panel Component
const DebugPanel = ({ logs, onClear, visible, onToggle }) => {
  if (!visible) return null
  return (
    <div className="fixed bottom-4 right-16 z-50 w-96 bg-black/90 text-white rounded-lg shadow-xl">
      <div className="flex justify-between items-center p-2 bg-gray-800"><span className="text-xs font-mono">🐛 DEBUG</span><div><button onClick={onClear} className="text-xs mr-2">Clear</button><button onClick={onToggle}>✕</button></div></div>
      <div className="p-2 h-64 overflow-auto text-xs font-mono">{logs.map((l, i) => <div key={i} className={`py-1 border-b border-gray-700 ${l.type === 'error' ? 'text-red-400' : l.type === 'success' ? 'text-green-400' : 'text-gray-300'}`}><span className="text-gray-500">[{l.timestamp}]</span> {l.msg}</div>)}</div>
    </div>
  )
}
