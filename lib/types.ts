export type Category = "Salão" | "Estética" | "Bronze" | "Loja de roupas"

export type AppointmentStatus = "Agendado" | "Confirmado" | "Concluído"

export type PaymentMethod = "Dinheiro" | "Cartão de Crédito" | "Cartão de Débito" | "PIX"

export type ProfessionalStatus = "Ativa" | "Inativo"

export interface Client {
  id: string
  name: string
  phone: string
  email: string
  birthDate: string
  observations?: string
}

export interface Professional {
  id: string
  name: string
  phone: string
  status: ProfessionalStatus
  address: string
}

export interface Appointment {
  id: string
  clientId: string
  clientName: string
  professionalId: string
  professionalName: string
  category: Category
  status: AppointmentStatus
  date: string
  time: string
  service: string
  observations?: string
}

export interface Service {
  id: string
  clientId: string
  clientName: string
  professionalId: string
  professionalName: string
  category: Category
  value: number
  paymentMethod: PaymentMethod
  date: string
  time: string
  description: string
}

export interface ReportData {
  todayRevenue: number
  totalRevenue: number
  averagePayment: number
  totalServices: number
  dailyRevenue: { date: string; value: number }[]
  revenueByCategory: { category: Category; value: number; percentage: number }[]
  revenueByProfessional: { name: string; services: number; total: number }[]
  paymentMethods: { method: PaymentMethod; value: number }[]
}
