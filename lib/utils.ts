import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface LimitarTextoProps {
  texto: string
  limite: number
}

export const limitarTexto = ({ texto, limite }: LimitarTextoProps): string => {
    if (!texto) return "";
    
    if (texto.length > limite) {
        return texto.substring(0, limite) + '...';
    }
    return texto;
};

export function formatGmt3Date(offsetDays = 0) {
  const ms = Date.now() - 3 * 60 * 60 * 1000 + offsetDays * 24 * 60 * 60 * 1000
  return new Date(ms).toISOString().slice(0, 10)
}
