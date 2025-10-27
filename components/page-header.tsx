import type { ReactNode } from "react"

interface PageHeaderProps {
  title: string
  description: string
  action?: ReactNode
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 
          className="
            text-3xl 
            font-bold 
            mb-1
            
            // 1. Definição do Gradiente
            bg-gradient-to-r
            from-[var(--color-primary)]
            to-[var(--color-secondary)]
            
            // 2. Aplicar o Gradiente ao Texto (Cortar o Fundo pelo Texto)
            bg-clip-text
            
            // 3. Tornar o Texto Transparente para Ver o Gradiente
            text-transparent 
          "
        >
          {title}
        </h1>
        <p className="text-[var(--color-text-secondary)]">{description}</p>
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
