"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Notification {
    id: string
    type: string
    title: string
    body: string | null
    href: string | null
    readAt: string | null
    createdAt: string
    actor: {
        id: string
        name: string | null
        username: string | null
        image: string | null
    } | null
}

export function NotificationsBell() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)

    const fetchNotifications = async () => {
        try {
            const res = await fetch("/api/notifications")
            if (res.ok) {
                const data = await res.json()
                setNotifications(data.items || [])
                setUnreadCount(data.unreadCount || 0)
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchNotifications()
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000)
        return () => clearInterval(interval)
    }, [])

    const markAsRead = async (notificationId: string) => {
        try {
            await fetch(`/api/notifications/${notificationId}/read`, {
                method: "POST"
            })
            setNotifications(prev =>
                prev.map(n =>
                    n.id === notificationId ? { ...n, readAt: new Date().toISOString() } : n
                )
            )
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (error) {
            console.error("Failed to mark notification as read:", error)
        }
    }

    const markAllAsRead = async () => {
        try {
            await fetch("/api/notifications/mark-all-read", {
                method: "POST"
            })
            setNotifications(prev =>
                prev.map(n => ({ ...n, readAt: new Date().toISOString() }))
            )
            setUnreadCount(0)
        } catch (error) {
            console.error("Failed to mark all as read:", error)
        }
    }

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.readAt) {
            markAsRead(notification.id)
        }
        setOpen(false)
    }

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <div className="relative">
                    <Button variant="navIcon" size="icon">
                        <Bell className="h-5 w-5" />
                    </Button>
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-black/60">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 md:w-96">
                <div className="flex items-center justify-between px-2 py-2">
                    <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={markAllAsRead}
                        >
                            Mark all read
                        </Button>
                    )}
                </div>
                <DropdownMenuSeparator />
                <ScrollArea className="h-[400px]">
                    {loading ? (
                        <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                            Loading...
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <Bell className="h-12 w-12 text-muted-foreground/20 mb-2" />
                            <p className="text-sm font-medium">No notifications</p>
                            <p className="text-xs text-muted-foreground">
                                We'll notify you when something happens
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-1 p-1">
                            {notifications.map((notification) => (
                                <div key={notification.id}>
                                    {notification.href ? (
                                        <Link
                                            href={notification.href}
                                            onClick={() => handleNotificationClick(notification)}
                                        >
                                            <NotificationItem notification={notification} />
                                        </Link>
                                    ) : (
                                        <div onClick={() => handleNotificationClick(notification)}>
                                            <NotificationItem notification={notification} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

function NotificationItem({ notification }: { notification: Notification }) {
    const isUnread = !notification.readAt

    return (
        <div
            className={`flex gap-3 p-3 rounded-lg cursor-pointer transition-colors ${isUnread ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/50"
                }`}
        >
            {notification.actor && (
                <Avatar className="h-10 w-10">
                    <AvatarImage src={notification.actor.image || undefined} />
                    <AvatarFallback className="bg-primary/20 text-primary">
                        {notification.actor.name?.[0] || "?"}
                    </AvatarFallback>
                </Avatar>
            )}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm ${isUnread ? "font-semibold" : "font-medium"}`}>
                        {notification.title}
                    </p>
                    {isUnread && (
                        <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                    )}
                </div>
                {notification.body && (
                    <p className="text-sm text-muted-foreground mt-0.5">{notification.body}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </p>
            </div>
        </div>
    )
}
