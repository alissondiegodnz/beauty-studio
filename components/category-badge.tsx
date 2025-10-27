import { cn } from "@/lib/utils"
import type { Category } from "@/lib/types"

interface CategoryBadgeProps {
  category: Category
  className?: string
}

const categoryColors: Record<Category, string> = {
  Salão: "bg-pink-100 text-pink-700",
  Estética: "bg-purple-100 text-purple-700",
  Bronze: "bg-amber-100 text-amber-700",
  "Loja de roupas": "bg-blue-100 text-blue-700",
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
        categoryColors[category],
        className,
      )}
    >
      {category}
    </span>
  )
}
