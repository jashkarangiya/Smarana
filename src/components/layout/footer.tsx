"use client"

import Link from "next/link"
import Image from "next/image"
import { Sparkles, Github } from "lucide-react"

export function Footer() {
    return (
        <footer className="py-12 md:py-14 border-t border-white/5 bg-[#050505] relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-40" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-10">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 mb-10">

                    {/* Column 1: Brand & Tagline - Full width on mobile/tablet if desired, or just part of grid. 
                        Let's make it col-span-2 on mobile so it dominates the top, or just col-span-2 on LG? 
                        The user sample code just had comments. 
                        I'll make it col-span-2 on small screens for better spacing.
                    */}
                    <div className="col-span-2 lg:col-span-1 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg overflow-hidden shadow-lg shadow-primary/20">
                                <Image
                                    src="/logo.png"
                                    alt="Smarana"
                                    width={32}
                                    height={32}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <span className="font-bold text-xl tracking-tight text-white">Smarana</span>
                        </div>
                        <p className="text-sm text-white/50 font-medium italic leading-relaxed max-w-xs">
                            "Remembrance is the root of knowledge"
                        </p>

                        <div className="flex items-center gap-3 text-sm text-white/50 pt-2">
                            <a
                                href="https://github.com/jashkarangiya"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-2 -ml-2 rounded-md hover:bg-white/[0.04] hover:text-[#BB7331] transition"
                                aria-label="GitHub"
                            >
                                <Github className="h-4 w-4" />
                                <span>GitHub</span>
                            </a>
                        </div>
                    </div>

                    {/* Column 2: Resources */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-white">Resources</h4>
                        <ul className="space-y-3 text-sm text-white/50">
                            <li><Link href="/about" className="hover:text-[#BB7331] transition-colors">About</Link></li>
                            <li><Link href="/team" className="hover:text-[#BB7331] transition-colors">Team</Link></li>
                            <li><Link href="/contact" className="hover:text-[#BB7331] transition-colors">Contact</Link></li>
                            <li><Link href="/faq" className="hover:text-[#BB7331] transition-colors">FAQ</Link></li>
                            <li><Link href="/changelog" className="hover:text-[#BB7331] transition-colors">Changelog</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Platform */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-white">Platform</h4>
                        <ul className="space-y-3 text-sm text-white/50">
                            <li><Link href="/problems" className="hover:text-[#BB7331] transition-colors">All Problems</Link></li>
                            <li><Link href="/review" className="hover:text-[#BB7331] transition-colors">Review Session</Link></li>
                            <li><Link href="/extension" className="hover:text-[#BB7331] transition-colors">Browser Extension</Link></li>
                        </ul>
                    </div>

                    {/* Column 4: Legal */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-white">Legal</h4>
                        <ul className="space-y-3 text-sm text-white/50">
                            <li><Link href="/privacy" className="hover:text-[#BB7331] transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-[#BB7331] transition-colors">Terms of Service</Link></li>
                            <li><Link href="/cookies" className="hover:text-[#BB7331] transition-colors">Cookie Policy</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground/60">
                    <p>© {new Date().getFullYear()} Smarana Inc. All rights reserved.</p>

                    <div className="flex items-center gap-2">
                        <span>Designed with</span>
                        <Sparkles className="h-3 w-3 text-primary/50" />
                        <span>for developers</span>
                    </div>
                </div>
            </div>
        </footer >
    )
}
