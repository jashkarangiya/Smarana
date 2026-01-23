import { FriendsList } from "@/components/friends-list"
import { Separator } from "@/components/ui/separator"

export default function FriendsPage() {
    return (
        <div className="container max-w-4xl py-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Friends</h1>
                <p className="text-muted-foreground">
                    Connect with other developers, compete in challenges, and keep each other accountable.
                </p>
            </div>
            <Separator />
            <div className="grid gap-6">
                <FriendsList />
            </div>
        </div>
    )
}
