import api from "./axios"
import type { Client, Professional, Appointment, Service, ReportData } from "./types"

// Clients API
export const clientsApi = {
  getAll: () => api.get<Client[]>("/clients"),
  getById: (id: string) => api.get<Client>(`/clients/${id}`),
  create: (data: Omit<Client, "id">) => api.post<Client>("/clients", data),
  update: (id: string, data: Partial<Client>) => api.put<Client>(`/clients/${id}`, data),
  delete: (id: string) => api.delete(`/clients/${id}`),
}

// Professionals API
export const professionalsApi = {
  getAll: () => api.get<Professional[]>("/professionals"),
  getById: (id: string) => api.get<Professional>(`/professionals/${id}`),
  create: (data: Omit<Professional, "id">) => api.post<Professional>("/professionals", data),
  update: (id: string, data: Partial<Professional>) => api.put<Professional>(`/professionals/${id}`, data),
  delete: (id: string) => api.delete(`/professionals/${id}`),
}

// Appointments API
export const appointmentsApi = {
  getAll: (params?: { date?: string; category?: string; status?: string }) =>
    api.get<Appointment[]>("/appointments", { params }),
  getById: (id: string) => api.get<Appointment>(`/appointments/${id}`),
  create: (data: Omit<Appointment, "id">) => api.post<Appointment>("/appointments", data),
  update: (id: string, data: Partial<Appointment>) => api.put<Appointment>(`/appointments/${id}`, data),
  delete: (id: string) => api.delete(`/appointments/${id}`),
}

// Services API
export const servicesApi = {
  getAll: (params?: { date?: string; category?: string }) => api.get<Service[]>("/services", { params }),
  getById: (id: string) => api.get<Service>(`/services/${id}`),
  create: (data: Omit<Service, "id">) => api.post<Service>("/services", data),
  update: (id: string, data: Partial<Service>) => api.put<Service>(`/services/${id}`, data),
  delete: (id: string) => api.delete(`/services/${id}`),
}

// Reports API
export const reportsApi = {
  getData: (params: { startDate: string; endDate: string; category?: string }) =>
    api.get<ReportData>("/reports", { params }),
}
