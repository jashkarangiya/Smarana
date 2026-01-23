"use client"

import { Check, X } from "lucide-react"

interface PasswordStrengthProps {
    password: string
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
    const checks = [
        { label: "At least 12 characters", valid: password.length >= 12 },
        { label: "Contains lowercase letter", valid: /[a-z]/.test(password) },
        { label: "Contains uppercase letter", valid: /[A-Z]/.test(password) },
        { label: "Contains number", valid: /[0-9]/.test(password) },
        { label: "Contains symbol", valid: /[^A-Za-z0-9]/.test(password) },
    ]

    const strength = checks.filter(c => c.valid).length
    const score = (strength / 5) * 100

    let color = "bg-red-500"
    if (strength >= 2) color = "bg-orange-500"
    if (strength >= 4) color = "bg-amber-500"
    if (strength === 5) color = "bg-emerald-500"

    return (
        <div className="space-y-3">
            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                <div
                    className={`h-full ${color} transition-all duration-300`}
                    style={{ width: `${score}%` }}
                />
            </div>
            <ul className="space-y-1">
                {checks.map((check, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs">
                        {check.valid ? (
                            <Check className="h-3 w-3 text-emerald-500" />
                        ) : (
                            <div className="h-1 w-1 rounded-full bg-muted-foreground ml-1 mr-1" />
                        )}
                        <span className={check.valid ? "text-foreground" : "text-muted-foreground"}>
                            {check.label}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    )
}
