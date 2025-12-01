"use client"

import { useState, useEffect } from "react"
import { Plus, CalendarIcon, Tag, Clock, Pencil, Trash2, UserCog, Users, ChevronLeft, Calendar, ChevronRight } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { CategoryBadge } from "@/components/category-badge"
import { StatusBadge } from "@/components/status-badge"
import { appointmentsApi, professionalsApi, clientsApi } from "@/lib/api"
import type { Appointment, AppointmentStatus, Professional, Client } from "@/lib/types"
import { AppointmentModal } from "./appointment-modal"
import Loading from "@/components/loading"

export default function AgendamentosPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedProfessional, setSelectedProfessional] = useState<string | null>("all")
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState("week")

  useEffect(() => {
    loadAppointments()
    loadProfessionals()
  }, [])

  useEffect(() => {
    loadAppointments()
  }, [currentDate, selectedCategory, selectedProfessional])

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
      if (currentDate) params.currentDate = currentDate
      if (selectedCategory !== "all") params.category = selectedCategory
      if (selectedProfessional && selectedProfessional !== "all") params.professionalId = selectedProfessional

      const response = await appointmentsApi.getAll(params)
      setAppointments(response.data)
    } catch (error) {
      console.error("Error loading appointments:", error)
    } finally {
      setIsLoading(false);
    }
  }

  const filterAppointments = (dateStr) => {
    let filtered = appointments.filter(apt => apt.date === dateStr)
    
    if (selectedCategory !== "all") {
      filtered = filtered.filter(apt => apt.category === selectedCategory)
    }
    
    if (selectedProfessional !== "all") {
      filtered = filtered.filter(apt => apt.professionalId === selectedProfessional)
    }
    
    return filtered.sort((a, b) => a.time.localeCompare(b.time))
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

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    return { daysInMonth, startingDayOfWeek, firstDay, lastDay }
  }

  const getWeekDays = (date) => {
    const curr = new Date(date)
    const first = curr.getDate() - curr.getDay()
    
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(curr)
      day.setDate(first + i)
      return day
    })
  }

  const changeMonth = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + direction)
    setCurrentDate(newDate)
  }

  const changeWeek = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + (direction * 7))
    setCurrentDate(newDate)
  }

  const formatDate = (date) => {
    return date.toISOString().split('T')[0]
  }

  const isToday = (date) => {
    const today = new Date()
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear()
  }

  const renderWeekView = () => {
    const weekDays = getWeekDays(currentDate)
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-200">
          {weekDays.map((day, idx) => {
            const dayAppointments = filterAppointments(formatDate(day))
            const isCurrentDay = isToday(day)
            
            return (
              <div key={idx} className="border-r border-gray-200 last:border-r-0">
                <div className={`p-3 text-center border-b border-gray-200 ${isCurrentDay ? 'bg-gradient-to-r from-amber-50 to-yellow-50' : 'bg-gray-50'}`}>
                  <div className="text-xs text-gray-600 font-medium">{dayNames[idx]}</div>
                  <div className={`text-lg font-bold ${isCurrentDay ? 'text-amber-600' : 'text-gray-900'}`}>
                    {day.getDate()}
                  </div>
                </div>
                <div className="p-2 min-h-[400px] space-y-2">
                  {dayAppointments.map(apt => (
                    <div
                      key={apt.id}
                      className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-lg p-2 hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <span className="text-xs font-bold text-amber-700">{apt.time}</span>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <button 
                          onClick={() => handleEdit(apt)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button 
                          onClick={() => handleDelete(String(apt.id))}
                          className="p-1 text-red-600 hover:bg-red-50 rounded">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="text-xs font-semibold text-gray-900 mb-1">{apt.clientName}</div>
                      <div className="text-xs text-gray-600 mb-2">{apt.service}</div>
                      <div className="flex flex-wrap gap-1">
                        <StatusBadge status={apt.status} />
                        <CategoryBadge category={apt.category} />
                      </div>
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <UserCog className="w-3 h-3" />
                        {apt.professionalName}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderMonthView = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate)
    const monthDays = []
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      monthDays.push(null)
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      monthDays.push(i)
    }
    
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
          {dayNames.map(name => (
            <div key={name} className="p-3 text-center text-sm font-semibold text-gray-700 border-r border-gray-200 last:border-r-0">
              {name}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {monthDays.map((day, idx) => {
            if (!day) {
              return <div key={`empty-${idx}`} className="min-h-[120px] bg-gray-50 border-r border-b border-gray-200" />
            }
            
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
            const dayAppointments = filterAppointments(formatDate(date))
            const isCurrentDay = isToday(date)
            
            return (
              <div key={day} className="min-h-[120px] border-r border-b border-gray-200 last:border-r-0 p-2 hover:bg-gray-50 transition-colors">
                <div className={`text-sm font-bold mb-2 ${isCurrentDay ? 'text-amber-600' : 'text-gray-700'}`}>
                  {day}
                </div>
                <div className="space-y-1">
                  {dayAppointments.slice(0, 3).map(apt => (
                    <div
                      key={apt.id}
                      className="text-xs bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-200 rounded p-1 hover:shadow-sm transition-shadow cursor-pointer"
                    >
                      <div className="font-semibold text-amber-900">{apt.time}</div>
                      <div className="text-gray-700 truncate">{apt.clientName}</div>
                    </div>
                  ))}
                  {dayAppointments.length > 3 && (
                    <div className="text-xs text-gray-500 font-medium">
                      +{dayAppointments.length - 3} mais
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <div className="mb-6">
          <PageHeader
        title="Agendamentos"
        description="Gerencie os agendamentos dos clientes"
        action={
          <Button
            onClick={() => {
              setEditingAppointment(null)
              setIsModalOpen(true)
            }}
            className="bg-gradient-to-r from-[var(--gold-accent)] to-[var(--gold-medium)] hover:opacity-70 
    text-white text-base py-5 rounded-lg flex items-center gap-4 shadow-md transition-all"
          >
            <Plus className="w-6 h-6" />
            Novo Agendamento
          </Button>
        }
        />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <label className="flex items-center gap-2 text-sm font-medium mb-2 text-gray-700">
              <Tag className="w-4 h-4" />
              Categoria
            </label>
            <select 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">Todas as Categorias</option>
              <option value="Salão">Salão</option>
              <option value="Estética">Estética</option>
              <option value="Bronze">Bronze</option>
              <option value="Loja de roupas">Loja de roupas</option>
            </select>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <label className="flex items-center gap-2 text-sm font-medium mb-2 text-gray-700">
              <UserCog className="w-4 h-4" />
              Profissional
            </label>
            <select 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={selectedProfessional ?? 'all'}
              onChange={(e) => setSelectedProfessional(e.target.value)}
            >
              <option value="all">Todos os Profissionais</option>
              {professionals.map((prof) => (
                <option key={prof.id} value={String(prof.id)}>
                  {prof.name}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <label className="text-sm font-medium mb-2 block text-gray-700">
              Visualização
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setView('week')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  view === 'week' 
                    ? 'bg-gradient-to-r from-[var(--gold-accent)] to-[var(--gold-medium)] text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Semana
              </button>
              <button
                onClick={() => setView('month')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  view === 'month' 
                    ? 'bg-gradient-to-r from-[var(--gold-accent)] to-[var(--gold-medium)] text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Mês
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <button
            onClick={() => view === 'week' ? changeWeek(-1) : changeMonth(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-amber-600" />
            <h2 className="text-xl font-bold text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
          </div>

          <button
            onClick={() => view === 'week' ? changeWeek(1) : changeMonth(1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {view === 'week' ? renderWeekView() : renderMonthView()}
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