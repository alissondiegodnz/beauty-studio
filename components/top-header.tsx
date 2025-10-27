"use client"

import { Sparkles } from "lucide-react"

export function TopHeader() {
  return (
    <header className="w-full h-16 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] border-b border-[var(--color-border)] flex items-center px-8 shadow-md">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/30">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-xl text-white">Maria Diniz</h1>
          <p className="text-xs text-white/80">Espaço de Beleza</p>
        </div>
      </div>
    </header>
  )
}
