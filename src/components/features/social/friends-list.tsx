"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, UserPlus, Search, Flame, Trophy, X, Check, Clock, Loader2, Send } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useDebounce } from "use-debounce"

interface Friend {
    id: string
    name: string
    username: string
    image?: string
    level: number
    xp: number
    leetcodeUsername?: string
    // streak, status, lastActive are not in DB yet, so we'll mock or omit for now
}

interface Request {
    id: string
    name: string
    username: string
    image?: string
    level: number
    requestId: string
    createdAt: string
}

interface SearchResult {
    id: string
    name: string
    username: string
    image?: string
    level: number
    xp: number
    relationshipStatus: 'friend' | 'request_sent' | 'request_received' | 'none'
}

export function FriendsList() {
    const [friends, setFriends] = useState<Friend[]>([])
    const [requests, setRequests] = useState<Request[]>([])
    const [sentIds, setSentIds] = useState<string[]>([]) // IDs of users we sent requests to (receiverIds)

    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [showAddFriend, setShowAddFriend] = useState(false)
    const [addUsername, setAddUsername] = useState("")
    const [adding, setAdding] = useState(false)

    // Live search functionality
    const [searchResults, setSearchResults] = useState<SearchResult[]>([])
    const [searching, setSearching] = useState(false)
    const [debouncedSearch] = useDebounce(addUsername, 300)

    const fetchFriends = async () => {
        try {
            const res = await fetch("/api/friends")
            if (!res.ok) throw new Error("Failed to fetch friends")
            const data = await res.json()
            setFriends(data.friends)
            setRequests(data.requests)
            setSentIds(data.sentRequestIds || [])
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchFriends()
    }, [])

    // Live search effect
    useEffect(() => {
        const searchUsers = async () => {
            if (!debouncedSearch || debouncedSearch.trim().length < 2) {
                setSearchResults([])
                return
            }

            setSearching(true)
            try {
                const res = await fetch(`/api/friends/search?q=${encodeURIComponent(debouncedSearch)}`)
                if (res.ok) {
                    const data = await res.json()
                    setSearchResults(data.users || [])
                }
            } catch (error) {
                console.error("Search error:", error)
            } finally {
                setSearching(false)
            }
        }

        searchUsers()
    }, [debouncedSearch])

    const handleSendRequest = async (username?: string) => {
        const targetUsername = username || addUsername.trim()
        if (!targetUsername) return

        setAdding(true)
        try {
            const res = await fetch("/api/friends/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ recipientUsername: targetUsername })
            })

            if (!res.ok) {
                const msg = await res.text()
                throw new Error(msg)
            }

            toast.success("Friend request sent!")
            setAddUsername("")
            setSearchResults([])
            setShowAddFriend(false)
            fetchFriends() // Refresh to update sent IDs if we returned them (or just to be safe)
        } catch (err: any) {
            toast.error(err.message || "Failed to send request")
        } finally {
            setAdding(false)
        }
    }

    const handleRespond = async (requestId: string, action: "ACCEPT" | "DECLINE") => {
        try {
            const res = await fetch("/api/friends/respond", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ requestId, action })
            })

            if (!res.ok) throw new Error("Failed to respond")

            toast.success(action === "ACCEPT" ? "Friend added!" : "Request declined")

            // Optimistic update
            if (action === "ACCEPT") {
                const req = requests.find(r => r.requestId === requestId)
                if (req) {
                    setFriends(prev => [...prev, { ...req, xp: 0 }]) // Basic conversion
                }
            }
            setRequests(prev => prev.filter(r => r.requestId !== requestId))

        } catch (err) {
            toast.error("Something went wrong")
            fetchFriends()
        }
    }

    const filteredFriends = friends.filter(f =>
        f.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.username?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        Friends
                        <span className="text-xs font-normal text-muted-foreground">
                            ({friends.length})
                        </span>
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-full hover:bg-primary/10 hover:text-primary"
                        onClick={() => setShowAddFriend(!showAddFriend)}
                    >
                        {showAddFriend ? <X className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Add Friend Input with Live Search */}
                {showAddFriend && (
                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name or username..."
                                    className="h-9 text-sm pl-9"
                                    value={addUsername}
                                    onChange={(e) => setAddUsername(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && searchResults.length === 0 && handleSendRequest()}
                                />
                                {searching && (
                                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                                )}
                            </div>
                        </div>

                        {/* Search Results */}
                        {addUsername.trim().length >= 2 && searchResults.length > 0 && (
                            <div className="border rounded-lg divide-y max-h-60 overflow-y-auto">
                                {searchResults.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors"
                                    >
                                        <Link href={`/u/${user.username}`} className="flex items-center gap-3 flex-1 min-w-0">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={user.image} />
                                                <AvatarFallback className="bg-primary/20 text-primary text-xs">
                                                    {user.name?.[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{user.name}</p>
                                                <p className="text-xs text-muted-foreground">@{user.username} • Lv.{user.level}</p>
                                            </div>
                                        </Link>
                                        {user.relationshipStatus === 'friend' ? (
                                            <Badge variant="secondary" className="text-xs">
                                                <Check className="h-3 w-3 mr-1" />
                                                Friends
                                            </Badge>
                                        ) : user.relationshipStatus === 'request_sent' ? (
                                            <Badge variant="outline" className="text-xs">
                                                <Clock className="h-3 w-3 mr-1" />
                                                Pending
                                            </Badge>
                                        ) : user.relationshipStatus === 'request_received' ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-7 text-xs"
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    const req = requests.find(r => r.id === user.id)
                                                    if (req) handleRespond(req.requestId, "ACCEPT")
                                                }}
                                            >
                                                Accept
                                            </Button>
                                        ) : (
                                            <Button
                                                size="sm"
                                                className="h-7 text-xs"
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    handleSendRequest(user.username)
                                                }}
                                                disabled={adding}
                                            >
                                                {adding ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserPlus className="h-3 w-3" />}
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* No results message */}
                        {!searching && addUsername.trim().length >= 2 && searchResults.length === 0 && (
                            <p className="text-xs text-muted-foreground text-center py-2">
                                No users found. Try searching by exact username or full name.
                            </p>
                        )}
                    </div>
                )}

                {/* Search (only if has friends) */}
                {friends.length > 5 && !showAddFriend && (
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            placeholder="Search friends..."
                            className="pl-8 h-8 text-xs bg-muted/50 border-0"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                )}

                {/* Pending Requests */}
                {requests.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Requests ({requests.length})</p>
                        {requests.map((req) => (
                            <div
                                key={req.requestId}
                                className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10"
                            >
                                <Link href={`/u/${req.username}`} className="flex items-center gap-3 flex-1 min-w-0">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={req.image} />
                                        <AvatarFallback className="bg-primary/20 text-primary text-xs">
                                            {req.name?.[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{req.name}</p>
                                        <p className="text-xs text-muted-foreground">@{req.username} • Lv.{req.level}</p>
                                    </div>
                                </Link>
                                <div className="flex gap-1">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleRespond(req.requestId, "ACCEPT")}
                                        className="h-7 w-7 rounded-full text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10"
                                    >
                                        <Check className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleRespond(req.requestId, "DECLINE")}
                                        className="h-7 w-7 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Friends List */}
                <div className="space-y-1">
                    {filteredFriends.length === 0 ? (
                        <div className="text-center py-6">
                            {searchQuery ? (
                                <p className="text-sm text-muted-foreground">No matches found</p>
                            ) : (
                                <>
                                    <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                                        <Users className="h-6 w-6 text-muted-foreground/50" />
                                    </div>
                                    <p className="text-sm font-medium">No friends yet</p>
                                    <p className="text-xs text-muted-foreground mt-1">Add friends to complete daily challenges together!</p>
                                    <Button variant="link" size="sm" onClick={() => setShowAddFriend(true)} className="mt-2 text-primary">
                                        Add a friend
                                    </Button>
                                </>
                            )}
                        </div>
                    ) : (
                        filteredFriends.map((friend) => (
                            <Link
                                key={friend.id}
                                href={`/u/${friend.username}`}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                            >
                                <Avatar className="h-9 w-9 border border-border/50">
                                    <AvatarImage src={friend.image} />
                                    <AvatarFallback className="bg-muted text-xs">
                                        {friend.name?.[0]}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium truncate">{friend.name}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span>@{friend.username}</span>
                                        <span>•</span>
                                        <span>Lv.{friend.level}</span>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
