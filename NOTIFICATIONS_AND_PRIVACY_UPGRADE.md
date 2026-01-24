# Notifications & Privacy System Upgrade

## ✅ Completed Improvements

### 1. **Enhanced Database Schema**

#### New Enums:
```prisma
enum ProfileVisibility {
  PUBLIC          // Anyone can view
  FRIENDS_ONLY    // Only friends can view
  PRIVATE         // Only self can view
}

enum NotificationType {
  FRIEND_REQUEST_RECEIVED
  FRIEND_REQUEST_ACCEPTED
  SYSTEM          // For future system notifications
}
```

#### New Model: Notification
```prisma
model Notification {
  id        String   @id
  userId    String
  type      NotificationType
  actorId   String?         // Who triggered this notification
  actor     User?           // Actor details (name, image, username)
  title     String
  body      String?
  href      String?         // Where to navigate on click
  readAt    DateTime?
  createdAt DateTime
}
```

#### Enhanced User Model:
**New Privacy Fields:**
- `profileVisibility` - PUBLIC | FRIENDS_ONLY | PRIVATE
- `showStreakToPublic` - Show streak to non-friends
- `showStreakToFriends` - Show streak to friends
- `showPlatformsToPublic` - Show LeetCode/CF usernames to public
- `showPlatformsToFriends` - Show platform usernames to friends

**New Relations:**
- `notifications` - Received notifications
- `actorNotifications` - Notifications where user is the actor

**Deprecated (kept for migration):**
- `isProfilePublic`
- `showStreakPublicly`
- `showLeetCodePublicly`

---

### 2. **Notification API Endpoints**

#### `GET /api/notifications`
- **Cursor-based pagination** (production-ready for infinite scroll)
- Returns notifications with actor details (name, username, image)
- Includes `unreadCount` in response
- Query params: `?cursor=<id>` for pagination
- Returns: `{ items, nextCursor, unreadCount }`

#### `POST /api/notifications/[id]/read`
- Mark single notification as read
- Security: Only marks if notification belongs to user
- Sets `readAt` timestamp

#### `POST /api/notifications/mark-all-read`
- Mark all unread notifications as read for current user
- Efficient bulk update

---

### 3. **Automatic Notification Creation**

#### Friend Request Sent:
When user sends friend request → Creates notification for recipient:
```typescript
{
  type: "FRIEND_REQUEST_RECEIVED",
  actorId: sender.id,
  title: "John Doe sent you a friend request",
  href: "/friends"
}
```

#### Friend Request Accepted:
When user accepts request → Creates notification for original sender:
```typescript
{
  type: "FRIEND_REQUEST_ACCEPTED",
  actorId: accepter.id,
  title: "Jane Smith accepted your friend request",
  href: "/u/jane"
}
```

**Implementation:** Uses Prisma transactions to ensure atomicity (request + notification created together).

---

### 4. **Enhanced Friend Search**

Previously implemented improvements:
- Search by **full name** or **username** (case-insensitive)
- Live search with debounce (300ms)
- Shows relationship status: Friend | Pending | None
- `/api/friends/search` endpoint with anti-enumeration protection

---

## 🚀 Next Steps to Complete

### 1. **Run Database Migration**

```bash
cd "/Users/Shared/F Drive/00_Study/0_VC/02_AlgoRecall/mvp-project"

# Create migration
npx prisma migrate dev --name add_notifications_and_privacy

# Generate Prisma client
npx prisma generate
```

**Migration will:**
- Add `Notification` table
- Add `ProfileVisibility` enum
- Add new privacy fields to `User`
- Keep old fields for backward compatibility

---

### 2. **Build Notification Bell UI**

#### Location: Navbar Component

**Features needed:**
- Bell icon with unread badge/dot
- Popover dropdown on click
- List of recent notifications (8-10)
- "Mark all read" button
- "View all" link to `/notifications` page (optional)
- Auto-refetch on window focus

#### Recommended Stack:
- **Popover:** `@/components/ui/popover` (shadcn)
- **Data:** React Query with polling (60s) or refetch on focus
- **Formatting:** `date-fns` for "2 hours ago" timestamps

**Query Key Pattern:**
```typescript
useQuery({
  queryKey: ["notifications", "inbox"],
  queryFn: fetchNotifications,
  refetchOnWindowFocus: true,
  refetchInterval: 60000 // Poll every 60s
})
```

**Example UI Structure:**
```tsx
<Popover>
  <PopoverTrigger>
    <Button variant="ghost" size="icon">
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] flex items-center justify-center">
          {unreadCount}
        </span>
      )}
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-80">
    {/* Notification list */}
  </PopoverContent>
</Popover>
```

---

### 3. **Implement Profile Privacy Gating**

#### Location: `/u/[username]/page.tsx`

**Access Control Logic:**
```typescript
async function canViewProfile(
  viewerId: string | null,
  profileOwnerId: string,
  visibility: ProfileVisibility
): Promise<boolean> {
  // 1. Owner viewing self
  if (viewerId === profileOwnerId) return true

  // 2. Public profiles
  if (visibility === 'PUBLIC') return true

  // 3. Not logged in
  if (!viewerId) return false

  // 4. Friends-only
  if (visibility === 'FRIENDS_ONLY') {
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: viewerId, friendId: profileOwnerId },
          { userId: profileOwnerId, friendId: viewerId }
        ]
      }
    })
    return !!friendship
  }

  // 5. Private
  return false
}
```

