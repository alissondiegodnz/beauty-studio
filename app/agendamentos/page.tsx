"use client"

import { useState, useEffect } from "react"
import { Plus, CalendarIcon, Tag, Clock, Pencil, Trash2, UserCog, Users } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CategoryBadge } from "@/components/category-badge"
import { StatusBadge } from "@/components/status-badge"
import { appointmentsApi, professionalsApi, clientsApi } from "@/lib/api"
import type { Appointment, AppointmentStatus, Professional, Client } from "@/lib/types"
import { AppointmentModal } from "./appointment-modal"
import Loading from "@/components/loading"

const tabs = ["Todos", "Agendados", "Confirmados", "Concluídos"]

function formatGmt3Date(offsetDays = 0) {
  const ms = Date.now() - 3 * 60 * 60 * 1000 + offsetDays * 24 * 60 * 60 * 1000
  return new Date(ms).toISOString().slice(0, 10)
}

export default function AgendamentosPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  const [startDate, setStartDate] = useState(() => formatGmt3Date(0))
  const [endDate, setEndDate] = useState(() => formatGmt3Date(2))
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedProfessional, setSelectedProfessional] = useState<string | null>("all")
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [clientSearchTerm, setClientSearchTerm] = useState("")
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([])
  const [activeTab, setActiveTab] = useState("Todos")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAppointments()
    loadProfessionals()
  }, [])

  useEffect(() => {
    loadAppointments()
  }, [startDate, endDate, selectedCategory, selectedProfessional])

  useEffect(() => {
    filterAppointments()
  }, [allAppointments, activeTab, clientSearchTerm])

  const loadProfessionals = async () => {
    try {
      const response = await professionalsApi.getAll()
      setProfessionals(response.data)
    } catch (error) {
      console.error("Error loading professionals:", error)
    }
  }

  const loadAppointments = async () => {
    setIsLoading(true);
    try {
      const params: any = {}
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate
      if (selectedCategory !== "all") params.category = selectedCategory
      if (selectedProfessional && selectedProfessional !== "all") params.professionalId = selectedProfessional

      const response = await appointmentsApi.getAll(params)
      setAllAppointments(response.data)
    } catch (error) {
      console.error("Error loading appointments:", error)
    } finally {
      setIsLoading(false);
    }
  }

  const filterAppointments = () => {
    let filtered = allAppointments

    if (activeTab !== "Todos") {
      const statusMap: Record<string, AppointmentStatus> = {
        Agendados: "Agendado",
        Confirmados: "Confirmado",
        Concluídos: "Concluído",
      }
      filtered = filtered.filter((apt) => apt.status === statusMap[activeTab])
    }

    if (clientSearchTerm) {
      filtered = filtered.filter(appointment => 
        appointment.clientName.toLowerCase().includes(clientSearchTerm.toLowerCase())
      )
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

  if (isLoading) {
      return <Loading />
  }

  return (
    <div className="mx-auto max-w-7xl"> 
      <PageHeader
        title="Agendamentos"
        description="Gerencie os agendamentos dos clientes"
        className="flex flex-col items-center text-center"
        action={
          <Button
            onClick={() => {
              setEditingAppointment(null)
              setIsModalOpen(true)
            }}
            className="bg-gradient-to-r from-[var(--gold-accent)] to-[var(--gold-medium)] hover:opacity-70"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Agendamento
          </Button>
        }
      />

      {/* Filtros */}
      <div className="grid grid-cols-5 gap-6 mb-6">
        {/* Card de Data */}
        <div className="col-span-2 p-4 bg-white rounded-xl shadow-md border border-[var(--color-border)]">
          <h3 className="text-sm font-medium mb-4 text-[var(--color-text-primary)]">Período</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2 text-[var(--color-text-primary)]">
                <CalendarIcon className="w-4 h-4" />
                Data Início
              </label>
              <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2 text-[var(--color-text-primary)]">
                <CalendarIcon className="w-4 h-4" />
                Data Fim
              </label>
              <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Card de Filtros */}
        <div className="col-span-3 p-4 bg-white rounded-xl shadow-md border border-[var(--color-border)]">
          <h3 className="text-sm font-medium mb-4 text-[var(--color-text-primary)]">Filtros</h3>
          <div className="grid grid-cols-3 gap-6">
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

            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2 text-[var(--color-text-primary)]">
                <UserCog className="w-4 h-4" />
                Profissional
              </label>
              <Select value={selectedProfessional ?? 'all'} onValueChange={setSelectedProfessional}>
                <SelectTrigger className="border-[var(--color-border)]">
                  <SelectValue placeholder="Todos os Profissionais" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Profissionais</SelectItem>
                  {professionals.map((prof) => (
                    <SelectItem key={prof.id} value={String(prof.id)}>
                      {prof.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2 text-[var(--color-text-primary)]">
                <Users className="w-4 h-4" />
                Cliente
              </label>
              <Input 
                type="text"
                placeholder="Buscar cliente..."
                className="border-[var(--color-border)]"
                value={clientSearchTerm}
                onChange={(e) => setClientSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Container */}
      <div className="flex mb-6">
        <div className="flex gap-4 bg-white rounded-xl shadow-sm p-4 border border-[var(--color-border)]">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                pb-2 px-3 text-sm font-medium transition-colors relative
                ${
                  activeTab === tab
                    ? "text-[var(--gold-accent)]"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
                }
              `}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[var(--gold-accent)] to-[var(--gold-medium)]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredAppointments.map((appointment) => (
          <div
            key={String(appointment.id)}
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
                  onClick={() => handleDelete(String(appointment.id))}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[var(--color-text-primary)]">
                <Users className="w-4 h-4 text-[var(--color-text-secondary)]" />
                <span className="font-semibold text-[var(--color-text-secondary)]">{appointment.clientName}</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--color-text-secondary)] text-sm">
                <UserCog className="w-4 h-4" />
                <span>{appointment.professionalName}</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--color-text-secondary)] text-sm">
                <div className="flex items-center gap-2 text-[var(--color-text-secondary)] text-sm">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{new Date(`${appointment.date}T12:00:00`).toLocaleDateString("pt-BR")}</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--color-text-secondary)] text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{appointment.time}</span>
                </div>
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
                p-16
                flex 
                flex-col 
                items-center 
                justify-center 
                text-center 
                border-rose-outline
                mx-auto
                w-full
            "
        >
            <CalendarIcon className="w-12 h-12 text-[var(--color-primary)] mb-4" />
            <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-1">
                Nenhum agendamento encontrado
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)]">
                no período informado
            </p>
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