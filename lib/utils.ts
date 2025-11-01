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
