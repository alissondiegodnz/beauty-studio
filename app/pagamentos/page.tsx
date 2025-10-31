"use client"

import { useState, useEffect } from "react"
import { Plus, CalendarIcon, Tag, DollarSign, CreditCard, Clock, Pencil, Trash2, Package, UserCog, Users } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CategoryBadge } from "@/components/category-badge"
import { servicesApi, professionalsApi, clientsApi } from "@/lib/api"
import type { Service, Professional, Client } from "@/lib/types"
import { ServiceModal } from "./service-modal"
import Loading from "@/components/loading"

function formatGmt3Date(offsetDays = 0) {
  const ms = Date.now() - 3 * 60 * 60 * 1000 + offsetDays * 24 * 60 * 60 * 1000
  return new Date(ms).toISOString().slice(0, 10)
}

export default function PagamentosPage() {
  const [services, setServices] = useState<Service[]>([])
  const [startDate, setStartDate] = useState(() => formatGmt3Date(-1))
  const [endDate, setEndDate] = useState(() => formatGmt3Date(0))
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedProfessional, setSelectedProfessional] = useState<string>("all")
  const [clientSearchTerm, setClientSearchTerm] = useState("")
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [allServices, setAllServices] = useState<Service[]>([])
  const [modalState, setModalState] = useState<{ isOpen: boolean; service: Service | null }>({
    isOpen: false,
    service: null
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadServices()
  }, [startDate, endDate, selectedCategory, selectedProfessional])

  useEffect(() => {
    filterServices()
  }, [allServices, clientSearchTerm])

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const profResp = await professionalsApi.getAll()
        setProfessionals(profResp.data)
      } catch (err) {
        console.error('Error loading professionals:', err)
      }
    }
    loadInitialData()
  }, [])

  const loadServices = async () => {
    setIsLoading(true)
    try {
      const params: any = {}
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate
      if (selectedCategory !== "all") params.category = selectedCategory
      if (selectedProfessional !== "all") params.professionalId = selectedProfessional

      const response = await servicesApi.getAll(params)
      setAllServices(response.data)
    } catch (error) {
      console.error("Error loading services:", error)
    } finally {
        setIsLoading(false)
    }
  }

  const filterServices = () => {
    let filtered = allServices

    if (clientSearchTerm) {
      filtered = filtered.filter(service => 
        service.clientName.toLowerCase().includes(clientSearchTerm.toLowerCase())
      )
    }

    setServices(filtered)
  }

  const handleEdit = (service: Service) => {
    setModalState({ isOpen: true, service })
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
    setModalState({ isOpen: false, service: null })
    loadServices()
  }

  const handleCloseModal = () => {
    setModalState({ isOpen: false, service: null })
  }

  if (isLoading) {
    return <Loading />
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Pagamentos"
        description="Registre os atendimentos realizados"
        action={
          <Button
            onClick={() => { setModalState({ isOpen: true, service: null })}}
            className="bg-gradient-to-r from-[var(--gold-accent)] to-[var(--gold-medium)] hover:opacity-70"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Pagamento
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
              <Select value={selectedProfessional} onValueChange={setSelectedProfessional}>
                <SelectTrigger className="border-[var(--color-border)]">
                  <SelectValue placeholder="Todos os Profissionais" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Profissionais</SelectItem>
                  {professionals.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-[var(--gold-accent)] to-[var(--gold-medium)] rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5" />
            <span className="text-sm opacity-90">Receita Total</span>
          </div>
          <p className="text-3xl font-bold">R$ {services.reduce((sum, s) => sum + (s?.value || 0), 0).toFixed(2)}</p>
          <p className="text-xs opacity-75 mt-1">No período</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-[var(--color-border)]">
          <div className="flex items-center gap-2 mb-2 text-[var(--color-text-secondary)]">
            <Package className="w-5 h-5" />
            <span className="text-sm">Total de Pagamentos</span>
          </div>
          <p className="text-3xl font-bold text-[var(--color-primary)]">{services.length}</p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">No período</p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 gap-4">
        {services.map((service) => (
          <div
            key={String(service.id)}
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
                  onClick={() => handleDelete(String(service.id))}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-bold text-[var(--color-text-secondary)]">
                  <Users className="w-4 h-4 text-[var(--color-text-secondary)]" />
                  <span className="font-semibold">{service.clientName}</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--color-text-secondary)] text-sm">
                  <UserCog className="w-4 h-4" />
                  <span>{service.professionalName}</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--color-text-secondary)] text-sm">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{new Date(`${service.date}T12:00:00`).toLocaleDateString("pt-BR")}</span>
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
          </div>
        ))}

        {services.length === 0 && (
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
            <DollarSign className="w-12 h-12 text-[var(--color-primary)] mb-4" />
            <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-1">
                Nenhum pagamento encontrado
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)]">
                no período informado
            </p>
          </div>
        )}
      </div>

      <ServiceModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        service={modalState.service}
      />
    </div>
  )
}
