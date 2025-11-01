"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, CreditCard, Users, UserCog, BarChart3, Sparkles, Scissors, Package } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image" 
import logoImage from "@/public/logo.png"

const menuItems = [
  { href: "/agendamentos", label: "Agendamentos", icon: Calendar },
  { href: "/pagamentos", label: "Pagamentos", icon: CreditCard },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/profissionais", label: "Profissionais", icon: UserCog },
  { href: "/servicos", label: "Serviços", icon: Scissors },
  { href: "/pacotes", label: "Pacotes de Serviços", icon: Package },
  { href: "/relatorios", label: "Relatórios", icon: BarChart3 },
]

const LogoBanner = () => (
    <a href="/" className="flex items-center w-full h-full justify-center">
        <Image
            src={logoImage} 
            alt="Logo da Empresa"
            width={1920} 
            height={300} 
            className="w-full h-full object-contain rounded-full" 
        />
    </a>
);

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-95 min-h-screen bg-gradient-to-t from-[var(--gold-light)] to-[var(--rose-background)] flex flex-col">
      <div className="p-8 pl-10">
        <div className="flex items-center justify-center">
          <div className="w-47 h-47 p-2 rounded-full flex items-center justify-center">
            <LogoBanner />
          </div>
        </div>
        <div className="flex items-center justify-center">
            <h1 className="font-bold text-2xl p2
            bg-gradient-to-r
            from-[var(--gold-accent)]
            to-[var(--gold-medium)]
            
            bg-clip-text
            p-2
            
            text-transparent ">Maria Diniz</h1>
          </div>
        <div className="flex items-center justify-center">
          <p className="text-sm bg-gradient-to-r
            from-[var(--gold-accent)]
            to-[var(--gold-medium)] bg-clip-text text-transparent font-bold">Moda • Beleza • Estética • Bronzeamento</p>
        </div>
      </div>

      <nav className="flex-1 p-5 pl-6">
        <ul className="space-y-3">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center justify-center gap-2 px-4 py-5 rounded-lg transition-all text-sm font-medium",
                    isActive
                      ? "bg-gradient-to-r from-[var(--gold-accent)] to-[var(--gold-medium)] text-white shadow-lg"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--rose-soft)] hover:text-white",
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