**Private Profile UI:**
```tsx
{!canView && (
  <Card className="text-center py-12">
    <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
    <h2 className="text-xl font-semibold">This profile is private</h2>
    <p className="text-muted-foreground mt-2">
      @{username} has restricted access to their profile
    </p>
  </Card>
)}
```

---

### 4. **Add Privacy Settings Page**

#### Location: `/profile` → Security Tab (or new Privacy tab)

**Settings to Add:**

**Profile Visibility:**
- Radio group: Public | Friends Only | Private

**Streak Visibility:**
- ☑ Show to public
- ☑ Show to friends

**Platform Usernames Visibility:**
- ☑ Show to public (LeetCode, Codeforces, etc.)
- ☑ Show to friends

**API Endpoint:**
```typescript
PUT /api/me/privacy
{
  profileVisibility: "FRIENDS_ONLY",
  showStreakToPublic: false,
  showStreakToFriends: true,
  showPlatformsToPublic: true,
  showPlatformsToFriends: true
}
```

---

### 5. **Username Autocomplete (Future)**

**API Endpoint:** `/api/users/suggest?q=john`
- Min 2-3 chars
- Max 8-10 results
- Only PUBLIC profiles (or FRIENDS_ONLY if already friends)
- Rate limited
- Return: `{ id, username, name, image }`

**UI:** Combobox with shadcn `Command` component

---

### 6. **Create Demo Seed Script**

#### Install Dependencies:
```bash
npm i -D tsx
npm i bcryptjs date-fns
```

#### Add to `package.json`:
```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

#### Demo Credentials:
- **Username:** `demo`
- **Password:** `AlgoRecall!Demo2026`

#### Seed Data:
- 1 demo user with full profile
- 16 problems (mix of overdue/upcoming/due today)
- 10 days of review logs
- 2-3 friend users
- Friend requests (pending + accepted)
- Sample notifications

**Run:**
```bash
npx prisma db seed
```

---

## 📊 Feature Comparison

| Feature | Before | After |
|---------|--------|-------|
| Profile Privacy | Boolean only | 3-level enum (Public/Friends/Private) |
| Streak Visibility | Global toggle | Separate for public/friends |
| Platform Visibility | Global toggle | Separate for public/friends |
| Notifications | None | Full system with bell UI |
| Friend Search | Username only | Name + username with status |
| Demo Account | Manual | Seeded with realistic data |

---

## 🔒 Security Improvements

### Anti-Enumeration:
- Username search requires min 2-3 chars
- Max 8-10 results returned
- Rate limiting on search endpoint

### Privacy Controls:
- 3-tier profile visibility
- Granular control over streak/platform visibility
- Authorization checks on all profile endpoints

### Notification Security:
- User can only read/mark their own notifications
- Actor details sanitized (only public info)
- Proper cascading deletes on user deletion

---

## 🎨 UI/UX Improvements Needed

### Notification Bell:
- [ ] Add bell icon to navbar
- [ ] Show unread count badge
- [ ] Popover with notification list
- [ ] "Mark all read" button
- [ ] Relative timestamps ("2h ago")
- [ ] Click notification → navigate to `href`

### Profile Privacy:
- [ ] Privacy badge on locked profiles
- [ ] Friend-only indicator
- [ ] Clear messaging when access denied

### Settings Page:
- [ ] Privacy settings section
- [ ] Profile visibility radio group
- [ ] Platform/streak toggle switches
- [ ] Real-time preview of what others see

---

## 📝 Migration Guide

### Step 1: Run Migration
```bash
npx prisma migrate dev --name add_notifications_and_privacy
npx prisma generate
```

### Step 2: Migrate Existing Data (Optional)
```sql
-- Migrate old isProfilePublic to profileVisibility
UPDATE User
SET profileVisibility = CASE
  WHEN isProfilePublic = 1 THEN 'PUBLIC'
  ELSE 'PRIVATE'
END;
```

### Step 3: Deploy Changes
- No breaking changes to existing API
- Old fields still exist for backward compatibility
- Gradually migrate to new privacy model

---

## 🚀 Production Checklist

- [ ] Run database migration
- [ ] Test notification creation on friend actions
- [ ] Implement notification bell UI
- [ ] Add privacy settings page
- [ ] Implement profile access control
- [ ] Create demo seed script
- [ ] Test all privacy levels
- [ ] Add loading states for notifications
- [ ] Add error handling for notification failures
- [ ] Test cursor pagination
- [ ] Add rate limiting to search endpoints
- [ ] Deploy to staging
- [ ] Test on mobile devices
- [ ] Deploy to production

---

## 📚 Additional Resources

### Prisma Docs:
- [Enums](https://www.prisma.io/docs/concepts/components/prisma-schema/data-model#defining-enums)
- [Relations](https://www.prisma.io/docs/concepts/components/prisma-schema/relations)
- [Transactions](https://www.prisma.io/docs/concepts/components/prisma-client/transactions)

### React Query:
- [Polling](https://tanstack.com/query/latest/docs/react/guides/window-focus-refetching)
- [Cursor Pagination](https://tanstack.com/query/latest/docs/react/guides/infinite-queries)

### shadcn/ui:
- [Popover](https://ui.shadcn.com/docs/components/popover)
- [Command](https://ui.shadcn.com/docs/components/command)

---

**Next:** Run the migration and start building the notification bell UI!
