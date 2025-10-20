"use client"
export const dynamic = "force-dynamic";

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Car, Users, FileText, Wrench, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Veículos", href: "/vehicles", icon: Car },
  { name: "Clientes", href: "/customers", icon: Users },
  { name: "Locações", href: "/rentals", icon: FileText },
  { name: "Manutenção", href: "/maintenance", icon: Wrench },
  { name: "Relatórios", href: "/reports", icon: BarChart3 },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r border-border bg-card">
      <div className="flex h-16 items-center border-b border-border px-6">
        <div className="flex items-center gap-2">
          <Car className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">Locadora Pro</span>
        </div>
      </div>

      <nav className="flex flex-col gap-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
