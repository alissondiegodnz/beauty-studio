"use client"

import { useState, useEffect } from "react"
import { Plus, CalendarIcon, Tag, DollarSign, CreditCard, Clock, Pencil, Trash2, Package, UserCog, Users, Phone } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CategoryBadge } from "@/components/category-badge"
import { paymentsApi, professionalsApi, clientsApi } from "@/lib/api"
import type { Payment, Professional, Client } from "@/lib/types"
import { PaymentModal } from "./payment-modal"
import Loading from "@/components/loading"

function formatGmt3Date(offsetDays = 0) {
  const ms = Date.now() - 3 * 60 * 60 * 1000 + offsetDays * 24 * 60 * 60 * 1000
  return new Date(ms).toISOString().slice(0, 10)
}

export default function PagamentosPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [startDate, setStartDate] = useState(() => formatGmt3Date(-1))
  const [endDate, setEndDate] = useState(() => formatGmt3Date(0))
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedProfessional, setSelectedProfessional] = useState<string>("all")
  const [clientSearchTerm, setClientSearchTerm] = useState("")
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [allPayments, setAllPayments] = useState<Payment[]>([])
  const [modalState, setModalState] = useState<{ isOpen: boolean; payment: Payment | null }>({
    isOpen: false,
    payment: null
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadPayments()
  }, [startDate, endDate, selectedCategory, selectedProfessional])

  useEffect(() => {
    filterPayments()
  }, [allPayments, clientSearchTerm])

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

  const loadPayments = async () => {
    setIsLoading(true)
    try {
      const params: any = {}
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate
      if (selectedCategory !== "all") params.category = selectedCategory
      if (selectedProfessional !== "all") params.professionalId = selectedProfessional

      const response = await paymentsApi.getAll(params)
      setAllPayments(response.data)
    } catch (error) {
      console.error("Error loading payments:", error)
    } finally {
        setIsLoading(false)
    }
  }

  const filterPayments = () => {
    let filtered = allPayments

    if (clientSearchTerm) {
      filtered = filtered.filter(payment => 
        (payment.clientName.toLowerCase().includes(clientSearchTerm.toLowerCase()) || payment.clientPhone?.includes(clientSearchTerm))
      )
    }

    setPayments(filtered)
  }

  const handleEdit = (payment: Payment) => {
    setModalState({ isOpen: true, payment })
  }

  const handleDelete = async (id: string) => {
    if (confirm("Deseja realmente excluir este pagamento?")) {
      try {
        await paymentsApi.delete(id)
        loadPayments()
      } catch (error) {
        console.error("Error deleting payment:", error)
      }
    }
  }

  const handleSave = () => {
    setModalState({ isOpen: false, payment: null })
    loadPayments()
  }

  const handleCloseModal = () => {
    setModalState({ isOpen: false, payment: null })
  }

  return (
    <div className="mx-auto max-w-7xl">
      {isLoading && <Loading />}
      <PageHeader
        title="Pagamentos"
        description="Registre os atendimentos realizados"
        action={
          <Button
            onClick={() => { setModalState({ isOpen: true, payment: null })}}
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
          <p className="text-3xl font-bold">R$ {payments.reduce((sum, s) => sum + (s?.value || 0), 0).toFixed(2)}</p>
          <p className="text-xs opacity-75 mt-1">No período</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-[var(--color-border)]">
          <div className="flex items-center gap-2 mb-2 text-[var(--color-text-secondary)]">
            <Package className="w-5 h-5" />
            <span className="text-sm">Total de Pagamentos</span>
          </div>
          <p className="text-3xl font-bold text-[var(--color-primary)]">{payments.length}</p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">No período</p>
        </div>
      </div>

      {/* Payments Grid */}
      <div className="grid grid-cols-1 gap-4">
        {payments.map((payment) => (
          <div
            key={String(payment.id)}
            className="bg-white rounded-xl p-6 border border-[var(--color-border)] hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <CategoryBadge category={payment.category} />
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(payment)}
                  className="p-2 text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded-lg transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(String(payment.id))}
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
                  <span className="font-semibold">{payment.clientName}</span>
                </div>
                <div className="flex items-center gap-2 font-bold text-[var(--color-text-secondary)]">
                  <Phone className="w-4 h-4 text-[var(--color-text-secondary)]" />
                  <span className="font-semibold">{`${payment.clientPhone ?? '-'}`}</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--color-text-secondary)] text-sm">
                  <UserCog className="w-4 h-4" />
                  <span>{payment.professionalName}</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--color-text-secondary)] text-sm">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{new Date(`${payment.date}T12:00:00`).toLocaleDateString("pt-BR")}</span>
                  <Clock className="w-4 h-4 ml-2" />
                  <span>{payment.time}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[var(--color-success)] font-bold text-lg">
                  <DollarSign className="w-5 h-5" />
                  <span>R$ {payment.value.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--color-text-secondary)] text-sm">
                  <CreditCard className="w-4 h-4" />
                  <span>{payment.paymentMethod}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {payments.length === 0 && (
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

      <PaymentModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        payment={modalState.payment}
      />
    </div>
  )
}
