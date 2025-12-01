import type { ReactNode } from "react"

interface PageHeaderProps {
  title: string
  description: string
  action?: ReactNode
  className?: string
}

export function PageHeader({ title, description, action, className = "" }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="col-span-4 mb-4">
        <h1 
          className="
            text-3xl 
            font-semibold 
            mb-1
            
            bg-gradient-to-t
            from-[var(--gold-accent)]
            to-[var(--gold-medium)]
            
            bg-clip-text
            text-transparent 
          "
        >
          {title}
        </h1>
        <p className="text-[var(--color-text-secondary)]">{description}</p>
      </div>
      {action && <div className="col-span-2">{action}</div>}
    </div>
  )
}
