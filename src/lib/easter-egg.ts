export const EGG_KEY = "smarana:easterEgg:emberNode";

export function isEggUnlocked(): boolean {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(EGG_KEY) === "1";
}

export function unlockEgg(): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(EGG_KEY, "1");
}
