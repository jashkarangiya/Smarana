"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

export function TimezoneSync() {
    const { data: session, status, update } = useSession();

    useEffect(() => {
        if (status !== "authenticated") return;

        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (!tz) return;

        // avoid spamming updates if already correct
        if (session?.user && session.user.timezone === tz) return;

        fetch("/api/profile/timezone", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ timezone: tz }),
        })
            .then(async (r) => {
                if (!r.ok) return;
                // refresh session with new timezone so the check above passes next time
                await update({ timezone: tz });
            })
            .catch((e) => console.error("Timezone sync failed", e));
    }, [status, session?.user, update]);

    return null;
}
