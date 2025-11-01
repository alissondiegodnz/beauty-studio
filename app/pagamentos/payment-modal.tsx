"use client"

import type React from "react"
import { useState, useEffect, useRef, useMemo } from "react"
import { X, Phone, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

import { paymentsApi, clientsApi, professionalsApi, servicesApi, packagesApi } from "@/lib/api" 
import type { Payment, Client, Professional, Category, PaymentMethod, ServiceType, Package, ServiceLine, Service } from "@/lib/types"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  payment: Payment | null 
}

export function PaymentModal({ isOpen, onClose, onSave, payment }: PaymentModalProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [availableServices, setAvailableServices] = useState<Service[]>([])
  const [availablePackages, setAvailablePackages] = useState<Package[]>([])
  const [selectedServiceId, setSelectedServiceId] = useState<string>("")
  const [errors, setErrors] = useState<{ clientId?: string; paymentMethod?: string; totalValue?: string }>({})
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  
  const getInitialFormData = () => ({
    clientId: "",
    paymentMethod: "" as PaymentMethod,
    value: 0,
    isPartialValue: false,
    date: new Date().toISOString().substring(0, 10),
    time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false }),
    description: "",
    serviceType: "" as ServiceType,
    packageId: "",
    packageName: "",
    serviceLines: [] as ServiceLine[]
  })

  const [formData, setFormData] = useState(getInitialFormData)

  const loadInitialData = async () => {
    try {
      const [clientsRes, professionalsRes, servicesRes, packagesRes] = await Promise.all([
        clientsApi.getAll(),
        professionalsApi.getAll(),
        servicesApi.getAll(),
        packagesApi.getAll()
      ])
      
      setClients(clientsRes.data)
      setProfessionals(professionalsRes.data)
      setAvailableServices(servicesRes.data)
      setAvailablePackages(packagesRes.data)
      
    } catch (error) {
      console.error("Erro ao carregar dados iniciais:", error)
    }
  }

  useEffect(() => {    
    if (!isOpen) {
      setFormData(getInitialFormData())
      return
    }

    if (payment) setIsInitialLoad(true)
    loadInitialData().then(() => {
      if (payment) {
        setFormData(
          {
            clientId: payment.clientId,
            paymentMethod: payment.paymentMethod as PaymentMethod,
            value: payment.value,
            isPartialValue: payment.isPartialValue,
            date: payment.date,
            time: payment.time,
            description: payment.description || "",
            serviceType: payment.serviceType as ServiceType,
            packageId: payment.packageId || "",
            packageName: payment.packageName || "",
            serviceLines: payment.serviceLines || []
          })
      } else {
        setFormData(getInitialFormData())
        setIsInitialLoad(false)
      }
    })
  }, [isOpen])

  useEffect(() => {
  if (isOpen && isInitialLoad && formData.clientId) {
    setIsInitialLoad(false)
  }
}, [formData])


  useEffect(() => {
    if (isInitialLoad) return

    if (formData.serviceType === 'Pacote' && formData.packageId) {
      const selectedPackage = availablePackages.find(p => p.id === formData.packageId)
      if (selectedPackage) {
        const newLines: ServiceLine[] = selectedPackage.services.map(s => ({
          id: crypto.randomUUID(),
          serviceId: s.id,
          serviceName: s.name,
          serviceCategory: s.category,
          value: s.price ?? 0,
          professionalId: "",
          professionalName: "",
          isPackageService: true,
        }))
        setFormData(prev => ({ ...prev, serviceLines: newLines }))
      }
    }
  }, [formData.serviceType, formData.packageId, availablePackages])

  useEffect(() => {
    if (isInitialLoad) return

    if (formData.serviceType && formData.serviceLines.length > 0 && formData.packageId === "") {
        setFormData(prev => ({ ...prev, serviceLines: [] }))
    }
  }, [formData.serviceType])

  // --- Funções da Grid de Serviços ---
  const handleAddServiceLine = (serviceIdToAdd: string) => {
    const service = availableServices.find(s => s.id === serviceIdToAdd)
    if (service) {
      const newLine: ServiceLine = {
        id: crypto.randomUUID(),
        serviceId: service.id,
        serviceName: service.name,
        serviceCategory: service.category,
        value: service.price || 0,
        professionalId: "",
        professionalName: "",
        isPackageService: false,
      }
      setFormData(prev => ({ 
        ...prev, 
        serviceLines: [...prev.serviceLines, newLine] 
      }))
    }
  }

  const handleUpdateServiceLine = (lineId: string, field: keyof ServiceLine, value: string) => {
    setFormData(prev => ({
      ...prev,
      serviceLines: prev.serviceLines.map(line => 
        line.id === lineId ? { ...line, [field]: value } : line
      )
    }))
  }

  const handleRemoveServiceLine = (lineId: string) => {
    setFormData(prev => ({
      ...prev,
      serviceLines: prev.serviceLines.filter(line => line.id !== lineId)
    }))
  }
  
  const totalValue = useMemo(() => {
    return formData.serviceLines.reduce((sum, line) => {
      const value = typeof line.value === "string" ? parseFloat(line.value) || 0 : line.value || 0  
      return sum + value
    }, 0).toFixed(2)
  }, [formData.serviceLines])


  // --- Componente de Busca de Cliente (Mantido do original) ---
  function ClientSearch({ clients, value, onChange, placeholder, required }: { clients: Client[], value: string, onChange: (id: string, display: string) => void, placeholder?: string, required?: boolean }) {
    // ... CÓDIGO ClientSearch (Mantido do original)
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
  // --- Fim do Componente de Busca de Cliente ---


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: { clientId?: string; paymentMethod?: string; totalValue?: string } = {}
    if (!formData.clientId) newErrors.clientId = 'Selecione um cliente'
    if (!formData.paymentMethod) newErrors.paymentMethod = 'Selecione o método de pagamento'
    
    // Validação da grid de serviços
    if (formData.serviceLines.length === 0) {
        newErrors.totalValue = 'É necessário adicionar pelo menos um serviço ou pacote.'
    } else if (formData.serviceLines.some(line => !line.professionalId)) {
        newErrors.totalValue = 'Todos os serviços devem ter um profissional selecionado.'
    } else if (parseFloat(totalValue) < 1) {
        newErrors.totalValue = 'O valor total deve ser no mínimo R$ 1,00.'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      const dataToSend = {
        ...formData,
        clientName: clients.find(c => String(c.id) === String(formData.clientId))?.name || "",
        clientPhone: clients.find(c => String(c.id) === String(formData.clientId))?.phone || ""
      }
      
      if (payment) {
        await paymentsApi.update(payment.id, dataToSend)
      } else {
        await paymentsApi.create(dataToSend)
      }

      onSave()
      onClose()
    } catch (error) {
      console.error("Erro ao salvar pagamento:", error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-[var(--color-border)] p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
            {payment ? "Editar Pagamento" : "Novo Pagamento Multi-Serviço"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* CAMPOS PRIMÁRIOS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Cliente */}
            <div className="lg:col-span-2">
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

            {/* Data e Hora */}
            <div className="col-span-1">
              <Label htmlFor="date" className="mb-2">Data *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div className="col-span-1">
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
          
          {/* SELEÇÃO TIPO DE SERVIÇO */}
          <div className="grid grid-cols-2 gap-4 border-t pt-4">
            
            {/* Tipo de Serviço (Pacote vs Serviços) */}
            <div>
              <Label htmlFor="serviceType" className="mb-2">Tipo de Item *</Label>
              <Select
                value={formData.serviceType}
                onValueChange={(value) => setFormData({ ...formData, serviceType: value as ServiceType, packageId: "" })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Serviços ou Pacote?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Serviços">Serviços Avulsos</SelectItem>
                  <SelectItem value="Pacote">Pacote</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* SELEÇÃO DE PACOTE (Aparece se 'Pacote' for selecionado) */}
            {formData.serviceType === 'Pacote' && (
              <div>
                <Label htmlFor="packageId" className="mb-2">Pacote *</Label>
                <Select
                  value={formData.packageId}
                  onValueChange={(value) => setFormData({ ...formData, packageId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o Pacote" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePackages.map((pkg) => (
                      <SelectItem key={pkg.id} value={pkg.id}>
                        {pkg.name} ({pkg.services.length} itens)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* SELEÇÃO DE SERVIÇO PARA ADICIONAR (Aparece se 'Serviços' for selecionado) */}
            {formData.serviceType === 'Serviços' && (
              <div className="flex items-end gap-2">
                <div className="flex-grow">
                    <Label htmlFor="addService" className="mb-2">Adicionar Serviço *</Label>
                    <Select 
                        value={selectedServiceId} 
                        onValueChange={setSelectedServiceId}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione um Serviço" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableServices.map((service) => (
                                <SelectItem key={service.id} value={service.id}>
                                    {service.name} (R$ {service.price ? service.price.toFixed(2) : '0.00'})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                
                {/* NOVO BOTÃO DE ADICIONAR */}
                <Button 
                    type="button" 
                    size="icon" 
                    onClick={() => handleAddServiceLine(selectedServiceId)}
                    disabled={!selectedServiceId}
                    className="h-10 w-10 shrink-0"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
            )}

          </div>

          {/* GRID DE SERVIÇOS (Aparece se houverem linhas) */}
          {formData.serviceLines.length > 0 && (
            <div className="border rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-2/5">Serviço</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-1/5">Valor (R$)</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-1/5">Profissional *</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-1/12"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formData.serviceLines.map((line) => (
                    <tr key={line.id} className={line.isPackageService ? "bg-amber-50/50" : ""}>
                      {/* Coluna 1: Serviço */}
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                        {line.serviceName}
                        {line.isPackageService && <span className="text-xs text-amber-600 ml-2">(Pacote)</span>}
                      </td>
                      
                      {/* Coluna 2: Valor */}
                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                        <Input
                          type="number"
                          step="1.00"
                          value={line.value}
                          onChange={(e) => handleUpdateServiceLine(line.id, 'value', e.target.value)}
                          className="w-full text-right h-8"
                        />
                      </td>
                      
                      {/* Coluna 3: Profissional */}
                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                        <Select
                          value={line.professionalId}
                          onValueChange={(value) => handleUpdateServiceLine(line.id, 'professionalId', value)}
                          required
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Selecionar" />
                          </SelectTrigger>
                          <SelectContent>
                            {professionals.map((professional) => (
                              <SelectItem key={professional.id} value={professional.id}>
                                {professional.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      
                      {/* Coluna 4: Remover */}
                      <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                        {!line.isPackageService && ( // Permite remover apenas serviços avulsos
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleRemoveServiceLine(line.id)}
                            className="h-8 w-8 text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                  
                  {/* LINHA DE TOTAL */}
                  <tr>
                    <td className="px-3 py-2 font-bold text-base" colSpan={1}>
                        Total
                    </td>
                    <td className="px-3 py-2 font-bold text-base text-right" colSpan={3}>
                        R$ {totalValue}
                    </td>
                  </tr>
                </tbody>
              </table>
              {errors.totalValue && <p className="text-xs text-[var(--destructive)] mt-2">{errors.totalValue}</p>}
            </div>
          )}

          {/* CAMPOS DE PAGAMENTO E DESCRIÇÃO */}
          <div className="grid grid-cols-2 gap-4 border-t pt-4">
            
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
          
          </div>
          
          <div>
            <Label htmlFor="description" className="mb-2">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Notas adicionais sobre o pagamento"
              rows={3}
            />
          </div>


          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" className="bg-white hover:opacity-70" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-[var(--gold-accent)] to-[var(--gold-medium)] hover:opacity-70"
            >
              {payment ? "Atualizar Pagamento" : "Salvar Pagamento"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}