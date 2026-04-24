"use client";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Link, Map, Mic } from "lucide-react";
import { usePathname } from "next/navigation";

const items = [{href : "/dashboard", label: "Dashboard", icon: LayoutDashboard}, {href : "/graph", label: "Graph", icon: Map} ];
export default function Sidebar() {
    const pathname = usePathname();
  return (
        <aside className="flex w-64 flex-col border-r bg-card">
        <div className="flex h-16 items-center gap-2 border-b px-6">
        <Mic className="h-6 w-6 text-primary" />
        <span className="font-semibold">Voice AI</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
        {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
            <Link
                key={item.href}
                href={item.href}
                className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
            >
                <Icon className="h-4 w-4" />
                {item.label}
            </Link>
            );
        })}
        </nav>
    </aside>
  );
}