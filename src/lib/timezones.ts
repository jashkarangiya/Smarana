export interface TimezoneOption {
    value: string
    label: string
    offset: number
}

export function getAllTimezones(): TimezoneOption[] {
    const timezones = Intl.supportedValuesOf('timeZone')

    const options = timezones.map(tz => {
        try {
            // Get the current offset in minutes
            // We use a fixed date or current date. Current date is better for "current" offset.
            const now = new Date()

            // Format nice label with offset: "(UTC-05:00) America/New_York"
            const fmt = new Intl.DateTimeFormat('en-US', {
                timeZone: tz,
                timeZoneName: 'longOffset'
            })
            const parts = fmt.formatToParts(now)
            const offsetPart = parts.find(p => p.type === 'timeZoneName')?.value || 'UTC'
            const gmtOffset = offsetPart.replace('GMT', 'UTC')

            // Calculate numeric offset for sorting
            // Hacky but effective way to get offset:
            // "12:00:00 PM GMT-5" -> extract -5
            // Better: use date-fns-tz if complex, but native is fine for this purpose usually.
            // Actually, let's just use the GMT string for label, sorting might be tricky with just string.
            // Let's parse the GMT offset string for sorting: GMT-05:00 -> -5*60 = -300

            let offsetMinutes = 0
            const match = gmtOffset.match(/([+-])(\d{2}):(\d{2})/)
            if (match) {
                const sign = match[1] === '+' ? 1 : -1
                const hours = parseInt(match[2], 10)
                const minutes = parseInt(match[3], 10)
                offsetMinutes = sign * (hours * 60 + minutes)
            }

            return {
                value: tz,
                label: `(${gmtOffset}) ${tz.replace(/_/g, " ")}`,
                offset: offsetMinutes
            }
        } catch (e) {
            return null
        }
    }).filter((item): item is TimezoneOption => item !== null)

    // Sort by offset, then by name
    return options.sort((a, b) => {
        if (a.offset !== b.offset) return a.offset - b.offset
        return a.value.localeCompare(b.value)
    })
}
