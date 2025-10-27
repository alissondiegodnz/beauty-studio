"use client"

import { useState, useEffect } from "react"
import { Plus, CalendarIcon, Tag, User, DollarSign, CreditCard, Clock, Pencil, Trash2 } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CategoryBadge } from "@/components/category-badge"
import { servicesApi } from "@/lib/api"
import type { Service } from "@/lib/types"
import { ServiceModal } from "./service-modal"

export default function PagamentosPage() {
  const [services, setServices] = useState<Service[]>([])
  const [selectedDate, setSelectedDate] = useState("2025-10-26")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)

  useEffect(() => {
    loadServices()
  }, [selectedDate, selectedCategory])

  const loadServices = async () => {
    try {
      const params: any = {}
      if (selectedDate) params.date = selectedDate
      if (selectedCategory !== "all") params.category = selectedCategory

      const response = await servicesApi.getAll(params)
      setServices(response.data)
    } catch (error) {
      console.error("Error loading services:", error)
    }
  }

  const handleEdit = (service: Service) => {
    setEditingService(service)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Deseja realmente excluir este serviço?")) {
      try {
        await servicesApi.delete(id)
        loadServices()
      } catch (error) {
        console.error("Error deleting service:", error)
      }
    }
  }

  const handleSave = () => {
    setIsModalOpen(false)
    setEditingService(null)
    loadServices()
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Pagamentos"
        description="Registre os atendimentos realizados"
        action={
          <Button
            onClick={() => {
              setEditingService(null)
              setIsModalOpen(true)
            }}
            className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Pagamento
          </Button>
        }
      />

      {/* Filters */}
      <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-white rounded-xl shadow-md border border-[var(--color-border)]">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium mb-2 text-[var(--color-text-primary)]">
            <CalendarIcon className="w-4 h-4" />
            Data
          </label>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border-[var(--color-border)]"
          />
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm font-medium mb-2 text-[var(--color-text-primary)]">
            <Tag className="w-4 h-4" />
            Categoria
          </label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="border-[var(--color-border)]">
              <SelectValue placeholder="Todas as Categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Categorias</SelectItem>
              <SelectItem value="Salão">Salão</SelectItem>
              <SelectItem value="Estética">Estética</SelectItem>
              <SelectItem value="Bronze">Bronze</SelectItem>
              <SelectItem value="Loja de roupas">Loja de roupas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 gap-4">
        {services.map((service) => (
          <div
            key={service.id}
            className="bg-white rounded-xl p-6 border border-[var(--color-border)] hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <CategoryBadge category={service.category} />
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(service)}
                  className="p-2 text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded-lg transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[var(--color-text-primary)]">
                  <User className="w-4 h-4 text-[var(--color-text-secondary)]" />
                  <span className="font-medium">{service.clientName}</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--color-text-secondary)] text-sm">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{new Date(service.date).toLocaleDateString("pt-BR")}</span>
                  <Clock className="w-4 h-4 ml-2" />
                  <span>{service.time}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[var(--color-success)] font-bold text-lg">
                  <DollarSign className="w-5 h-5" />
                  <span>R$ {service.value.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--color-text-secondary)] text-sm">
                  <CreditCard className="w-4 h-4" />
                  <span>{service.paymentMethod}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
              <p className="text-sm text-[var(--color-text-secondary)]">Profissional: {service.professionalName}</p>
            </div>
          </div>
        ))}

        {services.length === 0 && (
          <div 
            className="
                bg-white 
                rounded-xl 
                shadow-sm 
                p-16 // Aumenta o padding para um visual espaçoso
                flex 
                flex-col 
                items-center 
                justify-center 
                text-center 
                border-rose-outline // Adiciona a borda
                mx-auto // Centraliza o card se ele não ocupar 100% da largura
                w-full // Garante que ele ocupe 100% da coluna
            "
        >
            <DollarSign className="w-12 h-12 text-[var(--color-primary)] mb-4" />
            <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-1">
                Nenhum pagamento encontrado
            </h3>
          </div>
        )}
      </div>

      <ServiceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingService(null)
        }}
        onSave={handleSave}
        service={editingService}
      />
    </div>
  )
}
