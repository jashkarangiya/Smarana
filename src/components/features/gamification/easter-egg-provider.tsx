"use client";

import * as React from "react";
import { toast } from "sonner";
import { unlockEgg, isEggUnlocked } from "@/lib/easter-egg";
import { EasterEggModal } from "@/components/features/gamification/easter-egg-modal";

interface EasterEggContextValue {
    triggerUnlock: () => void;
}

export const EasterEggContext = React.createContext<EasterEggContextValue>({
    triggerUnlock: () => { },
});

export function EasterEggProvider({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = React.useState(false);

    const triggerUnlock = React.useCallback(() => {
        if (!isEggUnlocked()) {
            unlockEgg();
            toast("Ember Node unlocked ✨", {
                description: "स्मरण — memory returns.",
            });
        }
        setOpen(true);
    }, []);

    return (
        <EasterEggContext.Provider value={{ triggerUnlock }}>
            {children}
            <EasterEggModal open={open} onOpenChange={setOpen} />
        </EasterEggContext.Provider>
    );
}

// Hook for easy consumption
export function useEasterEgg() {
    return React.useContext(EasterEggContext);
}
