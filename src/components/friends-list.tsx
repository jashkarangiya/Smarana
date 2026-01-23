"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, UserPlus, Search, Flame, Trophy, X, Check, Clock, Loader2, Send } from "lucide-react"
import { toast } from "sonner"

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

export function FriendsList() {
    const [friends, setFriends] = useState<Friend[]>([])
    const [requests, setRequests] = useState<Request[]>([])
    const [sentIds, setSentIds] = useState<string[]>([]) // IDs of users we sent requests to (receiverIds)

    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [showAddFriend, setShowAddFriend] = useState(false)
    const [addUsername, setAddUsername] = useState("")
    const [adding, setAdding] = useState(false)

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

    const handleSendRequest = async () => {
        if (!addUsername.trim()) return
        setAdding(true)
        try {
            const res = await fetch("/api/friends/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ recipientUsername: addUsername })
            })

            if (!res.ok) {
                const msg = await res.text()
                throw new Error(msg)
            }

            toast.success("Friend request sent!")
            setAddUsername("")
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
                {/* Add Friend Input */}
                {showAddFriend && (
                    <div className="flex gap-2 animate-in slide-in-from-top-2 duration-200">
                        <div className="relative flex-1">
                            <Input
                                placeholder="Enter username..."
                                className="h-9 text-sm"
                                value={addUsername}
                                onChange={(e) => setAddUsername(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSendRequest()}
                            />
                        </div>
                        <Button size="sm" onClick={handleSendRequest} disabled={adding || !addUsername} className="h-9">
                            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
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
                            <div
                                key={friend.id}
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
                                {/* Could add status here later if we implement online status */}
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
