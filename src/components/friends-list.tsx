"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, UserPlus, Search, Flame, Trophy, X, Check, Clock } from "lucide-react"

interface Friend {
    id: string
    name: string
    image?: string
    level: number
    xp: number
    streak: number
    lastActive: string
    status: "online" | "offline" | "studying"
}

// Mock data for demo
const MOCK_FRIENDS: Friend[] = [
    { id: "1", name: "Alex Chen", level: 12, xp: 2450, streak: 15, lastActive: "2m ago", status: "studying" },
    { id: "2", name: "Sarah Kim", level: 8, xp: 1820, streak: 7, lastActive: "1h ago", status: "online" },
    { id: "3", name: "Mike Johnson", level: 15, xp: 3200, streak: 23, lastActive: "3h ago", status: "offline" },
]

const MOCK_PENDING: Friend[] = [
    { id: "4", name: "Emma Wilson", level: 5, xp: 890, streak: 3, lastActive: "now", status: "online" },
]

export function FriendsList() {
    const [friends] = useState<Friend[]>(MOCK_FRIENDS)
    const [pendingRequests] = useState<Friend[]>(MOCK_PENDING)
    const [searchQuery, setSearchQuery] = useState("")
    const [showAddFriend, setShowAddFriend] = useState(false)

    const getStatusColor = (status: Friend["status"]) => {
        switch (status) {
            case "online": return "bg-emerald-500"
            case "studying": return "bg-primary"
            case "offline": return "bg-muted-foreground/30"
        }
    }

    const getStatusText = (status: Friend["status"]) => {
        switch (status) {
            case "online": return "Online"
            case "studying": return "Studying"
            case "offline": return "Offline"
        }
    }

    const filteredFriends = friends.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

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
                        className="h-8 w-8 p-0 rounded-full"
                        onClick={() => setShowAddFriend(!showAddFriend)}
                    >
                        <UserPlus className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Add Friend Input */}
                {showAddFriend && (
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by username..."
                                className="pl-9 h-9 rounded-full bg-muted/50"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* Pending Requests */}
                {pendingRequests.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs text-muted-foreground font-medium">Pending Requests</p>
                        {pendingRequests.map((friend) => (
                            <div
                                key={friend.id}
                                className="flex items-center gap-3 p-2 rounded-lg bg-primary/5 border border-primary/10"
                            >
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={friend.image} />
                                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                                        {friend.name[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{friend.name}</p>
                                    <p className="text-xs text-muted-foreground">Lv.{friend.level}</p>
                                </div>
                                <div className="flex gap-1">
                                    <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10">
                                        <Check className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10">
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
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No friends found
                        </p>
                    ) : (
                        filteredFriends.map((friend) => (
                            <div
                                key={friend.id}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                            >
                                <div className="relative">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={friend.image} />
                                        <AvatarFallback className="bg-muted text-sm">
                                            {friend.name[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-card ${getStatusColor(friend.status)}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium truncate">{friend.name}</p>
                                        {friend.status === "studying" && (
                                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                                                Studying
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span>Lv.{friend.level}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-0.5">
                                            <Flame className="h-3 w-3 text-orange-500" />
                                            {friend.streak}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {friend.lastActive}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* View All */}
                <Button variant="ghost" size="sm" className="w-full text-muted-foreground text-xs h-8">
                    View All Friends
                </Button>
            </CardContent>
        </Card>
    )
}
