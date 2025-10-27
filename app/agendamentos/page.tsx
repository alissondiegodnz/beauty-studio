"use client"

import { useState, useEffect } from "react"
import { Plus, CalendarIcon, Tag, User, Scissors, Clock, Pencil, Trash2 } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CategoryBadge } from "@/components/category-badge"
import { StatusBadge } from "@/components/status-badge"
import { appointmentsApi } from "@/lib/api"
import type { Appointment, AppointmentStatus } from "@/lib/types"
import { AppointmentModal } from "./appointment-modal"

const tabs = ["Todos", "Agendados", "Confirmados", "Concluídos"]

export default function AgendamentosPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  const [selectedDate, setSelectedDate] = useState("2025-10-26")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [activeTab, setActiveTab] = useState("Todos")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)

  useEffect(() => {
    loadAppointments()
  }, [selectedDate, selectedCategory])

  useEffect(() => {
    filterAppointments()
  }, [appointments, activeTab])

  const loadAppointments = async () => {
    try {
      const params: any = {}
      if (selectedDate) params.date = selectedDate
      if (selectedCategory !== "all") params.category = selectedCategory

      const response = await appointmentsApi.getAll(params)
      setAppointments(response.data)
    } catch (error) {
      console.error("Error loading appointments:", error)
    }
  }

  const filterAppointments = () => {
    let filtered = appointments

    if (activeTab !== "Todos") {
      const statusMap: Record<string, AppointmentStatus> = {
        Agendados: "Agendado",
        Confirmados: "Confirmado",
        Concluídos: "Concluído",
      }
      filtered = appointments.filter((apt) => apt.status === statusMap[activeTab])
    }

    setFilteredAppointments(filtered)
  }

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Deseja realmente excluir este agendamento?")) {
      try {
        await appointmentsApi.delete(id)
        loadAppointments()
      } catch (error) {
        console.error("Error deleting appointment:", error)
      }
    }
  }

  const handleSave = () => {
    setIsModalOpen(false)
    setEditingAppointment(null)
    loadAppointments()
  }

  return (
    // CONTÊINER PRINCIPAL: Centraliza o conteúdo
    <div className="mx-auto max-w-7xl"> 
      <PageHeader
        title="Agendamentos"
        description="Gerencie os agendamentos dos clientes"
        action={
          // Botão "Novo Agendamento" com Gradiente
          <Button
            onClick={() => {
              setEditingAppointment(null)
              setIsModalOpen(true)
            }}
            className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Agendamento
          </Button>
        }
      />

      {/* Tabs - AGORA COM TAMANHO E ESPAÇAMENTO AJUSTADOS PARA SER MAIS COMPACTO */}
      <div 
        className="
          flex 
          gap-4 // Diminuído de gap-6 para gap-4 para compactar 
          mb-6 
          bg-white 
          rounded-xl 
          shadow-sm 
          p-2 // Diminuído de p-4 para p-2 para reduzir o tamanho do card
          border border-[var(--color-border)]
          w-fit // Garante que o card de tabs não ocupe a largura total, centralizando-o visualmente com o PageHeader
        "
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              pb-2 px-3 text-sm font-medium transition-colors relative // Ajustei o pb-3 para pb-2 e adicionei px-3 para dar padding horizontal interno ao botão da tab
              ${
                activeTab === tab
                  ? "text-[var(--color-primary)]"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
              }
            `}
          >
            {tab}
            {/* Linha de destaque com gradiente */}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]" />
            )}
          </button>
        ))}
      </div>

      {/* Filters - Mantido como um card maior */}
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

      {/* Appointments Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredAppointments.map((appointment) => (
          <div
            key={appointment.id}
            // Cards de agendamento com sombra suave
            className="bg-white rounded-xl p-6 border border-[var(--color-border)] shadow-sm hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex gap-2">
                <StatusBadge status={appointment.status} />
                <CategoryBadge category={appointment.category} />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(appointment)}
                  className="p-2 text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded-lg transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(appointment.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[var(--color-text-primary)]">
                <User className="w-4 h-4 text-[var(--color-text-secondary)]" />
                <span className="font-medium">{appointment.clientName}</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--color-text-secondary)] text-sm">
                <Scissors className="w-4 h-4" />
                <span>{appointment.professionalName}</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--color-text-secondary)] text-sm">
                <CalendarIcon className="w-4 h-4" />
                <span>{new Date(appointment.date).toLocaleDateString("pt-BR")}</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--color-text-secondary)] text-sm">
                <Clock className="w-4 h-4" />
                <span>{appointment.time}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
              <p className="text-sm text-[var(--color-text-primary)]">{appointment.service}</p>
            </div>
          </div>
        ))}

        {filteredAppointments.length === 0 && (
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
            <CalendarIcon className="w-12 h-12 text-[var(--color-primary)] mb-4" />
            <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-1">
                Nenhum agendamento encontrado
            </h3>
            {/* <p className="text-sm text-[var(--color-text-secondary)]">
                Crie novos agendamentos no botão superior direito
            </p> */}
        </div>
        )}
      </div>

      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingAppointment(null)
        }}
        onSave={handleSave}
        appointment={editingAppointment}
      />
    </div>
  )
}