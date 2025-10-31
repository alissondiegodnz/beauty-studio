"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { X, Phone } from "lucide-react"
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
  const [errors, setErrors] = useState<{ clientId?: string; professionalId?: string; category?: string; paymentMethod?: string; value?: string }>({})
  
  const getInitialFormData = () => ({
    clientId: "",
    professionalId: "",
    category: "" as Category | "",
    value: "",
    paymentMethod: "" as PaymentMethod | "",
    date: "",
    time: "",
    description: "",
  })

  const [formData, setFormData] = useState(getInitialFormData())

  const loadClients = async () => {
    try {
      const response = await clientsApi.getAll()
      console.log("Clientes carregados:", response.data)
      setClients(response.data)
    } catch (error) {
      console.error("Erro ao carregar clientes:", error)
    }
  }

  const loadProfessionals = async () => {
    try {
      const response = await professionalsApi.getAll()
      console.log("Profissionais carregados:", response.data)
      setProfessionals(response.data)
    } catch (error) {
      console.error("Erro ao carregar profissionais:", error)
    }
  }

  useEffect(() => {    
    if (!isOpen) {
      setFormData(getInitialFormData())
      return
    }

    Promise.all([loadClients(), loadProfessionals()]).then(() => {      
      if (service) {
        const newFormData = {
          clientId: String(service.clientId),
          professionalId: String(service.professionalId),
          category: service.category as Category | "",
          value: String(service.value),
          paymentMethod: service.paymentMethod as PaymentMethod | "",
          date: service.date,
          time: service.time,
          description: service.description || "",
        }
        setFormData(newFormData)
      } else {
        setFormData(getInitialFormData())
      }
    })
  }, [isOpen])

  useEffect(() => {
    if (isOpen && service && clients.length > 0 && professionals.length > 0) {     
      const newFormData = {
        clientId: String(service.clientId),
        professionalId: String(service.professionalId),
        category: service.category as Category | "",
        value: String(service.value),
        paymentMethod: service.paymentMethod as PaymentMethod | "",
        date: service.date,
        time: service.time,
        description: service.description || "",
      }
      
      setFormData(newFormData)
    }
  }, [service, clients, professionals, isOpen])

  type ClientSearchProps = {
    clients: Client[]
    value: string
    onChange: (id: string, display: string) => void
    placeholder?: string
    required?: boolean
  }

  function ClientSearch({ clients, value, onChange, placeholder, required }: ClientSearchProps) {
    const [query, setQuery] = useState("")
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement | null>(null)
    const [highlightedIndex, setHighlightedIndex] = useState<number>(-1)

    useEffect(() => {
      const selected = clients.find((c) => String(c.id) === String(value))
      if (selected) setQuery(`${selected.name}${selected.phone ? ` (${selected.phone})` : ''}`)
      else setQuery("")
    }, [value, clients])

    useEffect(() => {
      function onDoc(e: MouseEvent) {
        if (!ref.current) return
        if (!ref.current.contains(e.target as Node)) setOpen(false)
      }
      document.addEventListener('click', onDoc)
      return () => document.removeEventListener('click', onDoc)
    }, [])

    const filtered = query.length >= 2
      ? clients.filter((c) => `${c.name} ${c.phone ?? ''}`.toLowerCase().includes(query.toLowerCase()))
      : []

    useEffect(() => {
      if (open && filtered.length > 0) setHighlightedIndex(0)
      else setHighlightedIndex(-1)
    }, [open, filtered.length])

    useEffect(() => {
      if (highlightedIndex >= 0 && highlightedIndex < filtered.length) {
        const id = `client-item-${filtered[highlightedIndex].id}`
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ block: 'nearest' })
      }
    }, [highlightedIndex, filtered])

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setOpen(true)
        setHighlightedIndex((prev) => {
          if (filtered.length === 0) return -1
          if (prev < 0) return 0
          return Math.min(filtered.length - 1, prev + 1)
        })
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setOpen(true)
        setHighlightedIndex((prev) => {
          if (filtered.length === 0) return -1
          if (prev <= 0) return 0
          return Math.max(0, prev - 1)
        })
      } else if (e.key === 'Enter') {
        if (open && highlightedIndex >= 0 && filtered[highlightedIndex]) {
          const c = filtered[highlightedIndex]
          onChange(String(c.id), `${c.name}${c.phone ? ` (${c.phone})` : ''}`)
          setOpen(false)
        }
      } else if (e.key === 'Escape') {
        setOpen(false)
      }
    }

    return (
      <div className="relative" ref={ref}>
        <input
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls="client-list"
          aria-activedescendant={highlightedIndex >= 0 && filtered[highlightedIndex] ? `client-item-${filtered[highlightedIndex].id}` : undefined}
          className="w-full rounded-md border px-3 py-2 text-sm"
          placeholder={placeholder}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          required={required}
        />

        {open && (
          <div id="client-list" className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-md border bg-popover shadow-md">
            {filtered.length === 0 ? (
              <div className="p-2 text-sm text-muted-foreground">{query.length < 2 ? "Digite para buscar" : "Nenhum cliente encontrado"}</div>
            ) : (
              filtered.map((c, index) => (
                <button
                  type="button"
                  id={`client-item-${c.id}`}
                  key={c.id}
                  className={`w-full text-left px-3 py-2 hover:bg-accent/80 ${highlightedIndex === index ? 'bg-accent/80' : ''}`}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onClick={() => {
                    onChange(String(c.id), `${c.name}${c.phone ? ` (${c.phone})` : ''}`)
                    setOpen(false)
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{c.name}</span>
                    {c.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{c.phone}</span>
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    )
  }



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: { clientId?: string; professionalId?: string; category?: string; paymentMethod?: string; value?: string } = {}
    if (!formData.clientId) newErrors.clientId = 'Selecione um cliente'
    if (!formData.professionalId) newErrors.professionalId = 'Selecione o profissional'
    if (!formData.category) newErrors.category = 'Selecione a categoria'
    if (!formData.paymentMethod) newErrors.paymentMethod = 'Selecione o método de pagamento'

    const numericValue = Number.parseFloat(String(formData.value))
    if (Number.isNaN(numericValue) || numericValue < 1) {
      newErrors.value = 'O valor deve ser no mínimo R$ 1,00'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      const client = clients.find((c) => String(c.id) === String(formData.clientId))
      const professional = professionals.find((p) => String(p.id) === String(formData.professionalId))

      const data = {
        ...formData,
        clientName: client?.name || "",
        professionalName: professional?.name || "",
        category: formData.category as Category,
        value: Number.parseFloat(String(formData.value)),
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
              <ClientSearch
                clients={clients}
                value={formData.clientId}
                onChange={(id) => {
                  setFormData({ ...formData, clientId: id })
                  setErrors((prev) => ({ ...prev, clientId: undefined }))
                }}
                placeholder="Selecione o cliente"
                required
              />
              {errors.clientId && <p className="text-xs text-[var(--destructive)] mt-1">{errors.clientId}</p>}
            </div>

            <div>
              <Label htmlFor="professionalId" className="mb-2">Profissional *</Label>
              <Select
                value={formData.professionalId}
                onValueChange={(value) => {
                  setFormData({ ...formData, professionalId: value })
                  setErrors((prev) => ({ ...prev, professionalId: undefined }))
                }}
                required
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
              {errors.professionalId && <p className="text-xs text-[var(--destructive)] mt-1">{errors.professionalId}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category" className="mb-2">Categoria *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => {
                  setFormData({ ...formData, category: value as Category })
                  setErrors((prev) => ({ ...prev, category: undefined }))
                }}
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
              {errors.category && <p className="text-xs text-[var(--destructive)] mt-1">{errors.category}</p>}
            </div>

            <div>
              <Label htmlFor="value" className="mb-2">Valor (R$) *</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                value={formData.value}
                onChange={(e) => {
                  setFormData({ ...formData, value: e.target.value })
                  setErrors((prev) => ({ ...prev, value: undefined }))
                }}
                placeholder="0,00"
                required
              />
              {errors.value && <p className="text-xs text-[var(--destructive)] mt-1">{errors.value}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="paymentMethod" className="mb-2">Método de Pagamento *</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value) => {
                  setFormData({ ...formData, paymentMethod: value as PaymentMethod })
                  setErrors((prev) => ({ ...prev, paymentMethod: undefined }))
                }}
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
              {errors.paymentMethod && <p className="text-xs text-[var(--destructive)] mt-1">{errors.paymentMethod}</p>}
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
            <Button type="button" className="bg-white hover:opacity-70" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-[var(--gold-accent)] to-[var(--gold-medium)] hover:opacity-70"
            >
              {service ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
