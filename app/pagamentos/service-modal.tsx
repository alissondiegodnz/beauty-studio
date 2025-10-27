"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { servicesApi, clientsApi, professionalsApi } from "@/lib/api"
import type { Service, Client, Professional, Category, PaymentMethod } from "@/lib/types"

interface ServiceModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  service: Service | null
}

export function ServiceModal({ isOpen, onClose, onSave, service }: ServiceModalProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [formData, setFormData] = useState({
    clientId: "",
    professionalId: "",
    category: "" as Category | "",
    value: "",
    paymentMethod: "" as PaymentMethod | "",
    date: "",
    time: "",
    description: "",
  })

  useEffect(() => {
    if (isOpen) {
      loadClients()
      loadProfessionals()

      if (service) {
        setFormData({
          clientId: service.clientId,
          professionalId: service.professionalId,
          category: service.category,
          value: service.value.toString(),
          paymentMethod: service.paymentMethod,
          date: service.date,
          time: service.time,
          description: service.description,
        })
      } else {
        setFormData({
          clientId: "",
          professionalId: "",
          category: "",
          value: "",
          paymentMethod: "",
          date: "",
          time: "",
          description: "",
        })
      }
    }
  }, [isOpen, service])

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
        value: Number.parseFloat(formData.value),
        paymentMethod: formData.paymentMethod as PaymentMethod,
      }

      if (service) {
        await servicesApi.update(service.id, data)
      } else {
        await servicesApi.create(data)
      }

      onSave()
    } catch (error) {
      console.error("Error saving service:", error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-[var(--color-border)] p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
            {service ? "Editar Pagamento" : "Novo Pagamento"}
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
              <Label htmlFor="value" className="mb-2">Valor (R$) *</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder="0,00"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="paymentMethod" className="mb-2">Método de Pagamento *</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value) => setFormData({ ...formData, paymentMethod: value as PaymentMethod })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                  <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                  <SelectItem value="PIX">PIX</SelectItem>
                </SelectContent>
              </Select>
            </div>

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

          <div>
            <Label htmlFor="description" className="mb-2">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva o serviço realizado"
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
              {service ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
