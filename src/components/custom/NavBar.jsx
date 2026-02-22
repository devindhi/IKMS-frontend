import React from "react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Home, MessageCircle, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils"; // Standard shadcn utility

export default function NavBar() {
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-blue-100/50 dark:border-slate-800/50 bg-white/70 dark:bg-[#020617]/70 backdrop-blur-xl px-8 py-3 flex items-center justify-between">
      
      {/* ── Brand / Logo ── */}
      <div className="flex items-center gap-2 group cursor-pointer">
        <div className="bg-blue-600 rounded-lg p-1.5 transition-transform group-hover:rotate-12">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <span className="font-bold text-sm tracking-[0.15em] uppercase text-slate-900 dark:text-slate-100">
          Indigo<span className="text-blue-600">AI</span>
        </span>
      </div>

      {/* ── Navigation Links ── */}
      <NavigationMenu>
        <NavigationMenuList className="gap-2">
          <NavigationMenuItem>
            <NavigationMenuLink 
              asChild 
              className={cn(
                navigationMenuTriggerStyle(),
                "bg-transparent hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all duration-300 rounded-xl",
                location.pathname === "/" && "bg-blue-50/80 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold"
              )}
            >
              <Link to="/" className="flex items-center gap-2.5 px-4">
                <Home className={cn("h-4 w-4", location.pathname === "/" ? "text-blue-600" : "text-slate-400")} />
                <span className="text-xs uppercase tracking-widest">Home</span>
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuLink 
              asChild 
              className={cn(
                navigationMenuTriggerStyle(),
                "bg-transparent hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all duration-300 rounded-xl",
                location.pathname === "/chat" && "bg-blue-50/80 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold"
              )}
            >
              <Link to="/chat" className="flex items-center gap-2.5 px-4">
                <MessageCircle className={cn("h-4 w-4", location.pathname === "/chat" ? "text-blue-600" : "text-slate-400")} />
                <span className="text-xs uppercase tracking-widest">Chat</span>
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      {/* ── Subtle Utility (Optional) ── */}
      <div className="hidden md:flex items-center gap-4">
        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" title="System Online" />
      </div>
    </nav>
  );
}