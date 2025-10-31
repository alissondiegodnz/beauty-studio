import { cn } from "@/lib/utils"
import type { AppointmentStatus, ProfessionalStatus } from "@/lib/types"

interface StatusBadgeProps {
  status: AppointmentStatus | ProfessionalStatus
  className?: string
}

const statusColors: Record<string, string> = {
  Agendado: "bg-blue-100 text-blue-700",
  Confirmado: "bg-green-100 text-green-700",
  Concluído: "bg-gray-100 text-gray-700",
  Ativo: "bg-green-100 text-green-700",
  Inativo: "bg-gray-100 text-gray-700",
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
        statusColors[status],
        className,
      )}
    >
      {status}
    </span>
  )
}
