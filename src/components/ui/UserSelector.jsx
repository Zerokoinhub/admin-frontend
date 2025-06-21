"use client"

import { useState, useEffect } from "react"
import { Check, ChevronsUpDown, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { userAPI } from "@/lib/api"

export default function UserSelector({ selectedUser, onUserSelect, className }) {
  const [open, setOpen] = useState(false)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await userAPI.getUsers(1, 100) // Get first 100 users
      if (response.success && response.data?.users) {
        setUsers(response.data.users)
      } else {
        setError("Failed to load users")
      }
    } catch (err) {
      console.error("Error fetching users:", err)
      setError("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  const handleUserSelect = (user) => {
    onUserSelect(user)
    setOpen(false)
  }

  const getUserDisplayName = (user) => {
    return user.name || user.username || user.email || "Unknown User"
  }

  const getUserBalance = (user) => {
    return user.balance || 0
  }

  const getUserStatus = (user) => {
    if (user.isActive === false) return "inactive"
    return "active"
  }

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={loading}
          >
            {selectedUser ? (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="truncate">{getUserDisplayName(selectedUser)}</span>
                <Badge variant="secondary" className="ml-auto">
                  {getUserBalance(selectedUser)} coins
                </Badge>
              </div>
            ) : (
              <span className="text-muted-foreground">{loading ? "Loading users..." : "Select a user..."}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search users..." />
            <CommandList>
              <CommandEmpty>
                {error ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-red-600">{error}</p>
                    <Button variant="outline" size="sm" onClick={fetchUsers} className="mt-2">
                      Retry
                    </Button>
                  </div>
                ) : (
                  "No users found."
                )}
              </CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto">
                {users.map((user) => (
                  <CommandItem
                    key={user._id || user.id}
                    value={`${getUserDisplayName(user)} ${user.email}`}
                    onSelect={() => handleUserSelect(user)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedUser?._id === user._id || selectedUser?.id === user.id ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <User className="h-4 w-4" />
                      <div className="flex flex-col">
                        <span className="font-medium">{getUserDisplayName(user)}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getUserStatus(user) === "active" ? "default" : "secondary"} className="text-xs">
                        {getUserStatus(user)}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {getUserBalance(user)} coins
                      </Badge>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
