"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, CreditCard, Users, UserCog, BarChart3, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

const menuItems = [
  { href: "/agendamentos", label: "Agendamentos", icon: Calendar },
  { href: "/pagamentos", label: "Pagamentos", icon: CreditCard },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/profissionais", label: "Profissionais", icon: UserCog },
  { href: "/relatorios", label: "Relatórios", icon: BarChart3 },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-[var(--color-border)] flex flex-col">
      <div className="p-6 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-[var(--color-primary)]">Maria Diniz</h1>
            <p className="text-xs text-[var(--color-text-secondary)]">Espaço de Beleza</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium",
                    isActive
                      ? "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white shadow-lg"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)]",
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
