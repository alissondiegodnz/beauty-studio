export type Category = "Salão" | "Estética" | "Bronze" | "Loja de roupas"

export type AppointmentStatus = "Agendado" | "Confirmado" | "Concluído"

export type PaymentMethod = "Dinheiro" | "Cartão de Crédito" | "Cartão de Débito" | "PIX"

export type ProfessionalStatus = "Ativo" | "Inativo"

export type ServiceType = "Serviços" | "Pacote"

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

export interface Payment {
  id: string
  clientId: string
  clientName: string
  clientPhone: string
  paymentMethod: PaymentMethod
  value: number
  isPartialValue: boolean
  date: string
  time: string
  description?: string
  serviceType: ServiceType
  packageId?: string
  packageName?: string
  serviceLines?: ServiceLine[]
}

export interface ServiceLine {
  id: string
  serviceId: string
  serviceName: string
  value: number
  professionalId: string
  professionalName: string
  isPackageService?: boolean
}

export interface Service {
  id: string
  name: string
  category: Category
  status: ProfessionalStatus
  price?: number
  description?: string
}

export interface Package {
  id: string
  name: string
  services: Service[]
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
