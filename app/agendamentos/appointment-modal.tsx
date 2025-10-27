"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { appointmentsApi, clientsApi, professionalsApi } from "@/lib/api"
import type { Appointment, Client, Professional, Category, AppointmentStatus } from "@/lib/types"

interface AppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  appointment: Appointment | null
}

export function AppointmentModal({ isOpen, onClose, onSave, appointment }: AppointmentModalProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [formData, setFormData] = useState({
    clientId: "",
    professionalId: "",
    category: "" as Category | "",
    status: "" as AppointmentStatus | "",
    date: "",
    time: "",
    service: "",
    observations: "",
  })

  useEffect(() => {
    if (isOpen) {
      loadClients()
      loadProfessionals()

      if (appointment) {
        setFormData({
          clientId: appointment.clientId,
          professionalId: appointment.professionalId,
          category: appointment.category,
          status: appointment.status,
          date: appointment.date,
          time: appointment.time,
          service: appointment.service,
          observations: appointment.observations || "",
        })
      } else {
        setFormData({
          clientId: "",
          professionalId: "",
          category: "",
          status: "",
          date: "",
          time: "",
          service: "",
          observations: "",
        })
      }
    }
  }, [isOpen, appointment])

  const loadClients = async () => {
    try {
      const response = await clientsApi.getAll()
      setClients(response.data)
    } catch (error) {
      console.error("Error loading clients:", error)
    }
  }

  const loadProfessionals = async () => {
    try {
      const response = await professionalsApi.getAll()
      setProfessionals(response.data)
    } catch (error) {
      console.error("Error loading professionals:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const client = clients.find((c) => c.id === formData.clientId)
      const professional = professionals.find((p) => p.id === formData.professionalId)

      const data = {
        ...formData,
        clientName: client?.name || "",
        professionalName: professional?.name || "",
        category: formData.category as Category,
        status: formData.status as AppointmentStatus,
      }

      if (appointment) {
        await appointmentsApi.update(appointment.id, data)
      } else {
        await appointmentsApi.create(data)
      }

      onSave()
    } catch (error) {
      console.error("Error saving appointment:", error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-[var(--color-border)] p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
            {appointment ? "Editar Agendamento" : "Novo Agendamento"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="clientId" className="mb-2">Cliente *</Label>
              <Select
                value={formData.clientId}
                onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="professionalId" className="mb-2">Profissional</Label>
              <Select
                value={formData.professionalId}
                onValueChange={(value) => setFormData({ ...formData, professionalId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o profissional" />
                </SelectTrigger>
                <SelectContent>
                  {professionals.map((professional) => (
                    <SelectItem key={professional.id} value={professional.id}>
                      {professional.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category" className="mb-2">Categoria *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as Category })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Salão">Salão</SelectItem>
                  <SelectItem value="Estética">Estética</SelectItem>
                  <SelectItem value="Bronze">Bronze</SelectItem>
                  <SelectItem value="Loja de roupas">Loja de roupas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status" className="mb-2">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as AppointmentStatus })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Agendado">Agendado</SelectItem>
                  <SelectItem value="Confirmado">Confirmado</SelectItem>
                  <SelectItem value="Concluído">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date" className="mb-2">Data *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="time" className="mb-2">Hora *</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="service" className="mb-2">Serviço</Label>
            <Input
              id="service"
              value={formData.service}
              onChange={(e) => setFormData({ ...formData, service: e.target.value })}
              placeholder="Descreva o serviço"
            />
          </div>

          <div>
            <Label htmlFor="observations" className="mb-2">Observações</Label>
            <Textarea
              id="observations"
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
              placeholder="Observações adicionais"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90"
            >
              {appointment ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
