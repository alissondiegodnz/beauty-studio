import { cn } from "@/lib/utils"

interface CategoryBadgeProps {
  categoriesStr: string 
  className?: string
}

// Mapeamento de cores para as categorias
// Adicione um fallback 'default' se a categoria for 'Misto' ou desconhecida
const categoryColors: Record<string, string> = {
  "Salão": "bg-pink-100 text-pink-700",
  "Estética": "bg-purple-100 text-purple-700",
  "Bronze": "bg-amber-100 text-amber-700",
  "Loja de roupas": "bg-blue-100 text-blue-700",
  // Cor de fallback para categorias não mapeadas ou "Misto"
  "default": "bg-gray-100 text-gray-700", 
}

export function CategoryBadgeList({ categoriesStr, className }: CategoryBadgeProps) {
  
  // 1. Divide a string de categorias, mapeia, e limpa espaços e strings vazias.
  const categories = categoriesStr
    .split(',')
    .map(c => c.trim())
    .filter(c => c.length > 0)

  if (categories.length === 0) {
    return null // Não renderiza nada se não houver categorias válidas
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {categories.map((category) => {
        // Obtém a classe de cor, usando 'default' se a categoria não estiver mapeada
        const colorClass = categoryColors[category] || categoryColors["default"]

        return (
          <span
            key={category} // Usar a categoria como chave é seguro aqui, pois elas são únicas
            className={cn(
              "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap",
              colorClass
            )}
          >
            {category}
          </span>
        )
      })}
    </div>
  )
}