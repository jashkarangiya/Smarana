"use client";
 
 import { useEffect } from "react";
 import { useParams, usePathname } from "next/navigation";
 
 const BASE_TITLE = "Smarana";
 const LANDING_TITLE = "Smarana — The Spaced Repetition Layer for Algorithms";
 
 const STATIC_TITLES: Record<string, string> = {
   "/dashboard": "Dashboard",
   "/contests": "Contests",
   "/problems": "Problems",
   "/review": "Review",
   "/add": "Add Problem",
   "/schedule": "Schedule",
   "/resources": "Resources",
   "/insights": "Insights",
   "/settings": "Settings",
   "/settings/username": "Username",
   "/friends": "Friends",
   "/profile": "Profile",
   "/profile/accounts": "Profile Accounts",
   "/profile/visibility": "Profile Visibility",
   "/profile/platforms": "Profile Platforms",
   "/admin/inbox": "Admin Inbox",
   "/admin/resources": "Admin Resources",
   "/extension/connect": "Extension Connect",
   "/extension/callback": "Extension Callback",
   "/sign-in": "Sign In",
   "/register": "Register",
   "/forgot-password": "Forgot Password",
   "/reset-password": "Reset Password",
   "/about": "About",
   "/team": "Team",
   "/faq": "FAQ",
   "/privacy": "Privacy",
   "/terms": "Terms",
   "/cookies": "Cookies",
   "/changelog": "Changelog",
   "/contact": "Contact",
   "/extension": "Extension",
 };
 
 function buildTitle(label: string | null) {
   if (!label) return BASE_TITLE;
   return `${label} — ${BASE_TITLE}`;
 }
 
 export function TitleUpdater() {
   const pathname = usePathname();
   const params = useParams();
 
   useEffect(() => {
     if (!pathname) return;
 
     if (pathname === "/") {
       document.title = LANDING_TITLE;
       return;
     }
 
     if (pathname.startsWith("/problems/")) {
       document.title = buildTitle("Problem");
       return;
     }
 
     if (pathname.startsWith("/u/")) {
       const username = typeof params?.username === "string" ? params.username : null;
       document.title = username ? buildTitle(`@${username}`) : buildTitle("Profile");
       return;
     }
 
     const staticLabel = STATIC_TITLES[pathname];
     document.title = buildTitle(staticLabel || "Page");
   }, [pathname, params]);
 
   return null;
 }
