import api from "./axios"
import type { Client, Professional, Appointment, Payment, ReportData, Service, Package } from "./types"

// Clients API
export const clientsApi = {
  getAll: () => api.get<Client[]>("/clients"),
  getPage: (page: number, limit: number, params?: Record<string, any>) =>
    api.get<Client[]>("/clients", { params: { page, limit, _page: page, _limit: limit, ...params } }),
  getById: (id: string) => api.get<Client>(`/clients/${id}`),
  create: (data: Omit<Client, "id">) => api.post<Client>("/clients", data),
  update: (id: string, data: Partial<Client>) => api.put<Client>(`/clients/${id}`, data),
  delete: (id: string) => api.delete(`/clients/${id}`),
}

// Professionals API
export const professionalsApi = {
  getAll: () => api.get<Professional[]>("/professionals"),
  getAllStatus: () => api.get<Professional[]>("/professionals/allStatus"),
  getById: (id: string) => api.get<Professional>(`/professionals/${id}`),
  create: (data: Omit<Professional, "id">) => api.post<Professional>("/professionals", data),
  update: (id: string, data: Partial<Professional>) => api.put<Professional>(`/professionals/${id}`, data),
  delete: (id: string) => api.delete(`/professionals/${id}`),
}

// Services API
export const servicesApi = {
  getAll: () => api.get<Service[]>("/services"),
  getAllStatus: () => api.get<Service[]>("/services/allStatus"),
  getById: (id: string) => api.get<Service>(`/services/${id}`),
  create: (data: Omit<Service, "id">) => api.post<Service>("/services", data),
  update: (id: string, data: Partial<Service>) => api.put<Service>(`/services/${id}`, data),
  delete: (id: string) => api.delete(`/services/${id}`),
}

// Packages API
export const packagesApi = {
  getAll: () => api.get<Package[]>("/packages"),
  getAllStatus: () => api.get<Package[]>("/packages/allStatus"),
  getById: (id: string) => api.get<Package>(`/packages/${id}`),
  create: (data: Omit<Package, "id">) => api.post<Package>("/packages", data),
  update: (id: string, data: Partial<Package>) => api.put<Package>(`/packages/${id}`, data),
  delete: (id: string) => api.delete(`/packages/${id}`),
}


// Appointments API
export const appointmentsApi = {
  getAll: (params?: { startDate?: string; endDate?: string; category?: string;}) =>
    api.get<Appointment[]>("/appointments", { params }),
  getById: (id: string) => api.get<Appointment>(`/appointments/${id}`),
  create: (data: Omit<Appointment, "id">) => api.post<Appointment>("/appointments", data),
  update: (id: string, data: Partial<Appointment>) => api.put<Appointment>(`/appointments/${id}`, data),
  delete: (id: string) => api.delete(`/appointments/${id}`),
}

// Payments API
export const paymentsApi = {
  getAll: (params?: { startDate?: string; endDate?: string; category?: string; professionalId?: string }) => api.get<Payment[]>("/payments", { params }),
  getById: (id: string) => api.get<Payment>(`/payments/${id}`),
  create: (data: Omit<Payment, "id">) => api.post<Payment>("/payments", data),
  update: (id: string, data: Partial<Payment>) => api.put<Payment>(`/payments/${id}`, data),
  delete: (id: string) => api.delete(`/payments/${id}`),
}

// Reports API
export const reportsApi = {
  getData: (params: { startDate: string; endDate: string; category?: string }) =>
    api.get<ReportData>("/reports", { params }),
}
