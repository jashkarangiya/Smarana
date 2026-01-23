// Auth layout - no navbar for sign-in/register pages
export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            {/* Hide the navbar on auth pages by layering over it */}
            <style>{`
                nav { display: none !important; }
            `}</style>
            {children}
        </>
    )
}
